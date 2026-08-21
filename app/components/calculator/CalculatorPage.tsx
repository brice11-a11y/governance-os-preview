'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight, ArrowLeft, Loader2, Users, SlidersHorizontal, Lock, Flag,
  Clock, CheckCircle2, TriangleAlert, Calendar, UserPlus, ChevronRight,
  Lightbulb, Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AppShell } from '@/components/layout/AppShell'
import { getExperiment, updateExperiment } from '@/lib/experiments/client'
import {
  computePower, GOVERNANCE, assessFeasibility, realismFlags, makeItFitSuggestions,
  type Verdict,
} from '@/lib/experiments/power'
import type { Experiment, PowerParams } from '@/lib/experiments/types'

const fmt = (n: number) => n.toLocaleString('en-US')
const VERDICT_COLOR: Record<Verdict, string> = { go: '#1f7a4d', caution: '#9a7b1f', red: '#ba1a1a' }

function InfoTip({ text }: { text: string }) {
  return (
    <span className="relative inline-flex group">
      <span className="w-3.5 h-3.5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center cursor-help">i</span>
      <span className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity absolute left-0 top-[130%] z-30 w-56 bg-on-surface text-white text-[11px] font-normal normal-case tracking-normal leading-snug p-2.5 rounded-md shadow-lg">
        {text}
      </span>
    </span>
  )
}

function clampDeadline(n: number) {
  if (!isFinite(n)) return GOVERNANCE.DEADLINE_DEFAULT
  return Math.min(GOVERNANCE.DEADLINE_MAX, Math.max(GOVERNANCE.DEADLINE_MIN, Math.round(n)))
}

