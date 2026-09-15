import { describe, expect, it } from 'vitest'
import { practice } from '@/content/practice'
import { structuredDataGraph, structuredDataJson } from '@/lib/seo/structuredData'

/**
 * Structured data is the surface CLAUDE.md singles out by name: an unverified
 * claim propagated here is a claim Google republishes in a rich result, where
 * the practice cannot correct it quickly. Most of these tests assert the
 * ABSENCE of things.
 */

const graph = structuredDataGraph()
const json = structuredDataJson()

function node(type: string) {
  return graph['@graph'].find((entry) => {
    const types = Array.isArray(entry['@type']) ? entry['@type'] : [entry['@type']]
    return types.includes(type)
  })
}

describe('the graph', () => {
  it('declares the practice, the physician and the website', () => {
    expect(node('MedicalBusiness')).toBeDefined()
    expect(node('LocalBusiness')).toBeDefined()
    expect(node('Physician')).toBeDefined()
    expect(node('WebSite')).toBeDefined()
  })

  it('links the physician to the practice in both directions', () => {
    expect(node('MedicalBusiness')?.subOrganization).toEqual({ '@id': node('Physician')?.['@id'] })
    expect(node('Physician')?.parentOrganization).toEqual({
      '@id': node('MedicalBusiness')?.['@id'],
    })
  })

  it('carries the real address, phone and opening hours', () => {
    const business = node('MedicalBusiness')
    expect(business?.telephone).toBe(practice.contact.phone.display)
    expect(business?.address).toMatchObject({
      streetAddress: '87 W Old Country Rd',
      addressLocality: 'Hicksville',
      addressRegion: 'NY',
      postalCode: '11801',
    })
    expect(business?.openingHoursSpecification).toHaveLength(2)
  })

  it('states the weekend closure explicitly instead of omitting it', () => {
    // An omitted day is ambiguous; Google will happily show the practice as
    // open on a Sunday.
    const hours = node('MedicalBusiness')?.openingHoursSpecification as {
      dayOfWeek: string[]
      opens: string
      closes: string
    }[]
    const weekend = hours.find((entry) => entry.dayOfWeek.includes('Sunday'))
    expect(weekend).toMatchObject({ opens: '00:00', closes: '00:00' })
  })
})

describe('unverified and unknown claims', () => {
  it('never mentions the unverified language claim', () => {
    // NYU Langone's directory for Dr. Rafiy lists English only. See CLAUDE.md.
    expect(json).not.toMatch(/French/i)
    expect(json).not.toMatch(/Spanish/i)
    expect(json).not.toMatch(/knowsLanguage/i)
  })

  it('never lists the unverified insurance carriers', () => {
    for (const carrier of practice.insuranceCarriers) {
      expect(json).not.toContain(carrier)
    }
  })

  it('omits the NPI entirely while it is unknown, rather than emitting a blank', () => {
    expect(practice.identifiers.npi).toBeNull()
    expect(node('MedicalBusiness')?.identifier).toBeUndefined()
    expect(node('Physician')?.identifier).toBeUndefined()
    expect(json).not.toMatch(/"propertyID"/)
  })

  it('omits geo coordinates while they are unknown', () => {
    expect(practice.identifiers.geo).toBeNull()
    expect(node('MedicalBusiness')?.geo).toBeUndefined()
  })

  it('contains no FAQ markup, which would republish the language answer', () => {
    expect(json).not.toMatch(/FAQPage/)
  })

  it('invents no rating, review or price', () => {
    expect(json).not.toMatch(/aggregateRating|"review"|priceRange/)
  })
})

describe('serialisation', () => {
  it('escapes `<` so nothing in the content can close the script element', () => {
    expect(json).not.toContain('</')
    expect(JSON.parse(json.replace(/\\u003c/g, '<'))).toBeTruthy()
  })

  it('is valid JSON', () => {
    expect(() => JSON.parse(json)).not.toThrow()
  })
})
