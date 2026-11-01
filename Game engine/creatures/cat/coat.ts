const FUR = new Set([
  'fdd5b5',
  'fbd2b3',
  'fdd7b6',
  'fed8b7',
  'fbd3b1',
  'fcd6b5',
  'fbe0ca',
  'f2d9b4',
  'ffd8bc',
  'fed2b6',
  'ffd4b5',
  'fad4b6',
  'ffd3b0',
  'fdd5b3',
  'fbdbc2',
  'fce0c5',
  'fae1c5',
  'ffd4b7',
  'fcd4b2',
  'fcd8b9',
  'fed3b2',
  'fcd2b3',
  'fdd6b8',
  'ffd4b3',
  'f9d5b6',
  'fed0ad',
  'fed9b1',
])
const SHADOW = new Set(['e6b4a0'])
const DEEP = new Set(['d78c77'])

const cache = new Map<string, string>()

function parseHex(hex: string): [number, number, number] {
  const n = hex.replace('#', '')
  return [Number.parseInt(n.slice(0, 2), 16), Number.parseInt(n.slice(2, 4), 16), Number.parseInt(n.slice(4, 6), 16)]
}

function mix(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ]
}

function key(r: number, g: number, b: number) {
  return ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')
}

export function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`image failed: ${src}`))
    img.src = src
  })
}

export function paintCoat(img: HTMLImageElement, base: string) {
  const hit = cache.get(`${img.src}|${base}`)
  if (hit) return hit
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')
  if (!ctx) return img.src
  ctx.drawImage(img, 0, 0)
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = image.data
  const coat = parseHex(base)
  const light = mix(coat, [255, 244, 228], 0.42)
  const shadow = mix(coat, [90, 52, 44], 0.38)
  const deep = mix(coat, [60, 36, 32], 0.55)
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 16) continue
    const pixel = key(data[i], data[i + 1], data[i + 2])
    const next = FUR.has(pixel) ? light : SHADOW.has(pixel) ? shadow : DEEP.has(pixel) ? deep : null
    if (!next) continue
    data[i] = next[0]
    data[i + 1] = next[1]
    data[i + 2] = next[2]
  }
  ctx.putImageData(image, 0, 0)
  const url = canvas.toDataURL()
  cache.set(`${img.src}|${base}`, url)
  return url
}
