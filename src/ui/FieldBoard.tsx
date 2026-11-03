import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { useBuddy } from '../../Game engine/mechanics/store'
import './cards/challenge.css'

const MISSIONS: { id: 'training' | 'mining' | 'exploration' | 'research' | 'defence' | 'escort'; title: string; detail: string; prize: string; unit: string }[] = [
  { id: 'training', title: 'Training', detail: 'A drill. Vigor rises a little. The soul does not reroll.', prize: 'STR', unit: 'GAIN' },
  { id: 'mining', title: 'Mining', detail: 'Crystals come home. Hunger does not.', prize: 'CRYS', unit: 'FIND' },
  { id: 'exploration', title: 'Exploration', detail: 'She goes out and comes back. Sometimes a bell.', prize: 'BELL', unit: 'MAYBE' },
  { id: 'research', title: 'Research', detail: 'She reads. The loot table does not change.', prize: 'READ', unit: 'HER' },
  { id: 'defence', title: 'Defence', detail: 'One watch. A crowd can turn her away.', prize: 'WATCH', unit: 'ONE' },
  { id: 'escort', title: 'Escort', detail: 'A walk with someone. A bond if she is not miserable.', prize: 'BOND', unit: 'MAYBE' },
]

export function FieldBoard({ open }: { open: boolean }) {
  const api = useBuddy()
  const rootRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const cards = root.querySelectorAll<HTMLElement>('.challenge-card')
    const bits = root.querySelectorAll<HTMLElement>('.challenge-bit')
    gsap.killTweensOf([root, cards, bits])
    if (!open) {
      root.style.pointerEvents = 'none'
      gsap.to(bits, { y: 10, opacity: 0, duration: reduce ? 0 : 0.18, stagger: reduce ? 0 : 0.01, ease: 'power2.in' })
      gsap.to(cards, {
        y: 28,
        scale: 0.9,
        opacity: 0,
        filter: reduce ? 'none' : 'blur(12px)',
        duration: reduce ? 0 : 0.32,
        stagger: reduce ? 0 : 0.03,
        ease: 'power3.in',
      })
      gsap.to(root, { autoAlpha: 0, duration: reduce ? 0 : 0.28, delay: reduce ? 0 : 0.06, ease: 'power2.in' })
      return
    }
    root.style.pointerEvents = 'auto'
    gsap.set(root, { autoAlpha: 1 })
    gsap.fromTo(
      cards,
      { y: 36, scale: 0.88, opacity: 0, filter: reduce ? 'none' : 'blur(16px)' },
      {
        y: 0,
        scale: 1,
        opacity: 1,
        filter: 'blur(0px)',
        duration: reduce ? 0 : 0.68,
        stagger: reduce ? 0 : 0.06,
        ease: 'expo.out',
      },
    )
    gsap.fromTo(
      bits,
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: reduce ? 0 : 0.4, stagger: reduce ? 0 : 0.02, delay: reduce ? 0 : 0.1, ease: 'power3.out' },
    )
  }, [open])

  return (
    <section className={`challenge-board${open ? ' is-lifted' : ''}`} ref={rootRef} aria-hidden={open ? undefined : true}>
      <div className="challenge-list">
        {MISSIONS.map((mission) => (
          <article key={mission.id} className="challenge-card" onClick={() => api.sendOut(mission.id)}>
            <span className="card-shade" aria-hidden="true" />
            <div className="card-face">
              <div className="challenge-mast">
                <header className="challenge-top">
                  <span className="challenge-kicker challenge-bit" data-kicker="Field">Field</span>
                  <span className="challenge-status challenge-bit" data-status="Open">Open</span>
                </header>
                <h2 className="challenge-title challenge-bit">{mission.title}</h2>
                <span className="challenge-prize challenge-bit">
                  <strong>{mission.prize}</strong>
                  <span>{mission.unit}</span>
                </span>
              </div>
              <p className="challenge-detail challenge-bit">{mission.detail}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
