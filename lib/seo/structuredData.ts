import { practice } from '@/content/practice'
import { absoluteUrl, siteUrl } from '@/lib/siteUrl'

/**
 * The JSON-LD graph. This is the highest-leverage SEO surface on the site —
 * for a single-location medical practice, structured data is what populates
 * the knowledge panel, the map pin and the "open now" line in local results.
 *
 * THREE NODES, LINKED, rather than three separate scripts:
 *
 *   #practice   ["MedicalBusiness", "LocalBusiness"]
 *   #physician  "Physician"
 *   #website    "WebSite"
 *
 * `Physician` is schema.org's own type for "an individual physician or a
 * physician's office considered as a MedicalOrganization" — so it is an
 * Organization subtype, not a Person. That is why Dr. Rafiy is linked to the
 * practice with `subOrganization`/`parentOrganization` and not with
 * `employee`, which expects a Person and would be a type error a validator
 * will flag.
 *
 * WHAT IS DELIBERATELY ABSENT, and none of it is an oversight:
 *
 *  - `knowsLanguage`. The English/French/Spanish claim is flagged UNVERIFIED
 *    in content/practice.ts and contradicted by NYU Langone's directory.
 *    CLAUDE.md forbids propagating it into schema.org markup specifically,
 *    and this is exactly that surface.
 *  - `identifier` (the NPI) and `geo`. Both are null in
 *    `practice.identifiers` and are launch blockers. A guessed NPI attaches
 *    the practice's search presence to another clinician; guessed coordinates
 *    put the map pin somewhere the office is not. They appear automatically
 *    the moment the values are filled in.
 *  - Any FAQPage markup. The FAQ on /patient-info contains the same
 *    unverified languages answer, so marking it up would put the claim into
 *    Google's index in a rich result.
 *  - `priceRange`, `aggregateRating`, `review`, `sameAs`. Not known, and none
 *    of them is something to approximate on a medical practice.
 */

interface JsonLdNode {
  '@type': string | string[]
  '@id'?: string
  [key: string]: unknown
}

const PRACTICE_ID = `${siteUrl}/#practice`
const PHYSICIAN_ID = `${siteUrl}/#physician`
const WEBSITE_ID = `${siteUrl}/#website`

const postalAddress = {
  '@type': 'PostalAddress',
  streetAddress: practice.contact.address.street,
  addressLocality: practice.contact.address.city,
  addressRegion: practice.contact.address.state,
  postalCode: practice.contact.address.zip,
  addressCountry: 'US',
}

/**
 * Hours in the machine-readable form, derived from the same `practice.hours`
 * rows the page renders. Saturday and Sunday are emitted as an explicit closed
 * specification rather than omitted: a missing day is ambiguous, whereas
 * `opens: '00:00', closes: '00:00'` is how schema.org states "closed" and is
 * what keeps Google from showing the practice as open on a Sunday.
 */
const openingHours = [
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '09:00',
    closes: '17:00',
  },
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Saturday', 'Sunday'],
    opens: '00:00',
    closes: '00:00',
  },
]

function practiceNode(): JsonLdNode {
  const { npi, geo } = practice.identifiers

  return {
    '@type': ['MedicalBusiness', 'LocalBusiness'],
    '@id': PRACTICE_ID,
    name: practice.name,
    /**
     * The registered name from the CMS NPPES registry, surfaced here and
     * nowhere else on the site. Which name is the PUBLIC one is an unresolved
     * branding decision (CLAUDE.md), but `alternateName` is not a branding
     * choice — it is how a search engine reconciles the name on the website
     * with the name on the insurance directory, the NPI record and the Google
     * Business Profile. Omitting it makes those look like different practices.
     */
    alternateName: practice.legalName,
    description: practice.shortDescription,
    url: siteUrl,
    telephone: practice.contact.phone.display,
    address: postalAddress,
    hasMap: practice.contact.mapsUrl,
    openingHoursSpecification: openingHours,
    image: [absoluteUrl(practice.officeExterior.src), absoluteUrl(practice.physician.portrait.src)],
    logo: absoluteUrl('/icons/icon-512.png'),
    medicalSpecialty: ['https://schema.org/Musculoskeletal', 'https://schema.org/Surgical'],
    amenityFeature: {
      '@type': 'LocationFeatureSpecification',
      name: 'Free onsite parking',
      value: true,
    },
    /**
     * `hasOfferCatalog` with plain `Service` items rather than
     * `availableService`, which expects MedicalProcedure / MedicalTest /
     * MedicalTherapy. "Second Opinions" is not a procedure, and typing it as
     * one to satisfy the vocabulary would be asserting something clinical that
     * is not true.
     */
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Care and services',
      itemListElement: practice.services.map((service) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: service.title,
          description: service.description,
          url: absoluteUrl(`/services#${service.id}`),
        },
      })),
    },
    subOrganization: { '@id': PHYSICIAN_ID },
    ...(npi
      ? {
          identifier: {
            '@type': 'PropertyValue',
            propertyID: 'NPI',
            value: npi,
          },
        }
      : {}),
    ...(geo
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: geo.latitude,
            longitude: geo.longitude,
          },
        }
      : {}),
  }
}

function physicianNode(): JsonLdNode {
  const { npi } = practice.identifiers

  return {
    '@type': 'Physician',
    '@id': PHYSICIAN_ID,
    name: practice.physician.name,
    description: practice.physician.bio,
    url: absoluteUrl('/about'),
    image: absoluteUrl(practice.physician.portrait.src),
    telephone: practice.contact.phone.display,
    address: postalAddress,
    medicalSpecialty: ['https://schema.org/Musculoskeletal', 'https://schema.org/Surgical'],
    /** Board certification — stated on the site and on the credential strip. */
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'Board Certification',
      recognizedBy: {
        '@type': 'Organization',
        name: 'American Board of Orthopedic Surgery',
      },
    },
    parentOrganization: { '@id': PRACTICE_ID },
    ...(npi ? { identifier: { '@type': 'PropertyValue', propertyID: 'NPI', value: npi } } : {}),
  }
}

function websiteNode(): JsonLdNode {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: siteUrl,
    name: practice.name,
    inLanguage: 'en-US',
    publisher: { '@id': PRACTICE_ID },
  }
}

export function structuredDataGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [practiceNode(), physicianNode(), websiteNode()],
  }
}

/**
 * JSON for a `<script>` body.
 *
 * `<` is escaped because a literal `</script>` anywhere in the serialised
 * output would close the element early and turn the rest of the graph into
 * markup. Nothing in `content/practice.ts` contains one today; this is the
 * kind of thing that stops being true quietly.
 */
export function structuredDataJson(): string {
  return JSON.stringify(structuredDataGraph()).replace(/</g, '\\u003c')
}
