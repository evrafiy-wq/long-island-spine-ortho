import { cx } from '@/lib/cx'

interface PageHeaderProps {
  heading: string
  /** Omitted on pages where no existing copy fills the slot. */
  eyebrow?: string
  intro?: string
}

/**
 * The `<h1>` block every inner page opens with.
 *
 * This exists to fix a real defect, not to save typing: before the redesign,
 * four of the five pages had NO `<h1>` at all. The shared section components
 * each hardcoded an `<h2>`, so a page that led with one had no way to promote
 * it, and anyone using a screen reader on /about, /services, /patient-info or
 * /visit got a document whose outline started at level 2.
 *
 * Every page now renders exactly one of these, first, and every section below
 * it uses `<h2>`. The headings themselves reuse the existing nav and footer
 * labels rather than introducing new copy.
 */
export function PageHeader({ heading, eyebrow, intro }: PageHeaderProps) {
  return (
    <header className="border-b border-hairline block-y">
      <div className="measure">
        {eyebrow ? <p className="text-label text-ink-muted uppercase">{eyebrow}</p> : null}
        <h1
          className={cx(
            'max-w-[20ch] font-display text-display text-balance text-ink',
            eyebrow && 'pt-6',
          )}
        >
          {heading}
        </h1>
        {intro ? <p className="max-w-lede pt-7 text-lede text-ink-muted">{intro}</p> : null}
      </div>
    </header>
  )
}
