import type { Metadata } from 'next'
import { SignInForm } from '@/components/admin/SignInForm'
import { Glyph } from '@/components/site/Glyph'
import { UI } from '@/components/site/icons'
import { practice } from '@/content/practice'

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false, nocache: true },
}

/**
 * The one page under /admin that the middleware lets through unauthenticated —
 * you cannot sign in from behind the gate that requires you to be signed in.
 *
 * `sent=1` is Auth.js's `verifyRequest` destination, configured in
 * auth.config.ts. It renders the same "check your email" message for an
 * allowlisted address and an unknown one; see the note on `requestSignInLink`.
 */
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; from?: string; error?: string }>
}) {
  const params = await searchParams
  const sent = params.sent === '1'

  return (
    <div className="block-y">
      {/* See the note in components/site/LegalDocument.tsx: `measure` centres,
          so the reading cap goes on a nested element. */}
      <div className="measure">
        <div className="max-w-reading">
          {sent ? (
            <div role="status" className="border border-l-4 border-accent px-6 py-7">
              <p className="flex items-center gap-2 font-display text-title tracking-tight text-ink">
                <Glyph as={UI.check} className="text-accent" />
                Check your email
              </p>
              <p className="pt-4 text-body text-ink-muted">
                If that address is authorised for the inbox, a sign-in link is on its way to it. The
                link works once and expires in 10 minutes.
              </p>
              <p className="pt-4 text-body text-ink-muted">
                Nothing arriving? Check the spam folder, then ask whoever administers the site to
                confirm your address is on the allowlist.
              </p>
            </div>
          ) : (
            <>
              <p className="text-label text-ink-muted uppercase">Staff access</p>
              <h1 className="pt-6 font-display text-display text-balance text-ink">
                Sign in to the patient inbox
              </h1>

              {params.error ? (
                <p
                  role="alert"
                  className="mt-8 border border-l-4 border-danger px-5 py-4 text-body text-ink"
                >
                  That sign-in link did not work. It may have already been used, or it may have
                  expired. Request a new one below.
                </p>
              ) : null}

              <p className="max-w-lede pt-7 text-lede text-ink-muted">
                Access is limited to addresses the practice has authorised.
              </p>

              <div className="pt-10">
                <SignInForm from={params.from} />
              </div>
            </>
          )}

          <p className="mt-10 border-t border-hairline pt-5 text-meta text-ink-muted">
            This page is for practice staff. If you are a patient looking to book, call{' '}
            <a
              href={practice.contact.phone.href}
              className="font-semibold whitespace-nowrap text-accent underline underline-offset-4"
            >
              {practice.contact.phone.display}
            </a>{' '}
            or use the request form on the website.
          </p>
        </div>
      </div>
    </div>
  )
}
