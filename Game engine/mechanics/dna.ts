import type { Accessory, Dna, EarType, EyeShape, Pattern, Rarity, Spot, TailType, Traits } from './types'
import { TRAIT_KEYS } from './types'
import { clamp, hexLuma, hslToHex, mixHex, mulberry32, pickWeighted } from './random'

const NAMES = [
  'Miso', 'Nori', 'Pip', 'Sable', 'Mochi', 'Olive', 'Fig', 'Pepper', 'Maple', 'Yuki',
  'Hazel', 'Poppy', 'Bean', 'Lark', 'Soot', 'Honey', 'Pixel', 'Ash', 'Cinder', 'Fern',
  'Juno', 'Mika', 'Poe', 'Rye', 'Suki', 'Taro', 'Wren', 'Ember', 'Cleo', 'Dori',
  'Bramble', 'Nim', 'Lolo', 'Kite', 'Hoku', 'Ivy', 'Goose', 'Fable', 'Alto', 'Biscuit',
  'Plum', 'Sorrel', 'Tofu', 'Pebble', 'Mallow', 'Noodle', 'Quill', 'Yarrow', 'Cosmo', 'Ink',
]

const COATS: { name: string; h: number; s: number; l: number; w: number }[] = [
  { name: 'Gold', h: 44, s: 88, l: 60, w: 14 },
  { name: 'Ginger', h: 28, s: 72, l: 52, w: 16 },
  { name: 'Cream', h: 32, s: 45, l: 86, w: 12 },
  { name: 'Grey', h: 220, s: 8, l: 72, w: 12 },
  { name: 'Slate', h: 215, s: 14, l: 58, w: 8 },
  { name: 'Ink', h: 220, s: 10, l: 28, w: 8 },
  { name: 'Cocoa', h: 22, s: 42, l: 42, w: 10 },
  { name: 'Cloud', h: 30, s: 18, l: 94, w: 8 },
  { name: 'Blush', h: 12, s: 48, l: 76, w: 5 },
  { name: 'Blue', h: 210, s: 22, l: 70, w: 5 },
  { name: 'Lilac', h: 275, s: 24, l: 74, w: 4 },
]

const EYES: { hex: string; w: number }[] = [
  { hex: '#e8a317', w: 18 },
  { hex: '#7dbb4a', w: 16 },
  { hex: '#f0c84a', w: 14 },
  { hex: '#6aa6e0', w: 12 },
  { hex: '#d06a32', w: 12 },
  { hex: '#b7a04a', w: 10 },
  { hex: '#b9e6f2', w: 5 },
  { hex: '#9a7ad4', w: 4 },
]

export const MUTATION_LABEL: Record<string, string> = {
  heterochromia: 'Heterochromia',
  star: 'Star mark',
  fluffy: 'Extra fluff',
  bigPaws: 'Big paws',
  luminous: 'Luminous eyes',
  twinTail: 'Twin tail',
  mittens: 'Mittens',
  miniature: 'Miniature',
  grand: 'Grand',
}

export function makeDna(visualSeed: number): Dna {
  const rng = mulberry32(visualSeed)
  const coat = pickWeighted(rng, COATS.map((coat) => ({ item: coat, w: coat.w })))
  const h = coat.h + (rng() - 0.5) * 10
  const s = coat.s + (rng() - 0.5) * 8
  const l = coat.l + (rng() - 0.5) * 6
  let base = hslToHex(h, s, l)
  let spot = hslToHex(h + 4, Math.min(92, s + 6), l - 18)
  let third = hslToHex((h + 28) % 360, Math.max(20, s - 10), Math.min(94, l + 12))

  const pattern = pickWeighted<Pattern>(rng, [
    { item: 'solid', w: 18 },
    { item: 'tabby', w: 26 },
    { item: 'spots', w: 18 },
    { item: 'calico', w: 14 },
    { item: 'point', w: 12 },
    { item: 'tortie', w: 8 },
  ])

  if (pattern === 'point') {
    base = hslToHex(h, Math.max(12, s * 0.35), 91)
    spot = hslToHex(h, Math.min(55, s), 38)
    third = hslToHex(h, 20, 78)
  }
  if (pattern === 'calico' || pattern === 'tortie') {
    spot = hslToHex(24, 70, 42)
    third = hexLuma(base) > 0.6 ? '#2c3138' : hslToHex(40, 80, 62)
  }

  const eye = pickWeighted(rng, EYES.map((e) => ({ item: e.hex, w: e.w })))
  const mutations = rollMutations(rng)
  let eyeRight = eye
  if (mutations.includes('heterochromia')) {
    eyeRight = pickWeighted(rng, EYES.filter((e) => e.hex !== eye).map((e) => ({ item: e.hex, w: e.w })))
  }

  const ears = pickWeighted<EarType>(rng, [
    { item: 'pointed', w: 34 },
    { item: 'rounded', w: 22 },
    { item: 'wide', w: 16 },
    { item: 'folded', w: 14 },
    { item: 'tufted', w: 14 },
  ])
  const tail = pickWeighted<TailType>(rng, [
    { item: 'long', w: 28 },
    { item: 'fluffy', w: 20 },
    { item: 'slim', w: 16 },
    { item: 'curled', w: 16 },
    { item: 'bob', w: 12 },
    { item: 'kinked', w: 8 },
  ])
  const eyeShape = pickWeighted<EyeShape>(rng, [
    { item: 'round', w: 40 },
    { item: 'almond', w: 24 },
    { item: 'large', w: 20 },
    { item: 'narrow', w: 16 },
  ])
  const accessory = pickWeighted<Accessory>(rng, [
    { item: 'none', w: 36 },
    { item: 'collar', w: 16 },
    { item: 'bow', w: 12 },
    { item: 'bandana', w: 10 },
    { item: 'flower', w: 8 },
    { item: 'scarf', w: 7 },
    { item: 'glasses', w: 6 },
    { item: 'hat', w: 5 },
  ])

  const accent = hslToHex((h + 160) % 360, 62, 48)
  const nose = hexLuma(base) < 0.42 ? '#2a2422' : '#f0a0b4'
  const belly = mixHex(base, '#ffffff', pattern === 'point' ? 0.2 : 0.38)
  const spots = makeSpots(rng, pattern)
  let scale = 1
  if (mutations.includes('miniature')) scale = 0.84
  if (mutations.includes('grand')) scale = 1.12

  return {
    visualSeed,
    coatName: coat.name,
    base,
    spot,
    third,
    belly,
    pattern,
    eye,
    eyeRight,
    eyeShape,
    ears,
    tail,
    accessory,
    accent,
    nose,
    mutations,
    spots,
    stripeShift: Math.round(rng() * 18),
    gaze: rng() < 0.5 ? -1 : 1,
    scale,
    rarity: rarityFor({ mutations, pattern, ears, tail, accessory, eye }),
  }
}

