'use client'

import type { BlueprintState, CarterStepId } from '@/lib/ai/coach'
import { formatHypothesis } from '@/lib/ai/coach'
import { Sparkles, Check, AlertTriangle, Pencil } from 'lucide-react'

type SourceQuality = 'strong' | 'weak' | 'missing'
type StepStatus = 'pending' | 'active' | 'completed' | 'needs-review'

interface PhaseStep {
  id: CarterStepId
  label: string
}

interface ProgressPhase {
  id: 'foundation' | 'hypothesis' | 'method'
  label: string
  steps: PhaseStep[]
}

const PROGRESS_PHASES: ProgressPhase[] = [
  {
    id: 'foundation',
    label: 'Foundation',
    steps: [
      { id: 'idea', label: 'Idea' },
      { id: 'evidence', label: 'Evidence' },
    ],
  },
  {
    id: 'hypothesis',
    label: 'Hypothesis',
    steps: [
      { id: 'variant', label: 'Variant' },
      { id: 'audience', label: 'Audience' },
      { id: 'primary-metric', label: 'Primary Metric' },
      { id: 'expected-lift', label: 'Expected Lift' },
      { id: 'guardrail', label: 'Guardrail' },
    ],
  },
  {
    id: 'method',
    label: 'Method',
    steps: [
      { id: 'methodology', label: 'Methodology' },
      { id: 'timeline', label: 'Timeline' },
    ],
  },
]

function statusFor(
  stepId: CarterStepId,
  currentStepId: CarterStepId | undefined,
  completedStepIds: Set<CarterStepId>,
  needsReviewStepIds: Set<CarterStepId>,
): StepStatus {
  if (needsReviewStepIds.has(stepId)) return 'needs-review'
  if (stepId === currentStepId) return 'active'
  if (completedStepIds.has(stepId)) return 'completed'
  return 'pending'
}

function StatusDot({ status }: { status: StepStatus }) {
  if (status === 'needs-review') {
    return (
      <div className="w-3.5 h-3.5 bg-driftwood flex items-center justify-center rounded-full">
        <AlertTriangle className="w-2 h-2 text-white" strokeWidth={3} />
      </div>
    )
  }
  if (status === 'active') {
    return <div className="w-3.5 h-3.5 bg-tertiary rounded-full" />
  }
  if (status === 'completed') {
    return <div className="w-3.5 h-3.5 bg-primary rounded-full" />
  }
  return <div className="w-3.5 h-3.5 rounded-full border border-outline-variant" />
}

interface Dimension {
  key: string
  label: string
  value: string | undefined
  optional?: boolean
  sourceQuality?: SourceQuality
  editStepId?: CarterStepId
}

interface Props {
  blueprint: BlueprintState
  draftId: string
  isComplete: boolean
  currentStepId: CarterStepId | undefined
  completedStepIds: Set<CarterStepId>
  needsReviewStepIds: Set<CarterStepId>
  onRequestEditStep?: (stepId: CarterStepId) => void
}

