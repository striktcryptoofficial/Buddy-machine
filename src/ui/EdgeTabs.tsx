import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode, type RefObject } from 'react'
import {
  Award,
  Brain,
  Clover,
  Compass,
  Dumbbell,
  Eye,
  FlaskConical,
  Gem,
  X,
  Shield,
  Sparkles,
  Swords,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import gsap from 'gsap'
import { useBuddy } from '../../Game engine/mechanics/store'
import { AbilityCarousel } from './AbilityCarousel'
import { ChallengeBoard } from './ChallengeBoard'
import { FieldBoard } from './FieldBoard'
import { ModeSelect } from './ModeSelect'
import { StatSheet } from './StatSheet'
import './cards/edge.css'

const STATS: { name: string; short: string; icon: LucideIcon; value: string; filled?: number }[] = [
  { name: 'Strength', short: 'STR', icon: Swords, value: '78', filled: 4 },
  { name: 'Intelligence', short: 'INT', icon: Brain, value: '92', filled: 5 },
  { name: 'Speed', short: 'SPD', icon: Zap, value: '45', filled: 2 },
  { name: 'Defense', short: 'DEF', icon: Shield, value: '65', filled: 3 },
  { name: 'Luck', short: 'LCK', icon: Clover, value: '83', filled: 4 },
  { name: 'Ability', short: 'SIG', icon: Sparkles, value: 'Shadow Strike' },
  { name: 'Level', short: 'LV', icon: Award, value: '01' },
]

const MISSIONS: { code: string; name: string; meta: string; reward: string; unit: string; href: string; icon: LucideIcon }[] = [
  { code: 'TRN', name: 'Training', meta: 'A drill', reward: 'GO', unit: 'FIELD', href: '/field', icon: Dumbbell },
  { code: 'MIN', name: 'Mining', meta: 'Crystals come home', reward: 'GO', unit: 'FIELD', href: '/field', icon: Gem },
  { code: 'EXP', name: 'Exploration', meta: 'She goes out', reward: 'GO', unit: 'FIELD', href: '/field', icon: Compass },
  { code: 'ARN', name: 'Arena', meta: 'Scrap, stare, throne', reward: 'GO', unit: 'FIGHT', href: '/arena', icon: Swords },
  { code: 'RSC', name: 'Research', meta: 'She reads', reward: 'GO', unit: 'FIELD', href: '/field', icon: FlaskConical },
]

const ABILITIES: { code: string; name: string; line: string; state: string; ready: boolean; icon: LucideIcon }[] = [
  { code: 'SIG', name: 'Shadow Strike', line: 'Signature strike', state: 'READY', ready: true, icon: Sparkles },
  { code: 'TAC', name: 'Tactical Read', line: 'Reads the fight', state: 'MIND', ready: true, icon: Eye },
  { code: 'AEG', name: 'Aegis', line: 'Blocks with defense', state: 'READY', ready: true, icon: Shield },
  { code: 'LCK', name: 'Lucky Break', line: 'A luck check', state: 'AURA', ready: false, icon: Clover },
]

function liftCard(event: ReactPointerEvent<HTMLElement>) {
  const card = event.currentTarget
  gsap.set(card, { zIndex: 2 })
  gsap.to(card.querySelector('.card-face'), {
    scale: 1.05,
    '--lift': 1,
    duration: 0.45,
    ease: 'power2.out',
    overwrite: 'auto',
  })
  gsap.to(card.querySelector('.card-shade'), {
    scale: 1.05,
    opacity: 1,
    duration: 0.45,
    ease: 'power2.out',
    overwrite: 'auto',
  })
}

function dropCard(event: ReactPointerEvent<HTMLElement>) {
  const card = event.currentTarget
  gsap.to(card.querySelector('.card-face'), {
    scale: 1,
    '--lift': 0,
    duration: 0.4,
    ease: 'power2.inOut',
    overwrite: 'auto',
    onComplete() {
      gsap.set(card, { zIndex: 0 })
    },
  })
  gsap.to(card.querySelector('.card-shade'), {
    scale: 1,
    opacity: 0,
    duration: 0.4,
    ease: 'power2.inOut',
    overwrite: 'auto',
  })
}

function Dots({ filled }: { filled: number }) {
  return (
    <span className="stats-dots" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <i key={index} className={index < filled ? 'is-on panel-pip' : 'panel-pip'} />
      ))}
    </span>
  )
}

