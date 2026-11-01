import type { BuddyState, LilyGesture, TalkMoment } from './types'

const MOMENTS = new Set<TalkMoment>(['live', 'talk', 'approach', 'eat', 'sleep'])
const GESTURES = new Set<LilyGesture>([
  'yawn',
  'eat',
  'flirt',
  'wink',
  'kiss',
  'cry',
  'angry',
  'wave',
  'cheer',
  'nod',
  'pout',
  'question',
  'shy',
  'silly',
  'sleep',
  'talk',
])

export type AskKind =
  | 'talk'
  | 'return'
  | 'hunger'
  | 'promise'
  | 'aside'
  | 'wake'
  | 'awaken'
  | 'pet'
  | 'feed'
  | 'play'
  | 'call'
  | 'laugh'
  | 'scold'
  | 'tidy'
  | 'scrap'
  | 'miss'

const NEW_KINDS = new Set<AskKind>([
  'wake',
  'awaken',
  'pet',
  'feed',
  'play',
  'call',
  'laugh',
  'scold',
  'tidy',
  'scrap',
  'miss',
])

const MEMORY_CAP = 8
const FOOD_TEXT = /\b(?:food|fed|feed|feeding|hungry|hunger|fish|ate|eat|eating|meal)\b/i
const PROMISE_TEXT = /\b(?:promise[sd]?|said|told|you will|you'll|i will|i'll)\b/i
const BACK_TEXT = /\b(?:back|return(?:ed)?|came|come home|away|gone|waited|waiting|while you)\b/i
const PLACE_TEXT = /\b(?:window|cushion|cup)\b/i
const PLAY_TEXT = /\b(play|yarn|game)\b/i
const CUP_TEXT = /\bcup\b/i
const SCRAP_TEXT = /\b(scrap|won|lost|fight)\b/i

export function dayPart(now = Date.now()): 'night' | 'morning' | 'afternoon' | 'evening' | 'late' {
  const hour = new Date(now).getHours()
  if (hour < 5) return 'night'
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  if (hour < 21) return 'evening'
  return 'late'
}

function bondWord(trust: number): 'wary' | 'warming' | 'steady' | 'devoted' {
  if (trust < 0.3) return 'wary'
  if (trust < 0.55) return 'warming'
  if (trust < 0.8) return 'steady'
  return 'devoted'
}

function momentMemories(buddy: BuddyState, kind: AskKind) {
  const all = buddy.memories ?? []
  const picked = new Set<number>()
  const add = (test: (entry: (typeof all)[number]) => boolean) => {
    for (let i = 0; i < all.length && picked.size < MEMORY_CAP; i++) {
      if (!picked.has(i) && test(all[i])) picked.add(i)
    }
  }
  if (kind === 'aside' || kind === 'return' || kind === 'hunger') add((entry) => entry.kind === 'habit')
  if (kind === 'hunger') add((entry) => FOOD_TEXT.test(entry.text))
  else if (kind === 'promise') add((entry) => PROMISE_TEXT.test(entry.text))
  else if (kind === 'return') add((entry) => entry.kind === 'away' || BACK_TEXT.test(entry.text))
  else if (kind === 'aside') add((entry) => entry.kind === 'habit' || PLACE_TEXT.test(entry.text))
  else if (kind === 'wake' || kind === 'awaken' || kind === 'pet' || kind === 'call') {
    add((entry) => entry.kind === 'bond')
    add((entry) => entry.kind === 'habit')
  } else if (kind === 'feed') {
    add((entry) => FOOD_TEXT.test(entry.text))
    add((entry) => entry.kind === 'habit')
  } else if (kind === 'play') add((entry) => PLAY_TEXT.test(entry.text))
  else if (kind === 'laugh' || kind === 'scold' || kind === 'tidy') add((entry) => CUP_TEXT.test(entry.text))
  else if (kind === 'scrap') add((entry) => SCRAP_TEXT.test(entry.text))
  else if (kind === 'miss') {
    add((entry) => entry.kind === 'away')
    add((entry) => entry.kind === 'bond')
    add((entry) => entry.kind === 'habit')
  }
  add(() => true)
  return [...picked]
    .sort((a, b) => a - b)
    .map((i) => ({ kind: all[i].kind, text: all[i].text.slice(0, 160) }))
}

export async function askCompanion(
  buddy: BuddyState,
  line: string,
  kind: AskKind = 'talk',
): Promise<{ line: string; moment: TalkMoment; gesture?: LilyGesture; fact?: string } | null> {
  const trimmed = line.trim().slice(0, 160)
  if (kind === 'talk' && !trimmed) return null
  if (!buddy.awakenedAt && NEW_KINDS.has(kind)) return null
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), 12000)
  try {
    const response = await fetch('/api/talk', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        creatureId: buddy.id,
        name: buddy.name,
        ownerName: buddy.ownerName,
        awakened: Boolean(buddy.awakenedAt),
        traits: buddy.personality,
        needs: {
          hunger: buddy.needs.hunger,
          energy: buddy.needs.energy,
          happiness: buddy.needs.happiness,
          loneliness: buddy.needs.loneliness,
        },
        mood: buddy.mood,
        action: buddy.action,
        memories: momentMemories(buddy, kind),
        turns: (buddy.turns ?? []).slice(-16).map((entry) => ({ role: entry.role, text: entry.text.slice(0, 320) })),
        recent: (buddy.turns ?? [])
          .filter((entry) => entry.role === 'her')
          .slice(-3)
          .map((entry) => entry.text.slice(0, 120)),
        cupTipped: Boolean(buddy.cupTipped),
        bond: bondWord(buddy.trust),
        keepsakes: (buddy.keepsakes ?? []).slice(-12).map((entry) => ({
          kind: entry.kind,
          text: entry.text.slice(0, 160),
        })),
        line: trimmed,
        kind,
        dayPart: dayPart(),
        outcome: (buddy.reason || '').slice(0, 160),
      }),
    })
    if (!response.ok) return null
    const data = (await response.json()) as {
      ok?: boolean
      line?: unknown
      moment?: unknown
      gesture?: unknown
      fact?: unknown
    }
    if (!data.ok || typeof data.line !== 'string') return null
    const maxLen = buddy.awakenedAt ? 320 : 120
    const spoken = data.line.trim().slice(0, maxLen)
    if (!spoken) return null
    const rawMoment = typeof data.moment === 'string' ? data.moment.trim().toLowerCase() : ''
    let moment = MOMENTS.has(rawMoment as TalkMoment) ? (rawMoment as TalkMoment) : 'talk'
    if (moment === 'eat' && buddy.action !== 'eat') moment = 'talk'
    const rawGesture = typeof data.gesture === 'string' ? data.gesture.trim().toLowerCase() : ''
    let gesture = GESTURES.has(rawGesture as LilyGesture) ? (rawGesture as LilyGesture) : undefined
    if (gesture === 'eat' && buddy.action !== 'eat') gesture = 'pout'
    const rawFact = typeof data.fact === 'string' ? data.fact.trim().slice(0, 90) : ''
    const fact = kind === 'talk' && buddy.awakenedAt && rawFact.length >= 8 ? rawFact : undefined
    if (buddy.awakenedAt) {
      return { line: spoken, moment, ...(gesture ? { gesture } : {}), ...(fact ? { fact } : {}) }
    }
    return { line: spoken, moment }
  } catch {
    return null
  } finally {
    window.clearTimeout(timer)
  }
}
