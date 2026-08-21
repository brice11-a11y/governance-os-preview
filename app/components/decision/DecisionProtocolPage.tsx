'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppShell } from '@/components/layout/AppShell'
import { getExperiment, updateExperiment } from '@/lib/experiments/client'
import type { Experiment } from '@/lib/experiments/types'

const DECISION_OPTIONS = [
  'Full implementation',
  'Implement with monitoring',
  'Iterate the experiment',
  'Keep control (no change)',
  'Revert',
  'Investigate further',
]

type OutcomeState = { decision: string; details: string }

const DEFAULT_VALIDATED: OutcomeState = {
  decision: 'Full implementation',
  details: 'Ship to 100% of traffic across all tenants.',
}
const DEFAULT_NO_DIFFERENCE: OutcomeState = {
  decision: 'Keep control (no change)',
  details: 'Keep the current experience; do not re-test for two quarters.',
}
const DEFAULT_NOT_VALIDATED: OutcomeState = {
  decision: 'Revert',
  details: 'Revert and investigate the friction in the flow.',
}

const SCENARIO_CARDS = [
  {
    key: 'validated' as const,
    label: 'If validated',
    dotColor: '#1f7a4d',
  },
  {
    key: 'noDifference' as const,
    label: 'If no significant difference',
    dotColor: '#847460',
  },
  {
    key: 'notValidated' as const,
    label: 'If not validated',
    dotColor: '#ba1a1a',
  },
]

