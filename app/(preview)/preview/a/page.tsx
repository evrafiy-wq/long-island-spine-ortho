import { Fragment } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ContactRail } from '@/components/preview/a/ContactRail'
import { SiteFooterA } from '@/components/preview/a/SiteFooterA'
import { SiteHeaderA } from '@/components/preview/a/SiteHeaderA'
import { DirectionSwitcher } from '@/components/site/DirectionSwitcher'
import { Glyph } from '@/components/site/Glyph'
import { ICONS, UI } from '@/components/site/icons'
import { practice } from '@/content/practice'
import { fontsA } from '@/lib/preview-fonts/direction-a'

/**
 * Direction A — Clinical Authority.
 *
 * Content rules observed throughout (see CLAUDE.md):
 *  - Every string comes from content/practice.ts or the current homepage.
 *  - `credentials[3]` (Languages) is NOT rendered, and `heroHighlights` is
 *    dropped entirely, because heroHighlights[1] IS the languages claim.
 *    Both are flagged UNVERIFIED. `insuranceCarriers` likewise appears
 *    nowhere. This keeps the unverified claims out of new surfaces by
 *    construction rather than by remembering to avoid them.
 *  - Field labels the record card needs, which no existing copy supplies, are
 *    marked [PLACEHOLDER: …] below and listed on /preview.
 */

/**
 * Row labels for the record card.
 *
 * Only two are placeholders. The rest were found in existing copy rather than
 * written: the physician and specialty rows became the card's own heading
 * (practice.physician.name / .specialty), the three credential rows use their
 * real `term` values from practice.ts, and "Office Hours" is already a label
 * on /visit. Non-clinical field names carry no claim risk, but they are still
 * copy that does not exist, so they are marked and listed.
 */
const RECORD_LABELS = {
  office: '[PLACEHOLDER: address row label, e.g. "Office"]',
  telephone: '[PLACEHOLDER: phone row label, e.g. "Telephone"]',
  hours: 'Office Hours',
}

function RecordRow({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-t border-hairline px-5 py-4 md:grid-cols-[9rem_1fr] md:gap-4">
      <dt className="font-[family-name:var(--pv-font-meta)] text-label text-ink-muted uppercase">
        {term}
      </dt>
      <dd className="font-[family-name:var(--pv-font-meta)] text-meta text-ink">{children}</dd>
    </div>
  )
}

