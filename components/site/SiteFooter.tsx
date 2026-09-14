import Link from 'next/link'
import { practice } from '@/content/practice'

export function SiteFooter() {
  const { phone, address } = practice.contact

  return (
    <>
      <footer className="border-t border-hairline bg-surface">
        <div className="measure grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
          <div>
            <p className="font-display text-subtitle tracking-tight text-ink">{practice.name}</p>
            <p className="max-w-[40ch] pt-3 text-meta text-ink-muted">
              {practice.shortDescription}
            </p>
          </div>

          <nav aria-label="Practice">
            <h2 className="text-label text-ink-muted uppercase">Practice</h2>
            <ul className="pt-4">
              {practice.footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block py-1.5 text-meta text-ink transition-state hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-label text-ink-muted uppercase">Contact</h2>
            <address className="pt-4 text-meta text-ink not-italic">
              {address.street}
              <br />
              {address.cityStateZip}
            </address>
            <a
              href={phone.href}
              className="inline-block pt-3 font-display text-subtitle font-semibold tracking-tight text-accent transition-state hover:text-accent-hover"
            >
              {phone.display}
            </a>
            <p className="pt-2 text-meta text-ink-muted">{practice.hours.summary}</p>
          </div>
        </div>

        <div className="border-t border-hairline">
          <p className="measure py-5 text-meta text-ink-muted">
            © {new Date().getFullYear()} {practice.name}
          </p>
        </div>
      </footer>
    </>
  )
}
