/**
 * Inline styles for the email templates.
 *
 * Email is not the web. There is no cascade worth relying on, no `<link>`, no
 * custom properties — Outlook's word-processing renderer ignores most of a
 * stylesheet and Gmail strips `<style>` in several clients. So every rule is
 * an inline style object, and the site's design tokens are copied here as
 * literals rather than read from app/styles/tokens.css.
 *
 * That duplication is deliberate and is the only place in the project where a
 * token value is written twice. The alternative — a build step that extracts
 * CSS custom properties into JavaScript literals — would be more machinery
 * than five hex codes deserve. If the palette changes, these five change too;
 * `grep -rn '#0b5c53'` finds them.
 *
 * The typeface is a system stack, not Instrument Sans. A web font in email
 * either fails to load or loads inconsistently, and a fallback that shifts the
 * layout is worse than never having tried.
 */

export const color = {
  ink: '#0e1114',
  inkMuted: '#4a5157',
  accent: '#0b5c53',
  hairline: '#dde0e3',
  surface: '#f4f5f6',
  canvas: '#ffffff',
  danger: '#8c2f22',
} as const

const sansStack =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'

export const style = {
  body: {
    backgroundColor: color.surface,
    fontFamily: sansStack,
    // 17px floor and 1.65 leading, same as the site. The audience is 40–75 and
    // reads this on a phone; legibility is a clinical requirement there too.
    fontSize: '17px',
    lineHeight: '1.65',
    color: color.ink,
    margin: 0,
    padding: '24px 0',
  },
  container: {
    backgroundColor: color.canvas,
    border: `1px solid ${color.hairline}`,
    maxWidth: '600px',
    margin: '0 auto',
    padding: '32px',
  },
  eyebrow: {
    fontSize: '12px',
    lineHeight: '1.3',
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: color.inkMuted,
    fontWeight: 600,
    margin: '0 0 12px',
  },
  heading: {
    fontSize: '26px',
    lineHeight: '1.15',
    letterSpacing: '-0.02em',
    fontWeight: 600,
    color: color.ink,
    margin: '0 0 16px',
  },
  subheading: {
    fontSize: '18px',
    lineHeight: '1.3',
    fontWeight: 600,
    color: color.ink,
    margin: '28px 0 8px',
  },
  text: {
    fontSize: '17px',
    lineHeight: '1.65',
    color: color.ink,
    margin: '0 0 16px',
  },
  muted: {
    fontSize: '15px',
    lineHeight: '1.5',
    color: color.inkMuted,
    margin: '0 0 12px',
  },
  hr: {
    border: 'none',
    borderTop: `1px solid ${color.hairline}`,
    margin: '28px 0',
  },
  link: {
    color: color.accent,
    textDecoration: 'underline',
  },
  button: {
    display: 'inline-block',
    backgroundColor: color.accent,
    color: color.canvas,
    fontSize: '15px',
    fontWeight: 600,
    padding: '14px 22px',
    borderRadius: '4px',
    textDecoration: 'none',
  },
  /** The 911 line. Bordered rather than tinted — a red block reads as an error. */
  notice: {
    border: `1px solid ${color.hairline}`,
    borderLeft: `3px solid ${color.danger}`,
    padding: '14px 16px',
    margin: '24px 0 0',
    fontSize: '15px',
    lineHeight: '1.5',
    color: color.ink,
  },
  definitionTerm: {
    fontSize: '12px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: color.inkMuted,
    fontWeight: 600,
    margin: '0',
    padding: '12px 0 0',
  },
  definitionValue: {
    fontSize: '17px',
    lineHeight: '1.5',
    color: color.ink,
    margin: '0 0 4px',
    padding: '0 0 12px',
    borderBottom: `1px solid ${color.hairline}`,
  },
} as const
