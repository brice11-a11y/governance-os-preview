import { appendFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import type { CoachInvocationAuditEvent } from './types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// On serverless (Vercel) the deployment filesystem is read-only except /tmp.
// Fall back to /tmp there so audit writes never crash a request.
const AUDIT_PATH = process.env.VERCEL
  ? join('/tmp', 'audit.jsonl')
  : join(__dirname, '..', '..', 'data', 'audit.jsonl')

let initialized = false

async function ensureDir(): Promise<void> {
  if (initialized) return
  const dir = dirname(AUDIT_PATH)
  if (!existsSync(dir)) await mkdir(dir, { recursive: true })
  initialized = true
}

/**
 * Append one audit event to the local JSONL log. Returns the generated audit_id.
 * Best-effort: a write failure is logged but never throws, so it can't break a request.
 */
export async function writeAudit(
  event: Omit<CoachInvocationAuditEvent, 'audit_id'>,
): Promise<string> {
  const audit_id = randomUUID()
  try {
    await ensureDir()
    const line = JSON.stringify({ audit_id, ...event }) + '\n'
    await appendFile(AUDIT_PATH, line, 'utf-8')
  } catch (err) {
    console.warn('[audit] write failed (non-fatal):', (err as Error).message)
  }
  return audit_id
}
