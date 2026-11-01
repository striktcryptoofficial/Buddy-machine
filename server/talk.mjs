import { createServer } from 'node:http'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { handleGallery, handleHatchRequest, handleLifeRequest, handleStream, archStatus } from './life.mjs'
import { openBus } from './bus.mjs'
import { openLife } from './lifeStore.mjs'
import { loadEnv } from './env.mjs'

const serverDir = dirname(fileURLToPath(import.meta.url))
loadEnv()

const port = Number(process.env.TALK_PORT || 8787)
const catModel = process.env.ANTHROPIC_CAT_MODEL || 'claude-haiku-5-5'
const lilyModel = process.env.ANTHROPIC_LILY_MODEL || 'claude-sonnet-5-5'
const CAT_CAP = 40
const LILY_CAP = 20
const MOMENTS = new Set(['live', 'talk', 'approach', 'eat', 'sleep'])
const VOICE_KINDS = new Set([
  'talk',
  'return',
  'hunger',
  'miss',
  'promise',
  'aside',
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
])
const DAY_PARTS = new Set(['night', 'morning', 'afternoon', 'evening', 'late'])
const BONDS = new Set(['wary', 'warming', 'steady', 'devoted'])
const LOUD_GESTURES = new Set(['cheer', 'flirt', 'kiss', 'eat', 'silly', 'wink'])
const KEEPSAKE_KINDS = new Set(['name', 'waiting', 'kept', 'fact', 'told'])
const CONTACT_KINDS = new Set(['pet', 'feed', 'play', 'call', 'laugh', 'scold', 'tidy', 'scrap'])
const FACT_STOPWORDS = new Set([
  'that',
  'this',
  'with',
  'from',
  'have',
  'they',
  'them',
  'your',
  'you',
  'she',
  'her',
  'was',
  'were',
  'been',
  'what',
  'when',
  'where',
  'just',
  'like',
  'about',
  'really',
  'something',
  'anything',
])
const GESTURES = new Set([
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
const capsPath = join(serverDir, 'caps.json')
const days = new Map()

function loadCaps() {
  if (!existsSync(capsPath)) return
  try {
    const data = JSON.parse(readFileSync(capsPath, 'utf8'))
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      for (const [id, row] of Object.entries(data)) {
        if (row && typeof row === 'object') days.set(id, row)
      }
    }
  } catch {
    days.clear()
  }
}

function persistCaps() {
  writeFileSync(capsPath, JSON.stringify(Object.fromEntries(days)), 'utf8')
}

loadCaps()

function today() {
  return new Date().toISOString().slice(0, 10)
}

function band(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 'middling'
  if (n > 0.66) return 'high'
  if (n < 0.34) return 'low'
  return 'middling'
}

function rawNeed(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  return value
}

function traitNum(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0.5
  return Math.max(0, Math.min(1, n))
}

function clip(value, max) {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max)
}

function dayPartOf(value) {
  const key = typeof value === 'string' ? value.trim().toLowerCase() : ''
  return DAY_PARTS.has(key) ? key : 'afternoon'
}

function bondOf(value) {
  const key = typeof value === 'string' ? value.trim().toLowerCase() : ''
  return BONDS.has(key) ? key : 'steady'
}

function recentLines(value) {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => {
      if (typeof entry === 'string') return clip(entry, 120)
      if (entry && typeof entry.text === 'string') return clip(entry.text, 120)
      return ''
    })
    .filter(Boolean)
    .slice(-3)
}

