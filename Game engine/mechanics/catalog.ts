import type { CharmId } from './house'
import { buyCharm } from './market'

export type Lane = 'charm' | 'care' | 'field' | 'arena' | 'house'
export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary'

export type Goods = {
  id: string
  name: string
  line: string
  price: number
  lane: Lane
  rarity: Rarity
  charm?: CharmId
}

export type Bundle = {
  id: string
  name: string
  line: string
  price: number
  was: number
  tag: string
  items: { id: string; qty: number }[]
}

export type CartLine = { id: string; qty: number }

/** Fraction off the shelf price. */
export const SALE: Record<string, number> = {
  biscuit: 0.25,
  satchel: 0.15,
}

export const GOODS: Goods[] = [
  { id: 'bell', name: 'Bell', line: 'A small sound when she moves.', price: 6, lane: 'charm', rarity: 'common', charm: 'bell' },
  { id: 'sweater', name: 'Sweater', line: 'Warm. She keeps it on.', price: 12, lane: 'charm', rarity: 'uncommon', charm: 'sweater' },
  { id: 'crown', name: 'Crown', line: 'For the one who holds the chair.', price: 20, lane: 'charm', rarity: 'rare', charm: 'crown' },
  { id: 'milk', name: 'Milk', line: 'A sip. The bowl likes it.', price: 2, lane: 'care', rarity: 'common' },
  { id: 'biscuit', name: 'Biscuit', line: 'One treat. She notices.', price: 4, lane: 'care', rarity: 'common' },
  { id: 'brush', name: 'Brush', line: 'A slow groom, if she allows it.', price: 8, lane: 'care', rarity: 'uncommon' },
  { id: 'nap-oil', name: 'Nap oil', line: 'She sleeps deeper.', price: 14, lane: 'care', rarity: 'rare' },
  { id: 'ribbon', name: 'Ribbon', line: 'Tied once. She pretends not to care.', price: 18, lane: 'care', rarity: 'rare' },
  { id: 'crumb-map', name: 'Crumb map', line: 'A short way out and back.', price: 6, lane: 'field', rarity: 'common' },
  { id: 'lantern', name: 'Lantern', line: 'Light for a late return.', price: 10, lane: 'field', rarity: 'uncommon' },
  { id: 'satchel', name: 'Satchel', line: 'Room for what she finds.', price: 16, lane: 'field', rarity: 'rare' },
  { id: 'compass', name: 'Compass', line: 'She stops getting turned around.', price: 22, lane: 'field', rarity: 'rare' },
  { id: 'wrap', name: 'Hand wrap', line: 'For a short scrap.', price: 5, lane: 'arena', rarity: 'common' },
  { id: 'stare-glass', name: 'Stare glass', line: 'She holds a look longer.', price: 11, lane: 'arena', rarity: 'uncommon' },
  { id: 'mark', name: 'Battle mark', line: 'A count of scraps she has won.', price: 15, lane: 'arena', rarity: 'uncommon' },
  { id: 'crown-cloth', name: 'Crown cloth', line: 'Laid on the chair before a reign.', price: 28, lane: 'arena', rarity: 'legendary' },
  { id: 'tape', name: 'House tape', line: 'A note the street can read.', price: 7, lane: 'house', rarity: 'common' },
  { id: 'bell-stand', name: 'Bell stand', line: 'The bell has a place.', price: 9, lane: 'house', rarity: 'uncommon' },
  { id: 'name-plate', name: 'Name plate', line: 'Her name, cut and set.', price: 24, lane: 'house', rarity: 'legendary' },
]

