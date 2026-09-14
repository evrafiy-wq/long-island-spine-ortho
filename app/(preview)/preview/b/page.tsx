import Image from 'next/image'
import Link from 'next/link'
import { CallDock } from '@/components/preview/b/CallDock'
import { ServiceDisclosures } from '@/components/preview/b/ServiceDisclosures'
import { SiteFooterB } from '@/components/preview/b/SiteFooterB'
import { SiteHeaderB } from '@/components/preview/b/SiteHeaderB'
import { DirectionSwitcher } from '@/components/site/DirectionSwitcher'
import { Glyph } from '@/components/site/Glyph'
import { UI } from '@/components/site/icons'
import { practice } from '@/content/practice'
import { fontsB } from '@/lib/preview-fonts/direction-b'

/**
 * Direction B — Warm Practitioner.
 *
 * B stakes the page on the one good photograph the practice has. The portrait
 * is 1122x1402, natively 4:5, so the full-bleed mobile placement is a straight
 * downscale with no crop and no upscaling even at DPR 3 (375 * 3 = 1125).
 * There is no second photograph and none is faked: the office exterior is a
 * 597x335 phone snapshot and appears once, capped at 298px.
 *
 * Same content rules as A: credentials[3] (Languages) and heroHighlights are
 * never rendered, because heroHighlights[1] IS the unverified languages claim.
 * insuranceCarriers appears nowhere.
 */
