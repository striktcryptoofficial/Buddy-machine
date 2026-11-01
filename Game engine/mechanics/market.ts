import type { CharmId } from './house'

export const CHARM_PRICE: Record<CharmId, number> = {
  bell: 6,
  sweater: 12,
  crown: 20,
}

export function buyCharm(
  holdings: number,
  charm: CharmId | null,
  pouch: CharmId | null,
  id: CharmId,
): { ok: true; holdings: number; charm: CharmId | null; pouch: CharmId | null } | { ok: false; reason: string } {
  if (charm && pouch) return { ok: false, reason: 'Both hands are full.' }
  const price = CHARM_PRICE[id]
  if (holdings < price) return { ok: false, reason: 'The purse is short.' }
  if (!charm) return { ok: true, holdings: holdings - price, charm: id, pouch }
  return { ok: true, holdings: holdings - price, charm, pouch: id }
}

export function unequipCharm(
  charm: CharmId | null,
  pouch: CharmId | null,
): { ok: true; charm: null; pouch: CharmId } | { ok: false; reason: string } {
  if (!charm) return { ok: false, reason: 'Nothing is worn.' }
  if (pouch) return { ok: false, reason: 'The pouch is full.' }
  return { ok: true, charm: null, pouch: charm }
}

export function wearPouch(
  charm: CharmId | null,
  pouch: CharmId | null,
): { ok: true; charm: CharmId; pouch: null } | { ok: false; reason: string } {
  if (!pouch) return { ok: false, reason: 'The pouch is empty.' }
  if (charm) return { ok: false, reason: 'Take off the one she is wearing.' }
  return { ok: true, charm: pouch, pouch: null }
}
