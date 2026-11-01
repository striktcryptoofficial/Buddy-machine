import { combatMods, readyAbilityNames, type AbilitySide } from './abilities'
import type { BuddyState, Rarity } from './types'

export const POT_FEE = 0.05

const RARITY_NUDGE: Record<Rarity, number> = {
  common: 1,
  uncommon: 1.015,
  rare: 1.03,
  legendary: 1.05,
}

function round6(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000
}

export function settlePot(buyInEach: number): { pot: number; fee: number; payout: number } {
  if (buyInEach <= 0) return { pot: 0, fee: 0, payout: 0 }
  const pot = buyInEach * 2
  const fee = round6(pot * POT_FEE)
  return { pot, fee, payout: pot - fee }
}

export interface ScrapSide {
  vigor: number
  mischief: number
  independence: number
  curiosity: number
  affection: number
  introversion: number
  energy: number
  happiness: number
  hunger: number
  mood: BuddyState['mood']
  rarity: Rarity
  asleep: boolean
  trust: number
  scraps: number
}

export function sideFrom(buddy: BuddyState): ScrapSide {
  const traits = buddy.personality
  const needs = buddy.needs
  return {
    vigor: traits.vigor,
    mischief: traits.mischief,
    independence: traits.independence,
    curiosity: traits.curiosity,
    affection: traits.affection,
    introversion: traits.introversion,
    energy: needs.energy,
    happiness: needs.happiness,
    hunger: needs.hunger,
    mood: buddy.mood,
    rarity: buddy.dna.rarity,
    asleep: buddy.action === 'sleep',
    trust: buddy.trust,
    scraps: buddy.scrapCount,
  }
}

export function personalityRefuses(side: ScrapSide): boolean {
  if (side.independence > 0.78 && side.trust < 0.4) return true
  if (side.introversion > 0.74 && side.affection < 0.35 && side.trust < 0.5) return true
  return false
}

export function canEnter(side: ScrapSide): boolean {
  return !side.asleep && side.hunger <= 0.82 && side.energy >= 0.2
}

export function scrapPower(side: ScrapSide): number {
  let power =
    side.vigor * 0.34 +
    side.mischief * 0.22 +
    side.independence * 0.12 +
    side.curiosity * 0.08 +
    side.affection * 0.06 +
    (1 - side.introversion) * 0.06

  if (side.energy < 0.45) power *= 0.75
  if (side.hunger > 0.7) power *= 0.8
  if (side.happiness < 0.35) power *= 0.85
  if (side.mood === 'sleepy' || side.mood === 'sad') power *= 0.9
  if (side.mood === 'angry' || side.mood === 'excited') power *= 1.06

  return power * RARITY_NUDGE[side.rarity]
}

/** Her power, after the abilities she has today, against this opponent's guard. */
export function armedPower(self: ScrapSide, foe: ScrapSide): number {
  return scrapPower(self) * combatMods(self).offense * combatMods(foe).guard
}

export function stareBonus(side: ScrapSide): number {
  return combatMods(side).stare
}

export function scrapAbilityLine(side: AbilitySide): string {
  const names = readyAbilityNames(side)
  if (!names.length) return 'The engine settled the scrap.'
  const shown = names.slice(0, 3)
  const tail = names.length > 3 ? ` and ${names.length - 3} more` : ''
  return `${shown.join(', ')}${tail} were in the scrap.`
}

export function resolveScrap(
  a: ScrapSide,
  b: ScrapSide,
  roll: number,
): { winner: 'a' | 'b'; chanceA: number } {
  const aIn = canEnter(a)
  const bIn = canEnter(b)

  if (!aIn && !bIn) {
    const powerA = armedPower(a, b)
    const powerB = armedPower(b, a)
    return { winner: powerA >= powerB ? 'a' : 'b', chanceA: 0.5 }
  }
  if (!aIn) return { winner: 'b', chanceA: 0 }
  if (!bIn) return { winner: 'a', chanceA: 1 }

  const powerA = armedPower(a, b)
  const powerB = armedPower(b, a)
  const total = powerA + powerB
  const chanceA = total > 0 ? powerA / total : 0.5
  return { winner: roll < chanceA ? 'a' : 'b', chanceA }
}
