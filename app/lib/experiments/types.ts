import type { BlueprintState } from '@/lib/ai/coach'

export type ExperimentStatus = 'draft' | 'calculated' | 'finalized' | 'in-review'

export const STATUS_LABEL: Record<ExperimentStatus, string> = {
  draft: 'Draft',
  calculated: 'Power set',
  finalized: 'Finalized',
  'in-review': 'In review',
}

/** Inputs + derived outputs for the power calculation step. */
export interface PowerParams {
  baselineRate: number // baseline conversion of the primary metric, in %
  mde: number // minimum detectable effect
  mdeType: 'relative' | 'absolute' // relative % lift, or absolute percentage-points
  dailyTraffic: number // visitors/day entering the test across ALL variants
  variants: number // total arms including control (2 = A/B)
  significance: number // alpha (e.g. 0.05)
  power: number // 1 - beta (e.g. 0.8)
  tails: 1 | 2
  deadlineDays: number // effective deadline used for the feasibility verdict (1-60)
  // derived (recomputed server-side on save so display always matches)
  perVariantSample?: number
  totalSample?: number
  runtimeDays?: number
}

export interface AllocationArm {
  id: string
  name: string
  description: string
  imageUrl?: string
  trafficPct: number
}

export interface QaChecklist {
  rendersAcrossDevices: boolean
  trackingFires: boolean
  exposureRulesConfirmed: boolean
}

export interface CollisionInfo {
  detected: boolean
  withExperiment?: string
  surface?: string
  tenants?: string[]
  acknowledged: boolean
}

export interface ExperimentSummary {
  owner: string
  campaignName: string
  startDate?: string
  endDate?: string
  allocation: AllocationArm[]
  qa: QaChecklist
  collision?: CollisionInfo
  alignmentScore?: number // from the Strategic Alignment page (/20)
  valueStream?: string // VS name, persisted from the Strategic Alignment page
  art?: string         // ART name
  theme?: string       // quarterly theme name
  decisionProtocolCaptured: boolean
  decisionProtocol?: {
    validated: { decision: string; details: string }
    noDifference: { decision: string; details: string }
    notValidated: { decision: string; details: string }
  }
  goLive?: { score: number; band: string; submittedAt: string }
}

export interface Experiment {
  id: string // url-safe unique id (carrier between pages)
  draftId: string // human-facing id, e.g. EXP-2026-417
  name: string
  status: ExperimentStatus
  blueprint: BlueprintState
  power?: PowerParams
  summary?: ExperimentSummary
  owner: string
  createdAt: string
  updatedAt: string
}

/** What the coach hands off when it creates a draft. */
export interface CreateExperimentInput {
  draftId: string
  name: string
  blueprint: BlueprintState
  owner?: string
}

/** Partial update applied at the calculator / finalization steps. */
export interface UpdateExperimentInput {
  name?: string
  status?: ExperimentStatus
  blueprint?: BlueprintState
  power?: PowerParams
  summary?: Partial<ExperimentSummary>
}
