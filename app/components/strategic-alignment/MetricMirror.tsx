'use client'

import { BarChart3, Flag, TriangleAlert, CheckCircle2, ArrowRight, Minus } from 'lucide-react'
import type { MetricAlignment } from '@/lib/strategic-alignment/logic'

const GREEN = '#1f7a4d'
const ERROR = '#ba1a1a'
const CUSTOM = '__custom__'
const selectCls = 'w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-sm'

export function MetricMirror({
  value,
  onChange,
  kpis,
  metric,
  rationale,
  onRationale,
}: {
  value: string
  onChange: (s: string) => void
  kpis: string[]
  metric: MetricAlignment
  rationale: string
  onRationale: (s: string) => void
}) {
  const hasVs = !!metric.northStar
  const isCustom = hasVs && value.trim().length > 0 && !kpis.includes(value)
  const diverged = hasVs && !!value.trim() && !metric.isAligned

  // connector state
  const conn = !hasVs || !value.trim()
    ? { color: 'var(--outline-variant)', label: 'Awaiting', Icon: Minus }
    : metric.isAligned
      ? { color: GREEN, label: 'Aligned', Icon: CheckCircle2 }
      : { color: ERROR, label: 'Divergence', Icon: TriangleAlert }

  return (
    <section>
      <h3 className="text-[10px] text-on-surface-variant/40 mb-8 uppercase tracking-[0.2em] font-bold">Metric Alignment Analysis</h3>

      <div className="grid grid-cols-1 md:grid-cols-12 items-stretch gap-4">
        {/* Left — primary metric (picker) */}
        <div className="md:col-span-5 glass-card rounded-2xl p-7">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-primary" strokeWidth={2} />
            <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Your primary metric</p>
          </div>
          <h4 className="font-display text-2xl font-black text-primary mb-1 leading-tight">{value || <span className="text-on-surface-variant/40">Select a KPI</span>}</h4>
          {hasVs ? (
            <>
              <p className="text-[12px] text-on-surface-variant/70 mb-4">{isCustom ? 'Custom metric — not in this stream’s register' : 'from this value stream’s KPI register'}</p>
              <select
                aria-label="Primary metric"
                className={selectCls}
                value={isCustom ? CUSTOM : value}
                onChange={(e) => onChange(e.target.value === CUSTOM ? '' : e.target.value)}
              >
                <option value="">Select a KPI…</option>
                {kpis.map((k) => <option key={k} value={k}>{k}</option>)}
                <option value={CUSTOM}>Define another…</option>
              </select>
              {isCustom && (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="Name your metric"
                  className="mt-2 w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                />
              )}
            </>
          ) : (
            <p className="text-[12px] text-on-surface-variant/70">Pick the quarterly bet above to map this to a KPI.</p>
          )}
        </div>

        {/* Connector — divergence diagnostic */}
        <div className="md:col-span-2 flex md:flex-col items-center justify-center gap-3 py-2">
          <div className="h-px md:h-auto md:w-px flex-1 md:flex-none border-t md:border-t-0 md:border-l border-dashed" style={{ borderColor: `${conn.color}55` }} />
          <div className="flex flex-col items-center gap-2">
            <span className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow" style={{ background: conn.color }}>
              <conn.Icon className="w-4 h-4" strokeWidth={2.5} />
            </span>
            <span className="text-[10px] font-black uppercase tracking-tight text-center" style={{ color: conn.color }}>{conn.label}</span>
          </div>
          <div className="h-px md:h-auto md:w-px flex-1 md:flex-none border-t md:border-t-0 md:border-l border-dashed" style={{ borderColor: `${conn.color}55` }} />
        </div>

        {/* Right — value stream goal */}
        <div className="md:col-span-5 glass-card rounded-2xl p-7">
          <div className="flex items-center gap-2 mb-3">
            <Flag className="w-4 h-4 text-primary" strokeWidth={2} />
            <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">What this value stream is judged on</p>
          </div>
          <h4 className="font-display text-2xl font-black text-primary leading-tight">{metric.northStar ?? <span className="text-on-surface-variant/40">— pick a bet —</span>}</h4>
          <p className="text-[12px] text-on-surface-variant/70 mt-1">North-star metric for this stream</p>
        </div>
      </div>

      {diverged && (
        <div className="max-w-2xl mt-8">
          <p className="text-sm font-medium text-on-surface mb-3">Your metric isn’t this stream’s north star. If that’s intentional, say why — the champion sees this:</p>
          <input
            type="text"
            value={rationale}
            onChange={(e) => onRationale(e.target.value)}
            placeholder="Why moving this metric still serves the goal (optional)…"
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3.5 text-sm outline-none focus:border-primary shadow-sm"
          />
        </div>
      )}

      <button type="button" className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:gap-2.5 transition-all">
        Metric taxonomy guide <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </section>
  )
}
