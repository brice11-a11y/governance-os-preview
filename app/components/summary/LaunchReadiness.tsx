'use client'

import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import type { ExperimentSummary, QaChecklist } from '@/lib/experiments/types'

const labelCls = 'text-[10px] uppercase tracking-widest text-on-surface-variant/60'

export function LaunchReadiness({
  summary,
  onPatch,
}: {
  summary: ExperimentSummary
  onPatch: (p: Partial<ExperimentSummary>) => void
}) {
  const setQa = (k: keyof QaChecklist, v: boolean) => onPatch({ qa: { ...summary.qa, [k]: v } })
  const collisionDetected = !!summary.collision?.detected

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] uppercase tracking-[0.18em] font-bold text-on-surface-variant/50">05 · Launch readiness</h3>
        <span className="text-[11px] text-on-surface-variant">filled here</span>
      </div>
      <div className="glass-card rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        <label className="flex flex-col gap-1">
          <span className={labelCls}>Campaign name</span>
          <Input value={summary.campaignName} onChange={(e) => onPatch({ campaignName: e.target.value })} placeholder="[ART] name page tenant" className="bg-white text-sm" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1"><span className={labelCls}>Start</span><Input type="date" value={summary.startDate ?? ''} onChange={(e) => onPatch({ startDate: e.target.value })} className="bg-white text-sm" /></label>
          <label className="flex flex-col gap-1"><span className={labelCls}>End</span><Input type="date" value={summary.endDate ?? ''} onChange={(e) => onPatch({ endDate: e.target.value })} className={`text-sm ${summary.endDate ? 'bg-white' : 'bg-caution/5 border-caution/50'}`} /></label>
        </div>
        <div className="sm:col-span-2">
          <div className={`${labelCls} mb-2`}>QA checklist</div>
          <div className="flex flex-col gap-2 text-sm">
            <label className="flex items-center gap-2 cursor-pointer"><Checkbox checked={summary.qa.rendersAcrossDevices} onCheckedChange={(v) => setQa('rendersAcrossDevices', v === true)} /> Variant renders across devices</label>
            <label className="flex items-center gap-2 cursor-pointer"><Checkbox checked={summary.qa.trackingFires} onCheckedChange={(v) => setQa('trackingFires', v === true)} /> Tracking fires as expected</label>
            <label className="flex items-center gap-2 cursor-pointer"><Checkbox checked={summary.qa.exposureRulesConfirmed} onCheckedChange={(v) => setQa('exposureRulesConfirmed', v === true)} /> Exposure / targeting rules confirmed</label>
          </div>
        </div>
        {collisionDetected && (
          <label className="sm:col-span-2 flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox checked={!!summary.collision?.acknowledged} onCheckedChange={(v) => onPatch({ collision: { ...summary.collision!, acknowledged: v === true } })} />
            I acknowledge the collision and have coordinated with the surface owner.
          </label>
        )}
      </div>
    </section>
  )
}
