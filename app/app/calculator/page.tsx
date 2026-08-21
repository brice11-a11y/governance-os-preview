'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, ArrowRight, Calculator, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppShell } from '@/components/layout/AppShell'
import { listExperiments } from '@/lib/experiments/client'
import { STATUS_LABEL, type Experiment } from '@/lib/experiments/types'

export default function CalculatorIndexPage() {
  const [experiments, setExperiments] = useState<Experiment[] | null>(null)

  useEffect(() => {
    listExperiments().then(setExperiments).catch(() => setExperiments([]))
  }, [])

  return (
    <AppShell title="Power Calculator" subtitle="Pick an experiment to size" flowStep={2}>
      <div className="max-w-3xl mx-auto px-8 py-10">
        {experiments === null ? (
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : experiments.length === 0 ? (
          <div className="flex flex-col items-center text-center gap-4 py-16">
            <span className="w-12 h-12 rounded bg-surface-container-high flex items-center justify-center">
              <Calculator className="w-6 h-6 text-on-surface-variant" />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold text-on-surface">No experiments to size yet</h2>
              <p className="text-sm text-on-surface-variant mt-1 max-w-sm">
                Draft a hypothesis with the Coach first — it hands off here with your expected lift pre-filled as the MDE.
              </p>
            </div>
            <Link href="/coach">
              <Button size="sm" className="bg-primary text-white rounded gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" /> Start with the Coach
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-wider text-on-surface-variant mb-1">Select an experiment</p>
            {experiments.map((exp) => (
              <Link
                key={exp.id}
                href={`/calculator/${exp.id}`}
                className="group flex items-center justify-between gap-4 bg-surface-container-lowest hover:bg-surface-container rounded p-4 border border-outline-variant/40 transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-on-surface truncate">{exp.name}</div>
                  <div className="text-[11px] text-on-surface-variant mt-0.5">
                    {exp.draftId} · {STATUS_LABEL[exp.status]}
                    {exp.power?.runtimeDays ? ` · ~${exp.power.runtimeDays}d runtime` : ''}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-on-surface-variant group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
