import type { CarterStepId } from './coach'

const COACH_URL = process.env.NEXT_PUBLIC_COACH_URL ?? 'http://localhost:8787'

export interface HypothesisSourceGrade {
  score: number
  llm_score: number
  fallback_score: number
  low_confidence: boolean
  reasoning: string
  source_evidence: string
  audit_id: string
}

export async function gradeHypothesisSource(
  userProblemStatement: string,
  tenant: 'LH' | 'LX' | 'OS' | 'SN' = 'LH',
): Promise<HypothesisSourceGrade> {
  const r = await fetch(`${COACH_URL}/v1/coach/score/hypothesis-source`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Tenant': tenant },
    body: JSON.stringify({ user_problem_statement: userProblemStatement }),
  })
  if (!r.ok) {
    const text = await r.text().catch(() => '')
    throw new Error(`coach service ${r.status}: ${text}`)
  }
  return r.json()
}

export function scoreToQuality(score: number): 'strong' | 'weak' | 'missing' {
  if (score >= 4) return 'strong'
  if (score >= 2) return 'weak'
  return 'missing'
}

export interface IdeaValidation {
  is_product_change: boolean
  feedback: string
  confidence: 'high' | 'medium' | 'low'
  llm_is_product_change: boolean
  fallback_is_product_change: boolean
  low_confidence: boolean
  audit_id: string
}

export async function validateIdea(
  userIdea: string,
  tenant: 'LH' | 'LX' | 'OS' | 'SN' = 'LH',
): Promise<IdeaValidation> {
  const r = await fetch(`${COACH_URL}/v1/coach/validate/idea`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Tenant': tenant },
    body: JSON.stringify({ user_idea: userIdea }),
  })
  if (!r.ok) {
    const text = await r.text().catch(() => '')
    throw new Error(`coach service ${r.status}: ${text}`)
  }
  return r.json()
}

export interface GateVerdict {
  passes: boolean
  confidence: 'high' | 'medium' | 'low'
  reason?: string
  suggestion?: string
  fallback_used: boolean
  audit_id: string
}

/**
 * Layer-1 relevance gate: asks the Coach service whether the user's input at
 * `stepId` is a real attempt. Permissive by default. `hypothesisIdea` should
 * be passed only for steps that depend on the idea (evidence, variant,
 * audience, primary-metric) — the caller is responsible for omitting it
 * otherwise.
 */
export async function validateStepInput(
  stepId: CarterStepId,
  answer: string,
  hypothesisIdea?: string,
  tenant: 'LH' | 'LX' | 'OS' | 'SN' = 'LH',
): Promise<GateVerdict> {
  const body: Record<string, unknown> = { stepId, answer }
  if (hypothesisIdea !== undefined) body.hypothesisIdea = hypothesisIdea

  const r = await fetch(`${COACH_URL}/v1/coach/validate/step-input`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Tenant': tenant },
    body: JSON.stringify(body),
  })
  if (!r.ok) {
    const text = await r.text().catch(() => '')
    throw new Error(`coach service ${r.status}: ${text}`)
  }
  return r.json()
}