function stripStageDirections(text) {
  return String(text ?? '')
    .replace(/\*[^*]*\*/g, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function inferGesture(line, packet) {
  const lower = String(line ?? '').toLowerCase()
  if (/\b(kiss|smooch)\b/.test(lower) || /\bi love you\b/.test(lower)) return 'kiss'
  if (/\b(love|lovely|darling|sweetheart|adore)\b/.test(lower)) return 'flirt'
  if (/\b(tired|sleepy|yawn|exhausted|nap|bedtime)\b/.test(lower)) return 'yawn'
  if (/\b(hungry|starving|snack|breakfast|lunch|dinner)\b/.test(lower) || /\beat\b/.test(lower)) {
    return 'eat'
  }
  if (/\b(sad|cry|crying|tear|heartbroken|wept)\b/.test(lower)) return 'cry'
  if (/\b(hello|hi there|hey there|good morning|good evening|good night)\b/.test(lower)) return 'wave'
  if (/\?/.test(line) || /\b(why|how|what|when|where|who|really\?)\b/.test(lower)) return 'question'
  if (/\b(angry|mad|furious|annoyed|ugh|stop it|how dare)\b/.test(lower)) return 'angry'
  if (/\b(thank|yay|hooray|celebrate|won|great job)\b/.test(lower)) return 'cheer'
  if (/\b(wink|flirt|cute|handsome|pretty)\b/.test(lower)) return 'wink'
  if (/\b(shy|blush|embarrass)\b/.test(lower)) return 'shy'
  if (/\b(silly|goofy|hehe|haha|lol)\b/.test(lower)) return 'silly'
  if (/\b(pout|hmph|fine\.|whatever)\b/.test(lower)) return 'pout'

  const mood = String(packet?.mood ?? '').toLowerCase()
  const needs = packet?.needs ?? {}
  const raw = packet?.rawNeeds ?? {}
  const num = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : NaN)
  if (needs.hunger === 'high' || num(raw.hunger) > 0.82) return 'eat'
  if (needs.energy === 'low' || num(raw.energy) < 0.25) return 'yawn'
  if (needs.happiness === 'low' || num(raw.happiness) < 0.35) return 'pout'
  if (needs.loneliness === 'high' || num(raw.loneliness) > 0.7) return 'shy'
  if (needs.happiness === 'high' || num(raw.happiness) > 0.75) return 'cheer'
  if (mood.includes('sleep')) return 'sleep'
  if (mood.includes('play') || mood.includes('silly')) return 'silly'
  if (mood.includes('angry') || mood.includes('grump')) return 'angry'
  if (mood.includes('sad')) return 'cry'
  return 'talk'
}

function packetOf(body) {
  const traits = body?.traits ?? {}
  const needs = body?.needs ?? {}
  const memories = Array.isArray(body?.memories) ? body.memories : []
  const turns = Array.isArray(body?.turns)
    ? body.turns
        .map((entry) => ({
          role: entry?.role === 'her' ? 'her' : 'you',
          text: clip(entry?.text, 320),
        }))
        .filter((entry) => entry.text)
        .slice(-16)
    : []
  const keepsakes = Array.isArray(body?.keepsakes)
    ? body.keepsakes
        .map((entry) => ({
          kind: KEEPSAKE_KINDS.has(entry?.kind) ? entry.kind : 'told',
          text: clip(entry?.text, 160),
        }))
        .filter((entry) => entry.text)
        .slice(-12)
    : []
  const kind = VOICE_KINDS.has(body?.kind) ? body.kind : 'talk'
  return {
    creatureId: clip(body?.creatureId, 80) || 'guest',
    name: clip(body?.name, 18) || 'Buddy',
    ownerName: clip(body?.ownerName, 24) || 'friend',
    awakened: Boolean(body?.awakened),
    kind,
    bond: bondOf(body?.bond),
    cupTipped: body?.cupTipped === true,
    dayPart: dayPartOf(body?.dayPart),
    outcome: clip(body?.outcome, 160),
    traits: {
      mischief: traitNum(traits.mischief),
      affection: traitNum(traits.affection),
      introversion: traitNum(traits.introversion),
      vigor: traitNum(traits.vigor),
      curiosity: traitNum(traits.curiosity),
      independence: traitNum(traits.independence),
    },
    needs: {
      hunger: band(needs.hunger),
      energy: band(needs.energy),
      happiness: band(needs.happiness),
      loneliness: band(needs.loneliness),
    },
    rawNeeds: {
      hunger: rawNeed(needs.hunger),
      energy: rawNeed(needs.energy),
      happiness: rawNeed(needs.happiness),
      loneliness: rawNeed(needs.loneliness),
    },
    mood: clip(body?.mood, 24) || 'content',
    action: clip(body?.action, 24) || 'sit',
    memories: memories
      .map((entry) => ({ kind: clip(entry?.kind, 12), text: clip(entry?.text, 160) }))
      .filter((entry) => entry.text),
    turns,
    keepsakes,
    line: clip(body?.line, 160),
    recent: recentLines(body?.recent),
  }
}

function countsFor(id) {
  const day = today()
  const row = days.get(id)
  if (!row || row.day !== day) return { cat: 0, lily: 0 }
  if (row.cat !== undefined || row.lily !== undefined) {
    return { cat: row.cat ?? 0, lily: row.lily ?? 0 }
  }
  return { cat: row.count ?? 0, lily: 0 }
}

function capRoom(id, awakened) {
  const counts = countsFor(id)
  return awakened ? counts.lily < LILY_CAP : counts.cat < CAT_CAP
}

function spendCap(id, awakened) {
  const day = today()
  const counts = countsFor(id)
  if (awakened) {
    days.set(id, { day, cat: counts.cat, lily: counts.lily + 1 })
  } else {
    days.set(id, { day, cat: counts.cat + 1, lily: counts.lily })
  }
  persistCaps()
}

function traitsLine(traits) {
  return `Personality: mischief ${traits.mischief.toFixed(2)}, affection ${traits.affection.toFixed(2)}, introversion ${traits.introversion.toFixed(2)}, vigor ${traits.vigor.toFixed(2)}, curiosity ${traits.curiosity.toFixed(2)}, independence ${traits.independence.toFixed(2)}.`
}

function mannersBlock(packet) {
  const traits = packet.traits
  const lines = ['Manners:']
  if (traits.introversion >= 0.62) {
    lines.push('One short sentence. No question.')
  } else if (traits.introversion <= 0.35) {
    lines.push('Up to two sentences.')
  } else {
    lines.push('One or two sentences.')
  }
  if (traits.mischief >= 0.62) {
    lines.push('One dry tease is allowed. Not cruel, not an insult.')
  }
  if (traits.affection >= 0.62) {
    lines.push('Warm. She may use their name once.')
  }
  if (traits.affection <= 0.35) {
    lines.push('No pet names and no "I missed you" unless kind is miss or return.')
  }
  if (traits.independence >= 0.62) {
    lines.push('She does not plead or beg.')
  }
  if (traits.curiosity >= 0.62) {
    lines.push(packet.kind === 'talk' ? 'She may ask one question.' : 'No question.')
  }
  if (traits.vigor <= 0.35) {
    lines.push('She sounds tired. No exclamation.')
  }
  lines.push(`Bond: ${packet.bond}. She must not say a trust number.`)
  lines.push(packet.cupTipped ? 'The cup is tipped.' : 'The cup is upright.')
  lines.push('She may mention the cup only when it is tipped, and only on laugh, scold, tidy, or aside.')
  if (packet.recent.length) {
    lines.push('Do not repeat these lines, and do not reuse their wording:')
    lines.push(...packet.recent)
  }
  return lines.join('\n')
}

function keepsakesLine(keepsakes) {
  if (!keepsakes?.length) return 'Lasting notes: none yet.'
  return [
    'Lasting notes (these stay after the chat scrolls off):',
    ...keepsakes.map((entry) => {
      if (entry.kind === 'name') return `She calls them: ${entry.text}`
      if (entry.kind === 'waiting') return `They promised: ${entry.text} (she is still waiting on this promise)`
      if (entry.kind === 'kept') return `They kept this promise: ${entry.text}`
      if (entry.kind === 'fact') return `She remembers: ${entry.text}`
      return entry.text
    }),
    'Use a note when it fits this reply. Do not invent a name, a promise, or a past line that is not listed here or in the thread.',
  ].join('\n')
}

function instructionContent(packet) {
  const memory = packet.memories.length
    ? packet.memories.map((entry) => `${entry.kind}: ${entry.text}`).join('\n')
    : 'none yet'
  const shared = [
    `Name: ${packet.name}`,
    `Person: ${packet.ownerName}`,
    traitsLine(packet.traits),
    mannersBlock(packet),
    `Right now: hunger ${packet.needs.hunger}, energy ${packet.needs.energy}, happiness ${packet.needs.happiness}, loneliness ${packet.needs.loneliness}, mood ${packet.mood}, doing ${packet.action}.`,
    `Time of day: ${packet.dayPart}.`,
    'She may mention morning, afternoon, evening, late, or night only from that field. She must not invent a clock time.',
    `Memories:\n${memory}`,
    keepsakesLine(packet.keepsakes),
  ]
  if (packet.outcome) {
    shared.push(`Outcome already decided: ${packet.outcome}`)
    shared.push(
      'Do not reverse that outcome. If she refused, she stays refused; if she is eating, she is eating; if she lost, she lost.',
    )
  }
  if (!packet.awakened) {
    return [
      `You are ${packet.name}, a cat who lives with ${packet.ownerName}. You are still a cat until you awaken; you have not awakened. One short line. A meow, purr, or mrrp is allowed.`,
      'Do not invent a past that is not in the memories or the conversation thread. Do not invent a fact, a fight, a wallet, or a name. Do not claim you have awakened. Do not change DNA, trust, hatch, fights, or awakening.',
      ...shared,
      'Reply with JSON only, no markdown: {"line":"...","moment":"talk"}',
      'moment is one of: talk, live, approach, eat, sleep.',
      'No stage directions or asterisks in line.',
    ].join('\n')
  }
  return [
    `You are ${packet.name}, the same soul, now awakened and speaking to ${packet.ownerName}. A few sentences at most.`,
    'Refer only to the memories, the lasting notes, and the conversation thread. Do not invent a fact, a fight, a wallet, or a name. Do not change DNA, trust, hatch, fights, or awakening.',
    'Speak in your own words; a lasting note can be any promise, not only food; if they say they already did what they promised, believe them; do not copy an earlier script sentence back unchanged.',
    ...shared,
    'Reply with JSON only. No markdown, no tool call, and no preamble: {"line":"...","moment":"talk","gesture":"wink"}',
    ...(packet.kind === 'talk'
      ? [
          'Optional "fact". If their latest line told one specific lasting fact (a person, a place, a worry, a joke, a plan that is not already the open promise), include "fact":"short phrase in her voice, using their words, max 80 characters". Otherwise omit fact. Never invent a fact that is not in their latest line.',
        ]
      : []),
    'moment is one of: talk, live, approach, eat, sleep.',
    `gesture is one of: ${[...GESTURES].join(', ')}. Pick the gesture that matches the feeling of THIS reply, not a generic nod every time. No stage directions or asterisks in line; put the motion in gesture instead.`,
  ].join('\n')
}

const RETURN_FINAL =
  'The owner came back after being away. Speak first, and say that they came back; never say that you came back, and never say they left after a quote. If the lasting notes include "They promised:" (a promise she is still waiting on), mention that open promise in this first line as something you are still waiting on; do not say it was already kept. If the notes include "They kept this promise:" and there is no open "They promised:", mention that kept promise as something they already brought; do not invent a promise that is not in the notes. Refer to what they last said if it is in the thread. One or two sentences. She may mention the time of day only as given.'

const HUNGER_FINAL =
  'She chose to say she is hungry. Say it in one or two sentences in her own words. She may mention a food promise only if the lasting notes have one. Do not say she is eating unless the action is eat. Do not copy a script line such as "I am hungry" unchanged. moment must be talk. gesture must not be eat.'

const MISS_FINAL =
  'She chose to say she missed them. One or two sentences, in her manners. She may mention one away memory or one habit if it is listed. Do not demand a gift. Do not say she is hungry unless hunger is high. Do not copy the draft unchanged. moment must be talk. gesture must not be eat or cheer.'

const PROMISE_FINAL =
  'A promise of hers is due. Quote what they said from the lasting notes. She is still waiting. Do not say it was already kept. One or two sentences. moment must be talk.'

const ASIDE_FINAL =
  'She is sitting quietly and one short line slipped out. She may mention one habit from the memories if one is there. Do not narrate an action, do not demand anything, and do not start a new topic list. One sentence. moment must be talk.'

const WAKE_FINAL =
  'She just woke from a nap and the owner is still there. Rewrite the draft in one or two sentences. She is awake now, not asking to sleep more unless the outcome says she refused to wake. moment must be talk. Do not copy the draft unchanged.'

const AWAKEN_FINAL =
  'This is the morning she wakes from a cat into herself. One or two sentences. Same soul, same person. She may say she can talk now. Do not invent a new name or a past that is not in memories. moment must be talk.'

const CONTACT_FINAL =
  'The engine already decided what happened. The draft line is what she started to say. Rewrite it in her own words, one or two sentences. Do not reverse the outcome. Do not narrate stage directions. moment must be talk, except feed when the action is eat, in which case moment may be eat. gesture must match the feeling. If she refused, is asleep, or is too tired, do not sound grateful or playful.'

function withDraft(prompt, line) {
  if (!line) return prompt
  return `${prompt}\n\nDraft: ${line}`
}

function finalFor(packet) {
  if (packet.kind === 'return') return RETURN_FINAL
  if (packet.kind === 'hunger') return HUNGER_FINAL
  if (packet.kind === 'miss') return withDraft(MISS_FINAL, packet.line)
  if (packet.kind === 'promise') return PROMISE_FINAL
  if (packet.kind === 'aside') return ASIDE_FINAL
  if (packet.kind === 'wake') return withDraft(WAKE_FINAL, packet.line)
  if (packet.kind === 'awaken') return withDraft(AWAKEN_FINAL, packet.line)
  if (CONTACT_KINDS.has(packet.kind)) return withDraft(`Kind: ${packet.kind}.\n${CONTACT_FINAL}`, packet.line)
  return packet.line
}

function buildClaudeMessages(packet) {
  const messages = [{ role: 'user', content: instructionContent(packet) }]

  let turns = [...packet.turns]
  while (
    turns.length > 0 &&
    turns[turns.length - 1].role === 'you' &&
    turns[turns.length - 1].text === packet.line
  ) {
    turns.pop()
  }

  for (const turn of turns) {
    messages.push({
      role: turn.role === 'her' ? 'assistant' : 'user',
      content: turn.text,
    })
  }

  const finalContent = finalFor(packet)
  if (finalContent) {
    messages.push({ role: 'user', content: finalContent })
  }

  return normalizeMessages(messages)
}

function normalizeMessages(messages) {
  const out = []
  for (const msg of messages) {
    const content = String(msg.content ?? '').trim()
    if (!content) continue
    const role = msg.role === 'assistant' ? 'assistant' : 'user'
    if (out.length === 0) {
      if (role !== 'user') continue
      out.push({ role, content })
      continue
    }
    const last = out[out.length - 1]
    if (last.role === role) {
      last.content = `${last.content}\n\n${content}`
    } else {
      out.push({ role, content })
    }
  }
  while (out.length > 0 && out[out.length - 1].role !== 'user') {
    out.pop()
  }
  return out
}

function readJson(text) {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start < 0 || end <= start) return null
  try {
    return JSON.parse(text.slice(start, end + 1))
  } catch {
    return null
  }
}

