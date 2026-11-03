import { useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import gsap from 'gsap'
import { useBuddy } from '../../Game engine/mechanics/store'
import './cards/challenge.css'

type TabId = 'all' | 'duel' | 'machines' | 'king'

const TABS: { id: TabId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'duel', label: '1v1' },
  { id: 'machines', label: 'Machines' },
  { id: 'king', label: 'King' },
]

type Card = {
  id: string
  kicker: string
  status: string
  title: string
  detail: string
  rows: { label: string; value: string }[]
  prize: string
  unit: string
}

function liveCards(api: ReturnType<typeof useBuddy>): Record<Exclude<TabId, 'all'>, Card[]> {
  const name = api.active?.name || 'Her'
  const purse = String(api.holdings)
  const scraps = String(api.active?.scrapCount ?? 0)
  const king = api.reign?.name || 'Open seat'
  return {
    duel: [
      {
        id: 'scrap',
        kicker: 'Scrap',
        status: 'Open',
        title: name,
        detail: 'Vigor and mischief do the work. The engine names the winner.',
        rows: [
          { label: 'Entry', value: '10' },
          { label: 'Purse', value: purse },
          { label: 'Scraps', value: scraps },
        ],
        prize: 'POT',
        unit: 'CRYS',
      },
      {
        id: 'staredown',
        kicker: 'Still',
        status: 'Open',
        title: 'Staredown',
        detail: 'No one touches. The hungrier or shyer one looks away.',
        rows: [
          { label: 'Contact', value: 'None' },
          { label: 'Purse', value: purse },
          { label: 'Scraps', value: scraps },
        ],
        prize: '0',
        unit: 'POT',
      },
    ],
    machines: [
      {
        id: 'berserker',
        kicker: 'Build',
        status: 'Aggressive',
        title: 'Berserker',
        detail: 'She pilots it. Heavy offense, thin defence. The day still counts.',
        rows: [
          { label: 'Offense', value: '1.12' },
          { label: 'Defence', value: 'Thin' },
          { label: 'Pilot', value: name },
        ],
        prize: 'SCRAP',
        unit: 'HER',
      },
      {
        id: 'strategist',
        kicker: 'Build',
        status: 'Tactical',
        title: 'Strategist',
        detail: 'Shields cut the other side. She does not hit harder for holding crystals.',
        rows: [
          { label: 'Offense', value: '0.94' },
          { label: 'Shield', value: 'Up' },
          { label: 'Pilot', value: name },
        ],
        prize: 'SCRAP',
        unit: 'HER',
      },
      {
        id: 'parts',
        kicker: 'Core',
        status: 'Plain',
        title: 'Plain core',
        detail: 'No loadout. The traits and the day decide it.',
        rows: [
          { label: 'Offense', value: '1' },
          { label: 'Defence', value: '1' },
          { label: 'Pilot', value: name },
        ],
        prize: 'SCRAP',
        unit: 'HER',
      },
    ],
    king: [
      {
        id: 'throne',
        kicker: 'Throne',
        status: api.reign?.name ? 'Held' : 'Open',
        title: king,
        detail: 'One reign on this save. Win, and her name takes the seat.',
        rows: [
          { label: 'Defenses', value: String(api.reign?.defenses ?? 0) },
          { label: 'Scraps', value: scraps },
          { label: 'Pilot', value: name },
        ],
        prize: 'REIGN',
        unit: 'ONE',
      },
    ],
  }
}

const GATES: (Card & { tab: Exclude<TabId, 'all'> })[] = [
  {
    tab: 'duel',
    id: 'gate-duel',
    kicker: 'Battle',
    status: 'Open',
    title: '1v1',
    detail: 'Two creatures. One prize pool. The engine decides the fight.',
    rows: [
      { label: 'Match', value: 'Her day' },
      { label: 'Entry', value: '10' },
    ],
    prize: '100',
    unit: 'CRYS',
  },
  {
    tab: 'machines',
    id: 'gate-machines',
    kicker: 'Build',
    status: 'Arena',
    title: 'Machines',
    detail: 'Weapons, armour, and a core. The machine fights on its own.',
    rows: [
      { label: 'Builds', value: 'Berserker' },
      { label: 'Also', value: 'Strategist' },
    ],
    prize: 'AI',
    unit: 'FIGHT',
  },
  {
    tab: 'king',
    id: 'gate-king',
    kicker: 'Throne',
    status: 'Occupied',
    title: 'King',
    detail: 'One champion. Win the fight, and the crown is yours.',
    rows: [
      { label: 'Seat', value: '1 king' },
      { label: 'Take', value: 'Fee share' },
    ],
    prize: 'CROWN',
    unit: 'HOLD',
  },
]

