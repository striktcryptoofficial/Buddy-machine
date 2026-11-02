import { useEffect, useRef, useState } from 'react'
import idleSheet from '../../assets/cat/Mochi/Sprites/Classical/Individual/Idle.png'
import idle2Sheet from '../../assets/cat/Mochi/Sprites/Classical/Individual/Idle2.png'
import eatingSheet from '../../assets/cat/Mochi/Sprites/Classical/Individual/Eating.png'
import excitedSheet from '../../assets/cat/Mochi/Sprites/Classical/Individual/Excited.png'
import laySheet from '../../assets/cat/Mochi/Sprites/Classical/Individual/LayDown.png'
import deadSheet from '../../assets/cat/Mochi/Sprites/Classical/Individual/DeadCat.png'
import sleepSheet from '../../assets/cat/Mochi/Sprites/Classical/Individual/Sleep.png'
import sleepySheet from '../../assets/cat/Mochi/Sprites/Classical/Individual/Sleepy.png'
import surprisedSheet from '../../assets/cat/Mochi/Sprites/Classical/Individual/Surprised.png'
import waitingSheet from '../../assets/cat/Mochi/Sprites/Classical/Individual/Waiting.png'
import danceSheet from '../../assets/cat/Mochi/Sprites/Classical/Individual/Dance.png'
import crySheet from '../../assets/cat/Mochi/Sprites/Classical/Individual/Cry.png'
import box2Sheet from '../../assets/cat/Mochi/Sprites/Classical/Individual/Box2.png'
import box1Sheet from '../../assets/cat/Mochi/Sprites/Classical/Individual/Box1.png'
import box3Sheet from '../../assets/cat/Mochi/Sprites/Classical/Individual/Box3.png'
import sadSheet from '../../assets/cat/Mochi/Sprites/Classical/Individual/Sad.png'
import sick1Sheet from '../../assets/cat/Mochi/Sprites/Classical/Individual/catsick1.png'
import sick2Sheet from '../../assets/cat/Mochi/Sprites/Classical/Individual/catsick2.png'
import poseSheet from '../../assets/cat/Mochi/Sprites/3Aug2025Update.png'
import bathSheet from '../../assets/cat/Mochi/Sprites/13Jul2025UpdateBathtab.png'
import { loadImage, paintCoat } from './coat'
import type { Action, Mood } from '../../mechanics/types'
import type { Visual } from './visual'

function sheet(file: string | { src: string }) {
  return typeof file === 'string' ? file : file.src
}

const CELL = 32

const POSE = { sheetW: 512, sheetH: 800 }

const SHEETS = {
  idle: { src: sheet(idleSheet), frames: 10 },
  idle2: { src: sheet(idle2Sheet), frames: 10 },
  eating: { src: sheet(eatingSheet), frames: 15 },
  excited: { src: sheet(excitedSheet), frames: 12 },
  lay: { src: sheet(laySheet), frames: 12 },
  dead: { src: sheet(deadSheet), frames: 1 },
  sleep: { src: sheet(sleepSheet), frames: 4 },
  sleepy: { src: sheet(sleepySheet), frames: 8 },
  surprised: { src: sheet(surprisedSheet), frames: 12 },
  waiting: { src: sheet(waitingSheet), frames: 6 },
  dance: { src: sheet(danceSheet), frames: 4 },
  cry: { src: sheet(crySheet), frames: 4 },
  box1: { src: sheet(box1Sheet), frames: 4 },
  box2: { src: sheet(box2Sheet), frames: 12 },
  box3: { src: sheet(box3Sheet), frames: 4 },
  shy: { src: sheet(sadSheet), frames: 9 },
  refusing: { src: sheet(poseSheet), frames: 4, oy: 576, ...POSE },
  despite: { src: sheet(poseSheet), frames: 13, oy: 480, ...POSE },
  angry: { src: sheet(poseSheet), frames: 5, oy: 512, ox: 128, ...POSE },
  licking: { src: sheet(poseSheet), frames: 11, oy: 608, ...POSE },
  sick1: { src: sheet(sick1Sheet), frames: 5 },
  sick2: { src: sheet(sick2Sheet), frames: 4 },
  bath: { src: sheet(bathSheet), frames: 7, cellW: 50, cellH: 45, stride: 64, ox: 9, oy: 19, sheetW: 448, sheetH: 512 },
} as const

type SheetId = keyof typeof SHEETS

type Clip = { id: SheetId; fps: number }

type RoutedAction = Exclude<
  Action,
  'wander' | 'sit' | 'sleep' | 'approach' | 'window' | 'sniff' | 'attend' | 'ignore' | 'chill'
>

function clipForChillOrSit(still: boolean, startedAt: number): Clip {
  if (!still) return { id: 'excited', fps: 10 }
  const mod = startedAt % 5
  if (mod === 0) return { id: 'licking', fps: 7 }
  if (mod === 1) return { id: 'box3', fps: 6 }
  return { id: 'lay', fps: 5 }
}

