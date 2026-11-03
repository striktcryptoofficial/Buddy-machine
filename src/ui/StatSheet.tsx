import { useLayoutEffect, useRef, useState } from 'react'
import { Brain, Clover, Shield, Sparkles, Swords, Zap, type LucideIcon } from 'lucide-react'
import gsap from 'gsap'
import { useBuddy } from '../../Game engine/mechanics/store'
import './cards/stat.css'

type Stat = { code: string; name: string; value: number; icon: LucideIcon }

function luckValue(rarity: string | undefined) {
  if (rarity === 'common') return 20
  if (rarity === 'uncommon') return 40
  if (rarity === 'rare') return 60
  if (rarity === 'legendary') return 80
  return 0
}

function radarPoint(index: number, amount: number, cx: number, cy: number, radius: number, count: number) {
  const angle = -Math.PI / 2 + (index * Math.PI * 2) / count
  return [cx + Math.cos(angle) * radius * amount, cy + Math.sin(angle) * radius * amount]
}

function Radar({ stats }: { stats: Stat[] }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [box, setBox] = useState({ w: 0, h: 0 })

  useLayoutEffect(() => {
    const parent = svgRef.current?.parentElement
    if (!parent) return
    const measure = () => {
      const rect = parent.getBoundingClientRect()
      const w = Math.round(rect.width)
      const h = Math.round(rect.height)
      setBox((prev) => (prev.w === w && prev.h === h ? prev : { w, h }))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(parent)
    return () => observer.disconnect()
  }, [])

  const w = Math.max(box.w, 1)
  const h = Math.max(box.h, 1)
  const labelPad = 22
  const gap = 16
  const side = Math.cos((18 * Math.PI) / 180)
  const lower = Math.sin((54 * Math.PI) / 180)
  const radius = Math.max(24, Math.min(
    (w / 2 - labelPad) / side - gap,
    (h - labelPad * 2) / (1 + lower) - gap,
  ))
  const span = (radius + gap) * (1 + lower)
  const cx = w / 2
  const cy = (h - span) / 2 + radius + gap
  const rings = [0.25, 0.5, 0.75, 1]
  const shape = stats.map((stat, index) => radarPoint(index, stat.value / 100, cx, cy, radius, 5).join(',')).join(' ')
  const label = stats.map((stat) => `${stat.name} ${stat.value}`).join(', ')

  return (
    <svg
      ref={svgRef}
      className="stat-sheet__radar"
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label={label}
    >
      {rings.map((ring) => (
        <polygon
          key={ring}
          className="stat-sheet__ring"
          points={stats.map((_, index) => radarPoint(index, ring, cx, cy, radius, 5).join(',')).join(' ')}
          fill="none"
        />
      ))}
      {stats.map((_, index) => {
        const [x, y] = radarPoint(index, 1, cx, cy, radius, 5)
        return <line key={index} className="stat-sheet__spoke" x1={cx} y1={cy} x2={x} y2={y} />
      })}
      <polygon className="stat-sheet__shape" points={shape} />
      {stats.map((stat, index) => {
        const [x, y] = radarPoint(index, stat.value / 100, cx, cy, radius, 5)
        return <circle key={`${stat.code}-mark`} className="stat-sheet__mark" cx={x} cy={y} r="2.5" />
      })}
      {stats.map((stat, index) => {
        const [x, y] = radarPoint(index, 1, cx, cy, radius + gap, 5)
        return (
          <text key={stat.code} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="14">
            {stat.code}
          </text>
        )
      })}
    </svg>
  )
}

export function StatSheet({ open }: { open: boolean }) {
  const api = useBuddy()
  const buddy = api.active
  const name = buddy?.name || 'Her'
  const stats: Stat[] = [
    { code: 'STR', name: 'Strength', value: Math.round((buddy?.personality.vigor ?? 0) * 100), icon: Swords },
    { code: 'INT', name: 'Intelligence', value: Math.round((buddy?.personality.curiosity ?? 0) * 100), icon: Brain },
    { code: 'SPD', name: 'Speed', value: Math.round((((buddy?.personality.vigor ?? 0) + (buddy?.personality.mischief ?? 0)) / 2) * 100), icon: Zap },
    { code: 'DEF', name: 'Defense', value: Math.round((buddy?.personality.independence ?? 0) * 100), icon: Shield },
    { code: 'LCK', name: 'Luck', value: luckValue(buddy?.dna.rarity), icon: Clover },
  ]
  const elements = [
    { name: buddy?.dna.coatName || 'Coat', note: buddy?.dna.rarity || 'unhatched' },
    { name: name, note: buddy?.awakenedAt ? 'Awake' : 'Cat' },
  ]
  const rootRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const face = root.querySelector<HTMLElement>('.stat-sheet__face')
    const bits = root.querySelectorAll<HTMLElement>('.stat-sheet__head > *, .stat-sheet__block, .stat-sheet__plot, .stat-sheet__chip, .stat-sheet__stats li')
    const fills = root.querySelectorAll<HTMLElement>('.stat-sheet__fill')
    gsap.killTweensOf([root, face, bits, fills])
    if (!open) {
      root.style.pointerEvents = 'none'
      gsap.to(bits, {
        y: 10,
        opacity: 0,
        duration: reduce ? 0 : 0.2,
        stagger: reduce ? 0 : 0.015,
        ease: 'power2.in',
      })
      gsap.to(face, {
        x: 24,
        scale: 0.96,
        opacity: 0,
        filter: reduce ? 'none' : 'blur(12px)',
        duration: reduce ? 0 : 0.34,
        ease: 'power3.in',
      })
      gsap.to(root, { autoAlpha: 0, duration: reduce ? 0 : 0.28, delay: reduce ? 0 : 0.06, ease: 'power2.in' })
      return
    }
    root.style.pointerEvents = 'auto'
    gsap.set(root, { autoAlpha: 1 })
    gsap.fromTo(
      face,
      { x: 40, scale: 0.94, opacity: 0, filter: reduce ? 'none' : 'blur(16px)' },
      {
        x: 0,
        scale: 1,
        opacity: 1,
        filter: 'blur(0px)',
        duration: reduce ? 0 : 0.68,
        ease: 'expo.out',
      },
    )
    gsap.fromTo(
      bits,
      { y: 18, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: reduce ? 0 : 0.5,
        stagger: reduce ? 0 : 0.035,
        delay: reduce ? 0 : 0.1,
        ease: 'power3.out',
      },
    )
    fills.forEach((fill, index) => {
      gsap.fromTo(
        fill,
        { width: '0%' },
        {
          width: `${fill.dataset.value}%`,
          duration: reduce ? 0 : 0.55,
          ease: 'expo.out',
          delay: reduce ? 0 : 0.22 + index * 0.05,
        },
      )
    })
  }, [open])

  return (
    <aside className={`stat-sheet${open ? ' is-open' : ''}`} ref={rootRef} aria-hidden={open ? undefined : true} aria-label={`${name} stats`}>
      <div className="card-face stat-sheet__face">
        <header className="stat-sheet__head">
          <p className="stat-sheet__kicker">Creature</p>
          <h2>{name}</h2>
          <p className="stat-sheet__sign">
            <Sparkles strokeWidth={1.75} aria-hidden="true" />
            {buddy?.dna.coatName || 'Unhatched'}
          </p>
        </header>

        <section className="stat-sheet__block">
          <h3>Elements</h3>
          <div className="stat-sheet__elements">
            {elements.map((element) => (
              <span key={`${element.name}-${element.note}`} className={`stat-sheet__chip stat-sheet__chip--${element.name.toLowerCase()}`}>
                <strong>{element.name}</strong>
                {element.note}
              </span>
            ))}
          </div>
        </section>

        <section className="stat-sheet__block">
          <h3>Scraps</h3>
          <div className="stat-sheet__level">
            <span>{String(buddy?.scrapCount ?? 0).padStart(2, '0')}</span>
            <div className="stat-sheet__track">
              <i className="stat-sheet__xp" />
            </div>
          </div>
        </section>

        <div className="stat-sheet__plot">
          <Radar stats={stats} />
        </div>

        <section className="stat-sheet__block stat-sheet__stats">
          <h3>Stats</h3>
          <ul>
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <li key={stat.code}>
                  <Icon strokeWidth={1.75} aria-hidden="true" />
                  <span>{stat.name}</span>
                  <span className="stat-sheet__meter" aria-hidden="true">
                    <i className="stat-sheet__fill" data-value={stat.value} />
                  </span>
                  <strong>{stat.value}</strong>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </aside>
  )
}
