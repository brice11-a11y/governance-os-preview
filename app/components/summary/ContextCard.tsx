'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { formatHypothesis } from '@/lib/ai/coach'
import type { Experiment } from '@/lib/experiments/types'

function renderInline(s: string) {
  return s.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-on-surface">$1</strong>')
}

export function ContextCard({ experiment, owner, onOwner }: { experiment: Experiment; owner: string; onOwner: (s: string) => void }) {
  const b = experiment.blueprint
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] uppercase tracking-[0.18em] font-bold text-on-surface-variant/50">01 · Test context</h3>
        <Link href="/coach" className="text-[11px] font-bold text-tertiary flex items-center gap-1">Edit in Coach <ArrowRight className="w-3.5 h-3.5" /></Link>
      </div>
      <div className="glass-card rounded-xl p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-5">
          <div><div className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-1">Primary metric</div><div className="text-sm font-bold font-display text-primary">{b.primaryMetric ?? '—'}</div></div>
          <div><div className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-1">Audience &amp; surface</div><div className="text-sm font-bold font-display text-primary">{b.targetSurface ?? '—'}</div></div>
          <div><div className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-1">Owner</div><Input value={owner} onChange={(e) => onOwner(e.target.value)} className="h-8 bg-white text-sm" /></div>
        </div>
        <div className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-2">Hypothesis</div>
        <p className="text-[15px] leading-relaxed italic text-on-surface bg-surface-container-low/60 rounded-lg p-4" dangerouslySetInnerHTML={{ __html: renderInline(formatHypothesis(b)) }} />
      </div>
    </section>
  )
}
