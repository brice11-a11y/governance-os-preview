import type { PowerParams } from './types'

/** Statistical values standardized across all V1 tests (not user-editable). */
export const GOVERNANCE = {
  MDE: 5,
  MDE_TYPE: 'relative' as const,
  ALPHA: 0.1, // 90% confidence
  POWER: 0.8, // 80% power
  TAILS: 2 as const,
  DEADLINE_MIN: 1,
  DEADLINE_MAX: 60,
  DEADLINE_DEFAULT: 42, // 6-week guideline when the Coach captured none
  SUGGEST_DEADLINE_MAX: 40, // never recommend pushing a deadline beyond this
  CAUTION_MULTIPLIER: 1.5, // days <= deadline*this -> caution, else not-feasible
} as const

/**
 * Inverse standard-normal CDF (quantile function) via Acklam's rational
 * approximation. Accurate to ~1e-9 over the open interval (0,1) — far more than
 * enough for sample-size math. Avoids pulling in a stats dependency.
 */
export function invNorm(p: number): number {
  if (p <= 0) return -Infinity
  if (p >= 1) return Infinity

  // Coefficients
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239]
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1]
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783]
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416]

  const plow = 0.02425
  const phigh = 1 - plow

  let q: number
  let r: number

  if (p < plow) {
    q = Math.sqrt(-2 * Math.log(p))
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
  }
  if (p <= phigh) {
    q = p - 0.5
    r = q * q
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
  }
  q = Math.sqrt(-2 * Math.log(1 - p))
  return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
}

export interface PowerResult {
  perVariantSample: number
  totalSample: number
  runtimeDays: number
  /** baseline + treatment conversion rates as decimals, for display/charts */
  p1: number
  p2: number
  absoluteLiftPp: number
}

/**
 * Two-proportion sample size. Returns per-variant n, total n across all arms,
 * and runtime in days given the daily traffic entering the whole test.
 *
 *   n = (z_alpha + z_beta)^2 * [p1(1-p1) + p2(1-p2)] / (p2 - p1)^2
 *
 * z_alpha uses alpha/2 for a two-tailed test, alpha for one-tailed.
 */
export function computePower(input: PowerParams): PowerResult | null {
  const { baselineRate, mde, mdeType, dailyTraffic, variants, significance, power, tails } = input

  const p1 = baselineRate / 100
  const p2 = mdeType === 'relative' ? p1 * (1 + mde / 100) : p1 + mde / 100

  // Guard against nonsensical inputs that would divide by zero / blow up.
  if (
    !isFinite(p1) || !isFinite(p2) ||
    p1 <= 0 || p1 >= 1 || p2 <= 0 || p2 >= 1 ||
    p2 === p1 || mde === 0 ||
    dailyTraffic <= 0 || variants < 2 ||
    significance <= 0 || significance >= 1 ||
    power <= 0 || power >= 1
  ) {
    return null
  }

  const zAlpha = invNorm(1 - significance / (tails === 2 ? 2 : 1))
  const zBeta = invNorm(power)

  const numerator = Math.pow(zAlpha + zBeta, 2) * (p1 * (1 - p1) + p2 * (1 - p2))
  const denominator = Math.pow(p2 - p1, 2)
  const perVariantSample = Math.ceil(numerator / denominator)
  const totalSample = perVariantSample * variants
  const runtimeDays = Math.ceil(totalSample / dailyTraffic)

  return {
    perVariantSample,
    totalSample,
    runtimeDays,
    p1,
    p2,
    absoluteLiftPp: (p2 - p1) * 100,
  }
}

export const DEFAULT_POWER: PowerParams = {
  baselineRate: 5,
  mde: GOVERNANCE.MDE,
  mdeType: GOVERNANCE.MDE_TYPE,
  dailyTraffic: 2000,
  variants: 2,
  significance: GOVERNANCE.ALPHA,
  power: GOVERNANCE.POWER,
  tails: GOVERNANCE.TAILS,
  deadlineDays: GOVERNANCE.DEADLINE_DEFAULT,
}

export type Verdict = 'go' | 'caution' | 'red'
export interface Feasibility { verdict: Verdict; spareDays: number }

