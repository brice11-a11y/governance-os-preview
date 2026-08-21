import { describe, it, expect } from 'vitest'
import { computeGoLiveScore } from '@/lib/summary/score'
import type { BlueprintState } from '@/lib/ai/coach'
import type { ExperimentSummary } from '@/lib/experiments/types'

const fullBlueprint: BlueprintState = {
  hypothesis: { specificElement: 'a trust badge above the payment CTA', specificPercentage: '+5%' },
  targetSurface: 'booking flow, LX',
  primaryMetric: 'Booking Conversion Rate',
  guardrailMetrics: 'refund rate, 2%',
  methodology: 'A/B',
  sourceQuality: 'strong',
}
const fullSummary: ExperimentSummary = {
  owner: 'J. Doe', campaignName: '[ISB] trust', startDate: '2026-06-10', endDate: '2026-07-12',
  allocation: [{ id: 'control', name: 'Control', description: 'c', trafficPct: 50 }, { id: 'variant-1', name: 'Variant A', description: 'v', trafficPct: 50 }], qa: { rendersAcrossDevices: true, trackingFires: true, exposureRulesConfirmed: true },
  alignmentScore: 20, decisionProtocolCaptured: true,
}
const emptySummary: ExperimentSummary = {
  owner: '', campaignName: '', allocation: [],
  qa: { rendersAcrossDevices: false, trackingFires: false, exposureRulesConfirmed: false },
  decisionProtocolCaptured: false,
}

describe('computeGoLiveScore', () => {
  it('scores a complete test at 100, green, gate open', () => {
    const s = computeGoLiveScore(fullBlueprint, fullSummary)
    expect(s.hypothesis).toBe(25)
    expect(s.measurement).toBe(20)
    expect(s.alignment).toBe(25)
    expect(s.collision).toBe(10)
    expect(s.readiness).toBe(20)
    expect(s.total).toBe(100)
    expect(s.band).toBe('green')
    expect(s.gatePassed).toBe(true)
    expect(s.blocking).toEqual([])
  })
  it('scores an empty test low, red, gate closed with blocking reasons', () => {
    const s = computeGoLiveScore({ hypothesis: {} }, emptySummary)
    expect(s.total).toBe(10)
    expect(s.band).toBe('red')
    expect(s.floors.hypothesis).toBe(false)
    expect(s.gatePassed).toBe(false)
    expect(s.blocking.length).toBeGreaterThan(0)
  })
  it('scales the alignment score /20 → /25', () => {
    const s = computeGoLiveScore(fullBlueprint, { ...fullSummary, alignmentScore: 12 })
    expect(s.alignment).toBe(15)
    expect(s.floors.alignment).toBe(false)
  })
  it('lowers collision when a collision is detected and unacknowledged', () => {
    const s = computeGoLiveScore(fullBlueprint, { ...fullSummary, collision: { detected: true, acknowledged: false } })
    expect(s.collision).toBe(4)
    expect(s.gatePassed).toBe(false)
  })
  it('blocks when traffic allocation does not total 100%', () => {
    const s = computeGoLiveScore(fullBlueprint, { ...fullSummary, allocation: [{ id: 'control', name: 'Control', description: 'c', trafficPct: 60 }] })
    expect(s.gatePassed).toBe(false)
    expect(s.blocking).toContain('Traffic allocation must total 100%')
  })
})