export function CalculatorPage({ id }: { id: string }) {
  const router = useRouter()
  const [experiment, setExperiment] = useState<Experiment | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [saving, setSaving] = useState(false)

  // Editable inputs
  const [baselineRate, setBaselineRate] = useState(12)
  const [dailyTraffic, setDailyTraffic] = useState(3000)
  const [variants, setVariants] = useState(2)
  const [deadlineDays, setDeadlineDays] = useState<number>(GOVERNANCE.DEADLINE_DEFAULT)

  useEffect(() => {
    let active = true
    getExperiment(id)
      .then((exp) => {
        if (!active) return
        setExperiment(exp)
        if (exp.power) {
          setBaselineRate(exp.power.baselineRate)
          setDailyTraffic(exp.power.dailyTraffic)
          setVariants(exp.power.variants)
          setDeadlineDays(clampDeadline(exp.power.deadlineDays))
        } else {
          setDeadlineDays(clampDeadline(exp.blueprint.targetDeadlineDays ?? GOVERNANCE.DEADLINE_DEFAULT))
        }
      })
      .catch(() => active && setNotFound(true))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [id])

  const params: PowerParams = useMemo(() => ({
    baselineRate,
    mde: GOVERNANCE.MDE,
    mdeType: GOVERNANCE.MDE_TYPE,
    dailyTraffic: Math.max(1, dailyTraffic || 0),
    variants,
    significance: GOVERNANCE.ALPHA,
    power: GOVERNANCE.POWER,
    tails: GOVERNANCE.TAILS,
    deadlineDays,
  }), [baselineRate, dailyTraffic, variants, deadlineDays])

  const result = useMemo(() => computePower(params), [params])
  const feasibility = useMemo(() => (result ? assessFeasibility(result.runtimeDays, deadlineDays) : null), [result, deadlineDays])
  const flags = useMemo(() => (result ? realismFlags(params, result) : []), [params, result])
  const fits = useMemo(
    () => (result && feasibility && feasibility.verdict !== 'go' ? makeItFitSuggestions(params, result, deadlineDays) : []),
    [params, result, feasibility, deadlineDays],
  )

  async function handleSaveContinue() {
    if (!result) return
    setSaving(true)
    try {
      await updateExperiment(id, { status: 'calculated', power: params })
      router.push(`/summary/${id}`)
    } catch (err) {
      console.error('[calculator] save failed:', err)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AppShell title="Power Calculator" flowStep={4}>
        <div className="flex items-center justify-center h-full text-on-surface-variant gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading experiment…</div>
      </AppShell>
    )
  }
  if (notFound || !experiment) {
    return (
      <AppShell title="Power Calculator" flowStep={4}>
        <div className="flex flex-col items-center justify-center h-full gap-3 text-on-surface-variant">
          <p>That experiment could not be found.</p>
          <Link href="/experiments"><Button size="sm" className="bg-primary text-white rounded">Back to experiments</Button></Link>
        </div>
      </AppShell>
    )
  }

  const color = feasibility ? VERDICT_COLOR[feasibility.verdict] : VERDICT_COLOR.caution
  const spare = feasibility?.spareDays ?? 0

  return (
    <AppShell
      title={experiment.name}
      subtitle={`${experiment.draftId} · Testing your idea's reach`}
      flowStep={4}
      actions={
        <Button size="sm" onClick={handleSaveContinue} disabled={!result || saving} className="bg-primary text-white hover:bg-primary/90 rounded gap-1.5">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          {saving ? 'Saving…' : 'Save & Continue'}
          {!saving && <ArrowRight className="w-3.5 h-3.5" />}
        </Button>
      }
    >
      <div className="max-w-[1180px] mx-auto px-8 py-8">
        <header className="mb-8">
          <h2 className="font-display font-extrabold text-3xl tracking-tight mb-1">Testing your idea&apos;s reach</h2>
          <p className="text-on-surface-variant text-[15px] max-w-2xl leading-relaxed">How long this test needs to run to give you a trustworthy answer — and whether that fits your timeline. Everything recalculates live.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT — inputs */}
          <section className="lg:col-span-5">
            <div className="bg-surface-container-lowest rounded border border-outline-variant/40 p-7 space-y-7">
              <h3 className="font-display font-bold text-sm flex items-center gap-2"><SlidersHorizontal className="w-4 h-4 text-primary" /> Your test settings</h3>

              {/* Baseline */}
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <label className="text-[10px] text-outline font-extrabold uppercase tracking-widest flex items-center gap-1.5">Baseline conversion rate <InfoTip text="How often this converts today, before any change. Example: 12 of every 100 visitors check out = 12%. Find it in your analytics." /></label>
                  <span className="bg-primary text-white text-[11px] px-2.5 py-1 rounded font-bold tabular-nums">{baselineRate.toFixed(1)}%</span>
                </div>
                <input className="power-slider" type="range" min={0.5} max={50} step={0.1} value={baselineRate} onChange={(e) => setBaselineRate(parseFloat(e.target.value))} />
                <div className="flex justify-between mt-1.5 text-[10px] text-outline font-bold"><span>0%</span><span>25%</span><span>50%</span></div>
              </div>

              {/* MDE — locked */}
              <div>
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-outline font-extrabold uppercase tracking-widest flex items-center gap-1.5">Smallest lift worth detecting <InfoTip text="The smallest improvement that would change your decision. Fixed at 5% in this version so every test is sized against the same standard." /></label>
                  <span className="bg-surface-container-high text-on-surface text-[11px] px-2.5 py-1 rounded font-bold flex items-center gap-1">5% rel <Lock className="w-3 h-3 text-outline" /></span>
                </div>
              </div>

              {/* Traffic */}
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <label className="text-[10px] text-outline font-extrabold uppercase tracking-widest flex items-center gap-1.5">Daily traffic into test <InfoTip text="Visitors per day entering the test across all variants. More traffic = faster results." /></label>
                  <span className="bg-primary text-white text-[11px] px-2.5 py-1 rounded font-bold tabular-nums">{fmt(Math.max(0, dailyTraffic || 0))}</span>
                </div>
                <div className="flex gap-2">
                  <Input type="number" min={1} value={Number.isFinite(dailyTraffic) ? dailyTraffic : ''} onChange={(e) => setDailyTraffic(parseFloat(e.target.value))} className="bg-white" />
                  <div className="bg-surface-container-high px-3 flex items-center rounded text-outline-variant"><Users className="w-4 h-4" /></div>
                </div>
              </div>

              {/* Deadline */}
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <label className="text-[10px] text-outline font-extrabold uppercase tracking-widest flex items-center gap-1.5">Target deadline <InfoTip text="When you need a result by. Pre-filled from the Coach. The verdict compares the time this test needs against this. Max 60 days." /></label>
                  <span className="bg-surface-container-high text-on-surface text-[11px] px-2.5 py-1 rounded font-bold">{experiment.blueprint.targetDeadlineDays ? 'from coach' : 'default'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input type="number" min={1} max={60} value={deadlineDays} onChange={(e) => setDeadlineDays(clampDeadline(parseFloat(e.target.value)))} className="bg-white" />
                  <span className="text-[11px] text-outline">days</span>
                </div>
              </div>

              {/* Variants / Confidence / Power */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-outline font-extrabold uppercase tracking-widest flex items-center gap-1 mb-2">Variants <InfoTip text="How many versions, including the original. 2 = a standard A/B test. More variants split traffic, so each needs more time." /></label>
                  <select value={variants} onChange={(e) => setVariants(parseInt(e.target.value))} className="w-full bg-white border border-outline-variant rounded px-2 py-2 text-sm">
                    <option value={2}>2 (A/B)</option><option value={3}>3</option><option value={4}>4</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-outline font-extrabold uppercase tracking-widest flex items-center gap-1 mb-2">Confidence <InfoTip text="How sure you want to be that a win is real, not luck. Fixed at 90%." /></label>
                  <div className="flex items-center justify-between w-full bg-surface-container-low px-3 py-2 rounded text-sm border border-outline-variant/20"><span className="text-on-surface-variant font-medium">90%</span><Lock className="w-3.5 h-3.5 text-outline" /></div>
                </div>
                <div>
                  <label className="text-[10px] text-outline font-extrabold uppercase tracking-widest flex items-center gap-1 mb-2">Power <InfoTip text="The chance of catching a real improvement if it exists. Fixed at 80%." /></label>
                  <div className="flex items-center justify-between w-full bg-surface-container-low px-3 py-2 rounded text-sm border border-outline-variant/20"><span className="text-on-surface-variant font-medium">80%</span><Lock className="w-3.5 h-3.5 text-outline" /></div>
                </div>
              </div>
            </div>

            <Link href="/coach" className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-on-surface mt-4"><ArrowLeft className="w-3.5 h-3.5" /> Back to the coach</Link>
          </section>

          {/* RIGHT — forecast */}
          <section className="lg:col-span-7 space-y-5">
            {result && feasibility ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Gauge */}
                  <div className="bg-surface-container-lowest rounded border border-outline-variant/40 p-7 flex flex-col items-center justify-center text-center">
                    <div className="relative w-36 h-36 flex items-center justify-center mb-4">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="72" cy="72" r="64" fill="none" stroke="#ecf4ff" strokeWidth="10" />
                        <circle cx="72" cy="72" r="64" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={402} strokeDashoffset={402 * (1 - Math.min(result.runtimeDays / Math.max(deadlineDays * 1.5, 1), 1))} />
                      </svg>
                      <div className="absolute flex flex-col items-center"><span className="font-display font-extrabold text-5xl tracking-tighter">{result.runtimeDays}</span><span className="text-[9px] text-outline font-black uppercase tracking-widest">days needed</span></div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border" style={{ color, background: `${color}1a`, borderColor: `${color}33` }}>
                      {feasibility.verdict === 'go' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      <span className="text-[10px] font-extrabold uppercase tracking-wider">{feasibility.verdict === 'go' ? `${spare} days to spare` : `${Math.abs(spare)} days over deadline`}</span>
                    </div>
                  </div>

                  {/* Verdict */}
                  <div className="bg-surface-container-lowest rounded border border-outline-variant/40 p-7 flex flex-col justify-between border-l-4" style={{ borderLeftColor: color }}>
                    <div>
                      <div className="w-10 h-10 rounded text-white flex items-center justify-center mb-4 shadow" style={{ background: color }}>
                        {feasibility.verdict === 'go' ? <CheckCircle2 className="w-5 h-5" /> : <TriangleAlert className="w-5 h-5" />}
                      </div>
                      <h4 className="font-display font-bold mb-2" style={{ color }}>
                        {feasibility.verdict === 'go' ? 'Good to run' : feasibility.verdict === 'caution' ? 'Caution — over your timeline' : 'Not feasible as set'}
                      </h4>
                      <p className="text-sm leading-relaxed opacity-90">
                        {feasibility.verdict === 'go'
                          ? `This test reaches a trustworthy result in ~${result.runtimeDays} days — within your ${deadlineDays}-day deadline, with ${spare} to spare.`
                          : feasibility.verdict === 'caution'
                            ? `This test needs ~${result.runtimeDays} days, but your deadline is ${deadlineDays}. It's close — a small change below will likely make it fit.`
                            : `This test needs ~${result.runtimeDays} days — well beyond your ${deadlineDays}-day deadline. See the options below.`}
                      </p>
                    </div>
                    <div className="pt-4 mt-4 border-t border-outline-variant/20 flex items-center justify-between"><span className="text-[10px] font-black uppercase tracking-widest text-outline">Total sample</span><span className="font-display font-black text-lg tabular-nums">{fmt(result.totalSample)}</span></div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-surface-container-lowest rounded border border-outline-variant/40 p-6">
                  <div className="flex items-center justify-between mb-3"><h3 className="font-display font-bold text-sm">Runtime vs. your deadline</h3><span className="text-[11px] text-on-surface-variant">{fmt(result.perVariantSample)} per variant · {variants} variants</span></div>
                  {(() => {
                    const scale = Math.max(result.runtimeDays, deadlineDays) * 1.12
                    const fillPct = Math.min(100, (result.runtimeDays / scale) * 100)
                    const dlPct = Math.min(100, (deadlineDays / scale) * 100)
                    return (
                      <>
                        <div className="relative h-9 bg-surface-container-low rounded overflow-hidden">
                          <div className="absolute left-0 top-0 bottom-0 border-r-2" style={{ width: `${fillPct}%`, background: `${color}40`, borderColor: color }} />
                          <div className="absolute top-0 bottom-0 w-0.5 bg-destructive z-10" style={{ left: `${dlPct}%` }} />
                        </div>
                        <div className="relative h-8 mt-1.5 text-[10px] font-bold">
                          <span className="absolute left-0 top-0 text-outline">start</span>
                          <span className="absolute top-0 text-on-surface" style={{ left: `${Math.min(92, fillPct)}%`, transform: 'translateX(-50%)' }}>needs {result.runtimeDays} days</span>
                          <span className="absolute top-4 text-destructive flex items-center gap-1" style={{ left: `${dlPct}%`, transform: 'translateX(-50%)' }}><Flag className="w-3 h-3" />deadline {deadlineDays}d</span>
                        </div>
                      </>
                    )
                  })()}
                </div>

                {/* Realism flags */}
                {flags.map((f) => (
                  <div key={f.id} className="bg-surface-container-lowest rounded border border-outline-variant/40 p-4 border-l-4 border-l-driftwood flex gap-3">
                    <Flag className="w-5 h-5 text-driftwood flex-shrink-0" />
                    <div><p className="text-sm font-medium">{f.title}</p><p className="text-[12px] text-on-surface-variant mt-0.5">{f.detail}</p></div>
                  </div>
                ))}

                {/* Make it fit / success */}
                {feasibility.verdict === 'go' ? (
                  <div className="bg-surface-container-lowest rounded border border-outline-variant/40 p-5 border-l-4 border-l-[#1f7a4d] flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#1f7a4d] flex-shrink-0" />
                    <div><p className="text-sm font-medium text-[#1f7a4d]">Fits your deadline.</p><p className="text-[12px] text-on-surface-variant mt-0.5">Reaches significance in {result.runtimeDays} days, {spare} days inside your {deadlineDays}-day window.</p></div>
                  </div>
                ) : (
                  <div className="bg-surface-container-lowest rounded border border-outline-variant/40 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-5">
                        <div><h3 className="font-display text-sm font-extrabold mb-0.5">How to make it fit</h3><p className="text-[11px] text-on-surface-variant">Pick one — each recalculates instantly</p></div>
                        <span className="bg-primary text-white text-[10px] px-3 py-1 rounded font-black tracking-widest uppercase">{fits.length} options</span>
                      </div>
                      <div className="space-y-3">
                        {fits.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => {
                              if (s.id === 'enlarge') setDailyTraffic(Math.ceil(result.totalSample / deadlineDays))
                              else setDeadlineDays(clampDeadline(result.runtimeDays))
                            }}
                            className="w-full text-left p-4 bg-surface-container-low/50 rounded border border-surface-container-highest hover:border-primary/30 cursor-pointer flex items-center gap-3"
                          >
                            <span className="w-8 h-8 rounded bg-primary flex items-center justify-center flex-shrink-0">
                              {s.id === 'enlarge' ? <UserPlus className="w-4 h-4 text-white" /> : <Calendar className="w-4 h-4 text-white" />}
                            </span>
                            <span className="flex-1"><span className="block text-sm font-bold">{s.title}</span><span className="block text-[12px] text-on-surface-variant">{s.detail}</span></span>
                            <ChevronRight className="w-4 h-4 text-outline flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="bg-surface-container-low/80 px-6 py-3 flex items-center gap-2 border-t border-surface-container-highest"><Lightbulb className="w-4 h-4 text-primary" /><p className="text-[11px] font-medium text-on-surface-variant italic">Coaching: detecting a smaller effect is more rigorous — but only if you have the traffic for it.</p></div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-surface-container-lowest rounded border border-outline-variant/40 p-6 text-sm border-l-4 border-l-driftwood flex gap-3">
                <Info className="w-5 h-5 text-driftwood flex-shrink-0" />
                <div><p className="font-medium">Can&apos;t compute with these inputs.</p><p className="text-on-surface-variant mt-0.5">Check the baseline is between 0–100% and the resulting treatment rate stays below 100%.</p></div>
              </div>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  )
}