export function DecisionProtocolPage({ id }: { id: string }) {
  const router = useRouter()
  const [experiment, setExperiment] = useState<Experiment | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [saving, setSaving] = useState(false)

  const [validated, setValidated] = useState<OutcomeState>(DEFAULT_VALIDATED)
  const [noDifference, setNoDifference] = useState<OutcomeState>(DEFAULT_NO_DIFFERENCE)
  const [notValidated, setNotValidated] = useState<OutcomeState>(DEFAULT_NOT_VALIDATED)

  useEffect(() => {
    let active = true
    getExperiment(id)
      .then((exp) => {
        if (!active) return
        setExperiment(exp)
        if (exp.summary?.decisionProtocol) {
          setValidated(exp.summary.decisionProtocol.validated)
          setNoDifference(exp.summary.decisionProtocol.noDifference)
          setNotValidated(exp.summary.decisionProtocol.notValidated)
        }
      })
      .catch(() => active && setNotFound(true))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [id])

  async function handleContinue() {
    setSaving(true)
    try {
      await updateExperiment(id, {
        summary: {
          decisionProtocolCaptured: true,
          decisionProtocol: { validated, noDifference, notValidated },
        },
      })
      router.push(`/calculator/${id}`)
    } catch (err) {
      console.error('[decision] save failed:', err)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AppShell title="Decision Protocol" flowStep={3}>
        <div className="flex items-center justify-center h-full text-on-surface-variant gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading experiment…
        </div>
      </AppShell>
    )
  }

  if (notFound || !experiment) {
    return (
      <AppShell title="Decision Protocol" flowStep={3}>
        <div className="flex flex-col items-center justify-center h-full gap-3 text-on-surface-variant">
          <p>That experiment could not be found.</p>
          <Link href="/experiments">
            <Button size="sm" className="bg-primary text-white rounded">Back to experiments</Button>
          </Link>
        </div>
      </AppShell>
    )
  }

  const stateMap: Record<'validated' | 'noDifference' | 'notValidated', OutcomeState> = {
    validated,
    noDifference,
    notValidated,
  }

  const setterMap: Record<
    'validated' | 'noDifference' | 'notValidated',
    (v: OutcomeState) => void
  > = {
    validated: setValidated,
    noDifference: setNoDifference,
    notValidated: setNotValidated,
  }

  const strategicInitiative = experiment.summary?.theme
    ? `${experiment.summary.theme}${experiment.summary.valueStream ? ' · ' + experiment.summary.valueStream : ''}`
    : null

  return (
    <AppShell
      title={experiment.name}
      subtitle={`${experiment.draftId} · Decision protocol`}
      flowStep={3}
      actions={
        <Button
          size="sm"
          onClick={handleContinue}
          disabled={saving}
          className="bg-primary text-white hover:bg-primary/90 rounded gap-1.5"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          {saving ? 'Saving…' : 'Continue to Power Calculator'}
          {!saving && <ArrowRight className="w-3.5 h-3.5" />}
        </Button>
      }
    >
      <div className="max-w-4xl mx-auto px-8 py-10 flex flex-col gap-6">
        {/* Page heading */}
        <header>
          <h2 className="font-display font-extrabold text-3xl tracking-tight mb-2">
            The decision this test informs
          </h2>
          <p className="text-on-surface-variant text-[15px] leading-relaxed">
            Pre-commit your action for every outcome — before you see a single result. Decisions made
            after results are contaminated by hope and politics.
          </p>
        </header>

        {/* 1. Info banner */}
        <div
          className="rounded border border-outline-variant/40 p-5"
          style={{
            background: '#eef3fd',
            borderLeft: '4px solid #4073d7',
          }}
        >
          <p className="font-display font-bold text-sm text-on-surface mb-1.5">
            Why create a Decision Protocol?
          </p>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Decision Protocols document what actions will be taken based on experiment results before
            the experiment runs. This reduces bias, increases accountability, and ensures experiment
            insights drive real business decisions.
          </p>
        </div>

        {/* 2. Context recap card */}
        <div className="bg-surface-container-lowest rounded border border-outline-variant/40 p-6">
          {/* Experiment name + status badge */}
          <div className="flex items-center gap-3 mb-5">
            <span className="font-display font-bold text-lg text-on-surface flex-1">
              {experiment.name}
            </span>
            <span
              className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full"
              style={{ background: '#fff8e7', color: '#9a7b1f', border: '1px solid #e3d3b0' }}
            >
              Planned
            </span>
          </div>

          {/* Key–value list */}
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <dt className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-0.5">
                Experiment ID
              </dt>
              <dd className="text-sm text-on-surface font-medium">{experiment.draftId}</dd>
            </div>

            <div>
              <dt className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-0.5">
                Hypothesis
              </dt>
              <dd className="text-sm text-on-surface font-medium">
                {experiment.blueprint.hypothesis?.specificElement ?? '—'}
              </dd>
            </div>

            <div>
              <dt className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-0.5">
                Primary Metric
              </dt>
              <dd className="text-sm text-on-surface font-medium">
                {experiment.blueprint.primaryMetric ?? '—'}
              </dd>
            </div>

            <div>
              <dt className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-0.5">
                Guardrail Metrics
              </dt>
              <dd className="text-sm text-on-surface font-medium">
                {experiment.blueprint.guardrailMetrics ?? '—'}
              </dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-0.5">
                Strategic Initiative
              </dt>
              <dd className="text-sm font-medium">
                {strategicInitiative ? (
                  <span className="text-on-surface">{strategicInitiative}</span>
                ) : (
                  <span className="text-on-surface-variant italic">No business objective linked.</span>
                )}
              </dd>
            </div>
          </dl>
        </div>

        {/* 3. Decision scenarios */}
        <div>
          <div className="mb-4">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">
              Decision scenarios
            </p>
            <p className="text-[13px] text-on-surface-variant mt-1">
              Document the specific action for every possible outcome — before results exist.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {SCENARIO_CARDS.map(({ key, label, dotColor }) => {
              const state = stateMap[key]
              const setter = setterMap[key]
              return (
                <div
                  key={key}
                  className="bg-surface-container-lowest rounded border border-outline-variant/40 p-5 flex flex-col gap-3"
                >
                  {/* Outcome label + coloured dot */}
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: dotColor }}
                    />
                    <span
                      className="text-[11px] font-extrabold uppercase tracking-wider"
                      style={{ color: dotColor }}
                    >
                      {label}
                    </span>
                  </div>

                  {/* Decision select */}
                  <div>
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-1 block">
                      Decision
                    </label>
                    <select
                      value={state.decision}
                      onChange={(e) => setter({ ...state, decision: e.target.value })}
                      className="w-full bg-white border border-outline-variant rounded px-2 py-2 text-sm text-on-surface"
                    >
                      {DECISION_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Details textarea */}
                  <div>
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-1 block">
                      Details
                    </label>
                    <textarea
                      rows={2}
                      value={state.details}
                      onChange={(e) => setter({ ...state, details: e.target.value })}
                      className="w-full bg-white border border-outline-variant rounded px-3 py-2 text-sm resize-none outline-none focus:border-primary"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 4. Coaching footer note */}
        <p className="text-xs italic text-on-surface-variant leading-relaxed">
          Pre-commitment is the Odysseus move — tie yourself to the mast now, so a 2% lift you hoped
          would be 10% still triggers the action you agreed to.
        </p>
      </div>
    </AppShell>
  )
}
