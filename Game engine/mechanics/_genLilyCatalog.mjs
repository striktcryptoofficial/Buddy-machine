import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const here = path.dirname(fileURLToPath(import.meta.url))
const rootPath = path.join(here, '../assets/lily')
const gifs = []

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const abs = path.join(dir, name)
    if (fs.statSync(abs).isDirectory()) walk(abs)
    else if (name.endsWith('.gif')) gifs.push(abs)
  }
}

walk(rootPath)

const clips = gifs
  .map((gifAbs) => {
    const rel = path.relative(rootPath, gifAbs).split(path.sep).join('/')
    const dir = path.dirname(gifAbs)
    const base = path.basename(gifAbs, '.gif')
    const still = rel.replace(/\.gif$/, '.png')
    const framesDirA = path.join(dir, `${base}_frames`)
    const framesDirB = path.join(dir, base)
    let framesDir = null
    if (fs.existsSync(framesDirA)) framesDir = framesDirA
    else if (fs.existsSync(framesDirB) && fs.statSync(framesDirB).isDirectory()) framesDir = framesDirB
    const frames = framesDir
      ? fs
          .readdirSync(framesDir)
          .filter((file) => file.endsWith('.png'))
          .sort()
          .map((file) => path.relative(rootPath, path.join(framesDir, file)).split(path.sep).join('/'))
      : []
    const id = rel
      .replace(/\.gif$/, '')
      .split('/')
      .join('-')
      .toLowerCase()
    return { id, group: rel.split('/')[0], gif: rel, still, frames }
  })
  .sort((a, b) => a.gif.localeCompare(b.gif))

const missing = clips.filter((clip) => clip.frames.length === 0).map((clip) => clip.gif)
const out = `import type { LilyClip } from './lilyTypes'

/** Every animation in assets/lily. Each gif is one clip. Frames are that same clip, in order. */
export const LILY_CLIPS: LilyClip[] = ${JSON.stringify(clips, null, 2)}

export const LILY_CLIP_COUNT = LILY_CLIPS.length
`
fs.writeFileSync(path.join(here, 'lilyCatalog.ts'), out)
console.log(`clips ${clips.length} missing-frames ${missing.length}`)
if (missing.length) console.log(missing.join('\n'))
