import { useEffect, useMemo, useState } from 'react'
import './landing.css'

type Cat = {
  wallet: string
  name: string
  coat: string
  rarity: string
  awakened: boolean
  scraps: number
  charm: string | null
  explorations: number
}

const RARITIES = ['all', 'common', 'uncommon', 'rare', 'legendary'] as const

export function Discover() {
  const [cats, setCats] = useState<Cat[] | null>(null)
  const [rarity, setRarity] = useState<(typeof RARITIES)[number]>('all')
  const [awake, setAwake] = useState<'all' | 'awake' | 'cat'>('all')
  const [coat, setCoat] = useState('all')

  useEffect(() => {
    const controller = new AbortController()
    void fetch('/api/gallery', { signal: controller.signal })
      .then((response) => response.json())
      .then((data: { cats?: Cat[] }) => setCats(data.cats ?? []))
      .catch(() => setCats([]))
    return () => controller.abort()
  }, [])

  const coats = useMemo(() => ['all', ...new Set((cats ?? []).map((cat) => cat.coat).filter(Boolean))], [cats])
  const shown = (cats ?? []).filter((cat) => {
    if (rarity !== 'all' && cat.rarity !== rarity) return false
    if (awake === 'awake' && !cat.awakened) return false
    if (awake === 'cat' && cat.awakened) return false
    if (coat !== 'all' && cat.coat !== coat) return false
    return true
  })
  const board = [...shown].sort((a, b) => b.scraps - a.scraps)

  return (
    <main className="landing gallery">
      <header className="gallery-bar">
        <a href="/">Home</a>
        <a href="/play">Open</a>
        <a href="/verify">Verify</a>
        <a href="/breeding">Breeding</a>
      </header>
      <section className="gallery-bar" aria-label="Filters">
        {RARITIES.map((item) => (
          <button key={item} type="button" className="landing-open" onClick={() => setRarity(item)}>
            {item}
          </button>
        ))}
        <button type="button" className="landing-open" onClick={() => setAwake(awake === 'all' ? 'awake' : awake === 'awake' ? 'cat' : 'all')}>
          {awake}
        </button>
        <button type="button" className="landing-open" onClick={() => setCoat(coats[(coats.indexOf(coat) + 1) % coats.length] || 'all')}>
          {coat}
        </button>
      </section>
      <section className="gallery-list" aria-label="Hatched cats">
        {cats === null && <p className="gallery-empty">Looking.</p>}
        {shown.length === 0 && cats !== null && <p className="gallery-empty">No cat matches.</p>}
        {board.map((cat, index) => (
          <a key={cat.wallet} className="gallery-card" href={`/cat/${encodeURIComponent(cat.wallet)}`}>
            <strong>{index + 1}</strong>
            <strong>{cat.name}</strong>
            <span>{cat.coat}</span>
            <span>{cat.rarity}</span>
            <span>{cat.awakened ? 'Awake' : 'Cat'}</span>
            <span>{cat.scraps} scraps</span>
          </a>
        ))}
      </section>
    </main>
  )
}
