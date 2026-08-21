export type CarterStepId =
  | 'idea'
  | 'evidence'
  | 'variant'
  | 'audience'
  | 'primary-metric'
  | 'expected-lift'
  | 'guardrail'
  | 'methodology'

export const CARTER_STEP_IDS: ReadonlyArray<CarterStepId> = [
  'idea',
  'evidence',
  'variant',
  'audience',
  'primary-metric',
  'expected-lift',
  'guardrail',
  'methodology',
]

export type StepRelevanceFallback = {
  passes: boolean
  reason?: string
  signals: Record<string, boolean>
}

/**
 * Deterministic fallback for the step-relevance gate. Permissive by default.
 *
 * Hard-rejects ONLY:
 *  - empty after trim
 *  - ≤ 2 chars
 *  - single emoji (rough regex; pictographic + extended-pictographic)
 *  - single stopword from STOPWORDS (case-insensitive)
 *
 * Anything else passes. This is intentionally minimal — the LLM does the
 * nuanced per-step judgment; the fallback exists only to catch the obvious
 * trash inputs that should never reach the model.
 */
const STOPWORDS = new Set([
  'idk', 'ok', 'oui', 'non', 'yes', 'no', 'go', 'ciao', 'bye',
])

// Matches a single emoji-ish character (pictographic / extended pictographic /
// symbols). Conservative — only fires on length-1 inputs after trim.
const EMOJI_RE = /^\p{Extended_Pictographic}$/u

export function fallbackStepRelevance(
  _stepId: CarterStepId,
  answer: string,
  _hypothesisIdea?: string,
): StepRelevanceFallback {
  const trimmed = answer.trim()

  if (trimmed.length === 0) {
    return {
      passes: false,
      reason: 'empty',
      signals: { empty: true },
    }
  }

  if (trimmed.length <= 2) {
    return {
      passes: false,
      reason: 'too short',
      signals: { too_short: true },
    }
  }

  if (EMOJI_RE.test(trimmed)) {
    return {
      passes: false,
      reason: 'single emoji',
      signals: { single_emoji: true },
    }
  }

  const lower = trimmed.toLowerCase()
  // strip trailing punctuation for stopword check
  const stripped = lower.replace(/[.!?,;:]+$/, '')
  if (STOPWORDS.has(stripped)) {
    return {
      passes: false,
      reason: 'single stopword',
      signals: { single_stopword: true },
    }
  }

  return {
    passes: true,
    signals: {},
  }
}