function rollMutations(rng: () => number) {
  const pool = [
    { id: 'heterochromia', p: 0.08 },
    { id: 'star', p: 0.07 },
    { id: 'fluffy', p: 0.12 },
    { id: 'bigPaws', p: 0.08 },
    { id: 'luminous', p: 0.05 },
    { id: 'twinTail', p: 0.04 },
    { id: 'mittens', p: 0.1 },
    { id: 'miniature', p: 0.06 },
    { id: 'grand', p: 0.06 },
  ]
  const out: string[] = []
  for (const mutation of pool) if (rng() < mutation.p) out.push(mutation.id)
  if (out.includes('miniature') && out.includes('grand')) out.splice(out.indexOf('grand'), 1)
  return out.slice(0, 3)
}

function makeSpots(rng: () => number, pattern: Pattern): Spot[] {
  if (pattern === 'solid' || pattern === 'point') return []
  const count = pattern === 'calico' || pattern === 'tortie' ? 7 : pattern === 'tabby' ? 8 : 14
  const spots: Spot[] = []
  for (let i = 0; i < count; i++) {
    const spot: Spot = {
      x: 130 + rng() * 240,
      y: 210 + rng() * 250,
      rx: pattern === 'calico' || pattern === 'tortie' ? 28 + rng() * 36 : 12 + rng() * 20,
      ry: pattern === 'calico' || pattern === 'tortie' ? 22 + rng() * 28 : 10 + rng() * 16,
      rot: rng() * 180,
      color: rng() < 0.72 ? 'spot' : 'third',
    }
    const inEyes = spot.y > 220 && spot.y < 300 && spot.x > 155 && spot.x < 350
    if (!inEyes) spots.push(spot)
  }
  return spots
}

function rarityFor(dna: {
  mutations: string[]
  pattern: Pattern
  ears: EarType
  tail: TailType
  accessory: Accessory
  eye: string
}): Rarity {
  let score = dna.mutations.length * 2
  if (dna.pattern === 'tortie') score += 2
  if (dna.pattern === 'point' || dna.pattern === 'calico') score += 1
  if (dna.ears === 'folded') score += 1
  if (dna.tail === 'bob' || dna.tail === 'kinked') score += 1
  if (dna.accessory === 'hat' || dna.accessory === 'glasses') score += 1
  if (dna.eye === '#9a7ad4' || dna.eye === '#b9e6f2') score += 1
  // Measured on 200,000 seeds: common 59.9%, uncommon 28.3%, rare 9.7%, legendary 2.1%.
  // Legendary is about one wallet in fifty. The coat is the prize. It does not decide the scrap.
  if (score >= 7) return 'legendary'
  if (score >= 5) return 'rare'
  if (score >= 3) return 'uncommon'
  return 'common'
}

export function personalityFrom(lifeSeed: number): Traits {
  const rng = mulberry32(lifeSeed)
  const primary = TRAIT_KEYS[Math.floor(rng() * TRAIT_KEYS.length)]
  const traits = {} as Traits
  for (const key of TRAIT_KEYS) {
    const base = 0.16 + rng() * 0.66
    traits[key] = key === primary ? clamp(base + 0.2, 0.05, 0.96) : base
  }
  if (traits.introversion > 0.72) traits.affection = clamp(traits.affection - 0.12)
  if (traits.affection > 0.75) traits.independence = clamp(traits.independence - 0.1)
  return traits
}

export function makeName(lifeSeed: number, taken: string[]) {
  const rng = mulberry32(lifeSeed ^ 0x9e3779b9)
  const start = Math.floor(rng() * NAMES.length)
  for (let i = 0; i < NAMES.length; i++) {
    const name = NAMES[(start + i) % NAMES.length]
    if (!taken.includes(name)) return name
  }
  return `${NAMES[start]} ${start + 2}`
}

export function coatTitle(dna: Dna) {
  if (dna.pattern === 'solid') return dna.coatName
  const label = dna.pattern === 'point' ? 'point' : dna.pattern
  return `${dna.coatName} ${label}`
}

export function parseSeed(raw: string): number | undefined {
  const text = raw.trim()
  if (!text) return undefined
  if (!/^[0-9a-fx]+$/i.test(text)) return undefined
  const hex = /^0x/i.test(text) || /[a-f]/i.test(text)
  const n = hex ? Number.parseInt(text.replace(/^0x/i, ''), 16) : Number.parseInt(text, 10)
  if (!Number.isFinite(n)) return undefined
  return n >>> 0
}

export function seedHex(seed: number) {
  return (seed >>> 0).toString(16).padStart(8, '0')
}
