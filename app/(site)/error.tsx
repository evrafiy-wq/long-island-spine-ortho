'use client'

import { useEffect } from 'react'
import { Glyph } from '@/components/site/Glyph'
import { UI } from '@/components/site/icons'
import { practice } from '@/content/practice'

/**
 * The 500 page for every public route.
 *
 * One boundary at the route-group level rather than seven identical files —
 * an `error.tsx` catches everything rendered beneath it, so this covers all
 * current pages and every page added later without anyone remembering to.
 * Errors thrown by the LAYOUT itself escape upwards to app/global-error.tsx,
 * which is the other half of the pair.
 *
 * It renders inside the chrome, so the sticky action bar and its phone number
 * are still there. That is the entire point of handling this case rather than
 * letting Next show its default: a patient who hits a server error on a
 * surgeon's website should be one tap from the office, not looking at a stack
 * trace placeholder.
 *
 * `digest` is shown deliberately. Next replaces the real message with an opaque
 * hash in production, and it is the only string that connects what the patient
 * saw to a line in the server logs — worth the small ugliness when someone
 * rings the office to report it.
 */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[site] Unhandled error:', error)
  }, [error])

  const { phone } = practice.contact

  return (
    <section className="block-y">
      <div className="measure">
        <p className="text-label text-ink-muted uppercase">Something went wrong</p>
        <h1 className="max-w-[20ch] pt-6 font-display text-display text-balance text-ink">
          This page did not load.
        </h1>
        <p className="max-w-lede pt-7 text-lede text-ink-muted">
          The problem is on our side, not yours. Trying again often works. If it does not, the
          office is open Monday to Friday and our staff can help you directly.
        </p>

        <div className="flex flex-wrap items-center gap-5 pt-10">
          <button
            type="button"
            onClick={reset}
            className="flex min-h-[3.25rem] items-center gap-3 rounded-control bg-accent px-5 text-meta font-semibold text-on-accent transition-state hover:bg-accent-hover"
          >
            Try again
            <Glyph as={UI.arrowRight} />
          </button>

          <a
            href={phone.href}
            className="flex min-h-[3.25rem] items-center gap-3 rounded-control border border-border-strong px-5 font-display text-subtitle tracking-tight text-ink transition-state hover:text-accent"
          >
            <Glyph as={UI.phone} />
            {phone.display}
          </a>
        </div>

        <p className="pt-8 text-meta text-ink-muted">{practice.emergencyNotice}</p>

        {error.digest ? (
          <p className="pt-6 text-meta text-ink-muted">
            If you call about this, mention reference{' '}
            <span className="font-semibold text-ink">{error.digest}</span>.
          </p>
        ) : null}
      </div>
    </section>
  )
}
