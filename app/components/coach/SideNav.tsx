'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Lightbulb, Calculator, FlaskConical, Plus, type LucideIcon } from 'lucide-react'

type NavItem = { icon: LucideIcon; label: string; href: string; match: (path: string) => boolean }

const NAV_ITEMS: readonly NavItem[] = [
  {
    icon: LayoutDashboard,
    label: 'Experiments',
    href: '/experiments',
    match: (p) => p === '/experiments' || p.startsWith('/experiments/') || p.startsWith('/finalize'),
  },
  {
    icon: Lightbulb,
    label: 'Hypothesis Coach',
    href: '/coach',
    match: (p) => p === '/' || p.startsWith('/coach'),
  },
  {
    icon: Calculator,
    label: 'Power Calculator',
    href: '/calculator',
    match: (p) => p.startsWith('/calculator'),
  },
]

export function SideNav() {
  const pathname = usePathname() ?? '/coach'

  return (
    <nav className="w-56 flex-shrink-0 bg-surface-container-low flex flex-col py-5 px-3 gap-1 border-r border-outline-variant/40">
      <Link href="/experiments" className="px-3 pb-5 flex items-center gap-2.5 group">
        <span className="w-8 h-8 rounded bg-primary flex items-center justify-center flex-shrink-0">
          <FlaskConical className="w-4 h-4 text-white" strokeWidth={2} />
        </span>
        <span className="flex flex-col">
          <span className="font-display text-base font-semibold text-on-surface tracking-tight leading-none">EXP/OS</span>
          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">Governance OS</span>
        </span>
      </Link>

      <Link
        href="/coach"
        className="mx-0 mb-2 flex items-center gap-2 px-3 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <Plus className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
        New experiment
      </Link>

      {NAV_ITEMS.map(({ icon: Icon, label, href, match }) => {
        const active = match(pathname)
        return (
          <Link
            key={label}
            href={href}
            className={[
              'flex items-center gap-3 px-3 py-2 text-sm rounded transition-colors text-left',
              active
                ? 'bg-surface-container-high text-on-surface font-medium'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
            ].join(' ')}
          >
            <Icon className="w-4 h-4" strokeWidth={1.75} />
            {label}
          </Link>
        )
      })}

      <div className="mt-auto px-3 pt-4">
        <div className="text-[10px] text-on-surface-variant/70 uppercase tracking-wider">AirGroup</div>
        <div className="text-[11px] text-on-surface-variant mt-0.5">Digital Hangar · V1</div>
      </div>
    </nav>
  )
}
