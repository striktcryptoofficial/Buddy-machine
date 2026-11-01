import { useLayoutEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'
import {
  Award,
  Clover,
  Compass,
  Eye,
  Feather,
  Flame,
  Heart,
  Home,
  Moon,
  Shield,
  Sparkles,
  Swords,
  Waves,
  Wind,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { abilityCards } from '../../Game engine/mechanics/abilities'
import { titlesFor } from '../../Game engine/mechanics/house'
import { useBuddy } from '../../Game engine/mechanics/store'
import type { BuddyState } from '../../Game engine/mechanics/types'

type Card = {
  code: string
  name: string
  line: string
  state: string
  ready: boolean
  detail: string
  rows: { label: string; value: string }[]
}

const ICONS: Record<string, LucideIcon> = {
  SIG: Sparkles,
  TAC: Eye,
  AEG: Shield,
  LCK: Clover,
  EDG: Swords,
  SFT: Heart,
  STL: Waves,
  WND: Wind,
  BIT: Flame,
  TMP: Zap,
  GRD: Shield,
  PRC: Award,
  RSH: Swords,
  CAL: Feather,
  BH: Award,
  EX: Compass,
  OH: Home,
  SCR: Swords,
  RST: Moon,
}

const TITLE_DETAIL = 'The title sits on the card. It does not raise a stat.'

function percent(value: number) {
  return `${Math.round(value * 100)}%`
}

function unhatched(): Card[] {
  return [{ code: '—', name: 'Unhatched', line: 'No cat yet.', state: 'QUIET', ready: false, detail: 'No cat yet.', rows: [] }]
}

function lifeCards(buddy: BuddyState, explorations: number, now: number): Card[] {
  const titles = titlesFor(buddy, explorations, now)
  const battle = titles.includes('battle-hardened')
  const explorer = titles.includes('explorer')
  const oldHouse = titles.includes('old-house')
  const gate = buddy.action !== 'sleep' && buddy.needs.energy >= 0.2 && buddy.needs.hunger <= 0.82
  const asleep = Boolean(buddy.restUntil && now < buddy.restUntil)
  return [
    {
      code: 'BH',
      name: 'Battle-hardened',
      line: 'A hundred scraps.',
      state: battle ? 'EARNED' : 'QUIET',
      ready: battle,
      detail: TITLE_DETAIL,
      rows: [
        { label: 'Scraps', value: String(buddy.scrapCount) },
        { label: 'Needs', value: '100' },
      ],
    },
    {
      code: 'EX',
      name: 'Explorer',
      line: 'Twelve trips.',
      state: explorer ? 'EARNED' : 'QUIET',
      ready: explorer,
      detail: TITLE_DETAIL,
      rows: [
        { label: 'Trips', value: String(explorations) },
        { label: 'Needs', value: '12' },
      ],
    },
    {
      code: 'OH',
      name: 'Old house',
      line: 'A long kept life.',
      state: oldHouse ? 'EARNED' : 'QUIET',
      ready: oldHouse,
      detail: TITLE_DETAIL,
      rows: [
        { label: 'Days', value: String(buddy.careDays.length) },
        { label: 'Needs', value: '12' },
      ],
    },
    {
      code: 'SCR',
      name: 'Scrap',
      line: 'The engine decides.',
      state: gate ? 'OPEN' : 'CLOSED',
      ready: gate,
      detail: 'Awake, with energy left, and not too hungry.',
      rows: [
        { label: 'Energy', value: percent(buddy.needs.energy) },
        { label: 'Hunger', value: percent(buddy.needs.hunger) },
      ],
    },
    {
      code: 'RST',
      name: 'Rest',
      line: 'One day asleep.',
      state: asleep ? 'ASLEEP' : 'AWAKE',
      ready: !asleep,
      detail: 'She can start a day of sleep when she is already awake.',
      rows: [],
    },
  ]
}

export function AbilityCarousel({ open, kind }: { open: boolean; kind: 'abilities' | 'life' }) {
  const api = useBuddy()
  const buddy = api.active
  const explorations = api.explorations
  const personality = buddy?.personality
  const rootRef = useRef<HTMLElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const cards = useMemo(() => {
    if (!buddy) return unhatched()
    if (kind === 'abilities') {
      return abilityCards(buddy)
    }
    return lifeCards(buddy, explorations, Date.now())
  }, [
    kind,
    buddy,
    buddy?.name,
    buddy?.scrapCount,
    buddy?.action,
    buddy?.needs.energy,
    buddy?.needs.hunger,
    buddy?.needs.happiness,
    buddy?.mood,
    buddy?.trust,
    buddy?.restUntil,
    explorations,
    buddy?.careDays.length,
    buddy?.createdAt,
    buddy?.awakenedAt,
    personality?.mischief,
    personality?.affection,
    personality?.introversion,
    personality?.vigor,
    personality?.curiosity,
    personality?.independence,
  ])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!open) {
      root.style.pointerEvents = 'none'
      gsap.to(root, { autoAlpha: 0, duration: reduce ? 0 : 0.28, ease: 'power2.in', overwrite: 'auto' })
      return
    }
    root.style.pointerEvents = 'auto'
    gsap.to(root, {
      autoAlpha: 1,
      duration: reduce ? 0 : 0.45,
      ease: 'power3.out',
      overwrite: 'auto',
    })
  }, [open])

  useLayoutEffect(() => {
    const viewport = listRef.current
    const track = trackRef.current
    if (!viewport || !track) return
    const scroller = viewport
    const row = track
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let x = 0
    let target = 0
    let vel = 0
    let dragging = false
    let startX = 0
    let startPos = 0
    let lastPointer = 0
    let lastTime = 0
    let raf = 0

    function maxSlide() {
      return Math.max(0, row.scrollWidth - scroller.clientWidth)
    }
    function clamp(next: number) {
      return Math.max(-maxSlide(), Math.min(0, next))
    }
    function paint() {
      row.style.transform = `translate3d(${x}px,0,0)`
    }
    function kick() {
      if (raf || reduce) return
      raf = requestAnimationFrame(tick)
    }
    function tick() {
      raf = 0
      const max = maxSlide()
      if (!dragging) {
        target += vel
        vel *= 0.94
        if (target > 0 || target < -max) vel *= 0.55
        target = Math.max(-max, Math.min(0, target))
        if (Math.abs(vel) < 0.25) vel = 0
      }
      x += (target - x) * 0.12
      if (!dragging && vel === 0 && Math.abs(target - x) < 0.4) x = target
      paint()
      if (dragging || Math.abs(target - x) > 0.4 || vel !== 0) kick()
    }
    function down(event: PointerEvent) {
      if (event.button !== 0) return
      dragging = true
      startX = event.clientX
      startPos = x
      target = x
      vel = 0
      lastPointer = event.clientX
      lastTime = performance.now()
      scroller.setPointerCapture(event.pointerId)
      kick()
    }
    function move(event: PointerEvent) {
      if (!dragging) return
      const now = performance.now()
      const dt = Math.max(8, now - lastTime)
      const inst = ((event.clientX - lastPointer) / dt) * 16
      vel = Math.max(-42, Math.min(42, vel * 0.4 + inst * 0.6))
      lastPointer = event.clientX
      lastTime = now
      target = clamp(startPos + event.clientX - startX)
      if (reduce) {
        x = target
        paint()
      }
    }
    function up(event: PointerEvent) {
      if (!dragging) return
      dragging = false
      if (scroller.hasPointerCapture(event.pointerId)) scroller.releasePointerCapture(event.pointerId)
      if (reduce) {
        x = target
        paint()
        return
      }
      kick()
    }
    function wheel(event: WheelEvent) {
      event.preventDefault()
      let delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
      if (event.deltaMode === 1) delta *= 40
      else if (event.deltaMode === 2) delta *= scroller.clientWidth
      if (!delta) return
      target = clamp(target - delta)
      vel = Math.max(-42, Math.min(42, vel * 0.5 - delta * 0.018))
      if (reduce) {
        x = target
        vel = 0
        paint()
        return
      }
      kick()
    }

    paint()
    scroller.addEventListener('pointerdown', down)
    scroller.addEventListener('pointermove', move)
    scroller.addEventListener('pointerup', up)
    scroller.addEventListener('pointercancel', up)
    scroller.addEventListener('wheel', wheel, { passive: false })
    return () => {
      if (raf) cancelAnimationFrame(raf)
      scroller.removeEventListener('pointerdown', down)
      scroller.removeEventListener('pointermove', move)
      scroller.removeEventListener('pointerup', up)
      scroller.removeEventListener('pointercancel', up)
      scroller.removeEventListener('wheel', wheel)
    }
  }, [kind, cards.length])

  const label = kind === 'abilities'
    ? `Abilities. ${cards.map((card) => card.name).join(', ')}`
    : 'Challenge record'

  return (
    <section className="ability-carousel" ref={rootRef} aria-hidden={open ? undefined : true} aria-label={label}>
      <div className="ability-carousel__list" ref={listRef}>
        <div className="ability-carousel__track" ref={trackRef}>
        {cards.map((card) => {
          const Icon = ICONS[card.code] ?? Sparkles
          return (
            <div className="ability-card" key={card.code} role="img" aria-label={`${card.name}, ${card.line}, ${card.state}`}>
              <span className="card-shade" aria-hidden="true" />
              <div className="card-face">
                <div className="ability-top">
                  <Icon strokeWidth={1.75} aria-hidden="true" />
                  <span className="ability-code">{card.code}</span>
                  <span className={`ability-state${card.ready ? ' is-ready' : ''}`}>{card.state}</span>
                </div>
                <h3 className="challenge-title">{card.name}</h3>
                <p className="ability-line">{card.line}</p>
                <p className="challenge-detail">{card.detail}</p>
                {card.rows.length > 0 && (
                  <dl className="challenge-rows">
                    {card.rows.map((row) => (
                      <div key={`${card.code}-${row.label}`}>
                        <dt>{row.label}</dt>
                        <dd>{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </div>
          )
        })}
        </div>
      </div>
    </section>
  )
}
