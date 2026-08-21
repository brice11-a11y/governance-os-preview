import { Hono } from 'hono'
import type Anthropic from '@anthropic-ai/sdk'
import { anthropic } from '../lib/anthropic.js'
import { parseTenant } from '../lib/tenant.js'
import { fallbackHypothesisSource } from '../fallback/hypothesis-dimension-1-source.js'
import { writeAudit } from '../audit/log.js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROMPT_VERSION = 'v2'
const PROMPT_PATH = join(
  __dirname,
  '..',
  'prompts',
  'hypothesis-dimension-1-source',
  `${PROMPT_VERSION}.md`,
)
const SYSTEM_PROMPT = readFileSync(PROMPT_PATH, 'utf-8')
const MODEL = 'claude-sonnet-4-6'
const CRITERION_ID = 'hypothesis-dimension-1-source'

const submitScoreTool: Anthropic.Tool = {
  name: 'submit_score',
  description:
    'Submit the Hypothesis Dimension 1 (Source) score (0-5) with reasoning. You MUST call this tool exactly once.',
  input_schema: {
    type: 'object',
    properties: {
      score: {
        type: 'integer',
        enum: [0, 1, 2, 3, 4, 5],
        description: 'Score on the 0-5 rubric defined in the system prompt.',
      },
      reasoning: {
        type: 'string',
        description: '1-2 sentences explaining the score, grounded in the rubric.',
      },
      source_evidence: {
        type: 'string',
        description:
          'Quote or paraphrase the source signal in the problem statement, or "none" if absent.',
      },
    },
    required: ['score', 'reasoning', 'source_evidence'],
    additionalProperties: false,
  },
}

export const scoreHypothesisSource = new Hono()

scoreHypothesisSource.post('/', async (c) => {
  const body = (await c.req.json().catch(() => null)) as
    | { user_problem_statement?: unknown }
    | null
  if (
    !body ||
    typeof body.user_problem_statement !== 'string' ||
    body.user_problem_statement.trim() === ''
  ) {
    return c.json({ error: 'missing or empty user_problem_statement' }, 400)
  }
  const tenant = parseTenant(c.req.header('X-Tenant'))
  if (!tenant) {
    return c.json({ error: 'invalid or missing X-Tenant header (LX/LH/OS/SN)' }, 400)
  }

  const userProblemStatement = body.user_problem_statement
  const startedAt = Date.now()
  const fallbackResult = fallbackHypothesisSource(userProblemStatement)

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
      tools: [submitScoreTool],
      tool_choice: { type: 'tool', name: 'submit_score' },
      messages: [
        {
          role: 'user',
          content: `User problem statement to evaluate:\n\n${userProblemStatement}`,
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
    score: number
    reasoning: string
    source_evidence: string
  }
  const llmScore = llmInput.score

  const divergence = Math.abs(llmScore - fallbackResult.score)
  const lowConfidence = divergence > 1
  const finalScore = lowConfidence ? fallbackResult.score : llmScore

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
    fallback_score: fallbackResult.score,
    final_score: finalScore,
    low_confidence: lowConfidence,
    fallback_path: lowConfidence ? 'fallback' : 'llm',
    llm_reasoning: llmInput.reasoning,
    llm_source_evidence: llmInput.source_evidence,
    fallback_signals: fallbackResult.signals,
    created_at: new Date().toISOString(),
  })

  return c.json({
    score: finalScore,
    llm_score: llmScore,
    fallback_score: fallbackResult.score,
    low_confidence: lowConfidence,
    reasoning: llmInput.reasoning,
    source_evidence: llmInput.source_evidence,
    audit_id,
  })
})
