import { describe, it, expect } from 'vitest'
import { deriveLineage, evaluateMetric, computeAlignmentScore } from '@/lib/strategic-alignment/logic'

describe('deriveLineage', () => {
  it('resolves the full ladder from a single theme', () => {
    const l = deriveLineage('T1') // Booking (ISB), OKR-ISB-2 → CG1
    expect(l.valueStream?.id).toBe('ISB')
    expect(l.art?.id).toBe('booking')
    expect(l.okr?.id).toBe('OKR-ISB-2')
    expect(l.companyGoal?.id).toBe('CG1')
    expect(l.complete).toBe(true)
  })
  it('is incomplete with no theme', () => {
    const l = deriveLineage(undefined)
    expect(l.complete).toBe(false)
    expect(l.valueStream).toBeUndefined()
  })
})

describe('evaluateMetric', () => {
  it('aligns when the primary metric is the VS North Star', () => {
    const m = evaluateMetric('Booking Conversion Rate', 'ISB')
    expect(m.isAligned).toBe(true)
    expect(m.inCatalog).toBe(true)
  })
  it('is in-catalog but not aligned for a KPI that is not this VS North Star', () => {
    const m = evaluateMetric('Average Order Value', 'ISB')
    expect(m.isAligned).toBe(false)
    expect(m.inCatalog).toBe(true)
  })
  it('is neither for a proximate metric', () => {
    const m = evaluateMetric('Payment-CTA click rate', 'ISB')
    expect(m.isAligned).toBe(false)
    expect(m.inCatalog).toBe(false)
  })
})

describe('computeAlignmentScore', () => {
  it('awards the full 20 and does not flag when everything aligns', () => {
    const s = computeAlignmentScore({
      lineageComplete: true,
      metric: { northStar: 'x', isAligned: true, inCatalog: true },
      duplicateAcknowledged: true,
    })
    expect(s.total).toBe(20)
    expect(s.max).toBe(20)
    expect(s.flagged).toBe(false)
  })
  it('flags below 12 when signals are missing', () => {
    const s = computeAlignmentScore({
      lineageComplete: false,
      metric: { northStar: null, isAligned: false, inCatalog: false },
      duplicateAcknowledged: false,
    })
    expect(s.total).toBe(0)
    expect(s.flagged).toBe(true)
  })
  it('gives partial KPI credit (4) for an in-catalog but non-aligned metric', () => {
    const s = computeAlignmentScore({
      lineageComplete: true,
      metric: { northStar: 'x', isAligned: false, inCatalog: true },
      duplicateAcknowledged: false,
    })
    expect(s.kpi).toBe(4)
    expect(s.total).toBe(12)
    expect(s.flagged).toBe(false)
  })
})
