import { useEffect, useState } from 'react'
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

function walletFromPath() {
  const parts = window.location.pathname.split('/').filter(Boolean)
  return decodeURIComponent(parts[1] || '')
}

export function PublicCat() {
  const wallet = walletFromPath()
  const [cat, setCat] = useState<Cat | null | undefined>(undefined)

  useEffect(() => {
    if (!wallet) {
      setCat(null)
      return
    }
    const controller = new AbortController()
    void fetch(`/api/gallery?wallet=${encodeURIComponent(wallet)}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((data: { cats?: Cat[] }) => setCat(data.cats?.[0] ?? null))
      .catch(() => setCat(null))
    return () => controller.abort()
  }, [wallet])

  return (
    <main className="landing gallery">
      <header className="gallery-bar">
        <a href="/gallery">All</a>
        <a href="/play">Open</a>
      </header>
      <section className="gallery-list" aria-label="Cat">
        {cat === undefined && <p className="gallery-empty">Looking.</p>}
        {cat === null && <p className="gallery-empty">This wallet has no cat.</p>}
        {cat && (
          <article className="gallery-card">
            <strong>{cat.name}</strong>
            <span>{cat.coat}</span>
            <span>{cat.rarity}</span>
            <span>{cat.awakened ? 'Awake' : 'Cat'}</span>
            <span>{cat.scraps} scraps</span>
            <span>{cat.explorations} trips</span>
            {cat.charm && <span>{cat.charm}</span>}
          </article>
        )}
      </section>
    </main>
  )
}
