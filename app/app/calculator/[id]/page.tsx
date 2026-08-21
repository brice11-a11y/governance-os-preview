'use client'

import { use } from 'react'
import { CalculatorPage } from '@/components/calculator/CalculatorPage'

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <CalculatorPage id={id} />
}
