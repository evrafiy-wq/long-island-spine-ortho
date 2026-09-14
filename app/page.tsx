import Image from 'next/image'
import Link from 'next/link'
import { Icon } from '@/components/Icon'
import { AppointmentCta } from '@/components/sections/AppointmentCta'
import { CareGrid } from '@/components/sections/CareGrid'
import { CareSectionIntro } from '@/components/sections/CareSectionIntro'
import { PhysicianSection } from '@/components/sections/PhysicianSection'
import { TrustBar } from '@/components/sections/TrustBar'
import { practice } from '@/content/practice'

export default function HomePage() {
  const { hero, careSection, visitSection } = practice.copy
  const { phone, address } = practice.contact
  const { portrait, name, specialty } = practice.physician

  return (
    <>
      <section className="hero" id="top">
        <div className="hero-orb hero-orb-one" aria-hidden="true" />
        <div className="hero-orb hero-orb-two" aria-hidden="true" />
        <div className="hero-layout site-container">
          <div className="hero-copy">
            <p className="eyebrow">{hero.eyebrow}</p>
            <h1>
              {hero.headingLead}
              <em>{hero.headingEmphasis}</em>
            </h1>
            <p className="hero-intro">{hero.intro}</p>

            <div className="hero-actions">
              <Link className="button button-primary" href={practice.navCta.href}>
                {hero.primaryCta}
              </Link>
              <a className="text-link" href={phone.href}>
                Call {phone.display} <span>→</span>
              </a>
            </div>

            <ul className="hero-highlights">
              {practice.heroHighlights.map((highlight) => (
                <li key={highlight.text}>
                  <Icon name={highlight.icon} />
                  {highlight.text}
                </li>
              ))}
            </ul>
          </div>

          <div className="hero-portrait-wrap">
            <div className="hero-portrait-frame">
              <Image
                src={portrait.src}
                alt={portrait.alt}
                width={portrait.width}
                height={portrait.height}
                sizes="(max-width: 930px) 100vw, 460px"
                priority
              />
            </div>
            <div className="portrait-caption">
              <span className="portrait-caption-mark">S</span>
              <p>
                <strong>{name}</strong>
                <span>{specialty}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <TrustBar />

      <section className="section">
        <div className="site-container">
          <CareSectionIntro />
          <CareGrid variant="home" />

          <p style={{ marginTop: '2.5rem' }}>
            <Link className="text-link" href="/services">
              {careSection.allServicesLink} <span>→</span>
            </Link>
          </p>
        </div>
      </section>

      <PhysicianSection variant="home" />

      <section className="section visit-section">
        <div className="visit-layout site-container">
          <div className="location-photo">
            <Image
              src={practice.officeExterior.src}
              alt={practice.officeExterior.alt}
              width={practice.officeExterior.width}
              height={practice.officeExterior.height}
              sizes="(max-width: 930px) 100vw, 560px"
            />
            <p className="location-photo-label">
              <span aria-hidden="true">
                <Icon name="mapPin" width={14} height={14} />
              </span>
              {address.street}, {address.city}, {address.state}
            </p>
          </div>
          <div className="visit-copy">
            <p className="eyebrow">{visitSection.eyebrow}</p>
            <h2>{visitSection.heading}</h2>
            <p>{visitSection.homeBody}</p>
            <p>
              <Link className="text-link" href="/visit">
                {visitSection.homeCta} <span>→</span>
              </Link>
            </p>
          </div>
        </div>
      </section>

      <AppointmentCta />
    </>
  )
}
