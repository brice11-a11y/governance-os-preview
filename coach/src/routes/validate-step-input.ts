import { Hono } from 'hono'
import type Anthropic from '@anthropic-ai/sdk'
import { anthropic } from '../lib/anthropic.js'
import { parseTenant } from '../lib/tenant.js'
import {
  fallbackStepRelevance,
  CARTER_STEP_IDS,
  type CarterStepId,
} from '../fallback/step-relevance.js'
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
  'step-relevance-gate',
  `${PROMPT_VERSION}.md`,
)
const SYSTEM_PROMPT = readFileSync(PROMPT_PATH, 'utf-8')
const MODEL = 'claude-haiku-4-5-20251001'
const CRITERION_ID = 'step-relevance-gate'

// Steps where we forward the user's `hypothesisIdea` to the LLM as additional
// context. These four steps are answered relative to the idea.
const HYPOTHESIS_CONTEXT_STEPS = new Set<CarterStepId>([
  'evidence',
  'variant',
  'audience',
  'primary-metric',
])

const submitGateVerdictTool: Anthropic.Tool = {
  name: 'submit_gate_verdict',
  description:
    'Submit the relevance-gate verdict for the user input. You MUST call this tool exactly once.',
  input_schema: {
    type: 'object',
    properties: {
      passes: {
        type: 'boolean',
        description:
          'Whether the user is making a real attempt at the current step (bias to pass).',
      },
      confidence: {
        type: 'string',
        enum: ['high', 'medium', 'low'],
        description: 'Confidence in the verdict.',
      },
      reason: {
        type: 'string',
        description:
          'One-sentence reason shown to the user when !passes. Direct, terse, ≤14 words. Omit when passes is true.',
      },
      suggestion: {
        type: 'string',
        description: 'Optional 1-2 sentence redirect. Omit when passes is true.',
      },
    },
    required: ['passes', 'confidence'],
    additionalProperties: false,
  },
}

function isCarterStepId(s: unknown): s is CarterStepId {
  return typeof s === 'string' && (CARTER_STEP_IDS as ReadonlyArray<string>).includes(s)
}

function signalsRecordToArray(sig: Record<string, boolean>): string[] {
  return Object.entries(sig).filter(([, v]) => v).map(([k]) => k)
}

export const validateStepInput = new Hono()

validateStepInput.post('/', async (c) => {
  const body = (await c.req.json().catch(() => null)) as
    | { stepId?: unknown; answer?: unknown; hypothesisIdea?: unknown }
    | null

  if (!body || typeof body.answer !== 'string' || body.answer.trim() === '') {
    return c.json({ error: 'missing or empty answer' }, 400)
  }
  if (!isCarterStepId(body.stepId)) {
    return c.json({ error: 'invalid or missing stepId' }, 400)
  }
  const tenant = parseTenant(c.req.header('X-Tenant'))
  if (!tenant) {
    return c.json({ error: 'invalid or missing X-Tenant header (LX/LH/OS/SN)' }, 400)
  }

  const stepId: CarterStepId = body.stepId
  const answer: string = body.answer
  const hypothesisIdea: string | undefined =
    typeof body.hypothesisIdea === 'string' && body.hypothesisIdea.trim() !== ''
      ? body.hypothesisIdea
      : undefined

  // ── Env kill-switch ───────────────────────────────────────────────────────
  // When COACH_GATE_ENABLED is exactly 'false', short-circuit with a pass.
  // Skips LLM + fallback. Frontend behaves like the gate doesn't exist.
  if (process.env.COACH_GATE_ENABLED === 'false') {
    return c.json({
      passes: true,
      confidence: 'high',
      reason: 'gate disabled',
      model: MODEL,
      latency_ms: 0,
      fallback_used: false,
      audit_id: 'gate-disabled',
    })
  }

  const startedAt = Date.now()
  const fallbackResult = fallbackStepRelevance(stepId, answer, hypothesisIdea)

  // Build the user message. Only include the idea anchor for the 4 steps that
  // are answered relative to the user's idea.
  const includeHypothesisIdea =
    HYPOTHESIS_CONTEXT_STEPS.has(stepId) && hypothesisIdea !== undefined
  const userMessageLines = [
    `Step: ${stepId}`,
    ...(includeHypothesisIdea ? [`User's idea (for context): ${hypothesisIdea}`] : []),
    ``,
    `User's answer at this step:`,
    answer,
  ]

  let response: Anthropic.Message
  try {
    response = await anthropic().messages.create({
      model: MODEL,
      max_tokens: 512,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      tools: [submitGateVerdictTool],
      tool_choice: { type: 'tool', name: 'submit_gate_verdict' },
      messages: [
        {
          role: 'user',
          content: userMessageLines.join('\n'),
        },
      ],
    })
  } catch (err) {
    console.error('[coach] anthropic api error (step-relevance):', err)
    return c.json({ error: 'llm call failed', detail: String(err) }, 502)
  }

  const latencyMs = Date.now() - startedAt
  const toolUse = response.content.find((b) => b.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') {
    return c.json({ error: 'llm did not return tool_use' }, 502)
  }

  const llm = toolUse.input as {
    passes: boolean
    confidence: 'high' | 'medium' | 'low'
    reason?: string
    suggestion?: string
  }

  // ── Divergence rule (INVERTED from validate-idea) ────────────────────────
  // Bias permissive. False-blocks hurt UX more than false-accepts here.
  //   rules-pass  + llm-pass   → pass
  //   rules-fail  + llm-fail   → fail
  //   disagree    + llm.high   → trust LLM (in either direction)
  //   disagree    + llm.medium → pass (permissive)
  //   disagree    + llm.low    → pass (permissive)
  const agree = fallbackResult.passes === llm.passes
  let finalPasses: boolean
  let lowConfidence: boolean
  let fallbackUsed: boolean

  if (agree) {
    finalPasses = llm.passes
    lowConfidence = false
    fallbackUsed = false
  } else if (llm.confidence === 'high') {
    // Trust LLM on high-confidence disagreement.
    finalPasses = llm.passes
    lowConfidence = false
    fallbackUsed = false
  } else {
    // Low/medium-confidence disagreement → bias permissive (pass).
    finalPasses = true
    lowConfidence = true
    fallbackUsed = true
  }

  const llmScore = llm.passes ? 1 : 0
  const fallbackScore = fallbackResult.passes ? 1 : 0
  const finalScore = finalPasses ? 1 : 0

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
    final_score: finalScore,
    low_confidence: lowConfidence,
    fallback_path: fallbackUsed ? 'fallback' : 'llm',
    llm_reasoning: llm.suggestion ?? llm.reason ?? '',
    llm_source_evidence: 'n/a',
    fallback_signals: signalsRecordToArray(fallbackResult.signals),
    created_at: new Date().toISOString(),
  })

  // Reason shown to the user when blocked. Prefer LLM reason; fall back to
  // the fallback's terse reason if we got here via the fallback path.
  const reason = !finalPasses
    ? (llm.reason ?? fallbackResult.reason ?? 'I need a more concrete answer for that step.')
    : undefined

  return c.json({
    passes: finalPasses,
    confidence: llm.confidence,
    reason,
    suggestion: llm.suggestion,
    model: MODEL,
    latency_ms: latencyMs,
    fallback_used: fallbackUsed,
    audit_id,
  })
})