function liftCard(event: ReactPointerEvent<HTMLElement>) {
  const card = event.currentTarget
  gsap.set(card, { zIndex: 2 })
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

function CardFace({ card }: { card: Card }) {
  return (
    <div className={card.kicker === 'Featured' ? 'card-face is-featured' : 'card-face'}>
      <div className="challenge-mast">
        <header className="challenge-top">
          <span className="challenge-kicker challenge-bit" data-kicker={card.kicker}>{card.kicker}</span>
          <span className="challenge-status challenge-bit" data-status={card.status}>{card.status}</span>
        </header>
        <h2 className="challenge-title challenge-bit">{card.title}</h2>
        <span className="challenge-prize challenge-bit">
          <strong>{card.prize}</strong>
          <span>{card.unit}</span>
        </span>
      </div>
      <p className="challenge-detail challenge-bit">{card.detail}</p>
      <dl className="challenge-rows">
        {card.rows.map((row) => (
          <div key={`${card.id}-${row.label}-${row.value}`} className="challenge-bit">
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function fightFor(api: ReturnType<typeof useBuddy>, id: string) {
  if (id === 'scrap') return () => api.enterTable('scrap')
  if (id === 'staredown') return () => api.enterTable('staredown')
  if (id === 'berserker') return () => api.enterTable('scrap', 'berserker')
  if (id === 'strategist') return () => api.enterTable('scrap', 'strategist')
  if (id === 'parts') return () => api.enterTable('scrap', 'none')
  if (id === 'throne') return () => api.enterTable('king')
  return undefined
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

export function ChallengeBoard({ open }: { open: boolean }) {
  const api = useBuddy()
  const rootRef = useRef<HTMLDivElement>(null)
  const tabsShown = useRef(false)
  const [picked, setPicked] = useState<TabId | null>(null)
  const showingGates = picked === null
  const live = liveCards(api)
  const cards = showingGates ? GATES : picked === 'all' ? Object.values(live).flat() : live[picked]

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const list = gsap.utils.toArray<HTMLElement>('.challenge-card', root)
    const tabs = root.querySelector('.challenge-tabs')
    const scroller = root.querySelector('.challenge-list')
    if (scroller instanceof HTMLElement) scroller.scrollTop = 0
    if (!open) {
      tabsShown.current = false
      if (picked !== null) setPicked(null)
      root.style.pointerEvents = 'none'
      const faces = root.querySelectorAll('.card-face')
      const shades = root.querySelectorAll('.card-shade')
      gsap.killTweensOf([...faces, ...shades])
      gsap.set(faces, { scale: 1, '--lift': 0, overwrite: true })
      gsap.set(shades, { scale: 1, opacity: 0, overwrite: true })
      gsap.to(list, {
        y: 24,
        scale: 0.92,
        opacity: 0,
        filter: reduce ? 'none' : 'blur(12px)',
        duration: reduce ? 0 : 0.32,
        stagger: reduce ? 0 : 0.03,
        ease: 'power3.in',
      })
      gsap.to(root, { autoAlpha: 0, duration: reduce ? 0 : 0.28, delay: reduce ? 0 : 0.06, ease: 'power2.in', overwrite: 'auto' })
      return
    }
    root.style.pointerEvents = 'auto'
    const tl = gsap.timeline({ defaults: { overwrite: 'auto' } })
    tl.set(root, { autoAlpha: 1 })
    if (tabs && !tabsShown.current) {
      tabsShown.current = true
      tl.fromTo(
        tabs,
        { y: -14, opacity: 0, filter: reduce ? 'none' : 'blur(12px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: reduce ? 0 : 0.52, ease: 'expo.out' },
        0,
      )
    }
    list.forEach((card, index) => {
      const at = reduce ? 0 : 0.05 + index * 0.07
      tl.fromTo(card, {
        y: 36,
        x: -18,
        opacity: 0,
        scale: 0.88,
        filter: reduce ? 'none' : 'blur(16px)',
      }, {
        y: 0,
        x: 0,
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        duration: reduce ? 0 : 0.68,
        ease: 'expo.out',
      }, at)
      const bits = card.querySelectorAll('.challenge-bit')
      tl.fromTo(bits, { y: 12, opacity: 0 }, {
        y: 0,
        opacity: 1,
        duration: reduce ? 0 : 0.4,
        stagger: reduce ? 0 : 0.035,
        ease: 'power3.out',
      }, at + (reduce ? 0 : 0.1))
    })
    return () => {
      tl.kill()
    }
  }, [open, picked])

  return (
    <section className={`challenge-board${open ? ' is-lifted' : ''}`} ref={rootRef} aria-hidden={open ? undefined : true}>
      {picked !== null && (
        <div className="challenge-tabs card-face" role="tablist" aria-label="Challenges">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={picked === item.id}
              className={picked === item.id ? 'is-on' : ''}
              onClick={() => setPicked(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
      <div className={`challenge-list${showingGates ? ' is-gates' : ''}`}>
        {showingGates
          ? <>
            {GATES.map((card) => (
              <article
                key={card.id}
                className="challenge-card is-gate"
                onClick={() => setPicked(card.tab)}
                onPointerEnter={liftCard}
                onPointerLeave={dropCard}
              >
                <span className="card-shade" aria-hidden="true" />
                <CardFace card={card} />
              </article>
            ))}
            <article
              className="challenge-card challenge-promo"
              onClick={() => setPicked('duel')}
              onPointerEnter={liftCard}
              onPointerLeave={dropCard}
            >
              <span className="card-shade" aria-hidden="true" />
              <div className="card-face">
                <p className="challenge-kicker challenge-bit">Open seat</p>
                <h2 className="challenge-bit">Challenge someone</h2>
                <p className="challenge-promo__lead challenge-bit">Put a creature in. They answer with theirs. The pool is the entry fees.</p>
                <div className="challenge-promo__facts challenge-bit">
                  <span><strong>10</strong><small>Entry</small></span>
                  <span><strong>Open</strong><small>Your side</small></span>
                  <span><strong>Open</strong><small>Their side</small></span>
                </div>
              </div>
            </article>
          </>
          : cards.map((card) => (
            <article
              key={card.id}
              className="challenge-card"
              onClick={fightFor(api, card.id)}
              onPointerEnter={liftCard}
              onPointerLeave={dropCard}
            >
              <span className="card-shade" aria-hidden="true" />
              <CardFace card={card} />
            </article>
          ))}
      </div>
    </section>
  )
}
