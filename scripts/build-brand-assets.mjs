/**
 * Generate every raster brand asset from the SVG masters in public/brand/.
 *
 * The masters are outlined paths, so this needs no font files — only sharp.
 * Re-run after any change to the wordmark or monogram:
 *
 *   node scripts/build-brand-assets.mjs
 *
 * Outputs:
 *   app/favicon.ico            16 + 32 + 48, multi-resolution
 *   app/icon.png               32   — modern browsers prefer this over the .ico
 *   app/apple-icon.png         180  — iOS home screen
 *   app/opengraph-image.png    1200x630
 *   public/icons/icon-192.png  } referenced by app/manifest.ts
 *   public/icons/icon-512.png  }
 *   public/icons/icon-maskable-512.png
 *
 * Every icon is the reversed monogram on the site's dark ground rather than
 * ink on transparent. A transparent favicon carrying #0e1114 letterforms is
 * invisible against a dark browser tab strip, and iOS composites a transparent
 * apple-touch-icon onto black. One solid tile is legible everywhere and is the
 * only version that needs to exist.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import sharp from 'sharp'

const DARK = '#0e1114'
const MONOGRAM = 'public/brand/monogram-reversed.svg'
const OG = 'public/brand/opengraph.svg'

/**
 * The monogram on a dark tile.
 *
 * `inset` is the share of the tile the artwork is allowed to occupy. 0.62 is
 * the normal icon; the maskable variant drops to 0.46 because Android crops a
 * maskable icon to an arbitrary shape and only guarantees the inner 80%
 * circle — artwork sized for a square loses its edges to that crop.
 */
async function tile(size, inset = 0.62) {
  const art = await sharp(MONOGRAM, { density: 2400 })
    .resize({
      width: Math.round(size * inset),
      height: Math.round(size * inset),
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer()

  return sharp({
    create: { width: size, height: size, channels: 4, background: DARK },
  })
    .composite([{ input: art, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toBuffer()
}

/**
 * Pack PNGs into an .ico.
 *
 * Written by hand because sharp cannot emit ICO and this is a 6-line container:
 * a header, one 16-byte directory entry per image, then the PNG bytes. PNG
 * payloads inside an ICO are understood by every browser in use.
 */
function ico(images) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(images.length, 4)

  let offset = 6 + images.length * 16
  const entries = images.map(({ size, data }) => {
    const e = Buffer.alloc(16)
    e.writeUInt8(size >= 256 ? 0 : size, 0) // 0 means 256
    e.writeUInt8(size >= 256 ? 0 : size, 1)
    e.writeUInt8(0, 2) // palette size
    e.writeUInt8(0, 3) // reserved
    e.writeUInt16LE(1, 4) // colour planes
    e.writeUInt16LE(32, 6) // bits per pixel
    e.writeUInt32LE(data.length, 8)
    e.writeUInt32LE(offset, 12)
    offset += data.length
    return e
  })

  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)])
}

await mkdir('public/icons', { recursive: true })

const written = []
const put = async (path, data) => {
  await writeFile(path, data)
  written.push([path, data.length])
}

const icoSizes = await Promise.all(
  [16, 32, 48].map(async (size) => ({ size, data: await tile(size) })),
)
await put('app/favicon.ico', ico(icoSizes))
await put('app/icon.png', await tile(32))
await put('app/apple-icon.png', await tile(180))
await put('public/icons/icon-192.png', await tile(192))
await put('public/icons/icon-512.png', await tile(512))
await put('public/icons/icon-maskable-512.png', await tile(512, 0.46))

await put(
  'app/opengraph-image.png',
  await sharp(OG, { density: 300 }).resize(1200, 630).png({ compressionLevel: 9 }).toBuffer(),
)

for (const [path, bytes] of written) {
  console.log(`  ${path.padEnd(34)} ${(bytes / 1024).toFixed(1)} KB`)
}
