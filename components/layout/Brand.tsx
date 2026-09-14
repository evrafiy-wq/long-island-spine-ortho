import Image from 'next/image'
import Link from 'next/link'
import { practice } from '@/content/practice'

/** The logo + two-line wordmark lockup, shared by the header and the footer. */
export function Brand() {
  const { logo, prefix, emphasis } = practice.brand

  return (
    <Link className="brand" href="/">
      <Image
        className="brand-mark"
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        // An SVG is already resolution-independent; there is nothing for the
        // image optimizer to do, and it rejects SVG without dangerouslyAllowSVG.
        unoptimized
      />
      <span className="brand-name">
        <span>{prefix}</span>
        <strong>{emphasis}</strong>
      </span>
    </Link>
  )
}
