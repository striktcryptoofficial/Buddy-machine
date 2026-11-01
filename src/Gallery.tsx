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

export function Gallery() {
  const [cats, setCats] = useState<Cat[] | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    void fetch('/api/gallery', { signal: controller.signal })
      .then((response) => response.json())
      .then((data: { cats?: Cat[] }) => setCats(data.cats ?? []))
      .catch(() => setCats([]))
    return () => controller.abort()
  }, [])

  return (
    <main className="landing gallery">
      <header className="gallery-bar">
        <a href="/">Home</a>
        <a href="/play">Open</a>
      </header>
      <section className="gallery-list" aria-label="Hatched cats">
        {cats === null && <p className="gallery-empty">Looking.</p>}
        {cats?.length === 0 && <p className="gallery-empty">No cat has been hatched.</p>}
        {cats?.map((cat) => (
          <a key={cat.wallet} className="gallery-card" href={`/cat/${encodeURIComponent(cat.wallet)}`}>
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
