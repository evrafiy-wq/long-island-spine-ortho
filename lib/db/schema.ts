import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import type { AdapterAccountType } from 'next-auth/adapters'

/**
 * The whole database.
 *
 * Four Auth.js tables, one submissions table, one audit table. There is no
 * patient table, no account table for patients, no clinical data model and no
 * medical record — that absence is the design, not an omission. Scope was set
 * as "clearly outside HIPAA-regulated PHI storage where possible", and the
 * only structure capable of holding free clinical text is a single encrypted
 * column that the form actively discourages anyone from filling in.
 *
 * ONE submissions table, not two.
 *
 * Appointment requests and general enquiries differ by four nullable columns
 * and share everything that actually has behaviour: the inbox, the status
 * workflow, search, CSV export, the audit trail and the purge job. Splitting
 * them would duplicate all six and leave the admin inbox unioning two tables
 * to sort one list by date.
 */

export const submissionKind = pgEnum('submission_kind', ['appointment', 'contact'])
export const submissionStatus = pgEnum('submission_status', [
  'new',
  'contacted',
  'scheduled',
  'closed',
])

export type SubmissionKind = (typeof submissionKind.enumValues)[number]
export type SubmissionStatus = (typeof submissionStatus.enumValues)[number]

export const submissions = pgTable(
  'submissions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    kind: submissionKind('kind').notNull(),
    status: submissionStatus('status').notNull().default('new'),

    fullName: text('full_name').notNull(),
    email: text('email').notNull(),
    /** E.164, e.g. `+15164331100`. Required on appointments, optional on enquiries. */
    phone: text('phone'),

    /**
     * The reason for visit, or the enquiry topic. One column because it is one
     * slot — "what is this about" — and the admin inbox sorts a single list.
     * Which vocabulary applies is determined by `kind`.
     */
    subject: text('subject').notNull(),

    /** Appointment only. `mode: 'string'` keeps it a plain YYYY-MM-DD with no
     *  timezone shifting between Postgres, Node and the browser. */
    preferredDate: text('preferred_date'),
    /** Appointment only. An id from `practice.appointmentTimeWindows`. */
    preferredTimeWindow: text('preferred_time_window'),
    referringPhysician: text('referring_physician'),
    insuranceCarrier: text('insurance_carrier'),

    /**
     * The patient's free-text box, ENCRYPTED. Never written or read directly —
     * go through lib/submissions/repository.ts, which is the only module that
     * calls lib/crypto/field.ts. Ciphertext here means a database dump, a
     * leaked read-replica or a support engineer with console access does not
     * hand over the one field a patient might have typed symptoms into.
     */
    notesEncrypted: text('notes_encrypted'),

    /**
     * Staff-written internal notes, ENCRYPTED for the same reason and more
     * so: notes a receptionist writes about a caller are likelier to be
     * clinical than anything the patient typed.
     */
    internalNotesEncrypted: text('internal_notes_encrypted'),

    /**
     * A salted one-way hash of the submitter's IP, never the address itself.
     * Enough to recognise a flood coming from one source; useless for locating
     * a patient, and nothing to disclose in a breach. See lib/security/hash.ts.
     */
    ipHash: text('ip_hash'),

    /** 'verified' | 'unverified' | 'skipped' — see lib/security/turnstile.ts. */
    botCheck: text('bot_check'),

    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),

    /**
     * Set when the status becomes `closed`, cleared if it is reopened. The
     * ninety-day purge measures from HERE, not from `created_at`: retention
     * runs from the end of the practice's business with a request, so an open
     * request is never deleted out from under the staff member working it.
     * The cron route reports long-open requests so they cannot be forgotten.
     */
    closedAt: timestamp('closed_at', { withTimezone: true, mode: 'date' }),
  },
  (table) => [
    // The inbox default: newest first, optionally filtered by status.
    index('submissions_created_at_idx').on(table.createdAt),
    index('submissions_status_created_at_idx').on(table.status, table.createdAt),
    // The purge job's scan.
    index('submissions_closed_at_idx').on(table.closedAt),
  ],
)

export type SubmissionRow = typeof submissions.$inferSelect
export type NewSubmissionRow = typeof submissions.$inferInsert

/**
 * Who looked at what, and who changed what.
 *
 * `submissionId` is intentionally NOT a foreign key. The purge deletes rows
 * from `submissions`, and a cascade would erase the record that they existed
 * and were handled — which is the one thing an audit trail must survive. The
 * log keeps the id as a bare value plus a snapshot of the patient's name in
 * `detail`, so a purged submission still reads as a coherent history.
 */
export const adminAuditLog = pgTable(
  'admin_audit_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    /** The signed-in address from the allowlist, or 'system' for the cron job. */
    actorEmail: text('actor_email').notNull(),
    /** e.g. 'submission.view', 'submission.status_change', 'submissions.export'. */
    action: text('action').notNull(),
    submissionId: uuid('submission_id'),
    detail: jsonb('detail').$type<Record<string, unknown>>(),
    ipHash: text('ip_hash'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    index('admin_audit_log_created_at_idx').on(table.createdAt),
    index('admin_audit_log_submission_idx').on(table.submissionId),
  ],
)

export type AuditRow = typeof adminAuditLog.$inferSelect

/* ---------------------------------------------------------------------------
 * Auth.js tables.
 *
 * Shapes are dictated by @auth/drizzle-adapter — the column names are its
 * camelCase ones, not this project's snake_case, because the adapter maps by
 * property name and renaming them breaks it silently at runtime.
 *
 * `sessions` is unused day to day: the session strategy is JWT so that the
 * edge middleware can authorise /admin without a database round trip on every
 * request. The table still has to exist, because the adapter's interface
 * requires it. `verificationTokens` is the one that matters — it is where a
 * magic link actually lives between being emailed and being clicked.
 * ------------------------------------------------------------------------ */

export const users = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
})

export const accounts = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (table) => [primaryKey({ columns: [table.provider, table.providerAccountId] })],
)

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.identifier, table.token] })],
)
