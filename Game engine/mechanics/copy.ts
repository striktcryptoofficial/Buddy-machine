import type { BuddyState, Mood, TraitKey, Traits } from './types'
import { TRAIT_KEYS } from './types'
import { lilyCue, type LilyCue } from './lilyPick'

export const TRAIT_LABEL: Record<TraitKey, string> = {
  mischief: 'Mischief',
  affection: 'Affection',
  introversion: 'Introversion',
  vigor: 'Vigor',
  curiosity: 'Curiosity',
  independence: 'Independence',
}

const DRIFT: Record<TraitKey, [string, string]> = {
  mischief: ['more mischievous', 'gentler'],
  affection: ['more affectionate', 'more reserved'],
  introversion: ['more introverted', 'more outgoing'],
  vigor: ['more energetic', 'lazier'],
  curiosity: ['more curious', 'less nosy'],
  independence: ['more independent', 'more willing'],
}

export const MOOD_COLOR: Record<Mood, string> = {
  happy: '#e6a423',
  sad: '#7f93b2',
  angry: '#e15a3a',
  sleepy: '#9a86c4',
  excited: '#ef7a3a',
  curious: '#2f9e90',
  affectionate: '#e56b8a',
  lonely: '#6d86a8',
  bored: '#b08968',
  content: '#6a9a5b',
}

export function archetype(traits: Traits) {
  if (traits.mischief > 0.62 && traits.curiosity > 0.52) return 'Mischievous'
  if (traits.affection > 0.64 && traits.introversion < 0.48) return 'Affectionate'
  if (traits.introversion > 0.66) return 'Introverted'
  if (traits.vigor < 0.34) return 'Languid'
  if (traits.vigor > 0.7 && traits.curiosity > 0.5) return 'Adventurous'
  if (traits.curiosity > 0.68) return 'Curious'
  if (traits.independence > 0.66) return 'Independent'
  if (traits.affection > 0.6) return 'Soft'
  let best: TraitKey = 'affection'
  for (const key of TRAIT_KEYS) if (traits[key] > traits[best]) best = key
  return {
    mischief: 'Mischievous',
    affection: 'Affectionate',
    introversion: 'Introverted',
    vigor: 'Lively',
    curiosity: 'Curious',
    independence: 'Independent',
  }[best]
}

export function developmentLine(buddy: BuddyState) {
  let best: TraitKey = 'affection'
  let bestAbs = 0
  for (const key of TRAIT_KEYS) {
    const delta = Math.abs(buddy.personality[key] - buddy.basePersonality[key])
    if (delta > bestAbs) {
      best = key
      bestAbs = delta
    }
  }
  if (bestAbs < 0.035) return 'Still close to the temper they hatched with.'
  const delta = buddy.personality[best] - buddy.basePersonality[best]
  const phrase = delta > 0 ? DRIFT[best][0] : DRIFT[best][1]
  return `Growing ${phrase}.`
}

export function hungerWord(value: number) {
  if (value < 0.25) return 'Fed'
  if (value < 0.5) return 'Peckish'
  if (value < 0.75) return 'Hungry'
  return 'Starving'
}

export function energyWord(value: number) {
  if (value < 0.25) return 'Spent'
  if (value < 0.45) return 'Drowsy'
  if (value < 0.75) return 'Steady'
  return 'Restless'
}

export function happinessWord(value: number) {
  if (value < 0.3) return 'Low'
  if (value < 0.55) return 'Okay'
  if (value < 0.78) return 'Bright'
  return 'Glowing'
}

export function curiosityWord(value: number) {
  if (value < 0.3) return 'Quiet'
  if (value < 0.55) return 'Interested'
  if (value < 0.78) return 'Nosy'
  return 'Fixated'
}

export function lonelinessWord(value: number) {
  if (value < 0.28) return 'Cosy'
  if (value < 0.5) return 'Missing you'
  if (value < 0.75) return 'Lonely'
  return 'Forgotten'
}

export function trustWord(value: number) {
  if (value < 0.22) return 'Wary'
  if (value < 0.4) return 'Cautious'
  if (value < 0.6) return 'Warming'
  if (value < 0.8) return 'Trusting'
  return 'Devoted'
}

