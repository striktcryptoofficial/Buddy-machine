import { useEffect, useMemo, useRef, useState } from 'react'
import type { BuddyState } from '../../mechanics/types'
import type { LilyMoment, LilyPose } from '../../mechanics/lilyPick'
import { lilyEndPose, lilyEnter, lilySequence, lilyStartPose } from '../../mechanics/lilyPick'
import { awakenedLook } from '../../mechanics/awakenedLook'
import { loadImage } from '../cat/coat'
import { paintLily, lilyPaintRev } from './paint'

const files = import.meta.glob('../../assets/lily/**/*.png', { eager: true, import: 'default' }) as Record<string, string>

const urlByPath = new Map<string, string>()
for (const [key, url] of Object.entries(files)) {
  const rel = key.split('/assets/lily/')[1]
  if (rel) urlByPath.set(rel, url)
}

function frameUrl(rel: string) {
  return urlByPath.get(rel) ?? ''
}

/** Closed-eye frame for the quiet idles. The sheet is not timed for a natural blink. */
function blinkFrame(id: string) {
  if (id.endsWith('idle-crossed-arms-idle-1')) return 2
  if (id.endsWith('idle-crossed-arms-idle-3')) return 3
  return 1
}

function isQuietIdle(id: string) {
  return /idle-(?:crossed|uncrossed)-arms-idle-\d+$/.test(id)
}

/** tired-sleepy eyelid loop. Index 2 (frame_03) has both eyes shut; the last frame opens them. */
function isHeldSleep(id: string) {
  return id.includes('tired-sleepy') && !id.includes('yawn') && !id.includes('rubbing')
}

export function Lily({ buddy, moment = 'live', now = Date.now() }: { buddy: BuddyState; moment?: LilyMoment; now?: number }) {
  const look = useMemo(() => awakenedLook(buddy.dna), [buddy.dna])
  const sequence = lilySequence(buddy, moment, now)
  const pose = useRef<LilyPose>('crossed')
  const [sig, setSig] = useState(sequence.key)
  const [run, setRun] = useState(() => lilyEnter(pose.current, sequence.beats))
  const [beatIndex, setBeatIndex] = useState(0)
  const [frame, setFrame] = useState(0)
  const [painted, setPainted] = useState<string[]>([])
  const heldPaint = useRef('')

  if (sig !== sequence.key) {
    const stamp = sig.split('@')[2]
    const nextStamp = sequence.key.split('@')[2]
    if (!(stamp && stamp === nextStamp)) {
      const next = lilyEnter(pose.current, sequence.beats)
      const first = next[0]
      const sleep = !!first && first.play === 'loop' && isHeldSleep(first.clip.id)
      setSig(sequence.key)
      setRun(next)
      setBeatIndex(0)
      setFrame(sleep ? Math.min(2, first.clip.frames.length - 1) : 0)
    }
  }

  const beat = run[Math.min(beatIndex, run.length - 1)]
  const current = beat?.clip
  const clipId = current?.id ?? ''
  const quietIdle = !!beat && beat.play === 'loop' && isQuietIdle(clipId)
  const heldSleepy = !!beat && beat.play === 'loop' && isHeldSleep(clipId)
  // frame_03 (index 2) is the shut-eye pose. frame_04 opens them again.
  const asleepFrame = Math.min(2, Math.max(0, (current?.frames.length ?? 1) - 1))

  if (sig === sequence.key && heldSleepy && frame !== asleepFrame) setFrame(asleepFrame)

  useEffect(() => {
    if (beat) pose.current = lilyStartPose(beat.clip)
  }, [beat])

  useEffect(() => {
    if (!current) return
    let cancel = false
    const rels = current.frames
    setFrame(heldSleepy ? Math.min(2, rels.length - 1) : 0)
    void Promise.all(rels.map((rel) => loadImage(frameUrl(rel)))).then((images) => {
      if (cancel) return
      setPainted(images.map((img, index) => paintLily(img, look, rels[index])))
    })
    return () => {
      cancel = true
    }
  }, [current?.id, look, lilyPaintRev])

  useEffect(() => {
    if (!beat || beat.clip.frames.length < 2) return
    const frames = beat.clip.frames.length

    if (heldSleepy) {
      setFrame(Math.min(2, frames - 1))
      return
    }

    let stop = false
    let timer = 0

    if (quietIdle) {
      const closed = Math.min(blinkFrame(clipId), frames - 1)
      const holdOpen = () => {
        if (stop) return
        setFrame(0)
        timer = window.setTimeout(() => {
          if (stop) return
          setFrame(closed)
          timer = window.setTimeout(holdOpen, 120)
        }, 11000 + Math.floor(Math.random() * 7000))
      }
      holdOpen()
      return () => {
        stop = true
        window.clearTimeout(timer)
      }
    }

    let pass = 0
    timer = window.setInterval(() => {
      setFrame((index) => {
        if (index + 1 < frames) return index + 1
        if (beat.play === 'loop') return 0
        pass += 1
        if (pass >= beat.passes) {
          pass = 0
          pose.current = lilyEndPose(beat.clip)
          setBeatIndex((i) => Math.min(run.length - 1, i + 1))
        }
        return 0
      })
    }, 140)
    return () => {
      stop = true
      window.clearInterval(timer)
    }
  }, [clipId, quietIdle, heldSleepy])

  if (!current) return null
  const ready = painted[frame]
  if (ready) heldPaint.current = ready
  if (!heldPaint.current) return null
  return (
    <img
      className={`lily-sprite outfit-${look.outfit}`}
      src={heldPaint.current}
      alt=""
      width={128}
      height={128}
      style={{ transform: `scale(${look.scale})` }}
      draggable={false}
    />
  )
}
