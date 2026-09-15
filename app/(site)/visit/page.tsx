import type { Metadata } from 'next'
import { AppointmentForm } from '@/components/site/AppointmentForm'
import { Glyph } from '@/components/site/Glyph'
import { HoursParking } from '@/components/site/HoursParking'
import { LocationPanel } from '@/components/site/LocationPanel'
import { PageHeader } from '@/components/site/PageHeader'
import { pageMetadata } from '@/lib/metadata'
import { pageTitle } from '@/lib/pageTitle'
import { UI } from '@/components/site/icons'
import { practice } from '@/content/practice'

export const metadata: Metadata = pageMetadata({
  title: 'Visit Us & Request an Appointment',
  description:
    'Visit Long Island Spine and Orthopedics at 87 W Old Country Rd, Hicksville, NY. Get directions, office hours, and request an appointment online.',
  path: '/visit',
})

export default function VisitPage() {
  const { visitSection } = practice.copy
  const { address, mapsUrl, phone } = practice.contact

  return (
    <>
      <PageHeader heading={pageTitle('/visit')} intro={visitSection.heading} />

      <section aria-labelledby="location-heading" id="visit" className="block-y">
        <div className="measure grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <p className="text-label text-ink-muted uppercase">{visitSection.eyebrow}</p>
            <h2
              id="location-heading"
              className="pt-4 font-display text-title tracking-tight text-ink"
            >
              {address.street}
            </h2>
            <address className="pt-1 text-lede text-ink-muted not-italic">
              {address.cityStateZip}
            </address>

            <div className="pt-8">
              <HoursParking />
            </div>

            <p className="flex flex-wrap gap-x-8 gap-y-3 pt-6">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener"
                className="inline-flex min-h-6 items-center gap-2 text-meta font-semibold text-accent underline underline-offset-4 transition-state hover:text-accent-hover"
              >
                <Glyph as={UI.mapPin} />
                Open in Google Maps
              </a>
              <a
                href={phone.href}
                className="inline-flex min-h-6 items-center gap-2 text-meta font-semibold text-accent underline underline-offset-4 transition-state hover:text-accent-hover"
              >
                <Glyph as={UI.phone} />
                {phone.display}
              </a>
            </p>
          </div>

          <LocationPanel />
        </div>
      </section>

      <AppointmentForm />
    </>
  )
}
