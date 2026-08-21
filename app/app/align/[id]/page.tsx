'use client'

import { use } from 'react'
import { StrategicAlignmentPage } from '@/components/strategic-alignment/StrategicAlignmentPage'

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <StrategicAlignmentPage id={id} />
}
