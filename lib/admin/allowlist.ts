/**
 * Who may sign in to /admin.
 *
 * Kept OUT of lib/env.ts on purpose. That module starts with
 * `import 'server-only'`, and this list is read from the Edge middleware,
 * which is not a React Server Component context — the `react-server` export
 * condition that makes `server-only` safe is not reliably applied there. A
 * module with no imports at all cannot get that wrong.
 *
 * Reading the allowlist on every request, rather than baking it into a token
 * at sign-in, is what makes removing an address take effect immediately:
 * change `ADMIN_EMAILS`, redeploy, and any session held by a removed address
 * stops being authorised on its next request without waiting for expiry.
 */

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
}

export function isAllowlistedAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  const allowed = adminEmails()
  // An empty or unset allowlist authorises NOBODY. Failing closed matters more
  // than a convenient local default: the alternative is a deployment where
  // forgetting one environment variable opens the patient inbox to anyone who
  // can receive email.
  return allowed.length > 0 && allowed.includes(email.trim().toLowerCase())
}
