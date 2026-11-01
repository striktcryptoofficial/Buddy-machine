import { openBus, onHatch } from './bus.mjs'
import { openLife, readByWallet, writeLife, pendingHatches, markHatch } from './lifeStore.mjs'
import { lifeMode } from './db.mjs'
import { loadEngine } from './bundleEngine.mjs'
import { loadEnv } from './env.mjs'

loadEnv()

let hatching = false
let engine = null

async function applyPending() {
  if (hatching || !engine || lifeMode() !== 'postgres') return
  hatching = true
  try {
    const rows = await pendingHatches()
    for (const row of rows) {
      const existing = await readByWallet(row.wallet)
      if (!existing) {
        const save = engine.hatchSave(row.wallet, row.owner_name || 'friend')
        const written = await writeLife(row.wallet, save.activeId, save, 0, 'indexer')
        if (!written.ok && !written.conflict) continue
      }
      await markHatch(row.id)
    }
  } finally {
    hatching = false
  }
}

async function main() {
  await openBus().catch((error) => {
    console.error('redis', error instanceof Error ? error.message : error)
  })
  await openLife()
  if (lifeMode() !== 'postgres') {
    console.error('indexer needs DATABASE_URL and postgres. Run npm run stack.')
    process.exit(1)
  }
  engine = await loadEngine()
  onHatch(() => {
    void applyPending()
  })
  console.log('indexer watching hatches')
  await applyPending()
  setInterval(() => {
    void applyPending().catch((error) => {
      console.error('indexer', error instanceof Error ? error.message : error)
    })
  }, 1000)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