export function assessFeasibility(runtimeDays: number, deadlineDays: number): Feasibility {
  const spareDays = deadlineDays - runtimeDays
  let verdict: Verdict
  if (runtimeDays <= deadlineDays) verdict = 'go'
  else if (runtimeDays <= deadlineDays * GOVERNANCE.CAUTION_MULTIPLIER) verdict = 'caution'
  else verdict = 'red'
  return { verdict, spareDays }
}

export interface RealismFlag { id: string; title: string; detail: string }

export function realismFlags(params: PowerParams, result: PowerResult): RealismFlag[] {
  const flags: RealismFlag[] = []
  // MDE sanity — dormant while MDE is locked at 5%, retained for future editable MDE.
  if (params.mde >= 10) {
    flags.push({ id: 'mde-high', title: `A ${params.mde}% lift is ambitious`, detail: 'Most product changes move a metric a few percent. If the true effect is smaller, this test would miss it.' })
  } else if (params.mde < 1) {
    flags.push({ id: 'mde-low', title: `A ${params.mde}% lift is very small`, detail: 'Detecting tiny effects needs enormous samples — runtime grows fast. Make sure an effect this small is worth shipping.' })
  }
  // Runtime sanity
  if (result.runtimeDays < 14) {
    flags.push({ id: 'runtime-short', title: 'Under two weeks is risky', detail: 'Short tests get skewed by novelty and day-of-week effects. Run at least one full business cycle (~14 days).' })
  } else if (result.runtimeDays > 56) {
    flags.push({ id: 'runtime-long', title: 'Runs longer than ~8 weeks', detail: 'Long tests drift with seasonality and cookie churn, muddying the result.' })
  }
  // Traffic & variants sanity
  if (params.variants >= 3) {
    flags.push({ id: 'variants-split', title: `Splitting traffic ${params.variants} ways`, detail: 'Each extra variant divides your traffic, so every arm needs more time to reach significance.' })
  }
  return flags
}

export interface FitSuggestion { id: 'enlarge' | 'deadline'; title: string; detail: string }

/** Computed fixes for an over-deadline test. Call only when the verdict is not 'go'. */
export function makeItFitSuggestions(params: PowerParams, result: PowerResult, deadlineDays: number): FitSuggestion[] {
  const items: FitSuggestion[] = []
  const needTraffic = Math.ceil(result.totalSample / deadlineDays)
  const addTraffic = needTraffic - params.dailyTraffic
  if (addTraffic > 0) {
    items.push({ id: 'enlarge', title: 'Enlarge the test targeting', detail: `Include more users (~${addTraffic.toLocaleString('en-US')}/day more, e.g. add a market) → ${deadlineDays} days` })
  }
  if (result.runtimeDays <= GOVERNANCE.SUGGEST_DEADLINE_MAX) {
    items.push({ id: 'deadline', title: `Push the deadline to ${result.runtimeDays} days`, detail: 'Accept the full runtime to fit comfortably.' })
  }
  return items
}

/** Extract a day count (1–60) from explicit durations only: days, weeks (×7), months (×30). */
export function parseDeadlineFromText(text?: string): number | null {
  if (!text) return null
  const m = text.match(/(\d+(?:\.\d+)?)\s*(days?|weeks?|months?|d|w|wks?|mo)\b/i)
  if (!m) return null
  const value = parseFloat(m[1])
  if (!isFinite(value) || value <= 0) return null
  const unit = m[2].toLowerCase()
  const days = unit.startsWith('d') ? value : unit.startsWith('w') ? value * 7 : value * 30
  return Math.min(GOVERNANCE.DEADLINE_MAX, Math.max(GOVERNANCE.DEADLINE_MIN, Math.round(days)))
}

/** Pull a usable MDE out of a free-text expected-lift like "+3%" or "2pp". */
export function parseMdeFromText(text?: string): { mde: number; mdeType: 'relative' | 'absolute' } | null {
  if (!text) return null
  const m = text.match(/([+-]?\s*\d+(?:\.\d+)?)\s*(pp|p\.p\.|percentage point|basis point|bps|%)?/i)
  if (!m) return null
  const value = Math.abs(parseFloat(m[1].replace(/\s+/g, '')))
  if (!isFinite(value) || value === 0) return null
  const unit = (m[2] || '%').toLowerCase()
  const isAbsolute = unit.startsWith('pp') || unit.startsWith('p.p') || unit.includes('percentage point') || unit.includes('basis') || unit === 'bps'
  return { mde: value, mdeType: isAbsolute ? 'absolute' : 'relative' }
}