export const BUNDLES: Bundle[] = [
  {
    id: 'street-kit',
    name: 'Street kit',
    line: 'A bell, a biscuit, and wraps for the first scrap.',
    price: 11,
    was: 15,
    tag: 'Street',
    items: [
      { id: 'bell', qty: 1 },
      { id: 'biscuit', qty: 1 },
      { id: 'wrap', qty: 1 },
    ],
  },
  {
    id: 'night-out',
    name: 'Night out',
    line: 'Lantern, nap oil, and two milks. She can stay out.',
    price: 20,
    was: 28,
    tag: 'This week',
    items: [
      { id: 'lantern', qty: 1 },
      { id: 'nap-oil', qty: 1 },
      { id: 'milk', qty: 2 },
    ],
  },
  {
    id: 'throne-set',
    name: 'Throne set',
    line: 'Crown, cloth, and stare glass. The chair is dressed.',
    price: 44,
    was: 59,
    tag: 'Reign',
    items: [
      { id: 'crown', qty: 1 },
      { id: 'crown-cloth', qty: 1 },
      { id: 'stare-glass', qty: 1 },
    ],
  },
]

export const FEATURED_ID = 'night-out'

const goodsById = new Map(GOODS.map((item) => [item.id, item]))
const bundleById = new Map(BUNDLES.map((item) => [item.id, item]))

export function goodsBy(id: string) {
  return goodsById.get(id) ?? null
}

export function bundleBy(id: string) {
  return bundleById.get(id) ?? null
}

export function unitPrice(item: Goods) {
  const off = SALE[item.id] ?? 0
  return Math.max(1, Math.round(item.price * (1 - off)))
}

export function linePrice(id: string) {
  const bundle = bundleById.get(id)
  if (bundle) return bundle.price
  const item = goodsById.get(id)
  return item ? unitPrice(item) : 0
}

export function expand(lines: CartLine[]): { id: string; qty: number }[] {
  const merged = new Map<string, number>()
  for (const line of lines) {
    const qty = Math.max(0, Math.floor(line.qty))
    if (!qty) continue
    const bundle = bundleById.get(line.id)
    if (bundle) {
      for (const part of bundle.items) {
        merged.set(part.id, (merged.get(part.id) ?? 0) + part.qty * qty)
      }
      continue
    }
    if (!goodsById.has(line.id)) continue
    merged.set(line.id, (merged.get(line.id) ?? 0) + qty)
  }
  return [...merged.entries()].map(([id, qty]) => ({ id, qty }))
}

export function cartTotal(lines: CartLine[]) {
  return lines.reduce((sum, line) => sum + linePrice(line.id) * Math.max(0, Math.floor(line.qty)), 0)
}

export function settle(
  holdings: number,
  charm: CharmId | null,
  pouch: CharmId | null,
  bag: Record<string, number>,
  lines: CartLine[],
):
  | { ok: true; holdings: number; charm: CharmId | null; pouch: CharmId | null; bag: Record<string, number>; line: string }
  | { ok: false; reason: string } {
  const clean = lines.filter((line) => line.qty > 0 && (goodsById.has(line.id) || bundleById.has(line.id)))
  if (!clean.length) return { ok: false, reason: 'The basket is empty.' }
  const total = cartTotal(clean)
  if (holdings < total) return { ok: false, reason: 'The purse is short.' }

  let nextCharm = charm
  let nextPouch = pouch
  let nextHoldings = holdings
  const nextBag = { ...bag }

  for (const part of expand(clean)) {
    const item = goodsById.get(part.id)
    if (!item) return { ok: false, reason: 'That is not on the shelf.' }
    if (item.charm) {
      for (let n = 0; n < part.qty; n += 1) {
        const bought = buyCharm(holdings, nextCharm, nextPouch, item.charm)
        if (!bought.ok) return bought
        nextCharm = bought.charm
        nextPouch = bought.pouch
      }
      continue
    }
    nextBag[item.id] = (nextBag[item.id] ?? 0) + part.qty
  }

  nextHoldings -= total
  const count = clean.reduce((sum, line) => sum + line.qty, 0)
  const line = count === 1 ? 'One thing came home.' : `${count} things came home.`
  return { ok: true, holdings: nextHoldings, charm: nextCharm, pouch: nextPouch, bag: nextBag, line }
}
