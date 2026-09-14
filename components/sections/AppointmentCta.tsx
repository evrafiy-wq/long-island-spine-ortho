import Link from 'next/link'
import { practice } from '@/content/practice'

/** The closing "Ready to schedule a consultation?" band, shared by /, /services,
 *  /about and /patient-info. */
export function AppointmentCta() {
  const { appointmentCta } = practice.copy
  const { phone } = practice.contact

  return (
    <section className="appointment-section">
      <div className="appointment-card site-container">
        <div>
          <p className="eyebrow eyebrow-light">{appointmentCta.eyebrow}</p>
          <h2>{appointmentCta.heading}</h2>
          <p>{appointmentCta.body}</p>
        </div>
        <div className="appointment-actions">
          <Link className="button button-light" href={practice.navCta.href}>
            {appointmentCta.buttonLabel}
          </Link>
          <p>
            {appointmentCta.callPrefix}{' '}
            <a href={phone.href} style={{ color: 'inherit' }}>
              {phone.display}
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