export default function PreviewAPage() {
  const { hero, careSection, physicianSection, visitSection, appointmentCta } = practice.copy
  const { phone, address, parking } = practice.contact
  const { portrait, name, specialty, bio } = practice.physician

  return (
    // `fontsA` must be on the same element as `data-direction`, because
    // direction-a.css declares --font-display/--font-body here and they
    // reference the next/font variables this className defines.
    <div
      data-direction="a"
      className={`${fontsA} min-h-dvh bg-canvas font-body text-body text-ink`}
    >
      <a
        href="#main-content"
        className="sr-only bg-accent font-[family-name:var(--pv-font-meta)] text-meta text-on-accent focus:not-sr-only focus:absolute focus:top-2 focus:left-1/2 focus:z-50 focus:measure focus:-translate-x-1/2 focus:px-4 focus:py-3"
      >
        Skip to main content
      </a>

      <ContactRail />
      <SiteHeaderA />

      <main id="main-content">
        {/* --- Hero + record card ------------------------------------------
            No portrait and no orbs. The right-hand element is a ruled record
            card: the densest set of verifiable facts constructible from
            practice.ts, set like the author-affiliation box in a journal. On
            desktop the copy is capped at the lede measure so the headline
            breaks where it should. */}
        <section className="block-y">
          <div className="measure grid items-start gap-12 xl:grid-cols-[1.05fr_0.95fr] xl:gap-20">
            <div>
              <p className="font-[family-name:var(--pv-font-meta)] text-label text-ink-muted uppercase">
                {hero.eyebrow}
              </p>
              <h1 className="max-w-[22ch] pt-5 font-display text-display text-balance text-ink">
                {hero.headingLead}
                {/* <em> kept for semantics, but rendered at the same colour and
                    near-same weight. A does not let a marketing gesture sit at
                    the top of a clinical document — the line break carries the
                    emphasis instead. */}
                <em className="font-medium not-italic">{hero.headingEmphasis}</em>
              </h1>
              <p className="max-w-lede pt-6 text-lede text-ink-muted">{hero.intro}</p>

              <div className="flex flex-col items-start gap-x-8 gap-y-4 pt-8 sm:flex-row sm:items-center">
                <Link
                  href={practice.navCta.href}
                  className="inline-flex min-h-[3rem] items-center gap-2 rounded-control bg-accent px-6 font-[family-name:var(--pv-font-meta)] text-meta font-semibold text-on-accent transition-state hover:bg-accent-hover"
                >
                  {hero.primaryCta}
                  <Glyph as={UI.arrowRight} />
                </Link>
                <a
                  href={phone.href}
                  className="inline-flex min-h-[3rem] items-center gap-2 font-[family-name:var(--pv-font-meta)] text-meta font-semibold text-accent underline underline-offset-4 transition-state hover:text-accent-hover"
                >
                  <Glyph as={UI.phone} />
                  Call {phone.display}
                </a>
              </div>
            </div>

            <section aria-labelledby="record-heading" className="border border-hairline bg-surface">
              {/* The card's heading is the physician's own name, so the block
                  needs no invented label and heading order stays h1 -> h2. */}
              <div className="px-5 pt-5 pb-4">
                <h2 id="record-heading" className="font-display text-subtitle text-ink">
                  {name}
                </h2>
                <p className="pt-1 font-[family-name:var(--pv-font-meta)] text-meta text-ink-muted">
                  {specialty}
                </p>
              </div>
              <dl>
                {/* credentials[0..2] only. Index 3 is the UNVERIFIED languages
                    claim and is deliberately skipped. */}
                {practice.credentials.slice(0, 3).map((credential) => (
                  <RecordRow key={credential.term} term={credential.term}>
                    {credential.value}
                  </RecordRow>
                ))}
                <RecordRow term={RECORD_LABELS.office}>
                  <address className="not-italic">{address.oneLine}</address>
                </RecordRow>
                <RecordRow term={RECORD_LABELS.hours}>
                  {practice.hours.rows[0].days} {practice.hours.rows[0].time}
                </RecordRow>
                <RecordRow term={RECORD_LABELS.telephone}>
                  <a
                    href={phone.href}
                    className="font-semibold text-accent underline underline-offset-4 transition-state hover:text-accent-hover"
                  >
                    {phone.display}
                  </a>
                </RecordRow>
              </dl>
            </section>
          </div>
        </section>

        {/* --- Trust epigraph ----------------------------------------------
            Not a bar of three cells. Three blockquotes separated by rules.
            The strings already contain typographic quotes, so no CSS ::before
            quote marks are added. */}
        <section aria-label="Our commitments" className="border-t border-hairline">
          <div className="measure grid md:grid-cols-3">
            {practice.trustStatements.map((statement, index) => (
              <blockquote
                key={statement}
                className={
                  index === 0
                    ? 'py-8 font-display text-subtitle text-ink md:pr-8'
                    : 'border-t border-hairline py-8 font-display text-subtitle text-ink md:border-t-0 md:border-l md:px-8 md:last:pr-0'
                }
              >
                {statement}
              </blockquote>
            ))}
          </div>
        </section>

        {/* --- Care index ---------------------------------------------------
            The banned pattern here is three across with a circle icon, a bold
            title and two lines of grey text. This is a numbered journal index
            instead: one column at every width, generated ordinals, hairline
            rows, no chips, no radius, no shadow, no hover lift. It also
            carries all FOUR services — an index wants completeness, so
            Second Opinions is no longer hidden on /services. */}
        <section aria-labelledby="care-heading" className="border-t border-hairline block-y">
          <div className="measure">
            <p className="font-[family-name:var(--pv-font-meta)] text-label text-ink-muted uppercase">
              {careSection.eyebrow}
            </p>
            <h2 id="care-heading" className="pt-4 font-display text-title text-ink">
              {careSection.heading}
            </h2>
            <p className="max-w-reading pt-4 text-body text-ink-muted">{careSection.body}</p>

            <ol className="pt-10">
              {practice.services.map((service, index) => (
                <li
                  key={service.id}
                  className="grid grid-cols-[2rem_1fr] gap-x-4 border-t border-hairline py-7 md:grid-cols-[3rem_1fr] md:gap-x-6"
                >
                  <span className="pt-1.5 font-[family-name:var(--pv-font-meta)] text-label text-ink-muted tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="flex items-baseline gap-3 font-display text-subtitle text-ink">
                      {service.title}
                      <span className="text-[1.25rem] leading-none text-ink-muted">
                        <Glyph as={ICONS[service.icon]} />
                      </span>
                    </h3>
                    <p className="max-w-reading pt-2 text-body text-ink-muted">{service.summary}</p>
                  </div>
                </li>
              ))}
            </ol>

            <p className="border-t border-hairline pt-7">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 font-[family-name:var(--pv-font-meta)] text-meta font-semibold text-accent underline underline-offset-4 transition-state hover:text-accent-hover"
              >
                {careSection.allServicesLink}
                <Glyph as={UI.arrowRight} />
              </Link>
            </p>
          </div>
        </section>

        {/* --- Physician plate ----------------------------------------------
            The portrait's only appearance in A, as a captioned figure. 4:5 is
            the native aspect (1122x1402), so this is a straight downscale with
            no crop. Radius 0, 1px rule, no shadow. */}
        <section aria-labelledby="physician-heading" className="border-t border-hairline block-y">
          {/* 320px, not 440. "Photography used sparingly" is a size decision
              as much as a count: at 440 the 4:5 portrait becomes a 550px slab
              that dominates the page and leaves the copy column stranded. A
              plate sized close to the reading column reads as a figure in a
              document. */}
          <div className="measure grid items-start gap-10 md:grid-cols-[280px_1fr] md:gap-12 xl:grid-cols-[320px_1fr] xl:gap-20">
            <figure className="w-full max-w-[320px] rounded-plate border border-hairline">
              <Image
                src={portrait.src}
                alt={portrait.alt}
                width={portrait.width}
                height={portrait.height}
                sizes="(max-width: 767px) min(100vw - 48px, 320px), (max-width: 1279px) 280px, 320px"
                className="w-full"
                priority
              />
              <figcaption className="border-t border-hairline px-4 py-3 font-[family-name:var(--pv-font-meta)] text-meta text-ink-muted">
                {name} — {specialty}
              </figcaption>
            </figure>

            <div>
              <p className="font-[family-name:var(--pv-font-meta)] text-label text-ink-muted uppercase">
                {physicianSection.eyebrow}
              </p>
              <h2 id="physician-heading" className="pt-4 font-display text-title text-ink">
                {physicianSection.heading}
              </h2>
              <p className="max-w-reading pt-5 text-body text-ink-muted">{bio}</p>
              <p className="pt-7">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 font-[family-name:var(--pv-font-meta)] text-meta font-semibold text-accent underline underline-offset-4 transition-state hover:text-accent-hover"
                >
                  {physicianSection.cta}
                  <Glyph as={UI.arrowRight} />
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* --- Visit --------------------------------------------------------
            The office photo is 597x335 native, so it is rendered at 298px and
            never wider — an exact 2x fit with zero upscaling. At that size it
            works as proof of place, not as signage. It is deliberately
            narrower than the column, which reads as a plate rather than a
            banner. */}
        <section aria-labelledby="visit-heading" className="border-t border-hairline block-y">
          <div className="measure grid gap-10 md:grid-cols-[298px_1fr] md:gap-12">
            <figure className="w-full max-w-[298px] rounded-plate border border-hairline">
              <Image
                src={practice.officeExterior.src}
                alt={practice.officeExterior.alt}
                width={practice.officeExterior.width}
                height={practice.officeExterior.height}
                sizes="298px"
                className="w-full"
              />
              <figcaption className="border-t border-hairline px-4 py-3 font-[family-name:var(--pv-font-meta)] text-meta text-ink-muted">
                {address.street}
                <br />
                {address.cityStateZip}
              </figcaption>
            </figure>

            <div>
              <p className="font-[family-name:var(--pv-font-meta)] text-label text-ink-muted uppercase">
                {visitSection.eyebrow}
              </p>
              <h2 id="visit-heading" className="pt-4 font-display text-title text-ink">
                {visitSection.heading}
              </h2>
              <p className="max-w-reading pt-5 text-body text-ink-muted">{visitSection.homeBody}</p>

              <div className="pt-7">
                <div className="flex gap-3 border-t border-hairline py-4">
                  <span
                    className="mt-0.5 text-[1.125rem] leading-none text-ink-muted"
                    aria-hidden="true"
                  >
                    <Glyph as={UI.clock} />
                  </span>
                  <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1">
                    {practice.hours.rows.map((row) => (
                      <Fragment key={row.days}>
                        <dt className="font-[family-name:var(--pv-font-meta)] text-meta text-ink-muted">
                          {row.days}
                        </dt>
                        <dd className="font-[family-name:var(--pv-font-meta)] text-meta text-ink tabular-nums">
                          {row.time}
                        </dd>
                      </Fragment>
                    ))}
                  </dl>
                </div>
                <p className="flex gap-3 border-t border-hairline py-4 font-[family-name:var(--pv-font-meta)] text-meta text-ink">
                  <span
                    className="mt-0.5 text-[1.125rem] leading-none text-ink-muted"
                    aria-hidden="true"
                  >
                    <Glyph as={UI.parking} />
                  </span>
                  {parking}
                </p>
              </div>

              <p className="pt-6">
                <Link
                  href="/visit"
                  className="inline-flex items-center gap-2 font-[family-name:var(--pv-font-meta)] text-meta font-semibold text-accent underline underline-offset-4 transition-state hover:text-accent-hover"
                >
                  {visitSection.homeCta}
                  <Glyph as={UI.arrowRight} />
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* --- Appointment band --------------------------------------------
            The one full-bleed colour field in A. Flat accent — no gradient.
            Focus rings inside it switch to paper via --site-focus-color. */}
        <section
          aria-labelledby="appointment-heading"
          className="bg-accent text-ink-inv [--site-focus-color:var(--site-focus-color-on-accent)]"
        >
          <div className="measure grid items-center gap-10 block-y md:grid-cols-[1.2fr_1fr] md:gap-16">
            <div>
              <p className="font-[family-name:var(--pv-font-meta)] text-label text-ink-inv-muted uppercase">
                {appointmentCta.eyebrow}
              </p>
              <h2 id="appointment-heading" className="pt-4 font-display text-title">
                {appointmentCta.heading}
              </h2>
              <p className="max-w-reading pt-4 text-body text-ink-inv opacity-90">
                {appointmentCta.body}
              </p>
            </div>
            <div className="flex flex-col items-start gap-5">
              <Link
                href={practice.navCta.href}
                className="inline-flex min-h-[3rem] items-center gap-2 rounded-control bg-on-accent px-6 font-[family-name:var(--pv-font-meta)] text-meta font-semibold text-accent transition-state hover:opacity-90"
              >
                {appointmentCta.buttonLabel}
                <Glyph as={UI.arrowRight} />
              </Link>
              <p className="text-lede">
                {appointmentCta.callPrefix}{' '}
                <a href={phone.href} className="font-semibold underline underline-offset-4">
                  {phone.display}
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooterA />
      <DirectionSwitcher current="a" />
    </div>
  )
}
