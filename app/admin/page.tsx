import { InboxFilters } from '@/components/admin/InboxFilters'
import { Pagination } from '@/components/admin/Pagination'
import { SubmissionTable } from '@/components/admin/SubmissionTable'
import { requireAdmin } from '@/lib/admin/session'
import { PAGE_SIZE, parseInboxQuery, toListQuery, type RawSearchParams } from '@/lib/admin/query'
import { listSubmissions, recordAudit } from '@/lib/submissions/repository'

/**
 * The inbox.
 *
 * Newest first, filterable by status and type, searchable by name or phone.
 * All of that state is in the URL — see lib/admin/query.ts — which is what
 * lets the CSV export reuse the identical parse and hand back exactly the rows
 * on screen.
 *
 * The list view is audited, not just the detail view. A page showing
 * twenty-five patients' names and phone numbers is patient-data access, and an
 * access log that recorded only the deep links would miss most of it. The
 * entry stores the filters and the result count, never the rows.
 */
export default async function AdminInboxPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const actor = await requireAdmin()
  const query = parseInboxQuery(await searchParams)

  const { rows, total } = await listSubmissions(toListQuery(query))

  await recordAudit({
    actorEmail: actor.email,
    action: 'submissions.list_view',
    detail: {
      status: query.status ?? 'all',
      kind: query.kind ?? 'all',
      searched: Boolean(query.q),
      page: query.page,
      returned: rows.length,
    },
    ipHash: actor.ipHash,
  })

  return (
    <div className="measure py-10">
      <h1 className="pb-6 font-display text-title tracking-tight text-ink">Submissions</h1>

      <InboxFilters query={query} total={total} />

      <div className="pt-6">
        <SubmissionTable rows={rows} />
      </div>

      <div className="pt-6">
        <Pagination query={query} total={total} pageSize={PAGE_SIZE} />
      </div>
    </div>
  )
}
