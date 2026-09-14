import { Glyph } from '@/components/site/Glyph'
import { UI } from '@/components/site/icons'
import { practice } from '@/content/practice'

/** Office hours and the parking note — shared by the homepage and /visit. */
export function HoursParking() {
  return (
    <div className="max-w-reading">
      <div className="flex gap-3 border-t border-hairline py-4">
        <span className="mt-1 text-[1.125rem] leading-none text-accent" aria-hidden="true">
          <Glyph as={UI.clock} />
        </span>
        <div>
          <p className="text-label text-ink-muted uppercase">Office Hours</p>
          <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 pt-2">
            {practice.hours.rows.map((row) => (
              <div key={row.days} className="contents">
                <dt className="text-meta text-ink-muted">{row.days}</dt>
                <dd className="text-meta text-ink tabular-nums">{row.time}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <p className="flex gap-3 border-t border-hairline py-4 text-meta text-ink">
        <span className="mt-1 text-[1.125rem] leading-none text-accent" aria-hidden="true">
          <Glyph as={UI.parking} />
        </span>
        {practice.contact.parking}
      </p>
    </div>
  )
}
