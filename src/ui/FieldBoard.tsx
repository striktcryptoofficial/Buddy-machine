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
  return (
    <section className={`challenge-board${open ? ' is-lifted' : ''}`} aria-hidden={open ? undefined : true}>
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
