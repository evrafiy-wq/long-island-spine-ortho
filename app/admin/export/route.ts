import { requireAdmin } from '@/lib/admin/session'
import { EXPORT_LIMIT, parseInboxQuery, toListQuery } from '@/lib/admin/query'
import { KIND_LABELS, STATUS_LABELS } from '@/lib/admin/status'
import { csvFilename, toCsv } from '@/lib/csv'
import { timeWindowLabel } from '@/lib/forms/appointment'
import { formatPhone } from '@/lib/forms/phone'
import { listSubmissions, recordAudit } from '@/lib/submissions/repository'

export const dynamic = 'force-dynamic'

const HEADERS = [
  'Reference',
  'Received',
  'Type',
  'Status',
  'Name',
  'Phone',
  'Email',
  'About',
  'Preferred date',
  'Preferred time',
  'Referring physician',
  'Insurance carrier',
  'Notes from patient',
  'Internal notes',
] as const

/**
 * CSV export of whatever the inbox is currently filtered to.
 *
 * The filters are parsed with the SAME function the page uses, so "export
 * these" means these — not "everything", which is the usual shape of this bug
 * and, on a table of patients, a meaningful over-disclosure.
 *
 * THE EXPORT IS THE MOST DANGEROUS FEATURE IN THE ADMIN. It produces a
 * decrypted, unencrypted file of patient contact details and free text that
 * then lives in a Downloads folder, outside every control this application
 * has. Three things follow from that, all of them here on purpose:
 *
 *  - it is audited before the file is generated, with the filters and the row
 *    count, so there is a record even if the response fails;
 *  - it is capped at EXPORT_LIMIT rows, so a mis-click cannot dump the entire
 *    table;
 *  - `Cache-Control: no-store` and `X-Robots-Tag` (also set by the middleware)
 *    keep it out of shared caches and out of any index.
 */
export async function GET(request: Request) {
  const actor = await requireAdmin()
  const query = parseInboxQuery(Object.fromEntries(new URL(request.url).searchParams.entries()))

  const { rows, total } = await listSubmissions(toListQuery({ ...query, page: 1 }, EXPORT_LIMIT))

  await recordAudit({
    actorEmail: actor.email,
    action: 'submissions.export',
    detail: {
      status: query.status ?? 'all',
      kind: query.kind ?? 'all',
      searched: Boolean(query.q),
      exported: rows.length,
      matching: total,
      truncated: total > rows.length,
    },
    ipHash: actor.ipHash,
  })

  const body = toCsv(
    HEADERS,
    rows.map((row) => [
      row.reference,
      row.createdAt.toISOString(),
      KIND_LABELS[row.kind],
      STATUS_LABELS[row.status],
      row.fullName,
      row.phone ? formatPhone(row.phone) : '',
      row.email,
      row.subject,
      row.preferredDate ?? '',
      row.preferredTimeWindow ? timeWindowLabel(row.preferredTimeWindow) : '',
      row.referringPhysician ?? '',
      row.insuranceCarrier ?? '',
      row.notes ?? '',
      row.internalNotes ?? '',
    ]),
  )

  return new Response(body, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${csvFilename('submissions')}"`,
      'cache-control': 'no-store, max-age=0',
      'x-robots-tag': 'noindex, nofollow',
    },
  })
}