function usePanelMotion(button: string, card: string, fromX: number, fromY: number) {
  const rootRef = useRef<HTMLDivElement>(null)
  const timeline = useRef<gsap.core.Timeline | null>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      const tab = root.querySelector(button)
      const shade = root.querySelector('.edge-slide > .card-shade')
      const pop = root.querySelector('[data-pop]')
      const cards = gsap.utils.toArray<HTMLElement>(card, root)
      const tl = gsap.timeline({
        paused: true,
        onReverseComplete() {
          if (pop instanceof HTMLElement) pop.style.pointerEvents = 'none'
        },
      })
      tl.to(tab, {
        scale: 1.06,
        '--lift': 1,
        duration: reduce ? 0 : 0.45,
        ease: 'power2.out',
      }, 0)
      if (shade) {
        tl.to(shade, {
          scale: 1.06,
          opacity: 1,
          duration: reduce ? 0 : 0.45,
          ease: 'power2.out',
        }, 0)
      }
      cards.forEach((row, index) => {
        const at = reduce ? 0 : 0.06 + index * 0.07
        tl.fromTo(row, {
          x: fromX,
          y: fromY,
          scale: 0.82,
          opacity: 0,
        }, {
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
          duration: reduce ? 0 : 0.62,
          ease: 'back.out(1.7)',
        }, at)
        const bits = row.querySelectorAll('.panel-bit')
        if (bits.length) {
          tl.fromTo(bits, {
            y: 8,
            opacity: 0,
          }, {
            y: 0,
            opacity: 1,
            duration: reduce ? 0 : 0.42,
            stagger: reduce ? 0 : 0.045,
            ease: 'power3.out',
          }, at + (reduce ? 0 : 0.08))
        }
        const pips = row.querySelectorAll('.panel-pip')
        if (pips.length) {
          tl.fromTo(pips, {
            scale: 0.15,
            opacity: 0,
          }, {
            scale: 1,
            opacity: 1,
            duration: reduce ? 0 : 0.4,
            stagger: reduce ? 0 : 0.04,
            ease: 'back.out(2.4)',
          }, at + (reduce ? 0 : 0.16))
        }
      })
      timeline.current = tl
    }, root)
    return () => ctx.revert()
  }, [button, card, fromX, fromY])

  function open() {
    const pop = rootRef.current?.querySelector('[data-pop]')
    if (pop instanceof HTMLElement) pop.style.pointerEvents = 'auto'
    timeline.current?.timeScale(1).play()
  }

  function close() {
    const root = rootRef.current
    const tl = timeline.current
    const pop = root?.querySelector('[data-pop]')
    if (pop) {
      gsap.to(pop.querySelectorAll('.card-face'), {
        scale: 1,
        '--lift': 0,
        duration: 0.35,
        ease: 'power2.inOut',
        overwrite: 'auto',
      })
      gsap.to(pop.querySelectorAll('.card-shade'), {
        scale: 1,
        opacity: 0,
        duration: 0.35,
        ease: 'power2.inOut',
        overwrite: 'auto',
      })
    }
    if (!tl || (tl.progress() === 0 && !tl.isActive())) return
    tl.timeScale(1.2).reverse()
  }

  function dismiss() {
    const pop = rootRef.current?.querySelector('[data-pop]')
    timeline.current?.pause(0)
    if (pop instanceof HTMLElement) pop.style.pointerEvents = 'none'
    if (!(pop instanceof HTMLElement)) return
    const faces = pop.querySelectorAll('.card-face')
    const shades = pop.querySelectorAll('.card-shade')
    gsap.killTweensOf([...faces, ...shades])
    gsap.set(faces, { scale: 1, '--lift': 0, overwrite: true })
    gsap.set(shades, { scale: 1, opacity: 0, overwrite: true })
  }

  return { rootRef, open, close, dismiss }
}

