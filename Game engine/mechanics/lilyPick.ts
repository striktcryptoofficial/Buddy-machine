import type { BuddyState, LilyGesture } from './types'
import { LILY_CLIPS } from './lilyCatalog'
import type { LilyClip } from './lilyTypes'

export type LilyMoment = 'live' | 'talk' | 'approach' | 'win' | 'loss' | 'awaken' | 'eat' | 'sleep'
export type LilyPose = 'crossed' | 'free'
export type LilyBeat = { clip: LilyClip; play: 'loop' | 'once'; passes: number }

const HIGH = 0.62

const VALID_SPEECH_GESTURES = new Set<LilyGesture>([
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

function clipsIn(group: string): LilyClip[] {
  return LILY_CLIPS.filter(c => c.group === group)
}

/**
 * Pick from a group: exact id match on a fragment first, then first id that includes it,
 * then the first clip in the group. Never returns undefined; throws if the group is empty.
 */
function pick(group: string, ...fragments: string[]): LilyClip {
  const pool = clipsIn(group)
  if (pool.length === 0) throw new Error(`Lily clip group is empty or missing: ${group}`)
  for (const fragment of fragments) {
    const exact = pool.find((clip) => clip.id === fragment)
    if (exact) return exact
    const ranked = pool
      .filter((clip) => clip.id.endsWith(fragment) || clip.id.endsWith(`-${fragment}`))
      .sort((a, b) => a.id.length - b.id.length)
    if (ranked.length) return ranked[0]
  }
  throw new Error(`No Lily clip in ${group} for ${fragments.join(', ')}`)
}

/** Deterministic choice from options using the buddy's life seed. */
function choose<T>(buddy: BuddyState, options: readonly T[], salt = 0): T {
  const seed = Math.abs(Math.floor(buddy.lifeSeed)) + salt
  return options[seed % options.length]
}

export function lilyClipById(id: string): LilyClip {
  const clip = LILY_CLIPS.find(c => c.id === id)
  if (!clip) throw new Error(`Unknown Lily clip id: ${id}`)
  return clip
}

export function everyLilyClip(): readonly LilyClip[] {
  return LILY_CLIPS
}

export function clipGroups(): Record<string, LilyClip[]> {
  const groups: Record<string, LilyClip[]> = {}
  for (const clip of LILY_CLIPS) {
    ;(groups[clip.group] ??= []).push(clip)
  }
  return groups
}

function clip(group: string, fragment: string): LilyClip {
  return pick(group, fragment)
}

/** Where her arms are when a clip starts. Transitions are the glue between crossed and free. */
export function lilyStartPose(item: LilyClip): LilyPose {
  const id = item.id
  if (id.includes('unfolding')) return 'crossed'
  if (id.includes('crossing-arms') || id.includes('neutral-to-crossing')) return 'free'
  if (id.includes('happy-cheer') || id.includes('idea-finger-up') || id.includes('threaten-threaten')) return 'crossed'
  if (id.includes('crying-two-hands') || id.includes('crying-wipe')) return 'crossed'
  if (id.endsWith('disapprove-shake-head')) return 'crossed'
  if (id.includes('tired-sleepy') && !id.includes('yawn') && !id.includes('rubbing')) return 'crossed'
  if (id.includes('talk-talk-') && !id.includes('wave')) return id.endsWith('-2') ? 'free' : 'crossed'
  if (id.includes('idle-crossed-arms-idle-')) return 'crossed'
  if (id.includes('wink-wink') || id.includes('static-static')) return 'crossed'
  return 'free'
}

export function lilyEndPose(item: LilyClip): LilyPose {
  const id = item.id
  if (id.includes('unfolding')) return 'free'
  if (id.includes('crossing-arms') || id.includes('neutral-to-crossing')) return 'crossed'
  if (id.includes('happy-cheer') || id.includes('idea-finger-up') || id.includes('threaten-threaten')) return 'free'
  if (id.includes('crying-two-hands')) return 'free'
  if (id.includes('crying-wipe')) return 'crossed'
  return lilyStartPose(item)
}

function once(item: LilyClip, passes = 2): LilyBeat {
  return { clip: item, play: 'once', passes }
}

function loop(item: LilyClip): LilyBeat {
  return { clip: item, play: 'loop', passes: 1 }
}

function unfold(): LilyBeat {
  return once(clip('Transitions', 'transition-unfolding-arms'), 1)
}

function cross(soft: boolean): LilyBeat {
  return once(clip('Transitions', soft ? 'transition-neutral-to-crossing-arms' : 'transition-crossing-arms'), 1)
}

function softGesture(id: string) {
  return /blush|nod-|wink|hair-tuck|quiet-laugh|facepalm|finger-up|fish-face|disapprove|shake-head|scared|yawn|scheming|evil-smirk|rubbing/.test(id)
}

/** One or more gestures, then a resting loop. Arms fold and unfold only when the pose actually changes. */
function burst(buddy: BuddyState, clips: LilyClip[], after?: LilyBeat): LilyBeat[] {
  const home = after ?? restBeat(buddy)
  const beats: LilyBeat[] = []
  let pose: LilyPose = 'crossed'
  for (const item of clips) {
    const start = lilyStartPose(item)
    if (pose !== start) beats.push(start === 'free' ? unfold() : cross(softGesture(item.id)))
    beats.push(once(item, 2))
    pose = lilyEndPose(item)
  }
  const afterPose = lilyStartPose(home.clip)
  if (pose !== afterPose) beats.push(pose === 'free' ? cross(clips.every((item) => softGesture(item.id))) : unfold())
  beats.push(home)
  return beats
}

function hold(item: LilyClip): LilyBeat[] {
  return lilyStartPose(item) === 'free' ? [unfold(), loop(item)] : [loop(item)]
}

function restBeat(buddy: BuddyState): LilyBeat {
  const n = (Math.abs(Math.floor(buddy.lifeSeed)) % 7) + 1
  return loop(clip('Idle', `idle-crossed-arms-idle-${n}`))
}

/** Calm idle with optional one-shot yawn or eye rub, then crossed-arm rest. */
function restBeats(buddy: BuddyState): LilyBeat[] {
  const home = restBeat(buddy)
  const flavor = restFlavor(buddy)
  if (flavor === 'yawn') return burst(buddy, [clip('Tired', 'yawn')], home)
  if (flavor === 'rub') return burst(buddy, [clip('Tired', 'sleepy-rubbing-eyes')], home)
  return [home]
}

function listenBeat(buddy: BuddyState): LilyBeat {
  const n = (Math.abs(Math.floor(buddy.lifeSeed)) % 2) + 1
  return loop(clip('Idle', `idle-uncrossed-arms-idle-${n}`))
}

function talkClip(tone: 'calm' | 'shy' | 'annoyed' | 'excited', arms: LilyPose): LilyClip {
  return clip('Talk', arms === 'free' ? `talk-${tone}-2` : `talk-${tone}`)
}

function talkingRest(buddy: BuddyState) {
  return buddy.action === 'sit' || buddy.action === 'chill' || buddy.action === 'attend'
}

function talkTone(buddy: BuddyState, text: string): 'calm' | 'shy' | 'annoyed' | 'excited' {
  const p = buddy.personality
  const angryMood = buddy.mood === 'angry' && !talkingRest(buddy)
  if (/\bno\b|not right|easy|too much|stop|busy|angry|mad/.test(text) || angryMood || buddy.mood === 'bored') return 'annoyed'
  if (buddy.mood === 'sleepy' || buddy.mood === 'sad' || buddy.mood === 'lonely' || p.introversion > HIGH) return 'shy'
  if (
    buddy.mood === 'excited' ||
    buddy.mood === 'happy' ||
    buddy.mood === 'affectionate' ||
    p.vigor > 0.72 ||
    /watch this|happy you are here|love|kiss|flirt/.test(text)
  ) {
    return 'excited'
  }
  return 'calm'
}

/** Arms stay crossed unless a gesture already put them down. Standing here never unfolds just to talk. */
function voice(buddy: BuddyState, text: string, arms: LilyPose = 'crossed'): LilyBeat {
  return loop(talkClip(talkTone(buddy, text), arms))
}

function waveClip(buddy: BuddyState): LilyClip {
  if (buddy.personality.affection > 0.75) return clip('Waving', 'waving-two-hands')
  if (buddy.personality.affection > 0.45) return clip('Waving', 'waving-smile')
  return clip('Waving', 'waving-neutral')
}

function warmthClip(buddy: BuddyState): LilyClip {
  const p = buddy.personality
  if (p.affection > 0.82) return choose(buddy, [clip('Blow-Kiss', 'blow-kiss'), ...clipsIn('Flirt')])
  if (p.mischief > 0.7) return choose(buddy, [clip('Blush', 'blush-teasing'), clip('Blush', 'blush-evil')], 3)
  if (p.introversion > HIGH) return clip('Blush', 'blush-flustered')
  if (p.affection > 0.55) return clip('Blush', 'blush')
  return clip('Wink', 'wink')
}

function sillyClip(buddy: BuddyState): LilyClip {
  return choose(buddy, clipsIn('Silly'), buddy.counts.play + 1)
}

function linesTogether(buddy: BuddyState, text: string) {
  const hers = text.toLowerCase()
  const theirs = buddy.speech?.heard?.toLowerCase() ?? ''
  return `${hers}\n${theirs}`
}

function moodGesture(buddy: BuddyState, salt: number): LilyClip {
  switch (buddy.mood) {
    case 'sleepy':
      return clip('Tired', 'yawn')
    case 'sad':
    case 'lonely':
      return buddy.needs.loneliness > 0.55 ? clip('Cry', 'crying-wipe') : clip('Blush', 'blush-shy')
    case 'angry':
      return clip('Disapprove', 'disapprove-head-shake')
    case 'excited':
      return clip('Waving', 'waving-excited')
    case 'happy':
      return clip('Happy', 'cheer')
    case 'affectionate':
      return choose(buddy, [clip('Wink', 'wink'), clip('Blow-Kiss', 'blow-kiss'), ...clipsIn('Flirt')], salt)
    case 'curious':
      return clip('Confused', 'question-mark')
    case 'bored':
      return clip('Fish-Face', 'fish-face-pout')
    case 'content':
      return clip('Nod', 'nod-firm')
    default:
      return clip('Nod', 'nod-firm')
  }
}

/** Score her line plus what she heard into the strongest content gesture, if any. */
function bestContentGesture(said: string): LilyGesture | null {
  const scores = new Map<LilyGesture, number>()
  const bump = (gesture: LilyGesture, points: number, re: RegExp) => {
    if (re.test(said)) scores.set(gesture, (scores.get(gesture) ?? 0) + points)
  }

  bump('yawn', 4, /tired|sleepy|yawn|\bnap\b|rest my eyes/)
  bump('eat', 4, /hunger|hungry|\bfood\b|\bbowl\b|\btreat\b|starving|\beat\b/)
  bump('kiss', 5, /\bkiss\b|lean in|come closer/)
  bump('flirt', 4, /flirt|cute|darling|\bheart\b|adore/)
  bump('kiss', 3, /love|miss you|missed you|come here|say that again|sweet|that close|i like it|stay\. right|forgive/)
  bump('cry', 4, /\bsad\b|lonely|\bcry\b|\balone\b/)
  bump('angry', 5, /\bno\b|not right|not like that|should not|too much|busy|easy|\bstop\b|\bangry\b|\bmad\b/)
  bump('angry', 3, /cannot say that|walk off/)
  bump('wave', 4, /there you are|it is you|hello|\bhi[,.\s]|hey[.\s]|i'm here|i am here|i was waiting\./)
  bump('question', 4, /what do you actually mean|\?/)
  bump('question', 3, /i have an idea|i was thinking|tell me the rest/)
  bump('silly', 4, /watch this|watch me|\bplay\b/)
  bump('shy', 3, /thank you|give me a second|\.\.\.okay/)
  bump('shy', 2, /\.\.\.fine|i heard you/)
  bump('pout', 3, /\bbored\b|whatever|don't care|meh/)
  bump('cheer', 3, /happy|glad|yay|wonderful|great job/)
  bump('cheer', 2, /quiet went on too long|i like when you laugh/)
  bump('silly', 2, /i have a better idea|was thinking about you|took your time/)
  bump('nod', 9, /you came back|you brought|you did|still waiting|promis|bring you fish|i kept this/)
  bump('nod', 2, /i am listening|go on|say more|say it again|^mm\.?$/)

  const tieBreak: LilyGesture[] = [
    'kiss',
    'flirt',
    'cry',
    'angry',
    'yawn',
    'eat',
    'wave',
    'question',
    'silly',
    'cheer',
    'shy',
    'pout',
    'nod',
  ]
  let bestScore = 0
  for (const gesture of tieBreak) {
    const score = scores.get(gesture) ?? 0
    if (score > bestScore) bestScore = score
  }
  if (bestScore === 0) return null
  for (const gesture of tieBreak) {
    if ((scores.get(gesture) ?? 0) === bestScore) return gesture
  }
  return null
}

function clipForGesture(buddy: BuddyState, gesture: LilyGesture): LilyClip | null {
  switch (gesture) {
    case 'yawn':
      return clip('Tired', 'yawn')
    case 'sleep':
      return clip('Tired', 'yawn')
    case 'eat': {
      if (buddy.action !== 'eat') return null
      return buddy.personality.affection >= buddy.personality.mischief
        ? clip('Eat', 'eat-cookie')
        : clip('Eat', 'eat-onigiri')
    }
    case 'flirt':
      return choose(buddy, clipsIn('Flirt'))
    case 'wink':
      return clip('Wink', 'wink')
    case 'kiss':
      return clip('Blow-Kiss', 'blow-kiss')
    case 'cry':
      return clip('Cry', 'crying-wipe')
    case 'angry':
      if (talkingRest(buddy)) return null
      return clip('Disapprove', 'disapprove-head-shake')
    case 'wave':
      if (buddy.mood === 'excited' || buddy.mood === 'happy') return clip('Waving', 'waving-excited')
      if (buddy.personality.introversion > HIGH) return clip('Waving', 'waving-shy')
      return waveClip(buddy)
    case 'cheer':
      return clip('Happy', 'cheer')
    case 'nod':
      return clip('Nod', 'nod-firm')
    case 'pout':
      return clip('Fish-Face', 'fish-face-pout')
    case 'question':
      return clip('Confused', 'question-mark')
    case 'shy':
      return clip('Blush', 'blush-shy')
    case 'silly':
      return sillyClip(buddy)
    case 'talk':
      return null
    default:
      return null
  }
}

function afterVoice(buddy: BuddyState, said: string, item: LilyClip): LilyBeat {
  const tone = talkTone(buddy, said)
  return loop(talkClip(tone, lilyEndPose(item) === 'free' ? 'free' : 'crossed'))
}

function lineBeats(buddy: BuddyState, text: string): LilyBeat[] {
  const said = linesTogether(buddy, text)
  const crossed = voice(buddy, said, 'crossed')
  const open = voice(buddy, said, 'free')
  const voiceAfter = (item: LilyClip) =>
    burst(buddy, [item], lilyEndPose(item) === 'free' ? open : crossed)

  const hinted = buddy.speech?.gesture
  const fromWords = bestContentGesture(said)
  if (hinted && VALID_SPEECH_GESTURES.has(hinted)) {
    if (hinted === 'talk') return [crossed]
    // A client sends nod on every line. It only plays when the line has no stronger gesture.
    if (hinted === 'nod') {
      if (fromWords && fromWords !== 'nod') {
        const stronger = clipForGesture(buddy, fromWords)
        if (stronger) return voiceAfter(stronger)
      } else {
        const nod = clipForGesture(buddy, 'nod')
        if (nod) return burst(buddy, [nod], afterVoice(buddy, said, nod))
      }
    } else {
      const item = clipForGesture(buddy, hinted)
      if (item) return burst(buddy, [item], afterVoice(buddy, said, item))
    }
  }

  if (fromWords) {
    const item = clipForGesture(buddy, fromWords)
    if (item) return voiceAfter(item)
  }

  if (talkingRest(buddy) && buddy.mood === 'angry') return [crossed]
  const gesture = moodGesture(buddy, said.length)
  return voiceAfter(gesture)
}

function cryBeats(buddy: BuddyState): LilyBeat[] {
  const deep = buddy.needs.loneliness > 0.55 || buddy.personality.affection > 0.6
  if (deep) return burst(buddy, [clip('Cry', 'crying-two-hands')], loop(clip('Cry', 'crying')))
  return burst(buddy, [clip('Cry', 'crying-wipe')])
}

type RestFlavor = 'still' | 'yawn' | 'rub'

/**
 * Rest is still. Once per action, and stable while the action lasts, it may be one yawn
 * (about one rest in five) or one eye rub (about one in six), never both.
 */
function restFlavor(buddy: BuddyState): RestFlavor {
  const n = Math.abs(Math.floor(buddy.lifeSeed) + Math.floor(buddy.actionStartedAt / 1000))
  if (n % 5 === 0) return 'yawn'
  if (n % 6 === 0) return 'rub'
  return 'still'
}

/** Sleep lives in the sleepy loop, which is already crossed-armed. */
function sleepBeats(buddy: BuddyState): LilyBeat[] {
  const sleepy = clip('Tired', 'sleepy')
  const flavor = restFlavor(buddy)
  if (flavor === 'yawn') return burst(buddy, [clip('Tired', 'yawn')], loop(sleepy))
  if (flavor === 'rub') return burst(buddy, [clip('Tired', 'sleepy-rubbing-eyes')], loop(sleepy))
  return hold(sleepy)
}

/** Petted and looking away: a blush, or the small wave she gives instead of words. */
function shyBeats(buddy: BuddyState): LilyBeat[] {
  return burst(buddy, [choose(buddy, [clip('Blush', 'blush-shy'), clip('Waving', 'waving-shy')])])
}

function eatBeats(buddy: BuddyState): LilyBeat[] {
  const item = buddy.personality.affection >= buddy.personality.mischief
    ? clip('Eat', 'eat-cookie')
    : clip('Eat', 'eat-onigiri')
  return hold(item)
}

function liveBeats(buddy: BuddyState): LilyBeat[] {
  switch (buddy.action) {
    case 'eat':
      return eatBeats(buddy)
    case 'stuffed':
      return burst(buddy, [clip('Fish-Face', 'fish-face-pout')])
    case 'sleep':
      return sleepBeats(buddy)
    case 'shy':
      return shyBeats(buddy)
    case 'refuse':
      return buddy.trust < 0.3
        ? burst(buddy, [clip('Scared', 'scared'), clip('Disapprove', 'disapprove-head-shake')])
        : burst(buddy, [clip('Disapprove', 'disapprove-head-shake'), clip('Disapprove', 'disapprove-tsk')])
    case 'angry':
      return buddy.trust < 0.35
        ? burst(buddy, [clip('Angry', 'fists')], loop(clip('Angry', 'fists-clenched')))
        : burst(buddy, [clip('Angry', 'fists')])
    case 'attend':
    case 'approach':
      return [unfold(), once(clip('Nod', 'nod-firm'), 2), listenBeat(buddy)]
    case 'ignore':
      return burst(buddy, [clip('Fish-Face', 'fish-face-annoyed')])
    case 'knock':
    case 'chase':
    case 'zoomies':
    case 'playWithYou':
      return burst(buddy, [sillyClip(buddy)])
    case 'groom':
      return hold(clip('Tired', 'sleepy-rubbing-eyes'))
    case 'window':
    case 'wander':
      return restBeats(buddy)
    case 'sniff':
      return [listenBeat(buddy)]
    case 'sit':
    case 'chill':
      if (buddy.mood === 'sleepy') return burst(buddy, [clip('Tired', 'yawn')], restBeat(buddy))
      if (buddy.mood === 'affectionate') return burst(buddy, [warmthClip(buddy)], restBeat(buddy))
      if (buddy.mood === 'lonely' && buddy.personality.introversion > HIGH) {
        return burst(buddy, [clip('Blush', 'blush-shy')], restBeat(buddy))
      }
      if (buddy.mood === 'sad' || buddy.mood === 'lonely') return burst(buddy, [clip('Cry', 'crying-wipe')], restBeat(buddy))
      if (buddy.mood === 'excited' || buddy.mood === 'happy') return burst(buddy, [clip('Happy', 'cheer')], restBeat(buddy))
      return restBeats(buddy)
    default:
      return restBeats(buddy)
  }
}

function winBeats(buddy: BuddyState): LilyBeat[] {
  if (buddy.personality.mischief > 0.55) {
    return burst(buddy, [choose(buddy, [clip('Taunt', 'taunt-beckon'), clip('Taunt', 'taunt-tongue-out'), clip('Threaten', 'threaten')])])
  }
  if (buddy.personality.affection > 0.72) return burst(buddy, [clip('Wink', 'wink')])
  return burst(buddy, [clip('Happy', 'cheer')])
}

function lossBeats(buddy: BuddyState): LilyBeat[] {
  const p = buddy.personality
  if (p.mischief > 0.6 && p.affection < 0.55) return burst(buddy, [clip('Facepalm', 'facepalm')])
  if (p.affection < 0.35 && p.introversion < 0.4) {
    return burst(buddy, [clip('Disapprove', 'disapprove-head-shake')])
  }
  return cryBeats(buddy)
}

export function lilyIntro(buddy: BuddyState, item: LilyClip): LilyClip | null {
  if (item.id.includes('idle-crossed-arms-idle-')) return null
  if (item.group !== 'Idle') return null
  const transitions = clipsIn('Transitions')
  if (!transitions.length) return null
  return transitions[Math.abs(Math.floor(buddy.lifeSeed)) % transitions.length]
}

export function lilyMomentFor(buddy: BuddyState, now = Date.now()): LilyMoment {
  const talking = Boolean(buddy.speech && now < buddy.speech.until)
  if (buddy.awakenedAt && now - buddy.awakenedAt < 1200) return 'awaken'
  if (buddy.clip === 'win' || buddy.clip === 'loss') return buddy.clip
  if (buddy.action === 'eat') return 'eat'
  if (buddy.action === 'sleep') return 'sleep'
  if (talking) {
    const hinted = buddy.speech?.moment
    if (hinted === 'eat' || hinted === 'sleep' || hinted === 'approach' || hinted === 'talk') return hinted
    return 'talk'
  }
  if (buddy.action === 'shy') return 'approach'
  return 'live'
}

export function lilySequence(buddy: BuddyState, moment: LilyMoment = 'live', now = Date.now()): { key: string; beats: LilyBeat[] } {
  let beats: LilyBeat[]
  switch (moment) {
    case 'awaken':
      beats = hold(clip('Static', 'static'))
      break
    case 'eat':
      beats = eatBeats(buddy)
      break
    case 'sleep':
      beats = sleepBeats(buddy)
      break
    case 'approach':
      beats = shyBeats(buddy)
      break
    case 'win':
      beats = winBeats(buddy)
      break
    case 'loss':
      beats = lossBeats(buddy)
      break
    case 'talk':
      beats = lineBeats(buddy, buddy.speech?.text ?? '')
      break
    case 'live':
    default:
      beats = liveBeats(buddy)
      break
  }
  const ids = beats.map((beat) => beat.clip.id).join('>')
  const gesture = beats.some((beat) => beat.play === 'once')
  const line = buddy.speech && now < buddy.speech.until ? buddy.speech.text : ''
  const key = gesture ? `${moment}:${ids}@${buddy.action}@${buddy.actionStartedAt}@${line}` : `${moment}:${ids}`
  return { key, beats }
}

/** If she is already in the other arm pose, fold or unfold once before the new sequence. */
export function lilyEnter(pose: LilyPose, beats: LilyBeat[]): LilyBeat[] {
  if (!beats.length) return beats
  const start = lilyStartPose(beats[0].clip)
  if (pose === start) return beats
  if (pose === 'free' && start === 'crossed') return [cross(true), ...beats]
  return [unfold(), ...beats]
}

export function pickLilyClip(buddy: BuddyState, moment: LilyMoment = 'live', now = Date.now()): LilyClip {
  const sequence = lilySequence(buddy, moment, now)
  return sequence.beats.find((beat) => beat.play === 'loop')?.clip ?? sequence.beats[0].clip
}

/** What her body is actually doing. Captions must use this, not invent a motion. */
export type LilyCue =
  | 'still'
  | 'sleepy'
  | 'yawn'
  | 'rub'
  | 'eat'
  | 'full'
  | 'wave'
  | 'talk'
  | 'blush'
  | 'flirt'
  | 'wink'
  | 'nod'
  | 'no'
  | 'angry'
  | 'cry'
  | 'laugh'
  | 'idea'
  | 'silly'
  | 'listen'
  | 'shy'
  | 'annoyed'
  | 'scared'
  | 'cheer'
  | 'scheme'
  | 'facepalm'

function cueOf(id: string): LilyCue {
  if (id.includes('yawn')) return 'yawn'
  if (id.includes('rubbing')) return 'rub'
  if (id.includes('tired-sleepy')) return 'sleepy'
  if (id.includes('eat-')) return 'eat'
  if (id.includes('fish-face-pout')) return 'full'
  if (id.includes('fish-face-annoyed')) return 'annoyed'
  if (id.includes('waving') || id.includes('talk-wave')) return 'wave'
  if (id.includes('blow-kiss') || id.includes('flirt-')) return 'flirt'
  if (id.includes('blush')) return 'blush'
  if (id.includes('wink')) return 'wink'
  if (id.includes('nod-')) return 'nod'
  if (id.includes('disapprove') || id.includes('shake-head')) return 'no'
  if (id.includes('fists') || id.includes('angry-')) return 'angry'
  if (id.includes('cry')) return 'cry'
  if (id.includes('quiet-laugh')) return 'laugh'
  if (id.includes('finger-up') || id.includes('question-mark')) return 'idea'
  if (id.includes('silly-') || id.includes('finger-gun') || id.includes('taunt-') || id.includes('threaten')) return 'silly'
  if (id.includes('scared')) return 'scared'
  if (id.includes('cheer')) return 'cheer'
  if (id.includes('scheming') || id.includes('evil-smirk')) return 'scheme'
  if (id.includes('facepalm')) return 'facepalm'
  if (id.includes('uncrossed-arms-idle')) return 'listen'
  if (id.includes('talk-talk-')) return 'talk'
  return 'still'
}

export function lilyCue(buddy: BuddyState, now = Date.now()): LilyCue {
  const moment = lilyMomentFor(buddy, now)
  const { beats } = lilySequence(buddy, moment, now)
  for (const beat of beats) {
    if (beat.clip.id.includes('transition')) continue
    const cue = cueOf(beat.clip.id)
    if (cue !== 'still' && cue !== 'talk' && cue !== 'listen' && cue !== 'sleepy') return cue
  }
  const home = [...beats].reverse().find((beat) => beat.play === 'loop')
  return home ? cueOf(home.clip.id) : 'still'
}

