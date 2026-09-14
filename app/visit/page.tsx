import type { Metadata } from 'next'
import { AppointmentForm } from '@/components/sections/AppointmentForm'
import { LocationTabs } from '@/components/sections/LocationTabs'
import { practice } from '@/content/practice'

export const metadata: Metadata = {
  title: 'Visit Us & Request an Appointment',
  description:
    'Visit Long Island Spine and Orthopedics at 87 W Old Country Rd, Hicksville, NY. Get directions, office hours, and request an appointment online.',
}

export default function VisitPage() {
  const { visitSection } = practice.copy
  const { address, mapsUrl, parking } = practice.contact

  return (
    <>
      <section className="section visit-section" id="visit">
        <div className="visit-layout site-container">
          <div className="visit-copy">
            <p className="eyebrow">{visitSection.eyebrow}</p>
            <h2>{visitSection.heading}</h2>
            <address className="address-block">
              <strong>{address.street}</strong>
              <span>{address.cityStateZip}</span>
            </address>

            <div className="office-hours">
              <p className="office-hours-label">Office Hours</p>
              <dl className="hours-list">
                {practice.hours.rows.map((row) => (
                  <div key={row.days}>
                    <dt>{row.days}</dt>
                    <dd>{row.time}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <p>{parking}</p>

            <p>
              <a className="text-link" href={mapsUrl} target="_blank" rel="noopener">
                Open in Google Maps <span>→</span>
              </a>
            </p>
          </div>

          <LocationTabs />
        </div>
      </section>

      <AppointmentForm />
    </>
  )
}
