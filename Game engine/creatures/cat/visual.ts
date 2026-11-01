import type { BuddyState } from '../../mechanics/types'

export type Eyes = 'happy' | 'smug' | 'wide' | 'closed' | 'sad' | 'angry'
export type Mouth = 'laugh' | 'tongue' | 'smile' | 'flat' | 'open'
export type ArmPose = 'rest' | 'wave' | 'reach' | 'tuck' | 'hold'
export type EarPose = 'perk' | 'down' | 'back'
export type TailPose = 'wag' | 'sway' | 'flick' | 'low' | 'still'
export type Energy = 'still' | 'bounce' | 'purr' | 'sleep'

export interface Visual {
  eyes: Eyes
  mouth: Mouth
  arm: ArmPose
  ears: EarPose
  tail: TailPose
  energy: Energy
  sparkle: boolean
  blush: number
  zzz: boolean
  tilt: number
  treat: boolean
}

export function visualFor(buddy: BuddyState): Visual {
  const p = buddy.personality
  const visual: Visual = {
    eyes: p.mischief > 0.58 ? 'smug' : p.affection > 0.66 ? 'happy' : 'smug',
    mouth: p.mischief > 0.55 ? 'tongue' : 'smile',
    arm: 'rest',
    ears: 'perk',
    tail: p.vigor > 0.62 ? 'sway' : 'still',
    energy: 'still',
    sparkle: false,
    blush: p.affection > 0.62 ? 0.35 : 0,
    zzz: false,
    tilt: (buddy.idleStyle - 2) * 2,
    treat: false,
  }

  switch (buddy.mood) {
    case 'happy':
      visual.eyes = 'happy'
      visual.mouth = 'laugh'
      visual.arm = 'wave'
      visual.tail = 'wag'
      visual.sparkle = true
      visual.blush = Math.max(visual.blush, 0.5)
      break
    case 'excited':
      visual.eyes = 'happy'
      visual.mouth = 'laugh'
      visual.arm = 'wave'
      visual.tail = 'wag'
      visual.energy = 'bounce'
      visual.sparkle = true
      break
    case 'sad':
      visual.eyes = 'sad'
      visual.mouth = 'flat'
      visual.ears = 'down'
      visual.tail = 'low'
      visual.arm = 'tuck'
      visual.sparkle = false
      visual.tilt -= 3
      break
    case 'angry':
      visual.eyes = 'angry'
      visual.mouth = 'flat'
      visual.ears = 'back'
      visual.tail = 'flick'
      visual.sparkle = false
      visual.blush = 0
      break
    case 'sleepy':
      visual.eyes = 'closed'
      visual.mouth = 'smile'
      visual.ears = 'down'
      visual.tail = 'still'
      visual.energy = 'sleep'
      break
    case 'curious':
      visual.eyes = 'wide'
      visual.mouth = 'smile'
      visual.arm = 'reach'
      visual.ears = 'perk'
      visual.tilt += 6
      break
    case 'affectionate':
      visual.eyes = 'happy'
      visual.mouth = 'smile'
      visual.blush = 0.85
      visual.energy = 'purr'
      visual.arm = 'reach'
      visual.tail = 'wag'
      break
    case 'lonely':
      visual.eyes = 'sad'
      visual.mouth = 'flat'
      visual.ears = 'down'
      visual.tail = 'low'
      visual.sparkle = false
      break
    case 'bored':
      visual.eyes = 'smug'
      visual.mouth = 'flat'
      visual.tail = 'flick'
      break
    case 'content':
      break
  }

  switch (buddy.action) {
    case 'sleep': {
      const elapsed = (Date.now() - buddy.actionStartedAt) / 1000
      const yawning = !buddy.moving && elapsed < 1.35
      visual.eyes = 'closed'
      visual.mouth = yawning ? 'open' : 'smile'
      visual.ears = 'down'
      visual.tail = 'still'
      visual.arm = 'tuck'
      visual.sparkle = false
      visual.energy = buddy.moving || yawning ? 'still' : 'sleep'
      visual.zzz = !buddy.moving && !yawning
      visual.tilt = -6
      break
    }
    case 'eat':
      visual.eyes = 'smug'
      visual.mouth = buddy.moving ? 'smile' : 'tongue'
      visual.arm = buddy.moving ? 'reach' : 'hold'
      visual.treat = !buddy.moving
      visual.tail = 'sway'
      visual.sparkle = false
      break
    case 'knock':
      visual.eyes = 'smug'
      visual.mouth = 'tongue'
      visual.arm = 'wave'
      visual.tail = 'flick'
      visual.ears = 'perk'
      break
    case 'chase':
      visual.eyes = 'wide'
      visual.mouth = 'laugh'
      visual.arm = 'reach'
      visual.tail = 'wag'
      visual.energy = 'bounce'
      visual.sparkle = true
      break
    case 'playWithYou':
      visual.eyes = 'wide'
      visual.mouth = 'laugh'
      visual.arm = 'reach'
      visual.tail = 'wag'
      visual.energy = 'still'
      visual.sparkle = true
      break
    case 'zoomies':
      visual.eyes = 'happy'
      visual.mouth = 'laugh'
      visual.arm = 'wave'
      visual.tail = 'wag'
      visual.energy = 'bounce'
      visual.sparkle = true
      break
    case 'groom':
      visual.eyes = 'closed'
      visual.mouth = 'tongue'
      visual.arm = 'tuck'
      visual.tail = 'still'
      break
    case 'flop':
      visual.eyes = 'closed'
      visual.mouth = 'flat'
      visual.arm = 'rest'
      visual.tail = 'still'
      visual.energy = 'still'
      visual.zzz = false
      visual.sparkle = false
      break
    case 'stuffed':
      visual.eyes = 'closed'
      visual.mouth = 'flat'
      visual.arm = 'rest'
      visual.tail = 'still'
      visual.energy = 'still'
      visual.zzz = false
      visual.sparkle = false
      break
    case 'sniff':
      visual.eyes = 'wide'
      visual.mouth = 'smile'
      visual.arm = 'reach'
      visual.tilt += 8
      visual.ears = 'perk'
      break
    case 'approach':
      visual.eyes = 'happy'
      visual.mouth = 'smile'
      visual.blush = Math.max(visual.blush, 0.7)
      visual.arm = 'reach'
      visual.energy = 'still'
      visual.tail = 'sway'
      break
    case 'attend': {
      visual.arm = 'reach'
      visual.energy = buddy.moving ? 'still' : 'purr'
      switch (buddy.mood) {
        case 'sleepy':
          visual.eyes = 'closed'
          visual.mouth = 'smile'
          visual.ears = 'down'
          visual.tail = 'still'
          visual.energy = 'sleep'
          break
        case 'sad':
          visual.eyes = 'sad'
          visual.mouth = 'flat'
          visual.ears = 'down'
          visual.tail = 'low'
          visual.sparkle = false
          break
        case 'lonely':
          visual.eyes = 'sad'
          visual.mouth = 'flat'
          visual.ears = 'down'
          visual.tail = 'low'
          visual.sparkle = false
          break
        case 'angry':
          visual.eyes = 'angry'
          visual.mouth = 'flat'
          visual.ears = 'back'
          visual.tail = 'flick'
          visual.sparkle = false
          visual.blush = 0
          break
        case 'bored':
          visual.eyes = 'smug'
          visual.mouth = 'flat'
          visual.tail = 'flick'
          visual.sparkle = false
          break
        case 'curious':
          visual.eyes = 'wide'
          visual.mouth = 'smile'
          visual.ears = 'perk'
          visual.tilt += 4
          break
        case 'excited':
          visual.eyes = 'happy'
          visual.mouth = 'laugh'
          visual.tail = 'wag'
          visual.energy = 'bounce'
          visual.sparkle = true
          break
        case 'affectionate':
          visual.eyes = 'happy'
          visual.mouth = 'smile'
          visual.blush = Math.max(visual.blush, 0.85)
          visual.tail = 'wag'
          break
        default:
          visual.eyes = 'happy'
          visual.mouth = 'smile'
          visual.blush = Math.max(visual.blush, 0.7)
          visual.tail = 'wag'
          visual.sparkle = buddy.mood === 'happy'
          break
      }
      break
    }
    case 'ignore':
      visual.eyes = 'smug'
      visual.mouth = 'tongue'
      visual.ears = 'back'
      visual.tilt = 10
      visual.tail = 'flick'
      visual.arm = 'rest'
      visual.sparkle = false
      break
    case 'window':
      visual.eyes = 'sad'
      visual.mouth = 'flat'
      visual.ears = 'down'
      visual.tail = 'low'
      visual.sparkle = false
      visual.arm = 'rest'
      break
    case 'shy':
      visual.eyes = 'sad'
      visual.mouth = 'flat'
      visual.ears = 'down'
      visual.arm = 'tuck'
      visual.tail = 'low'
      visual.energy = 'still'
      visual.sparkle = false
      break
    case 'refuse':
      visual.eyes = 'smug'
      visual.mouth = 'flat'
      visual.ears = 'back'
      visual.arm = 'rest'
      visual.tail = 'flick'
      visual.energy = 'still'
      visual.sparkle = false
      break
    case 'angry':
      visual.eyes = 'angry'
      visual.mouth = 'flat'
      visual.ears = 'back'
      visual.arm = 'rest'
      visual.tail = 'flick'
      visual.energy = 'still'
      visual.sparkle = false
      break
    case 'chill':
      visual.eyes = 'happy'
      visual.mouth = 'smile'
      visual.arm = 'tuck'
      visual.tail = 'sway'
      visual.energy = 'still'
      visual.sparkle = false
      break
    case 'wander':
    case 'sit':
      break
  }

  if (
    Date.now() < buddy.scoldedUntil &&
    buddy.action !== 'sleep' &&
    buddy.action !== 'chill' &&
    buddy.action !== 'sit'
  ) {
    visual.eyes = 'angry'
    visual.ears = 'back'
    visual.tail = 'flick'
    visual.sparkle = false
  }

  return visual
}
