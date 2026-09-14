/**
 * One-off asset pipeline: turn the original source photographs into properly
 * sized, optimized masters under public/images/.
 *
 * next/image generates the per-device responsive variants (WebP/AVIF) from
 * these at request time, so only the master is committed.
 *
 * WebP is not automatically smaller than an already-compressed JPEG, so each
 * source is encoded both ways and compared against the untouched original.
 * The smallest of the three wins — re-encoding a file we can't actually shrink
 * only throws away quality.
 *
 * Run with: node scripts/optimize-images.mjs
 */
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import sharp from 'sharp'

const OUT_DIR = 'public/images'

/** @type {{ src: string, out: string, maxWidth: number, quality: number }[]} */
const SOURCES = [
  // Portrait of Dr. Rafiy. Rendered at most ~425x575 CSS px, so 1122px wide
  // still covers a 2x display with room to spare.
  { src: 'rafiy.jpg', out: 'dr-rafiy', maxWidth: 1122, quality: 82 },
  // Office exterior. Native 597x335 is the only source we have; don't upscale.
  { src: 'rafiy2.jpg', out: 'office-exterior', maxWidth: 1200, quality: 82 },
]

await mkdir(OUT_DIR, { recursive: true })

for (const { src, out, maxWidth, quality } of SOURCES) {
  const before = (await stat(src)).size
  const { width, height, format } = await sharp(src).metadata()
  const resize = { width: Math.min(maxWidth, width), withoutEnlargement: true }

  const encoded = await Promise.all(
    [
      { ext: 'webp', buf: sharp(src).resize(resize).webp({ quality, effort: 6 }) },
      {
        ext: 'jpg',
        buf: sharp(src).resize(resize).jpeg({ quality, mozjpeg: true, progressive: true }),
      },
    ].map(async ({ ext, buf }) => ({ ext, data: await buf.toBuffer() })),
  )

  // Only worth re-encoding if it actually beats the file we already have.
  const candidates =
    width <= resize.width
      ? [...encoded, { ext: format === 'jpeg' ? 'jpg' : format, data: await readFile(src) }]
      : encoded

  const best = candidates.reduce((a, b) => (b.data.length < a.data.length ? b : a))
  const dest = `${OUT_DIR}/${out}.${best.ext}`
  await writeFile(dest, best.data)

  const pct = (100 - (best.data.length / before) * 100).toFixed(1)
  const tried = candidates.map((c) => `${c.ext} ${(c.data.length / 1024).toFixed(0)}KB`).join(', ')
  console.log(
    `${src} (${format} ${width}x${height}, ${(before / 1024).toFixed(0)} KB)\n` +
      `  -> ${dest} (${resize.width}px wide, ${(best.data.length / 1024).toFixed(0)} KB, ${pct}% smaller)\n` +
      `     candidates: ${tried}`,
  )
}
