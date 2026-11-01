import type { BuddyState, Save } from './types'

export function monthKey(now: number): string {
  const date = new Date(now)
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${date.getUTCFullYear()}-${month}`
}

export function rollSeason(save: Save, now: number) {
  const key = monthKey(now)
  if (save.seasonKey === key) return
  save.seasonKey = key
  save.seasonScraps = 0
  save.seasonPlays = 0
  save.seasonClaimed = false
}

export interface SeasonReport {
  key: string
  careDays: number
  scraps: number
  plays: number
  claimed: boolean
  ready: boolean
  missing: string[]
}

export function seasonReport(save: Save, buddy: BuddyState, now: number): SeasonReport {
  const key = monthKey(now)
  const current = save.seasonKey === key
  const careDays = buddy.careDays.filter((day) => monthKey(day) === key).length
  const scraps = current ? save.seasonScraps : 0
  const plays = current ? save.seasonPlays : 0
  const claimed = current ? save.seasonClaimed : false
  const missing: string[] = []
  if (careDays < 7) missing.push('7 fed days')
  if (scraps < 3) missing.push('3 scraps')
  return {
    key,
    careDays,
    scraps,
    plays,
    claimed,
    ready: missing.length === 0 && !claimed,
    missing,
  }
}
