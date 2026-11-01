import { useState } from 'react'
import { useBuddy } from '../../Game engine/mechanics/store'
import type { CharmId } from '../../Game engine/mechanics/house'

const PRICE: Record<CharmId, number> = { bell: 6, sweater: 12, crown: 20 }

function word(id: CharmId | null) {
  if (!id) return 'nothing'
  return id
}

export function PurseSheet() {
  const api = useBuddy()
  const [note, setNote] = useState('')
  const season = api.season
  const seasonLine = !season
    ? 'No season yet.'
    : season.claimed
      ? `Season ${season.key} is marked.`
      : season.ready
        ? `Season ${season.key} can be marked.`
        : `Season ${season.key} still needs ${season.missing.join(' and ')}.`

  function run(action: () => string) {
    setNote(action())
  }

  return (
    <aside className="purse-sheet" aria-label="Inventory">
      <header>
        <h2>Inventory</h2>
      </header>
      <p>Crystals {api.holdings}. Bowl {api.bowl}.</p>
      <p>Wearing {word(api.charm)}. Pouch {word(api.pouch)}.</p>
      {api.reign?.name ? <p>Reign {api.reign.name}.</p> : null}
      <p>{seasonLine}</p>
      {note ? <p className="purse-sheet__note">{note}</p> : null}
      <div className="purse-sheet__actions">
        <button type="button" onClick={() => run(() => api.pour(4))}>Pour 4</button>
        <button type="button" onClick={() => run(() => api.buy('bell'))}>Bell {PRICE.bell}</button>
        <button type="button" onClick={() => run(() => api.buy('sweater'))}>Sweater {PRICE.sweater}</button>
        <button type="button" onClick={() => run(() => api.buy('crown'))}>Crown {PRICE.crown}</button>
        <button type="button" onClick={() => run(() => api.unequip())}>Take off</button>
        <button type="button" onClick={() => run(() => api.wear())}>Wear</button>
        <button type="button" onClick={() => run(() => api.claimSeason())}>Mark season</button>
      </div>
    </aside>
  )
}
