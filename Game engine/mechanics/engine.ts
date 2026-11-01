import type { Action, BuddyState, MemoryKind, PendingVoice, TalkMoment, TraitKey, Vec } from './types'
import { makeDna, makeName, personalityFrom } from './dna'
import {
  aside,
  callReaction,
  catSound,
  comingHomeLine,
  isWaitingDue,
  laughReaction,
  scoldReaction,
  speak,
  tidyReaction,
  waitingDueRemark,
  waitingKeepsake,
} from './dialogue'
import { clamp, damp, hash01, randU32 } from './random'
import { WORLD } from './world'
import { beginAwakening, markTrustDay, noteCareDay, noteFight } from './awakening'
import { restEnergy } from './house'
import { canEnter, personalityRefuses, resolveScrap, settlePot, sideFrom } from './battle'

const MOBILE = new Set<Action>([
  'wander',
  'sleep',
  'approach',
  'window',
  'knock',
  'chase',
  'zoomies',
  'sniff',
  'eat',
  'playWithYou',
])

function copyVec(v: Vec): Vec {
  return [v[0], v[1], v[2]]
}

function markWaitingRaisedIfDue(buddy: BuddyState, now: number) {
  if (isWaitingDue(buddy, now)) buddy.waitingRaisedAt = now
}

export function pushMemory(buddy: BuddyState, text: string, kind: MemoryKind, now: number) {
  if (buddy.memories[0]?.text === text) return
  buddy.memories.unshift({ id: `${now}-${buddy.memories.length}-${kind}`, at: now, text, kind })
  if (buddy.memories.length > 28) buddy.memories.length = 28
}

type HabitPlace = 'window' | 'cushion' | 'cup' | 'away'

const HABIT_LINE: Record<HabitPlace, string> = {
  window: 'I keep coming back to the window.',
  cushion: 'The cushion is where I sleep.',
  cup: 'I always go for the cup.',
  away: 'I wait for you when you are gone.',
}

const PLACE_TEXTS: Record<HabitPlace, string[]> = {
  window: ['I watched the window.', 'I keep coming back to the window.'],
  cushion: ['I curled up on the cushion.', 'I rested beside you.', 'The cushion is where I sleep.'],
  cup: ['I knocked the cup over.', 'I always go for the cup.'],
  away: ['I wait for you when you are gone.'],
}

function calendarDay(at: number) {
  const date = new Date(at)
  return date.getFullYear() * 372 + date.getMonth() * 31 + date.getDate()
}

function placeMemories(buddy: BuddyState, place: HabitPlace) {
  const texts = new Set(PLACE_TEXTS[place])
  return buddy.memories.filter((entry) => {
    if (place === 'away') return entry.kind === 'away' || texts.has(entry.text)
    return texts.has(entry.text)
  })
}

/** First visit writes a sayable moment; a later calendar day may add the habit once. Same-day repeats stay silent. */
function notePlaceHabit(
  buddy: BuddyState,
  place: HabitPlace,
  momentText: string,
  now: number,
  kind: MemoryKind = 'moment',
  momentAlreadyStored = false,
) {
  const habitText = HABIT_LINE[place]
  const today = calendarDay(now)
  const entries = placeMemories(buddy, place)
  const hasHabit = buddy.memories.some((entry) => entry.text === habitText)
  const moments = entries.filter((entry) => entry.text !== habitText)

  if (!momentAlreadyStored) {
    if (moments.some((entry) => calendarDay(entry.at) === today)) return
    if (moments.length === 0) {
      pushMemory(buddy, momentText, kind, now)
      return
    }
  }

  if (!hasHabit && moments.some((entry) => calendarDay(entry.at) !== today)) {
    pushMemory(buddy, habitText, 'habit', now)
  }
}

export function rememberTurn(buddy: BuddyState, role: 'you' | 'her', text: string, now: number) {
  const trimmed = text.trim()
  if (!trimmed) return
  buddy.turns ??= []
  buddy.turns.push({ role, text: trimmed.slice(0, 320), at: now })
  if (buddy.turns.length > 40) buddy.turns.splice(0, buddy.turns.length - 40)
}

export function replaceLastHer(buddy: BuddyState, text: string, now: number) {
  buddy.turns ??= []
  const last = buddy.turns[buddy.turns.length - 1]
  if (last?.role === 'her' && now - last.at < 20000) {
    last.text = text.trim().slice(0, 320)
    last.at = now
    return
  }
  rememberTurn(buddy, 'her', text, now)
}

export function lastHeard(buddy: BuddyState): string {
  if (!buddy.turns) return ''
  for (let i = buddy.turns.length - 1; i >= 0; i--) {
    if (buddy.turns[i].role === 'you') return buddy.turns[i].text
  }
  return ''
}

