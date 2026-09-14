import type { LucideIcon } from 'lucide-react'
import { cx } from '@/lib/cx'

interface GlyphProps {
  as: LucideIcon
  /**
   * Optional accessible name. Omit for decorative glyphs — the default is
   * `aria-hidden`, which is correct whenever adjacent text already says what
   * the icon says.
   */
  label?: string
  className?: string
}

/**
 * Wrapper that gives every preview icon one size rule and one stroke weight.
 *
 * `size="1em"` is the whole idea: the glyph tracks whatever `--text-*` step
 * its container uses, so it stays proportional to the type scale at every
 * breakpoint in all three directions with no icon-size token and no per-call-
 * site discipline. Stroke weight comes from `--site-icon-stroke` in the scoped
 * reset (CSS beats SVG presentation attributes), so each direction sets it
 * once. `absoluteStrokeWidth` is deliberately not used — it exists to hold
 * stroke weight constant under transform scaling, whereas here a larger glyph
 * next to heavier display type *should* carry proportionally more weight.
 */
export function Glyph({ as: Icon, label, className }: GlyphProps) {
  return (
    <Icon
      size="1em"
      className={cx('shrink-0', className)}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      focusable={false}
    />
  )
}
