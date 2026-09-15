import type { SubmissionKind, SubmissionStatus } from '@/lib/db/schema'

export type { SubmissionKind, SubmissionStatus }

/**
 * The record as the two stores hold it: free text still ENCRYPTED.
 *
 * Nothing outside lib/submissions/repository.ts sees this shape. Keeping the
 * store layer ciphertext-only is what makes the crypto boundary checkable —
 * there is exactly one module that can turn `notesEncrypted` into words, and
 * `grep -rn 'decryptOptional'` finds it.
 */
export interface SubmissionRecord {
  id: string
  kind: SubmissionKind
  status: SubmissionStatus
  fullName: string
  email: string
  phone: string | null
  subject: string
  preferredDate: string | null
  preferredTimeWindow: string | null
  referringPhysician: string | null
  insuranceCarrier: string | null
  notesEncrypted: string | null
  internalNotesEncrypted: string | null
  ipHash: string | null
  botCheck: string | null
  createdAt: Date
  updatedAt: Date
  closedAt: Date | null
}

/** The decrypted view, which is what the admin UI, emails and CSV all use. */
export interface Submission extends Omit<
  SubmissionRecord,
  'notesEncrypted' | 'internalNotesEncrypted'
> {
  /**
   * First block of the UUID, uppercased. Quotable over the phone so a patient
   * and the front desk can refer to the same request. Not a secret and not a
   * lookup key — the admin routes address rows by their full id.
   */
  reference: string
  notes: string | null
  internalNotes: string | null
}

export interface CreateSubmissionInput {
  kind: SubmissionKind
  fullName: string
  email: string
  phone: string | null
  subject: string
  preferredDate?: string | null
  preferredTimeWindow?: string | null
  referringPhysician?: string | null
  insuranceCarrier?: string | null
  /** Plaintext. The repository encrypts it before it reaches a store. */
  notes?: string | null
  ipHash: string | null
  botCheck: string
}

export interface ListQuery {
  status?: SubmissionStatus
  kind?: SubmissionKind
  /** Matched against the patient's name or their phone number. */
  search?: string
  limit: number
  offset: number
}

export interface ListResult {
  rows: Submission[]
  total: number
}

export interface AuditEntryInput {
  actorEmail: string
  action: string
  submissionId?: string | null
  detail?: Record<string, unknown>
  ipHash?: string | null
}

export interface AuditEntry extends AuditEntryInput {
  id: string
  createdAt: Date
}

export interface PurgeResult {
  /** Rows deleted by this run. */
  deleted: number
  /** Cutoff the run used, echoed back for the audit entry and the response. */
  cutoff: Date
  /**
   * Submissions open for more than a year. Not deleted and not an error — the
   * purge measures from `closedAt`, so anything never closed is never purged.
   * Surfacing the count is what stops that turning into silent indefinite
   * retention of records nobody is working on.
   */
  longOpen: number
}

/** The storage contract. Implemented by pgStore and, for tests, memoryStore. */
export interface SubmissionStore {
  create(
    record: Omit<SubmissionRecord, 'id' | 'createdAt' | 'updatedAt' | 'closedAt' | 'status'>,
  ): Promise<SubmissionRecord>
  list(query: ListQuery): Promise<{ rows: SubmissionRecord[]; total: number }>
  get(id: string): Promise<SubmissionRecord | null>
  /**
   * Applies the patch and writes the audit entry together. One method rather
   * than two calls because on Postgres they go out as a single `db.batch()`,
   * which Neon runs as one transaction — a status change that is not audited,
   * or an audit entry for a change that did not happen, are both worse than a
   * failed update.
   */
  update(
    id: string,
    patch: Partial<Pick<SubmissionRecord, 'status' | 'internalNotesEncrypted' | 'closedAt'>>,
    audit: AuditEntryInput,
  ): Promise<SubmissionRecord | null>
  purgeClosedBefore(cutoff: Date, longOpenBefore: Date): Promise<PurgeResult>
  recordAudit(entry: AuditEntryInput): Promise<void>
  auditForSubmission(submissionId: string, limit: number): Promise<AuditEntry[]>
}
