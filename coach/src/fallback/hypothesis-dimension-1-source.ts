export type FallbackResult = {
  score: number
  signals: string[]
}

const SOURCE_PATTERNS: { name: string; re: RegExp }[] = [
  { name: 'based_on', re: /\bbased on\b/i },
  { name: 'after_observing', re: /\bafter observ(ing|ation)\b/i },
  { name: 'after_analyzing', re: /\bafter analy(s|z)(ing|is)\b/i },
  { name: 'user_research', re: /\buser research\b/i },
  { name: 'support_tickets', re: /\bsupport tickets?\b/i },
  { name: 'customer_feedback', re: /\bcustomer (feedback|complaints?|reports?)\b/i },
  { name: 'data_shows', re: /\bdata shows?\b/i },
  { name: 'analytics', re: /\banalytics?\b/i },
  { name: 'interviews', re: /\binterviews?\b/i },
  { name: 'surveys', re: /\bsurvey(ed|s)?\b/i },
  { name: 'session_recordings', re: /\bsession recordings?\b/i },
  { name: 'heatmaps', re: /\bheat ?maps?\b/i },
  { name: 'ab_test', re: /\bA\/B tests?\b/i },
  { name: 'usability_test', re: /\busability tests?\b/i },
  { name: 'prototype_test', re: /\bprototype tests?\b/i },
  { name: 'funnel', re: /\bfunnel\b/i },
  { name: 'numeric_evidence', re: /\b\d{1,3}(?:[.,]\d+)?\s?%/ },
  { name: 'n_equals', re: /\bn\s?=\s?\d+/i },
  { name: 'ticket_count', re: /\b\d+\s+(support )?tickets?\b/i },
  // v2 — observation/measurement language (quantified competitor benchmarks count
  // when paired with numeric_evidence). "measured" without explicit observation
  // subject is excluded because "performance measured by X" is a metric-definition
  // idiom (calibrated against Brice's lh-bk corpus).
  { name: 'observed', re: /\bobserv(e|ed|ing)\b/i },
  { name: 'we_measured', re: /\b(we|the team|i|they)\s+measur(ed|ing)\b/i },
  { name: 'benchmarked', re: /\bbenchmark(ed|ing|s)?\b/i },
  { name: 'methodology_marker', re: /\b(session.?scrape|crawler|panel|case study|blog (?:post|reported|published))\b/i },
]

const OPINION_RED_FLAGS: RegExp[] = [
  /\bfeels (cluttered|messy|wrong|off|bad)\b/i,
  /\bleadership (says|wants|asked|requested)\b/i,
  /\bbest practices? suggest\b/i,
  /\bcompetitors? (do|have|offer)\b/i,
  /\bindustry standard\b/i,
  /\bwe think\b/i,
  /\bit could be better\b/i,
]

/**
 * Deterministic fallback for Hypothesis Dimension 1 — Source.
 *
 * Conservative scoring used when the LLM is unavailable, or compared against
 * the LLM to detect low-confidence divergences.
 *
 * Heuristic:
 *   - 2+ source signals → 4 (worst-case for "5"; LLM may upgrade)
 *   - 1 source signal   → 3
 *   - 0 source signals  → 0 (or 1 if opinion red flag with hint of direction)
 *
 * Tightened during calibration by the Rubric Analyst (`10`).
 */
export function fallbackHypothesisSource(text: string): FallbackResult {
  const signals = SOURCE_PATTERNS
    .filter(({ re }) => re.test(text))
    .map(({ name }) => name)

  if (signals.length >= 2) return { score: 4, signals }
  if (signals.length === 1) return { score: 3, signals }

  const hasOpinionFlag = OPINION_RED_FLAGS.some((re) => re.test(text))
  return { score: hasOpinionFlag ? 1 : 0, signals: [] }
}
