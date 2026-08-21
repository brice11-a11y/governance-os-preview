import { getArt, getTheme, getOkr, getValueStream, getCompanyGoal, kpisFor } from './data'
import type { Theme, Art, ValueStream, Okr, CompanyGoal } from './data'

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

/** The strategy ladder derived from a single choice: the quarterly theme (the bet). */
export interface Lineage {
  theme?: Theme
  art?: Art
  valueStream?: ValueStream
  okr?: Okr
  companyGoal?: CompanyGoal
  complete: boolean
}

/** From a chosen quarterly theme, resolve Theme → ART → Value Stream and Theme → OKR → Company Goal. */
export function deriveLineage(themeId?: string): Lineage {
  const theme = getTheme(themeId)
  const art = getArt(theme?.artId)
  const valueStream = getValueStream(art?.valueStreamId)
  const okr = getOkr(theme?.okrId)
  const companyGoal = getCompanyGoal(okr?.companyGoalId)
  return { theme, art, valueStream, okr, companyGoal, complete: !!(theme && okr && companyGoal) }
}

export interface MetricAlignment { northStar: string | null; isAligned: boolean; inCatalog: boolean }

export function evaluateMetric(primaryMetric: string | undefined, valueStreamId: string | undefined): MetricAlignment {
  const ns = getValueStream(valueStreamId)?.northStar ?? null
  const p = primaryMetric?.trim()
  if (!p) return { northStar: ns, isAligned: false, inCatalog: false }
  const np = norm(p)
  const isAligned = ns ? np.includes(norm(ns)) || norm(ns).includes(np) : false
  const inCatalog = kpisFor(valueStreamId).some((m) => np.includes(norm(m)) || norm(m).includes(np))
  return { northStar: ns, isAligned, inCatalog }
}

/**
 * Strategic Alignment Score for this page (metrics only — decision commitment is
 * scored on its own page). Out of 20: lineage 8, KPI 7, not-a-duplicate 5.
 */
export interface AlignmentInputs {
  lineageComplete: boolean
  metric: MetricAlignment
  duplicateAcknowledged: boolean
}
export interface AlignmentScore {
  theme: number
  kpi: number
  dup: number
  total: number
  max: number
  flagged: boolean
}

export function computeAlignmentScore(i: AlignmentInputs): AlignmentScore {
  const theme = i.lineageComplete ? 8 : 0
  const kpi = i.metric.isAligned ? 7 : i.metric.inCatalog ? 4 : 0
  const dup = i.duplicateAcknowledged ? 5 : 0
  const total = theme + kpi + dup
  return { theme, kpi, dup, total, max: 20, flagged: total < 12 }
}
