import 'server-only'
import { decryptOptional, encryptOptional } from '@/lib/crypto/field'
import { isE2E } from '@/lib/env'
import { memoryStore } from '@/lib/submissions/memoryStore'
import { pgStore } from '@/lib/submissions/pgStore'
import type {
  AuditEntry,
  AuditEntryInput,
  CreateSubmissionInput,
  ListQuery,
  ListResult,
  PurgeResult,
  Submission,
  SubmissionRecord,
  SubmissionStatus,
} from '@/lib/submissions/types'

/**
 * The only module that reads or writes submissions.
 *
 * Two jobs, and nothing else lives here:
 *
 *  1. It picks the store. Postgres normally; the in-process double under the
 *     Playwright harness. Every caller above this line is identical either way,
 *     which is what makes the end-to-end tests worth running.
 *
 *  2. It is the encryption boundary. Plaintext exists above this module and
 *     ciphertext below it, and the crossing happens in `toSubmission` and in
 *     the two `encryptOptional` calls. That is the whole surface —
 *     `grep -rn 'crypto/field' lib app` returns this file and the module it
 *     imports, and nothing else.
 */

const store = isE2E ? memoryStore : pgStore

/** Retention for closed submissions, measured from `closedAt`. */
export const RETENTION_DAYS = 90

/** Threshold for the "still open after this long" warning in the purge report. */
const LONG_OPEN_DAYS = 365

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Guard before every lookup by id.
 *
 * `/admin/not-a-uuid` would otherwise reach Postgres and come back as a driver
 * error — a 500 where the honest answer is 404.
 */
export function isSubmissionId(value: string): boolean {
  return UUID.test(value)
}

export function referenceFor(id: string): string {
  return id.slice(0, 8).toUpperCase()
}

function toSubmission(record: SubmissionRecord): Submission {
  const { notesEncrypted, internalNotesEncrypted, ...rest } = record
  return {
    ...rest,
    reference: referenceFor(record.id),
    notes: decryptOptional(notesEncrypted),
    internalNotes: decryptOptional(internalNotesEncrypted),
  }
}

export async function createSubmission(input: CreateSubmissionInput): Promise<Submission> {
  const record = await store.create({
    kind: input.kind,
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    subject: input.subject,
    preferredDate: input.preferredDate ?? null,
    preferredTimeWindow: input.preferredTimeWindow ?? null,
    referringPhysician: input.referringPhysician ?? null,
    insuranceCarrier: input.insuranceCarrier ?? null,
    notesEncrypted: encryptOptional(input.notes),
    internalNotesEncrypted: null,
    ipHash: input.ipHash,
    botCheck: input.botCheck,
  })

  return toSubmission(record)
}

export async function listSubmissions(query: ListQuery): Promise<ListResult> {
  const { rows, total } = await store.list(query)
  return { rows: rows.map(toSubmission), total }
}

export async function getSubmission(id: string): Promise<Submission | null> {
  if (!isSubmissionId(id)) return null
  const record = await store.get(id)
  return record ? toSubmission(record) : null
}

/**
 * Status change, audited in the same transaction.
 *
 * `closedAt` is derived here rather than being passed in, because the ninety-
 * day purge keys off it and a caller that forgot to set it would silently
 * exempt the row from retention forever. Reopening a closed submission clears
 * it, which restarts the clock — correct, since the practice's business with
 * the request has resumed.
 */
export async function setSubmissionStatus(
  id: string,
  status: SubmissionStatus,
  actor: { email: string; ipHash: string | null },
  previousStatus: SubmissionStatus,
): Promise<Submission | null> {
  if (!isSubmissionId(id)) return null

  const record = await store.update(
    id,
    { status, closedAt: status === 'closed' ? new Date() : null },
    {
      actorEmail: actor.email,
      action: 'submission.status_change',
      submissionId: id,
      detail: { from: previousStatus, to: status },
      ipHash: actor.ipHash,
    },
  )

  return record ? toSubmission(record) : null
}

/**
 * Staff notes, audited in the same transaction.
 *
 * The audit entry records THAT the notes changed and their length, never the
 * text. An audit log that quoted the note would be a second, unencrypted copy
 * of the most sensitive field in the row, in the one table the purge
 * deliberately does not touch.
 */
export async function setInternalNotes(
  id: string,
  notes: string,
  actor: { email: string; ipHash: string | null },
): Promise<Submission | null> {
  if (!isSubmissionId(id)) return null

  const trimmed = notes.trim()
  const record = await store.update(
    id,
    { internalNotesEncrypted: encryptOptional(trimmed) },
    {
      actorEmail: actor.email,
      action: 'submission.note_change',
      submissionId: id,
      detail: { length: trimmed.length, cleared: trimmed === '' },
      ipHash: actor.ipHash,
    },
  )

  return record ? toSubmission(record) : null
}

export async function recordAudit(entry: AuditEntryInput): Promise<void> {
  try {
    await store.recordAudit(entry)
  } catch (error) {
    /**
     * View auditing must not break the view.
     *
     * The two audited MUTATIONS go through `store.update`, where the audit row
     * is part of the same transaction and a failure fails the whole change.
     * This path is for reads and exports, where refusing to show a
     * receptionist a phone number because a log insert timed out would be the
     * wrong trade. It is logged loudly instead.
     */
    console.error('[audit] Failed to record an audit entry:', entry.action, error)
  }
}

export async function auditForSubmission(id: string, limit = 20): Promise<AuditEntry[]> {
  if (!isSubmissionId(id)) return []
  return store.auditForSubmission(id, limit)
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}

/** Deletes closed submissions past retention. Called only by the cron route. */
export async function purgeClosedSubmissions(): Promise<PurgeResult> {
  return store.purgeClosedBefore(daysAgo(RETENTION_DAYS), daysAgo(LONG_OPEN_DAYS))
}

export type { AuditEntry, ListQuery, PurgeResult, Submission, SubmissionStatus }
