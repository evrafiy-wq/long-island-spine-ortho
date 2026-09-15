import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import { authConfig } from '@/auth.config'
import { isAllowlistedAdmin } from '@/lib/admin/allowlist'

/**
 * Gate for the whole /admin segment.
 *
 * Protecting the segment HERE rather than in each page is the difference
 * between a rule and a habit: a new file under app/admin is protected the
 * moment it exists, and nobody has to remember to add a session check to it.
 * The pages still call `requireAdmin()` — see lib/admin/session.ts — because
 * they need the actor's identity for the audit log, and defence in depth on
 * patient data is cheap.
 *
 * Runs on the Edge, which is why it imports `auth.config.ts` (no adapter, no
 * Node built-ins) rather than `auth.ts`. See the note in that file.
 */
const { auth } = NextAuth(authConfig)

/** Public within the protected segment — you cannot sign in from behind a gate. */
const PUBLIC_ADMIN_PATHS = ['/admin/signin']

export default auth((request) => {
  const { pathname } = request.nextUrl

  /**
   * `X-Robots-Tag` on every response from this segment, allowed or denied.
   *
   * A `<meta name="robots">` tag would only cover the HTML pages; this also
   * covers the CSV export and the redirect to the sign-in page. It is set
   * before the authorisation check so a crawler that somehow reaches a
   * redirect still gets the header.
   */
  const noIndex = (response: NextResponse) => {
    response.headers.set('x-robots-tag', 'noindex, nofollow, noarchive, nosnippet')
    return response
  }

  if (PUBLIC_ADMIN_PATHS.includes(pathname)) return noIndex(NextResponse.next())

  /**
   * Both conditions, not just the first. A valid session is not enough — the
   * address on it has to still be on the allowlist, which is read from the
   * environment on every request. Removing someone from `ADMIN_EMAILS` then
   * takes effect on their next click rather than whenever their eight-hour
   * token happens to expire.
   */
  const email = request.auth?.user?.email
  if (!email || !isAllowlistedAdmin(email)) {
    const signIn = new URL('/admin/signin', request.nextUrl.origin)
    // So a bookmarked deep link survives the sign-in round trip.
    if (pathname !== '/admin') signIn.searchParams.set('from', pathname)
    return noIndex(NextResponse.redirect(signIn))
  }

  return noIndex(NextResponse.next())
})

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
