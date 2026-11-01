import type { Accessory, Dna, Pattern, Rarity } from './types'

export type AwakenedOutfit = 'uniform' | 'open-vest' | 'ceremonial'

export interface AwakenedLook {
  hair: string
  streak: string | null
  third: string | null
  eyes: string
  eyesRight: string
  shirt: string
  vest: string
  trim: string
  bow: string
  accessory: Accessory
  outfit: AwakenedOutfit
  scale: number
  tells: string[]
}

const TELLS: { id: string; text: string }[] = [
  { id: 'heterochromia', text: 'Mismatched eyes' },
  { id: 'star', text: 'A small star mark in the hair' },
  { id: 'luminous', text: 'The eyes keep a glow' },
  { id: 'twinTail', text: 'A paired tie in the accent color' },
  { id: 'mittens', text: 'Light cuffs' },
  { id: 'fluffy', text: 'A softer edge on the hair highlight' },
]

export function awakenedLook(dna: Dna): AwakenedLook {
  const hair = dna.pattern === 'point' ? dna.spot : dna.base
  let streak = streakFor(dna.pattern, dna)
  if (streak === null && (dna.rarity === 'rare' || dna.rarity === 'legendary')) streak = dna.belly
  const third = dna.rarity === 'legendary' ? dna.third : null

  return {
    hair,
    streak,
    third,
    eyes: dna.eye,
    eyesRight: dna.eyeRight,
    shirt: dna.belly,
    vest: dna.spot,
    trim: dna.accent,
    bow: dna.accent,
    accessory: dna.accessory,
    outfit: outfitFor(dna.rarity),
    scale: dna.scale,
    tells: TELLS.filter((tell) => dna.mutations.includes(tell.id)).map((tell) => tell.text),
  }
}

function streakFor(pattern: Pattern, dna: Dna): string | null {
  switch (pattern) {
    case 'tabby':
      return mix(dna.base, dna.belly, 0.55)
    case 'spots':
      return dna.belly
    case 'point':
      return dna.base
    case 'calico':
    case 'tortie':
      return dna.spot
    default:
      return null
  }
}

function outfitFor(rarity: Rarity): AwakenedOutfit {
  if (rarity === 'legendary') return 'ceremonial'
  if (rarity === 'rare') return 'open-vest'
  return 'uniform'
}

function mix(a: string, b: string, t: number) {
  const pa = parseInt(a.slice(1), 16)
  const pb = parseInt(b.slice(1), 16)
  const ch = (shift: number) => {
    const ca = (pa >> shift) & 255
    const cb = (pb >> shift) & 255
    return Math.round(ca + (cb - ca) * t)
  }
  return `#${[ch(16), ch(8), ch(0)].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}