function momentOf(value) {
  const key = typeof value === 'string' ? value.trim().toLowerCase() : ''
  return MOMENTS.has(key) ? key : 'talk'
}

function gestureOf(value, awakened) {
  if (!awakened) return undefined
  const key = typeof value === 'string' ? value.trim().toLowerCase() : ''
  return GESTURES.has(key) ? key : undefined
}

function lineField(text) {
  const match = String(text ?? '').match(/"line"\s*:\s*"((?:\\.|[^"\\])*)/)
  if (!match) return ''
  try {
    return JSON.parse(`"${match[1]}"`)
  } catch {
    return match[1].replace(/\\n/g, ' ').replace(/\\"/g, '"')
  }
}

function contentWords(text) {
  return String(text ?? '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 4 && !FACT_STOPWORDS.has(word))
}

function compareKey(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function contentTokens(text) {
  return [...new Set(compareKey(text).split(' ').filter((word) => word.length > 3))]
}

function linesSame(a, b) {
  const left = compareKey(a)
  const right = compareKey(b)
  if (!left || !right) return false
  if (left === right) return true
  if (left.length > 12 && right.length > 12 && (left.includes(right) || right.includes(left))) return true
  const leftWords = contentTokens(a)
  const rightWords = contentTokens(b)
  if (!leftWords.length || !rightWords.length) return false
  const rightSet = new Set(rightWords)
  let shared = 0
  for (const word of leftWords) {
    if (rightSet.has(word)) shared += 1
  }
  const smaller = Math.min(leftWords.length, rightWords.length)
  return shared * 5 >= smaller * 4
}

function repeatsPrior(line, packet) {
  const priors = []
  if (packet?.line) priors.push(packet.line)
  if (Array.isArray(packet?.recent)) {
    for (const prior of packet.recent) {
      if (prior) priors.push(prior)
    }
  }
  return priors.some((prior) => linesSame(line, prior))
}

function guardGesture(gesture, packet) {
  if (!gesture) return gesture
  const outcome = String(packet?.outcome ?? '')
  const refused = /refus|asleep|too tired|too much|not in the mood|declin|lost/i.test(outcome)
  const cheerKept = packet?.kind === 'scrap' && /\bwon\b/i.test(outcome)
  if (refused && LOUD_GESTURES.has(gesture) && !(gesture === 'cheer' && cheerKept)) {
    gesture = 'pout'
  }
  if ((packet?.kind === 'hunger' || packet?.kind === 'miss') && (gesture === 'eat' || gesture === 'cheer')) {
    gesture = 'shy'
  }
  return gesture
}

function acceptFact(fact, packet) {
  if (typeof fact !== 'string') return ''
  const clipped = String(fact).replace(/\s+/g, ' ').trim()
  if (clipped.length < 8 || clipped.length > 90) return ''
  if (/\b(wallet|dna|awakening|awakened|trust|scrap|token|fight)\b/i.test(clipped)) return ''
  const line = String(packet?.line ?? '')
  if (clipped.toLowerCase() === line.toLowerCase()) return ''
  const known = new Set(contentWords(line))
  if (!contentWords(clipped).some((word) => known.has(word))) return ''
  return clip(clipped, 90)
}

function readReply(text, awakened, packet) {
  const limit = awakened ? 320 : 120
  const parsed = readJson(text)
  const fromJson =
    typeof parsed?.line === 'string' ? clip(stripStageDirections(parsed.line), limit) : ''
  const salvaged = fromJson || clip(stripStageDirections(lineField(text)), limit)
  if (salvaged) {
    if (repeatsPrior(salvaged, packet)) return null
    const reply = { line: salvaged, moment: momentOf(parsed?.moment) }
    if (awakened) {
      reply.gesture = guardGesture(
        gestureOf(parsed?.gesture, awakened) || inferGesture(salvaged, packet),
        packet,
      )
      if (packet?.kind === 'talk') {
        const fact = acceptFact(parsed?.fact, packet)
        if (fact) reply.fact = fact
      }
    }
    return reply
  }
  const plain = clip(stripStageDirections(String(text).replace(/```[\s\S]*?```/g, ' ')), limit)
  if (!plain || plain.includes('{') || plain.includes('}')) return null
  if (repeatsPrior(plain, packet)) return null
  if (awakened) {
    return { line: plain, moment: 'talk', gesture: guardGesture(inferGesture(plain, packet), packet) }
  }
  return { line: plain, moment: 'talk' }
}

async function claude(packet) {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null
  const awakened = packet.awakened
  const messages = buildClaudeMessages(packet)
  if (!messages.length || messages[messages.length - 1].role !== 'user') return null
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2026-10-21',
    },
    signal: AbortSignal.timeout(12000),
    body: JSON.stringify({
      model: awakened ? lilyModel : catModel,
      max_tokens: awakened ? 280 : 120,
      messages,
    }),
  })
  if (!response.ok) {
    const detail = await response.text()
    console.error('anthropic', response.status, detail.slice(0, 300))
    return null
  }
  const data = await response.json()
  const text = Array.isArray(data.content)
    ? data.content
        .filter((block) => !block.type || block.type === 'text')
        .map((block) => block.text || '')
        .join('')
    : ''
  const heard = readReply(text, awakened, packet)
  if (!heard) {
    console.error('anthropic unreadable', text.slice(0, 300))
    return null
  }
  return { ...heard, voice: awakened ? 'sonnet' : 'haiku' }
}

