export const TRAIT_KEYS = [
  'mischief',
  'affection',
  'introversion',
  'vigor',
  'curiosity',
  'independence',
] as const

export type TraitKey = (typeof TRAIT_KEYS)[number]
export type Traits = Record<TraitKey, number>

export type Mood =
  | 'happy'
  | 'sad'
  | 'angry'
  | 'sleepy'
  | 'excited'
  | 'curious'
  | 'affectionate'
  | 'lonely'
  | 'bored'
  | 'content'

export type Action =
  | 'wander'
  | 'sit'
  | 'sleep'
  | 'groom'
  | 'approach'
  | 'window'
  | 'knock'
  | 'chase'
  | 'zoomies'
  | 'sniff'
  | 'attend'
  | 'ignore'
  | 'eat'
  | 'playWithYou'
  | 'flop'
  | 'stuffed'
  | 'chill'
  | 'shy'
  | 'refuse'
  | 'angry'

export type Pattern = 'solid' | 'tabby' | 'spots' | 'calico' | 'point' | 'tortie'
export type EarType = 'pointed' | 'rounded' | 'wide' | 'folded' | 'tufted'
export type TailType = 'long' | 'fluffy' | 'slim' | 'curled' | 'bob' | 'kinked'
export type EyeShape = 'round' | 'almond' | 'large' | 'narrow'
export type Accessory = 'none' | 'bow' | 'collar' | 'bandana' | 'flower' | 'hat' | 'glasses' | 'scarf'
export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary'
export type MemoryKind = 'bond' | 'moment' | 'habit' | 'away'
export type TalkMoment = 'live' | 'talk' | 'approach' | 'eat' | 'sleep'

export interface TalkTurn {
  role: 'you' | 'her'
  text: string
  at: number
}

/** A fact that stays after the chat thread scrolls off. */
export interface Keepsake {
  kind: 'told' | 'name' | 'waiting' | 'kept' | 'fact'
  text: string
  at: number
}

export type PendingVoice =
  | 'hunger'
  | 'promise'
  | 'aside'
  | 'wake'
  | 'awaken'
  | 'miss'
  | 'pet'
  | 'feed'
  | 'play'
  | 'call'
  | 'laugh'
  | 'scold'
  | 'tidy'
  | 'scrap'

export type LilyGesture =
  | 'yawn'
  | 'eat'
  | 'flirt'
  | 'wink'
  | 'kiss'
  | 'cry'
  | 'angry'
  | 'wave'
  | 'cheer'
  | 'nod'
  | 'pout'
  | 'question'
  | 'shy'
  | 'silly'
  | 'sleep'
  | 'talk'

export interface Spot {
  x: number
  y: number
  rx: number
  ry: number
  rot: number
  color: 'spot' | 'third'
}

export interface Dna {
  visualSeed: number
  coatName: string
  base: string
  spot: string
  third: string
  belly: string
  pattern: Pattern
  eye: string
  eyeRight: string
  eyeShape: EyeShape
  ears: EarType
  tail: TailType
  accessory: Accessory
  accent: string
  nose: string
  mutations: string[]
  spots: Spot[]
  stripeShift: number
  gaze: -1 | 1
  scale: number
  rarity: Rarity
}

export interface Needs {
  hunger: number
  energy: number
  happiness: number
  curiosity: number
  loneliness: number
}

export interface MemoryEntry {
  id: string
  at: number
  text: string
  kind: MemoryKind
}

export type Vec = [number, number, number]

export interface BuddyState {
  id: string
  name: string
  ownerName: string
  visualSeed: number
  lifeSeed: number
  createdAt: number
  lastSimulatedAt: number
  lastSeen: number
  dna: Dna
  basePersonality: Traits
  personality: Traits
  idleStyle: number
  phase: number
  needs: Needs
  trust: number
  mood: Mood
  action: Action
  actionStartedAt: number
  actionUntil: number
  target: Vec
  pos: Vec
  lean: number
  moving: boolean
  retargetAt: number
  memories: MemoryEntry[]
  counts: { pet: number; feed: number; play: number; talk: number; knock: number; ignore: number }
  /** Pet, feed, play, and talk counts from the last visit. Null until the first return copies them. */
  visitCounts: { pet: number; feed: number; play: number; talk: number } | null
  recentPets: number[]
  /** Last time each care action counted. A press inside the wait changes nothing. */
  careAt: Partial<Record<'pet' | 'feed' | 'play' | 'call' | 'laugh' | 'scold' | 'tidy', number>>
  speech: { text: string; until: number; moment?: TalkMoment; heard?: string; gesture?: LilyGesture } | null
  turns: TalkTurn[]
  /** Facts kept after the forty-line thread drops them. */
  keepsakes: Keepsake[]
  pendingReturn: boolean
  pendingVoice: PendingVoice | null
  /** The draft that belongs to pendingVoice, kept if a later action changes the bubble. */
  pendingVoiceLine: string | null
  /** True after she has said she is hungry, until hunger falls. */
  spokeHunger: boolean
  /** True after she has said she missed you, until loneliness falls. */
  spokeMiss: boolean
  /** When she last spoke the due-day waiting line, or when return caught a due promise. */
  waitingRaisedAt: number | null
  reason: string
  cupTipped: boolean
  ball: Vec
  boredom: number
  lastActions: Action[]
  milestones: Partial<Record<TraitKey | 'trust', boolean>>
  celebrateUntil: number
  scoldedUntil: number
  /** UTC midnights on which she was fed and the machine was opened. */
  careDays: number[]
  /** UTC midnights on which trust stayed high. */
  trustHighDays: number[]
  scrapCount: number
  refuseCount: number
  awakenedAt: number | null
  /** A short Lily beat, such as a scrap win, cleared when the next action starts. */
  clip: 'win' | 'loss' | null
  /** Rest lock. While this is in the future she stays asleep and will not spend energy. */
  restUntil: number | null
  restStartedAt: number | null
  /** Energy at the moment rest began. The clock refills from this value. */
  restEnergy: number | null
}

export interface Reign {
  wallet: string
  name: string
  since: number
  defenses: number
}

export interface Save {
  ownerName: string
  buddies: BuddyState[]
  activeId: string
  holdings: number
  charm: 'bell' | 'sweater' | 'crown' | null
  /** A charm taken off, waiting to be worn. One pouch. */
  pouch: 'bell' | 'sweater' | 'crown' | null
  charmClaimed: boolean
  explorations: number
  reign: Reign | null
  /** Crystals set aside as the food bowl. Feeding sips one. */
  bowl: number
  seasonKey: string
  seasonScraps: number
  seasonPlays: number
  seasonClaimed: boolean
}
