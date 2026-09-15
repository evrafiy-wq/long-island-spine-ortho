import { Glyph } from '@/components/site/Glyph'
import { PageHeader } from '@/components/site/PageHeader'
import { UI } from '@/components/site/icons'
import { awaitingCounselNotice, type LegalDocument } from '@/content/legal'

/**
 * Renderer for /privacy and /terms.
 *
 * Sections still waiting on counsel render a plain-language note instead of
 * their body. A patient sees an honest gap; they do not see the literal
 * `[PLACEHOLDER: …]` text, which would read as a broken page, and they do not
 * see invented legal terms, which would be worse than either. The section
 * headings stay visible so the shape of the finished document is obvious and
 * so the gaps cannot be quietly forgotten.
 *
 * Copy is held at a reading measure rather than the full column: legal prose
 * at 1320px is unreadable, and this audience is the one least likely to
 * persevere with it.
 */
export function LegalDocumentPage({ document }: { document: LegalDocument }) {
  return (
    <>
      <PageHeader heading={document.heading} />

      <div className="block-y">
        {/*
          `measure` and `max-w-reading` have to be on DIFFERENT elements.
          `measure` sets `margin-inline: auto`, so putting a narrower max-width
          on the same node re-centres the column — and the prose ends up
          indented away from the <h1> above it, which PageHeader renders at the
          full page gutter. Nested, the outer node keeps the page column and
          the inner one just caps the line length.
        */}
        <div className="measure">
          <div className="max-w-reading">
            {document.intro.map((paragraph) => (
              <p key={paragraph} className="pb-5 text-lede text-ink-muted">
                {paragraph}
              </p>
            ))}

            {document.sections.map((section) => (
              <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`}>
                <h2
                  id={`${section.id}-heading`}
                  className="border-t border-hairline pt-8 pb-4 font-display text-title tracking-tight text-ink"
                >
                  {section.heading}
                </h2>

                {section.awaitingCounsel ? (
                  <p className="mb-8 flex gap-3 border border-l-4 border-hairline px-5 py-4 text-body text-ink-muted">
                    <span className="pt-1 text-ink">
                      <Glyph as={UI.alert} />
                    </span>
                    {awaitingCounselNotice}
                  </p>
                ) : (
                  <>
                    {section.body?.map((paragraph) => (
                      <p key={paragraph} className="pb-5 text-body text-ink-muted">
                        {paragraph}
                      </p>
                    ))}

                    {section.bullets ? (
                      <ul className="pb-5">
                        {section.bullets.map((bullet) => (
                          <li
                            key={bullet}
                            className="flex gap-3 border-t border-hairline py-3 text-body text-ink-muted"
                          >
                            <span className="pt-1 text-accent">
                              <Glyph as={UI.check} />
                            </span>
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </>
                )}
              </section>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
