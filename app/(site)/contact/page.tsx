import type { Metadata } from 'next'
import { ContactForm } from '@/components/site/ContactForm'
import { Glyph } from '@/components/site/Glyph'
import { HoursParking } from '@/components/site/HoursParking'
import { PageHeader } from '@/components/site/PageHeader'
import { UI } from '@/components/site/icons'
import { practice } from '@/content/practice'
import { pageMetadata } from '@/lib/metadata'
import { pageTitle } from '@/lib/pageTitle'
import Link from 'next/link'

export const metadata: Metadata = pageMetadata({
  title: 'Contact the Office',
  description: `Contact ${practice.name} in Hicksville, NY with questions about scheduling, billing, insurance, or patient forms. Call ${practice.contact.phone.display} or send a message.`,
  path: '/contact',
})

/**
 * The general-enquiry page.
 *
 * Kept separate from /visit, which is where an APPOINTMENT is requested. Two
 * forms on one page would make a patient choose between them before they know
 * the difference, and the difference matters: one starts a clinical visit, the
 * other asks the front desk a question.
 *
 * The phone number leads. A page whose job is "get in touch" should not open
 * with a form when the practice answers a phone five days a week — the form is
 * for the other nineteen hours of the day.
 */
export default function ContactPage() {
  const { phone, address, mapsUrl } = practice.contact
  const { contactForm } = practice.copy

  return (
    <>
      <PageHeader heading={pageTitle('/contact')} intro={contactForm.body} />

      <section aria-labelledby="contact-direct-heading" className="block-y">
        <div className="measure grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <p className="text-label text-ink-muted uppercase">Fastest route</p>
            <h2
              id="contact-direct-heading"
              className="pt-4 font-display text-title tracking-tight text-ink"
            >
              Call the office
            </h2>

            <p className="pt-6">
              <a
                href={phone.href}
                className="inline-flex min-h-[3.25rem] items-center gap-3 rounded-control bg-accent px-5 font-display text-subtitle tracking-tight text-on-accent transition-state hover:bg-accent-hover"
              >
                <Glyph as={UI.phone} />
                {phone.display}
              </a>
            </p>

            <div className="pt-8">
              <HoursParking />
            </div>

            <address className="pt-8 text-body text-ink-muted not-italic">
              {address.street}
              <br />
              {address.cityStateZip}
            </address>

            <p className="flex flex-wrap gap-x-8 gap-y-3 pt-5">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener"
                className="inline-flex min-h-6 items-center gap-2 text-meta font-semibold text-accent underline underline-offset-4 transition-state hover:text-accent-hover"
              >
                <Glyph as={UI.mapPin} />
                Open in Google Maps
              </a>
              <Link
                href="/visit#appointment"
                className="inline-flex min-h-6 items-center gap-2 text-meta font-semibold text-accent underline underline-offset-4 transition-state hover:text-accent-hover"
              >
                Request an appointment instead
                <Glyph as={UI.arrowRight} />
              </Link>
            </p>
          </div>

          <div>
            <p className="text-label text-ink-muted uppercase">{contactForm.eyebrow}</p>
            <h2 className="pt-4 pb-7 font-display text-title tracking-tight text-ink">
              {contactForm.heading}
            </h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  )
}
