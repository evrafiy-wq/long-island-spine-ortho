import Image from 'next/image'
import { MARKS, markSrc } from '@/components/preview/logos/markSet'

/** One lettermark at a fixed rendered height. */
export function Mark({
  id,
  height,
  reversed = false,
  alt,
}: {
  id: string
  height: number
  reversed?: boolean
  alt: string
}) {
  const box = MARKS[id]
  if (!box) return null
  return (
    <Image
      src={markSrc(id, reversed)}
      alt={alt}
      width={Math.round(box.w)}
      height={Math.round(box.h)}
      unoptimized
      // See Lockup.tsx: reset.css sets `img { max-width: 100% }`, and a fixed
      // height plus a clamped width distorts rather than rescales.
      style={{ height, width: 'auto', maxWidth: 'none' }}
    />
  )
}

/**
 * A mark letterboxed into a real N x N square — what a favicon actually does.
 *
 * Sizing by height alone is the wrong test and gives the wrong answer: a
 * two-line stack set to 16px TALL halves each letter, so the row looks better.
 * Constrained to a 16px SQUARE, which is the true constraint, the row is four
 * letters sharing 16px of width and the stack wins.
 */
export function Square({
  id,
  size,
  reversed = false,
  alt,
}: {
  id: string
  size: number
  reversed?: boolean
  alt: string
}) {
  const box = MARKS[id]
  if (!box) return null
  return (
    <div
      className="flex items-center justify-center border border-hairline"
      style={{ width: size, height: size, background: reversed ? '#0e1114' : '#ffffff' }}
    >
      <Image
        src={markSrc(id, reversed)}
        alt={alt}
        width={Math.round(box.w)}
        height={Math.round(box.h)}
        unoptimized
        style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto' }}
      />
    </div>
  )
}
