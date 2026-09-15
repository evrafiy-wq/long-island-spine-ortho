import { isSubmissionKind, isSubmissionStatus } from '@/lib/admin/status'
import type { ListQuery } from '@/lib/submissions/types'

/** Rows per page. Enough to work a morning's requests without scrolling twice. */
export const PAGE_SIZE = 25

/** The maximum a single CSV export will pull, as a blast-radius cap. */
export const EXPORT_LIMIT = 5000

export interface InboxQuery {
  status?: string
  kind?: string
  q?: string
  page: number
}

export type RawSearchParams = Record<string, string | string[] | undefined>

function first(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value
  const trimmed = raw?.trim()
  return trimmed ? trimmed : undefined
}

/**
 * Parse the inbox filters out of a URL.
 *
 * Shared by the page and the CSV route so that "export these" exports exactly
 * what is on screen. Two parsers would eventually disagree, and the way you
 * would find out is a member of staff exporting the wrong set of patients.
 *
 * Unrecognised values are DROPPED rather than rejected. A hand-edited
 * `?status=urgent` should show the unfiltered inbox, not an error page — and
 * dropping it also means nothing unvalidated reaches the query builder.
 */
export function parseInboxQuery(params: RawSearchParams): InboxQuery {
  const status = first(params.status)
  const kind = first(params.kind)
  const page = Number.parseInt(first(params.page) ?? '1', 10)

  return {
    status: isSubmissionStatus(status) ? status : undefined,
    kind: isSubmissionKind(kind) ? kind : undefined,
    // Capped at 200 characters: a search term longer than that is not a name
    // or a phone number, and it becomes a `LIKE` pattern.
    q: first(params.q)?.slice(0, 200),
    page: Number.isFinite(page) && page > 0 ? page : 1,
  }
}

export function toListQuery(query: InboxQuery, limit = PAGE_SIZE): ListQuery {
  return {
    status: isSubmissionStatus(query.status) ? query.status : undefined,
    kind: isSubmissionKind(query.kind) ? query.kind : undefined,
    search: query.q,
    limit,
    offset: (query.page - 1) * limit,
  }
}

/** Query string for a variant of the current filters. Empty values are dropped. */
export function inboxHref(query: Partial<InboxQuery>, base = '/admin'): string {
  const params = new URLSearchParams()
  if (query.status) params.set('status', query.status)
  if (query.kind) params.set('kind', query.kind)
  if (query.q) params.set('q', query.q)
  if (query.page && query.page > 1) params.set('page', String(query.page))
  const search = params.toString()
  return search ? `${base}?${search}` : base
}
