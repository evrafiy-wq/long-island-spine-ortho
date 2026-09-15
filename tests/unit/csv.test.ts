import { describe, expect, it } from 'vitest'
import { csvFilename, toCsv } from '@/lib/csv'

describe('toCsv', () => {
  it('starts with a BOM so Excel on Windows reads it as UTF-8', () => {
    // Without it, every accented patient name in the export is mangled.
    expect(toCsv(['Name'], [['Zoë Müller']]).startsWith('﻿')).toBe(true)
  })

  it('uses CRLF line endings, per RFC 4180', () => {
    expect(toCsv(['A'], [['1'], ['2']])).toBe('﻿A\r\n1\r\n2\r\n')
  })

  it('quotes fields containing a comma, a quote or a newline', () => {
    const csv = toCsv(['Notes'], [['Left leg, worse at night']])
    expect(csv).toContain('"Left leg, worse at night"')

    expect(toCsv(['Notes'], [['He said "no"']])).toContain('"He said ""no"""')
    expect(toCsv(['Notes'], [['line one\nline two']])).toContain('"line one\nline two"')
  })

  it('quotes fields with leading or trailing whitespace, which would otherwise be lost', () => {
    expect(toCsv(['A'], [[' padded ']])).toContain('" padded "')
  })

  it('neutralises formula injection', () => {
    // A patient typing this into the notes box must not execute anything when
    // a receptionist opens the export in Excel.
    for (const payload of ['=1+1', '+1', '-1', '@SUM(A1)', '=HYPERLINK("http://evil","click")']) {
      const csv = toCsv(['Notes'], [[payload]])
      const cell = csv.split('\r\n')[1] ?? ''
      expect(cell.startsWith("'") || cell.startsWith('"\'')).toBe(true)
    }
  })

  it('renders null and undefined as empty, not as the words', () => {
    expect(toCsv(['A', 'B'], [[null, undefined]])).toBe('﻿A,B\r\n,\r\n')
  })

  it('handles an export with no rows', () => {
    expect(toCsv(['A', 'B'], [])).toBe('﻿A,B\r\n')
  })
})

describe('csvFilename', () => {
  it('dates the file so two exports do not overwrite each other in Downloads', () => {
    expect(csvFilename('submissions', new Date('2026-09-14T10:00:00Z'))).toBe(
      'submissions-2026-09-14.csv',
    )
  })
})
