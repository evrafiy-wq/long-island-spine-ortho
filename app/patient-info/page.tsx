import type { Metadata } from 'next'
import { Icon } from '@/components/Icon'
import { AppointmentCta } from '@/components/sections/AppointmentCta'
import { FaqAccordion } from '@/components/sections/FaqAccordion'
import { practice } from '@/content/practice'

export const metadata: Metadata = {
  title: 'Patient Resources & FAQ',
  description:
    'Download new patient forms, review accepted insurance plans, and find answers to common questions about visiting Long Island Spine and Orthopedics.',
}

export default function PatientInfoPage() {
  const { resourcesSection, insuranceSection, faqSection } = practice.copy

  return (
    <>
      <section className="section-resources" id="resources">
        <div className="site-container">
          <div className="section-intro centered-intro" style={{ marginInline: 'auto' }}>
            <p className="eyebrow" style={{ justifyContent: 'center' }}>
              {resourcesSection.eyebrow}
            </p>
            <h2>{resourcesSection.heading}</h2>
            <p>{resourcesSection.body}</p>
          </div>

          <div className="resources-grid">
            {practice.forms.map((form) => (
              <a
                className="resource-card"
                href={form.file}
                target="_blank"
                rel="noopener"
                key={form.id}
              >
                <div className="resource-icon">
                  <Icon name="document" />
                </div>
                <div className="resource-info">
                  <h3>{form.title}</h3>
                  <p>{form.description}</p>
                  <span className="resource-action">
                    {resourcesSection.downloadLabel} <Icon name="download" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-insurance">
        <div className="site-container">
          <div className="section-intro centered-intro" style={{ marginInline: 'auto' }}>
            <p className="eyebrow" style={{ justifyContent: 'center' }}>
              {insuranceSection.eyebrow}
            </p>
            <h2>{insuranceSection.heading}</h2>
            <p>{insuranceSection.body}</p>
          </div>
          <div className="insurance-grid">
            {practice.insuranceCarriers.map((carrier) => (
              <div className="insurance-logo" key={carrier}>
                <span>{carrier}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-faq" id="faq">
        <div className="site-container">
          <div className="section-intro centered-intro" style={{ marginInline: 'auto' }}>
            <p className="eyebrow" style={{ justifyContent: 'center' }}>
              {faqSection.eyebrow}
            </p>
            <h2>{faqSection.heading}</h2>
            <p>{faqSection.body}</p>
          </div>

          <FaqAccordion />
        </div>
      </section>

      <AppointmentCta />
    </>
  )
}
