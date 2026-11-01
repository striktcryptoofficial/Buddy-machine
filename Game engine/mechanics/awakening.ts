import type { BuddyState, MemoryKind } from './types'

export const AWAKENING = {
  careDays: 12,
  spanDays: 14,
  trust: 0.72,
  trustDays: 2,
  fights: 3,
  hungerBlock: 0.82,
}

const DAY_MS = 86_400_000

export function utcMidnight(now: number): number {
  const date = new Date(now)
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

export function noteCareDay(buddy: BuddyState, now: number, fed: boolean): BuddyState {
  const midnight = utcMidnight(now)
  const careDays =
    fed && !buddy.careDays.includes(midnight) ? [...buddy.careDays, midnight] : buddy.careDays
  const trustHighDays =
    fed && buddy.trust >= AWAKENING.trust && !buddy.trustHighDays.includes(midnight)
      ? [...buddy.trustHighDays, midnight]
      : buddy.trustHighDays

  return { ...buddy, careDays, trustHighDays }
}

export function noteFight(buddy: BuddyState, refused: boolean): BuddyState {
  return refused
    ? { ...buddy, refuseCount: buddy.refuseCount + 1 }
    : { ...buddy, scrapCount: buddy.scrapCount + 1 }
}

export interface AwakeningReport {
  ready: boolean
  alreadyAwake: boolean
  asleep: boolean
  missing: string[]
}

export function awakeningReport(buddy: BuddyState): AwakeningReport {
  const missing: string[] = []
  const careDays = [...new Set(buddy.careDays)]
  const careDaySet = new Set(careDays)
  const trustHighDays = new Set(buddy.trustHighDays.filter((day) => careDaySet.has(day)))
  const memoryKinds = new Set<MemoryKind>(buddy.memories.map((memory) => memory.kind))

  if (careDays.length < AWAKENING.careDays) missing.push('12 cared-for days')

  const span =
    careDays.length > 0 ? Math.max(...careDays) - Math.min(...careDays) : 0
  if (span < (AWAKENING.spanDays - 1) * DAY_MS) missing.push('14 day span')

  if (trustHighDays.size < AWAKENING.trustDays) missing.push('trust held')
  if (!memoryKinds.has('bond')) missing.push('a bond')
  if (!memoryKinds.has('moment')) missing.push('a moment')
  if (!memoryKinds.has('habit')) missing.push('a habit')
  if (!memoryKinds.has('away')) missing.push('an away')
  if (buddy.scrapCount + buddy.refuseCount < AWAKENING.fights) missing.push('3 fights')
  if (buddy.needs.hunger > AWAKENING.hungerBlock) missing.push('she is hungry')

  const alreadyAwake = buddy.awakenedAt !== null
  const asleep = buddy.action === 'sleep'

  return {
    ready: missing.length === 0 && !asleep && !alreadyAwake,
    alreadyAwake,
    asleep,
    missing,
  }
}

export function beginAwakening(buddy: BuddyState, now: number): BuddyState {
  return awakeningReport(buddy).ready ? { ...buddy, awakenedAt: now } : buddy
}

export function markTrustDay(buddy: BuddyState, now: number) {
  const midnight = utcMidnight(now)
  if (!buddy.careDays.includes(midnight)) return
  if (buddy.trust < AWAKENING.trust) return
  if (buddy.trustHighDays.includes(midnight)) return
  buddy.trustHighDays.push(midnight)
}
