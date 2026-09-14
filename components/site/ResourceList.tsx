import { Glyph } from '@/components/site/Glyph'
import { ICONS } from '@/components/site/icons'
import { practice } from '@/content/practice'

/**
 * The three downloadable patient forms.
 *
 * The old version put the document and download glyphs in `.resource-icon` /
 * `.resource-action`, neither of which had a `fill: none; stroke: currentColor`
 * rule — so both rendered as solid black silhouettes. Lucide icons are
 * stroke-based by default and pick up `--site-icon-stroke` from the reset, so
 * that inherited bug does not survive the move.
 */
export function ResourceList() {
  const { resourcesSection } = practice.copy

  return (
    <ul className="grid gap-x-16 pt-10 md:grid-cols-3">
      {practice.forms.map((form) => (
        <li key={form.id} className="border-t border-hairline">
          <a
            href={form.file}
            target="_blank"
            rel="noopener"
            className="block h-full py-6 transition-state hover:bg-surface"
          >
            <span className="text-[1.25rem] leading-none text-ink-muted">
              <Glyph as={ICONS.document} />
            </span>
            <h3 className="pt-4 font-display text-subtitle tracking-tight text-ink">
              {form.title}
            </h3>
            <p className="pt-2 text-body text-ink-muted">{form.description}</p>
            <span className="mt-4 inline-flex min-h-6 items-center gap-2 text-meta font-semibold text-accent underline underline-offset-4">
              {resourcesSection.downloadLabel}
              <Glyph as={ICONS.download} />
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}
