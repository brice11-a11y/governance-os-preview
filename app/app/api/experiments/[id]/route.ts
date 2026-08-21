import { NextResponse, type NextRequest } from 'next/server'
import { getExperiment, updateExperiment, deleteExperiment } from '@/lib/db/store'
import type { UpdateExperimentInput } from '@/lib/experiments/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, ctx: RouteContext<'/api/experiments/[id]'>) {
  const { id } = await ctx.params
  const experiment = await getExperiment(id)
  if (!experiment) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ experiment })
}

export async function PATCH(request: NextRequest, ctx: RouteContext<'/api/experiments/[id]'>) {
  const { id } = await ctx.params

  let body: UpdateExperimentInput
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const experiment = await updateExperiment(id, body)
  if (!experiment) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ experiment })
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<'/api/experiments/[id]'>) {
  const { id } = await ctx.params
  const ok = await deleteExperiment(id)
  if (!ok) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
