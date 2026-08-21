'use client'

import { ImageIcon, Plus } from 'lucide-react'
import type { AllocationArm } from '@/lib/experiments/types'

const ARM_BG = ['from-surface-container to-surface-container-high', 'from-tertiary/20 to-primary/10', 'from-driftwood/20 to-secondary/10', 'from-go/15 to-tertiary/10']

export function TrafficAllocation({ arms, onChange }: { arms: AllocationArm[]; onChange: (arms: AllocationArm[]) => void }) {
  const total = arms.reduce((s, a) => s + (a.trafficPct || 0), 0)

  function setPct(id: string, pct: number) {
    onChange(arms.map((a) => (a.id === id ? { ...a, trafficPct: Math.max(0, Math.min(100, Math.round(pct) || 0)) } : a)))
  }
  function addVariant() {
    const n = arms.length
    onChange([...arms, { id: `variant-${n}`, name: `Variant ${String.fromCharCode(64 + n)}`, description: 'Describe this variant.', trafficPct: 0 }])
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] uppercase tracking-[0.18em] font-bold text-on-surface-variant/50">03 · Traffic allocation</h3>
        <span className="text-[11px]" style={{ color: total === 100 ? '#1f7a4d' : '#9a7b1f' }}>{total}% allocated{total === 100 ? '' : ' · must total 100%'}</span>
      </div>
      <div className="glass-card rounded-xl p-6">
        <div className="flex h-3 rounded-full overflow-hidden mb-5 bg-surface-container-high">
          {arms.map((a, i) => <div key={a.id} style={{ width: `${a.trafficPct}%`, background: i === 0 ? '#c6c5d1' : '#05164d', opacity: i === 0 ? 1 : 1 - i * 0.18 }} />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {arms.map((a, i) => (
            <div key={a.id} className={`rounded-xl overflow-hidden border ${i === 0 ? 'border-outline-variant/50' : 'border-2 border-primary/30'}`}>
              <div className={`h-28 bg-gradient-to-br ${ARM_BG[i % ARM_BG.length]} flex items-center justify-center text-on-surface-variant/40`}>
                {a.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.imageUrl} alt={a.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8" />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm font-bold font-display ${i === 0 ? '' : 'text-primary'} truncate`}>{a.name}</span>
                  <span className="text-sm font-bold tabular-nums flex items-center gap-1">
                    <input aria-label={`${a.name} traffic percent`} type="number" min={0} max={100} value={a.trafficPct} onChange={(e) => setPct(a.id, parseFloat(e.target.value))} className="w-12 text-right bg-surface-container-low rounded px-1 py-0.5 outline-none" />%
                  </span>
                </div>
                <p className="text-[12px] text-on-surface-variant mt-1">{a.description}</p>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addVariant} className="mt-4 text-xs font-bold text-tertiary flex items-center gap-1"><Plus className="w-4 h-4" /> Add variant</button>
      </div>
    </section>
  )
}
