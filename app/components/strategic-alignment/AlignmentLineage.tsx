'use client'

import { CheckCircle2, ChevronDown, Crosshair } from 'lucide-react'
import { THEMES, getArt } from '@/lib/strategic-alignment/data'
import type { Lineage } from '@/lib/strategic-alignment/logic'

const GO = '#1f7a4d'

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">{children}</span>
}

function FilledNode({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-3">
      <Label>{label}</Label>
      <div className="flex items-center justify-between gap-2 px-4 py-3 bg-surface-container-lowest border border-primary/15 rounded-xl shadow-sm min-h-[46px]">
        <span className="text-xs font-bold text-primary font-display truncate">{value}</span>
        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={2} />
      </div>
    </div>
  )
}

function PendingNode({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div className="flex flex-col gap-3">
      <Label>{label}</Label>
      <div className="flex items-center px-4 py-3 bg-surface-container-highest/40 border border-dashed border-outline-variant rounded-xl min-h-[46px]">
        <span className="text-xs font-medium text-on-surface-variant/60">{placeholder}</span>
      </div>
    </div>
  )
}

export function AlignmentLineage({
  lineage,
  themeId,
  onThemeChange,
  testLabel,
}: {
  lineage: Lineage
  themeId?: string
  onThemeChange: (id?: string) => void
  testLabel: string
}) {
  const complete = lineage.complete
  const fill = complete ? 100 : 0

  return (
    <section>
      <h3 className="text-[10px] text-on-surface-variant/40 mb-8 uppercase tracking-[0.2em] font-bold">Strategic Alignment Lineage</h3>

      <div className="relative">
        {/* connecting line (wide screens) */}
        <div className="hidden lg:flex absolute top-[46px] left-0 right-0 h-px px-12 z-0">
          <div className="border-t-2 border-primary" style={{ width: `${fill}%` }} />
          <div className="border-t-2 border-dashed border-outline-variant/40" style={{ width: `${100 - fill}%` }} />
        </div>

        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1 — Company goal */}
          {lineage.companyGoal
            ? <FilledNode label="Company objective" value={lineage.companyGoal.name} />
            : <PendingNode label="Company objective" placeholder="—" />}

          {/* 2 — Value stream OKR */}
          {lineage.okr
            ? <FilledNode label="Value-stream OKR" value={lineage.okr.name} />
            : <PendingNode label="Value-stream OKR" placeholder="—" />}

          {/* 3 — Quarterly theme (the one decision) */}
          <div className="flex flex-col gap-3">
            <Label>Quarterly bet</Label>
            <div className="relative">
              <select
                aria-label="Quarterly bet"
                value={themeId ?? ''}
                onChange={(e) => onThemeChange(e.target.value || undefined)}
                className={[
                  'w-full appearance-none px-4 py-3 pr-9 rounded-xl text-xs min-h-[46px] cursor-pointer transition-all outline-none',
                  themeId
                    ? 'bg-surface-container-lowest border border-primary/15 shadow-sm font-bold text-primary font-display'
                    : 'bg-surface-container-highest/40 border border-dashed border-outline-variant font-medium text-on-surface-variant hover:bg-surface-container-lowest',
                ].join(' ')}
              >
                <option value="">Pick the bet this test serves…</option>
                {THEMES.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} · {getArt(t.artId)?.name}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-on-surface-variant absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 4 — This test */}
          <FilledNode label="This test" value={testLabel} />
        </div>
      </div>

      <div className="mt-8 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${complete ? '' : 'bg-secondary animate-pulse'}`} style={complete ? { background: GO } : undefined} />
        <p className="text-xs font-medium text-on-surface-variant/60 italic">
          {complete
            ? `Connected — this test ladders up to “${lineage.companyGoal!.name}”.`
            : 'Pick the quarterly bet this test serves. No fitting bet? That itself is a signal.'}
        </p>
      </div>
    </section>
  )
}
