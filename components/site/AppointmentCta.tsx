import Link from 'next/link'
import { Glyph } from '@/components/site/Glyph'
import { UI } from '@/components/site/icons'
import { practice } from '@/content/practice'

/**
 * The closing band, shared by every page except /visit (which ends with the
 * request form itself, so repeating the ask would be noise).
 *
 * Focus rings switch to the on-dark colour locally via --site-focus-color, so
 * a keyboard user still gets a 10:1 indicator against the dark field.
 */
export function AppointmentCta() {
  const { appointmentCta } = practice.copy
  const { phone } = practice.contact

  return (
    <section
      aria-labelledby="appointment-cta-heading"
      className="bg-dark block-y text-ink-inv [--site-focus-color:var(--site-focus-color-on-dark)]"
    >
      <div className="measure grid items-end gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
        <div>
          <p className="text-label text-ink-inv-muted uppercase">{appointmentCta.eyebrow}</p>
          <h2
            id="appointment-cta-heading"
            className="max-w-[22ch] pt-4 font-display text-title tracking-tight"
          >
            {appointmentCta.heading}
          </h2>
          <p className="max-w-reading pt-4 text-body text-ink-inv-muted">{appointmentCta.body}</p>
        </div>
        <div>
          <Link
            href={practice.navCta.href}
            className="flex min-h-[3.25rem] items-center justify-between gap-3 rounded-control bg-ink-inv px-5 text-meta font-semibold text-ink transition-state hover:opacity-90"
          >
            {appointmentCta.buttonLabel}
            <Glyph as={UI.arrowRight} />
          </Link>
          <a
            href={phone.href}
            className="mt-5 flex items-baseline justify-between gap-3 border-t border-white/20 pt-5 transition-state hover:text-accent-inv"
          >
            <span className="text-label text-ink-inv-muted uppercase">
              {appointmentCta.callPrefix}
            </span>
            <span className="font-display text-subtitle tracking-tight">{phone.display}</span>
          </a>
        </div>
      </div>
    </section>
  )
}
