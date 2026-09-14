import Link from 'next/link'
import { Glyph } from '@/components/site/Glyph'
import { UI } from '@/components/site/icons'
import { practice } from '@/content/practice'

export function SiteFooterB() {
  const { phone, address } = practice.contact

  return (
    <>
      <aside className="border-t border-hairline">
        <p className="measure flex items-center gap-2 py-5 font-[family-name:var(--pv-font-meta)] text-meta text-ink-muted">
          <Glyph as={UI.alert} />
          {practice.emergencyNotice}
        </p>
      </aside>

      <footer className="border-t border-hairline bg-sunken">
        <div className="measure grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <p className="font-display text-title text-ink">{practice.name}</p>
            <p className="max-w-[38ch] pt-4 text-body text-ink-muted">
              {practice.shortDescription}
            </p>
          </div>

          <nav aria-label="Practice">
            <h2 className="font-[family-name:var(--pv-font-meta)] text-label text-ink-muted uppercase">
              Practice
            </h2>
            <ul className="pt-4">
              {practice.footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block py-2 font-[family-name:var(--pv-font-meta)] text-meta text-ink transition-state hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-[family-name:var(--pv-font-meta)] text-label text-ink-muted uppercase">
              Contact
            </h2>
            <address className="pt-4 font-[family-name:var(--pv-font-meta)] text-meta text-ink not-italic">
              {address.street}
              <br />
              {address.cityStateZip}
            </address>
            <a
              href={phone.href}
              className="inline-block pt-3 font-display text-subtitle font-semibold text-accent transition-state hover:text-accent-hover"
            >
              {phone.display}
            </a>
            <p className="pt-2 font-[family-name:var(--pv-font-meta)] text-meta text-ink-muted">
              {practice.hours.summary}
            </p>
          </div>
        </div>

        <div className="border-t border-hairline">
          <p className="measure py-5 font-[family-name:var(--pv-font-meta)] text-meta text-ink-muted">
            © {new Date().getFullYear()} {practice.name}
          </p>
        </div>
      </footer>
    </>
  )
}
