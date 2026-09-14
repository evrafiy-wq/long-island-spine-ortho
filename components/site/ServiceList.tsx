import Link from 'next/link'
import { Glyph } from '@/components/site/Glyph'
import { ICONS, UI } from '@/components/site/icons'
import { practice } from '@/content/practice'

interface ServiceListProps {
  /**
   * `home` uses the short `summary` and links out to /services.
   * `services` uses the long `description` and does not link, because you are
   * already there.
   */
  variant: 'home' | 'services'
  headingId: string
}

/**
 * The four services as a light ruled grid.
 *
 * Explicitly not the pattern this replaced — three across, circle icon, bold
 * title, two lines of grey — and not the first draft of this either, where the
 * titles sat at the 38px section size and four services read as four more
 * sections. Titles are 20px; the ordinal and the glyph carry the scale
 * contrast instead. No cards, no radius, no shadows, no hover lift.
 */
export function ServiceList({ variant, headingId }: ServiceListProps) {
  const { careSection } = practice.copy

  return (
    <section aria-labelledby={headingId} className="border-t border-hairline block-y">
      <div className="measure">
        <p className="text-label text-ink-muted uppercase">{careSection.eyebrow}</p>
        <div className="grid gap-x-16 gap-y-3 pt-4 lg:grid-cols-[1fr_1fr] lg:items-end">
          <h2 id={headingId} className="font-display text-title tracking-tight text-ink">
            {careSection.heading}
          </h2>
          <p className="max-w-reading text-body text-ink-muted">{careSection.body}</p>
        </div>

        <ol className="grid gap-x-16 pt-10 sm:grid-cols-2">
          {practice.services.map((service, index) => (
            <li key={service.id} className="border-t border-hairline py-6">
              <div className="flex items-baseline gap-3">
                <span className="text-label text-accent tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-[1.125rem] leading-none text-ink-muted">
                  <Glyph as={ICONS[service.icon]} />
                </span>
              </div>
              <h3 className="pt-3 font-display text-subtitle tracking-tight text-ink">
                {service.title}
              </h3>
              <p className="max-w-reading pt-2 text-body text-ink-muted">
                {variant === 'home' ? service.summary : service.description}
              </p>
            </li>
          ))}
        </ol>

        {variant === 'home' ? (
          <p className="border-t border-hairline pt-7">
            <Link
              href="/services"
              className="inline-flex min-h-6 items-center gap-2 text-meta font-semibold text-accent underline underline-offset-4 transition-state hover:text-accent-hover"
            >
              {careSection.allServicesLink}
              <Glyph as={UI.arrowRight} />
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  )
}
