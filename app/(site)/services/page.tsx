import type { Metadata } from 'next'
import { AppointmentCta } from '@/components/site/AppointmentCta'
import { ConditionGuide } from '@/components/site/ConditionGuide'
import { PageHeader } from '@/components/site/PageHeader'
import { pageTitle } from '@/lib/pageTitle'
import { ServiceList } from '@/components/site/ServiceList'

export const metadata: Metadata = {
  title: 'Care and Services',
  description:
    'Spine care and microsurgery, orthopedic medicine, rehabilitation planning, and second opinions from Dr. Philip M. Rafiy, MD in Hicksville, NY.',
}

export default function ServicesPage() {
  return (
    <>
      {/* h1 reuses the existing footer label rather than new copy. */}
      <PageHeader heading={pageTitle('/services')} />
      {/* The long-form `description` copy lives here, not on the homepage. */}
      <ServiceList variant="services" headingId="care-heading" />
      <ConditionGuide />
      <AppointmentCta />
    </>
  )
}
