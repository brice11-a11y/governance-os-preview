'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Check, ArrowLeft, Calculator, Pencil, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AppShell } from '@/components/layout/AppShell'
import { getExperiment, updateExperiment } from '@/lib/experiments/client'
import { formatHypothesis } from '@/lib/ai/coach'
import { assessFeasibility } from '@/lib/experiments/power'
import type { Experiment } from '@/lib/experiments/types'

const fmt = (n?: number) => (n == null ? '—' : n.toLocaleString('en-US'))

function renderInline(s: string) {
  return s.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-on-surface">$1</strong>')
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-wider text-on-surface-variant">{label}</span>
      <span className="text-sm text-on-surface">{value?.trim() || <span className="text-on-surface-variant/60">Not provided</span>}</span>
    </div>
  )
}

function SourceBadge({ quality }: { quality?: 'strong' | 'weak' | 'missing' }) {
  const map = {
    strong: { label: 'Strong evidence', cls: 'bg-tertiary/15 text-tertiary' },
    weak: { label: 'Weak evidence', cls: 'bg-driftwood/20 text-driftwood' },
    missing: { label: 'No evidence', cls: 'bg-destructive/15 text-destructive' },
  } as const
  const v = map[quality ?? 'missing']
  return <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${v.cls}`}>{v.label}</span>
}

export function FinalizePage({ id }: { id: string }) {
  const router = useRouter()
  const [experiment, setExperiment] = useState<Experiment | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [editingName, setEditingName] = useState(false)

  useEffect(() => {
    let active = true
    getExperiment(id)
      .then((exp) => {
        if (!active) return
        setExperiment(exp)
        setName(exp.name)
      })
      .catch(() => active && setNotFound(true))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [id])

  async function handleFinalize() {
    if (!experiment) return
    setSaving(true)
    try {
      await updateExperiment(id, { status: 'finalized', name: name.trim() || experiment.name })
      router.push('/experiments?saved=' + id)
    } catch (err) {
      console.error('[finalize] save failed:', err)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AppShell title="Finalize">
        <div className="flex items-center justify-center h-full text-on-surface-variant gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      </AppShell>
    )
  }

  if (notFound || !experiment) {
    return (
      <AppShell title="Finalize">
        <div className="flex flex-col items-center justify-center h-full gap-3 text-on-surface-variant">
          <p>That experiment could not be found.</p>
          <Link href="/experiments">
            <Button size="sm" className="bg-primary text-white rounded">Back to experiments</Button>
          </Link>
        </div>
      </AppShell>
    )
  }

  const b = experiment.blueprint
  const p = experiment.power

  return (
    <AppShell
      title={experiment.name}
      subtitle={`${experiment.draftId} · Review & save`}
      actions={
        <Button
          size="sm"
          onClick={handleFinalize}
          disabled={saving}
          className="bg-primary text-white hover:bg-primary/90 rounded gap-1.5"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
          {saving ? 'Saving…' : 'Save to registry'}
        </Button>
      }
    >
      <div className="max-w-4xl mx-auto px-8 py-8 flex flex-col gap-6">
        {/* Name */}
        <div className="flex items-center gap-3">
          {editingName ? (
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
              className="bg-surface-container-lowest font-display text-lg max-w-xl"
            />
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="group flex items-center gap-2 text-left"
            >
              <h1 className="font-display text-2xl font-semibold text-on-surface">{name || 'Untitled experiment'}</h1>
              <Pencil className="w-4 h-4 text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>

        {/* Hypothesis */}
        <section className="bg-surface-container-low rounded p-5 border border-outline-variant/40">
          <h2 className="font-display text-sm font-semibold text-on-surface mb-2">Hypothesis</h2>
          <p
            className="text-[15px] leading-relaxed text-on-surface"
            dangerouslySetInnerHTML={{ __html: renderInline(formatHypothesis(b)) }}
          />
        </section>

        {/* Design dimensions */}
        <section className="bg-surface-container-lowest rounded p-5 border border-outline-variant/40">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-sm font-semibold text-on-surface">Design</h2>
            <Link href="/coach" className="inline-flex items-center gap-1 text-[11px] text-on-surface-variant hover:text-on-surface">
              <ArrowLeft className="w-3 h-3" /> Edit in Coach
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <Field label="Variant / change" value={b.hypothesis.specificElement} />
            <Field label="Audience & surface" value={b.targetSurface} />
            <Field label="Primary metric" value={b.primaryMetric} />
            <Field label="Expected lift (MDE)" value={b.hypothesis.specificPercentage} />
            <Field label="Guardrail metric" value={b.guardrailMetrics} />
            <Field label="Methodology" value={b.methodology} />
          </div>
          <div className="mt-4 pt-4 border-t border-outline-variant/40 flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-on-surface-variant">Evidence</span>
            <SourceBadge quality={b.sourceQuality} />
          </div>
        </section>

        {/* Power */}
        <section className="bg-surface-container-lowest rounded p-5 border border-outline-variant/40">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-sm font-semibold text-on-surface">Power & sample size</h2>
            <Link
              href={`/calculator/${experiment.id}`}
              className="inline-flex items-center gap-1 text-[11px] text-on-surface-variant hover:text-on-surface"
            >
              <Calculator className="w-3 h-3" /> Adjust
            </Link>
          </div>

          {p ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-surface-container-low rounded p-3.5">
                  <div className="text-[11px] uppercase tracking-wider text-on-surface-variant">Per variant</div>
                  <div className="font-display text-xl font-semibold text-on-surface tabular-nums">{fmt(p.perVariantSample)}</div>
                </div>
                <div className="bg-surface-container-low rounded p-3.5">
                  <div className="text-[11px] uppercase tracking-wider text-on-surface-variant">Total sample</div>
                  <div className="font-display text-xl font-semibold text-on-surface tabular-nums">{fmt(p.totalSample)}</div>
                </div>
                <div className="bg-surface-container-low rounded p-3.5">
                  <div className="text-[11px] uppercase tracking-wider text-on-surface-variant">Runtime</div>
                  <div className="font-display text-xl font-semibold text-on-surface tabular-nums">{fmt(p.runtimeDays)}d</div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 text-xs text-on-surface-variant">
                <span>Baseline: <strong className="text-on-surface">{p.baselineRate}%</strong></span>
                <span>MDE: <strong className="text-on-surface">{p.mde}{p.mdeType === 'relative' ? '% rel' : 'pp abs'}</strong></span>
                <span>Confidence: <strong className="text-on-surface">{Math.round((1 - p.significance) * 100)}%</strong></span>
                <span>Power: <strong className="text-on-surface">{Math.round(p.power * 100)}%</strong></span>
                <span>Variants: <strong className="text-on-surface">{p.variants}</strong></span>
                <span>Test: <strong className="text-on-surface">{p.tails === 2 ? 'Two-tailed' : 'One-tailed'}</strong></span>
                <span>Traffic: <strong className="text-on-surface">{fmt(p.dailyTraffic)}/day</strong></span>
                <span>Deadline: <strong className="text-on-surface">{p.deadlineDays ?? '—'}d</strong></span>
                <span>Verdict: <strong className="text-on-surface">{p.runtimeDays != null && p.deadlineDays != null ? ({ go: 'Go', caution: 'Caution', red: 'Not feasible' }[assessFeasibility(p.runtimeDays, p.deadlineDays).verdict]) : '—'}</strong></span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4 bg-driftwood/10 rounded p-4 border border-driftwood/30">
              <p className="text-sm text-on-surface">This experiment hasn&apos;t been sized yet.</p>
              <Link href={`/calculator/${experiment.id}`}>
                <Button size="sm" className="bg-primary text-white rounded gap-1.5">
                  <Calculator className="w-3.5 h-3.5" /> Size it now
                </Button>
              </Link>
            </div>
          )}
        </section>

        {experiment.status === 'finalized' && (
          <div className="flex items-center gap-2 text-sm text-tertiary">
            <Check className="w-4 h-4" strokeWidth={2.5} /> Saved to the registry. Saving again will update the record.
          </div>
        )}
      </div>
    </AppShell>
  )
}
