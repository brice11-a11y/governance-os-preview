'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppShell } from '@/components/layout/AppShell'
import { getExperiment, updateExperiment } from '@/lib/experiments/client'
import { deriveLineage, evaluateMetric, computeAlignmentScore } from '@/lib/strategic-alignment/logic'
import { kpisFor } from '@/lib/strategic-alignment/data'
import { AlignmentLineage } from './AlignmentLineage'
import { MetricMirror } from './MetricMirror'
import { RelatedTests } from './RelatedTests'
import { ScoreFooter } from './ScoreFooter'

interface Blueprint { primaryMetric: string; element: string; name: string; draftId: string }
const FALLBACK: Blueprint = {
  primaryMetric: 'Payment-CTA click rate',
  element: 'Add a trust badge above the payment CTA',
  name: 'Strategic alignment (demo)',
  draftId: 'EXP-DEMO',
}

export function StrategicAlignmentPage({ id }: { id: string }) {
  const router = useRouter()
  const [bp, setBp] = useState<Blueprint>(FALLBACK)
  const [loading, setLoading] = useState(true)
  const [continuing, setContinuing] = useState(false)
  const [themeId, setThemeId] = useState<string | undefined>(undefined)
  const [metricChoice, setMetricChoice] = useState('')
  const [rationale, setRationale] = useState('')
  const [duplicateAcknowledged, setDuplicateAcknowledged] = useState(false)

  useEffect(() => {
    let active = true
    getExperiment(id)
      .then((exp) => {
        if (!active) return
        setBp({
          primaryMetric: exp.blueprint.primaryMetric ?? FALLBACK.primaryMetric,
          element: exp.blueprint.hypothesis.specificElement ?? FALLBACK.element,
          name: exp.name,
          draftId: exp.draftId,
        })
      })
      .catch(() => {})
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [id])

  const lineage = deriveLineage(themeId)
  const vsId = lineage.valueStream?.id
  const metric = evaluateMetric(metricChoice, vsId)
  const score = computeAlignmentScore({ lineageComplete: lineage.complete, metric, duplicateAcknowledged })

  async function handleContinue() {
    setContinuing(true)
    try {
      await updateExperiment(id, { summary: { alignmentScore: score.total, valueStream: lineage.valueStream?.name, art: lineage.art?.name, theme: lineage.theme?.name } })
      router.push(`/decision/${id}`)
    } catch (err) {
      console.error('[align] failed to persist alignment score:', err)
      setContinuing(false)
    }
  }

  // Pre-select the metric from the bet's value-stream KPI register, defaulting to
  // the Coach metric (matched to a KPI when possible). Re-defaults when the bet changes.
  useEffect(() => {
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
    const coach = bp.primaryMetric
    const match = kpisFor(vsId).find((k) => norm(k).includes(norm(coach)) || norm(coach).includes(norm(k)))
    setMetricChoice(match ?? coach)
  }, [vsId, bp.primaryMetric])

  if (loading) {
    return (
      <AppShell title="Strategic Alignment">
        <div className="flex items-center justify-center h-full text-on-surface-variant gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
      </AppShell>
    )
  }

  return (
    <AppShell
      title={bp.name}
      subtitle={`${bp.draftId} · Strategic alignment`}
      actions={
        <Button size="sm" onClick={handleContinue} disabled={continuing} className="bg-primary text-white hover:bg-primary/90 rounded gap-1.5">
          {continuing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          Continue to Decision Protocol{!continuing && <ArrowRight className="w-3.5 h-3.5" />}
        </Button>
      }
      flowStep={2}
    >
      <div className="flex flex-col min-h-full">
        <div className="max-w-5xl mx-auto w-full px-8 pt-12 pb-2">
          <h2 className="font-display font-extrabold text-3xl tracking-tight mb-1">Does this experiment matter?</h2>
          <p className="text-on-surface-variant text-[15px] max-w-2xl leading-relaxed">Map the metric you&apos;re moving to what the business is trying to move. One question, answered before you spend traffic.</p>
        </div>

        <div className="px-8 py-12">
          <div className="max-w-5xl mx-auto">
            <AlignmentLineage lineage={lineage} themeId={themeId} onThemeChange={setThemeId} testLabel={bp.element} />
          </div>
        </div>

        <div className="px-8 py-12 bg-surface-container/20 border-y border-outline-variant/20">
          <div className="max-w-5xl mx-auto">
            <MetricMirror value={metricChoice} onChange={setMetricChoice} kpis={kpisFor(vsId)} metric={metric} rationale={rationale} onRationale={setRationale} />
          </div>
        </div>

        <div className="px-8 py-12 flex-1">
          <div className="max-w-5xl mx-auto">
            <RelatedTests acknowledged={duplicateAcknowledged} onAcknowledge={setDuplicateAcknowledged} />
          </div>
        </div>

        <ScoreFooter score={score} />
      </div>
    </AppShell>
  )
}
