'use client'

import Link from 'next/link'
import { Gavel, ArrowRight } from 'lucide-react'

export function DecisionProtocolSummary({ captured, id }: { captured: boolean; id: string }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] uppercase tracking-[0.18em] font-bold text-on-surface-variant/50">04 · Decision protocol</h3>
        <Link href={`/decision/${id}`} className="text-[11px] font-bold flex items-center gap-1" style={{ color: captured ? '#1f7a4d' : '#9a7b1f' }}>
          {captured ? 'Captured' : 'Pending · Complete'} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      {captured ? (
        <div className="glass-card rounded-xl p-5 flex items-center gap-3">
          <Gavel className="w-5 h-5 text-primary" />
          <p className="text-sm text-on-surface">Pre-committed decision recorded on the Decision Protocol page.</p>
        </div>
      ) : (
        <div className="rounded-xl p-5 flex items-center gap-3" style={{ background: '#faf6ee', border: '1px solid #e3d3b0' }}>
          <Gavel className="w-5 h-5 text-caution" />
          <p className="text-sm text-on-surface">Not captured yet. The pre-committed decision (validated / no difference / not validated) is set on the <b>Decision Protocol</b> page.</p>
        </div>
      )}
    </section>
  )
}
