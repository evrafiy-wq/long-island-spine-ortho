import Image from 'next/image'
import Link from 'next/link'
import { AppointmentCta } from '@/components/site/AppointmentCta'
import { ConditionIndex } from '@/components/site/ConditionIndex'
import { Glyph } from '@/components/site/Glyph'
import { HoursParking } from '@/components/site/HoursParking'
import { PhysicianBlock } from '@/components/site/PhysicianBlock'
import { ServiceList } from '@/components/site/ServiceList'
import { UI } from '@/components/site/icons'
import { practice } from '@/content/practice'

/**
 * Homepage.
 *
 * Section order is deliberate and was revised once: the physician and the
 * clinic now sit directly under the credentials, before the clinical focus and
 * the condition index. Dr. Rafiy used to be two thirds of the way down the
 * page, behind ~700 words of condition detail.
 *
 * Content rules (see CLAUDE.md): `credentials[3]` (languages) and
 * `heroHighlights` are never rendered — `heroHighlights[1]` IS the languages
 * claim — and `insuranceCarriers` appears only on /patient-info, where the
 * page's own copy tells the visitor to confirm coverage by phone. Both are
 * flagged UNVERIFIED in content/practice.ts.
 */

/** The hero's action block needs a label and no existing copy fills the slot. */
const ACTION_BLOCK_LABEL = '[PLACEHOLDER: hero action-block label, e.g. "New and current patients"]'

export default function HomePage() {
  const { hero, visitSection, appointmentCta } = practice.copy
  const { phone, address, mapsUrl } = practice.contact

  return (
    <>
      {/* --- Hero: asymmetric, no portrait, no centred stack ------------- */}
      <section className="block-y">
        <div className="measure grid items-start gap-12 xl:grid-cols-[1.6fr_1fr] xl:gap-20">
          <div>
            <p className="text-label text-ink-muted uppercase">{hero.eyebrow}</p>
            <h1 className="max-w-[18ch] pt-6 font-display text-display text-balance text-ink">
              {hero.headingLead}
              {/* The one place the accent touches display type. */}
              <em className="font-semibold text-accent not-italic">{hero.headingEmphasis}</em>
            </h1>
            <p className="max-w-lede pt-8 text-lede text-ink-muted">{hero.intro}</p>
          </div>

          <div className="border border-hairline p-6 xl:mt-4">
            <p className="text-label text-ink-muted uppercase">{ACTION_BLOCK_LABEL}</p>
            <Link
              href={practice.navCta.href}
              className="mt-5 flex min-h-[3.25rem] items-center justify-between gap-3 rounded-control bg-accent px-5 text-meta font-semibold text-on-accent transition-state hover:bg-accent-hover"
            >
              {practice.navCta.label}
              <Glyph as={UI.arrowRight} />
            </Link>
            <a
              href={phone.href}
              className="mt-5 flex items-baseline justify-between gap-3 border-t border-hairline pt-5 transition-state hover:text-accent"
            >
              <span className="text-label text-ink-muted uppercase">
                {appointmentCta.callPrefix}
              </span>
              <span className="font-display text-subtitle tracking-tight text-ink">
                {phone.display}
              </span>
            </a>
            <p className="mt-5 border-t border-hairline pt-5 text-meta text-ink-muted">
              {practice.hours.summary}
            </p>
          </div>
        </div>
      </section>

      {/* --- Credential strip: the four-second credibility payload ------- */}
      <section aria-label="Credentials" className="border-y border-hairline bg-surface">
        <dl className="measure grid md:grid-cols-3">
          {practice.credentials.slice(0, 3).map((credential, index) => (
            <div
              key={credential.term}
              className={
                index === 0
                  ? 'py-7 md:pr-10'
                  : 'border-t border-hairline py-7 md:border-t-0 md:border-l md:px-10 md:last:pr-0'
              }
            >
              <dt className="text-label text-ink-muted uppercase">{credential.term}</dt>
              <dd className="pt-2 font-display text-subtitle tracking-tight text-ink">
                {credential.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <PhysicianBlock variant="home" />

      {/* --- Hicksville clinic ------------------------------------------- */}
      <section aria-labelledby="visit-heading" className="border-t border-hairline block-y">
        <div className="measure grid gap-10 md:grid-cols-[298px_1fr] md:gap-12 xl:gap-20">
          <figure className="w-full max-w-[298px]">
            {/* 597x335 native, so 298px is an exact 2x fit with zero
                upscaling. It works as proof of place, not as signage. */}
            <Image
              src={practice.officeExterior.src}
              alt={practice.officeExterior.alt}
              width={practice.officeExterior.width}
              height={practice.officeExterior.height}
              sizes="298px"
              className="w-full rounded-plate"
            />
            <figcaption className="pt-3 text-meta text-ink-muted">
              {address.street}
              <br />
              {address.cityStateZip}
            </figcaption>
          </figure>

          <div>
            <p className="text-label text-ink-muted uppercase">{visitSection.eyebrow}</p>
            <h2 id="visit-heading" className="pt-4 font-display text-title tracking-tight text-ink">
              {visitSection.heading}
            </h2>
            <p className="max-w-reading pt-5 text-body text-ink-muted">{visitSection.homeBody}</p>
            <div className="pt-7">
              <HoursParking />
            </div>
            <p className="flex flex-wrap gap-x-8 gap-y-3 pt-6">
              <Link
                href="/visit"
                className="inline-flex min-h-6 items-center gap-2 text-meta font-semibold text-accent underline underline-offset-4 transition-state hover:text-accent-hover"
              >
                {visitSection.homeCta}
                <Glyph as={UI.arrowRight} />
              </Link>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener"
                className="inline-flex min-h-6 items-center gap-2 text-meta font-semibold text-accent underline underline-offset-4 transition-state hover:text-accent-hover"
              >
                <Glyph as={UI.mapPin} />
                Open in Google Maps
              </a>
            </p>
          </div>
        </div>
      </section>

      <ServiceList variant="home" headingId="care-heading" />
      <ConditionIndex />
      <AppointmentCta />
    </>
  )
}
