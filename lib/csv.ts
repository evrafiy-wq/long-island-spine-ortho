/**
 * CSV serialisation for the admin export.
 *
 * Two things this handles that a `join(',')` does not.
 *
 * QUOTING, per RFC 4180: any field containing a comma, a quote, a newline or
 * leading/trailing whitespace is wrapped in quotes with internal quotes
 * doubled. Patient notes contain all four.
 *
 * FORMULA INJECTION. A cell beginning with `=`, `+`, `-`, `@`, or a tab or
 * carriage return is executed as a formula when the file is opened in Excel or
 * Google Sheets. A patient typing `=HYPERLINK(...)` into the notes box would
 * otherwise get code running on a receptionist's machine from a file the
 * practice generated itself. Those cells are prefixed with an apostrophe,
 * which Excel strips on display and treats as "this is text".
 *
 * The BOM is not decoration either: without it Excel on Windows reads the file
 * as the system codepage and mangles every accented name in the export.
 */

const NEEDS_QUOTING = /[",\n\r]|^\s|\s$/
const FORMULA_START = /^[=+\-@\t\r]/

function cell(value: unknown): string {
  if (value === null || value === undefined) return ''

  let text = String(value)
  if (FORMULA_START.test(text)) text = `'${text}`
  if (NEEDS_QUOTING.test(text)) text = `"${text.replace(/"/g, '""')}"`

  return text
}

export function toCsv(headers: readonly string[], rows: readonly (readonly unknown[])[]): string {
  const lines = [headers.map(cell).join(','), ...rows.map((row) => row.map(cell).join(','))]
  // CRLF line endings, also per RFC 4180 — Excel is the consumer here.
  return `﻿${lines.join('\r\n')}\r\n`
}

/** `appointment-requests-2026-09-14.csv` */
export function csvFilename(prefix: string, now: Date = new Date()): string {
  return `${prefix}-${now.toISOString().slice(0, 10)}.csv`
}
