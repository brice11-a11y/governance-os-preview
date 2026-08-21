import type { BlueprintState } from '@/lib/ai/coach'
import type { ExperimentSummary } from '@/lib/experiments/types'

export type Band = 'green' | 'yellow' | 'orange' | 'red'

export interface GoLiveScore {
  hypothesis: number
  measurement: number
  alignment: number
  collision: number
  readiness: number
  total: number
  band: Band
  floors: { hypothesis: boolean; alignment: boolean; readiness: boolean }
  requiredComplete: boolean
  gatePassed: boolean
  blocking: string[]
}

const has = (s?: string) => !!s && s.trim().length > 0
const hasDigit = (s?: string) => !!s && /\d/.test(s)

export function computeGoLiveScore(blueprint: BlueprintState, summary: ExperimentSummary): GoLiveScore {
  const h = blueprint.hypothesis ?? {}

  const hypothesis =
    (blueprint.sourceQuality === 'strong' ? 5 : blueprint.sourceQuality === 'weak' ? 3 : 0) +
    (has(h.specificElement) ? (h.specificElement!.length > 15 ? 5 : 3) : 0) +
    (hasDigit(h.specificPercentage) ? 5 : 0) +
    (has(blueprint.primaryMetric) ? 3 : 0) +
    (has(blueprint.targetSurface) ? 3 : 0) +
    (blueprint.sourceQuality && blueprint.sourceQuality !== 'missing' ? 4 : 0)

  const measurement =
    (has(blueprint.primaryMetric) ? 5 : 0) +
    (has(blueprint.guardrailMetrics) ? 5 : 0) +
    (hasDigit(h.specificPercentage) ? 5 : 0) +
    (has(blueprint.methodology) ? 5 : 0)

  const alignment = summary.alignmentScore != null ? Math.min(25, Math.round(summary.alignmentScore * 1.25)) : 0

  const collision = !summary.collision?.detected ? 10 : summary.collision.acknowledged ? 6 : 4

  const qaCount = [summary.qa.rendersAcrossDevices, summary.qa.trackingFires, summary.qa.exposureRulesConfirmed].filter(Boolean).length
  const readiness =
    (summary.decisionProtocolCaptured ? 8 : 0) +
    (qaCount === 3 ? 6 : qaCount > 0 ? 3 : 0) +
    ((has(summary.campaignName) ? 2 : 0) + (has(summary.startDate) ? 2 : 0) + (has(summary.endDate) ? 2 : 0))

  const total = hypothesis + measurement + alignment + collision + readiness
  const band: Band = total >= 85 ? 'green' : total >= 70 ? 'yellow' : total >= 50 ? 'orange' : 'red'

  const floors = { hypothesis: hypothesis >= 15, alignment: alignment >= 17.5, readiness: readiness >= 14 }

  const allocationTotal = summary.allocation.reduce((sum, a) => sum + (a.trafficPct || 0), 0)
  const allocationOk = allocationTotal === 100

  const requiredComplete =
    has(summary.endDate) &&
    summary.qa.rendersAcrossDevices && summary.qa.trackingFires && summary.qa.exposureRulesConfirmed &&
    summary.decisionProtocolCaptured &&
    allocationOk &&
    (!summary.collision?.detected || summary.collision.acknowledged)

  const blocking: string[] = []
  if (total < 70) blocking.push('Overall score below 70')
  if (!floors.hypothesis) blocking.push('Hypothesis quality below floor (15/25)')
  if (!floors.alignment) blocking.push('Strategic alignment below floor (17.5/25)')
  if (!floors.readiness) blocking.push('Implementation readiness below floor (14/20)')
  if (!has(summary.endDate)) blocking.push('End date missing')
  if (!(summary.qa.rendersAcrossDevices && summary.qa.trackingFires && summary.qa.exposureRulesConfirmed)) blocking.push('QA checklist incomplete')
  if (!summary.decisionProtocolCaptured) blocking.push('Decision protocol not captured')
  if (summary.collision?.detected && !summary.collision.acknowledged) blocking.push('Collision not acknowledged')
  if (!allocationOk) blocking.push('Traffic allocation must total 100%')

  const gatePassed = total >= 70 && floors.hypothesis && floors.alignment && floors.readiness && requiredComplete

  return { hypothesis, measurement, alignment, collision, readiness, total, band, floors, requiredComplete, gatePassed, blocking }
}