export function BlueprintPanel({
  blueprint,
  draftId,
  isComplete,
  currentStepId,
  completedStepIds,
  needsReviewStepIds,
  onRequestEditStep,
}: Props) {
  const dimensions: Dimension[] = [
    { key: 'hypothesis', label: 'Hypothesis', value: hypothesisShortValue(blueprint) },
    {
      key: 'source',
      label: 'Source',
      value: blueprint.source,
      sourceQuality: blueprint.sourceQuality ?? 'missing',
      editStepId: 'evidence',
    },
    { key: 'targetSurface', label: 'Target Surface', value: blueprint.targetSurface, editStepId: 'audience' },
    { key: 'primaryMetric', label: 'Primary Metric', value: blueprint.primaryMetric, editStepId: 'primary-metric' },
    { key: 'guardrailMetrics', label: 'Guardrail Metrics', value: blueprint.guardrailMetrics, editStepId: 'guardrail' },
    { key: 'methodology', label: 'Methodology', value: blueprint.methodology, optional: true, editStepId: 'methodology' },
    { key: 'timeline', label: 'Timeline', value: blueprint.targetTimeline, optional: true, editStepId: 'timeline' },
  ]

  const filledCount = dimensions.filter(d => d.value).length
  const totalSteps = PROGRESS_PHASES.reduce((sum, p) => sum + p.steps.length, 0)
  const completedSteps = PROGRESS_PHASES.reduce(
    (sum, p) => sum + p.steps.filter(s => completedStepIds.has(s.id)).length,
    0,
  )

  return (
    <aside className="w-80 flex-shrink-0 bg-surface-container-low p-5 flex flex-col gap-6 overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg font-semibold text-on-surface tracking-tight">Blueprint</h2>
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">
            {isComplete ? 'Ready' : 'Draft'}
          </span>
        </div>
        <div className="text-[11px] text-on-surface-variant mt-1">Draft ID · {draftId}</div>
      </div>

      <p className="text-sm text-on-surface-variant leading-relaxed">
        Carter fills these dimensions as we chat.
      </p>

      {/* PROGRESS — phases & step dots */}
      <div className="flex flex-col gap-5">
        {PROGRESS_PHASES.map((phase, phaseIdx) => {
          const phaseCompleted = phase.steps.filter(s => completedStepIds.has(s.id)).length
          const phaseTotal = phase.steps.length
          const num = String(phaseIdx + 1).padStart(2, '0')
          return (
            <div key={phase.id} className="flex flex-col gap-2.5">
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-xs font-semibold text-on-surface tabular-nums">{num}</span>
                  <span className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant">
                    {phase.label}
                  </span>
                </div>
                <span className="text-[10px] tabular-nums text-on-surface-variant/60">
                  {phaseCompleted}/{phaseTotal}
                </span>
              </div>
              <div className="flex flex-col gap-2 pl-0.5">
                {phase.steps.map(step => {
                  const status = statusFor(step.id, currentStepId, completedStepIds, needsReviewStepIds)
                  const labelColor =
                    status === 'active'
                      ? 'text-on-surface font-semibold'
                      : status === 'pending'
                        ? 'text-on-surface-variant/70'
                        : 'text-on-surface'
                  return (
                    <div key={step.id} className="flex items-center gap-2.5">
                      <StatusDot status={status} />
                      <span className={`text-sm ${labelColor}`}>{step.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* CAPTURED — dimensions */}
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant">
            Captured
          </span>
          <span className="text-[10px] tabular-nums text-on-surface-variant/60">
            {filledCount}/{dimensions.length}
          </span>
        </div>
        <div className="flex flex-col gap-4">
          {dimensions.map(d => {
            const isSourceWeak = d.key === 'source' && d.value && d.sourceQuality === 'weak'
            return (
              <div key={d.key} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  {d.value ? (
                    isSourceWeak ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-driftwood" strokeWidth={2.5} />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-tertiary" strokeWidth={2.5} />
                    )
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-outline-variant" />
                  )}
                  <span className="text-sm font-medium text-on-surface">{d.label}</span>
                  {d.optional && !d.value && (
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Optional</span>
                  )}
                </div>
                <div className="pl-5">
                  {d.value ? (
                    <>
                      <span className="text-sm text-on-surface-variant leading-snug">{truncate(d.value, 100)}</span>
                      {isSourceWeak && (
                        <div className="mt-1.5 bg-driftwood/15 p-2 rounded">
                          <p className="text-xs text-driftwood leading-relaxed">
                            Add specific numbers or a second source before submission.
                          </p>
                        </div>
                      )}
                      {d.editStepId && onRequestEditStep && (
                        <button
                          type="button"
                          onClick={() => onRequestEditStep(d.editStepId!)}
                          className="mt-1.5 flex items-center gap-1 text-[10px] text-on-surface-variant/60 hover:text-on-surface-variant transition-colors"
                        >
                          <Pencil className="w-2.5 h-2.5" strokeWidth={2} />
                          Change answer
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-on-surface-variant/70 italic">Awaiting input</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {filledCount > 0 && (
        <div className="bg-surface-container-lowest p-4 rounded">
          <div className="text-[10px] font-medium uppercase tracking-widest text-on-surface-variant mb-2">
            Hypothesis preview
          </div>
          <p
            className="text-sm text-on-surface leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderMarkdownInline(formatHypothesis(blueprint)) }}
          />
        </div>
      )}

      <div className="mt-auto bg-surface-container-lowest p-5 flex flex-col items-center text-center rounded">
        <div className="w-10 h-10 bg-surface-container-high flex items-center justify-center mb-3 rounded">
          <Sparkles className="w-5 h-5 text-primary" strokeWidth={1.75} />
        </div>
        <div className="text-sm font-medium text-on-surface tabular-nums">
          {isComplete
            ? 'Ready to score'
            : completedSteps === 0
              ? 'Ready to build'
              : `${completedSteps} / ${totalSteps} steps`}
        </div>
        <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
          {isComplete
            ? 'Submit to Scoring Service for the Go-Live evaluation.'
            : completedSteps === 0
              ? 'Share your idea on the left to get started.'
              : 'Keep going — Carter will assemble the full blueprint.'}
        </p>
      </div>
    </aside>
  )
}

function hypothesisShortValue(b: BlueprintState): string | undefined {
  const h = b.hypothesis
  if (!h.specificElement && !h.goalMetric && !h.specificPercentage) return undefined
  const parts = []
  if (h.specificElement) parts.push(truncate(h.specificElement, 60))
  if (h.specificPercentage) parts.push(`(${h.specificPercentage})`)
  return parts.join(' ')
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + '…' : s
}

function renderMarkdownInline(s: string) {
  return s.replace(/\*\*(.+?)\*\*/g, '<strong class="text-on-surface font-semibold">$1</strong>')
}
