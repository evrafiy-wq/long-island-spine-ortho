'use client'

import { useEffect } from 'react'

/**
 * Error boundary for the whole admin segment.
 *
 * Says nothing about what failed beyond the digest. The inbox talks to the
 * database and to the decryption key, and a stack trace or a driver message
 * rendered here could put a connection string or a column of patient data on
 * screen — on a machine at a front desk, in a waiting room.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[admin] Unhandled error:', error)
  }, [error])

  return (
    <div className="measure py-16">
      <h1 className="font-display text-title tracking-tight text-ink">Something went wrong</h1>
      <p className="max-w-reading pt-4 text-body text-ink-muted">
        The inbox could not load. This is usually the database being briefly unreachable. Try again;
        if it keeps happening, whoever administers the site will need the reference below.
      </p>

      <button
        type="button"
        onClick={reset}
        className="mt-8 flex min-h-[3.25rem] items-center rounded-control bg-accent px-5 text-meta font-semibold text-on-accent transition-state hover:bg-accent-hover"
      >
        Try again
      </button>

      {error.digest ? (
        <p className="pt-6 text-meta text-ink-muted">
          Reference: <span className="font-semibold text-ink">{error.digest}</span>
        </p>
      ) : null}
    </div>
  )
}
