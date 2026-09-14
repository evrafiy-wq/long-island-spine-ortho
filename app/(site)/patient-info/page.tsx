import type { Metadata } from 'next'
import { AppointmentCta } from '@/components/site/AppointmentCta'
import { FaqList } from '@/components/site/FaqList'
import { PageHeader } from '@/components/site/PageHeader'
import { pageTitle } from '@/lib/pageTitle'
import { ResourceList } from '@/components/site/ResourceList'
import { practice } from '@/content/practice'

export const metadata: Metadata = {
  title: 'Patient Resources & FAQ',
  description:
    'Download new patient forms and find answers to common questions about visiting Long Island Spine and Orthopedics in Hicksville, NY.',
}

export default function PatientInfoPage() {
  const { resourcesSection, insuranceSection, faqSection } = practice.copy

  return (
    <>
      <PageHeader heading={pageTitle('/patient-info')} />

      {/* --- Forms -------------------------------------------------------- */}
      <section aria-labelledby="resources-heading" id="resources" className="block-y">
        <div className="measure">
          <p className="text-label text-ink-muted uppercase">{resourcesSection.eyebrow}</p>
          <div className="grid gap-x-16 gap-y-3 pt-4 lg:grid-cols-[1fr_1fr] lg:items-end">
            <h2 id="resources-heading" className="font-display text-title tracking-tight text-ink">
              {resourcesSection.heading}
            </h2>
            <p className="max-w-reading text-body text-ink-muted">{resourcesSection.body}</p>
          </div>
          <ResourceList />
        </div>
      </section>

      {/* --- Insurance ----------------------------------------------------
          The five carriers are flagged UNVERIFIED in content/practice.ts:
          NYU Langone's directory for Dr. Rafiy lists three, overlapping on
          Aetna alone. They stay on this page because the page's own copy
          already tells the visitor to confirm coverage with the office, and
          because removing a list a patient may have relied on is the
          practice's call — but they are rendered as plain text rather than
          logo-like tiles, and they appear on no other page. Resolve with the
          billing office before launch. */}
      <section
        aria-labelledby="insurance-heading"
        className="border-y border-hairline bg-surface block-y"
      >
        <div className="measure">
          <p className="text-label text-ink-muted uppercase">{insuranceSection.eyebrow}</p>
          <div className="grid gap-x-16 gap-y-3 pt-4 lg:grid-cols-[1fr_1fr] lg:items-end">
            <h2 id="insurance-heading" className="font-display text-title tracking-tight text-ink">
              {insuranceSection.heading}
            </h2>
            <p className="max-w-reading text-body text-ink-muted">{insuranceSection.body}</p>
          </div>
          <ul className="grid gap-x-16 pt-10 sm:grid-cols-2 xl:grid-cols-3">
            {practice.insuranceCarriers.map((carrier) => (
              <li
                key={carrier}
                className="border-t border-hairline py-4 font-display text-subtitle tracking-tight text-ink"
              >
                {carrier}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* --- FAQ ----------------------------------------------------------
          `practice.faq` includes `faq-languages` ("English, French, and
          Spanish"), which is flagged UNVERIFIED in content/practice.ts —
          NYU Langone's directory for Dr. Rafiy lists English only. It is NOT
          propagated anywhere new, but it does still render here because it was
          already live on this page and removing patient-facing content the
          practice published is their call, not ours. Resolve it with the
          office; if it turns out to be wrong, drop the item from
          content/practice.ts and this list follows automatically. */}
      <section aria-labelledby="faq-heading" id="faq" className="block-y">
        <div className="measure">
          <p className="text-label text-ink-muted uppercase">{faqSection.eyebrow}</p>
          <div className="grid gap-x-16 gap-y-3 pt-4 lg:grid-cols-[1fr_1fr] lg:items-end">
            <h2 id="faq-heading" className="font-display text-title tracking-tight text-ink">
              {faqSection.heading}
            </h2>
            <p className="max-w-reading text-body text-ink-muted">{faqSection.body}</p>
          </div>
          <div className="pt-10">
            <FaqList />
          </div>
        </div>
      </section>

      <AppointmentCta />
    </>
  )
}