function clipForAttend(
  still: boolean,
  mood: Mood | undefined,
  introversion: number,
  hunger: number,
  stamina: number,
): Clip {
  if (!still) return { id: 'excited', fps: 10 }
  switch (mood) {
    case 'sleepy':
      return { id: 'sleepy', fps: 6 }
    case 'sad':
      return { id: 'shy', fps: 6 }
    case 'lonely':
      return { id: 'cry', fps: 5 }
    case 'bored':
      return { id: 'waiting', fps: 6 }
    case 'curious':
      return { id: 'idle', fps: 7 }
    case 'happy':
    case 'excited':
    case 'affectionate': {
      const hungry = hungerClip(hunger, stamina)
      if (hungry) return hungry
      return { id: 'excited', fps: 8 }
    }
    case 'content': {
      const hungry = hungerClip(hunger, stamina)
      if (hungry) return hungry
      return { id: 'waiting', fps: 6 }
    }
    default:
      break
  }
  const hungryDefault = hungerClip(hunger, stamina)
  if (hungryDefault) return hungryDefault
  if (introversion > 0.62) return { id: 'box1', fps: 6 }
  if (introversion < 0.35) return { id: 'box3', fps: 6 }
  return { id: 'box2', fps: 8 }
}

function clipForPlay(still: boolean, startedAt: number): Clip {
  if (!still) return { id: 'excited', fps: 10 }
  const pick = startedAt % 4
  if (pick === 1) return { id: 'box1', fps: 6 }
  if (pick === 2) return { id: 'box2', fps: 8 }
  if (pick === 3) return { id: 'box3', fps: 6 }
  return { id: 'dance', fps: 8 }
}

function clipForAction(action: RoutedAction, still: boolean, startedAt: number): Clip {
  switch (action) {
    case 'stuffed':
      return { id: 'dead', fps: 1 }
    case 'eat':
      return still ? { id: 'eating', fps: 8 } : { id: 'excited', fps: 10 }
    case 'groom':
      return { id: 'licking', fps: 7 }
    case 'playWithYou':
      return clipForPlay(still, startedAt)
    case 'chase':
      return still ? { id: 'dance', fps: 8 } : { id: 'excited', fps: 12 }
    case 'zoomies':
      return { id: 'excited', fps: 12 }
    case 'knock':
      return { id: 'surprised', fps: 8 }
    case 'flop':
      return { id: 'dead', fps: 1 }
    case 'shy':
      return { id: 'shy', fps: 6 }
    case 'refuse':
      return { id: 'refusing', fps: 5 }
    case 'angry':
      return { id: 'angry', fps: 7 }
    default: {
      const _never: never = action
      return _never
    }
  }
}

function hungerClip(hunger: number, stamina: number): Clip | null {
  if (hunger > 0.9 && stamina < 0.22) return { id: 'sick1', fps: 4 }
  if (hunger > 0.78 && stamina < 0.38) return { id: 'sick2', fps: 5 }
  if (hunger >= 0.75) return { id: 'shy', fps: 6 }
  if (hunger >= 0.68) return { id: 'waiting', fps: 6 }
  return null
}

function moodClip(mood: Mood | undefined, blockAngry: boolean): Clip | null {
  if (!mood) return null
  switch (mood) {
    case 'sleepy':
      return { id: 'sleepy', fps: 6 }
    case 'sad':
      return { id: 'shy', fps: 6 }
    case 'lonely':
      return { id: 'cry', fps: 5 }
    case 'bored':
      return { id: 'waiting', fps: 6 }
    case 'curious':
      return { id: 'idle', fps: 7 }
    case 'happy':
    case 'excited':
    case 'affectionate':
      return { id: 'excited', fps: 8 }
    case 'content':
      return { id: 'idle', fps: 7 }
    case 'angry':
      return blockAngry ? null : { id: 'angry', fps: 7 }
    default:
      return null
  }
}

function selectClip(input: {
  action?: Action
  moving: boolean
  energy: Visual['energy']
  zzz: boolean
  mood?: Mood
  hunger: number
  stamina: number
  happiness: number
  scolded: boolean
  introversion: number
  lifeSeed: number
  startedAt: number
}): Clip {
  const { action, moving, energy, zzz, mood, hunger, stamina, happiness, scolded, introversion, lifeSeed, startedAt } = input
  const still = !moving

  if (action === 'sleep' && moving) return { id: 'excited', fps: 10 }
  if (zzz || action === 'sleep') return { id: 'sleep', fps: 4 }

  if (action) {
    if (action === 'attend') return clipForAttend(still, mood, introversion, hunger, stamina)
    if (action === 'ignore') {
      if (!still) return { id: 'excited', fps: 10 }
      return hunger < 0.45 ? { id: 'refusing', fps: 5 } : { id: 'cry', fps: 5 }
    }
    if (action === 'window') return still ? { id: 'waiting', fps: 6 } : { id: 'excited', fps: 10 }
    if (action === 'sniff') return still ? { id: 'waiting', fps: 6 } : { id: 'excited', fps: 10 }
    if (action === 'approach') return still ? { id: 'box3', fps: 6 } : { id: 'excited', fps: 10 }
    if (action === 'chill' || action === 'sit') {
      if (!still) return { id: 'excited', fps: 10 }
      return hungerClip(hunger, stamina) ?? clipForChillOrSit(still, startedAt)
    }
    if (action === 'wander') {
      if (!still) return { id: 'excited', fps: 10 }
      return hungerClip(hunger, stamina) ?? moodClip(mood, true) ?? { id: 'idle2', fps: 7 }
    }

    return clipForAction(action as RoutedAction, still, startedAt)
  }

  if (scolded && still && action !== 'sleep') return { id: 'despite', fps: 7 }

  const hungry = hungerClip(hunger, stamina)
  if (hungry) return hungry

  const blockAngry = action === 'chill' || action === 'sit'
  const fromMood = moodClip(mood, blockAngry)
  if (fromMood) return fromMood

  if ((mood === 'happy' || mood === 'content') && happiness > 0.55 && lifeSeed % 5 === 0 && still) {
    return { id: 'bath', fps: 6 }
  }
  if (energy === 'sleep' && still) return { id: 'sleepy', fps: 6 }

  return { id: 'idle', fps: 7 }
}

