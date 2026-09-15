import { handlers } from '@/auth'

/**
 * Auth.js's own endpoints: sign-in, callback, sign-out, CSRF, session.
 *
 * `force-dynamic` because every one of them reads cookies and must never be
 * captured by the static prerender that the rest of this site relies on.
 */
export const dynamic = 'force-dynamic'

export const { GET, POST } = handlers