export function formatAge(createdAt: number, now: number) {
  const seconds = (now - createdAt) / 1000
  if (seconds < 45) return 'just hatched'
  if (seconds < 3600) return `${Math.max(1, Math.floor(seconds / 60))} min old`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr old`
  const days = Math.floor(seconds / 86400)
  return days === 1 ? '1 day old' : `${days} days old`
}

export function formatWhen(at: number, now: number) {
  const seconds = Math.max(0, (now - at) / 1000)
  if (seconds < 20) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

/** One line per cue, describing only what that cue actually shows. `{name}` becomes her name. */
const CUE_CAPTIONS: Record<LilyCue, string[]> = {
  still: [
    '{name} is here, arms crossed, keeping you company.',
    'She stands with her arms folded, quiet.',
    '{name} says nothing, and stays anyway.',
    'Arms crossed, no hurry to be anywhere else.',
    'Quiet company, which is enough.',
    '{name} is just here with you.',
  ],
  sleepy: [
    '{name} has her eyes closed, arms folded, resting.',
    'She is resting with her eyes shut.',
    'Eyes closed. {name} is letting the moment be slow.',
    '{name} rests, arms folded, almost asleep on her feet.',
    'She has gone quiet and heavy-lidded.',
  ],
  yawn: [
    '{name} yawns, then settles again.',
    'A long yawn, and back to resting.',
    'She yawned before she could stop herself.',
    '{name} yawns and pretends she did not.',
    'That was a real yawn. She rests after it.',
  ],
  rub: [
    '{name} rubs one eye, then rests.',
    'She rubs an eye and lets her hand drop.',
    'One eye rubbed, and she is quiet again.',
    '{name} rubs the sleep out of one eye.',
    'She rubs an eye like the day came too early.',
  ],
  eat: [
    '{name} is eating, saying nothing.',
    'She eats like someone hungrier than she had admitted.',
    '{name} is eating, and for once completely focused.',
    'Food first. {name} will talk after.',
    'She pauses between bites, pleased with herself.',
  ],
  full: [
    '{name} is too full, and pouting about it.',
    'She has eaten too much and the pout says so.',
    'Too full. {name} pouts at you.',
    'She could not manage another bite, and she is sulking.',
    '{name} pouts, full and faintly regretful.',
  ],
  wave: [
    '{name} waves at you.',
    'She waves hello.',
    '{name} sees you and waves.',
    'A wave, and a hello to go with it.',
    'She lifts a hand and says hi.',
  ],
  talk: [
    '{name} is telling you something.',
    'She is talking, and in no rush to finish.',
    '{name} has things to say.',
    'She is mid-sentence and enjoying it.',
    '{name} talks to you about nothing in particular.',
  ],
  blush: [
    '{name} has gone pink in the cheeks.',
    'Her cheeks warm and she looks away.',
    '{name} blushes and hopes you missed it.',
    'She has gone red, and knows it.',
    'A shy look, and colour in her cheeks.',
  ],
  flirt: [
    '{name} makes a little gesture, just for you.',
    'That was a flirt, and she is not denying it.',
    'She flirts, quietly pleased with herself.',
    '{name} aims something sweet in your direction.',
    'A small flirt, and a look to see if it landed.',
  ],
  wink: [
    '{name} winks at you.',
    'She winks, as if you are both in on it.',
    'A wink. Make of it what you like.',
    '{name} winks and leaves it there.',
    'She catches your eye and winks.',
  ],
  nod: [
    '{name} nods.',
    'She nods along with you.',
    'A nod. She agrees.',
    '{name} nods, settled on it.',
    'She nods, and that is her answer.',
  ],
  no: [
    '{name} shakes her head.',
    'She shakes her head. Not this time.',
    'A shake of her head. The answer is no.',
    '{name} shakes her head, politely but firmly.',
    'No, and she is not going to argue about it.',
  ],
  angry: [
    '{name} has her fists up and she means it.',
    'Fists clenched. She is cross with you.',
    'She is angry, and not hiding it.',
    '{name} balls her fists, waiting on an apology.',
    'That was the wrong thing to do, and her fists say so.',
  ],
  cry: [
    '{name} is crying.',
    'There are tears, and she is not wiping them.',
    'She has started crying.',
    '{name} cries quietly.',
    'Tears. Whatever that was, it hurt.',
  ],
  laugh: [
    '{name} laughs quietly.',
    'A small laugh she could not hold in.',
    'She laughs, quiet and genuine.',
    '{name} is laughing to herself.',
    'That got a quiet laugh out of her.',
  ],
  idea: [
    '{name} is working something out.',
    'A thought has arrived, and she is turning it over.',
    'She is puzzling over something.',
    '{name} has a question she has not asked yet.',
    'Something just occurred to her.',
  ],
  silly: [
    '{name} makes a silly face at you.',
    'She pulls a face, entirely unserious.',
    'A ridiculous face, held slightly too long.',
    '{name} is being silly on purpose.',
    'She makes a face and waits for a reaction.',
  ],
  listen: [
    '{name} drops her arms and listens.',
    'She is listening, properly, to all of it.',
    'Arms down, full attention. She is listening.',
    '{name} listens like whatever you say next matters.',
    'She lets her arms fall and gives you the floor.',
  ],
  shy: [
    '{name} has gone shy.',
    'She looks away the moment you look at her.',
    'Too shy for words just now.',
    '{name} shrinks back a little, suddenly bashful.',
    'She has gone shy and is studying the floor.',
  ],
  annoyed: [
    '{name} pouts, annoyed with you.',
    'An annoyed little pout, aimed your way.',
    'She is irritated, and pouting about it.',
    '{name} pulls a sour face. You did something.',
    'That annoyed her, and the pout is proof.',
  ],
  scared: [
    '{name} startles, hands up.',
    'She jumps, hands raised.',
    'Hands up. Something spooked her.',
    '{name} flinches back, startled.',
    'That frightened her, and her hands shot up.',
  ],
  cheer: [
    '{name} cheers for you.',
    'She cheers, delighted.',
    'A proper cheer, arms and all.',
    '{name} is celebrating something.',
    'She cheers like you just won something.',
  ],
  scheme: [
    '{name} has a scheming look about her.',
    'She is plotting something small and harmless.',
    'That is a scheming face if ever there was one.',
    '{name} is up to something, and letting it show.',
    'She smirks like she has already decided something.',
  ],
  facepalm: [
    '{name} puts a hand over her face.',
    'A hand to her face. She cannot believe you.',
    'She covers her face with one hand.',
    '{name} facepalms, slowly.',
    'Hand over eyes. That one earned it.',
  ],
}

function stableLine(buddy: BuddyState, salt: number, lines: string[]) {
  const n = Math.abs(Math.floor(buddy.lifeSeed) + salt + Math.floor(buddy.actionStartedAt / 1000))
  return lines[n % lines.length]
}

/** Lily sequences can flash eat or angry beats during talk; captions follow engine action. */
function captionCue(buddy: BuddyState, now: number): LilyCue {
  let cue = lilyCue(buddy, now)
  const action = buddy.action
  if (cue === 'eat' && action !== 'eat') cue = 'still'
  if (cue === 'full' && action !== 'stuffed') cue = action === 'sit' || action === 'chill' ? 'still' : cue
  if (cue === 'angry' && (action === 'sit' || action === 'chill')) cue = 'still'
  return cue
}

function interactionCaption(buddy: BuddyState, now: number): string | null {
  const name = buddy.name
  const r = buddy.reason
  if (now < buddy.scoldedUntil) {
    return stableLine(buddy, 0x5c01d, [
      `${name} is taking a scolding.`,
      `${name} is quiet after you scolded her.`,
      `${name} is sulking about the cup.`,
      `${name} is smarting from a scolding.`,
    ])
  }
  if (/put the cup back/i.test(r)) {
    return stableLine(buddy, 0x71d0, [
      `${name} is glad you tidied the cup.`,
      `${name} is staying close after you tidied up.`,
      `${name} is pleased you fixed the cup.`,
    ])
  }
  if (/nothing to tidy|already upright/i.test(r)) {
    return stableLine(buddy, 0x71e0, [
      `${name} is listening while you fuss the room.`,
      `${name} is watching you tidy nothing.`,
      `${name} is patient while you check the cup.`,
    ])
  }
  if (/no prank to laugh at|nothing to laugh at/i.test(r)) {
    return stableLine(buddy, 0x1aff, [
      `${name} is confused about the laughing.`,
      `${name} is wondering what is funny.`,
      `${name} did not get the joke.`,
    ])
  }
  if (/pleased with herself|praised for the cup|laughed at the cup/i.test(r)) {
    return stableLine(buddy, 0x1a09, [
      `${name} is grinning about the cup.`,
      `${name} is pleased you laughed at the cup.`,
      `${name} is smug about the spill.`,
    ])
  }
  if (/She noticed you came back\./i.test(r)) {
    return `${name} noticed you came back.`
  }
  if (/She is still waiting on what you promised\./i.test(r)) {
    return `${name} brought up what you promised.`
  }
  if (/eating what you promised/i.test(r)) {
    return `${name} is eating what you promised.`
  }
  if (/She is playing what you promised\./i.test(r)) {
    return `${name} is playing what you promised.`
  }
  if (/She stayed close, the way you promised\./i.test(r)) {
    return `${name} stayed close, the way you promised.`
  }
  if (/She heard you keep your promise\./i.test(r)) {
    return `${name} heard you keep your promise.`
  }
  if (/Called, and she kept sleeping|Called, and the nap won/i.test(r)) {
    return `${name} is asleep despite your call.`
  }
  if (/heard you and stayed put|chose not to come/i.test(r)) {
    return `${name} is ignoring your call.`
  }
  if (/You called, and she is listening|worth the walk/i.test(r)) {
    return buddy.moving ? `${name} is coming when you call.` : `${name} is answering your call.`
  }
  if (/Offered food, and she was not hungry|not hungry enough to care|Not hungry\. She wants company/i.test(r)) {
    return `${name} is not hungry right now.`
  }
  if (/Asleep, and not interested in being woken|not interested in being convinced/i.test(r)) {
    return `${name} is asleep and ignoring pets.`
  }
  if (/Asleep, and not interested in food|Asleep, and the bowl can wait/i.test(r)) {
    return `${name} is asleep and not eating.`
  }
  if (/Too tired to eat|Too tired to eat;/i.test(r)) {
    return `${name} is too tired to eat.`
  }
  if (/Too tired for pets|Too tired for pets;/i.test(r)) {
    return `${name} is too tired for pets.`
  }
  if (/Too tired\. She is resting here|Too tired to play/i.test(r)) {
    return `${name} is too tired to play.`
  }
  if (/Asleep, and not up for play|Asleep, and play can wait/i.test(r)) {
    return `${name} is asleep and not playing.`
  }
  if (/Too full to play|Too full to play;/i.test(r)) {
    return `${name} is too full to play.`
  }
  if (/Too full, and keeping the talk short|Too full to chat much|Too full, and staying/i.test(r)) {
    return `${name} is too full to talk much.`
  }
  if (/Too tired, but she is listening|Too tired, and resting while you talk/i.test(r)) {
    return `${name} is too tired but listening.`
  }
  if (/You talked while she slept|talked while they napped/i.test(r)) {
    return `${name} is asleep while you talk.`
  }
  if (/You talked, and she stayed|talked, and they listened/i.test(r)) {
    return `${name} is talking with you.`
  }
  return null
}

/** Status lines name the owner. On the glass, that person is you. */
export function companyLine(reason: string, ownerName: string) {
  const name = ownerName.trim()
  if (!name || name.toLowerCase() === 'you') return reason
  return reason
    .replaceAll(`close to ${name}`, 'close to you')
    .replaceAll(`beside ${name}`, 'beside you')
    .replaceAll(`near ${name}`, 'near you')
    .replaceAll(`with ${name}`, 'with you')
}

export function actionCaption(buddy: BuddyState, now = Date.now()) {
  const name = buddy.name
  const fromCare = interactionCaption(buddy, now)
  if (fromCare) return fromCare
  if (buddy.awakenedAt) {
    const cue = captionCue(buddy, now)
    const pool = CUE_CAPTIONS[cue]
    const n = Math.abs(Math.floor(buddy.lifeSeed) + Math.floor(buddy.actionStartedAt / 1000))
    return pool[n % pool.length].replaceAll('{name}', name)
  }
  switch (buddy.action) {
    case 'wander':
      return `${name} is patrolling the room.`
    case 'sit':
      return `${name} is sitting with their own thoughts.`
    case 'chill':
      return `${name} is chilling.`
    case 'shy':
      return `${name} is feeling shy.`
    case 'refuse':
      return `${name} is refusing.`
    case 'angry':
      return `${name} is angry.`
    case 'sleep':
      return buddy.moving ? `${name} is heading for the cushion.` : `${name} is asleep.`
    case 'groom':
      return `${name} is washing a paw.`
    case 'approach':
      return buddy.moving ? `${name} is coming over.` : `${name} is staying close.`
    case 'window':
      return `${name} is watching the window.`
    case 'knock':
      return buddy.cupTipped ? `${name} has opinions about the cup.` : `${name} is sizing up the cup.`
    case 'chase':
      return `${name} is chasing the yarn.`
    case 'zoomies':
      return `${name} has the zoomies.`
    case 'sniff':
      return `${name} is investigating a smell.`
    case 'attend':
      return `${name} is listening.`
    case 'ignore':
      return `${name} is pretending you are not there.`
    case 'eat':
      return buddy.moving ? `${name} is heading to the bowl.` : `${name} is eating.`
    case 'playWithYou':
      return `${name} is playing with you.`
    case 'flop':
      return `${name} is playing dead.`
    case 'stuffed':
      return `${name} is too full.`
    default: {
      const _never: never = buddy.action
      return _never
    }
  }
}
