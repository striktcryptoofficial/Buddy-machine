import type { AwakenedLook } from '../../mechanics/awakenedLook'
import adjustFile from './color-adjust.json'

type Rgb = [number, number, number]

interface AdjustGroup {
  id: string
  name: string
}

interface AdjustFile {
  rev: number
  groups: AdjustGroup[]
  swatches: Record<string, string>
  pixels: Record<string, string>
  framePixels?: Record<string, Record<string, string>>
}

const adjust = adjustFile as AdjustFile
const cache = new Map<string, string>()
const groupName = new Map(adjust.groups.map((group) => [group.id, group.name.trim().toLowerCase()]))

const MAP: Record<string, string> = {
  '78,75,128': 'hair', '46,39,74': 'hair', '18,13,43': 'hair', '37,31,64': 'hair',
  '21,16,49': 'hair', '52,43,95': 'hair', '62,54,108': 'hair', '92,82,143': 'hair',
  '77,71,95': 'jacket', '80,73,97': 'jacket',
  '253,252,252': 'shirt',
  '253,232,211': 'skin', '221,166,164': 'skin', '209,144,143': 'skin', '212,151,151': 'skin',
  '229,178,174': 'skin', '237,189,182': 'skin', '251,222,195': 'skin', '200,122,123': 'skin',
  '190,112,114': 'skin',
  '68,2,39': 'bow', '185,65,94': 'bow', '113,39,68': 'bow', '177,98,101': 'bow',
  '191,68,98': 'bow', '103,32,63': 'bow', '182,108,109': 'bow', '131,53,59': 'bow',
  '163,82,88': 'bow', '147,66,70': 'bow', '123,49,75': 'bow', '78,3,44': 'bow',
  '46,0,18': 'bow', '45,0,18': 'bow',
  '248,215,135': 'gold', '174,132,56': 'gold', '251,228,164': 'gold', '134,107,55': 'gold',
  '254,228,162': 'gold', '167,133,89': 'gold', '177,142,89': 'gold', '175,138,89': 'gold',
  '231,208,244': 'eyes', '217,175,244': 'eyes', '164,137,206': 'eyes', '208,162,240': 'eyes',
  '137,105,181': 'eyes', '179,157,218': 'eyes', '223,198,237': 'eyes', '172,147,214': 'eyes',
  '149,123,200': 'eyes', '204,156,240': 'eyes', '214,164,201': 'eyes', '178,128,177': 'eyes',
  '0,0,0': 'line',
}

function parseHex(hex: string): Rgb {
  const n = hex.replace('#', '')
  return [Number.parseInt(n.slice(0, 2), 16), Number.parseInt(n.slice(2, 4), 16), Number.parseInt(n.slice(4, 6), 16)]
}

function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ]
}

function lighten(rgb: Rgb, amount: number): Rgb {
  return rgb.map((channel) => Math.round(channel + (255 - channel) * amount)) as Rgb
}

function shade(target: Rgb, originalMax: number, reference: number): Rgb {
  const scale = originalMax / reference
  return [
    Math.max(0, Math.min(255, Math.round(target[0] * scale))),
    Math.max(0, Math.min(255, Math.round(target[1] * scale))),
    Math.max(0, Math.min(255, Math.round(target[2] * scale))),
  ]
}

function lighterHair(hair: Rgb, originalMax: number): Rgb {
  const low = lighten(hair, 0.42)
  const high = lighten(hair, 0.7)
  const t = Math.max(0, Math.min(1, (originalMax - 43) / 210))
  return mix(low, high, t)
}

const PALETTE = Object.entries(MAP).map(([key, part]) => {
  const [r, g, b] = key.split(',').map(Number)
  return { part, r, g, b }
})

function nearestPart(r: number, g: number, b: number) {
  const exact = MAP[`${r},${g},${b}`]
  if (exact) return exact
  let best = 'hair'
  let bestDistance = 1_000_000
  for (const swatch of PALETTE) {
    const dr = r - swatch.r
    const dg = g - swatch.g
    const db = b - swatch.b
    const distance = dr * dr + dg * dg + db * db
    if (distance < bestDistance) {
      bestDistance = distance
      best = swatch.part
    }
  }
  return best
}

