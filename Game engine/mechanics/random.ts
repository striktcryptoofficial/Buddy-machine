export function clamp(n: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, n))
}

export function mulberry32(seed: number) {
  let a = seed >>> 0
  return function rand() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function randU32() {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buf = new Uint32Array(1)
    crypto.getRandomValues(buf)
    return buf[0]
  }
  return (Math.random() * 0xffffffff) >>> 0
}

export function hslToHex(h: number, s: number, l: number) {
  const sat = clamp(s, 0, 100) / 100
  const lig = clamp(l, 0, 100) / 100
  const a = sat * Math.min(lig, 1 - lig)
  const f = (n: number) => {
    const k = (n + ((((h % 360) + 360) % 360) / 30)) % 12
    const color = lig - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

export function mixHex(a: string, b: string, t: number) {
  const pa = parseInt(a.slice(1), 16)
  const pb = parseInt(b.slice(1), 16)
  const ch = (shift: number) => {
    const ca = (pa >> shift) & 255
    const cb = (pb >> shift) & 255
    return Math.round(ca + (cb - ca) * t)
  }
  return `#${[ch(16), ch(8), ch(0)].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

export function hexLuma(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
}

export function pickWeighted<T>(rng: () => number, items: { item: T; w: number }[]): T {
  const total = items.reduce((sum, item) => sum + item.w, 0)
  let r = rng() * total
  for (const item of items) {
    r -= item.w
    if (r <= 0) return item.item
  }
  return items[items.length - 1].item
}

export function hash01(n: number) {
  let x = n | 0
  x = Math.imul(x ^ (x >>> 16), 0x7feb352d)
  x = Math.imul(x ^ (x >>> 15), 0x846ca68b)
  x = (x ^ (x >>> 16)) >>> 0
  return x / 4294967296
}

export function damp(current: number, target: number, dt: number, lambda: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt))
}
