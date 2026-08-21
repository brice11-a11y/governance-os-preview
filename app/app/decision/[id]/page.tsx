'use client'

import { use } from 'react'
import { DecisionProtocolPage } from '@/components/decision/DecisionProtocolPage'

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <DecisionProtocolPage id={id} />
}
