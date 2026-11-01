import './landing.css'

export function Breeding() {
  return (
    <main className="landing gallery">
      <header className="gallery-bar">
        <a href="/discover">Discover</a>
        <a href="/play">Open</a>
      </header>
      <section className="gallery-list" aria-label="Breeding">
        <article className="gallery-card">
          <strong>Breeding is closed</strong>
          <span>One wallet has one cat. A kitten is not minted here.</span>
        </article>
      </section>
    </main>
  )
}
