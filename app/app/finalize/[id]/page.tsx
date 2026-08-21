'use client'

import { use } from 'react'
import { FinalizePage } from '@/components/finalize/FinalizePage'

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <FinalizePage id={id} />
}
