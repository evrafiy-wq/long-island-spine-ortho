/**
 * Loading state for the inbox and every page beneath it.
 *
 * Unlike the public pages, these are genuinely dynamic — every one of them is
 * a database round trip behind a session check — so this is seen on a normal
 * navigation rather than only on a cold network.
 */
export default function AdminLoading() {
  return (
    <div role="status" aria-live="polite" className="measure py-10">
      <span className="sr-only">Loading…</span>
      <div aria-hidden="true">
        <div className="h-8 w-56 bg-surface" />
        <div className="mt-8 h-10 w-full max-w-md bg-surface" />
        <div className="mt-6 h-px w-full bg-hairline" />
        {[0, 1, 2, 3, 4].map((row) => (
          <div key={row} className="mt-4 h-6 w-full bg-surface" />
        ))}
      </div>
    </div>
  )
}
