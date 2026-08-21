import { appendFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import type { CoachInvocationAuditEvent } from './types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const AUDIT_PATH = join(__dirname, '..', '..', 'data', 'audit.jsonl')

let initialized = false

async function ensureDir(): Promise<void> {
  if (initialized) return
  const dir = dirname(AUDIT_PATH)
  if (!existsSync(dir)) await mkdir(dir, { recursive: true })
  initialized = true
}

/**
 * Append one audit event to the local JSONL log. Returns the generated audit_id.
 *
 * V1: local file at `data/audit.jsonl`.
 * Future (BE `03` + Platform/Security `06`): writes to Supabase `audit_events`
 * via the `SECURITY DEFINER` insert function. The on-disk JSONL becomes a
 * fallback/buffer when the Supabase write fails.
 */
export async function writeAudit(
  event: Omit<CoachInvocationAuditEvent, 'audit_id'>,
): Promise<string> {
  await ensureDir()
  const audit_id = randomUUID()
  const line = JSON.stringify({ audit_id, ...event }) + '\n'
  await appendFile(AUDIT_PATH, line, 'utf-8')
  return audit_id
}
