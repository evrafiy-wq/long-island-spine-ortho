import { practice } from '@/content/practice'

/**
 * The full condition reference for /services — every condition with its
 * description and its symptom / treatment-approach pairs.
 *
 * This is the page the homepage's condensed index links into, and it is where
 * the clinical detail belongs: the homepage owes a visitor the answer to "do
 * they treat my thing?", and the detail turns that answer into 700 words.
 *
 * Deliberately NOT the tab widget it replaces. All three categories render at
 * once, server-side, so the content is indexable by search engines and reachable
 * without JavaScript — which matters when the search query that brought
 * someone here *was* a condition name. It also removes a `role="tablist"` that
 * had no arrow-key handling, so it was announcing a keyboard interaction it did
 * not implement.
 */
export function ConditionGuide() {
  const { conditionsGuide } = practice.copy

  return (
    <section
      aria-labelledby="conditions-heading"
      id="conditions-guide"
      className="border-t border-hairline block-y"
    >
      <div className="measure">
        <p className="text-label text-ink-muted uppercase">{conditionsGuide.eyebrow}</p>
        <div className="grid gap-x-16 gap-y-3 pt-4 lg:grid-cols-[1fr_1fr] lg:items-end">
          <h2 id="conditions-heading" className="font-display text-title tracking-tight text-ink">
            {conditionsGuide.heading}
          </h2>
          <p className="max-w-reading text-body text-ink-muted">{conditionsGuide.body}</p>
        </div>

        {practice.conditionCategories.map((category) => (
          <section key={category.id} aria-labelledby={`cat-${category.id}`} className="pt-14">
            <h3
              id={`cat-${category.id}`}
              className="border-t border-accent pt-3 text-label text-accent uppercase"
            >
              {category.label}
            </h3>
            <div className="grid gap-x-16 md:grid-cols-2 xl:grid-cols-3">
              {category.conditions.map((condition) => (
                <article key={condition.name} className="border-b border-hairline py-6">
                  <h4 className="font-display text-subtitle tracking-tight text-ink">
                    {condition.name}
                  </h4>
                  <p className="max-w-reading pt-2 text-body text-ink-muted">
                    {condition.description}
                  </p>
                  <dl className="pt-4">
                    {condition.details.map((detail) => (
                      <div key={detail.term} className="flex gap-2 pt-1 text-meta">
                        <dt className="shrink-0 text-ink-muted">{detail.term}</dt>
                        <dd className="text-ink">{detail.value}</dd>
                      </div>
                    ))}
                  </dl>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}
