'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppShell } from '@/components/layout/AppShell'
import { getExperiment, updateExperiment } from '@/lib/experiments/client'
import { computeGoLiveScore } from '@/lib/summary/score'
import { seedSummary } from '@/lib/summary/defaults'
import type { Experiment, ExperimentSummary } from '@/lib/experiments/types'
import { ScoreRail } from './ScoreRail'
import { CollisionBanner } from './CollisionBanner'
import { ContextCard } from './ContextCard'
import { MethodPowerCard } from './MethodPowerCard'
import { TrafficAllocation } from './TrafficAllocation'
import { DecisionProtocolSummary } from './DecisionProtocolSummary'
import { LaunchReadiness } from './LaunchReadiness'

export function TestSummaryPage({ id }: { id: string }) {
  const router = useRouter()
  const [experiment, setExperiment] = useState<Experiment | null>(null)
  const [summary, setSummary] = useState<ExperimentSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    getExperiment(id)
      .then((exp) => {
        if (!active) return
        setExperiment(exp)
        setSummary({ ...seedSummary(exp), ...(exp.summary ?? {}) })
      })
      .catch(() => active && setNotFound(true))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [id])

  function patch(p: Partial<ExperimentSummary>) {
    setSummary((s) => (s ? { ...s, ...p } : s))
  }

  async function save() {
    if (!summary) return
    setSaving(true)
    try {
      await updateExperiment(id, { summary })
    } catch (err) {
      console.error('[summary] save failed:', err)
    } finally {
      setSaving(false)
    }
  }

  async function submit() {
    if (!experiment || !summary) return
    const score = computeGoLiveScore(experiment.blueprint, summary)
    if (!score.gatePassed) return
    setSaving(true)
    try {
      const goLive = { score: score.total, band: score.band, submittedAt: new Date().toISOString() }
      await updateExperiment(id, { status: 'in-review', summary: { ...summary, goLive } })
      router.push('/experiments?submitted=' + id)
    } catch (err) {
      console.error('[summary] submit failed:', err)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AppShell title="Test Setup Summary">
        <div className="flex items-center justify-center h-full text-on-surface-variant gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
      </AppShell>
    )
  }
  if (notFound || !experiment || !summary) {
    return (
      <AppShell title="Test Setup Summary">
        <div className="flex flex-col items-center justify-center h-full gap-3 text-on-surface-variant">
          <p>That experiment could not be found.</p>
          <Link href="/experiments"><Button size="sm" className="bg-primary text-white rounded">Back to experiments</Button></Link>
        </div>
      </AppShell>
    )
  }

  const score = computeGoLiveScore(experiment.blueprint, summary)

  return (
    <AppShell
      title={experiment.name}
      subtitle={`${experiment.draftId} · Test setup summary`}
      flowStep={5}
      actions={<Button size="sm" variant="ghost" onClick={save} disabled={saving} className="gap-1.5 text-on-surface-variant"><Save className="w-3.5 h-3.5" /> Save draft</Button>}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 px-8 py-8 max-w-[1240px] mx-auto w-full items-start">
        <div className="flex flex-col gap-8 min-w-0">
          <header>
            <h1 className="font-display font-extrabold text-3xl tracking-tight">{experiment.name}</h1>
            <p className="text-on-surface-variant text-[15px] mt-1">Everything we know about this test. Complete the gaps, then send it to your champion.</p>
          </header>
          <CollisionBanner collision={summary.collision} />
          <ContextCard experiment={experiment} owner={summary.owner} onOwner={(owner) => patch({ owner })} />
          <MethodPowerCard experiment={experiment} />
          <TrafficAllocation arms={summary.allocation} onChange={(allocation) => patch({ allocation })} />
          <DecisionProtocolSummary captured={summary.decisionProtocolCaptured} id={experiment.id} />
          <LaunchReadiness summary={summary} onPatch={patch} />
        </div>
        <ScoreRail score={score} saving={saving} onSubmit={submit} />
      </div>
    </AppShell>
  )
}
