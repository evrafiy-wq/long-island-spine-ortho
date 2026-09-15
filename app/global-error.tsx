'use client'

/**
 * The last-resort boundary: errors thrown by the ROOT layout itself, which
 * every other `error.tsx` sits inside and therefore cannot catch.
 *
 * It has to render its own `<html>` and `<body>` because it REPLACES the root
 * layout rather than rendering inside it — which also means the fonts, the
 * stylesheet and every design token are gone. Hence the inline styles: this is
 * the one file in the project that cannot use the design system, so it uses a
 * system font stack and states the phone number in plain text.
 *
 * The number is hardcoded here rather than imported from content/practice.ts,
 * and that is the deliberate exception to the rule in CLAUDE.md. Anything this
 * file imports is something that can fail to load and take the error page down
 * with it — and the one job of the error page is to still show a phone number.
 * If that number ever changes, this file is listed in docs/BACKEND.md as one
 * of the two places it lives.
 */
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: '48px 24px',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: '17px',
          lineHeight: 1.65,
          color: '#0e1114',
          background: '#ffffff',
        }}
      >
        <main style={{ maxWidth: '38rem', margin: '0 auto' }}>
          <h1 style={{ fontSize: '32px', lineHeight: 1.15, margin: '0 0 16px' }}>
            This page did not load.
          </h1>
          <p style={{ margin: '0 0 16px', color: '#4a5157' }}>
            Something went wrong on our side. Please reload the page, or call the office and our
            staff will help you directly.
          </p>
          <p style={{ margin: '0 0 16px' }}>
            <a href="tel:5164331100" style={{ color: '#0b5c53', fontWeight: 600 }}>
              (516) 433-1100
            </a>
          </p>
          <p style={{ margin: '0 0 24px', color: '#4a5157' }}>
            For medical emergencies, please call 911 immediately.
          </p>
          {error.digest ? (
            <p style={{ margin: 0, fontSize: '15px', color: '#4a5157' }}>
              Reference: {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  )
}
