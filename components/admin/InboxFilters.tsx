import Link from 'next/link'
import { Glyph } from '@/components/site/Glyph'
import { UI } from '@/components/site/icons'
import { inboxHref, type InboxQuery } from '@/lib/admin/query'
import { KIND_LABELS, STATUS_LABELS, STATUS_ORDER } from '@/lib/admin/status'
import { cx } from '@/lib/cx'

/**
 * Filters and search.
 *
 * A plain GET form with no JavaScript anywhere in it. Filter state lives in
 * the URL, which means a member of staff can bookmark "everything still new",
 * the browser back button behaves, and a link to a filtered view can be pasted
 * into a message. A client-side filter would have given up all three to avoid
 * a page load that is already server-rendered.
 *
 * Status is a row of links rather than a select, because it is the filter that
 * gets used constantly and one tap beats two.
 */
export function InboxFilters({ query, total }: { query: InboxQuery; total: number }) {
  const statusTabs = [
    { value: undefined, label: 'All' },
    ...STATUS_ORDER.map((status) => ({ value: status as string, label: STATUS_LABELS[status] })),
  ]

  return (
    <div className="border-b border-hairline pb-6">
      <nav aria-label="Filter by status">
        <ul className="flex flex-wrap gap-x-2 gap-y-1">
          {statusTabs.map((tab) => {
            const active = query.status === tab.value
            return (
              <li key={tab.label}>
                <Link
                  href={inboxHref({ ...query, status: tab.value, page: 1 })}
                  aria-current={active ? 'page' : undefined}
                  className={cx(
                    'inline-flex min-h-10 items-center rounded-control px-4 text-meta font-semibold transition-state',
                    active
                      ? 'bg-accent text-on-accent'
                      : 'border border-hairline text-ink-muted hover:text-accent',
                  )}
                >
                  {tab.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <form method="get" action="/admin" className="flex flex-wrap items-end gap-4 pt-6">
        {/* Status is carried through the search so submitting the box does not
            silently drop the filter the user is looking at. */}
        {query.status ? <input type="hidden" name="status" value={query.status} /> : null}

        <div className="min-w-64 grow">
          <label htmlFor="q" className="text-label text-ink-muted uppercase">
            Search by name or phone
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={query.q ?? ''}
            placeholder="e.g. Alvarez, or 433-1100"
            className="mt-2 min-h-[3.25rem] w-full rounded-control border border-border-strong bg-canvas px-4 text-body text-ink focus-visible:border-accent"
          />
        </div>

        <div className="min-w-44">
          <label htmlFor="kind" className="text-label text-ink-muted uppercase">
            Type
          </label>
          <select
            id="kind"
            name="kind"
            defaultValue={query.kind ?? ''}
            className="mt-2 min-h-[3.25rem] w-full rounded-control border border-border-strong bg-canvas px-4 text-body text-ink focus-visible:border-accent"
          >
            <option value="">All types</option>
            <option value="appointment">{KIND_LABELS.appointment}</option>
            <option value="contact">{KIND_LABELS.contact}</option>
          </select>
        </div>

        <button
          type="submit"
          className="flex min-h-[3.25rem] items-center gap-2 rounded-control bg-accent px-5 text-meta font-semibold text-on-accent transition-state hover:bg-accent-hover"
        >
          Search
        </button>

        {query.q || query.kind ? (
          <Link
            href={inboxHref({ status: query.status, page: 1 })}
            className="flex min-h-[3.25rem] items-center text-meta font-semibold text-accent underline underline-offset-4"
          >
            Clear
          </Link>
        ) : null}
      </form>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-5">
        <p aria-live="polite" className="text-meta text-ink-muted">
          {total === 1 ? '1 submission' : `${total} submissions`}
        </p>

        <Link
          href={inboxHref(query, '/admin/export')}
          prefetch={false}
          className="inline-flex min-h-10 items-center gap-2 text-meta font-semibold text-accent underline underline-offset-4 transition-state hover:text-accent-hover"
        >
          <Glyph as={UI.download} />
          Export these as CSV
        </Link>
      </div>
    </div>
  )
}