function slideEdges(out: boolean) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const duration = reduce ? 0 : 0.55
  const ease = out ? 'power3.in' : 'back.out(1.6)'
  const moves = [
    ['.edge-challenges', { y: out ? -90 : 0 }],
    ['.edge-sheet', { y: out ? 80 : 0 }],
  ] as const
  for (const [sel, vars] of moves) {
    const panel = document.querySelector(sel)
    const slide = panel?.querySelector('.edge-slide')
    if (!(panel instanceof HTMLElement) || !(slide instanceof HTMLElement)) continue
    panel.style.pointerEvents = out ? 'none' : ''
    gsap.to(slide, { ...vars, duration, ease, overwrite: 'auto' })
  }
  showReturn(out)
}

function showReturn(on: boolean) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const back = document.querySelector('.edge-return')
  if (!(back instanceof HTMLElement)) return
  if (on) {
    back.style.pointerEvents = 'auto'
    back.removeAttribute('aria-hidden')
  }
  gsap.to(back, {
    autoAlpha: on ? 1 : 0,
    duration: reduce ? 0 : 0.35,
    delay: on && !reduce ? 0.08 : 0,
    ease: 'power2.out',
    overwrite: 'auto',
    onComplete() {
      if (!on) {
        back.style.pointerEvents = 'none'
        back.setAttribute('aria-hidden', 'true')
      }
    },
  })
}

function Panel({
  className,
  motion,
  children,
  label,
  tabClass,
  onClick,
  quiet = false,
}: {
  className: string
  motion: { rootRef: RefObject<HTMLDivElement | null>; open: () => void; close: () => void; dismiss: () => void }
  children: ReactNode
  label: string
  tabClass: string
  onClick: () => void
  quiet?: boolean
}) {
  return (
    <div className={className} ref={motion.rootRef} onPointerEnter={quiet ? undefined : motion.open} onPointerLeave={quiet ? undefined : motion.close}>
      <div className="edge-slide">
        <span className="card-shade" aria-hidden="true" />
        {children}
        <button
          type="button"
          className={tabClass}
          onClick={(event) => {
            if (quiet) {
              onClick()
              event.currentTarget.blur()
              return
            }
            onClick()
            motion.dismiss()
            slideEdges(true)
            event.currentTarget.blur()
          }}
        >
          {label}
        </button>
      </div>
    </div>
  )
}

type EdgeId = 'challenges' | 'stats' | 'abilities'

