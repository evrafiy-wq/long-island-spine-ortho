import type { Metadata } from 'next'
import Link from 'next/link'
import { AppointmentCta } from '@/components/sections/AppointmentCta'
import { PhysicianSection } from '@/components/sections/PhysicianSection'
import { practice } from '@/content/practice'

export const metadata: Metadata = {
  title: 'Meet Dr. Rafiy',
  description:
    'Dr. Philip M. Rafiy, MD is a board-certified orthopedic surgeon specializing in spine surgery and adult musculoskeletal care in Hicksville, NY.',
}

export default function AboutPage() {
  const { approachSection } = practice.copy

  return (
    <>
      <PhysicianSection variant="about" />

      <section className="section section-steps" id="practice">
        <div className="steps-layout site-container">
          <div className="steps-heading">
            <p className="eyebrow">{approachSection.eyebrow}</p>
            <h2>{approachSection.heading}</h2>
            <p>{approachSection.body}</p>
            <Link className="text-link" href={practice.navCta.href}>
              {approachSection.cta} <span>→</span>
            </Link>
          </div>
          <ol className="steps-list">
            {practice.approachSteps.map((step) => (
              <li key={step.number}>
                <span>{step.number}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <AppointmentCta />
    </>
  )
}
