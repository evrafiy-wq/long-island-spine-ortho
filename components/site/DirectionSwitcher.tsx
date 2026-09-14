import Link from 'next/link'

const ARCHIVED = [
  { id: 'a', label: 'A' },
  { id: 'b', label: 'B' },
] as const

/**
 * Review-only control for revisiting the two design directions that were not
 * chosen. Rendered on /preview and the two preview routes, never on the real
 * site. Safe to delete along with app/(preview).
 *
 * Styled with literal arbitrary values only: it reads no design token and so
 * looks identical on both pages and cannot be mistaken for part of a design.
 * Rendered last in DOM order and outside <main>, with no heading, so it does
 * not disturb the focus order or heading outline of the page it sits on.
 */
export function DirectionSwitcher({ current }: { current?: 'a' | 'b' }) {
  return (
    <nav
      aria-label="Archived design direction switcher"
      className="fixed bottom-[6.5rem] left-1/2 z-[9999] flex -translate-x-1/2 items-center gap-[0.125rem] rounded-full border border-[#3f3f46] bg-[#18181b] p-[0.25rem] font-mono text-[0.75rem] text-[#e4e4e7] shadow-[0_4px_16px_rgba(0,0,0,0.3)] md:bottom-[1rem]"
    >
      <Link
        href="/"
        className="rounded-full px-[0.75rem] py-[0.375rem] text-[#a1a1aa] hover:text-[#fafafa] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fafafa]"
      >
        Live site
      </Link>
      {ARCHIVED.map((direction) => {
        const isCurrent = direction.id === current
        return (
          <Link
            key={direction.id}
            href={`/preview/${direction.id}`}
            aria-current={isCurrent ? 'page' : undefined}
            className={
              isCurrent
                ? 'rounded-full bg-[#fafafa] px-[0.75rem] py-[0.375rem] font-semibold text-[#18181b]'
                : 'rounded-full px-[0.75rem] py-[0.375rem] text-[#a1a1aa] hover:text-[#fafafa] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fafafa]'
            }
          >
            {direction.label}
          </Link>
        )
      })}
    </nav>
  )
}