export function EdgeTabs({ fold, openSheet, onSelect, onReturn, onPick, onSurface, onLocked }: { fold: number; openSheet?: { id: 'stats' | 'abilities'; n: number } | null; onSelect: (id: EdgeId) => void; onReturn: () => void; onPick: (open: boolean) => void; onSurface: (surface: 'board' | 'field' | 'play' | null) => void; onLocked: () => void }) {
  const hatched = Boolean(useBuddy().active)
  const challenges = usePanelMotion('.edge-tab--left', '.mission-card', -34, 0)
  const sheet = usePanelMotion('.edge-tab--bottom', '.panel-card', 0, 28)
  const [boardOpen, setBoardOpen] = useState(false)
  const [fieldOpen, setFieldOpen] = useState(false)
  const [playOpen, setPlayOpen] = useState(false)
  const [closePlay, setClosePlay] = useState(0)
  const [lane, setLane] = useState<'stats' | 'challenges' | 'abilities'>('stats')
  const titleRef = useRef<HTMLHeadingElement>(null)
  const showTitle = boardOpen && (lane === 'stats' || lane === 'abilities')

  useEffect(() => {
    if (!fold) return
    setBoardOpen(false)
    setFieldOpen(false)
    setClosePlay((value) => value + 1)
    slideEdges(false)
  }, [fold])

  useEffect(() => {
    if (!openSheet) return
    challenges.dismiss()
    sheet.dismiss()
    onSelect(openSheet.id)
    setLane(openSheet.id)
    setFieldOpen(false)
    setBoardOpen(true)
    setClosePlay((value) => value + 1)
    slideEdges(true)
  }, [openSheet])

  useEffect(() => {
    if (boardOpen || fieldOpen) return
    showReturn(false)
  }, [playOpen, boardOpen, fieldOpen])

  useEffect(() => {
    onSurface(boardOpen ? 'board' : fieldOpen ? 'field' : playOpen ? 'play' : null)
  }, [boardOpen, fieldOpen, playOpen, onSurface])

  useLayoutEffect(() => {
    const title = titleRef.current
    if (!title) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    gsap.killTweensOf(title)
    if (!showTitle) {
      gsap.to(title, {
        autoAlpha: 0,
        x: -18,
        filter: reduce ? 'none' : 'blur(12px)',
        duration: reduce ? 0 : 0.34,
        ease: 'power3.in',
      })
      return
    }
    gsap.fromTo(
      title,
      { autoAlpha: 0, x: -28, filter: reduce ? 'none' : 'blur(16px)' },
      {
        autoAlpha: 1,
        x: 0,
        filter: 'blur(0px)',
        duration: reduce ? 0 : 0.7,
        ease: 'expo.out',
      },
    )
  }, [showTitle, lane])

  function liftReturn(event: ReactPointerEvent<HTMLDivElement>) {
    const root = event.currentTarget
    gsap.to(root.querySelector('.return-button'), {
      scale: 1.06,
      '--lift': 1,
      duration: 0.45,
      ease: 'power2.out',
      overwrite: 'auto',
    })
    gsap.to(root.querySelector('.card-shade'), {
      scale: 1.06,
      opacity: 1,
      duration: 0.45,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  function dropReturn(event: ReactPointerEvent<HTMLDivElement>) {
    const root = event.currentTarget
    gsap.to(root.querySelector('.return-button'), {
      scale: 1,
      '--lift': 0,
      duration: 0.4,
      ease: 'power2.inOut',
      overwrite: 'auto',
    })
    gsap.to(root.querySelector('.card-shade'), {
      scale: 1,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.inOut',
      overwrite: 'auto',
    })
  }

  return (
    <>
      <div className="edge-return" aria-hidden="true" onPointerEnter={liftReturn} onPointerLeave={dropReturn}>
        <span className="card-shade" aria-hidden="true" />
        <button
          type="button"
          className="return-button"
          aria-label="Close"
          onClick={(event) => {
            const root = event.currentTarget.parentElement
            gsap.to(event.currentTarget, { scale: 1, '--lift': 0, duration: 0.3, ease: 'power2.inOut', overwrite: 'auto' })
            gsap.to(root?.querySelector('.card-shade') ?? null, { scale: 1, opacity: 0, duration: 0.3, ease: 'power2.inOut', overwrite: 'auto' })
            setClosePlay((value) => value + 1)
            setBoardOpen(false)
            setFieldOpen(false)
            slideEdges(false)
            onReturn()
          }}
        >
          <X strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>
      <h1 className="view-title" ref={titleRef}>
        {lane === 'stats' ? 'Stats' : lane === 'abilities' ? 'Abilities' : 'Stats'}
      </h1>
      <ModeSelect
        hidden={boardOpen || fieldOpen}
        locked={!hatched}
        onLocked={onLocked}
        closePlay={closePlay}
        onPick={(open) => {
          setPlayOpen(open)
          onPick(open)
        }}
        onArena={() => {
          challenges.dismiss()
          sheet.dismiss()
          onSelect('challenges')
          setLane('challenges')
          setFieldOpen(false)
          setBoardOpen(true)
          slideEdges(true)
        }}
        onField={() => {
          challenges.dismiss()
          sheet.dismiss()
          onSelect('challenges')
          setBoardOpen(false)
          setFieldOpen(true)
          slideEdges(true)
        }}
      />
      <ChallengeBoard open={boardOpen && lane === 'challenges'} />
      <FieldBoard open={fieldOpen} />
      <StatSheet open={boardOpen && lane === 'stats'} />
      <AbilityCarousel open={boardOpen && lane !== 'stats'} kind={lane === 'challenges' ? 'life' : 'abilities'} />
      <Panel quiet={!hatched} className={`edge-challenges${boardOpen || fieldOpen ? ' is-quiet' : ''}`} motion={challenges} label="Challenges" tabClass="edge-tab edge-tab--left" onClick={() => { if (!hatched) { onLocked(); return } onSelect('challenges'); setLane('challenges'); setFieldOpen(false); setBoardOpen(true) }}>
        <div className="challenges-pop" data-pop>
          {MISSIONS.map((mission) => {
            const Icon = mission.icon
            return (
              <button type="button" className="mission-card panel-card" key={mission.code} aria-label={`${mission.name}. ${mission.meta}`} onClick={(event) => { event.stopPropagation(); if (mission.href === '/arena') { onSelect('challenges'); setLane('challenges'); setFieldOpen(false); setBoardOpen(true) } else { setBoardOpen(false); setFieldOpen(true) } }} onPointerEnter={liftCard} onPointerLeave={dropCard}>
                <span className="card-shade" aria-hidden="true" />
                <div className="card-face">
                  <Icon className="panel-bit" strokeWidth={1.75} aria-hidden="true" />
                  <span className="mission-head">
                    <span className="mission-code panel-bit">{mission.code}</span>
                    <span className="mission-title panel-bit">{mission.name}</span>
                  </span>
                  <span className="mission-meta panel-bit">{mission.meta}</span>
                  <span className="mission-stamp panel-bit">Go</span>
                </div>
              </button>
            )
          })}
        </div>
      </Panel>
      <Panel className={`edge-sheet${boardOpen ? ' is-quiet' : ''}`} motion={sheet} label="Stats & Abilities" tabClass="edge-tab edge-tab--bottom" onClick={() => { onSelect('stats'); setLane('stats'); setBoardOpen(true) }}>
        <div className="sheet-pop" data-pop>
          <div className="sheet-abilities">
            {ABILITIES.map((ability) => {
              const Icon = ability.icon
              return (
                <div className="ability-card panel-card" key={ability.code} role="img" aria-label={`${ability.name}, ${ability.line}, ${ability.state}`} onPointerEnter={liftCard} onPointerLeave={dropCard}>
                  <span className="card-shade" aria-hidden="true" />
                  <div className="card-face">
                    <Icon className="panel-bit" strokeWidth={1.75} aria-hidden="true" />
                    <span className="ability-code panel-bit">{ability.code}</span>
                    <span className={`ability-state panel-bit${ability.ready ? ' is-ready' : ''}`}>{ability.state}</span>
                    <span className="ability-name panel-bit">{ability.name}</span>
                    <span className="ability-line panel-bit">{ability.line}</span>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="sheet-stats">
            {STATS.map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  className="stats-row panel-card"
                  key={stat.name}
                  role="img"
                  aria-label={stat.filled === undefined ? `${stat.name} ${stat.value}` : `${stat.name} ${stat.value}, ${stat.filled} of 5`}
                  onPointerEnter={liftCard}
                  onPointerLeave={dropCard}
                >
                  <span className="card-shade" aria-hidden="true" />
                  <div className="card-face">
                    <Icon className="panel-bit" strokeWidth={1.75} aria-hidden="true" />
                    <span className="stats-name panel-bit">{stat.short}</span>
                    <span className="stats-value panel-bit">{stat.value}</span>
                    {stat.filled !== undefined && <Dots filled={stat.filled} />}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Panel>
    </>
  )
}
