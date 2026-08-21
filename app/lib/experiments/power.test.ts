import { describe, it, expect } from 'vitest'
import { parseDeadlineFromText, assessFeasibility, realismFlags, makeItFitSuggestions } from '@/lib/experiments/power'
import type { PowerParams } from '@/lib/experiments/types'
import type { PowerResult } from '@/lib/experiments/power'

describe('parseDeadlineFromText', () => {
  it('parses days', () => { expect(parseDeadlineFromText('30 days')).toBe(30) })
  it('parses weeks as ×7', () => { expect(parseDeadlineFromText('3 weeks')).toBe(21) })
  it('parses months as ×30 and clamps to 60', () => { expect(parseDeadlineFromText('2 months')).toBe(60) })
  it('clamps large values to 60', () => { expect(parseDeadlineFromText('100 days')).toBe(60) })
  it('returns null for non-durations', () => { expect(parseDeadlineFromText('by end of Q3')).toBeNull() })
  it('returns null for empty', () => { expect(parseDeadlineFromText('')).toBeNull(); expect(parseDeadlineFromText(undefined)).toBeNull() })
})

describe('assessFeasibility', () => {
  it('go when runtime within deadline', () => {
    expect(assessFeasibility(20, 28)).toEqual({ verdict: 'go', spareDays: 8 })
  })
  it('go at exactly the deadline', () => {
    expect(assessFeasibility(28, 28).verdict).toBe('go')
  })
  it('caution up to 1.5x the deadline', () => {
    expect(assessFeasibility(40, 28).verdict).toBe('caution') // 1.5*28 = 42
  })
  it('not-feasible beyond 1.5x', () => {
    expect(assessFeasibility(43, 28).verdict).toBe('red')
  })
})

const baseParams: PowerParams = {
  baselineRate: 12, mde: 5, mdeType: 'relative', dailyTraffic: 3000,
  variants: 2, significance: 0.1, power: 0.8, tails: 2, deadlineDays: 28,
}
const result = (runtimeDays: number): PowerResult => ({
  perVariantSample: 1000, totalSample: 2000, runtimeDays, p1: 0.12, p2: 0.126, absoluteLiftPp: 0.6,
})

describe('realismFlags', () => {
  it('flags runtime under 14 days', () => {
    const ids = realismFlags(baseParams, result(10)).map(f => f.id)
    expect(ids).toContain('runtime-short')
  })
  it('no runtime flag in the healthy band', () => {
    const ids = realismFlags(baseParams, result(30)).map(f => f.id)
    expect(ids).not.toContain('runtime-short')
    expect(ids).not.toContain('runtime-long')
  })
  it('flags runtime over 56 days', () => {
    expect(realismFlags(baseParams, result(60)).map(f => f.id)).toContain('runtime-long')
  })
  it('flags 3+ variants', () => {
    expect(realismFlags({ ...baseParams, variants: 3 }, result(30)).map(f => f.id)).toContain('variants-split')
  })
  it('does not flag locked MDE of 5', () => {
    const ids = realismFlags(baseParams, result(30)).map(f => f.id)
    expect(ids).not.toContain('mde-high')
    expect(ids).not.toContain('mde-low')
  })
  it('flags an ambitious MDE when editable later', () => {
    expect(realismFlags({ ...baseParams, mde: 12 }, result(30)).map(f => f.id)).toContain('mde-high')
  })
})

const fitResult = (runtimeDays: number, totalSample: number): PowerResult => ({
  perVariantSample: totalSample / 2, totalSample, runtimeDays, p1: 0.12, p2: 0.126, absoluteLiftPp: 0.6,
})

describe('makeItFitSuggestions', () => {
  it('always offers enlarge-targeting when over deadline', () => {
    const ids = makeItFitSuggestions(baseParams, fitResult(32, 94068), 28).map(s => s.id)
    expect(ids).toContain('enlarge')
  })
  it('offers push-deadline when required runtime <= 40', () => {
    const ids = makeItFitSuggestions(baseParams, fitResult(32, 94068), 28).map(s => s.id)
    expect(ids).toContain('deadline')
  })
  it('suppresses push-deadline when required runtime > 40', () => {
    const ids = makeItFitSuggestions(baseParams, fitResult(50, 150000), 28).map(s => s.id)
    expect(ids).not.toContain('deadline')
    expect(ids).toContain('enlarge')
  })
})
