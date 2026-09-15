import 'server-only'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { isAllowlistedAdmin } from '@/lib/admin/allowlist'
import { clientIpHash } from '@/lib/security/hash'

export interface AdminActor {
  email: string
  /** For the audit log. A hash, never an address — see lib/security/hash.ts. */
  ipHash: string | null
}

/**
 * The signed-in member of staff, or a redirect to the sign-in page.
 *
 * The middleware has already refused unauthenticated requests to this segment.
 * This runs anyway, for two reasons: the pages need the actor's email to write
 * an audit entry, and a Server Action invoked directly — which is a POST to a
 * URL, not a page navigation — must not depend on a middleware matcher having
 * been written correctly to be safe.
 */
export async function requireAdmin(): Promise<AdminActor> {
  const session = await auth()
  const email = session?.user?.email

  if (!email || !isAllowlistedAdmin(email)) {
    redirect('/admin/signin')
  }

  return { email, ipHash: await clientIpHash() }
}
