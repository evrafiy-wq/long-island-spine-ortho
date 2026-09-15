import 'server-only'
import { randomUUID } from 'node:crypto'
import { digitsOnly } from '@/lib/forms/phone'
import type {
  AuditEntry,
  ListQuery,
  SubmissionRecord,
  SubmissionStore,
} from '@/lib/submissions/types'

/**
 * In-process store for the Playwright harness.
 *
 * Selected only when `isE2E` is true, which lib/env.ts pins to
 * `NODE_ENV !== 'production'` — a production bundle cannot reach this module's
 * behaviour no matter what is in the environment. See the note on `isE2E`.
 *
 * It exists so the end-to-end tests exercise the REAL Server Action, the real
 * Zod schema, the real honeypot and rate-limit checks and the real encryption
 * — everything except the network calls to Postgres and Resend. A test that
 * stubbed the action itself would pass while the thing it is meant to protect
 * was broken.
 *
 * State is per process and vanishes on restart. That is correct for a test
 * double and disqualifying for anything else.
 */

const records = new Map<string, SubmissionRecord>()
const auditEntries: AuditEntry[] = []

function matches(record: SubmissionRecord, query: ListQuery): boolean {
  if (query.status && record.status !== query.status) return false
  if (query.kind && record.kind !== query.kind) return false

  const search = query.search?.trim()
  if (!search) return true

  const digits = digitsOnly(search)
  const byName = record.fullName.toLowerCase().includes(search.toLowerCase())
  const byPhone = digits.length >= 3 && (record.phone ?? '').includes(digits)
  return byName || byPhone
}

export const memoryStore: SubmissionStore = {
  async create(record) {
    const now = new Date()
    const row: SubmissionRecord = {
      ...record,
      id: randomUUID(),
      status: 'new',
      createdAt: now,
      updatedAt: now,
      closedAt: null,
    }
    records.set(row.id, row)
    return row
  },

  async list(query) {
    const all = [...records.values()]
      .filter((record) => matches(record, query))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return { rows: all.slice(query.offset, query.offset + query.limit), total: all.length }
  },

  async get(id) {
    return records.get(id) ?? null
  },

  async update(id, patch, audit) {
    const existing = records.get(id)
    if (!existing) return null

    const updated: SubmissionRecord = { ...existing, ...patch, updatedAt: new Date() }
    records.set(id, updated)
    auditEntries.push({
      ...audit,
      submissionId: audit.submissionId ?? id,
      id: randomUUID(),
      createdAt: new Date(),
    })
    return updated
  },

  async purgeClosedBefore(cutoff, longOpenBefore) {
    let deleted = 0
    for (const [id, record] of records) {
      if (record.status === 'closed' && record.closedAt && record.closedAt < cutoff) {
        records.delete(id)
        deleted += 1
      }
    }

    const longOpen = [...records.values()].filter(
      (record) => record.closedAt === null && record.createdAt < longOpenBefore,
    ).length

    return { deleted, cutoff, longOpen }
  },

  async recordAudit(entry) {
    auditEntries.push({ ...entry, id: randomUUID(), createdAt: new Date() })
  },

  async auditForSubmission(submissionId, limit) {
    return auditEntries
      .filter((entry) => entry.submissionId === submissionId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
  },
}

/** Test-only reset hook, used between Playwright specs. */
export function resetMemoryStore(): void {
  records.clear()
  auditEntries.length = 0
}
