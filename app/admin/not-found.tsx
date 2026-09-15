import Link from 'next/link'

/**
 * 404 inside the inbox.
 *
 * Its own file rather than falling through to app/not-found.tsx, which renders
 * the public marketing chrome — an appointment call-to-action and a footer of
 * patient links is the wrong page to show a member of staff who followed a
 * link to a submission that has since been purged.
 *
 * That is also the likeliest way to arrive here: a bookmark or an email link
 * to a record closed more than ninety days ago, which the retention job has
 * since deleted. The copy says so, because "not found" on its own invites
 * someone to conclude the system lost it.
 */
export default function AdminNotFound() {
  return (
    <div className="measure py-16">
      <h1 className="font-display text-title tracking-tight text-ink">Submission not found</h1>
      <p className="max-w-reading pt-4 text-body text-ink-muted">
        There is no submission at that address. If you followed an older link, the request may have
        been closed and then deleted by the 90-day retention job.
      </p>
      <p className="pt-6">
        <Link
          href="/admin"
          className="text-meta font-semibold text-accent underline underline-offset-4 transition-state hover:text-accent-hover"
        >
          Back to submissions
        </Link>
      </p>
    </div>
  )
}
