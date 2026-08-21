'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Experiment } from '@/lib/experiments/types'

const fmt = (n?: number) => (n == null ? '—' : n.toLocaleString('en-US'))

export function MethodPowerCard({ experiment }: { experiment: Experiment }) {
  const p = experiment.power
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] uppercase tracking-[0.18em] font-bold text-on-surface-variant/50">02 · Method &amp; power</h3>
        <Link href={`/calculator/${experiment.id}`} className="text-[11px] font-bold text-tertiary flex items-center gap-1">Edit in Calculator <ArrowRight className="w-3.5 h-3.5" /></Link>
      </div>
      <div className="glass-card rounded-xl p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div><div className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-1">Method</div><div className="text-sm font-bold font-display text-primary">{p ? 'A/B' : '—'}</div></div>
        <div><div className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-1">Sample / variant</div><div className="font-display text-xl font-extrabold tabular-nums">{fmt(p?.perVariantSample)}</div></div>
        <div><div className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-1">Total</div><div className="font-display text-xl font-extrabold tabular-nums">{fmt(p?.totalSample)}</div></div>
        <div><div className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-1">Runtime</div><div className="font-display text-xl font-extrabold tabular-nums">{p?.runtimeDays != null ? `${p.runtimeDays} d` : '—'}</div></div>
      </div>
    </section>
  )
}
