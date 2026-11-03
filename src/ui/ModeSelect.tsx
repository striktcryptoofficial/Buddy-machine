import { useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { ArrowLeft, ArrowRight, Compass, Heart, Play, Swords, type LucideIcon } from 'lucide-react'
import gsap from 'gsap'
import './cards/play.css'

const MODES: { id: string; index: string; kicker: string; name: string; detail: string; action: string; icon: LucideIcon }[] = [
  { id: 'companion', index: '01', kicker: 'Life', name: 'Companion', detail: 'Care, memory, and the day with them.', action: 'Stay', icon: Heart },
  { id: 'arena', index: '02', kicker: 'Fight', name: 'Arena', detail: 'A fight. The engine decides the rest.', action: 'Enter', icon: Swords },
  { id: 'exploration', index: '03', kicker: 'Field', name: 'Exploration', detail: 'Send them out. They bring something back.', action: 'Send', icon: Compass },
]

function ModeGlyph({ id }: { id: string }) {
  if (id === 'arena') {
    return (
      <svg className="mode-card__glyph" viewBox="0 0 32 32" aria-hidden="true">
        <polygon points="3,7 9,3 29,27 23,31" fill="currentColor" />
        <polygon points="23,3 29,7 9,31 3,27" fill="currentColor" />
      </svg>
    )
  }
  if (id === 'exploration') {
    return (
      <svg className="mode-card__glyph" viewBox="0 0 32 32" aria-hidden="true">
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="m16 1.6 3.5 10.9L30.4 16l-10.9 3.5L16 30.4l-3.5-10.9L1.6 16l10.9-3.5L16 1.6Zm0 10.2 1.7 4.2 4.2 1.6-4.2 1.6L16 23.4l-1.7-4.2-4.2-1.6 4.2-1.6L16 11.8Z"
        />
      </svg>
    )
  }
  return (
    <svg className="mode-card__glyph" viewBox="0 0 32 32" aria-hidden="true">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M16 2c.5 0 1 .3 1.2.8 3 6.2 8.2 9.6 8.2 15.4C25.4 24.6 21.2 29 16 29S6.6 24.6 6.6 18.2C6.6 12.4 11.8 9 14.8 2.8 15 2.3 15.5 2 16 2Zm-2.2 10.4a2.2 2.2 0 1 0 .01 0Z"
      />
    </svg>
  )
}

function restModeCards(root: ParentNode | null) {
  if (!root) return
  const faces = root.querySelectorAll('.mode-card .card-face')
  const shades = root.querySelectorAll('.mode-card .card-shade')
  gsap.killTweensOf([...faces, ...shades])
  gsap.set(faces, { scale: 1, '--lift': 0, overwrite: true })
  gsap.set(shades, { scale: 1, opacity: 0, overwrite: true })
}

function liftFace(event: ReactPointerEvent<HTMLButtonElement>) {
  const card = event.currentTarget
  gsap.to(card.querySelector('.card-face'), {
    scale: 1.04,
    '--lift': 1,
    duration: 0.45,
    ease: 'power2.out',
    overwrite: 'auto',
  })
  gsap.to(card.querySelector('.card-shade'), {
    scale: 1.04,
    opacity: 1,
    duration: 0.45,
    ease: 'power2.out',
    overwrite: 'auto',
  })
}

function dropFace(event: ReactPointerEvent<HTMLButtonElement>) {
  const card = event.currentTarget
  gsap.to(card.querySelector('.card-face'), {
    scale: 1,
    '--lift': 0,
    duration: 0.4,
    ease: 'power2.inOut',
    overwrite: 'auto',
  })
  gsap.to(card.querySelector('.card-shade'), {
    scale: 1,
    opacity: 0,
    duration: 0.4,
    ease: 'power2.inOut',
    overwrite: 'auto',
  })
}

export function ModeSelect({
  hidden,
  closePlay,
  onArena,
  onField,
  onPick,
  onOpenPlay,
  locked = false,
  onLocked,
}: {
  hidden: boolean
  closePlay: number
  onArena: () => void
  onField: () => void
  onPick: (open: boolean) => void
  onOpenPlay?: () => void
  locked?: boolean
  onLocked?: () => void
}) {
  const playRef = useRef<HTMLDivElement>(null)
  const pickRef = useRef<HTMLDivElement>(null)
  const onPickRef = useRef(onPick)
  const timeline = useRef<gsap.core.Timeline | null>(null)
  const [picking, setPicking] = useState(false)
  const pickingRef = useRef(false)
  onPickRef.current = onPick
  pickingRef.current = picking

  useLayoutEffect(() => {
    if (!closePlay) return
    setPicking(false)
  }, [closePlay])

  useLayoutEffect(() => {
    onPickRef.current(picking && !hidden)
  }, [picking, hidden])

  useLayoutEffect(() => {
    const play = playRef.current
    if (!play) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      const button = play.querySelector('.play-button')
      const shade = play.querySelector(':scope > .card-shade')
      const pop = play.querySelector('[data-pop]')
      const cards = gsap.utils.toArray<HTMLElement>('.play-card', play)
      const tl = gsap.timeline({
        paused: true,
        onReverseComplete() {
          if (pop instanceof HTMLElement) pop.style.pointerEvents = 'none'
        },
      })
      tl.to(button, { '--lift': 1, duration: reduce ? 0 : 0.45, ease: 'power2.out' }, 0)
      if (shade) tl.to(shade, { opacity: 1, duration: reduce ? 0 : 0.45, ease: 'power2.out' }, 0)
      cards.forEach((row, index) => {
        const at = reduce ? 0 : 0.06 + index * 0.07
        tl.fromTo(row, { y: -28, scale: 0.82, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: reduce ? 0 : 0.62, ease: 'back.out(1.7)' }, at)
        const bits = row.querySelectorAll('.panel-bit')
        if (bits.length) {
          tl.fromTo(bits, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: reduce ? 0 : 0.42, stagger: reduce ? 0 : 0.045, ease: 'power3.out' }, at + (reduce ? 0 : 0.08))
        }
      })
      timeline.current = tl
    }, play)
    return () => ctx.revert()
  }, [])

  function openCards() {
    if (locked || pickingRef.current) return
    const pop = playRef.current?.querySelector('[data-pop]')
    if (pop instanceof HTMLElement) pop.style.pointerEvents = 'auto'
    timeline.current?.timeScale(1).play()
  }

  function closeCards() {
    const pop = playRef.current?.querySelector('[data-pop]')
    if (pop) {
      gsap.to(pop.querySelectorAll('.card-face'), { scale: 1, '--lift': 0, duration: 0.35, ease: 'power2.inOut', overwrite: 'auto' })
      gsap.to(pop.querySelectorAll('.card-shade'), { scale: 1, opacity: 0, duration: 0.35, ease: 'power2.inOut', overwrite: 'auto' })
    }
    const tl = timeline.current
    if (!tl || (tl.progress() === 0 && !tl.isActive())) return
    tl.timeScale(1.2).reverse()
  }

  useLayoutEffect(() => () => onPickRef.current(false), [])

  useLayoutEffect(() => {
    const play = playRef.current
    if (!play) return
    if (hidden) {
      setPicking(false)
      timeline.current?.pause(0)
      const pop = play.querySelector('[data-pop]')
      if (pop instanceof HTMLElement) pop.style.pointerEvents = 'none'
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!hidden) play.style.pointerEvents = 'auto'
    gsap.to(play, {
      autoAlpha: hidden ? 0 : 1,
      duration: reduce ? 0 : 0.35,
      ease: 'power2.out',
      overwrite: 'auto',
      onComplete() {
        play.style.pointerEvents = hidden ? 'none' : 'auto'
      },
    })
  }, [hidden])

  useLayoutEffect(() => {
    const pick = pickRef.current
    if (!pick) return
    const show = picking && !hidden
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const cards = pick.querySelectorAll<HTMLElement>('.mode-card')
    const bits = pick.querySelectorAll<HTMLElement>('.mode-card .card-face > *')
    const back = pick.querySelector<HTMLElement>('.mode-pick__back')
    gsap.killTweensOf([pick, cards, bits, back])
    if (!show) {
      pick.style.pointerEvents = 'none'
      restModeCards(pick)
      gsap.to(bits, { y: 10, opacity: 0, duration: reduce ? 0 : 0.18, stagger: reduce ? 0 : 0.01, ease: 'power2.in' })
      gsap.to(cards, {
        y: 28,
        scale: 0.9,
        opacity: 0,
        filter: reduce ? 'none' : 'blur(12px)',
        duration: reduce ? 0 : 0.32,
        stagger: reduce ? 0 : 0.04,
        ease: 'power3.in',
      })
      gsap.to(back, { y: -8, opacity: 0, duration: reduce ? 0 : 0.22, ease: 'power2.in' })
      gsap.to(pick, { autoAlpha: 0, duration: reduce ? 0 : 0.28, delay: reduce ? 0 : 0.06, ease: 'power2.in' })
      return
    }
    pick.style.pointerEvents = 'auto'
    gsap.set(pick, { autoAlpha: 1 })
    gsap.fromTo(
      back,
      { y: -14, opacity: 0, filter: reduce ? 'none' : 'blur(10px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: reduce ? 0 : 0.5, ease: 'expo.out' },
    )
    gsap.fromTo(
      cards,
      { y: 40, scale: 0.86, opacity: 0, filter: reduce ? 'none' : 'blur(16px)' },
      {
        y: 0,
        scale: 1,
        opacity: 1,
        filter: 'blur(0px)',
        duration: reduce ? 0 : 0.7,
        stagger: reduce ? 0 : 0.07,
        ease: 'expo.out',
      },
    )
    gsap.fromTo(
      bits,
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: reduce ? 0 : 0.46, stagger: reduce ? 0 : 0.02, delay: reduce ? 0 : 0.12, ease: 'power3.out' },
    )
    closeCards()
  }, [picking, hidden])

  function choose(id: string) {
    setPicking(false)
    if (id === 'arena') onArena()
    if (id === 'exploration') onField()
  }

  return (
    <>
      <div className="mode-play" ref={playRef} onPointerEnter={openCards} onPointerLeave={closeCards}>
        <span className="card-shade" aria-hidden="true" />
        <button
          type="button"
          className="play-button"
          aria-expanded={locked ? false : picking}
          onClick={() => {
            if (locked) {
              onLocked?.()
              return
            }
            const next = !picking
            if (next) onOpenPlay?.()
            setPicking(next)
          }}
        >
          <Play strokeWidth={1.75} aria-hidden="true" />
          Play
        </button>
        <div className="play-pop" data-pop>
          {MODES.map((mode) => {
            const Icon = mode.icon
            return (
              <button
                type="button"
                className="play-card panel-card"
                key={mode.id}
                aria-label={mode.name}
                onClick={(event) => {
                  event.stopPropagation()
                  choose(mode.id)
                }}
                onPointerEnter={liftFace}
                onPointerLeave={dropFace}
              >
                <span className="card-shade" aria-hidden="true" />
                <span className="card-face">
                  <Icon className="panel-bit" strokeWidth={1.75} aria-hidden="true" />
                  <span className="panel-bit">{mode.name}</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>
      <div className="mode-pick" ref={pickRef} aria-hidden={picking ? undefined : true}>
        <button type="button" className="mode-pick__back" onClick={() => setPicking(false)}>
          <ArrowLeft strokeWidth={1.75} aria-hidden="true" />
          Back
        </button>
        <div className="mode-pick__row">
          {MODES.map((mode) => {
            const Icon = mode.icon
            return (
              <button
                key={mode.id}
                type="button"
                className={`mode-card mode-card--${mode.id}`}
                aria-label={`${mode.name}. ${mode.detail}`}
                onClick={() => choose(mode.id)}
                onPointerEnter={(event) => {
                  if (!picking || hidden) return
                  liftFace(event)
                }}
                onPointerLeave={dropFace}
              >
                <span className="card-shade" aria-hidden="true" />
                <span className="card-face">
                  <span className="mode-card__top">
                    <span className="mode-card__mark">
                      <span className="mode-card__icon">
                        <Icon strokeWidth={1.75} aria-hidden="true" />
                      </span>
                      <ModeGlyph id={mode.id} />
                    </span>
                    <span className="mode-card__index">{mode.index}</span>
                  </span>
                  <span className="mode-card__kicker">{mode.kicker}</span>
                  <strong className="mode-card__title">{mode.name}</strong>
                  <span className="mode-card__detail">{mode.detail}</span>
                  <span className="mode-card__foot">
                    {mode.action}
                    <ArrowRight strokeWidth={1.75} aria-hidden="true" />
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
