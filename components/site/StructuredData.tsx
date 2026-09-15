import { structuredDataJson } from '@/lib/seo/structuredData'

/**
 * The JSON-LD block, rendered once in the public chrome.
 *
 * `dangerouslySetInnerHTML` is the only way to emit a `<script>` body in React
 * — children of a script element are escaped as text and the result is invalid
 * JSON to a crawler. The content is serialised by `structuredDataJson`, which
 * escapes `<` so nothing in it can terminate the element.
 */
export function StructuredData() {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredDataJson() }} />
  )
}
