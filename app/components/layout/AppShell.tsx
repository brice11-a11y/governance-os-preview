'use client'

import type { ReactNode } from 'react'
import { Check } from 'lucide-react'
import { SideNav } from '@/components/coach/SideNav'

const FLOW = ['Hypothesis', 'Alignment', 'Decision', 'Power', 'Summary'] as const

function FlowStepper({ step }: { step: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <div className="flex items-center gap-2">
      {FLOW.map((label, i) => {
        const n = i + 1
        const done = n < step
        const active = n === step
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                className={[
                  'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold transition-colors',
                  done
                    ? 'bg-primary text-white'
                    : active
                      ? 'bg-primary text-white ring-2 ring-primary/20'
                      : 'bg-surface-container-high text-on-surface-variant',
                ].join(' ')}
              >
                {done ? <Check className="w-3 h-3" strokeWidth={3} /> : n}
              </span>
              <span
                className={[
                  'text-xs font-medium hidden sm:inline',
                  active ? 'text-on-surface' : 'text-on-surface-variant',
                ].join(' ')}
              >
                {label}
              </span>
            </div>
            {i < FLOW.length - 1 && <span className="w-6 h-px bg-outline-variant" />}
          </div>
        )
      })}
    </div>
  )
}

export function AppShell({
  title,
  subtitle,
  actions,
  flowStep,
  children,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
  flowStep?: 1 | 2 | 3 | 4 | 5
  children: ReactNode
}) {
  return (
    <div className="h-screen flex bg-surface">
      <SideNav />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="min-h-14 flex items-center justify-between gap-4 px-8 py-2.5 bg-surface flex-shrink-0 border-b border-outline-variant/30">
          <div className="min-w-0">
            <div className="font-display text-sm font-semibold text-on-surface truncate">{title}</div>
            {subtitle && <div className="text-xs text-on-surface-variant truncate">{subtitle}</div>}
          </div>
          <div className="flex items-center gap-5 flex-shrink-0">
            {flowStep && <FlowStepper step={flowStep} />}
            {actions}
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  )
}
