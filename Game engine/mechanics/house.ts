import type { BuddyState } from './types'

const DAY_MS = 86_400_000

export interface RestLock {
  startedAt: number
  until: number
}

export type CharmId = 'bell' | 'sweater' | 'crown'

export type TitleId = 'battle-hardened' | 'explorer' | 'old-house'

function round4(value: number): number {
  return Math.round(value * 10000) / 10000
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}

export function beginRest(now: number): RestLock {
  return { startedAt: now, until: now + DAY_MS }
}

export function resting(lock: RestLock | null, now: number): boolean {
  return Boolean(lock && now < lock.until)
}

export function restEnergy(lock: RestLock, now: number, energy: number): number {
  const start = clamp01(energy)
  if (now <= lock.startedAt) return round4(start)
  if (now >= lock.until) return 1
  const span = lock.until - lock.startedAt
  const t = span > 0 ? (now - lock.startedAt) / span : 1
  return round4(clamp01(start + (1 - start) * t))
}

export function finishRest(lock: RestLock, now: number, energy: number): { early: boolean; energy: number; line: string } {
  if (now < lock.until) {
    return { early: true, energy: round4(Math.min(clamp01(energy), 0.35)), line: 'Too early. I am tired.' }
  }
  return { early: false, energy: restEnergy(lock, now, energy), line: 'I slept.' }
}

export function titlesFor(buddy: BuddyState, explorations: number, now: number): TitleId[] {
  const trips = explorations < 0 ? 0 : explorations
  const titles: TitleId[] = []
  if (buddy.scrapCount >= 100) titles.push('battle-hardened')
  if (trips >= 12) titles.push('explorer')
  if (now - buddy.createdAt >= 30 * DAY_MS && buddy.careDays.length >= 12) titles.push('old-house')
  return titles
}

export function equipCharm(_current: CharmId | null, next: CharmId | null): CharmId | null {
  return next
}

export function claimHolderCharm(alreadyClaimed: boolean, tierIsFull: boolean): { claimed: boolean; charm: CharmId | null } {
  if (alreadyClaimed || !tierIsFull) return { claimed: alreadyClaimed, charm: null }
  return { claimed: true, charm: 'sweater' }
}
