import type {
  Experiment,
  CreateExperimentInput,
  UpdateExperimentInput,
} from './types'

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Request failed (${res.status}): ${detail}`)
  }
  return res.json() as Promise<T>
}

export async function createExperiment(input: CreateExperimentInput): Promise<Experiment> {
  const res = await fetch('/api/experiments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return (await json<{ experiment: Experiment }>(res)).experiment
}

export async function listExperiments(): Promise<Experiment[]> {
  const res = await fetch('/api/experiments', { cache: 'no-store' })
  return (await json<{ experiments: Experiment[] }>(res)).experiments
}

export async function getExperiment(id: string): Promise<Experiment> {
  const res = await fetch(`/api/experiments/${id}`, { cache: 'no-store' })
  return (await json<{ experiment: Experiment }>(res)).experiment
}

export async function updateExperiment(id: string, patch: UpdateExperimentInput): Promise<Experiment> {
  const res = await fetch(`/api/experiments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
  return (await json<{ experiment: Experiment }>(res)).experiment
}

export async function deleteExperiment(id: string): Promise<void> {
  const res = await fetch(`/api/experiments/${id}`, { method: 'DELETE' })
  await json<{ ok: true }>(res)
}
