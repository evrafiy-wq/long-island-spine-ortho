import { Body, Container, Head, Hr, Html, Preview, Text } from '@react-email/components'
import type { ReactNode } from 'react'
import { style } from '@/emails/theme'
import type { PracticeEmailContext } from '@/emails/types'

interface ShellProps {
  /** The inbox preview line. Without one, clients quote the first body text. */
  preview: string
  context: PracticeEmailContext
  children: ReactNode
}

/**
 * Shared frame for every outgoing email: `<Html lang>`, the preview line, the
 * card, and the practice's own footer.
 *
 * `lang` on `<Html>` matters more in email than on the web — a screen reader
 * reading a message with no language declared falls back to the user's system
 * locale and can mispronounce the whole thing.
 */
export function Shell({ preview, context, children }: ShellProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={style.body}>
        <Container style={style.container}>
          {children}

          <Hr style={style.hr} />

          <Text style={style.muted}>
            {context.practiceName}
            <br />
            {context.addressOneLine}
            <br />
            {context.phoneDisplay}
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

/**
 * One labelled row of a submission.
 *
 * A stack of `<Text>` pairs rather than a `<table>`: Outlook's renderer
 * collapses `<dl>` entirely, and a real table needs per-cell attributes to
 * survive it. Two paragraphs with a bottom rule look the same everywhere and
 * reflow correctly at phone width, which is where the front desk reads this.
 */
export function Detail({ term, children }: { term: string; children: ReactNode }) {
  return (
    <>
      <Text style={style.definitionTerm}>{term}</Text>
      <Text style={style.definitionValue}>{children}</Text>
    </>
  )
}
