import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { Bell, Crown, Plus, Shirt } from 'lucide-react'
import { useBuddy } from '../../Game engine/mechanics/store'
import type { CharmId } from '../../Game engine/mechanics/house'
import { goodsBy } from '../../Game engine/mechanics/catalog'
import { Storefront } from './Storefront'

const BAG_SLOTS = 12

function CharmIcon({ id }: { id: CharmId }) {
  if (id === 'bell') return <Bell strokeWidth={1.75} />
  if (id === 'sweater') return <Shirt strokeWidth={1.75} />
  return <Crown strokeWidth={1.75} />
}

function nameOf(id: CharmId) {
  return id.charAt(0).toUpperCase() + id.slice(1)
}

export function PurseSheet({ onOpenShop }: { onOpenShop?: () => void }) {
  const api = useBuddy()
  const [note, setNote] = useState('')
  const season = api.season
  const seasonLine = !season
    ? 'No season yet'
    : season.claimed
      ? `Season ${season.key} is marked`
      : season.ready
        ? `Season ${season.key} can be marked`
        : `Season ${season.key} needs ${season.missing.join(' and ')}`

  function run(action: () => string) {
    setNote(action())
  }

  const held: { id: CharmId; where: 'worn' | 'pouch' }[] = []
  if (api.charm) held.push({ id: api.charm, where: 'worn' })
  if (api.pouch) held.push({ id: api.pouch, where: 'pouch' })

  return (
    <section className="purse-sheet" aria-label="Inventory">
      <div className="purse-sheet__head">
        <h2>Inventory</h2>
        <button type="button" onClick={() => onOpenShop?.()}>Shop</button>
      </div>
      <div className="purse-sheet__crystal">
        <span>Crystals</span>
        <strong>{api.holdings}</strong>
        <button type="button" onClick={() => run(() => api.pour(4))}>Pour</button>
      </div>
      <div className="purse-sheet__grid">
        {Array.from({ length: BAG_SLOTS }, (_, index) => {
          const item = held[index]
          if (!item) {
            return (
              <button type="button" className="purse-slot is-empty" key={index} aria-label="Open shop" onClick={() => onOpenShop?.()}>
                <Plus strokeWidth={1.75} />
              </button>
            )
          }
          return (
            <button
              type="button"
              className={`purse-slot is-filled${item.where === 'worn' ? ' is-worn' : ''}`}
              key={`${item.where}-${item.id}`}
              onClick={() => run(() => (item.where === 'worn' ? api.unequip() : api.wear()))}
            >
              <CharmIcon id={item.id} />
              <span>{nameOf(item.id)}</span>
              <small>{item.where === 'worn' ? 'Worn' : 'Pouch'}</small>
            </button>
          )
        })}
      </div>
      {Object.entries(api.bag).some(([, count]) => count > 0) ? (
        <ul className="purse-bag">
          {Object.entries(api.bag)
            .filter(([, count]) => count > 0)
            .map(([id, count]) => (
              <li key={id}>
                <span>{goodsBy(id)?.name ?? id}</span>
                <strong>{count}</strong>
              </li>
            ))}
        </ul>
      ) : null}
      <p className="purse-sheet__meta">
        Bowl {api.bowl}
        {api.reign?.name ? ` · Reign ${api.reign.name}` : ''}
        {` · ${seasonLine}`}
      </p>
      <div className="purse-sheet__actions">
        <button type="button" onClick={() => run(() => api.claimSeason())}>Mark season</button>
        {note ? <p className="purse-sheet__note">{note}</p> : null}
      </div>
    </section>
  )
}

