import { useState, type FormEvent } from 'react'
import { makeDna } from '../Game engine/mechanics/dna'
import { walletSeed } from '../Game engine/mechanics/table'
import './landing.css'

type Cat = { wallet: string; name: string; coat: string; rarity: string; visualSeed: number }

export function Verifier() {
  const [wallet, setWallet] = useState('dev')
  const [line, setLine] = useState('')

  async function check(event: FormEvent) {
    event.preventDefault()
    const trimmed = wallet.trim()
    if (!trimmed) return
    const seed = walletSeed(trimmed)
    const dna = makeDna(seed)
    let stored: Cat | undefined
    try {
      const response = await fetch(`/api/gallery?wallet=${encodeURIComponent(trimmed)}`)
      const data = (await response.json()) as { cats?: Cat[] }
      stored = data.cats?.[0]
    } catch {
      stored = undefined
    }
    if (!stored) {
      setLine(`${trimmed} would hatch ${dna.coatName}, ${dna.rarity}. No cat is stored yet.`)
      return
    }
    if (stored.visualSeed === seed) {
      setLine(`${stored.name} matches the wallet. ${dna.coatName}, ${dna.rarity}.`)
      return
    }
    if (stored.coat === dna.coatName) {
      setLine(`${stored.name} is ${stored.coat}. This wallet also recomputes ${dna.coatName}, but the seed is not this wallet's.`)
      return
    }
    setLine(`${stored.name} is stored as ${stored.coat}. The wallet recomputes ${dna.coatName}. The stored coat is wrong.`)
  }

  return (
    <main className="landing gallery">
      <header className="gallery-bar">
        <a href="/discover">Discover</a>
        <a href="/play">Open</a>
      </header>
      <form className="gallery-list" onSubmit={(event) => void check(event)}>
        <input value={wallet} onChange={(event) => setWallet(event.target.value)} aria-label="Wallet" spellCheck={false} />
        <button type="submit" className="landing-open">Verify</button>
        {line && <p className="gallery-empty">{line}</p>}
      </form>
    </main>
  )
}
