import { safeCompare } from '@/lib/crypto/field'
import { optionalEnv } from '@/lib/env'
import { RETENTION_DAYS, purgeClosedSubmissions, recordAudit } from '@/lib/submissions/repository'

export const dynamic = 'force-dynamic'
/** Deleting rows from a serverless function needs more than the 10s default. */
export const maxDuration = 60

/**
 * Retention: permanently delete submissions that have been CLOSED for more
 * than ninety days.
 *
 * Measured from `closed_at`, not `created_at`. Retention should run from the
 * end of the practice's business with a request, so a request somebody is
 * still working is never deleted underneath them. The cost of that choice is
 * that a submission nobody ever closes is never purged — which is why the job
 * also counts submissions still open after a year and returns the number. A
 * retention policy with a silent hole is worse than one with a visible one.
 *
 * Scheduled by vercel.json. Vercel Cron authenticates by sending
 * `Authorization: Bearer $CRON_SECRET`, which is what the check below expects;
 * the same header lets an administrator run it by hand.
 *
 * This route DELETES PATIENT DATA and is the only thing in the application
 * that does, so:
 *
 *  - a missing or wrong secret is a 401, and a missing secret in the
 *    environment is a 500 rather than an open door;
 *  - the comparison is constant-time, because a `===` on a secret in a
 *    publicly reachable route is a timing oracle;
 *  - every run writes an audit entry, including runs that delete nothing. An
 *    absent entry then means the job did not run, which is the failure worth
 *    being able to detect.
 */
export async function GET(request: Request) {
  const secret = optionalEnv('CRON_SECRET')

  if (!secret) {
    console.error('[cron] CRON_SECRET is not set; refusing to run the purge.')
    return Response.json({ error: 'Not configured.' }, { status: 500 })
  }

  const provided = request.headers.get('authorization') ?? ''
  if (!safeCompare(provided, `Bearer ${secret}`)) {
    return Response.json({ error: 'Unauthorised.' }, { status: 401 })
  }

  try {
    const result = await purgeClosedSubmissions()

    await recordAudit({
      actorEmail: 'system',
      action: 'submissions.purge',
      detail: {
        deleted: result.deleted,
        retentionDays: RETENTION_DAYS,
        cutoff: result.cutoff.toISOString(),
        openOverOneYear: result.longOpen,
      },
    })

    if (result.longOpen > 0) {
      console.warn(
        `[cron] ${result.longOpen} submission(s) have been open for over a year. ` +
          'They are exempt from retention until someone closes them.',
      )
    }

    return Response.json({
      ok: true,
      deleted: result.deleted,
      retentionDays: RETENTION_DAYS,
      cutoff: result.cutoff.toISOString(),
      openOverOneYear: result.longOpen,
    })
  } catch (error) {
    console.error('[cron] Purge failed:', error)
    return Response.json({ error: 'Purge failed.' }, { status: 500 })
  }
}
