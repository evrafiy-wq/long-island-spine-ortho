import Link from 'next/link'
import { KIND_LABELS, STATUS_LABELS } from '@/lib/admin/status'
import { cx } from '@/lib/cx'
import { formatLongDate, formatTimestamp } from '@/lib/forms/dates'
import { formatPhone } from '@/lib/forms/phone'
import type { Submission } from '@/lib/submissions/types'

const CELL = 'border-b border-hairline px-3 py-3 text-left align-top'

function StatusPill({ status }: { status: Submission['status'] }) {
  return (
    <span
      className={cx(
        'inline-block rounded-control border px-2 py-1 text-label uppercase',
        status === 'new' && 'border-accent text-accent',
        status === 'contacted' && 'border-border-strong text-ink',
        status === 'scheduled' && 'border-border-strong text-ink',
        status === 'closed' && 'border-hairline text-ink-muted',
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

/**
 * The inbox list.
 *
 * A real `<table>`, because this is tabular data and a grid of divs would
 * throw away the row/column relationships a screen reader uses to say "Phone,
 * (516) 433-1100" instead of reading a wall of disconnected values.
 *
 * The horizontal scroll container is `tabIndex={0}` with a `role="region"` and
 * a label. Browsers do not make an overflowing element keyboard-scrollable on
 * its own, so without that, a keyboard user on a narrow window can see the
 * first three columns and reach nothing else. That pattern is also what makes
 * the scroll area announce itself rather than being a silent trap.
 *
 * NO NOTES COLUMN, and that is deliberate. The patient's free text is the one
 * field likely to hold clinical detail; it is decrypted only on the detail
 * view, for one record at a time, and that view is audited. A column of it
 * here would put twenty-five patients' notes on one screen behind one page
 * load.
 */
export function SubmissionTable({ rows }: { rows: readonly Submission[] }) {
  if (rows.length === 0) {
    return (
      <p className="py-16 text-center text-body text-ink-muted">Nothing matches those filters.</p>
    )
  }

  return (
    <div
      role="region"
      aria-labelledby="submissions-caption"
      tabIndex={0}
      className="overflow-x-auto"
    >
      <table className="w-full min-w-[56rem] text-meta">
        <caption id="submissions-caption" className="sr-only">
          Submissions, newest first
        </caption>
        <thead>
          <tr>
            <th scope="col" className={cx(CELL, 'text-label text-ink-muted uppercase')}>
              Received
            </th>
            <th scope="col" className={cx(CELL, 'text-label text-ink-muted uppercase')}>
              Name
            </th>
            <th scope="col" className={cx(CELL, 'text-label text-ink-muted uppercase')}>
              Phone
            </th>
            <th scope="col" className={cx(CELL, 'text-label text-ink-muted uppercase')}>
              Type
            </th>
            <th scope="col" className={cx(CELL, 'text-label text-ink-muted uppercase')}>
              About
            </th>
            <th scope="col" className={cx(CELL, 'text-label text-ink-muted uppercase')}>
              Preferred
            </th>
            <th scope="col" className={cx(CELL, 'text-label text-ink-muted uppercase')}>
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="transition-state hover:bg-surface">
              <td className={cx(CELL, 'whitespace-nowrap text-ink-muted')}>
                {formatTimestamp(row.createdAt)}
              </td>
              <th scope="row" className={cx(CELL, 'font-normal')}>
                {/*
                  The link is on the name, not on the row. A whole-row click
                  handler cannot be reached by keyboard and cannot be
                  middle-clicked into a new tab; a real anchor does both, and
                  the accessible name is the thing you were looking for anyway.
                */}
                <Link
                  href={`/admin/${row.id}`}
                  className="font-display text-subtitle tracking-tight text-ink underline underline-offset-4 transition-state hover:text-accent"
                >
                  {row.fullName}
                </Link>
                <span className="block pt-1 text-meta text-ink-muted">{row.reference}</span>
              </th>
              <td className={cx(CELL, 'whitespace-nowrap')}>
                {row.phone ? (
                  <a
                    href={`tel:${row.phone}`}
                    className="text-accent underline underline-offset-4 transition-state hover:text-accent-hover"
                  >
                    {formatPhone(row.phone)}
                  </a>
                ) : (
                  <span className="text-ink-muted">—</span>
                )}
              </td>
              <td className={cx(CELL, 'text-ink-muted')}>{KIND_LABELS[row.kind]}</td>
              <td className={CELL}>{row.subject}</td>
              <td className={cx(CELL, 'text-ink-muted')}>
                {row.preferredDate ? formatLongDate(row.preferredDate) : '—'}
              </td>
              <td className={CELL}>
                <StatusPill status={row.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
