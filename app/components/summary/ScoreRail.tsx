'use client'

import { Lock, Send, Loader2, TriangleAlert, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { GoLiveScore } from '@/lib/summary/score'

const BAND_COLOR: Record<GoLiveScore['band'], string> = { green: '#1f7a4d', yellow: '#9a7b1f', orange: '#9a7b1f', red: '#ba1a1a' }

function Bar({ label, value, max, floorOk, warn }: { label: string; value: number; max: number; floorOk?: boolean; warn?: boolean }) {
  const pct = Math.round((value / max) * 100)
  const color = warn || floorOk === false ? '#ba1a1a' : pct >= 80 ? '#1f7a4d' : pct >= 60 ? '#9a7b1f' : '#9a7b1f'
  return (
    <div>
      <div className="flex justify-between mb-1 text-sm">
        <span className={floorOk === false ? 'text-error flex items-center gap-1' : ''}>{label}{floorOk === false && <TriangleAlert className="w-3.5 h-3.5" />}</span>
        <span className="font-bold tabular-nums" style={floorOk === false ? { color: '#ba1a1a' } : undefined}>{value}/{max}</span>
      </div>
      <div className="h-1.5 rounded bg-surface-container-high"><div className="h-full rounded" style={{ width: `${pct}%`, background: color }} /></div>
    </div>
  )
}

export function ScoreRail({ score, saving, onSubmit }: { score: GoLiveScore; saving: boolean; onSubmit: () => void }) {
  const color = BAND_COLOR[score.band]
  const circ = 440
  const off = circ * (1 - score.total / 100)
  const statusText = score.gatePassed ? 'Ready for champion review' : `Not ready — ${score.blocking.length} item${score.blocking.length === 1 ? '' : 's'} blocking`

  return (
    <aside className="sticky top-20 flex flex-col gap-5">
      <div className="glass-card rounded-2xl p-6 flex flex-col items-center text-center">
        <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-on-surface-variant/50 mb-4">Overall Go-Live Score</div>
        <div className="relative w-40 h-40 mb-3">
          <svg className="w-full h-full -rotate-90"><circle cx="80" cy="80" r="70" fill="none" stroke="#ecf4ff" strokeWidth="12" /><circle cx="80" cy="80" r="70" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off} /></svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="font-display font-extrabold text-5xl">{score.total}</span><span className="text-[11px] text-on-surface-variant">/ 100</span></div>
        </div>
        <span className="text-[11px] font-bold px-3 py-1 rounded-full" style={{ background: `${color}1a`, color }}>{statusText}</span>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-on-surface-variant/50 mb-4">Quality audit</div>
        <div className="flex flex-col gap-4">
          <Bar label="Hypothesis" value={score.hypothesis} max={25} floorOk={score.floors.hypothesis} />
          <Bar label="Measurement" value={score.measurement} max={20} />
          <Bar label="Alignment" value={score.alignment} max={25} floorOk={score.floors.alignment} />
          <Bar label="Collision" value={score.collision} max={10} warn={score.collision < 10} />
          <Bar label="Readiness" value={score.readiness} max={20} floorOk={score.floors.readiness} />
        </div>
        {score.blocking.length > 0 && (
          <div className="mt-5 pt-4 border-t border-outline-variant/30 flex items-start gap-2 text-[11px] text-on-surface-variant">
            <Info className="w-4 h-4 flex-shrink-0 text-caution" strokeWidth={2} />
            <p><b>Blocking:</b> {score.blocking.join(' · ')}.</p>
          </div>
        )}
      </div>

      <Button
        size="lg"
        onClick={onSubmit}
        disabled={!score.gatePassed || saving}
        className="w-full py-6 rounded-xl bg-primary text-white font-display font-bold disabled:bg-surface-container-high disabled:text-on-surface-variant/50 flex items-center justify-center gap-2"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : score.gatePassed ? <Send className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
        {saving ? 'Submitting…' : 'Submit for champion review'}
      </Button>
      {!score.gatePassed && <p className="text-[11px] text-center text-on-surface-variant/70 -mt-2">Complete the blocking items to unlock.</p>}
    </aside>
  )
}
