// Display derivatives only: never overwrite approved source PNGs.
import sharp from 'sharp'
import { mkdir, stat } from 'node:fs/promises'
const assets = [
  ['core/plate_light',396], ['core/plate_dark',396],
  ['core/sprout_light',64], ['core/sprout_dark',64],
  ['skins/skill-lab/whetstone_clean',244], ['skins/skill-lab/whetstone_dark',244],
  ['skins/skill-lab/star_clean',80], ['skins/skill-lab/star_dark',80],
]
await mkdir('public/mascot/optimized', {recursive:true})
for (const [name,width] of assets) {
  const source = `public/mascot/${name}.png`
  const target = `public/mascot/optimized/${name.split('/').at(-1)}.webp`
  await sharp(source).resize({width,withoutEnlargement:true}).webp({lossless:true}).toFile(target)
  console.log(`${name}: ${(await stat(source)).size} -> ${(await stat(target)).size} bytes`)
}
