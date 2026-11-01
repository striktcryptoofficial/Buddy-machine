import type { BuddyState } from './types'

/** What a fight reads. Kept here so the cards and the scrap use one list. */
export interface AbilitySide {
  vigor: number
  mischief: number
  independence: number
  curiosity: number
  affection: number
  introversion: number
  energy: number
  happiness: number
  hunger: number
  trust: number
  scraps: number
  mood: BuddyState['mood']
}

export interface AbilityMods {
  offense: number
  guard: number
  stare: number
}

export interface AbilityCard {
  code: string
  name: string
  line: string
  state: string
  ready: boolean
  detail: string
  rows: { label: string; value: string }[]
}

interface Effect {
  offense: number
  guard: number
  stare: number
}

interface AbilityDef {
  code: string
  name: string
  line: string
  detail: string
  ready: (side: AbilitySide) => boolean
  effect: (side: AbilitySide) => Effect
  row: (side: AbilitySide, ready: boolean) => { label: string; value: string }
}

const NONE: Effect = { offense: 0, guard: 0, stare: 0 }

function pct(value: number) {
  return `${Math.round(value * 100)}`
}

const ABILITIES: AbilityDef[] = [
  {
    code: 'SIG',
    name: 'Shadow Strike',
    line: 'Signature strike',
    detail: 'High mischief adds to her scrap.',
    ready: (side) => side.mischief >= 0.62,
    effect: () => ({ offense: 0.06, guard: 0, stare: 0 }),
    row: (side, ready) => ({ label: ready ? 'Scrap' : 'Needs', value: ready ? '+6%' : `Mischief ${pct(side.mischief)}` }),
  },
  {
    code: 'TAC',
    name: 'Tactical Read',
    line: 'Reads the fight',
    detail: 'Curiosity adds a little to a scrap and a stare.',
    ready: (side) => side.curiosity >= 0.62,
    effect: () => ({ offense: 0.04, guard: 0, stare: 0.04 }),
    row: (side, ready) => ({ label: ready ? 'Scrap' : 'Needs', value: ready ? '+4%' : `Curiosity ${pct(side.curiosity)}` }),
  },
  {
    code: 'AEG',
    name: 'Aegis',
    line: 'Blocks with defense',
    detail: 'Independence cuts the other side.',
    ready: (side) => side.independence >= 0.62,
    effect: () => ({ offense: 0, guard: 0.06, stare: 0 }),
    row: (side, ready) => ({ label: ready ? 'Guard' : 'Needs', value: ready ? '6%' : `Independence ${pct(side.independence)}` }),
  },
  {
    code: 'LCK',
    name: 'Lucky Break',
    line: 'A luck check',
    detail: 'A good day adds a little. A bad day does not.',
    ready: (side) => side.happiness >= 0.62,
    effect: () => ({ offense: 0.04, guard: 0, stare: 0 }),
    row: (side, ready) => ({ label: ready ? 'Scrap' : 'Needs', value: ready ? '+4%' : `Happiness ${pct(side.happiness)}` }),
  },
  {
    code: 'EDG',
    name: 'Keen Edge',
    line: 'Vigor, straight',
    detail: 'Vigor is the heavy part of a scrap.',
    ready: (side) => side.vigor >= 0.62,
    effect: () => ({ offense: 0.07, guard: 0, stare: 0 }),
    row: (side, ready) => ({ label: ready ? 'Scrap' : 'Needs', value: ready ? '+7%' : `Vigor ${pct(side.vigor)}` }),
  },
  {
    code: 'SFT',
    name: 'Soft Step',
    line: 'Affection, not force',
    detail: 'Affection is weak in a scrap and strong in a stare.',
    ready: (side) => side.affection >= 0.66,
    effect: () => ({ offense: -0.03, guard: 0, stare: 0.08 }),
    row: (side, ready) => ({ label: ready ? 'Stare' : 'Needs', value: ready ? '+8' : `Affection ${pct(side.affection)}` }),
  },
  {
    code: 'STL',
    name: 'Still Water',
    line: 'Holds the look',
    detail: 'Introversion holds a stare.',
    ready: (side) => side.introversion >= 0.62,
    effect: () => ({ ...NONE, stare: 0.08 }),
    row: (side, ready) => ({ label: ready ? 'Stare' : 'Needs', value: ready ? '+8' : `Introversion ${pct(side.introversion)}` }),
  },
  {
    code: 'WND',
    name: 'Second Wind',
    line: 'Energy left',
    detail: 'With energy left, the scrap hits a little harder.',
    ready: (side) => side.energy >= 0.55,
    effect: () => ({ offense: 0.04, guard: 0, stare: 0 }),
    row: (side, ready) => ({ label: ready ? 'Scrap' : 'Needs', value: ready ? '+4%' : `Energy ${pct(side.energy)}` }),
  },
  {
    code: 'BIT',
    name: 'Hungry Bite',
    line: 'Hungry, still in',
    detail: 'Hungry, but not too hungry to enter. The scrap gets sharper.',
    ready: (side) => side.hunger >= 0.55 && side.hunger <= 0.82,
    effect: () => ({ offense: 0.05, guard: 0, stare: 0 }),
    row: (side, ready) => ({ label: ready ? 'Scrap' : 'Hunger', value: ready ? '+5%' : pct(side.hunger) }),
  },
  {
    code: 'TMP',
    name: 'Temper',
    line: 'Angry or excited',
    detail: 'Anger and excitement both push a scrap.',
    ready: (side) => side.mood === 'angry' || side.mood === 'excited',
    effect: () => ({ offense: 0.05, guard: 0, stare: 0 }),
    row: (side, ready) => ({ label: ready ? 'Scrap' : 'Mood', value: ready ? '+5%' : side.mood }),
  },
  {
    code: 'GRD',
    name: 'Guarded',
    line: 'Trust holds',
    detail: 'Trust cuts what the other side can do.',
    ready: (side) => side.trust >= 0.6,
    effect: () => ({ offense: 0, guard: 0.04, stare: 0.03 }),
    row: (side, ready) => ({ label: ready ? 'Guard' : 'Needs', value: ready ? '4%' : `Trust ${pct(side.trust)}` }),
  },
  {
    code: 'PRC',
    name: 'Practiced',
    line: 'Scraps behind her',
    detail: 'A few scraps teach the next one. More scraps teach a little more.',
    ready: (side) => side.scraps >= 3,
    effect: (side) => ({ offense: side.scraps >= 15 ? 0.06 : 0.03, guard: 0, stare: 0 }),
    row: (side, ready) => ({ label: ready ? 'Scrap' : 'Needs', value: ready ? (side.scraps >= 15 ? '+6%' : '+3%') : `${side.scraps}/3` }),
  },
  {
    code: 'RSH',
    name: 'Rush',
    line: 'Vigor and mischief',
    detail: 'Both vigor and mischief have to be up. Then the scrap surges.',
    ready: (side) => side.vigor >= 0.55 && side.mischief >= 0.55,
    effect: () => ({ offense: 0.04, guard: 0, stare: 0 }),
    row: (side, ready) => ({ label: ready ? 'Scrap' : 'Needs', value: ready ? '+4%' : `${pct(side.vigor)}/${pct(side.mischief)}` }),
  },
  {
    code: 'CAL',
    name: 'Calm',
    line: 'Not rattled',
    detail: 'A steady mood guards her. Sleepy and sad do not.',
    ready: (side) => side.mood !== 'sleepy' && side.mood !== 'sad' && side.mood !== 'angry',
    effect: () => ({ offense: 0, guard: 0.03, stare: 0.02 }),
    row: (side, ready) => ({ label: ready ? 'Guard' : 'Mood', value: ready ? '3%' : side.mood }),
  },
]

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export function abilitySide(buddy: BuddyState): AbilitySide {
  return {
    vigor: buddy.personality.vigor,
    mischief: buddy.personality.mischief,
    independence: buddy.personality.independence,
    curiosity: buddy.personality.curiosity,
    affection: buddy.personality.affection,
    introversion: buddy.personality.introversion,
    energy: buddy.needs.energy,
    happiness: buddy.needs.happiness,
    hunger: buddy.needs.hunger,
    trust: buddy.trust,
    scraps: buddy.scrapCount,
    mood: buddy.mood,
  }
}

export function combatMods(side: AbilitySide): AbilityMods {
  let offense = 1
  let guardCut = 0
  let stare = 0
  for (const ability of ABILITIES) {
    if (!ability.ready(side)) continue
    const effect = ability.effect(side)
    offense += effect.offense
    guardCut += effect.guard
    stare += effect.stare
  }
  return {
    offense: clamp(offense, 0.9, 1.28),
    guard: clamp(1 - guardCut, 0.78, 1),
    stare,
  }
}

export function readyAbilityNames(side: AbilitySide): string[] {
  return ABILITIES.filter((ability) => ability.ready(side)).map((ability) => ability.name)
}

export function abilityCards(buddy: BuddyState): AbilityCard[] {
  const side = abilitySide(buddy)
  return ABILITIES.map((ability) => {
    const ready = ability.ready(side)
    return {
      code: ability.code,
      name: ability.name,
      line: ability.line,
      state: ready ? 'READY' : 'QUIET',
      ready,
      detail: ability.detail,
      rows: [ability.row(side, ready)],
    }
  })
}