export function ShopModal({ onClose }: { onClose: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  const leavingRef = useRef(false)
  const [leaving, setLeaving] = useState(false)
  onCloseRef.current = onClose

  function requestClose() {
    if (leavingRef.current) return
    leavingRef.current = true
    setLeaving(true)
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      requestClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const card = root.querySelector<HTMLElement>('.shop-modal__card')
    const blocks = root.querySelectorAll<HTMLElement>('.store__bar, .store__promo, .store__lanes')
    const cards = root.querySelectorAll<HTMLElement>('.store__promo-kit li, .store-card, .store__cart')
    const bits = root.querySelectorAll<HTMLElement>(
      '.store__bar > *, .store__promo-tag, .store__promo-text > *, .store__promo-piece > *, .store__promo-offer > *, .store__promo-buy, .store__lanes button, .store-card > *, .store-card footer > *, .store__cart > *, .store__cart-foot > *',
    )
    const scrim = root.querySelector<HTMLElement>('.shop-modal__scrim')
    const nodes = [card, scrim, ...blocks, ...cards, ...bits].filter((node): node is HTMLElement => node instanceof HTMLElement)
    gsap.killTweensOf([root, ...nodes])
    if (leaving) {
        if (scrim) scrim.style.pointerEvents = 'none'
        if (card) card.style.pointerEvents = 'none'
        gsap.to(bits, { y: 8, opacity: 0, duration: reduce ? 0 : 0.16, stagger: reduce ? 0 : 0.006, ease: 'power2.in' })
        gsap.to(cards, {
          y: 22,
          scale: 0.92,
          opacity: 0,
          filter: reduce ? 'none' : 'blur(12px)',
          duration: reduce ? 0 : 0.28,
          stagger: reduce ? 0 : { amount: 0.18 },
          ease: 'power3.in',
        })
        gsap.to(blocks, { y: 14, opacity: 0, duration: reduce ? 0 : 0.24, stagger: reduce ? 0 : 0.03, ease: 'power3.in' })
        if (card) {
          gsap.to(card, {
            y: 24,
            scale: 0.96,
            autoAlpha: 0,
            filter: reduce ? 'none' : 'blur(14px)',
            duration: reduce ? 0 : 0.32,
            delay: reduce ? 0 : 0.04,
            ease: 'power3.in',
          })
        }
        gsap.to(root, {
          autoAlpha: 0,
          duration: reduce ? 0 : 0.26,
          delay: reduce ? 0 : 0.08,
          ease: 'power2.in',
          onComplete() {
            queueMicrotask(() => onCloseRef.current())
          },
        })
        return
      }
      root.style.pointerEvents = 'none'
      gsap.set(root, { autoAlpha: 1 })
      if (card) {
        gsap.fromTo(
          card,
          { y: 36, scale: 0.94, autoAlpha: 0, filter: reduce ? 'none' : 'blur(16px)' },
          {
            y: 0,
            scale: 1,
            autoAlpha: 1,
            filter: 'blur(0px)',
            duration: reduce ? 0 : 0.62,
            ease: 'expo.out',
            onComplete() {
              gsap.set(card, { clearProps: 'transform,filter' })
            },
          },
        )
      }
      gsap.fromTo(
        blocks,
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: reduce ? 0 : 0.5, stagger: reduce ? 0 : 0.06, delay: reduce ? 0 : 0.06, ease: 'expo.out' },
      )
      gsap.fromTo(
        cards,
        { y: 28, scale: 0.88, opacity: 0, filter: reduce ? 'none' : 'blur(14px)' },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)',
          duration: reduce ? 0 : 0.62,
          stagger: reduce ? 0 : { amount: 0.42, from: 'start' },
          delay: reduce ? 0 : 0.1,
          ease: 'expo.out',
          onComplete() {
            gsap.set(cards, { clearProps: 'transform,filter' })
            root.style.pointerEvents = 'none'
          },
        },
      )
      gsap.fromTo(
        bits,
        { y: 10, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: reduce ? 0 : 0.4,
          stagger: reduce ? 0 : { amount: 0.38, from: 'start' },
          delay: reduce ? 0 : 0.16,
          ease: 'power3.out',
          onComplete() {
            gsap.set(bits, { clearProps: 'transform' })
          },
        },
      )
    return () => {
      gsap.killTweensOf([root, ...nodes])
    }
  }, [leaving])

  return createPortal(
    <div className="shop-modal" ref={rootRef} role="dialog" aria-modal="true" aria-labelledby="shop-title">
      <button type="button" className="shop-modal__scrim" aria-label="Close shop" onClick={requestClose} />
      <div className="shop-modal__card is-store">
        <Storefront onClose={requestClose} />
      </div>
    </div>,
    document.body,
  )
}
