import type { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '@/auth'
import { SignOutButton } from '@/components/admin/SignOutButton'
import { practice } from '@/content/practice'

/**
 * Chrome for the staff inbox.
 *
 * Not `SiteChrome`. This is a different product with a different audience: no
 * marketing navigation, no appointment call-to-action, no footer of patient
 * links. It uses the same design tokens so it does not feel like a bolted-on
 * admin panel, and nothing else.
 *
 * `force-dynamic` because every page under here reads a session cookie and
 * shows patient data. Without it, Next's default static optimisation would try
 * to prerender the inbox at build time — and a cached page of patient names is
 * the single worst failure mode this segment has.
 *
 * `noindex` is declared in three independent places: here in the metadata, in
 * app/robots.ts, and as an `X-Robots-Tag` header set by the middleware. The
 * header is the one that actually covers everything, including the CSV export
 * and the redirect to the sign-in page, neither of which has metadata.
 */
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Patient inbox',
  robots: { index: false, follow: false, nocache: true },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  return (
    <div className="min-h-screen bg-canvas">
      <div className="bg-dark text-ink-inv [--site-focus-color:var(--site-focus-color-on-dark)]">
        <div className="measure flex min-h-14 flex-wrap items-center justify-between gap-x-6 gap-y-2 py-2">
          <p className="text-label text-ink-inv-muted uppercase">{practice.name} · Patient inbox</p>

          {session?.user?.email ? (
            <div className="flex items-center gap-5">
              <p className="text-meta text-ink-inv-muted">{session.user.email}</p>
              <SignOutButton />
            </div>
          ) : null}
        </div>
      </div>

      <header className="border-b border-hairline">
        <div className="measure flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 py-5">
          <Link
            href="/admin"
            className="font-display text-subtitle tracking-tight text-ink transition-state hover:text-accent"
          >
            Submissions
          </Link>
          <Link
            href="/"
            className="text-meta text-ink-muted underline underline-offset-4 transition-state hover:text-accent"
          >
            Back to the website
          </Link>
        </div>
      </header>

      <main id="main-content">{children}</main>
    </div>
  )
}
