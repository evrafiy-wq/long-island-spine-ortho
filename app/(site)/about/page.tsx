import type { Metadata } from 'next'
import { AppointmentCta } from '@/components/site/AppointmentCta'
import { Glyph } from '@/components/site/Glyph'
import { PageHeader } from '@/components/site/PageHeader'
import { pageMetadata } from '@/lib/metadata'
import { pageTitle } from '@/lib/pageTitle'
import { PhysicianBlock } from '@/components/site/PhysicianBlock'
import { UI } from '@/components/site/icons'
import { practice } from '@/content/practice'
import Link from 'next/link'

export const metadata: Metadata = pageMetadata({
  title: 'Meet Dr. Rafiy',
  description:
    'Dr. Philip M. Rafiy, MD is a board-certified orthopedic surgeon specializing in spine surgery and adult musculoskeletal care in Hicksville, NY.',
  path: '/about',
})

export default function AboutPage() {
  const { approachSection, physicianSection } = practice.copy

  return (
    <>
      <PageHeader heading={pageTitle('/about')} intro={physicianSection.heading} />

      <PhysicianBlock variant="about" />

      {/* --- How care proceeds ------------------------------------------- */}
      <section
        aria-labelledby="approach-heading"
        id="practice"
        className="border-t border-hairline block-y"
      >
        <div className="measure">
          <p className="text-label text-ink-muted uppercase">{approachSection.eyebrow}</p>
          <div className="grid gap-x-16 gap-y-3 pt-4 lg:grid-cols-[1fr_1fr] lg:items-end">
            <h2 id="approach-heading" className="font-display text-title tracking-tight text-ink">
              {approachSection.heading}
            </h2>
            <p className="max-w-reading text-body text-ink-muted">{approachSection.body}</p>
          </div>

          <ol className="grid gap-x-16 pt-10 md:grid-cols-3">
            {practice.approachSteps.map((step) => (
              <li key={step.number} className="border-t border-hairline py-6">
                <span className="text-label text-accent tabular-nums">{step.number}</span>
                <h3 className="pt-3 font-display text-subtitle tracking-tight text-ink">
                  {step.title}
                </h3>
                <p className="pt-2 text-body text-ink-muted">{step.description}</p>
              </li>
            ))}
          </ol>

          <p className="border-t border-hairline pt-7">
            <Link
              href={practice.navCta.href}
              className="inline-flex min-h-6 items-center gap-2 text-meta font-semibold text-accent underline underline-offset-4 transition-state hover:text-accent-hover"
            >
              {approachSection.cta}
              <Glyph as={UI.arrowRight} />
            </Link>
          </p>
        </div>
      </section>

      <AppointmentCta />
    </>
  )
}
