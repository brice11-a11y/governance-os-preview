'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Loader2, Plus, Lightbulb, Trash2, CheckCircle2, FlaskConical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppShell } from '@/components/layout/AppShell'
import { listExperiments, deleteExperiment } from '@/lib/experiments/client'
import { STATUS_LABEL, type Experiment, type ExperimentStatus } from '@/lib/experiments/types'

const STATUS_STYLE: Record<ExperimentStatus, string> = {
  draft: 'bg-surface-container-high text-on-surface-variant',
  calculated: 'bg-tertiary/15 text-tertiary',
  finalized: 'bg-primary text-white',
  'in-review': 'bg-secondary/15 text-secondary',
}

const VS_FILTERS = ['All', 'ISB', 'ANC', 'PPL', 'CS', 'TEX', 'PAYMENT', 'B2B'] as const
type VsFilter = (typeof VS_FILTERS)[number]

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-surface-container-lowest rounded p-4 border border-outline-variant/40 flex-1">
      <div className="font-display text-2xl font-semibold text-on-surface tabular-nums">{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-on-surface-variant mt-0.5">{label}</div>
    </div>
  )
}

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<Experiment[] | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [vsFilter, setVsFilter] = useState<VsFilter>('All')

  const load = () => listExperiments().then(setExperiments).catch(() => setExperiments([]))

  useEffect(() => {
    load()
    const params = new URLSearchParams(window.location.search)
    const saved = params.get('saved')
    const submittedId = params.get('submitted')
    if (saved || submittedId) {
      setSavedId(saved || submittedId)
      setSubmitted(!!submittedId)
      window.history.replaceState(null, '', '/experiments')
      const t = setTimeout(() => setSavedId(null), 4000)
      return () => clearTimeout(t)
    }
  }, [])

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.preventDefault()
    e.stopPropagation()
    setDeleting(id)
    try {
      await deleteExperiment(id)
      await load()
    } catch (err) {
      console.error('[experiments] delete failed:', err)
    } finally {
      setDeleting(null)
    }
  }

  const total = experiments?.length ?? 0
  const finalized = experiments?.filter((e) => e.status === 'finalized' || e.status === 'in-review').length ?? 0
  const inProgress = total - finalized

  const filtered =
    experiments === null
      ? null
      : vsFilter === 'All'
        ? experiments
        : experiments.filter((e) => e.summary?.valueStream === vsFilter)

  return (
    <AppShell
      title="Experiment Queue"
      subtitle="All experiments across the programme"
      actions={
        <Link href="/coach">
          <Button size="sm" className="bg-primary text-white hover:bg-primary/90 rounded gap-1.5">
            <Plus className="w-3.5 h-3.5" /> New experiment
          </Button>
        </Link>
      }
    >
      <div className="max-w-5xl mx-auto px-8 py-8 flex flex-col gap-6">
        {savedId && (
          <div className="flex items-center gap-2 bg-tertiary/10 text-tertiary rounded p-3 text-sm border border-tertiary/20">
            <CheckCircle2 className="w-4 h-4" strokeWidth={2} /> {submitted ? 'Experiment submitted for champion review.' : 'Experiment saved to the registry.'}
          </div>
        )}

        {experiments === null ? (
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading registry…
          </div>
        ) : experiments.length === 0 ? (
          <div className="flex flex-col items-center text-center gap-4 py-20">
            <span className="w-14 h-14 rounded bg-surface-container-high flex items-center justify-center">
              <FlaskConical className="w-7 h-7 text-on-surface-variant" />
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold text-on-surface">Your queue is empty</h2>
              <p className="text-sm text-on-surface-variant mt-1 max-w-md">
                Every experiment starts as a rigorous hypothesis. Carter, your coach, will walk you through it —
                then size it and save it here.
              </p>
            </div>
            <Link href="/coach">
              <Button size="sm" className="bg-primary text-white rounded gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" /> Create your first experiment
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex gap-4">
              <StatBox label="Total" value={total} />
              <StatBox label="In progress" value={inProgress} />
              <StatBox label="Finalized" value={finalized} />
            </div>

            {/* Value-stream filter chips */}
            <div className="flex flex-wrap gap-2">
              {VS_FILTERS.map((vs) => (
                <button
                  key={vs}
                  onClick={() => setVsFilter(vs)}
                  className={[
                    'text-xs font-medium px-3 py-1 rounded-full transition-colors',
                    vsFilter === vs
                      ? 'bg-primary text-white'
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container',
                  ].join(' ')}
                >
                  {vs}
                </button>
              ))}
            </div>

            <div className="flex flex-col">
              <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_100px_100px_120px_140px_40px] gap-4 px-4 pb-2 text-[11px] uppercase tracking-wider text-on-surface-variant">
                <span>Hypothesis</span>
                <span className="hidden sm:block">Owner</span>
                <span className="hidden sm:block">ART</span>
                <span className="hidden sm:block">Status</span>
                <span className="hidden sm:block">Updated</span>
                <span />
              </div>
              <div className="flex flex-col gap-1.5">
                {filtered && filtered.length === 0 ? (
                  <p className="text-sm text-on-surface-variant px-4 py-8 text-center">No experiments match the selected value stream.</p>
                ) : (
                  filtered?.map((exp) => (
                    <Link
                      key={exp.id}
                      href={`/summary/${exp.id}`}
                      className="group grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_100px_100px_120px_140px_40px] items-center gap-4 bg-surface-container-lowest hover:bg-surface-container rounded p-4 border border-outline-variant/40 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-on-surface truncate">{exp.name}</div>
                        <div className="text-[11px] text-on-surface-variant mt-0.5 truncate">
                          {exp.draftId}
                          {exp.blueprint.primaryMetric ? ` · ${exp.blueprint.primaryMetric}` : ''}
                        </div>
                      </div>
                      <span className="hidden sm:block text-xs text-on-surface-variant truncate">
                        {exp.summary?.owner ?? '—'}
                      </span>
                      <span className="hidden sm:block text-xs text-on-surface-variant truncate">
                        {exp.summary?.art ?? '—'}
                      </span>
                      <span className={`hidden sm:inline-flex w-fit text-[11px] font-medium px-2 py-0.5 rounded ${STATUS_STYLE[exp.status]}`}>
                        {STATUS_LABEL[exp.status]}
                      </span>
                      <span className="hidden sm:block text-xs text-on-surface-variant">
                        {formatDistanceToNow(new Date(exp.updatedAt), { addSuffix: true })}
                      </span>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => handleDelete(e, exp.id)}
                          disabled={deleting === exp.id}
                          aria-label="Delete experiment"
                          className="p-1.5 rounded text-on-surface-variant/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          {deleting === exp.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}
