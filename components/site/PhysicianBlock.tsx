import Image from 'next/image'
import Link from 'next/link'
import { Glyph } from '@/components/site/Glyph'
import { UI } from '@/components/site/icons'
import { practice } from '@/content/practice'

interface PhysicianBlockProps {
  /**
   * `home` is an introduction and links onward to /about.
   * `about` is the destination, so it adds the credential list and drops the
   * link.
   */
  variant: 'home' | 'about'
}

/**
 * Dr. Rafiy. The heading is his NAME rather than
 * `practice.copy.physicianSection.heading` ("Clinical experience you can
 * trust.") — as the introduction, the block should say who he is, and that
 * string is a marketing line rather than a fact, so it is simply not rendered.
 *
 * `credentials` is sliced to 0..2. Index 3 is the languages claim, flagged
 * UNVERIFIED in content/practice.ts, and excluding it structurally is safer
 * than remembering to avoid it.
 */
export function PhysicianBlock({ variant }: PhysicianBlockProps) {
  const { physicianSection } = practice.copy
  const { portrait, name, specialty, bio } = practice.physician

  return (
    <section
      aria-labelledby="physician-heading"
      id={variant === 'about' ? 'physician' : undefined}
      className="border-t border-hairline block-y"
    >
      <div className="measure grid items-start gap-10 md:grid-cols-[240px_1fr] md:gap-12 xl:grid-cols-[300px_1fr] xl:gap-20">
        <Image
          src={portrait.src}
          alt={portrait.alt}
          width={portrait.width}
          height={portrait.height}
          sizes="(max-width: 767px) min(100vw - 40px, 260px), (max-width: 1279px) 240px, 300px"
          className="w-full max-w-[260px] rounded-plate md:max-w-none"
          priority={variant === 'about'}
        />
        <div>
          <p className="text-label text-ink-muted uppercase">{physicianSection.eyebrow}</p>
          <h2
            id="physician-heading"
            className="pt-4 font-display text-title tracking-tight text-ink"
          >
            {name}
          </h2>
          <p className="pt-2 text-meta text-ink-muted">{specialty}</p>
          <p className="max-w-reading pt-6 text-lede text-ink-muted">{bio}</p>

          {variant === 'about' ? (
            <dl className="max-w-reading pt-9">
              {practice.credentials.slice(0, 3).map((credential) => (
                <div
                  key={credential.term}
                  className="grid gap-1 border-t border-hairline py-4 md:grid-cols-[10rem_1fr] md:gap-4"
                >
                  <dt className="text-label text-ink-muted uppercase">{credential.term}</dt>
                  <dd className="text-meta text-ink">{credential.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="pt-7">
              <Link
                href="/about"
                className="inline-flex min-h-6 items-center gap-2 text-meta font-semibold text-accent underline underline-offset-4 transition-state hover:text-accent-hover"
              >
                {physicianSection.cta}
                <Glyph as={UI.arrowRight} />
              </Link>
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
