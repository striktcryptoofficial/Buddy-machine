import type { BuddyState, Save } from './types'
import { bubble, pushMemory } from './engine'
import { noteFight } from './awakening'
import { beginRest, equipCharm, finishRest } from './house'
import { offerMission, type MissionId } from './missions'
import { rollSeason, seasonReport } from './season'
import { challengeReign, practiceFoe, settleTable, type Loadout, type TableResult } from './table'

const ENTRY = 10

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value))
}

function active(save: Save): BuddyState | null {
  return save.buddies.find((buddy) => buddy.id === save.activeId) ?? null
}

function locked(buddy: BuddyState, now: number): boolean {
  return buddy.restUntil != null && now < buddy.restUntil
}

function applyTable(buddy: BuddyState, result: TableResult, now: number) {
  if (result.refused) {
    const next = noteFight(buddy, true)
    buddy.scrapCount = next.scrapCount
    buddy.refuseCount = next.refuseCount
  } else {
    buddy.needs.energy = clamp(buddy.needs.energy - result.energyCost)
    buddy.needs.happiness = clamp(buddy.needs.happiness + result.happinessDelta)
    const next = noteFight(buddy, false)
    buddy.scrapCount = next.scrapCount
    buddy.refuseCount = next.refuseCount
    if (result.memory && result.memoryKind) pushMemory(buddy, result.memory, result.memoryKind, now)
    if (result.winner === 'a' || result.winner === 'both') buddy.clip = 'win'
    else if (result.winner === 'b') buddy.clip = 'loss'
  }
  buddy.reason = result.reason
  bubble(buddy, result.line, now, 2800, 'scrap')
}

function noteSeason(save: Save, result: TableResult, now: number) {
  rollSeason(save, now)
  if (!result.entered || result.refused) return
  save.seasonScraps = (save.seasonScraps ?? 0) + 1
}

export interface FightOutcome {
  reason: string
  line: string
  winner: 'a' | 'b' | 'both' | null
  entered: boolean
  refused: boolean
}

function applyFoe(foe: BuddyState, result: TableResult, now: number) {
  if (!result.entered || result.refused || !foe.needs) return
  foe.memories ??= []
  foe.scrapCount ??= 0
  foe.refuseCount ??= 0
  foe.needs.energy = clamp(foe.needs.energy - result.energyCost)
  foe.needs.happiness = clamp(foe.needs.happiness - result.happinessDelta)
  const next = noteFight(foe, false)
  foe.scrapCount = next.scrapCount
  foe.refuseCount = next.refuseCount
  const memory =
    result.mode === 'staredown'
      ? result.winner === 'b'
        ? 'I held the stare.'
        : 'I looked away.'
      : result.winner === 'a'
        ? 'I lost a scrap.'
        : 'I won a scrap.'
  if (result.memoryKind) pushMemory(foe, memory, result.memoryKind, now)
  foe.reason = result.winner === 'b' ? 'The engine settled the scrap.' : result.reason
  if (result.winner === 'b' || result.winner === 'both') foe.clip = 'win'
  else if (result.winner === 'a') foe.clip = 'loss'
}

export function fightPair(
  save: Save,
  foe: BuddyState,
  mode: 'scrap' | 'staredown' | 'king',
  loadout: Loadout,
  roll: number,
  now: number,
  wallet: string,
  foeSave: Save | null = null,
): FightOutcome {
  const buddy = active(save)
  if (!buddy) return { reason: '', line: '', winner: null, entered: false, refused: true }
  if (locked(buddy, now)) {
    buddy.reason = 'She is resting.'
    bubble(buddy, 'I am asleep. Ask me later.', now, 2800)
    return { reason: buddy.reason, line: 'I am asleep. Ask me later.', winner: null, entered: false, refused: true }
  }
  const selfCan = (save.holdings ?? 0) >= ENTRY
  const foeCan = foeSave ? (foeSave.holdings ?? 0) >= ENTRY : true
  const stake = mode === 'scrap' && selfCan && foeCan ? ENTRY : 0
  let result: TableResult
  if (mode === 'king') {
    const settled = challengeReign(buddy, wallet, save.reign?.wallet ? save.reign : null, foe, roll, now)
    if (settled.reign.wallet) save.reign = settled.reign
    result = settled.result
  } else {
    result = settleTable(buddy, foe, mode === 'staredown' ? 'staredown' : 'scrap', roll, now, stake, loadout)
  }
  if (result.entered && !result.refused && stake > 0) {
    save.holdings = Math.max(0, (save.holdings ?? 0) - stake)
    if (foeSave) foeSave.holdings = Math.max(0, (foeSave.holdings ?? 0) - stake)
    if (result.winner === 'a') save.holdings = (save.holdings ?? 0) + result.pot.payout
    else if (result.winner === 'b' && foeSave) foeSave.holdings = (foeSave.holdings ?? 0) + result.pot.payout
  }
  noteSeason(save, result, now)
  applyTable(buddy, result, now)
  applyFoe(foe, result, now)
  return {
    reason: buddy.reason,
    line: result.line,
    winner: result.winner,
    entered: result.entered,
    refused: result.refused,
  }
}

