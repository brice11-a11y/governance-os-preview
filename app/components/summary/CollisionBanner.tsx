'use client'

import { TriangleAlert, ArrowRight } from 'lucide-react'
import type { CollisionInfo } from '@/lib/experiments/types'

export function CollisionBanner({ collision }: { collision?: CollisionInfo }) {
  if (!collision?.detected) return null
  return (
    <div className="rounded-xl px-5 py-3.5 flex items-center gap-3" style={{ background: '#fdecea', border: '1px solid #f3b4ae' }}>
      <TriangleAlert className="w-5 h-5 text-error flex-shrink-0" />
      <div className="flex-1 text-sm text-on-surface">
        <b className="text-error">Collision detected.</b> Overlaps with <b>{collision.withExperiment ?? 'another test'}</b>
        {collision.surface ? <> on the {collision.surface} surface</> : null}
        {collision.tenants?.length ? <> · {collision.tenants.join(', ')}</> : null}.
      </div>
      <button type="button" className="text-xs font-bold text-error flex items-center gap-1">View conflict map <ArrowRight className="w-3.5 h-3.5" /></button>
    </div>
  )
}