/** 0 leave, 1 iris, 2 eye white (stay), 3 hair or collar highlight. */
function eyeSplit(data: Uint8ClampedArray, width: number, height: number) {
  const count = width * height
  const part = new Array<string | null>(count).fill(null)
  const eyeish = new Uint8Array(count)
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    if (data[i + 3] < 16) continue
    const name = nearestPart(data[i], data[i + 1], data[i + 2])
    part[p] = name
    if (name === 'eyes') eyeish[p] = 1
  }

  const seen = new Uint8Array(count)
  const components: { cells: number[]; skin: number; hair: number; bow: number; shirt: number }[] = []
  for (let start = 0; start < count; start++) {
    if (!eyeish[start] || seen[start]) continue
    const cells: number[] = []
    const stack = [start]
    seen[start] = 1
    let skin = 0
    let hair = 0
    let bow = 0
    let shirt = 0
    while (stack.length) {
      const current = stack.pop() as number
      cells.push(current)
      const x = current % width
      const y = (current - x) / width
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx
          const ny = y + dy
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
          const next = ny * width + nx
          if (eyeish[next] && !seen[next]) {
            seen[next] = 1
            stack.push(next)
          } else if (part[next] === 'skin') skin += 1
          else if (part[next] === 'hair') hair += 1
          else if (part[next] === 'bow') bow += 1
          else if (part[next] === 'shirt') shirt += 1
        }
      }
    }
    components.push({ cells, skin, hair, bow, shirt })
  }

  const marks = new Uint8Array(count)
  const iris = new Uint8Array(count)
  for (const component of components) {
    const size = component.cells.length
    const isIris = size >= 3 && size <= 28 && component.skin >= 4 && component.hair >= 4 && component.bow < 12 && component.shirt < 15
    if (!isIris) continue
    for (const cell of component.cells) {
      iris[cell] = 1
      marks[cell] = 1
    }
  }

  const nearIris = (cell: number, reach: number) => {
    const x = cell % width
    const y = (cell - x) / width
    for (let dy = -reach; dy <= reach; dy++) {
      for (let dx = -reach; dx <= reach; dx++) {
        const nx = x + dx
        const ny = y + dy
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
        if (iris[ny * width + nx]) return true
      }
    }
    return false
  }

  for (const component of components) {
    if (component.cells.some((cell) => iris[cell])) continue
    const white = component.cells.length <= 16 && component.cells.some((cell) => nearIris(cell, 4))
    for (const cell of component.cells) marks[cell] = white ? 2 : 3
  }

  for (let p = 0; p < count; p++) {
    if (part[p] !== 'shirt' || !nearIris(p, 2)) continue
    const i = p * 4
    if (Math.max(data[i], data[i + 1], data[i + 2]) >= 248) marks[p] = 2
  }
  return marks
}
function role(part: string) {
  if (!part) return ''
  const name = groupName.get(part) || part
  if (name === 'hair 2' || name === 'shirt 2') return 'lighter-hair'
  if (name === 'eyes 2' || name === 'mouth') return 'locked'
  if (name === 'skin 2') return 'skin-paint'
  if (name === 'jacket') return 'jacket'
  if (name === 'eyes') return 'eyes'
  return name
}

function frameId(rel: string) {
  const match = rel.match(/Crossed-Arms\/idle-(\d+)_frames\/frame_0(\d+)\.png$/i)
  if (!match) return ''
  return `crossed-${Number(match[1])}-${Number(match[2])}`
}

function overridesFor(rel: string) {
  const id = frameId(rel)
  if (id && adjust.framePixels?.[id]) return adjust.framePixels[id]
  if (id === 'crossed-1-1') return adjust.pixels
  return {}
}

export const lilyPaintRev = 10

export function paintLily(img: HTMLImageElement, look: AwakenedLook, frameRel = '') {
  const key = [img.src, frameRel, adjust.rev, look.hair, look.shirt, look.vest, look.bow, look.trim, look.eyes, look.eyesRight, look.outfit].join('|')
  const hit = cache.get(key)
  if (hit) return hit

  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  ctx.drawImage(img, 0, 0)
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = image.data
  const hair = parseHex(look.hair)
  const shirt = mix([255, 255, 255], parseHex(look.shirt), 0.62)
  const vest = look.outfit === 'open-vest' ? mix(parseHex(look.vest), parseHex(look.shirt), 0.35) : parseHex(look.vest)
  const bow = parseHex(look.bow)
  const trim = look.outfit === 'ceremonial' ? parseHex(look.trim) : parseHex('#f5d37f')
  const eyes = parseHex(look.eyes)
  const eyesRight = parseHex(look.eyesRight)
  const skin = parseHex('#e5b2ae')
  const overrides = overridesFor(frameRel)
  const width = canvas.width
  const mid = width / 2
  const marks = eyeSplit(data, width, canvas.height)

  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    if (data[i + 3] < 16) continue
    const x = p % width
    const painted = overrides[`${x},${(p - x) / width}`]
    const mark = marks[p]
    const kind = painted
      ? role(painted)
      : mark === 1
        ? 'eyes'
        : mark === 2
          ? 'locked'
          : mark === 3
            ? 'lighter-hair'
            : role(nearestPart(data[i], data[i + 1], data[i + 2]))
    if (kind === 'locked' || kind === 'skin' || kind === 'line') continue
    const max = Math.max(data[i], data[i + 1], data[i + 2])
    let next: Rgb | null = null
    if (kind === 'lighter-hair') next = lighterHair(hair, max)
    else if (kind === 'skin-paint') next = shade(skin, max, 229)
    else if (kind === 'hair') next = shade(hair, max, 128)
    else if (kind === 'jacket') next = shade(vest, max, 95)
    else if (kind === 'shirt') next = shade(shirt, max, 248)
    else if (kind === 'bow') next = shade(bow, max, 120)
    else if (kind === 'gold') next = shade(trim, max, 200)
    else if (kind === 'eyes') next = shade(x > mid ? eyesRight : eyes, Math.max(max, 180), 210)
    if (!next) continue
    data[i] = next[0]
    data[i + 1] = next[1]
    data[i + 2] = next[2]
  }

  ctx.putImageData(image, 0, 0)
  const url = canvas.toDataURL()
  cache.set(key, url)
  return url
}