export function enterTable(
  save: Save,
  mode: 'scrap' | 'staredown' | 'king',
  loadout: Loadout = 'none',
  wallet = 'dev',
): string {
  const now = Date.now()
  const foe = practiceFoe(mode === 'staredown' ? 'practice-stare' : mode === 'king' ? 'practice-king' : 'practice-scrap', now)
  return fightPair(save, foe, mode, loadout, Math.random(), now, wallet, null).reason
}

export function claimSeason(save: Save): string {
  const buddy = active(save)
  if (!buddy) return 'Hatch a cat before marking a season.'
  const now = Date.now()
  rollSeason(save, now)
  const report = seasonReport(save, buddy, now)
  if (report.claimed) {
    buddy.reason = 'This month is already marked.'
    return buddy.reason
  }
  if (!report.ready) {
    buddy.reason = report.missing.join(' · ')
    return buddy.reason
  }
  if (!save.charm) save.charm = 'crown'
  else if (!save.pouch) save.pouch = 'crown'
  save.seasonClaimed = true
  pushMemory(buddy, 'The season left a mark.', 'moment', now)
  buddy.reason = 'The season left a mark.'
  bubble(buddy, 'The season left a mark.', now, 2800, 'aside')
  return buddy.reason
}

export function sendOut(save: Save, id: MissionId): string {
  const buddy = active(save)
  if (!buddy) return ''
  const now = Date.now()
  if (locked(buddy, now)) {
    buddy.reason = 'She is resting.'
    bubble(buddy, 'I am asleep. Ask me later.', now, 2800)
    return buddy.reason
  }
  const result = offerMission(buddy, id, now, Math.random())
  buddy.reason = result.reason
  if (!result.refused) {
    buddy.needs.energy = clamp(buddy.needs.energy - result.energyCost)
    buddy.needs.happiness = clamp(buddy.needs.happiness + result.happinessDelta)
    buddy.needs.curiosity = clamp(buddy.needs.curiosity + result.curiosityDelta)
    buddy.needs.loneliness = clamp(buddy.needs.loneliness + result.lonelinessDelta)
    buddy.personality.vigor = clamp(buddy.personality.vigor + result.vigorGain)
    save.holdings = (save.holdings ?? 0) + result.crystals
    if (result.charm) save.charm = equipCharm(save.charm ?? null, result.charm)
    if (id === 'exploration') save.explorations = (save.explorations ?? 0) + 1
    if (result.memory && result.memoryKind) pushMemory(buddy, result.memory, result.memoryKind, now)
  }
  bubble(buddy, result.line, now, 2800, result.refused ? undefined : 'aside')
  return buddy.reason
}

export function lieDown(buddy: BuddyState): string {
  const now = Date.now()
  if (locked(buddy, now)) {
    buddy.reason = 'She is already resting.'
    return buddy.reason
  }
  const lock = beginRest(now)
  buddy.restUntil = lock.until
  buddy.restStartedAt = lock.startedAt
  buddy.restEnergy = buddy.needs.energy
  buddy.action = 'sleep'
  buddy.moving = false
  buddy.actionStartedAt = now
  buddy.actionUntil = lock.until
  buddy.reason = 'She is resting.'
  bubble(buddy, 'I am going to rest.', now, 2800)
  return buddy.reason
}

export function rise(buddy: BuddyState): string {
  const now = Date.now()
  if (buddy.restUntil == null || buddy.restStartedAt == null || buddy.restEnergy == null) {
    buddy.reason = 'She is not resting.'
    return buddy.reason
  }
  const done = finishRest({ startedAt: buddy.restStartedAt, until: buddy.restUntil }, now, buddy.restEnergy)
  buddy.needs.energy = done.energy
  buddy.restUntil = null
  buddy.restStartedAt = null
  buddy.restEnergy = null
  buddy.action = 'sit'
  buddy.moving = false
  buddy.actionStartedAt = now
  buddy.actionUntil = now + 4000
  buddy.reason = done.early ? 'She woke early, tired.' : 'She slept.'
  bubble(buddy, done.line, now, 2800, done.early ? undefined : 'wake')
  return buddy.reason
}