export default function PreviewBPage() {
  const { hero, careSection, physicianSection, approachSection, visitSection, appointmentCta } =
    practice.copy
  const { phone, address, parking } = practice.contact
  const { portrait, name, specialty, bio } = practice.physician

  return (
    // pb-24 on mobile keeps the fixed CallDock from permanently covering the
    // end of the footer; it is removed once the dock is gone at md.
    <div
      data-direction="b"
      className={`${fontsB} min-h-dvh bg-canvas pb-24 font-body text-body text-ink md:pb-0`}
    >
      <a
        href="#main-content"
        className="sr-only bg-accent font-[family-name:var(--pv-font-meta)] text-meta text-on-accent focus:not-sr-only focus:absolute focus:top-2 focus:left-1/2 focus:z-50 focus:measure focus:-translate-x-1/2 focus:px-4 focus:py-3"
      >
        Skip to main content
      </a>

      <SiteHeaderB />

      <main id="main-content">
        {/* --- Portrait, then name bar, then the letter --------------------
            The doctor's face is the first thing on the screen. No scrim, no
            gradient overlay, no text burned into the image — the name goes in
            a solid bar BELOW the photograph, which makes it a caption rather
            than a hero treatment. Full-bleed and radius 0 on mobile so it
            reads as a photograph and not a card. */}
        <section aria-labelledby="hero-heading">
          <div className="lg:measure lg:grid lg:grid-cols-[400px_1fr] lg:items-start lg:gap-16 lg:pt-16">
            <figure className="lg:overflow-hidden lg:rounded-plate">
              <Image
                src={portrait.src}
                alt={portrait.alt}
                width={portrait.width}
                height={portrait.height}
                sizes="(max-width: 1023px) 100vw, 400px"
                quality={82}
                priority
                className="w-full"
              />
              <figcaption className="bg-dark px-[var(--spacing-gutter)] py-4 lg:px-6">
                <p className="font-display text-subtitle text-ink-inv">{name}</p>
                <p className="pt-0.5 font-[family-name:var(--pv-font-meta)] text-meta text-ink-inv-muted">
                  {specialty}
                </p>
              </figcaption>
            </figure>

            <div className="measure block-y lg:mx-0 lg:w-auto lg:pt-0">
              <p className="font-[family-name:var(--pv-font-meta)] text-label text-ink-muted uppercase">
                {hero.eyebrow}
              </p>
              <h1
                id="hero-heading"
                className="max-w-[26ch] pt-4 font-display text-display text-balance text-ink"
              >
                {hero.headingLead}
                {/* B's one typographic flourish: Newsreader's true italic, at
                    the same size and colour as the rest of the line. */}
                <em className="italic">{hero.headingEmphasis}</em>
              </h1>
              <p className="max-w-lede pt-5 text-lede text-ink-muted">{hero.intro}</p>

              <div className="flex flex-col gap-3 pt-8 sm:flex-row sm:items-center sm:gap-4">
                <Link
                  href={practice.navCta.href}
                  className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-control bg-accent px-6 font-[family-name:var(--pv-font-meta)] text-meta font-semibold text-on-accent transition-state hover:bg-accent-hover"
                >
                  {hero.primaryCta}
                  <Glyph as={UI.arrowRight} />
                </Link>
                <a
                  href={phone.href}
                  className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-control border border-border-strong px-6 font-[family-name:var(--pv-font-meta)] text-meta font-semibold text-ink transition-state hover:border-accent hover:text-accent"
                >
                  <Glyph as={UI.phone} />
                  Call {phone.display}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* --- Three promises ----------------------------------------------
            One column at every width, at lede size, headingless. Read as the
            doctor's three commitments rather than a "trust bar" of three
            equal cells. The strings already carry their own quote marks. */}
        <section aria-label="Our commitments" className="border-t border-hairline block-y">
          <ul className="measure">
            {practice.trustStatements.map((statement, index) => (
              <li
                key={statement}
                className={
                  index === 0
                    ? 'flex max-w-reading gap-4 pb-6'
                    : 'flex max-w-reading gap-4 border-t border-hairline py-6 last:pb-0'
                }
              >
                <span className="mt-1 text-[1.25rem] leading-none text-accent" aria-hidden="true">
                  <Glyph as={UI.check} />
                </span>
                <p className="text-lede text-ink">{statement}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* --- What we help with ------------------------------------------- */}
        <section aria-labelledby="care-heading" className="border-t border-hairline block-y">
          <div className="measure">
            <p className="font-[family-name:var(--pv-font-meta)] text-label text-ink-muted uppercase">
              {careSection.eyebrow}
            </p>
            <h2 id="care-heading" className="max-w-[24ch] pt-4 font-display text-title text-ink">
              {careSection.heading}
            </h2>
            <p className="max-w-reading pt-4 text-body text-ink-muted">{careSection.body}</p>

            <div className="pt-10">
              <ServiceDisclosures />
            </div>

            <p className="pt-7">
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

        {/* --- How care proceeds -------------------------------------------
            B's most distinctive addition, and it costs zero new copy:
            practice.approachSteps already exists and is currently only used on
            /about. It IS the "a doctor who will explain things to you"
            promise, in the practice's own words. */}
        <section aria-labelledby="approach-heading" className="bg-sunken block-y">
          <div className="measure">
            <p className="font-[family-name:var(--pv-font-meta)] text-label text-ink-muted uppercase">
              {approachSection.eyebrow}
            </p>
            <h2
              id="approach-heading"
              className="max-w-[24ch] pt-4 font-display text-title text-ink"
            >
              {approachSection.heading}
            </h2>
            <p className="max-w-reading pt-4 text-body text-ink-muted">{approachSection.body}</p>

            <ol className="pt-10">
              {practice.approachSteps.map((step) => (
                <li
                  key={step.number}
                  className="grid grid-cols-[2.5rem_1fr] gap-x-4 border-t border-hairline py-7 md:grid-cols-[4rem_1fr] md:gap-x-6"
                >
                  <span className="pt-2 font-[family-name:var(--pv-font-meta)] text-label text-accent tabular-nums">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="font-display text-subtitle text-ink">{step.title}</h3>
                    <p className="max-w-reading pt-2 text-body text-ink-muted">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <p className="border-t border-hairline pt-7">
              <a
                href={phone.href}
                className="inline-flex items-center gap-2 font-[family-name:var(--pv-font-meta)] text-meta font-semibold text-accent underline underline-offset-4 transition-state hover:text-accent-hover"
              >
                <Glyph as={UI.phone} />
                {approachSection.cta}
              </a>
            </p>
          </div>
        </section>

        {/* --- Physician block, warm dark ----------------------------------
            The portrait's second and last appearance: an 88px square
            signature crop. object-position is nudged up because the source has
            roughly 15% headroom above the crown, so a centred square crop
            would cut the chin. Focus rings switch to the on-dark accent. */}
        <section
          aria-labelledby="physician-heading"
          className="bg-dark block-y text-ink-inv [--site-focus-color:var(--site-focus-color-on-dark)]"
        >
          <div className="measure">
            <div className="flex max-w-reading items-center gap-5">
              <span className="relative size-22 shrink-0 overflow-hidden rounded-plate">
                <Image
                  src={portrait.src}
                  alt={portrait.altShort}
                  fill
                  sizes="88px"
                  className="object-cover object-[50%_18%]"
                />
              </span>
              <div>
                <p className="font-[family-name:var(--pv-font-meta)] text-label text-ink-inv-muted uppercase">
                  {physicianSection.eyebrow}
                </p>
                <p className="pt-1 font-display text-subtitle">{name}</p>
              </div>
            </div>

            <h2 id="physician-heading" className="max-w-[24ch] pt-8 font-display text-title">
              {physicianSection.heading}
            </h2>
            <p className="max-w-reading pt-5 text-lede text-ink-inv opacity-95">{bio}</p>

            <dl className="max-w-reading pt-8">
              {/* credentials[0..2]. Index 3 is the UNVERIFIED languages claim. */}
              {practice.credentials.slice(0, 3).map((credential) => (
                <div
                  key={credential.term}
                  className="grid gap-1 border-t border-white/15 py-4 md:grid-cols-[10rem_1fr] md:gap-4"
                >
                  <dt className="font-[family-name:var(--pv-font-meta)] text-label text-ink-inv-muted uppercase">
                    {credential.term}
                  </dt>
                  <dd className="font-[family-name:var(--pv-font-meta)] text-meta text-ink-inv">
                    {credential.value}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="pt-8">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 font-[family-name:var(--pv-font-meta)] text-meta font-semibold text-accent-inv underline underline-offset-4 transition-state hover:text-white"
              >
                {physicianSection.cta}
                <Glyph as={UI.arrowRight} />
              </Link>
            </p>
          </div>
        </section>

        {/* --- Visit -------------------------------------------------------- */}
        <section aria-labelledby="visit-heading" className="block-y">
          <div className="measure grid gap-10 md:grid-cols-[298px_1fr] md:gap-12">
            <figure className="w-full max-w-[298px] overflow-hidden rounded-plate">
              <Image
                src={practice.officeExterior.src}
                alt={practice.officeExterior.alt}
                width={practice.officeExterior.width}
                height={practice.officeExterior.height}
                sizes="298px"
                className="w-full"
              />
              <figcaption className="pt-3 font-[family-name:var(--pv-font-meta)] text-meta text-ink-muted">
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
                    className="mt-1 text-[1.125rem] leading-none text-accent"
                    aria-hidden="true"
                  >
                    <Glyph as={UI.clock} />
                  </span>
                  <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1">
                    {practice.hours.rows.map((row) => (
                      <div key={row.days} className="contents">
                        <dt className="font-[family-name:var(--pv-font-meta)] text-meta text-ink-muted">
                          {row.days}
                        </dt>
                        <dd className="font-[family-name:var(--pv-font-meta)] text-meta text-ink tabular-nums">
                          {row.time}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <p className="flex gap-3 border-t border-hairline py-4 font-[family-name:var(--pv-font-meta)] text-meta text-ink">
                  <span
                    className="mt-1 text-[1.125rem] leading-none text-accent"
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

        {/* --- Appointment -------------------------------------------------- */}
        <section
          aria-labelledby="appointment-heading"
          className="bg-accent block-y text-on-accent [--site-focus-color:var(--site-focus-color-on-accent)]"
        >
          <div className="measure">
            <p className="font-[family-name:var(--pv-font-meta)] text-label uppercase opacity-90">
              {appointmentCta.eyebrow}
            </p>
            <h2 id="appointment-heading" className="max-w-[24ch] pt-4 font-display text-title">
              {appointmentCta.heading}
            </h2>
            <p className="max-w-reading pt-4 text-lede opacity-95">{appointmentCta.body}</p>
            <div className="flex flex-col items-start gap-5 pt-8">
              <Link
                href={practice.navCta.href}
                className="inline-flex min-h-[3.25rem] items-center gap-2 rounded-control bg-on-accent px-6 font-[family-name:var(--pv-font-meta)] text-meta font-semibold text-accent transition-state hover:opacity-90"
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

      <SiteFooterB />
      <CallDock />
      <DirectionSwitcher current="b" />
    </div>
  )
}
