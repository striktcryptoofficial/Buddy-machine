import { openBus, isPresent } from './bus.mjs'
import { openLife, listCreatures, writeLife } from './lifeStore.mjs'
import { lifeMode } from './db.mjs'
import { loadEngine } from './bundleEngine.mjs'
import { loadEnv } from './env.mjs'

loadEnv()

const everyMs = Number(process.env.WORKER_MS || 5000)

async function tick(advanceSave) {
  if (lifeMode() !== 'postgres') return
  const rows = await listCreatures()
  const now = Date.now()
  for (const row of rows) {
    if (await isPresent(row.wallet)) continue
    const save = structuredClone(row.save)
    if (!save?.buddies?.length) continue
    const stale = save.buddies.some((buddy) => now - (buddy.lastSimulatedAt ?? 0) >= 2 * 60 * 1000)
    if (!stale) continue
    advanceSave(save, now)
    const before = JSON.stringify(row.save)
    const after = JSON.stringify(save)
    if (before === after) continue
    const buddy = save.buddies.find((item) => item.id === save.activeId) ?? save.buddies[0]
    const written = await writeLife(row.wallet, buddy?.id || row.creatureId, save, row.revision, 'worker')
    if (written.conflict) continue
  }
}

async function main() {
  await openBus().catch((error) => {
    console.error('redis', error instanceof Error ? error.message : error)
  })
  await openLife()
  if (lifeMode() !== 'postgres') {
    console.error('worker needs DATABASE_URL and postgres. Run npm run stack.')
    process.exit(1)
  }
  const engine = await loadEngine()
  console.log(`worker every ${everyMs}ms`)
  await tick(engine.advanceSave)
  setInterval(() => {
    void tick(engine.advanceSave).catch((error) => {
      console.error('worker', error instanceof Error ? error.message : error)
    })
  }, everyMs)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
