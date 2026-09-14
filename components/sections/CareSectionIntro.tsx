import { practice } from '@/content/practice'

export function CareSectionIntro() {
  const { careSection } = practice.copy

  return (
    <div className="section-intro">
      <p className="eyebrow">{careSection.eyebrow}</p>
      <h2>{careSection.heading}</h2>
      <p>{careSection.body}</p>
    </div>
  )
}
