'use client'

import { RELATED_TESTS, type Outcome } from '@/lib/strategic-alignment/data'

// Strategic-truth vocabulary, not success theatre (no "won/lost").
const OUTCOME: Record<Outcome, { label: string; color: string }> = {
  won: { label: 'Validated', color: '#1f7a4d' },
  flat: { label: 'No difference', color: '#847460' },
  lost: { label: 'Not validated', color: '#ba1a1a' },
}

export function RelatedTests({ acknowledged, onAcknowledge }: { acknowledged: boolean; onAcknowledge: (b: boolean) => void }) {
  return (
    <section>
      <h3 className="text-[10px] text-on-surface-variant/40 mb-8 uppercase tracking-[0.2em] font-bold">Related Evidence</h3>
      <p className="text-sm text-on-surface-variant/70 mb-5 max-w-2xl">The 3 closest past tests by hypothesis, surface, or metric. Look for a pattern before you spend traffic.</p>
      <div className="flex flex-col gap-3">
        {RELATED_TESTS.map((t) => {
          const o = OUTCOME[t.outcome]
          return (
            <div key={t.id} className="flex items-center justify-between gap-3 glass-card rounded-xl p-4">
              <div className="min-w-0">
                <div className="text-sm font-bold text-primary font-display truncate">{t.name}</div>
                <div className="text-[11px] text-on-surface-variant/70 truncate">{t.art} · {t.surface} · {t.metric} · {t.matchReason}</div>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: `${o.color}1a`, color: o.color }}>{o.label} · {t.deltaLabel}</span>
            </div>
          )
        })}
      </div>
      <label className="flex items-center gap-2 mt-5 text-sm text-on-surface cursor-pointer">
        <input type="checkbox" checked={acknowledged} onChange={(e) => onAcknowledge(e.target.checked)} />
        I&apos;ve reviewed these — this test is meaningfully different, not a duplicate.
      </label>
    </section>
  )
}
