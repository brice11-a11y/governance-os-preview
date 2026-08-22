import { Hono } from 'hono'
import type Anthropic from '@anthropic-ai/sdk'
import { anthropic } from '../lib/anthropic.js'
import { parseTenant } from '../lib/tenant.js'
import { fallbackIdeaProductChange } from '../fallback/idea-product-change.js'
import { writeAudit } from '../audit/log.js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROMPT_VERSION = 'v1'
const PROMPT_PATH = join(
  __dirname,
  '..',
  'prompts',
  'idea-product-change',
  `${PROMPT_VERSION}.md`,
)
const SYSTEM_PROMPT = readFileSync(PROMPT_PATH, 'utf-8')
const MODEL = 'claude-sonnet-4-6'
const CRITERION_ID = 'idea-product-change'

const submitValidationTool: Anthropic.Tool = {
  name: 'submit_validation',
  description:
    'Submit the Carter idea-validation result. You MUST call this tool exactly once.',
  input_schema: {
    type: 'object',
    properties: {
      is_product_change: {
        type: 'boolean',
        description:
          'Whether the input describes a concrete product change that could be A/B tested.',
      },
      feedback: {
        type: 'string',
        description:
          'Affirmation + next-step preview if valid; helpful redirect with 1-2 examples if invalid. the author-tone: direct, no hedging.',
      },
      confidence: {
        type: 'string',
        enum: ['high', 'medium', 'low'],
        description: 'Confidence in the classification.',
      },
    },
    required: ['is_product_change', 'feedback', 'confidence'],
    additionalProperties: false,
  },
}

export const validateIdea = new Hono()

validateIdea.post('/', async (c) => {
  const body = (await c.req.json().catch(() => null)) as
    | { user_idea?: unknown }
    | null
  if (!body || typeof body.user_idea !== 'string' || body.user_idea.trim() === '') {
    return c.json({ error: 'missing or empty user_idea' }, 400)
  }
  const tenant = parseTenant(c.req.header('X-Tenant'))
  if (!tenant) {
    return c.json({ error: 'invalid or missing X-Tenant header (LX/LH/OS/SN)' }, 400)
  }

  const userIdea = body.user_idea
  const startedAt = Date.now()
  const fallbackResult = fallbackIdeaProductChange(userIdea)

  let response: Anthropic.Message
  try {
    response = await anthropic().messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      tools: [submitValidationTool],
      tool_choice: { type: 'tool', name: 'submit_validation' },
      messages: [
        {
          role: 'user',
          content: `User idea to evaluate:\n\n${userIdea}`,
        },
      ],
    })
  } catch (err) {
    console.error('[coach] anthropic api error:', err)
    return c.json({ error: 'llm call failed', detail: String(err) }, 502)
  }

  const latencyMs = Date.now() - startedAt
  const toolUse = response.content.find((b) => b.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') {
    return c.json({ error: 'llm did not return tool_use' }, 502)
  }

  const llmInput = toolUse.input as {
    is_product_change: boolean
    feedback: string
    confidence: 'high' | 'medium' | 'low'
  }

  const llmScore = llmInput.is_product_change ? 1 : 0
  const fallbackScore = fallbackResult.is_product_change ? 1 : 0
  const divergence = Math.abs(llmScore - fallbackScore)
  const lowConfidence = divergence > 0 && llmInput.confidence === 'low'
  // Trust the LLM by default; fall back only on low-confidence divergence
  const finalIsProductChange = lowConfidence
    ? fallbackResult.is_product_change
    : llmInput.is_product_change

  const audit_id = await writeAudit({
    event_type: 'coach_invocation',
    criterion_id: CRITERION_ID,
    prompt_version: PROMPT_VERSION,
    model: MODEL,
    tenant,
    input_tokens: response.usage.input_tokens,
    output_tokens: response.usage.output_tokens,
    cache_read_input_tokens: response.usage.cache_read_input_tokens ?? 0,
    cache_creation_input_tokens: response.usage.cache_creation_input_tokens ?? 0,
    latency_ms: latencyMs,
    llm_score: llmScore,
    fallback_score: fallbackScore,
    final_score: finalIsProductChange ? 1 : 0,
    low_confidence: lowConfidence,
    fallback_path: lowConfidence ? 'fallback' : 'llm',
    llm_reasoning: llmInput.feedback,
    llm_source_evidence: 'n/a',
    fallback_signals: fallbackResult.signals,
    created_at: new Date().toISOString(),
  })

  return c.json({
    is_product_change: finalIsProductChange,
    feedback: llmInput.feedback,
    confidence: llmInput.confidence,
    llm_is_product_change: llmInput.is_product_change,
    fallback_is_product_change: fallbackResult.is_product_change,
    low_confidence: lowConfidence,
    audit_id,
  })
})