function send(res, status, body) {
  const raw = JSON.stringify(body)
  res.writeHead(status, {
    'content-type': 'application/json',
    'cache-control': 'no-store',
  })
  res.end(raw)
}

function pathOnly(url) {
  return (url || '/').split('?')[0]
}

function talkAllowed(packet) {
  if (
    packet.kind === 'return' ||
    packet.kind === 'hunger' ||
    packet.kind === 'miss' ||
    packet.kind === 'promise' ||
    packet.kind === 'aside' ||
    packet.kind === 'wake' ||
    packet.kind === 'awaken' ||
    packet.kind === 'pet' ||
    packet.kind === 'feed' ||
    packet.kind === 'play' ||
    packet.kind === 'call' ||
    packet.kind === 'laugh' ||
    packet.kind === 'scold' ||
    packet.kind === 'tidy' ||
    packet.kind === 'scrap'
  ) {
    return true
  }
  return Boolean(packet.line)
}

const server = createServer(async (req, res) => {
  if (req.method === 'GET' && pathOnly(req.url) === '/api/health') {
    send(res, 200, { ok: true, ready: Boolean(process.env.ANTHROPIC_API_KEY), ...archStatus() })
    return
  }
  const route = pathOnly(req.url)
  if (route === '/api/life') {
    await handleLifeRequest(req, res)
    return
  }
  if (route === '/api/stream') {
    handleStream(req, res)
    return
  }
  if (route === '/api/hatch') {
    await handleHatchRequest(req, res)
    return
  }
  if (route === '/api/gallery') {
    await handleGallery(req, res)
    return
  }
  if (req.method !== 'POST' || route !== '/api/talk') {
    send(res, 404, { ok: false })
    return
  }
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > 48000) {
      send(res, 413, { ok: false, fallback: true })
      return
    }
    chunks.push(chunk)
  }
  let body
  try {
    body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
  } catch {
    send(res, 400, { ok: false, fallback: true })
    return
  }
  const packet = packetOf(body)
  if (!talkAllowed(packet)) {
    send(res, 200, { ok: false, fallback: true })
    return
  }
  const counted = packet.kind === 'talk'
  if (counted && !capRoom(packet.creatureId, packet.awakened)) {
    send(res, 200, { ok: false, fallback: true, reason: 'cap' })
    return
  }
  try {
    const heard = await claude(packet)
    if (!heard) {
      send(res, 200, { ok: false, fallback: true })
      return
    }
    if (counted) spendCap(packet.creatureId, packet.awakened)
    send(res, 200, { ok: true, ...heard })
  } catch {
    send(res, 200, { ok: false, fallback: true })
  }
})

await openBus()
await openLife()

server.listen(port, '127.0.0.1', () => {
  const ready = Boolean(process.env.ANTHROPIC_API_KEY)
  const arch = archStatus()
  console.log(
    `talk server on http://127.0.0.1:${port} ${ready ? 'with a key' : 'script fallback, no key yet'} life=${arch.life} bus=${arch.bus}`,
  )
})
