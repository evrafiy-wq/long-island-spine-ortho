import type { SVGProps } from 'react'
import type { IconName } from '@/content/practice'

/**
 * The inline SVGs from the original static site, copied path-for-path.
 *
 * Deliberately no `fill` / `stroke` attributes: the original markup had none
 * and styles.css sets them per context (`.care-icon svg`, `.nav-cta svg`,
 * `.hero-highlights svg`). Adding them here would change how the site looks,
 * which is out of scope for the structural migration.
 */
const PATHS: Record<IconName, { viewBox: string; body: React.ReactNode }> = {
  arrowRight: {
    viewBox: '0 0 16 16',
    body: <path d="M2 8h11M9 3l5 5-5 5" />,
  },
  shield: {
    viewBox: '0 0 24 24',
    body: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  },
  globe: {
    viewBox: '0 0 24 24',
    body: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </>
    ),
  },
  pulse: {
    viewBox: '0 0 24 24',
    body: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  },
  plusCircle: {
    viewBox: '0 0 24 24',
    body: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8M8 12h8" />
      </>
    ),
  },
  refresh: {
    viewBox: '0 0 24 24',
    body: (
      <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.13-3.36L23 10M1 14l5.36 4.36A9 9 0 0 0 20.49 15" />
    ),
  },
  search: {
    viewBox: '0 0 24 24',
    body: (
      <>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </>
    ),
  },
  mapPin: {
    viewBox: '0 0 24 24',
    body: (
      <>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
  },
  document: {
    viewBox: '0 0 24 24',
    body: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </>
    ),
  },
  download: {
    viewBox: '0 0 24 24',
    body: <path d="M12 5v14M19 12l-7 7-7-7" />,
  },
  plus: {
    viewBox: '0 0 24 24',
    body: (
      <>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </>
    ),
  },
}

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
}

export function Icon({ name, ...props }: IconProps) {
  const icon = PATHS[name]
  return (
    <svg viewBox={icon.viewBox} aria-hidden="true" {...props}>
      {icon.body}
    </svg>
  )
}
