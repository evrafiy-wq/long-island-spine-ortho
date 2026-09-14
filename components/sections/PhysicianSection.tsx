import Image from 'next/image'
import Link from 'next/link'
import { practice } from '@/content/practice'

interface PhysicianSectionProps {
  /** The homepage closes with a link to /about; /about lists credentials instead. */
  variant: 'home' | 'about'
}

export function PhysicianSection({ variant }: PhysicianSectionProps) {
  const { physicianSection } = practice.copy
  const { portrait, bio } = practice.physician

  return (
    <section
      className="section physician-section"
      {...(variant === 'about' ? { id: 'physician' } : {})}
    >
      <div className="physician-layout site-container">
        <div className="physician-photo-wrap">
          <div className="photo-accent" aria-hidden="true" />
          <div className="physician-photo">
            <Image
              src={portrait.src}
              alt={portrait.altShort}
              width={portrait.width}
              height={portrait.height}
              sizes="(max-width: 930px) 100vw, 425px"
            />
          </div>
        </div>
        <div className="physician-copy">
          <p className="eyebrow">{physicianSection.eyebrow}</p>
          <h2>{physicianSection.heading}</h2>
          <p>{bio}</p>

          {variant === 'about' ? (
            <dl className="credential-list">
              {practice.credentials.map((credential) => (
                <div key={credential.term}>
                  <dt>{credential.term}</dt>
                  <dd>{credential.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p style={{ marginTop: '1.5rem' }}>
              <Link className="button button-primary" href="/about">
                {physicianSection.cta}
              </Link>
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
