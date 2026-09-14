import { Icon } from '@/components/Icon'
import { practice } from '@/content/practice'

interface CareGridProps {
  /** The homepage shows three cards with the short copy; /services shows all
   *  four with the long copy. Both wordings are in content/practice.ts. */
  variant: 'home' | 'services'
}

export function CareGrid({ variant }: CareGridProps) {
  const services =
    variant === 'home'
      ? practice.services.filter((service) => service.onHomepage)
      : practice.services

  return (
    <div className="care-grid">
      {services.map((service) => (
        <article className="care-card" key={service.id}>
          <div className={`care-icon ${service.accent}`}>
            <Icon name={service.icon} />
          </div>
          <h3>{service.title}</h3>
          <p>{variant === 'home' ? service.summary : service.description}</p>
        </article>
      ))}
    </div>
  )
}
