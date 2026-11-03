import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Bell, Crown, Plus, Shirt } from 'lucide-react'
import { useBuddy } from '../../Game engine/mechanics/store'
import type { CharmId } from '../../Game engine/mechanics/house'

const PRICE: Record<CharmId, number> = { bell: 6, sweater: 12, crown: 20 }
const SHOP: CharmId[] = ['bell', 'sweater', 'crown']
const BAG_SLOTS = 12

function CharmIcon({ id }: { id: CharmId }) {
  if (id === 'bell') return <Bell strokeWidth={1.75} />
  if (id === 'sweater') return <Shirt strokeWidth={1.75} />
  return <Crown strokeWidth={1.75} />
}

function nameOf(id: CharmId) {
  return id.charAt(0).toUpperCase() + id.slice(1)
}

export function PurseSheet() {
  const api = useBuddy()
  const [note, setNote] = useState('')
  const [shop, setShop] = useState(false)

  useEffect(() => {
    if (!shop) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      setShop(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [shop])
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
        <button type="button" onClick={() => setShop(true)}>Shop</button>
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
              <button type="button" className="purse-slot is-empty" key={index} aria-label="Open shop" onClick={() => setShop(true)}>
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
      {shop
        ? createPortal(
            <div className="shop-modal" role="dialog" aria-modal="true" aria-labelledby="shop-title">
              <button type="button" className="shop-modal__scrim" aria-label="Close shop" onClick={() => setShop(false)} />
              <div className="shop-modal__card">
                <p className="shop-modal__kicker">Shop</p>
                <h2 id="shop-title">Buy an item</h2>
                <div className="shop-modal__grid">
                  {SHOP.map((id) => (
                    <button type="button" key={id} onClick={() => run(() => api.buy(id))}>
                      <CharmIcon id={id} />
                      <span>{nameOf(id)}</span>
                      <small>{PRICE[id]} crystals</small>
                    </button>
                  ))}
                </div>
                {note ? <p className="shop-modal__note">{note}</p> : null}
              </div>
            </div>,
            document.body,
          )
        : null}
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
