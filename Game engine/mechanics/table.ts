import { armedPower, canEnter, personalityRefuses, resolveScrap, scrapAbilityLine, settlePot, sideFrom } from './battle'
import { createBuddy } from './engine'
import type { BuddyState } from './types'

export function walletSeed(wallet: string): number {
  let hash = 2166136261
  for (let i = 0; i < wallet.length; i++) {
    hash ^= wallet.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function practiceFoe(label: string, now: number): BuddyState {
  const buddy = createBuddy(label, { visualSeed: walletSeed(label) })
  buddy.id = `w_${buddy.visualSeed.toString(36)}`
  buddy.createdAt = now
  buddy.lastSimulatedAt = now
  buddy.lastSeen = now
  buddy.awakenedAt = null
  return buddy
}

export type TableMode = 'scrap' | 'staredown'
export type Loadout = 'none' | 'berserker' | 'strategist'

export function pilotScale(loadout: Loadout): { offense: number; defense: number } {
  if (loadout === 'berserker') return { offense: 1.12, defense: 0.86 }
  if (loadout === 'strategist') return { offense: 0.94, defense: 1.1 }
  return { offense: 1, defense: 1 }
}

export interface TableResult {
  entered: boolean
  refused: boolean
  mode: TableMode
  winner: 'a' | 'b' | 'both' | null
  chanceA: number
  reason: string
  line: string
  memory: string | null
  memoryKind: 'moment' | 'bond' | null
  energyCost: number
  happinessDelta: number
  pot: { pot: number; fee: number; payout: number }
  buyInEach: number
}

function clamp01(value: number): number {
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}

function refusal(mode: TableMode, buyInEach: number, line: string): TableResult {
  return {
    entered: false,
    refused: true,
    mode,
    winner: null,
    chanceA: 0,
    reason: 'She refused.',
    line,
    memory: null,
    memoryKind: null,
    energyCost: 0,
    happinessDelta: 0,
    pot: settlePot(0),
    buyInEach,
  }
}

export function settleTable(
  self: BuddyState,
  foe: BuddyState,
  mode: TableMode,
  roll: number,
  now: number,
  buyInEach = 0,
  loadout: Loadout = 'none',
): TableResult {
  void now
  const chance = clamp01(roll)
  const stake = buyInEach < 0 ? 0 : buyInEach
  const side = sideFrom(self)
  if (self.action === 'sleep' || !canEnter(side) || personalityRefuses(side)) {
    const line = side.asleep
      ? 'I am asleep. Ask me later.'
      : side.hunger > 0.82
        ? 'Feed me first.'
        : side.energy < 0.2
          ? 'I am too tired to fight.'
          : 'No. Not this one.'
    return refusal(mode, stake, line)
  }

  if (mode === 'staredown') {
    const score = (who: BuddyState) => {
      const traits = who.personality
      let value = traits.independence * 0.5 + traits.introversion * 0.3 + who.needs.hunger * 0.2
      if (who.mood === 'sleepy' || who.mood === 'sad') value += 0.05
      return value
    }
    const mine = score(self)
    const theirs = score(foe)
    const tied = Math.abs(mine - theirs) < 0.01
    const winner: 'a' | 'b' = tied ? (chance < 0.5 ? 'a' : 'b') : mine < theirs ? 'a' : 'b'
    const won = winner === 'a'
    return {
      entered: true,
      refused: false,
      mode,
      winner,
      chanceA: tied ? 0.5 : mine < theirs ? 1 : 0,
      reason: 'No one touched. Someone looked away.',
      line: won ? 'They looked away first.' : 'I looked away.',
      memory: won ? 'I held the stare.' : 'I looked away.',
      memoryKind: 'moment',
      energyCost: 0.08,
      happinessDelta: won ? 0.03 : -0.03,
      pot: settlePot(0),
      buyInEach: stake,
    }
  }

  const resolved = resolveScrap(side, sideFrom(foe), chance)
  let winner = resolved.winner
  let chanceA = resolved.chanceA
  const foeSide = sideFrom(foe)
  if (canEnter(side) && canEnter(foeSide) && loadout !== 'none') {
    const scale = pilotScale(loadout)
    const selfPower = armedPower(side, foeSide) * scale.offense
    const foePower = armedPower(foeSide, side) * (loadout === 'strategist' ? 0.9 : 1)
    const total = selfPower + foePower
    chanceA = total > 0 ? selfPower / total : 0.5
    winner = chance < chanceA ? 'a' : 'b'
  }
  const won = winner === 'a'
  return {
    entered: true,
    refused: false,
    mode: 'scrap',
    winner,
    chanceA,
    reason: scrapAbilityLine(side),
    line: won ? 'That one was mine.' : 'Again. Stay with me.',
    memory: won ? 'I won a scrap.' : 'I lost a scrap.',
    memoryKind: 'moment',
    energyCost: 0.15,
    happinessDelta: won ? 0.06 : -0.04,
    pot: settlePot(stake),
    buyInEach: stake,
  }
}

export interface Reign {
  wallet: string
  name: string
  since: number
  defenses: number
}

export function challengeReign(
  self: BuddyState,
  selfWallet: string,
  reign: Reign | null,
  foe: BuddyState,
  roll: number,
  now: number,
): { result: TableResult; reign: Reign } {
  const result = settleTable(self, foe, 'scrap', roll, now, 0, 'none')
  const empty: Reign = { wallet: '', name: '', since: 0, defenses: 0 }
  if (result.refused) return { result, reign: reign ?? empty }
  if (result.winner === 'a') {
    if (!reign?.wallet || reign.wallet !== selfWallet) {
      return {
        result: { ...result, reason: 'The crown moved.' },
        reign: { wallet: selfWallet, name: self.name, since: now, defenses: 0 },
      }
    }
    return { result, reign: { ...reign, defenses: reign.defenses + 1 } }
  }
  return { result, reign: reign ?? empty }
}