function paintOrKeep(img: HTMLImageElement, src: string, base?: string) {
  if (!base) return src
  try {
    return paintCoat(img, base)
  } catch {
    return src
  }
}

export function PixelCat({
  base,
  action,
  moving,
  energy,
  zzz,
  lean,
  mood,
  hunger = 0.4,
  stamina = 0.6,
  happiness = 0.5,
  scolded = false,
  introversion = 0.5,
  lifeSeed = 1,
  startedAt = 0,
}: {
  base?: string
  action?: Action
  moving: boolean
  energy: Visual['energy']
  zzz: boolean
  lean: number
  mood?: Mood
  hunger?: number
  stamina?: number
  happiness?: number
  scolded?: boolean
  introversion?: number
  lifeSeed?: number
  startedAt?: number
}) {
  const [painted, setPainted] = useState<Partial<Record<SheetId, string>> | null>(null)
  const face = useRef(1)
  if (lean < -0.8) face.current = -1
  else if (lean > 0.8) face.current = 1

  useEffect(() => {
    let cancel = false
    const ids = Object.keys(SHEETS) as SheetId[]
    const sources = [...new Set(ids.map((id) => SHEETS[id].src))]
    Promise.all(
      sources.map(async (src) => {
        try {
          const img = await loadImage(src)
          return [src, paintOrKeep(img, src, base)] as const
        } catch {
          return [src, src] as const
        }
      }),
    ).then((pairs) => {
      if (cancel) return
      const bySrc = Object.fromEntries(pairs)
      setPainted(Object.fromEntries(ids.map((id) => [id, bySrc[SHEETS[id].src]])))
    })
    return () => {
      cancel = true
    }
  }, [base])

  const clip = selectClip({
    action,
    moving,
    energy,
    zzz,
    mood,
    hunger,
    stamina,
    happiness,
    scolded,
    introversion,
    lifeSeed,
    startedAt,
  })
  const clipKey = `${clip.id}:${clip.fps}`
  const [frame, setFrame] = useState(0)
  const [shown, setShown] = useState(clipKey)
  if (shown !== clipKey) {
    setShown(clipKey)
    setFrame(0)
  }

  useEffect(() => {
    const count = SHEETS[clip.id].frames
    setFrame(0)
    if (count < 2 || clip.fps <= 0) return
    let index = 0
    const timer = window.setInterval(() => {
      index = (index + 1) % count
      setFrame(index)
    }, 1000 / clip.fps)
    return () => window.clearInterval(timer)
  }, [clip.id, clip.fps])

  const meta = SHEETS[clip.id]
  const sheet = painted?.[clip.id] ?? meta.src
  const cellW = 'cellW' in meta ? meta.cellW : CELL
  const cellH = 'cellH' in meta ? meta.cellH : CELL
  const stride = 'stride' in meta ? meta.stride : cellW
  const ox = 'ox' in meta ? meta.ox : 0
  const oy = 'oy' in meta ? meta.oy : 0
  const sheetW = 'sheetW' in meta ? meta.sheetW : meta.frames * cellW
  const sheetH = 'sheetH' in meta ? meta.sheetH : cellH
  const display = 128 / cellH

  return (
    <div className="pixel-cat" style={{ transform: `scaleX(${face.current})` }}>
      {zzz && (
        <span className="pixel-zzz" aria-hidden="true">
          <i>z</i>
          <i>z</i>
          <i>z</i>
        </span>
      )}
      <div
        className="pixel-sprite"
        style={{
          width: cellW * display,
          height: cellH * display,
          backgroundImage: `url(${sheet})`,
          backgroundPosition: `${-(ox + frame * stride) * display}px ${-oy * display}px`,
          backgroundSize: `${sheetW * display}px ${sheetH * display}px`,
          imageRendering: 'pixelated',
        }}
      />
    </div>
  )
}
