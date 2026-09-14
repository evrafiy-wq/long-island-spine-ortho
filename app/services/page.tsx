import type { Metadata } from 'next'
import { AppointmentCta } from '@/components/sections/AppointmentCta'
import { CareGrid } from '@/components/sections/CareGrid'
import { CareSectionIntro } from '@/components/sections/CareSectionIntro'
import { ConditionsGuide } from '@/components/sections/ConditionsGuide'

export const metadata: Metadata = {
  title: 'Care and Services',
  description:
    'Spine care and microsurgery, orthopedic medicine, rehabilitation planning, and second opinions from Dr. Philip M. Rafiy, MD in Hicksville, NY.',
}

export default function ServicesPage() {
  return (
    <>
      <section className="section" id="care">
        <div className="site-container">
          <CareSectionIntro />
          <CareGrid variant="services" />
          <ConditionsGuide />
        </div>
      </section>

      <AppointmentCta />
    </>
  )
}
