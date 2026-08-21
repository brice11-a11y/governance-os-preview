import { promises as fs } from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import type {
  Experiment,
  CreateExperimentInput,
  UpdateExperimentInput,
} from '@/lib/experiments/types'
import { computePower } from '@/lib/experiments/power'

/**
 * File-backed experiment repository.
 *
 * This is the V1 persistence layer: a single JSON document on disk under
 * `.data/`. It is deliberately behind a small repository interface so it can be
 * swapped for SQLite/Postgres later without touching any caller. All access goes
 * through a serialized read-modify-write queue so concurrent route handlers
 * never clobber each other.
 */

const DATA_DIR = path.join(process.cwd(), '.data')
const DB_FILE = path.join(DATA_DIR, 'experiments.json')

type Db = { experiments: Experiment[] }

let writeQueue: Promise<unknown> = Promise.resolve()

async function readDb(): Promise<Db> {
  try {
    const raw = await fs.readFile(DB_FILE, 'utf8')
    const parsed = JSON.parse(raw) as Db
    if (!parsed.experiments) return { experiments: [] }
    return parsed
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return { experiments: [] }
    throw err
  }
}

async function writeDb(db: Db): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true })
  const tmp = `${DB_FILE}.${randomUUID()}.tmp`
  await fs.writeFile(tmp, JSON.stringify(db, null, 2), 'utf8')
  await fs.rename(tmp, DB_FILE) // atomic swap
}

/** Serialize all mutations so interleaved requests can't lose writes. */
function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(fn, fn)
  writeQueue = run.then(() => undefined, () => undefined)
  return run
}

function now(): string {
  return new Date().toISOString()
}

export async function listExperiments(): Promise<Experiment[]> {
  const db = await readDb()
  return [...db.experiments].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
}

export async function getExperiment(id: string): Promise<Experiment | null> {
  const db = await readDb()
  return db.experiments.find((e) => e.id === id) ?? null
}

export async function createExperiment(input: CreateExperimentInput): Promise<Experiment> {
  return enqueue(async () => {
    const db = await readDb()
    const ts = now()
    const experiment: Experiment = {
      id: randomUUID(),
      draftId: input.draftId,
      name: input.name,
      status: 'draft',
      blueprint: input.blueprint,
      owner: input.owner ?? 'You',
      createdAt: ts,
      updatedAt: ts,
    }
    db.experiments.push(experiment)
    await writeDb(db)
    return experiment
  })
}

export async function updateExperiment(
  id: string,
  patch: UpdateExperimentInput,
): Promise<Experiment | null> {
  return enqueue(async () => {
    const db = await readDb()
    const idx = db.experiments.findIndex((e) => e.id === id)
    if (idx === -1) return null

    const prev = db.experiments[idx]
    let power = patch.power ?? prev.power
    // Always recompute derived power outputs server-side so the stored numbers
    // can't drift from the canonical formula.
    if (power) {
      const result = computePower(power)
      power = {
        ...power,
        perVariantSample: result?.perVariantSample,
        totalSample: result?.totalSample,
        runtimeDays: result?.runtimeDays,
      }
    }

    const next: Experiment = {
      ...prev,
      name: patch.name ?? prev.name,
      status: patch.status ?? prev.status,
      blueprint: patch.blueprint ?? prev.blueprint,
      power,
      summary: patch.summary ? ({ ...prev.summary, ...patch.summary } as Experiment['summary']) : prev.summary,
      updatedAt: now(),
    }
    db.experiments[idx] = next
    await writeDb(db)
    return next
  })
}

export async function deleteExperiment(id: string): Promise<boolean> {
  return enqueue(async () => {
    const db = await readDb()
    const before = db.experiments.length
    db.experiments = db.experiments.filter((e) => e.id !== id)
    if (db.experiments.length === before) return false
    await writeDb(db)
    return true
  })
}