const CALLED = /\b(?:call me|my name is)\s+([a-z][a-z']{1,16})/i
const PROMISE = /\b(?:i will|i'll)\s+[^.]{3,80}/i

export function keepWhatTheySaid(buddy: BuddyState, input: string, now: number) {
  buddy.keepsakes ??= []
  const text = input.trim().replace(/\s+/g, ' ').slice(0, 160)
  if (!text) return
  const called = text.match(CALLED)
  if (called) {
    const name = called[1].slice(0, 18)
    buddy.keepsakes = buddy.keepsakes.filter((item) => item.kind !== 'name')
    buddy.keepsakes.push({ kind: 'name', text: name, at: now })
  }
  const promise = text.match(PROMISE)
  if (promise) {
    const waiting = promise[0].trim().slice(0, 80)
    buddy.keepsakes = buddy.keepsakes.filter((item) => item.kind !== 'waiting')
    buddy.keepsakes.push({ kind: 'waiting', text: waiting, at: now })
    buddy.waitingRaisedAt = null
  }
  const casual = /^(hi|hey|hello|ok|okay|yes|no|thanks|thank you)\.?$/i.test(text)
  const asking = text.endsWith('?') && !called && !promise
  if (!casual && !asking && text.length >= 12) {
    const told = `They said: “${text.slice(0, 72)}”`
    if (!buddy.keepsakes.some((item) => item.kind === 'told' && item.text === told)) {
      buddy.keepsakes.push({ kind: 'told', text: told, at: now })
    }
    const tolds = buddy.keepsakes.filter((item) => item.kind === 'told')
    if (tolds.length > 8) {
      const drop = tolds[0]
      buddy.keepsakes = buddy.keepsakes.filter((item) => item !== drop)
    }
  }
}

export function keepFact(buddy: BuddyState, fact: string, now: number): boolean {
  if (!buddy.awakenedAt) return false
  const text = fact.trim().replace(/\s+/g, ' ').slice(0, 90)
  if (text.length < 8) return false
  buddy.keepsakes ??= []
  if (buddy.keepsakes.some((item) => item.kind === 'fact' && item.text.toLowerCase() === text.toLowerCase())) return false
  buddy.keepsakes.push({ kind: 'fact', text, at: now })
  const facts = buddy.keepsakes.filter((item) => item.kind === 'fact')
  if (facts.length > 6) {
    const drop = facts[0]
    buddy.keepsakes = buddy.keepsakes.filter((item) => item !== drop)
  }
  return true
}

export function seedKeepsakes(buddy: BuddyState) {
  buddy.keepsakes ??= []
  if (buddy.keepsakes.length) return
  for (const turn of buddy.turns ?? []) {
    if (turn.role === 'you') keepWhatTheySaid(buddy, turn.text, turn.at)
  }
}

const ATE_PROMISE_LINE = /You said “([^”]+)” Thank you\. I am eating\./

function trimKeptPromise(text: string) {
  return text.trim().replace(/[.?!]+$/, '')
}

function capKeptNotes(buddy: BuddyState) {
  const kepts = buddy.keepsakes!.filter((item) => item.kind === 'kept')
  while (kepts.length > 4) {
    const drop = kepts.shift()!
    buddy.keepsakes = buddy.keepsakes!.filter((item) => item !== drop)
  }
}

function pushKeptPromise(buddy: BuddyState, text: string, at: number) {
  buddy.keepsakes ??= []
  const promise = trimKeptPromise(text)
  if (!promise) return
  if (buddy.keepsakes.some((item) => item.kind === 'kept' && item.text === promise)) return
  buddy.keepsakes.push({ kind: 'kept', text: promise, at })
  capKeptNotes(buddy)
}

export function seedKeptPromises(buddy: BuddyState) {
  buddy.keepsakes ??= []
  for (const turn of buddy.turns ?? []) {
    if (turn.role !== 'her') continue
    const match = turn.text.match(ATE_PROMISE_LINE)
    if (!match) continue
    const capture = trimKeptPromise(match[1])
    if (buddy.keepsakes.some((item) => item.kind === 'kept' && item.text === capture)) continue
    buddy.keepsakes.push({ kind: 'kept', text: capture, at: turn.at })
    capKeptNotes(buddy)
  }
}

export function drift(buddy: BuddyState, key: TraitKey, amount: number) {
  const current = buddy.personality[key]
  const room = amount > 0 ? 1 - current : current
  buddy.personality[key] = clamp(current + amount * (0.45 + room), 0.03, 0.97)
}

export function speechUntil(text: string, now: number) {
  return now + Math.min(7000, 2200 + text.length * 36)
}

export function deriveMood(buddy: BuddyState, now = Date.now()) {
  const needs = buddy.needs
  const traits = buddy.personality
  if (now < buddy.scoldedUntil && buddy.action !== 'sleep') {
    buddy.mood = 'angry'
    return
  }
  if (buddy.action === 'sleep' && !buddy.moving) {
    buddy.mood = 'sleepy'
    return
  }
  if (buddy.action === 'angry') {
    buddy.mood = 'angry'
    return
  }
  if (buddy.action === 'refuse') {
    buddy.mood = 'sad'
    return
  }
  if (buddy.action === 'shy') {
    buddy.mood = 'affectionate'
    return
  }
  if (buddy.action === 'ignore') {
    buddy.mood = now < buddy.scoldedUntil ? 'angry' : 'bored'
    return
  }
  if (buddy.action === 'stuffed') {
    buddy.mood = 'content'
    return
  }
  if (buddy.action === 'eat' && !buddy.moving) {
    buddy.mood = needs.hunger > 0.45 ? 'sad' : 'content'
    return
  }
  if (needs.energy < 0.18) {
    buddy.mood = 'sleepy'
    return
  }
  if (needs.hunger > 0.82 && traits.mischief > 0.5) {
    buddy.mood = 'angry'
    return
  }
  if (needs.hunger > 0.74) {
    buddy.mood = 'sad'
    return
  }
  if (needs.loneliness > 0.64 && traits.affection > 0.45 && traits.introversion < 0.66) {
    buddy.mood = 'lonely'
    return
  }
  if (buddy.action === 'zoomies' || buddy.action === 'chase' || buddy.action === 'playWithYou') {
    buddy.mood = 'excited'
    return
  }
  if ((buddy.action === 'approach' || buddy.action === 'attend') && traits.affection > 0.4) {
    buddy.mood = 'affectionate'
    return
  }
  if (buddy.action === 'sniff' || needs.curiosity > 0.72) {
    buddy.mood = 'curious'
    return
  }
  if (needs.happiness > 0.7) {
    buddy.mood = 'happy'
    return
  }
  if (needs.happiness < 0.34) {
    buddy.mood = 'sad'
    return
  }
  if (buddy.boredom > 0.68) {
    buddy.mood = 'bored'
    return
  }
  buddy.mood = 'content'
}

function milestones(buddy: BuddyState, now: number) {
  const lines: Record<TraitKey, [string, string]> = {
    mischief: ['more mischievous', 'gentler'],
    affection: ['more affectionate', 'more reserved'],
    introversion: ['more introverted', 'more outgoing'],
    vigor: ['more energetic', 'lazier'],
    curiosity: ['more curious', 'less nosy'],
    independence: ['more independent', 'more willing'],
  }
  for (const key of Object.keys(lines) as TraitKey[]) {
    const delta = buddy.personality[key] - buddy.basePersonality[key]
    if (Math.abs(delta) > 0.07 && !buddy.milestones[key]) {
      buddy.milestones[key] = true
      const phrase = delta > 0 ? lines[key][0] : lines[key][1]
      pushMemory(buddy, `I am growing ${phrase}.`, 'bond', now)
    }
  }
  if (buddy.trust > 0.78 && !buddy.milestones.trust) {
    buddy.milestones.trust = true
    pushMemory(buddy, `I trust you, ${buddy.ownerName}.`, 'bond', now)
  }
}

function randomPoint(from?: Vec): Vec {
  const { minX, maxX, minZ, maxZ } = WORLD.bounds
  for (let i = 0; i < 8; i++) {
    const point: Vec = [minX + Math.random() * (maxX - minX), 0, minZ + Math.random() * (maxZ - minZ)]
    if (!from || Math.hypot(point[0] - from[0], point[2] - from[2]) > 0.45) return point
  }
  return [0, 0, 0.2]
}

function duration(buddy: BuddyState, action: Action) {
  const spread = 0.85 + Math.random() * 0.3
  const base: Record<Action, number> = {
    wander: 7,
    sit: 6 + buddy.personality.introversion * 6,
    sleep: 16 + (1 - buddy.personality.vigor) * 10,
    groom: 5.5,
    approach: 8,
    window: 9 + buddy.needs.loneliness * 6,
    knock: 9,
    chase: 7.5,
    zoomies: 5.5,
    sniff: 5.5,
    attend: 4.5,
    ignore: 3.4,
    eat: 6.5,
    playWithYou: 8,
    flop: 3.2,
    stuffed: 5.5,
    chill: 8,
    shy: 3.6,
    refuse: 3.2,
    angry: 3.2,
  }
  return base[action] * spread
}

const STILL = new Set<Action>(['sit', 'chill', 'sleep', 'eat', 'shy', 'refuse', 'angry', 'attend', 'ignore', 'stuffed'])

const QUIET = 0.62

function napping(buddy: BuddyState) {
  return buddy.action === 'sleep' && !buddy.moving && buddy.needs.energy < 0.45
}

function tooTired(buddy: BuddyState) {
  return buddy.needs.energy < 0.2
}

function tooFull(buddy: BuddyState) {
  return buddy.action === 'stuffed' || buddy.needs.hunger < 0.22
}

/** Stable pick from a reason pool, so one action always reads the same way for one girl. */
function reasonFrom(buddy: BuddyState, salt: number, lines: string[]) {
  return lines[Math.floor(hash01(buddy.lifeSeed ^ salt) * lines.length) % lines.length]
}

/**
 * Awakened status lines. Her body here is a still idle, so these may only speak about
 * company and stillness. They must never claim a motion the engine did not start.
 */
function sitReason(buddy: BuddyState) {
  const lines =
    buddy.personality.introversion > QUIET
      ? [
          'She is here with you, quietly.',
          'She is still, and near enough to hear you.',
          'She stays close to you, without making anything of it.',
          'She is quiet, and she is not going anywhere.',
        ]
      : [
          'She is here with you, and she is staying.',
          'She is still, and her attention is on you.',
          'She is with you, and in no hurry to be anywhere else.',
          'She is keeping you company, and that is the whole of it.',
        ]
  return reasonFrom(buddy, 0x5177, lines)
}

function chillReason(buddy: BuddyState) {
  const lines =
    buddy.personality.introversion > QUIET
      ? [
          'She is keeping you company, quietly.',
          'She is at ease, and happy to say nothing.',
          'She is near you, still and calm.',
          'She is comfortable in the quiet with you.',
        ]
      : [
          'She is keeping you company, and nothing else needs doing.',
          'She is at ease here, with you.',
          'She is unhurried, and staying with you.',
          'She is being still with you, and that is enough.',
        ]
  return reasonFrom(buddy, 0xc417, lines)
}

function shyReason(buddy: BuddyState) {
  return buddy.personality.introversion > QUIET ? 'She went quiet, and stayed near you.' : 'She got a little shy, and stayed.'
}

const RESTING = 'She is resting. Her eyes are closing. She is not going anywhere.'

function chooseNext(buddy: BuddyState, now: number) {
  if (buddy.awakenedAt) {
    chooseStill(buddy, now)
    return
  }
  const p = buddy.personality
  const n = buddy.needs
  const recent = (action: Action) => buddy.lastActions.filter((item) => item === action).length
  const ease = (action: Action, weight: number) => weight * (recent(action) >= 2 ? 0.12 : recent(action) === 1 ? 0.5 : 1)

  const options: { action: Action; w: number; target: Vec; reason: string }[] = [
    {
      action: 'wander',
      w: ease('wander', 0.35 + p.curiosity * 0.4 + p.vigor * 0.25),
      target: randomPoint(buddy.pos),
      reason: 'Something in the room is worth a look.',
    },
    {
      action: 'sit',
      w: ease('sit', 0.42 + p.introversion * 0.7 + (1 - p.vigor) * 0.4),
      target: copyVec(buddy.pos),
      reason: 'A quiet sit feels right.',
    },
    {
      action: 'chill',
      w: ease('chill', (n.hunger < 0.5 ? 0.7 : 0.16) + (1 - p.vigor) * 0.28 + n.happiness * 0.22),
      target: copyVec(buddy.pos),
      reason: 'Nothing pressing, so they stretched out.',
    },
    {
      action: 'sleep',
      w: n.energy < 0.12 ? 8 : n.energy < 0.28 ? 2.6 : ease('sleep', (1 - n.energy) * (0.25 + p.introversion * 0.55 + (1 - p.vigor) * 0.45)),
      target: copyVec(WORLD.cushion),
      reason: 'Energy is low, so the cushion wins.',
    },
    {
      action: 'groom',
      w: ease('groom', 0.55 + (1 - p.mischief) * 0.22),
      target: copyVec(buddy.pos),
      reason: 'Pause for a wash.',
    },
    {
      action: 'approach',
      w: ease('approach', p.affection * (0.15 + n.loneliness * 1.35) * (0.35 + buddy.trust) * (1 - p.introversion * 0.72)),
      target: copyVec(WORLD.greet),
      reason: 'Loneliness and affection pulled them toward you.',
    },
    {
      action: 'window',
      w: ease('window', 0.32 + n.loneliness * (0.45 + p.introversion) * 0.8 + (n.happiness < 0.4 ? 0.35 : 0)),
      target: copyVec(WORLD.window),
      reason: 'The window is better company than the room.',
    },
    {
      action: 'knock',
      w: buddy.cupTipped ? 0 : ease('knock', p.mischief * n.energy * (0.2 + buddy.boredom * 0.95 + n.hunger * 0.45)),
      target: copyVec(WORLD.cupStand),
      reason: 'Mischief and spare energy made the cup irresistible.',
    },
    {
      action: 'chase',
      w: ease('chase', p.curiosity * p.vigor * n.energy * (0.35 + n.curiosity)),
      target: copyVec(buddy.ball),
      reason: 'Curiosity turned into a game with the yarn.',
    },
    {
      action: 'zoomies',
      w: ease('zoomies', 0.22 + p.vigor * n.energy * n.happiness * (1 - p.introversion * 0.45)),
      target: randomPoint(buddy.pos),
      reason: 'Too much energy to stay dignified.',
    },
    {
      action: 'sniff',
      w: ease('sniff', 0.28 + p.curiosity * 0.55 + n.curiosity * 0.35),
      target: randomPoint(buddy.pos),
      reason: 'A new scent, or the idea of one.',
    },
    {
      action: 'flop',
      w: ease('flop', p.mischief * 0.22 + buddy.boredom * 0.15),
      target: copyVec(buddy.pos),
      reason: 'They flopped over and waited to see if anyone noticed.',
    },
  ]

  const total = options.reduce((sum, option) => sum + Math.max(0, option.w), 0)
  let roll = Math.random() * (total || 1)
  let picked = options[1]
  if (total > 0) {
    for (const option of options) {
      roll -= Math.max(0, option.w)
      if (roll <= 0) {
        picked = option
        break
      }
    }
  }

  buddy.action = picked.action
  buddy.target = picked.target
  buddy.actionStartedAt = now
  buddy.actionUntil = now + duration(buddy, picked.action) * 1000
  buddy.reason = picked.reason
  buddy.lastActions = [...buddy.lastActions, picked.action].slice(-4)
  buddy.retargetAt = now + 900

  if (picked.action === 'chase') {
    buddy.target = copyVec(buddy.ball)
  }
  if (picked.action === 'sleep') {
    notePlaceHabit(buddy, 'cushion', 'I curled up on the cushion.', now)
  }
  if (picked.action === 'window') {
    notePlaceHabit(buddy, 'window', 'I watched the window.', now)
  }
  if (picked.action === 'knock') {
    notePlaceHabit(buddy, 'cup', 'I knocked the cup over.', now)
  }
  remark(buddy, now)
}

function chooseStill(buddy: BuddyState, now: number) {
  const p = buddy.personality
  const n = buddy.needs
  const here = copyVec(buddy.pos)
  const recent = (action: Action) => buddy.lastActions.filter((item) => item === action).length
  const ease = (action: Action, weight: number) => weight * (recent(action) >= 2 ? 0.12 : recent(action) === 1 ? 0.5 : 1)
  const options: { action: Action; w: number; target: Vec; reason: string }[] = [
    { action: 'sit', w: ease('sit', 1.4 + p.introversion * 0.3), target: here, reason: sitReason(buddy) },
    { action: 'chill', w: ease('chill', 0.45 + n.happiness * 0.2), target: here, reason: chillReason(buddy) },
    {
      action: 'sleep',
      w: n.energy < 0.18 ? 6 : n.energy < 0.3 ? 1.4 : 0.05,
      target: here,
      reason: RESTING,
    },
    { action: 'shy', w: ease('shy', p.introversion > 0.7 ? 0.35 : 0), target: here, reason: shyReason(buddy) },
  ]
  const total = options.reduce((sum, option) => sum + Math.max(0, option.w), 0)
  let roll = Math.random() * (total || 1)
  let picked = options[0]
  for (const option of options) {
    roll -= Math.max(0, option.w)
    if (roll <= 0) {
      picked = option
      break
    }
  }
  buddy.action = picked.action
  buddy.clip = null
  buddy.target = here
  buddy.moving = false
  buddy.actionStartedAt = now
  buddy.actionUntil = now + duration(buddy, picked.action) * 1000
  buddy.reason = picked.reason
  buddy.lastActions = [...buddy.lastActions, picked.action].slice(-4)
  if (picked.action === 'sleep') {
    notePlaceHabit(buddy, 'cushion', 'I rested beside you.', now)
  }
  remark(buddy, now)
}

function speedFor(buddy: BuddyState) {
  const vigor = 0.82 + buddy.personality.vigor * 0.45
  switch (buddy.action) {
    case 'zoomies':
      return 1.35 * vigor
    case 'chase':
    case 'playWithYou':
      return 1.05 * vigor
    case 'sleep':
      return 0.34 * vigor
    case 'knock':
    case 'approach':
    case 'eat':
      return 0.72 * vigor
    case 'flop':
    case 'stuffed':
    default:
      return 0.52 * vigor
  }
}

function tipCup(buddy: BuddyState, now: number) {
  if (buddy.cupTipped) return
  buddy.cupTipped = true
  buddy.counts.knock += 1
  buddy.needs.happiness = clamp(buddy.needs.happiness + 0.05)
  buddy.boredom = clamp(buddy.boredom - 0.35)
  buddy.speech = { text: catSound(buddy), until: now + 1800 }
}

export function integrateMotion(buddy: BuddyState, dt: number, now: number) {
  if (buddy.restUntil && now < buddy.restUntil) {
    buddy.moving = false
    buddy.lean = 0
    if (buddy.action !== 'sleep') {
      buddy.action = 'sleep'
      buddy.actionStartedAt = now
      buddy.actionUntil = buddy.restUntil
    }
    return
  }
  const step = Math.min(dt, 0.05)
  if (buddy.awakenedAt) {
    buddy.moving = false
    buddy.lean = damp(buddy.lean, 0, step, 5)
    buddy.target = copyVec(buddy.pos)
    if (!STILL.has(buddy.action)) begin(buddy, 'sit', copyVec(buddy.pos), now, 5, sitReason(buddy))
    return
  }
  if ((buddy.action === 'zoomies' || buddy.action === 'chase' || buddy.action === 'playWithYou') && now > buddy.retargetAt) {
    if (buddy.action === 'zoomies') buddy.target = randomPoint(buddy.pos)
    else {
      const span = buddy.action === 'playWithYou' ? 0.55 : 0.9
      buddy.ball = [
        clamp(buddy.pos[0] + (Math.random() - 0.5) * span * 2, WORLD.bounds.minX, WORLD.bounds.maxX),
        0,
        clamp(buddy.pos[2] + (Math.random() - 0.5) * span * 2, WORLD.bounds.minZ, WORLD.bounds.maxZ),
      ]
      buddy.target = copyVec(buddy.ball)
    }
    buddy.retargetAt = now + (buddy.action === 'zoomies' ? 680 : 1200)
  }

  const dx = buddy.target[0] - buddy.pos[0]
  const dz = buddy.target[2] - buddy.pos[2]
  const dist = Math.hypot(dx, dz)
  const mobile = MOBILE.has(buddy.action) && dist > 0.09
  if (mobile) {
    const speed = speedFor(buddy)
    const move = Math.min(dist, speed * step)
    buddy.pos[0] += (dx / dist) * move
    buddy.pos[2] += (dz / dist) * move
    buddy.moving = dist - move > 0.09
    buddy.lean = damp(buddy.lean, clamp((dx / dist) * speed * 8, -8, 8), step, 6)
  } else {
    buddy.moving = false
    buddy.lean = damp(buddy.lean, 0, step, 5)
  }

  buddy.pos[0] = clamp(buddy.pos[0], WORLD.bounds.minX, WORLD.bounds.maxX)
  buddy.pos[2] = clamp(buddy.pos[2], WORLD.bounds.minZ, WORLD.bounds.maxZ)

  if (buddy.action === 'knock' && !buddy.cupTipped) {
    const reach = Math.hypot(WORLD.cupStand[0] - buddy.pos[0], WORLD.cupStand[2] - buddy.pos[2])
    if (reach < 0.42) tipCup(buddy, now)
  }
}

export function tickNeeds(buddy: BuddyState, dt: number, now: number, refillRate = 1) {
  const step = Math.min(dt, 1)
  const traits = buddy.personality
  const needs = buddy.needs

  if (buddy.action === 'eat' && !buddy.moving) needs.hunger = clamp(needs.hunger - step * 0.16)
  else needs.hunger = clamp(needs.hunger + step * 0.007)

  const resting = buddy.action === 'sleep' || buddy.action === 'sit' || buddy.action === 'chill' || buddy.action === 'groom' || (buddy.mood === 'sleepy' && !buddy.moving)
  const refill = Math.max(1, refillRate)
  if (resting) needs.energy = clamp(needs.energy + step * refill * (buddy.action === 'sleep' ? 0.05 : 0.028))
  else needs.energy = clamp(needs.energy - step * (buddy.action === 'zoomies' || buddy.action === 'chase' ? 0.01 : 0.004))

  const lonelyRate = 0.008 * (0.35 + traits.affection) * (1 - traits.introversion * 0.5)
  const accompanied = (buddy.action === 'approach' || buddy.action === 'attend' || buddy.action === 'playWithYou') && !buddy.moving
  needs.loneliness = clamp(needs.loneliness + step * lonelyRate - (accompanied ? step * 0.05 : 0))

  if (buddy.action === 'sniff' || buddy.action === 'chase' || buddy.action === 'wander') {
    needs.curiosity = clamp(needs.curiosity - step * 0.05)
  } else {
    needs.curiosity = clamp(needs.curiosity + step * (0.02 + traits.curiosity * 0.02))
  }

  const calm = buddy.action === 'sit' || buddy.action === 'chill' || buddy.action === 'groom' || buddy.action === 'window'
  const busy = buddy.action === 'chase' || buddy.action === 'zoomies' || buddy.action === 'knock' || buddy.action === 'playWithYou'
  buddy.boredom = clamp(buddy.boredom + (calm ? step * 0.035 : 0) - (busy ? step * 0.08 : 0))

  const happyTarget =
    0.46 +
    (1 - needs.hunger) * 0.18 +
    (1 - needs.loneliness) * 0.14 * traits.affection +
    needs.energy * 0.08 -
    needs.hunger * 0.22 -
    needs.loneliness * traits.affection * 0.32
  needs.happiness = clamp(needs.happiness + (happyTarget - needs.happiness) * Math.min(1, step * 0.35))

  if (now >= buddy.actionUntil) {
    if (buddy.action === 'eat' && !buddy.moving) {
      begin(buddy, 'stuffed', copyVec(buddy.pos), now, 5.5, buddy.awakenedAt ? 'Full, and staying with you.' : 'Full, and staying down.')
    } else if (buddy.awakenedAt && buddy.action === 'sleep') {
      wakeHello(buddy, now)
    } else chooseNext(buddy, now)
  }
  if (buddy.speech && now > buddy.speech.until) buddy.speech = null
  if (needs.hunger < 0.55) buddy.spokeHunger = false
  if (
    buddy.awakenedAt &&
    needs.hunger > 0.82 &&
    !buddy.spokeHunger &&
    !buddy.speech &&
    buddy.action !== 'eat' &&
    !buddy.pendingReturn
  ) {
    buddy.spokeHunger = true
    const line = hungerRemark(buddy)
    say(buddy, line, now, 4200, 'talk')
    rememberTurn(buddy, 'her', line, now)
    offerVoice(buddy, 'hunger', line)
    buddy.reason = 'She is hungry, and she said so.'
  }
  if (
    buddy.awakenedAt &&
    isWaitingDue(buddy, now) &&
    buddy.waitingRaisedAt === null &&
    !buddy.speech &&
    buddy.action !== 'eat' &&
    !buddy.pendingReturn
  ) {
    const line = waitingDueRemark(buddy)
    say(buddy, line, now, 4200, 'talk')
    rememberTurn(buddy, 'her', line, now)
    offerVoice(buddy, 'promise')
    buddy.reason = 'She is still waiting on what you promised.'
    buddy.waitingRaisedAt = now
  }
  if (
    buddy.awakenedAt &&
    needs.loneliness > 0.72 &&
    traits.affection > 0.45 &&
    !buddy.spokeMiss &&
    !buddy.speech &&
    buddy.action !== 'sleep' &&
    buddy.action !== 'eat' &&
    !buddy.pendingReturn &&
    !buddy.pendingVoice
  ) {
    buddy.spokeMiss = true
    const draft =
      traits.introversion > 0.62
        ? 'I missed you.'
        : traits.independence > 0.62
          ? 'You were gone.'
          : `I missed you, ${buddy.ownerName}.`
    say(buddy, draft, now, 4200, 'talk')
    rememberTurn(buddy, 'her', draft, now)
    offerVoice(buddy, 'miss', draft)
    buddy.reason = 'She misses you.'
  }
  if (buddy.awakenedAt && needs.loneliness < 0.45) buddy.spokeMiss = false
  deriveMood(buddy, now)
  milestones(buddy, now)
  markTrustDay(buddy, now)
}

function ignoreChance(buddy: BuddyState) {
  let chance = buddy.personality.independence * 0.38 + buddy.personality.mischief * 0.12
  if (buddy.personality.introversion > 0.62 && buddy.trust < 0.35) chance += 0.28
  if (buddy.mood === 'sleepy' && buddy.needs.energy < 0.3) chance += 0.25
  if (buddy.trust > 0.72 && buddy.personality.affection > 0.55) chance *= 0.25
  if (buddy.needs.loneliness > 0.6 && buddy.personality.affection > 0.5) chance *= 0.4
  return clamp(chance, 0, 0.75)
}

type WaitingFit = 'food' | 'play' | 'near' | 'word'

function waitingFit(text: string): WaitingFit {
  if (/\b(fish|food|feed|treat|bowl|snack|dinner|breakfast|lunch)\b/i.test(text)) return 'food'
  if (/\b(play|yarn|game|toy)\b/i.test(text)) return 'play'
  if (/\b(pet|cuddle|hug|hold me|stay with|sit with)\b/i.test(text)) return 'near'
  return 'word'
}

function waitingForFit(buddy: BuddyState, fit: WaitingFit) {
  const waiting = waitingKeepsake(buddy)
  if (!waiting || waitingFit(waiting.text) !== fit) return null
  return waiting
}

function settleWaitingNote(
  buddy: BuddyState,
  waiting: { text: string; at: number; kind: string },
  now: number,
  reason: string,
) {
  pushKeptPromise(buddy, waiting.text, now)
  buddy.keepsakes = (buddy.keepsakes ?? []).filter((item) => item !== waiting)
  buddy.waitingRaisedAt = now
  buddy.reason = reason
}

function hungerRemark(buddy: BuddyState) {
  if (!buddy.awakenedAt) return 'mrow.'
  if (buddy.personality.introversion > 0.62) return 'I am hungry.'
  if (buddy.personality.mischief > 0.6) return 'Feed me. I have been patient enough.'
  return `I am hungry, ${buddy.ownerName}.`
}

function say(buddy: BuddyState, text: string, now: number, ms = 2800, moment?: TalkMoment, heard?: string) {
  const until = now + ms
  if (heard !== undefined) {
    buddy.speech = { text, until, moment: moment ?? 'talk', heard: heard.slice(0, 160) }
    return
  }
  buddy.speech = moment ? { text, until, moment } : { text, until }
}

function remarkUrge(buddy: BuddyState) {
  const p = buddy.personality
  const n = buddy.needs
  switch (buddy.action) {
    case 'eat':
      return n.hunger > 0.5 ? 0.9 : 0.2
    case 'sleep':
      return n.energy < 0.3 ? 0.55 : 0.12
    case 'knock':
      return 0.4 + p.mischief * 0.45
    case 'chase':
    case 'zoomies':
    case 'playWithYou':
      return 0.15 + p.vigor * 0.4
    case 'approach':
    case 'attend':
      return 0.12 + n.loneliness * p.affection
    case 'window':
      return n.happiness < 0.4 ? 0.4 : 0.1
    case 'angry':
    case 'refuse':
      return 0.85
    case 'shy':
      return 0.4
    case 'sit':
    case 'chill':
      return n.loneliness > 0.55 && p.affection > 0.5 ? 0.3 : 0.05
    default:
      return 0.08
  }
}

const voiceRank: Record<PendingVoice, number> = {
  aside: 10,
  pet: 20,
  feed: 20,
  play: 20,
  call: 20,
  laugh: 20,
  scold: 20,
  tidy: 20,
  scrap: 20,
  wake: 30,
  awaken: 35,
  miss: 36,
  promise: 40,
  hunger: 50,
}

function offerVoice(buddy: BuddyState, kind: PendingVoice, line?: string) {
  if (!buddy.awakenedAt) return
  const pending = buddy.pendingVoice
  if (pending && voiceRank[pending] >= voiceRank[kind]) return
  buddy.pendingVoice = kind
  const draft = (line ?? buddy.speech?.text ?? '').trim()
  if (draft) buddy.pendingVoiceLine = draft.slice(0, 320)
}

function remark(buddy: BuddyState, now: number) {
  if (buddy.speech && now < buddy.speech.until) return
  if (Math.random() > remarkUrge(buddy)) return
  const line = buddy.awakenedAt ? aside(buddy) : catSound(buddy)
  say(buddy, line, now, 2800)
  if (buddy.awakenedAt && (buddy.action === 'sit' || buddy.action === 'chill') && !buddy.pendingReturn) {
    rememberTurn(buddy, 'her', line, now)
    offerVoice(buddy, 'aside')
  }
}

export function bubble(buddy: BuddyState, person: string, now: number, ms = 2800, kind?: PendingVoice) {
  if (!buddy.awakenedAt) {
    say(buddy, catSound(buddy), now, Math.min(ms, 3200))
    return
  }
  say(buddy, person, now, Math.min(ms, 7000))
  if (!kind) return
  rememberTurn(buddy, 'her', person, now)
  offerVoice(buddy, kind)
}

function wakeHello(buddy: BuddyState, now: number) {
  const p = buddy.personality
  const name = buddy.ownerName
  const shy = p.introversion > QUIET
  const reasons = shy
    ? [
        'She woke, and you were still there.',
        'She opened her eyes and kept them on you.',
        'She woke beside you, quietly.',
        'She came out of the rest slowly, and stayed.',
      ]
    : [
        'She woke, and the first thing she found was you.',
        'She opened her eyes and stayed.',
        'She woke beside you, and wanted you closer.',
        'She came out of the rest, and you were still here.',
        'She woke, and did not want the quiet to end.',
      ]
  const lines = shy
    ? [`Hi, ${name}.`, `Hey. I'm here.`, `Hi. I'm here.`, `Hey, ${name}. I'm here.`]
    : ['There you are.', `Hi, ${name}.`, 'Hello.', `There you are, ${name}.`]
  begin(buddy, 'sit', copyVec(buddy.pos), now, 7, reasonFrom(buddy, 0x5eed, reasons))
  bubble(buddy, reasonFrom(buddy, 0x5eed, lines), now, 3200, 'wake')
}

function begin(buddy: BuddyState, action: Action, target: Vec, now: number, seconds: number, reason: string): boolean {
  if (buddy.action === action && now < buddy.actionUntil) {
    buddy.reason = reason
    if (buddy.awakenedAt) buddy.moving = false
    return false
  }
  buddy.action = action
  buddy.clip = null
  buddy.target = buddy.awakenedAt ? copyVec(buddy.pos) : target
  buddy.actionStartedAt = now
  buddy.actionUntil = now + seconds * 1000
  buddy.reason = reason
  buddy.lastActions = [...buddy.lastActions, action].slice(-4)
  if (buddy.awakenedAt) buddy.moving = false
  return true
}

function speakCare(buddy: BuddyState, now: number, fresh: boolean, line: string, ms: number, kind?: PendingVoice) {
  if (!fresh) return
  bubble(buddy, line, now, ms, kind)
}

const CARE_WAIT = {
  pet: 15_000,
  feed: 45_000,
  play: 20_000,
  call: 12_000,
  laugh: 15_000,
  scold: 20_000,
  tidy: 15_000,
} as const

type CareKind = keyof typeof CARE_WAIT

export function careWaiting(buddy: BuddyState, kind: CareKind, now: number): boolean {
  const last = buddy.careAt?.[kind] ?? 0
  return now - last < CARE_WAIT[kind]
}

function holdCare(buddy: BuddyState, kind: CareKind, now: number): boolean {
  if (careWaiting(buddy, kind, now)) return false
  buddy.careAt ??= {}
  buddy.careAt[kind] = now
  return true
}

export function createBuddy(ownerName: string, opts?: { visualSeed?: number; taken?: string[] }): BuddyState {
  const now = Date.now()
  const visualSeed = opts?.visualSeed ?? randU32()
  const lifeSeed = opts?.visualSeed ?? randU32()
  const dna = makeDna(visualSeed)
  const personality = personalityFrom(lifeSeed)
  const name = makeName(lifeSeed, opts?.taken ?? [])
  const buddy: BuddyState = {
    id: `b_${now.toString(36)}_${lifeSeed.toString(36)}`,
    name,
    ownerName,
    visualSeed,
    lifeSeed,
    createdAt: now,
    lastSimulatedAt: now,
    lastSeen: now,
    dna,
    basePersonality: { ...personality },
    personality: { ...personality },
    idleStyle: lifeSeed % 5,
    phase: lifeSeed % 4000,
    needs: { hunger: 0.28, energy: 0.78, happiness: 0.6, curiosity: 0.48, loneliness: 0.18 },
    trust: clamp(0.28 + personality.affection * 0.16),
    mood: 'content',
    action: 'sit',
    actionStartedAt: now,
    actionUntil: now + 4200,
    target: [0, 0, 0.25],
    pos: [0, 0, 0.25],
    lean: 0,
    moving: false,
    retargetAt: 0,
    memories: [],
    counts: { pet: 0, feed: 0, play: 0, talk: 0, knock: 0, ignore: 0 },
    visitCounts: { pet: 0, feed: 0, play: 0, talk: 0 },
    recentPets: [],
    careAt: {},
    speech: { text: 'mrrp.', until: now + 2600 },
    turns: [],
    keepsakes: [],
    pendingReturn: false,
    pendingVoice: null,
    pendingVoiceLine: null,
    spokeHunger: false,
    spokeMiss: false,
    waitingRaisedAt: null,
    reason: 'Just hatched. Taking the room in.',
    cupTipped: false,
    ball: [-0.05, 0, 0.05],
    boredom: 0.1,
    lastActions: ['sit'],
    milestones: {},
    celebrateUntil: now + 900,
    scoldedUntil: 0,
    careDays: [],
    trustHighDays: [],
    scrapCount: 0,
    refuseCount: 0,
    awakenedAt: null,
    clip: null,
    restUntil: null,
    restStartedAt: null,
    restEnergy: null,
  }
  pushMemory(buddy, 'You hatched me.', 'bond', now)
  deriveMood(buddy)
  return buddy
}

export function pet(buddy: BuddyState, now: number) {
  if (!holdCare(buddy, 'pet', now)) return
  buddy.recentPets = buddy.recentPets.filter((time) => now - time < 40000)
  const overstimulated = buddy.personality.introversion > 0.58 && buddy.recentPets.length >= 3
  buddy.recentPets.push(now)
  if (napping(buddy)) {
    speakCare(buddy, now, !(buddy.speech && now < buddy.speech.until), buddy.awakenedAt ? 'Mmm. Five more minutes.' : 'mmm.', 1800, 'pet')
    buddy.needs.loneliness = clamp(buddy.needs.loneliness - 0.05)
    buddy.reason = buddy.awakenedAt ? 'Asleep, and not interested in being woken.' : 'Asleep, and not interested in being convinced otherwise.'
    deriveMood(buddy, now)
    return
  }
  if (tooTired(buddy)) {
    const fresh = begin(buddy, 'refuse', copyVec(buddy.pos), now, 3.2, buddy.awakenedAt ? 'Too tired for pets right now.' : 'Too tired for pets; they wanted rest.')
    speakCare(buddy, now, fresh, buddy.awakenedAt ? 'Too tired. Let me rest.' : 'mrr.', 2000, 'pet')
    buddy.needs.energy = clamp(buddy.needs.energy - 0.02)
    buddy.trust = clamp(buddy.trust - 0.006)
    deriveMood(buddy, now)
    return
  }
  const declined = overstimulated || Math.random() < ignoreChance(buddy)
  const cross = overstimulated || buddy.mood === 'angry' || (declined && buddy.personality.mischief > 0.55 && Math.random() < 0.5)
  if (cross || declined) {
    buddy.counts.ignore += 1
    drift(buddy, 'independence', 0.012)
    buddy.trust = clamp(buddy.trust - 0.015)
    if (cross) {
      const fresh = begin(buddy, 'angry', copyVec(buddy.pos), now, 3.2, buddy.awakenedAt ? 'That was too much.' : 'The pet landed badly.')
      speakCare(buddy, now, fresh, overstimulated ? 'Too much. Give me a second.' : 'Hey. Easy.', 2800, 'pet')
    } else {
      const fresh = begin(buddy, 'refuse', copyVec(buddy.pos), now, 3.2, buddy.awakenedAt ? 'She is not in the mood to be touched.' : 'They felt the hand and declined it.')
      speakCare(buddy, now, fresh, buddy.personality.mischief > 0.6 ? 'Busy. Talk instead.' : 'Not right now.', 2800, 'pet')
    }
    deriveMood(buddy)
    return
  }
  buddy.counts.pet += 1
  buddy.needs.happiness = clamp(buddy.needs.happiness + 0.16)
  buddy.needs.loneliness = clamp(buddy.needs.loneliness - 0.28)
  buddy.trust = clamp(buddy.trust + 0.028)
  drift(buddy, 'affection', 0.02)
  drift(buddy, 'introversion', -0.008)
  const shy = buddy.personality.introversion > 0.55 && Math.random() < 0.62
  const showing = shy
    ? buddy.action === 'shy' && now < buddy.actionUntil
      ? false
      : begin(buddy, 'shy', copyVec(buddy.pos), now, 3.6, buddy.awakenedAt ? 'She got shy about it.' : 'Being petted, and looking away.')
    : buddy.action === 'attend' && now < buddy.actionUntil
      ? false
      : begin(buddy, 'attend', copyVec(buddy.pos), now, 4.2, buddy.awakenedAt ? 'She let you closer.' : 'Being petted, and allowing it.')
  const owedNear = buddy.awakenedAt ? waitingForFit(buddy, 'near') : null
  if (owedNear) {
    const petLine = 'You did what you said. Stay close.'
    if (showing) {
      say(buddy, petLine, now, 5000, 'talk')
      rememberTurn(buddy, 'her', petLine, now)
      offerVoice(buddy, 'pet')
    }
    settleWaitingNote(buddy, owedNear, now, 'She stayed close, the way you promised.')
  } else {
    const line = buddy.awakenedAt
      ? buddy.personality.mischief > 0.68
        ? 'You can stay that close.'
        : buddy.personality.introversion > 0.62
          ? '...okay. I like it.'
          : buddy.personality.affection > 0.55
            ? 'Stay. Right there.'
            : 'Hey. That is sweet.'
      : 'mrrp.'
    speakCare(buddy, now, showing, line, 2800, 'pet')
  }
  if (buddy.counts.pet === 1) pushMemory(buddy, 'You petted me, and I leaned in.', 'bond', now)
  deriveMood(buddy)
  milestones(buddy, now)
}

export function feed(buddy: BuddyState, now: number, feedFill = 0) {
  if (!holdCare(buddy, 'feed', now)) return
  if (napping(buddy)) {
    speakCare(buddy, now, !(buddy.speech && now < buddy.speech.until), buddy.awakenedAt ? 'Not while I am asleep. Stay close.' : 'mmm.', 2000, 'feed')
    buddy.reason = buddy.awakenedAt ? 'Asleep, and not interested in food right now.' : 'Asleep, and the bowl can wait.'
    buddy.needs.loneliness = clamp(buddy.needs.loneliness - 0.04)
    deriveMood(buddy, now)
    return
  }
  if (tooTired(buddy)) {
    const fresh = begin(buddy, 'sleep', copyVec(buddy.pos), now, 8, buddy.awakenedAt ? 'Too tired to eat. She is resting.' : 'Too tired to eat; rest came first.')
    speakCare(buddy, now, fresh, buddy.awakenedAt ? 'Too tired to eat. Let me rest.' : 'mmm.', 2000, 'feed')
    buddy.needs.energy = clamp(buddy.needs.energy + 0.03)
    buddy.trust = clamp(buddy.trust + 0.004)
    deriveMood(buddy, now)
    return
  }
  if (tooFull(buddy)) {
    const fresh = begin(
      buddy,
      buddy.action === 'stuffed' ? 'stuffed' : buddy.awakenedAt ? 'sit' : 'attend',
      copyVec(buddy.pos),
      now,
      3.6,
      buddy.awakenedAt ? 'Not hungry. She wants company instead.' : 'Not hungry. Company sounded better.',
    )
    speakCare(buddy, now, fresh, buddy.awakenedAt ? 'Save it. I would rather have you here.' : 'mrrp.', 2800, 'feed')
    buddy.reason = buddy.awakenedAt ? 'Offered food, and she was not hungry.' : 'Offered food, and they were not hungry enough to care.'
    buddy.trust = clamp(buddy.trust + 0.01)
    buddy.needs.happiness = clamp(buddy.needs.happiness + 0.05)
    buddy.needs.loneliness = clamp(buddy.needs.loneliness - 0.08)
    deriveMood(buddy, now)
    return
  }
  if (buddy.needs.hunger < 0.4 && Math.random() < ignoreChance(buddy) * 0.5) {
    const fresh = begin(buddy, 'ignore', copyVec(buddy.pos), now, 2.8, buddy.awakenedAt ? 'She will eat later.' : 'The bowl can wait, according to them.')
    speakCare(buddy, now, fresh, buddy.awakenedAt ? 'Later. Talk to me first.' : 'mrow.', 2800, 'feed')
    buddy.counts.ignore += 1
    buddy.needs.hunger = clamp(buddy.needs.hunger + 0.03)
    buddy.trust = clamp(buddy.trust - 0.008)
    deriveMood(buddy, now)
    return
  }
  buddy.counts.feed += 1
  buddy.trust = clamp(buddy.trust + 0.02)
  buddy.needs.hunger = clamp(buddy.needs.hunger - (0.55 + Math.max(0, feedFill)))
  const cared = noteCareDay(buddy, now, true)
  buddy.careDays = cared.careDays
  buddy.trustHighDays = cared.trustHighDays
  drift(buddy, 'affection', 0.008)
  const owed = buddy.awakenedAt ? waitingForFit(buddy, 'food') : null
  const eating = begin(buddy, 'eat', buddy.awakenedAt ? copyVec(buddy.pos) : copyVec(WORLD.bowl), now, 7, buddy.awakenedAt ? 'She is eating with you.' : 'Hunger, or manners, sent them to eat.')
  if (owed) {
    if (eating) {
      const line = 'You did what you said. Thank you. I am eating.'
      say(buddy, line, now, 5000, 'eat')
      rememberTurn(buddy, 'her', line, now)
      offerVoice(buddy, 'feed')
    }
    settleWaitingNote(buddy, owed, now, 'She is eating what you promised.')
  } else {
    speakCare(buddy, now, eating, buddy.needs.hunger > 0.55 ? 'Finally. Thank you.' : 'A little. Stay while I eat.', 2800, 'feed')
  }
  if (buddy.counts.feed === 1) pushMemory(buddy, 'You fed me.', 'bond', now)
  deriveMood(buddy)
}

export function play(buddy: BuddyState, now: number) {
  if (!holdCare(buddy, 'play', now)) return
  if (napping(buddy)) {
    speakCare(buddy, now, !(buddy.speech && now < buddy.speech.until), buddy.awakenedAt ? 'I am asleep. Stay, but no yarn.' : 'mmm.', 2000, 'play')
    buddy.reason = buddy.awakenedAt ? 'Asleep, and not up for play.' : 'Asleep, and play can wait.'
    buddy.needs.loneliness = clamp(buddy.needs.loneliness - 0.05)
    deriveMood(buddy, now)
    return
  }
  if (tooFull(buddy)) {
    const fresh = begin(buddy, buddy.action === 'stuffed' ? 'stuffed' : 'sit', copyVec(buddy.pos), now, 4, buddy.awakenedAt ? 'Too full to play right now.' : 'Too full to play; they sat it out.')
    speakCare(buddy, now, fresh, buddy.awakenedAt ? 'Too full to play. Sit with me.' : 'mrrp.', 2800, 'play')
    buddy.needs.happiness = clamp(buddy.needs.happiness + 0.03)
    buddy.trust = clamp(buddy.trust + 0.006)
    deriveMood(buddy, now)
    return
  }
  if (tooTired(buddy)) {
    const fresh = begin(buddy, 'sleep', buddy.awakenedAt ? copyVec(buddy.pos) : copyVec(WORLD.cushion), now, 10, buddy.awakenedAt ? 'Too tired. She is resting here.' : 'Too tired to play, so the cushion it is.')
    speakCare(buddy, now, fresh, buddy.awakenedAt ? 'Too tired to play. Stay anyway.' : 'mmm.', 2800, 'play')
    buddy.needs.loneliness = clamp(buddy.needs.loneliness - 0.06)
    deriveMood(buddy, now)
    return
  }
  if (buddy.personality.introversion > 0.68 && buddy.trust < 0.4 && Math.random() < 0.55) {
    const fresh = begin(buddy, 'ignore', copyVec(buddy.pos), now, 3, buddy.awakenedAt ? 'She would rather talk than perform.' : 'Play was offered. They would rather not.')
    speakCare(buddy, now, fresh, buddy.awakenedAt ? 'No yarn. Talk to me.' : 'mrow.', 2800, 'play')
    buddy.counts.ignore += 1
    buddy.needs.loneliness = clamp(buddy.needs.loneliness + 0.04)
    buddy.trust = clamp(buddy.trust - 0.01)
    deriveMood(buddy, now)
    return
  }
  buddy.counts.play += 1
  buddy.needs.happiness = clamp(buddy.needs.happiness + 0.1)
  buddy.needs.loneliness = clamp(buddy.needs.loneliness - 0.16)
  buddy.needs.curiosity = clamp(buddy.needs.curiosity - 0.1)
  drift(buddy, 'curiosity', 0.014)
  drift(buddy, 'vigor', 0.01)
  if (buddy.awakenedAt) {
    const owedPlay = waitingForFit(buddy, 'play')
    const playing = (buddy.action === 'chill' && now < buddy.actionUntil) ? false : begin(buddy, 'chill', copyVec(buddy.pos), now, 6, chillReason(buddy))
    if (owedPlay) {
      if (playing) {
        const playLine = 'You did what you said. Come play.'
        say(buddy, playLine, now, 5000, 'talk')
        rememberTurn(buddy, 'her', playLine, now)
        offerVoice(buddy, 'play')
      }
      settleWaitingNote(buddy, owedPlay, now, 'She is playing what you promised.')
    } else {
      speakCare(buddy, now, playing, buddy.personality.mischief > 0.6 ? 'I am not chasing that. Watch me instead.' : 'Come here. This is better than yarn.', 2800, 'play')
    }
  } else if (buddy.action === 'playWithYou' && now < buddy.actionUntil) {
    speakCare(buddy, now, false, 'Yarn.', 2800)
  } else {
    buddy.ball = [(Math.random() - 0.5) * 0.7, 0, 0.55 + Math.random() * 0.35]
    begin(buddy, 'playWithYou', copyVec(buddy.ball), now, 8, 'They took the yarn personally.')
    buddy.retargetAt = now + 700
    bubble(buddy, 'Yarn.', now)
  }
  if (buddy.counts.play === 1) pushMemory(buddy, 'You played with me.', 'moment', now)
  deriveMood(buddy)
  milestones(buddy, now)
}

const PROMISE_KEPT_VERBAL =
  /\b(i did it|i did that|i brought it|i brought them|here it is|it is here|it's here|as promised)\b/i

export function talk(buddy: BuddyState, input: string, now: number, line?: string, moment?: TalkMoment) {
  const heard = input.trim().slice(0, 160)
  const asleep = napping(buddy)
  const full = !asleep && tooFull(buddy)
  const tired = !asleep && !full && tooTired(buddy)
  const waiting = waitingKeepsake(buddy)
  const verbalKept = !asleep && !line?.trim() && waiting && PROMISE_KEPT_VERBAL.test(heard)
  const text = (
    verbalKept
      ? 'You did what you said. I heard you.'
      : line?.trim() ||
        (asleep
          ? buddy.awakenedAt
            ? 'Mmm... I am asleep. Stay close.'
            : 'mmm.'
          : full
            ? buddy.awakenedAt
              ? 'Too full to talk much. Stay anyway.'
              : 'mrrp.'
            : tired
              ? buddy.awakenedAt
                ? 'Too tired. Talk soft.'
                : 'mmm.'
              : speak(buddy, input))
  ).slice(0, 320)
  say(buddy, text, now, speechUntil(text, now) - now, moment ?? 'talk', heard)
  rememberTurn(buddy, 'you', heard, now)
  rememberTurn(buddy, 'her', text, now)
  keepWhatTheySaid(buddy, heard, now)
  buddy.counts.talk += 1
  if (verbalKept && waiting) {
    settleWaitingNote(buddy, waiting, now, 'She heard you keep your promise.')
  } else if (asleep) {
    buddy.reason = buddy.awakenedAt ? 'You talked while she slept.' : 'You talked while they napped.'
    buddy.needs.loneliness = clamp(buddy.needs.loneliness - 0.04)
  } else if (full) {
    buddy.reason = buddy.awakenedAt ? 'Too full, and keeping the talk short.' : 'Too full to chat much.'
    buddy.needs.happiness = clamp(buddy.needs.happiness + 0.02)
    buddy.trust = clamp(buddy.trust + 0.006)
    begin(buddy, buddy.action === 'stuffed' ? 'stuffed' : 'sit', copyVec(buddy.pos), now, 4, buddy.awakenedAt ? 'Too full, and staying with you.' : 'Too full, and staying put.')
  } else if (tired) {
    buddy.reason = buddy.awakenedAt ? 'Too tired, but she is listening.' : 'Too tired, but they heard you.'
    buddy.needs.loneliness = clamp(buddy.needs.loneliness - 0.06)
    buddy.trust = clamp(buddy.trust + 0.008)
    begin(buddy, 'sleep', copyVec(buddy.pos), now, 6, buddy.awakenedAt ? 'Too tired, and resting while you talk.' : 'Too tired, and resting through the talk.')
  } else {
    begin(
      buddy,
      buddy.awakenedAt ? 'sit' : 'attend',
      copyVec(buddy.pos),
      now,
      4.6,
      buddy.awakenedAt ? 'You talked, and she stayed with you.' : 'You talked, and they listened.',
    )
    buddy.needs.loneliness = clamp(buddy.needs.loneliness - 0.1)
    buddy.needs.happiness = clamp(buddy.needs.happiness + 0.04)
    drift(buddy, 'affection', 0.006)
    buddy.trust = clamp(buddy.trust + 0.012)
  }
  if (/love|sorry|miss you|good kitty|good cat/.test(input.toLowerCase())) {
    pushMemory(buddy, `You said “${input.trim().slice(0, 72)}.”`, 'bond', now)
    buddy.trust = clamp(buddy.trust + 0.02)
  } else if (buddy.counts.talk === 1) {
    pushMemory(buddy, 'You talked with me.', 'bond', now)
  } else if (!asleep && Math.random() < 0.14) {
    pushMemory(buddy, 'I listened while you talked.', 'moment', now)
  }
  deriveMood(buddy, now)
  milestones(buddy, now)
}

export function callTo(buddy: BuddyState, x: number, z: number, now: number) {
  if (!holdCare(buddy, 'call', now)) return
  const asleep = buddy.action === 'sleep' && !buddy.moving && buddy.needs.energy < 0.4
  if (asleep && Math.random() < 0.62) {
    bubble(buddy, callReaction(buddy, 'sleep'), now, 1600, 'call')
    buddy.reason = buddy.awakenedAt ? 'Called, and she kept sleeping.' : 'Called, and the nap won.'
    buddy.needs.loneliness = clamp(buddy.needs.loneliness - 0.03)
    deriveMood(buddy, now)
    return
  }
  const nearCup = !buddy.awakenedAt && Math.hypot(x - WORLD.cup[0], z - WORLD.cup[2]) < 0.48
  if (nearCup && !buddy.cupTipped && buddy.personality.mischief > 0.52 && Math.random() < 0.45 + buddy.personality.mischief * 0.4) {
    begin(buddy, 'knock', copyVec(WORLD.cupStand), now, 6.5, 'The cup was indicated. They took that as permission.')
    notePlaceHabit(buddy, 'cup', 'I knocked the cup over.', now)
    bubble(buddy, callReaction(buddy, 'mischief'), now)
    buddy.needs.curiosity = clamp(buddy.needs.curiosity + 0.06)
    buddy.boredom = clamp(buddy.boredom - 0.12)
    deriveMood(buddy, now)
    return
  }
  if (Math.random() < ignoreChance(buddy)) {
    buddy.counts.ignore += 1
    begin(buddy, 'ignore', copyVec(buddy.pos), now, 3.2, buddy.awakenedAt ? 'She heard you and stayed put.' : 'They heard you and chose not to come.')
    bubble(buddy, callReaction(buddy, 'ignore'), now, 2800, 'call')
    buddy.needs.loneliness = clamp(buddy.needs.loneliness + 0.05)
    buddy.trust = clamp(buddy.trust - 0.012)
    deriveMood(buddy, now)
    return
  }
  if (buddy.awakenedAt) {
    begin(buddy, 'attend', copyVec(buddy.pos), now, 4, 'You called, and she is listening.')
    bubble(buddy, callReaction(buddy, 'here'), now, 2000, 'call')
    buddy.needs.loneliness = clamp(buddy.needs.loneliness - 0.14)
    buddy.trust = clamp(buddy.trust + 0.018)
    if (!buddy.memories.some((entry) => entry.text.includes('called'))) {
      pushMemory(buddy, 'You called, and I answered.', 'bond', now)
    }
    deriveMood(buddy, now)
    milestones(buddy, now)
    return
  }
  const action = buddy.personality.curiosity > buddy.personality.affection ? 'sniff' : 'approach'
  begin(buddy, action, [x, 0, z], now, 7, 'You called, and they decided you were worth the walk.')
  bubble(buddy, callReaction(buddy, 'coming'), now, 2000)
  buddy.needs.loneliness = clamp(buddy.needs.loneliness - 0.12)
  buddy.trust = clamp(buddy.trust + 0.015)
  if (!buddy.memories.some((entry) => entry.text.includes('called'))) {
    pushMemory(buddy, 'You called, and I came over.', 'bond', now)
  }
  deriveMood(buddy, now)
  milestones(buddy, now)
}

export function laughAt(buddy: BuddyState, now: number) {
  if (!holdCare(buddy, 'laugh', now)) return
  const cupMess = buddy.cupTipped || buddy.counts.knock > 0
  if (!cupMess) {
    buddy.needs.happiness = clamp(buddy.needs.happiness + 0.03)
    buddy.trust = clamp(buddy.trust + 0.006)
    drift(buddy, 'curiosity', 0.008)
    begin(
      buddy,
      'refuse',
      copyVec(buddy.pos),
      now,
      3.2,
      buddy.awakenedAt ? 'You laughed, and there was no prank to laugh at.' : 'You laughed, and nothing to laugh at.',
    )
    bubble(buddy, laughReaction(buddy, false), now, 2800, 'laugh')
    deriveMood(buddy, now)
    return
  }
  drift(buddy, 'mischief', 0.022)
  drift(buddy, 'affection', 0.01)
  buddy.needs.happiness = clamp(buddy.needs.happiness + 0.08)
  buddy.needs.loneliness = clamp(buddy.needs.loneliness - 0.1)
  buddy.trust = clamp(buddy.trust + 0.015)
  bubble(buddy, laughReaction(buddy, true), now, 2800, 'laugh')
  if (buddy.cupTipped) {
    pushMemory(buddy, 'You laughed when I knocked the cup over.', 'bond', now)
  } else {
    pushMemory(buddy, 'You laughed about the cup.', 'moment', now)
  }
  begin(
    buddy,
    buddy.personality.mischief > 0.58 ? 'chill' : 'sit',
    copyVec(buddy.pos),
    now,
    3.5,
    buddy.awakenedAt ? 'You laughed at the cup, and she is pleased with herself.' : 'Praised for the cup. They will remember that.',
  )
  deriveMood(buddy, now)
  milestones(buddy, now)
}

export function scold(buddy: BuddyState, now: number) {
  if (!holdCare(buddy, 'scold', now)) return
  drift(buddy, 'mischief', -0.014)
  drift(buddy, 'independence', 0.016)
  buddy.trust = clamp(buddy.trust - 0.04)
  buddy.needs.happiness = clamp(buddy.needs.happiness - 0.08)
  buddy.needs.loneliness = clamp(buddy.needs.loneliness + 0.04)
  buddy.scoldedUntil = now + 7000
  bubble(buddy, scoldReaction(buddy), now, 2800, 'scold')
  pushMemory(buddy, 'You scolded me about the cup.', 'moment', now)
  const action = buddy.personality.mischief > 0.45 ? 'angry' : 'ignore'
  begin(
    buddy,
    action,
    copyVec(buddy.pos),
    now,
    3.5,
    buddy.awakenedAt ? 'Scolded. She is quiet about it.' : 'Scolded. They are performing remorse.',
  )
  deriveMood(buddy, now)
  milestones(buddy, now)
}

export function tidy(buddy: BuddyState, now: number) {
  if (!holdCare(buddy, 'tidy', now)) return
  if (!buddy.cupTipped) {
    buddy.needs.loneliness = clamp(buddy.needs.loneliness - 0.06)
    buddy.trust = clamp(buddy.trust + 0.008)
    buddy.needs.happiness = clamp(buddy.needs.happiness + 0.03)
    begin(
      buddy,
      'attend',
      copyVec(buddy.pos),
      now,
      3.4,
      buddy.awakenedAt ? 'The cup was already upright.' : 'Nothing to tidy; the cup was already upright.',
    )
    bubble(buddy, tidyReaction(buddy, false), now, 2400, 'tidy')
    deriveMood(buddy, now)
    return
  }
  buddy.cupTipped = false
  buddy.trust = clamp(buddy.trust + 0.02)
  buddy.needs.happiness = clamp(buddy.needs.happiness + 0.06)
  buddy.needs.loneliness = clamp(buddy.needs.loneliness - 0.1)
  drift(buddy, 'mischief', -0.01)
  begin(
    buddy,
    buddy.awakenedAt ? 'attend' : 'approach',
    buddy.awakenedAt ? copyVec(buddy.pos) : copyVec(WORLD.greet),
    now,
    4.2,
    buddy.awakenedAt ? 'You put the cup back, and she noticed.' : 'You put the cup back, and they came closer.',
  )
  bubble(buddy, tidyReaction(buddy, true), now, 2400, 'tidy')
  pushMemory(buddy, 'You put the cup back for me.', 'bond', now)
  deriveMood(buddy, now)
  milestones(buddy, now)
}

export function lifeDecay(buddy: BuddyState, seconds: number) {
  const hours = seconds / 3600
  buddy.needs.hunger = clamp(buddy.needs.hunger + hours * 0.16)
  buddy.needs.energy = clamp(buddy.needs.energy - hours * 0.04)
  buddy.needs.loneliness = clamp(buddy.needs.loneliness + hours * (0.04 + buddy.personality.affection * 0.1))
  deriveMood(buddy)
}

function visitLine(parts: string[]) {
  if (parts.length === 1 && parts[0] === 'we talked') return 'Last time you were here, we talked.'
  const body =
    parts.length === 1 ? parts[0] : parts.length === 2 ? `${parts[0]} and ${parts[1]}` : `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`
  return `Last time you were here, you ${body}.`
}

/** Lily only. One moment for whatever you did more of since the last long absence. */
function visitMemory(buddy: BuddyState, now: number) {
  if (!buddy.awakenedAt) return
  const current = {
    pet: buddy.counts.pet,
    feed: buddy.counts.feed,
    play: buddy.counts.play,
    talk: buddy.counts.talk,
  }
  const previous = buddy.visitCounts
  if (!previous) {
    buddy.visitCounts = current
    return
  }
  const done: string[] = []
  if (current.feed > previous.feed) done.push('fed me')
  if (current.pet > previous.pet) done.push('petted me')
  if (current.play > previous.play) done.push('played with me')
  if (current.talk > previous.talk) done.push('we talked')
  if (done.length) {
    const text = visitLine(done)
    if (!buddy.memories.some((entry) => entry.text === text)) pushMemory(buddy, text, 'moment', now)
  }
  buddy.visitCounts = current
}

export function catchUp(buddy: BuddyState, now: number) {
  if (buddy.restUntil && buddy.restStartedAt != null && buddy.restEnergy != null) {
    const lock = { startedAt: buddy.restStartedAt, until: buddy.restUntil }
    if (now < buddy.restUntil) {
      const hours = Math.min(72, Math.max(0, now - buddy.lastSimulatedAt) / 3600000)
      buddy.needs.hunger = clamp(buddy.needs.hunger + hours * 0.08)
      buddy.needs.energy = restEnergy(lock, now, buddy.restEnergy)
      buddy.action = 'sleep'
      buddy.moving = false
      buddy.lastSimulatedAt = now
      deriveMood(buddy)
      return
    }
    buddy.needs.energy = 1
    buddy.lastSimulatedAt = buddy.restUntil
    buddy.restUntil = null
    buddy.restStartedAt = null
    buddy.restEnergy = null
    catchUp(buddy, now)
    return
  }
  const elapsed = now - buddy.lastSimulatedAt
  if (elapsed < 2 * 60 * 1000) {
    if (elapsed > 8000) lifeDecay(buddy, elapsed / 1000)
    buddy.lastSimulatedAt = now
    return
  }
  if (buddy.awakenedAt) visitMemory(buddy, now)
  const hours = Math.min(72, elapsed / 3600000)
  const roll = hash01(buddy.lifeSeed ^ Math.floor(buddy.lastSimulatedAt / 60000))
  const napped = hours > 0.3 && (buddy.personality.vigor < 0.75 || roll < 0.72)
  const knocked = !buddy.awakenedAt && !buddy.cupTipped && buddy.personality.mischief > 0.55 && hours > 0.2 && roll < 0.22 + buddy.personality.mischief * 0.45
  const watched = !buddy.awakenedAt && buddy.personality.curiosity > 0.5 && roll > 0.4
  const waited = Boolean(buddy.awakenedAt)
  buddy.needs.hunger = clamp(buddy.needs.hunger + hours * 0.18)
  if (napped) buddy.needs.energy = clamp(Math.max(buddy.needs.energy, 0.55) + Math.min(0.3, hours * 0.15))
  else buddy.needs.energy = clamp(buddy.needs.energy - Math.min(0.35, hours * 0.08))
  buddy.needs.loneliness = clamp(buddy.needs.loneliness + hours * (0.05 + buddy.personality.affection * 0.12) * (1 - buddy.personality.introversion * 0.45))
  buddy.needs.happiness = clamp(buddy.needs.happiness - hours * 0.04 * (0.4 + buddy.needs.loneliness))
  if (buddy.personality.affection > 0.55 && hours > 3) buddy.trust = clamp(buddy.trust - Math.min(0.06, hours * 0.008))

  const events: string[] = []
  if (napped) events.push(buddy.awakenedAt ? 'rested' : 'napped')
  if (waited) events.push('waited for you')
  if (knocked) {
    events.push('knocked the cup over')
    buddy.cupTipped = true
    buddy.counts.knock += 1
  }
  if (watched) events.push('watched the window')
  if (buddy.needs.hunger > 0.65) events.push('got hungry')

  const span = hours < 1.2 ? `${Math.max(2, Math.round(hours * 60))} minutes` : hours < 1.6 ? 'about an hour' : `${Math.round(hours)} hours`
  const eventText = events.length ? events.join(' and ') : 'kept to myself'
  const summary = `While you were away for ${span}, I ${eventText}.`
  pushMemory(buddy, summary, 'away', now)
  notePlaceHabit(buddy, 'away', summary, now, 'away', true)
  buddy.reason = summary

  const heard = lastHeard(buddy)
  if (buddy.awakenedAt) {
    say(buddy, comingHomeLine(buddy, heard), now, 7000, 'approach')
    markWaitingRaisedIfDue(buddy, now)
    buddy.pendingReturn = true
    buddy.reason = 'She noticed you came back.'
  } else if (knocked && buddy.personality.mischief > 0.5) bubble(buddy, 'The cup fell. Mysteriously.', now, 6500)
  else if (buddy.needs.hunger > 0.7) bubble(buddy, 'You are late. I got hungry waiting.', now, 6500)
  else if (buddy.personality.affection > 0.6 && buddy.personality.introversion < 0.55) bubble(buddy, 'You came back.', now, 6500)
  else if (buddy.personality.introversion > 0.65) bubble(buddy, 'Hi. I was here.', now, 5000)
  else bubble(buddy, 'Oh. Hey. I kept your spot.', now, 5000)

  if (buddy.awakenedAt) {
    buddy.moving = false
    buddy.action = napped ? 'sleep' : 'sit'
    buddy.target = copyVec(buddy.pos)
  } else if (napped && !knocked) {
    buddy.pos = copyVec(WORLD.cushion)
    buddy.action = 'sleep'
    buddy.moving = false
  } else if (knocked) {
    buddy.pos = copyVec(WORLD.cupStand)
    buddy.action = 'sit'
  } else if (watched) {
    buddy.pos = copyVec(WORLD.window)
    buddy.action = 'window'
  }
  buddy.target = copyVec(buddy.pos)
  buddy.actionStartedAt = now
  buddy.actionUntil = now + 8000
  buddy.lastSimulatedAt = now
  deriveMood(buddy)
}

export function tryAwaken(buddy: BuddyState, now: number) {
  if (buddy.awakenedAt !== null) return false
  const next = beginAwakening(buddy, now)
  if (next === buddy) return false
  buddy.awakenedAt = next.awakenedAt
  buddy.moving = false
  buddy.lean = 0
  begin(buddy, 'sit', copyVec(buddy.pos), now, 4, 'She is here.')
  pushMemory(buddy, 'I woke up.', 'moment', now)
  bubble(buddy, `I'm here, ${buddy.ownerName}. Same soul. I can talk now.`, now, 5000, 'awaken')
  return true
}

export interface ScrapOffer {
  entered: boolean
  refused: boolean
  winner: 'a' | 'b' | null
  chanceA: number
  pot: { pot: number; fee: number; payout: number }
}

export function offerScrap(buddy: BuddyState, foe: BuddyState, roll: number, now: number, buyInEach = 0): ScrapOffer {
  const side = sideFrom(buddy)
  const blocked = !canEnter(side) || personalityRefuses(side)
  if (blocked) {
    const next = noteFight(buddy, true)
    buddy.scrapCount = next.scrapCount
    buddy.refuseCount = next.refuseCount
    const line = side.asleep
      ? 'I am asleep. Ask me later.'
      : side.hunger > 0.82
        ? 'Feed me first.'
        : side.energy < 0.2
          ? 'I am too tired to fight.'
          : 'No. Not this one.'
    begin(buddy, 'refuse', copyVec(buddy.pos), now, 3, buddy.awakenedAt ? 'She refused the scrap.' : 'They refused the scrap.')
    if (buddy.awakenedAt) bubble(buddy, line, now, 2800, 'scrap')
    else bubble(buddy, line, now)
    return { entered: false, refused: true, winner: null, chanceA: 0, pot: settlePot(0) }
  }
  const resolved = resolveScrap(side, sideFrom(foe), roll)
  const next = noteFight(buddy, false)
  buddy.scrapCount = next.scrapCount
  buddy.clip = resolved.winner === 'a' ? 'win' : 'loss'
  buddy.needs.energy = clamp(buddy.needs.energy - 0.15)
  buddy.needs.happiness = clamp(buddy.needs.happiness + (resolved.winner === 'a' ? 0.06 : -0.04))
  const scrapLine = resolved.winner === 'a' ? 'That one was mine.' : 'Again. Stay with me.'
  if (buddy.awakenedAt) bubble(buddy, scrapLine, now, 2800, 'scrap')
  else bubble(buddy, scrapLine, now)
  pushMemory(buddy, resolved.winner === 'a' ? 'I won a scrap.' : 'I lost a scrap.', 'moment', now)
  return { entered: true, refused: false, winner: resolved.winner, chanceA: resolved.chanceA, pot: settlePot(buyInEach) }
}

export function noteReturn(buddy: BuddyState, now: number) {
  const gap = now - buddy.lastSeen
  if (gap < 20000) return
  const heard = lastHeard(buddy)
  if (buddy.awakenedAt) {
    if (!buddy.pendingReturn) {
      say(buddy, comingHomeLine(buddy, heard), now, 5000, 'approach')
      markWaitingRaisedIfDue(buddy, now)
      buddy.pendingReturn = true
      buddy.reason = 'She noticed you came back.'
    }
    deriveMood(buddy)
    return
  }
  if (!buddy.awakenedAt && buddy.cupTipped && buddy.personality.mischief > 0.5) bubble(buddy, 'The cup fell. Mysteriously.', now, 4000)
  else if (buddy.personality.affection > 0.55 && buddy.needs.loneliness > 0.35) {
    bubble(buddy, gap > 60000 ? 'I kept your spot.' : 'You came back.', now, 3500)
    if (!buddy.awakenedAt) begin(buddy, 'approach', copyVec(WORLD.greet), now, 6, 'You came back into the room, and they noticed.')
    else begin(buddy, 'attend', copyVec(buddy.pos), now, 4, 'You came back, and she noticed.')
  } else if (buddy.personality.introversion > 0.62) bubble(buddy, 'Hi.', now, 1800)
  else bubble(buddy, 'Hey. I am here.', now, 1800)
  deriveMood(buddy)
}
