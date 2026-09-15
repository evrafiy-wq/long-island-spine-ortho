import Link from 'next/link'
import { Glyph } from '@/components/site/Glyph'
import { UI } from '@/components/site/icons'
import { inboxHref, type InboxQuery } from '@/lib/admin/query'

interface PaginationProps {
  query: InboxQuery
  total: number
  pageSize: number
}

/**
 * Previous/next only, no numbered pages.
 *
 * The inbox is sorted newest-first and worked from the top; "page 7" is not a
 * destination anyone reasons about, and rendering forty numbered links to
 * satisfy a convention would be noise. Search and the status filter are how
 * you find an old submission.
 *
 * Links rather than buttons, so each page is a real URL that can be
 * bookmarked, shared and reached with the back button.
 */
export function Pagination({ query, total, pageSize }: PaginationProps) {
  const lastPage = Math.max(1, Math.ceil(total / pageSize))
  if (lastPage === 1) return null

  const hasPrevious = query.page > 1
  const hasNext = query.page < lastPage

  return (
    <nav
      aria-label="Submission pages"
      className="flex items-center justify-between gap-4 border-t border-hairline pt-6"
    >
      {hasPrevious ? (
        <Link
          href={inboxHref({ ...query, page: query.page - 1 })}
          rel="prev"
          className="inline-flex min-h-10 items-center gap-2 text-meta font-semibold text-accent underline underline-offset-4 transition-state hover:text-accent-hover"
        >
          <Glyph as={UI.arrowLeft} />
          Newer
        </Link>
      ) : (
        <span />
      )}

      <p className="text-meta text-ink-muted">
        Page {query.page} of {lastPage}
      </p>

      {hasNext ? (
        <Link
          href={inboxHref({ ...query, page: query.page + 1 })}
          rel="next"
          className="inline-flex min-h-10 items-center gap-2 text-meta font-semibold text-accent underline underline-offset-4 transition-state hover:text-accent-hover"
        >
          Older
          <Glyph as={UI.arrowRight} />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}
