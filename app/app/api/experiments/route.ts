import { NextResponse, type NextRequest } from 'next/server'
import { listExperiments, createExperiment } from '@/lib/db/store'
import type { CreateExperimentInput } from '@/lib/experiments/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const experiments = await listExperiments()
  return NextResponse.json({ experiments })
}

export async function POST(request: NextRequest) {
  let body: Partial<CreateExperimentInput>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.draftId || !body.blueprint) {
    return NextResponse.json({ error: 'draftId and blueprint are required' }, { status: 400 })
  }

  const experiment = await createExperiment({
    draftId: body.draftId,
    name: body.name?.trim() || 'Untitled experiment',
    blueprint: body.blueprint,
    owner: body.owner,
  })

  return NextResponse.json({ experiment }, { status: 201 })
}
