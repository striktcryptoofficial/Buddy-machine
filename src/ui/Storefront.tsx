import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import {
  Backpack,
  Bell,
  Compass,
  Cookie,
  Crown,
  Gem,
  Gift,
  Lamp,
  Map,
  Moon,
  Ribbon,
  ScrollText,
  Shirt,
  Sparkles,
  Swords,
  Tag,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useBuddy } from '../../Game engine/mechanics/store'
import {
  BUNDLES,
  FEATURED_ID,
  GOODS,
  SALE,
  bundleBy,
  cartTotal,
  goodsBy,
  unitPrice,
  type Bundle,
  type CartLine,
  type Goods,
  type Lane,
} from '../../Game engine/mechanics/catalog'

type Shelf = 'all' | 'deals' | Lane | 'bundle'

const LANES: { id: Shelf; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'deals', label: 'Deals' },
  { id: 'charm', label: 'Charms' },
  { id: 'care', label: 'Care' },
  { id: 'field', label: 'Field' },
  { id: 'arena', label: 'Arena' },
  { id: 'house', label: 'House' },
  { id: 'bundle', label: 'Bundles' },
]

const ICONS: Record<string, LucideIcon> = {
  bell: Bell,
  sweater: Shirt,
  crown: Crown,
  milk: Cookie,
  biscuit: Cookie,
  brush: Sparkles,
  'nap-oil': Moon,
  ribbon: Ribbon,
  'crumb-map': Map,
  lantern: Lamp,
  satchel: Backpack,
  compass: Compass,
  wrap: Swords,
  'stare-glass': Gem,
  mark: Tag,
  'crown-cloth': Crown,
  tape: ScrollText,
  'bell-stand': Bell,
  'name-plate': Sparkles,
  'street-kit': Gift,
  'night-out': Lamp,
  'throne-set': Crown,
}

function IconFor({ id }: { id: string }) {
  const Icon = ICONS[id] ?? Gift
  return <Icon strokeWidth={1.75} aria-hidden="true" />
}

function ownedCount(id: string, charm: string | null, pouch: string | null, bag: Record<string, number>) {
  const item = goodsBy(id)
  if (item?.charm) return (charm === item.charm ? 1 : 0) + (pouch === item.charm ? 1 : 0)
  return bag[id] ?? 0
}

