'use client'

import type { AlignmentScore } from '@/lib/strategic-alignment/logic'

export function ScoreFooter({ score }: { score: AlignmentScore }) {
  const v = score.flagged
    ? { label: 'Not yet connected to strategy', sub: 'a champion will review the alignment', color: '#9a7b1f' }
    : score.total >= 18
      ? { label: 'Strongly connected to strategy', sub: 'clear bet and an owned KPI', color: '#1f7a4d' }
      : { label: 'Connected, with gaps', sub: 'tighten the metric or the evidence', color: '#9a7b1f' }

  return (
    <div className="sticky bottom-0 bg-surface/85 backdrop-blur-md border-t border-outline-variant/30 px-8 py-3.5">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: v.color }} />
          <div>
            <div className="text-sm font-bold text-on-surface">{v.label}</div>
            <div className="text-[11px] text-on-surface-variant">{v.sub}</div>
          </div>
        </div>
        <div className="flex items-baseline gap-1 text-on-surface-variant" title="Strategic alignment score (metrics)">
          <span className="font-display font-extrabold text-lg text-on-surface tabular-nums">{score.total}</span>
          <span className="text-xs">/ {score.max}</span>
        </div>
      </div>
    </div>
  )
}
