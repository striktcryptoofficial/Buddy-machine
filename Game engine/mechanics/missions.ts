import type { BuddyState, MemoryKind } from './types'

export type MissionId = 'training' | 'mining' | 'exploration' | 'research' | 'defence' | 'escort'

export interface MissionResult {
  id: MissionId
  refused: boolean
  reason: string
  line: string
  memory: string | null
  memoryKind: MemoryKind | null
  energyCost: number
  happinessDelta: number
  curiosityDelta: number
  lonelinessDelta: number
  crystals: number
  vigorGain: number
  charm: 'bell' | 'sweater' | 'crown' | null
}

function clampRoll(roll: number): number {
  if (roll < 0) return 0
  if (roll > 1) return 1
  return roll
}

function refused(id: MissionId, reason: string, line: string): MissionResult {
  return {
    id,
    refused: true,
    reason,
    line,
    memory: null,
    memoryKind: null,
    energyCost: 0,
    happinessDelta: 0,
    curiosityDelta: 0,
    lonelinessDelta: 0,
    crystals: 0,
    vigorGain: 0,
    charm: null,
  }
}

export function offerMission(buddy: BuddyState, id: MissionId, _now: number, roll = 0): MissionResult {
  const chance = clampRoll(roll)
  if (buddy.action === 'sleep') return refused(id, 'She is resting.', 'I am asleep. Ask me later.')
  if (buddy.needs.hunger > 0.82) return refused(id, 'Too hungry to go out.', 'Feed me first.')
  if (buddy.needs.energy < 0.2) return refused(id, 'Not enough energy.', 'I am too tired.')
  if ((id === 'escort' || id === 'defence') && buddy.personality.introversion > 0.74) {
    return refused(id, 'She will not go into a crowd.', 'Too many people.')
  }
  if (id === 'escort' && buddy.personality.independence > 0.78) {
    return refused(id, 'She will not escort.', 'I will go alone, or not at all.')
  }
  if (id === 'training' && buddy.personality.vigor < 0.3) {
    return refused(id, 'Vigor is too low for a drill.', 'Not a drill day.')
  }

  if (id === 'training') {
    return {
      id,
      refused: false,
      reason: 'Training finished.',
      line: 'The drill is done.',
      memory: 'I trained.',
      memoryKind: 'moment',
      energyCost: 0.12,
      happinessDelta: 0.02,
      curiosityDelta: 0,
      lonelinessDelta: 0,
      crystals: 0,
      vigorGain: 0.01,
      charm: null,
    }
  }
  if (id === 'mining') {
    return {
      id,
      refused: false,
      reason: 'Mining finished.',
      line: 'I found a few.',
      memory: 'I brought crystals home.',
      memoryKind: 'moment',
      energyCost: 0.1,
      happinessDelta: 0,
      curiosityDelta: 0.02,
      lonelinessDelta: 0.02,
      crystals: 8,
      vigorGain: 0,
      charm: null,
    }
  }
  if (id === 'exploration') {
    return {
      id,
      refused: false,
      reason: 'Exploration finished.',
      line: 'I am back.',
      memory: 'I went out and came back.',
      memoryKind: 'moment',
      energyCost: 0.14,
      happinessDelta: 0.03,
      curiosityDelta: -0.08,
      lonelinessDelta: 0.04,
      crystals: 2,
      vigorGain: 0,
      charm: chance < 0.18 ? 'bell' : null,
    }
  }
  if (id === 'research') {
    return {
      id,
      refused: false,
      reason: 'Research finished.',
      line: 'I read until the light changed.',
      memory: 'I read.',
      memoryKind: 'moment',
      energyCost: 0.08,
      happinessDelta: 0.01,
      curiosityDelta: -0.06,
      lonelinessDelta: 0,
      crystals: 0,
      vigorGain: 0,
      charm: null,
    }
  }
  if (id === 'defence') {
    return {
      id,
      refused: false,
      reason: 'Defence finished.',
      line: 'The watch is over.',
      memory: 'I kept watch.',
      memoryKind: 'moment',
      energyCost: 0.1,
      happinessDelta: 0,
      curiosityDelta: 0,
      lonelinessDelta: 0.03,
      crystals: 4,
      vigorGain: 0,
      charm: null,
    }
  }
  const quiet = buddy.needs.happiness < 0.35
  return {
    id,
    refused: false,
    reason: quiet ? 'Escort finished without a bond.' : 'Escort finished.',
    line: quiet ? 'I walked. I did not stay.' : 'We walked.',
    memory: quiet ? null : 'I walked with someone.',
    memoryKind: quiet ? null : 'bond',
    energyCost: 0.1,
    happinessDelta: quiet ? 0 : 0.04,
    curiosityDelta: 0,
    lonelinessDelta: -0.06,
    crystals: 0,
    vigorGain: 0,
    charm: null,
  }
}