export function Storefront({ onClose }: { onClose: () => void }) {
  const api = useBuddy()
  const gridRef = useRef<HTMLDivElement>(null)
  const firstLane = useRef(true)
  const [lane, setLane] = useState<Shelf>('all')
  const [cart, setCart] = useState<CartLine[]>([])
  const [note, setNote] = useState('')
  const featured = bundleBy(FEATURED_ID)

  useLayoutEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    if (firstLane.current) {
      firstLane.current = false
      return
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const cards = grid.querySelectorAll<HTMLElement>('.store-card')
    const bits = grid.querySelectorAll<HTMLElement>('.store-card > *, .store-card footer > *')
    gsap.killTweensOf([cards, bits])
    gsap.fromTo(
      cards,
      { y: 24, scale: 0.9, opacity: 0, filter: reduce ? 'none' : 'blur(12px)' },
      {
        y: 0,
        scale: 1,
        opacity: 1,
        filter: 'blur(0px)',
        duration: reduce ? 0 : 0.55,
        stagger: reduce ? 0 : { amount: 0.36, from: 'start' },
        ease: 'expo.out',
        onComplete() {
          gsap.set(cards, { clearProps: 'transform,filter' })
        },
      },
    )
    gsap.fromTo(
      bits,
      { y: 8, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: reduce ? 0 : 0.36,
        stagger: reduce ? 0 : { amount: 0.28, from: 'start' },
        delay: reduce ? 0 : 0.06,
        ease: 'power3.out',
        onComplete() {
          gsap.set(bits, { clearProps: 'transform' })
        },
      },
    )
  }, [lane])

  const goods = useMemo(() => {
    if (lane === 'bundle') return []
    if (lane === 'deals') return GOODS.filter((item) => SALE[item.id])
    if (lane === 'all') return GOODS
    return GOODS.filter((item) => item.lane === lane)
  }, [lane])

  const bundles = lane === 'all' || lane === 'deals' || lane === 'bundle' ? BUNDLES : []
  const total = cartTotal(cart)

  function add(id: string) {
    setNote('')
    setCart((prev) => {
      const hit = prev.find((line) => line.id === id)
      if (!hit) return [...prev, { id, qty: 1 }]
      return prev.map((line) => (line.id === id ? { ...line, qty: line.qty + 1 } : line))
    })
  }

  function setQty(id: string, qty: number) {
    setCart((prev) => (qty <= 0 ? prev.filter((line) => line.id !== id) : prev.map((line) => (line.id === id ? { ...line, qty } : line))))
  }

  function pay() {
    const line = api.checkout(cart)
    setNote(line)
    if (line.endsWith('came home.')) setCart([])
  }

  return (
    <div className="store">
      <header className="store__bar">
        <div>
          <p className="store__kicker">Store</p>
          <h2 id="shop-title">The shelf</h2>
        </div>
        <p className="store__purse">
          <Gem strokeWidth={1.75} aria-hidden="true" />
          <strong>{api.holdings}</strong>
          <span>crystals</span>
        </p>
        <button type="button" className="store__x" aria-label="Close shop" onClick={onClose}>
          <X strokeWidth={1.75} />
        </button>
      </header>

      {featured ? (
        <section className="store__promo" aria-label={featured.name}>
          <div className="store__promo-copy">
            <p className="store__promo-tag">{featured.tag}</p>
            <div className="store__promo-text">
              <h3>{featured.name}</h3>
              <p>{featured.line}</p>
            </div>
          </div>
          <ul className="store__promo-kit">
            {featured.items.map((part) => (
              <li key={part.id}>
                <span className="store__promo-icon">
                  <IconFor id={part.id} />
                </span>
                <span className="store__promo-piece">
                  <strong>{goodsBy(part.id)?.name ?? part.id}</strong>
                  <small>×{part.qty}</small>
                </span>
              </li>
            ))}
          </ul>
          <div className="store__promo-deal">
            <div className="store__promo-offer">
              <p className="store__promo-save">Save {featured.was - featured.price}</p>
              <p className="store__promo-was">
                Was <s>{featured.was}</s>
              </p>
              <p className="store__promo-price">
                <strong>{featured.price}</strong>
                <span>crystals</span>
              </p>
            </div>
            <button type="button" className="store__promo-buy" onClick={() => add(featured.id)}>
              Add bundle
            </button>
          </div>
        </section>
      ) : null}

      <div className="store__lanes" role="tablist" aria-label="Shelves">
        {LANES.map((item) => (
          <button
            type="button"
            key={item.id}
            role="tab"
            aria-selected={lane === item.id}
            className={lane === item.id ? 'is-on' : undefined}
            onClick={() => setLane(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="store__body">
        <div className="store__grid" ref={gridRef}>
          {bundles.map((bundle) => (
            <BundleCard key={bundle.id} bundle={bundle} onAdd={() => add(bundle.id)} />
          ))}
          {goods.map((item) => (
            <GoodsCard
              key={item.id}
              item={item}
              owned={ownedCount(item.id, api.charm, api.pouch, api.bag)}
              onAdd={() => add(item.id)}
            />
          ))}
        </div>

        <aside className="store__cart" aria-label="Basket">
          <p className="store__kicker">Basket</p>
          <div className="store__cart-list">
            {cart.length === 0 ? <p className="store__empty">Nothing yet.</p> : null}
            <ul>
              {cart.map((line) => {
                const item = goodsBy(line.id)
                const bundle = bundleBy(line.id)
                const name = item?.name ?? bundle?.name ?? line.id
                return (
                  <li key={line.id}>
                    <span>
                      <strong>{name}</strong>
                      <small>{linePriceLabel(line.id, line.qty)}</small>
                    </span>
                    <span className="store__qty">
                      <button type="button" aria-label={`Fewer ${name}`} onClick={() => setQty(line.id, line.qty - 1)}>
                        −
                      </button>
                      <b>{line.qty}</b>
                      <button type="button" aria-label={`More ${name}`} onClick={() => setQty(line.id, line.qty + 1)}>
                        +
                      </button>
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
          <div className="store__cart-foot">
            <p className="store__total">
              <span>Total</span>
              <strong>{total}</strong>
            </p>
            <button type="button" className="store__pay" disabled={cart.length === 0} onClick={pay}>
              Buy
            </button>
            {note ? <p className="store__note">{note}</p> : null}
          </div>
        </aside>
      </div>
    </div>
  )
}

function linePriceLabel(id: string, qty: number) {
  const bundle = bundleBy(id)
  if (bundle) return `${bundle.price * qty} crystals`
  const item = goodsBy(id)
  if (!item) return ''
  return `${unitPrice(item) * qty} crystals`
}

function GoodsCard({ item, owned, onAdd }: { item: Goods; owned: number; onAdd: () => void }) {
  const price = unitPrice(item)
  const sale = SALE[item.id]
  return (
    <article className={`store-card is-${item.rarity}`}>
      <span className="store-card__mark">
        <IconFor id={item.id} />
      </span>
      <p className="store-card__rarity">{item.rarity}</p>
      <h3>{item.name}</h3>
      <p>{item.line}</p>
      <footer>
        <span className="store-card__price">
          {sale ? <s>{item.price}</s> : null}
          <strong>{price}</strong>
        </span>
        <span className="store-card__own">{owned ? `${owned} owned` : 'Shelf'}</span>
        <button type="button" onClick={onAdd}>
          Add
        </button>
      </footer>
    </article>
  )
}

function BundleCard({ bundle, onAdd }: { bundle: Bundle; onAdd: () => void }) {
  return (
    <article className="store-card is-bundle">
      <span className="store-card__mark">
        <IconFor id={bundle.id} />
      </span>
      <p className="store-card__rarity">{bundle.tag}</p>
      <h3>{bundle.name}</h3>
      <p>{bundle.line}</p>
      <footer>
        <span className="store-card__price">
          <s>{bundle.was}</s>
          <strong>{bundle.price}</strong>
        </span>
        <span className="store-card__own">{bundle.items.length} pieces</span>
        <button type="button" onClick={onAdd}>
          Add
        </button>
      </footer>
    </article>
  )
}
