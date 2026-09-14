import Link from 'next/link'
import { Glyph } from '@/components/site/Glyph'
import { UI } from '@/components/site/icons'
import { practice } from '@/content/practice'

/**
 * A condensed index of what the practice treats — names only, grouped by
 * category, three columns.
 *
 * Earlier this rendered every condition's description plus its symptoms and
 * treatment approaches, which put roughly 700 words of clinical detail on the
 * homepage and pushed the physician well below the fold. This is a multi-page
 * site: the detail belongs on /services, where the condition guide already
 * lives. What the homepage owes the visitor is the answer to one question —
 * "do they treat my thing?" — and a name is enough to answer it.
 *
 * Deliberately not tabs: all nine are visible at once, server-rendered and
 * indexable, with no client JS and no keyboard interaction to get wrong. Each
 * name links into the full guide.
 *
 * Zero new copy — every string already exists in content/practice.ts.
 */
export function ConditionIndex() {
  const { conditionsGuide, careSection } = practice.copy

  return (
    <section aria-labelledby="conditions-heading" className="border-t border-hairline block-y">
      <div className="measure">
        <p className="text-label text-ink-muted uppercase">{conditionsGuide.eyebrow}</p>
        <div className="grid gap-x-16 gap-y-3 pt-4 lg:grid-cols-[1fr_1fr] lg:items-end">
          <h2 id="conditions-heading" className="font-display text-title tracking-tight text-ink">
            {conditionsGuide.heading}
          </h2>
          <p className="max-w-reading text-body text-ink-muted">{conditionsGuide.body}</p>
        </div>

        <div className="grid gap-x-16 pt-10 sm:grid-cols-2 xl:grid-cols-3">
          {practice.conditionCategories.map((category) => (
            <section key={category.id} aria-labelledby={`cat-${category.id}`} className="pt-6">
              <h3
                id={`cat-${category.id}`}
                className="border-t border-accent pt-3 text-label text-accent uppercase"
              >
                {category.label}
              </h3>
              <ul>
                {category.conditions.map((condition) => (
                  <li key={condition.name} className="border-b border-hairline">
                    <Link
                      href="/services#conditions-guide"
                      className="flex min-h-14 items-center justify-between gap-3 py-3 font-display text-subtitle tracking-tight text-ink transition-state hover:text-accent"
                    >
                      {condition.name}
                      <span className="shrink-0 text-[1rem] leading-none text-ink-muted">
                        <Glyph as={UI.arrowRight} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <p className="pt-9">
          <Link
            href="/services#conditions-guide"
            className="inline-flex min-h-6 items-center gap-2 text-meta font-semibold text-accent underline underline-offset-4 transition-state hover:text-accent-hover"
          >
            {careSection.allServicesLink}
            <Glyph as={UI.arrowRight} />
          </Link>
        </p>
      </div>
    </section>
  )
}
