import type { NextAuthConfig } from 'next-auth'
import { isAllowlistedAdmin } from '@/lib/admin/allowlist'

/**
 * The half of the Auth.js configuration that the Edge middleware can run.
 *
 * Auth.js v5 is split in two on purpose. `middleware.ts` runs on the Edge
 * runtime, where there is no `node:crypto`, no TCP and therefore no database
 * adapter — so anything the middleware needs has to live in a module that
 * imports none of those. The adapter and the mail provider are added in
 * `auth.ts`, which only ever runs in Node.
 *
 * WHY JWT SESSIONS WITH A DATABASE ADAPTER. The adapter is still required —
 * it is where a magic link lives between being emailed and being clicked. But
 * if sessions were database rows, the middleware would have to query Postgres
 * on every /admin request to find out whether the caller is signed in, and it
 * cannot. A signed cookie the Edge can verify by itself is what makes the
 * whole segment protectable at the middleware layer rather than page by page.
 */
export const authConfig = {
  /**
   * Trust the host header. Required on Vercel, where the deployment URL is not
   * known at build time and Auth.js otherwise refuses to construct callback
   * URLs. Safe here because the middleware matcher pins the protected surface
   * to /admin and nothing derives authorisation from the host.
   */
  trustHost: true,

  pages: {
    signIn: '/admin/signin',
    verifyRequest: '/admin/signin?sent=1',
    error: '/admin/signin',
  },

  session: {
    strategy: 'jwt',
    /**
     * Eight hours — one clinic day. A front-desk machine is shared and often
     * unattended, so a session that outlives the shift is a session somebody
     * else inherits.
     */
    maxAge: 8 * 60 * 60,
  },

  /** Filled in by auth.ts. The middleware needs none of them to verify a JWT. */
  providers: [],

  callbacks: {
    /**
     * Second gate. The first is in `sendVerificationRequest`, which refuses to
     * email a link to an address that is not on the list; this one refuses to
     * complete a sign-in even if a link somehow reaches one. Both read the
     * same function.
     */
    signIn({ user }) {
      return isAllowlistedAdmin(user.email)
    },

    jwt({ token, user }) {
      if (user?.email) token.email = user.email
      return token
    },

    session({ session, token }) {
      if (token.email) session.user.email = token.email
      return session
    },
  },
} satisfies NextAuthConfig
