import Link from 'next/link'
import { notFound } from 'next/navigation'
import { NotesForm } from '@/components/admin/NotesForm'
import { StatusForm } from '@/components/admin/StatusForm'
import { Glyph } from '@/components/site/Glyph'
import { UI } from '@/components/site/icons'
import { requireAdmin } from '@/lib/admin/session'
import { KIND_LABELS, STATUS_LABELS } from '@/lib/admin/status'
import { timeWindowLabel } from '@/lib/forms/appointment'
import { formatLongDate, formatTimestamp } from '@/lib/forms/dates'
import { formatPhone, telHref } from '@/lib/forms/phone'
import { auditForSubmission, getSubmission, recordAudit } from '@/lib/submissions/repository'

/**
 * One submission.
 *
 * This is the only place the patient's free-text box is decrypted and shown,
 * one record at a time, and the view is audited before it renders. The inbox
 * list deliberately has no notes column for the same reason.
 *
 * The audit trail is shown at the bottom rather than hidden in a database
 * somewhere. A log nobody can see is a log nobody checks — and a receptionist
 * being able to see that a colleague already rang this patient at 9:40 is
 * useful to them, not just to a compliance review.
 */
export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const actor = await requireAdmin()
  const { id } = await params

  const submission = await getSubmission(id)
  if (!submission) notFound()

  await recordAudit({
    actorEmail: actor.email,
    action: 'submission.view',
    submissionId: submission.id,
    detail: { reference: submission.reference, kind: submission.kind },
    ipHash: actor.ipHash,
  })

  const history = await auditForSubmission(submission.id)
  const isAppointment = submission.kind === 'appointment'

  const rows: { term: string; value: React.ReactNode }[] = [
    {
      term: 'Phone',
      value: submission.phone ? (
        <a
          href={telHref(submission.phone)}
          className="text-accent underline underline-offset-4 transition-state hover:text-accent-hover"
        >
          {formatPhone(submission.phone)}
        </a>
      ) : (
        'Not provided'
      ),
    },
    {
      term: 'Email',
      value: (
        <a
          href={`mailto:${submission.email}`}
          className="text-accent underline underline-offset-4 transition-state hover:text-accent-hover"
        >
          {submission.email}
        </a>
      ),
    },
    { term: isAppointment ? 'Reason for visit' : 'Topic', value: submission.subject },
  ]

  if (isAppointment) {
    rows.push(
      {
        term: 'Preferred date',
        value: submission.preferredDate ? formatLongDate(submission.preferredDate) : 'Not given',
      },
      {
        term: 'Preferred time',
        value: submission.preferredTimeWindow
          ? timeWindowLabel(submission.preferredTimeWindow)
          : 'Not given',
      },
      { term: 'Referring physician', value: submission.referringPhysician ?? 'Not given' },
      { term: 'Insurance carrier', value: submission.insuranceCarrier ?? 'Not given' },
    )
  }

  rows.push(
    { term: 'Received', value: formatTimestamp(submission.createdAt) },
    { term: 'Type', value: KIND_LABELS[submission.kind] },
    { term: 'Reference', value: submission.reference },
  )

  return (
    <div className="measure py-10">
      <p className="pb-6">
        <Link
          href="/admin"
          className="inline-flex min-h-10 items-center gap-2 text-meta font-semibold text-accent underline underline-offset-4 transition-state hover:text-accent-hover"
        >
          <Glyph as={UI.arrowLeft} />
          Back to submissions
        </Link>
      </p>

      <h1 className="font-display text-display text-balance text-ink">{submission.fullName}</h1>
      <p className="pt-3 text-meta text-ink-muted">
        {KIND_LABELS[submission.kind]} · {STATUS_LABELS[submission.status]} · {submission.reference}
      </p>

      {/*
        Shown only when the check did not come back clean. Flagging every
        record would train staff to ignore the flag — its whole value is that
        it is rare.
      */}
      {submission.botCheck === 'unverified' ? (
        <p className="mt-7 max-w-reading border border-l-4 border-hairline px-5 py-4 text-meta text-ink-muted">
          The automated spam check did not complete for this submission. That usually means the
          sender had JavaScript turned off, which is normal — but treat it with a little more care
          than usual.
        </p>
      ) : null}

      <div className="grid gap-12 pt-10 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
        <div>
          <h2 className="font-display text-title tracking-tight text-ink">What they sent</h2>

          <dl className="pt-6">
            {rows.map((row) => (
              <div key={row.term} className="border-t border-hairline py-4">
                <dt className="text-label text-ink-muted uppercase">{row.term}</dt>
                <dd className="pt-1.5 text-body text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>

          <h3 className="pt-8 font-display text-subtitle tracking-tight text-ink">
            {isAppointment ? 'Notes from the patient' : 'Message'}
          </h3>
          {/*
            `whitespace-pre-wrap` so line breaks the patient typed survive, and
            `break-words` so an unbroken string cannot push the column wider
            than the viewport on a phone.
          */}
          <p className="max-w-reading pt-3 text-body break-words whitespace-pre-wrap text-ink">
            {submission.notes ?? <span className="text-ink-muted">None.</span>}
          </p>
        </div>

        <div>
          <div className="border border-hairline p-6">
            <StatusForm id={submission.id} status={submission.status} />
          </div>

          <div className="mt-8 border border-hairline p-6">
            <NotesForm id={submission.id} notes={submission.internalNotes} />
          </div>

          <section aria-labelledby="history-heading" className="mt-8">
            <h2 id="history-heading" className="font-display text-subtitle tracking-tight text-ink">
              Access and changes
            </h2>
            <ul className="pt-4">
              {history.length === 0 ? (
                <li className="border-t border-hairline py-3 text-meta text-ink-muted">
                  Nothing recorded yet.
                </li>
              ) : (
                history.map((entry) => (
                  <li key={entry.id} className="border-t border-hairline py-3 text-meta">
                    <p className="text-ink">{describeAudit(entry.action, entry.detail)}</p>
                    <p className="pt-1 text-ink-muted">
                      {entry.actorEmail} · {formatTimestamp(entry.createdAt)}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}

/**
 * Audit actions in English.
 *
 * The stored `action` is a stable machine string so a future query can group
 * on it; this turns it into something a receptionist can read without a
 * lookup table. Unknown actions fall through to the raw value rather than
 * being hidden — a log entry nobody can render is still a log entry.
 */
function describeAudit(action: string, detail?: Record<string, unknown>): string {
  switch (action) {
    case 'submission.view':
      return 'Opened this submission'
    case 'submission.status_change':
      return `Changed the status from ${String(detail?.from)} to ${String(detail?.to)}`
    case 'submission.note_change':
      return detail?.cleared ? 'Cleared the internal notes' : 'Updated the internal notes'
    default:
      return action
  }
}
