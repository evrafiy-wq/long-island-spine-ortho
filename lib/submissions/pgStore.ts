import 'server-only'
import { and, count, desc, eq, ilike, isNull, lt, or, type SQL } from 'drizzle-orm'
import { db } from '@/lib/db'
import { adminAuditLog, submissions } from '@/lib/db/schema'
import { digitsOnly } from '@/lib/forms/phone'
import type { AuditEntry, ListQuery, SubmissionStore } from '@/lib/submissions/types'

/** The real store. Ciphertext in, ciphertext out — see types.ts. */

function filters(query: ListQuery): SQL | undefined {
  const clauses: SQL[] = []

  if (query.status) clauses.push(eq(submissions.status, query.status))
  if (query.kind) clauses.push(eq(submissions.kind, query.kind))

  const search = query.search?.trim()
  if (search) {
    /**
     * Name OR phone, from one box.
     *
     * A receptionist holding a phone does not want to pick a search mode
     * first. Digits in the query are matched against the stored E.164 number
     * with the punctuation stripped, so "(516) 433-1100", "516-433-1100" and
     * "4331100" all find the same row; the same string is also matched against
     * the name, case-insensitively, because "5" could plausibly be part of one.
     */
    const digits = digitsOnly(search)
    const byName = ilike(submissions.fullName, `%${search}%`)
    const byPhone = digits.length >= 3 ? ilike(submissions.phone, `%${digits}%`) : undefined
    const combined = byPhone ? or(byName, byPhone) : byName
    if (combined) clauses.push(combined)
  }

  if (clauses.length === 0) return undefined
  return clauses.length === 1 ? clauses[0] : and(...clauses)
}

export const pgStore: SubmissionStore = {
  async create(record) {
    const [row] = await db().insert(submissions).values(record).returning()
    if (!row) throw new Error('Insert returned no row.')
    return row
  },

  async list(query) {
    const where = filters(query)

    // Two statements rather than a window function: the count feeds the
    // pager and the page feeds the table, and Postgres plans them better
    // apart than as one query carrying `count(*) OVER ()` on every row.
    const [rows, totals] = await Promise.all([
      db()
        .select()
        .from(submissions)
        .where(where)
        .orderBy(desc(submissions.createdAt))
        .limit(query.limit)
        .offset(query.offset),
      db().select({ value: count() }).from(submissions).where(where),
    ])

    return { rows, total: totals[0]?.value ?? 0 }
  },

  async get(id) {
    const [row] = await db().select().from(submissions).where(eq(submissions.id, id)).limit(1)
    return row ?? null
  },

  async update(id, patch, audit) {
    /**
     * One `batch`, so the row change and its audit entry are one transaction.
     * The Neon HTTP driver has no interactive transactions, but `batch` maps
     * onto Neon's transaction endpoint, which is exactly the guarantee needed
     * here and nothing more.
     */
    const [updated] = await db().batch([
      db()
        .update(submissions)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(submissions.id, id))
        .returning(),
      db()
        .insert(adminAuditLog)
        .values({
          actorEmail: audit.actorEmail,
          action: audit.action,
          submissionId: audit.submissionId ?? id,
          detail: audit.detail,
          ipHash: audit.ipHash,
        }),
    ])

    return updated[0] ?? null
  },

  async purgeClosedBefore(cutoff, longOpenBefore) {
    const deleted = await db()
      .delete(submissions)
      .where(and(eq(submissions.status, 'closed'), lt(submissions.closedAt, cutoff)))
      .returning({ id: submissions.id })

    const [openTotals] = await db()
      .select({ value: count() })
      .from(submissions)
      .where(and(isNull(submissions.closedAt), lt(submissions.createdAt, longOpenBefore)))

    return { deleted: deleted.length, cutoff, longOpen: openTotals?.value ?? 0 }
  },

  async recordAudit(entry) {
    await db()
      .insert(adminAuditLog)
      .values({
        actorEmail: entry.actorEmail,
        action: entry.action,
        submissionId: entry.submissionId ?? null,
        detail: entry.detail,
        ipHash: entry.ipHash,
      })
  },

  async auditForSubmission(submissionId, limit) {
    const rows = await db()
      .select()
      .from(adminAuditLog)
      .where(eq(adminAuditLog.submissionId, submissionId))
      .orderBy(desc(adminAuditLog.createdAt))
      .limit(limit)

    return rows.map((row): AuditEntry => ({
      id: row.id,
      actorEmail: row.actorEmail,
      action: row.action,
      submissionId: row.submissionId,
      detail: row.detail ?? undefined,
      ipHash: row.ipHash,
      createdAt: row.createdAt,
    }))
  },
}
