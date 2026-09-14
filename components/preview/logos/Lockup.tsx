import Image from 'next/image'
import type { Direction, Variant } from '@/components/preview/logos/logoSet'
import { logoSrc } from '@/components/preview/logos/logoSet'

interface LockupProps {
  direction: Direction
  lockup: keyof Direction['lockups']
  /** Rendered height in CSS pixels. Every lockup is specified by height, because
   *  that is the dimension a header, a favicon and a sign all constrain. */
  height: number
  variant?: Variant
  alt: string
}

/**
 * One logo specimen at one size.
 *
 * The height is an inline style rather than a Tailwind class on purpose: the
 * page renders the same file at nine different heights, and arbitrary-value
 * classes built from a runtime number are exactly the thing Tailwind cannot
 * see when it scans for candidates.
 *
 * `unoptimized` because these are SVG — the image optimizer would need
 * `dangerouslyAllowSVG`, and there is nothing for it to do to a 400-byte
 * vector anyway.
 */
export function Lockup({ direction, lockup, height, variant = '', alt }: LockupProps) {
  const { w, h } = direction.lockups[lockup]
  return (
    <Image
      src={logoSrc(direction.id, lockup, variant)}
      alt={alt}
      width={Math.round(w)}
      height={Math.round(h)}
      unoptimized
      // maxWidth:'none' is load-bearing. reset.css sets `img { max-width: 100% }`,
      // and a replaced element with a specified height and a clamped width does
      // NOT re-derive its height — it just distorts. At 200px tall the 14.6:1
      // lockup was being squashed into its column at a ratio of 3:1. The wide
      // specimens scroll instead; the caption states the true width.
      style={{ height, width: 'auto', maxWidth: 'none' }}
    />
  )
}

/** The pixel width a lockup occupies at a given rendered height. */
export function widthAt(direction: Direction, lockup: keyof Direction['lockups'], height: number) {
  const { w, h } = direction.lockups[lockup]
  return Math.round((w / h) * height)
}
