import { signOutAction } from '@/app/actions/auth'

/**
 * Sign out, as a form POST rather than a link.
 *
 * A `<a href="/api/auth/signout">` would be a state change behind a GET, which
 * means a prefetcher, a link scanner or an over-eager browser extension can
 * sign a receptionist out mid-task. A form POST also carries the CSRF token
 * Auth.js expects.
 *
 * A Server Component, so no JavaScript is needed for it to work.
 */
export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="min-h-6 text-meta font-semibold text-ink-inv underline underline-offset-4 transition-state hover:text-accent-inv"
      >
        Sign out
      </button>
    </form>
  )
}
