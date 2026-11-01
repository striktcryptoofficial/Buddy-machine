import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { db, lifeMode, openDb } from './db.mjs'
import { publishLife, touchPresence } from './bus.mjs'

const filePath = join(dirname(fileURLToPath(import.meta.url)), 'life.json')

/** @type {{ wallets: Record<string, { creatureId: string, save: unknown, revision: number }> }} */
let fileStore = { wallets: {} }
let fileChain = Promise.resolve()

function loadFile() {
  if (!existsSync(filePath)) return
  try {
    const data = JSON.parse(readFileSync(filePath, 'utf8'))
    if (data && data.wallets && typeof data.wallets === 'object') {
      fileStore = { wallets: data.wallets }
      return
    }
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const saves = Object.values(data).filter((item) => item && item.buddies)
      const newest = newestSave(saves)
      if (newest) {
        const buddy = buddyOf(newest)
        fileStore = {
          wallets: {
            dev: { creatureId: buddy?.id || 'dev', save: newest, revision: 1 },
          },
        }
      }
    }
  } catch {
    fileStore = { wallets: {} }
  }
}

function buddyOf(save) {
  if (!save?.buddies) return null
  return save.buddies.find((item) => item.id === save.activeId) ?? save.buddies[0] ?? null
}

function newestSave(saves) {
  let best = null
  let at = -1
  for (const save of saves) {
    const buddy = buddyOf(save)
    const seen = buddy?.lastSimulatedAt ?? 0
    if (seen >= at) {
      best = save
      at = seen
    }
  }
  return best
}

function writeFileStore() {
  writeFileSync(filePath, JSON.stringify(fileStore))
}

function rowFrom(wallet, record) {
  return {
    wallet,
    creatureId: record.creatureId,
    save: record.save,
    revision: Number(record.revision) || 0,
  }
}

export async function openLife() {
  loadFile()
  try {
    await openDb()
  } catch (error) {
    console.error('postgres unavailable, life stays in the file store', error instanceof Error ? error.message : error)
  }
  if (lifeMode() === 'postgres') await importFileCreatures()
}

async function importFileCreatures() {
  const pool = db()
  if (!pool) return
  const count = await pool.query('select count(*)::int as n from creatures')
  if (count.rows[0].n > 0) return
  const entries = Object.entries(fileStore.wallets)
  for (const [wallet, record] of entries) {
    await pool.query(
      'insert into creatures (wallet, creature_id, save, revision) values ($1, $2, $3, $4) on conflict (wallet) do nothing',
      [wallet, record.creatureId, record.save, record.revision || 1],
    )
  }
}

export async function readByWallet(wallet) {
  const key = String(wallet || '').slice(0, 80)
  if (!key) return null
  if (lifeMode() === 'postgres') {
    const result = await db().query(
      'select wallet, creature_id, save, revision from creatures where wallet = $1',
      [key],
    )
    const row = result.rows[0]
    if (!row) return null
    return { wallet: row.wallet, creatureId: row.creature_id, save: row.save, revision: Number(row.revision) }
  }
  const record = fileStore.wallets[key]
  return record ? rowFrom(key, record) : null
}

export async function readByCreature(id) {
  const key = String(id || '').slice(0, 80)
  if (!key) return null
  if (lifeMode() === 'postgres') {
    const result = await db().query(
      'select wallet, creature_id, save, revision from creatures where creature_id = $1',
      [key],
    )
    const row = result.rows[0]
    if (!row) return null
    return { wallet: row.wallet, creatureId: row.creature_id, save: row.save, revision: Number(row.revision) }
  }
  for (const [wallet, record] of Object.entries(fileStore.wallets)) {
    if (record.creatureId === key) return rowFrom(wallet, record)
  }
  return null
}

export async function listCreatures() {
  if (lifeMode() === 'postgres') {
    const result = await db().query('select wallet, creature_id, save, revision from creatures')
    return result.rows.map((row) => ({
      wallet: row.wallet,
      creatureId: row.creature_id,
      save: row.save,
      revision: Number(row.revision),
    }))
  }
  return Object.entries(fileStore.wallets).map(([wallet, record]) => rowFrom(wallet, record))
}

/**
 * revision 0 inserts. Any other revision must match the row, or the write conflicts.
 * writer is who published the change: a browser tab, the worker, or the indexer.
 */
export async function writeLife(wallet, creatureId, save, revision, writer) {
  const key = String(wallet || '').slice(0, 80)
  const id = String(creatureId || '').slice(0, 80)
  if (!key || !id || !save || typeof save !== 'object') return { ok: false }
  if (lifeMode() === 'postgres') return writePg(key, id, save, Number(revision) || 0, writer || 'api')
  return writeFileQueued(key, id, save, Number(revision) || 0, writer || 'api')
}

function writeFileQueued(wallet, creatureId, save, revision, writer) {
  const run = fileChain.then(() => applyFile(wallet, creatureId, save, revision, writer))
  fileChain = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

async function applyFile(wallet, creatureId, save, revision, writer) {
  const current = fileStore.wallets[wallet]
  if (!current) {
    if (revision !== 0) return { ok: false, conflict: true, save: null, revision: 0 }
    fileStore.wallets[wallet] = { creatureId, save, revision: 1 }
    writeFileStore()
    publishLife(wallet, 1, writer)
    return { ok: true, revision: 1 }
  }
  if (current.revision !== revision) {
    return { ok: false, conflict: true, save: current.save, revision: current.revision }
  }
  const next = current.revision + 1
  fileStore.wallets[wallet] = { creatureId, save, revision: next }
  writeFileStore()
  publishLife(wallet, next, writer)
  return { ok: true, revision: next }
}

async function writePg(wallet, creatureId, save, revision, writer) {
  const client = await db().connect()
  try {
    await client.query('begin')
    const current = await client.query('select revision, save from creatures where wallet = $1 for update', [wallet])
    if (current.rowCount === 0) {
      if (revision !== 0) {
        await client.query('rollback')
        return { ok: false, conflict: true, save: null, revision: 0 }
      }
      await client.query(
        'insert into creatures (wallet, creature_id, save, revision) values ($1, $2, $3::jsonb, 1)',
        [wallet, creatureId, JSON.stringify(save)],
      )
      await client.query('commit')
      publishLife(wallet, 1, writer)
      return { ok: true, revision: 1 }
    }
    const row = current.rows[0]
    if (Number(row.revision) !== revision) {
      await client.query('rollback')
      return { ok: false, conflict: true, save: row.save, revision: Number(row.revision) }
    }
    const next = Number(row.revision) + 1
    await client.query(
      'update creatures set creature_id = $2, save = $3::jsonb, revision = $4, updated_at = now() where wallet = $1',
      [wallet, creatureId, JSON.stringify(save), next],
    )
    await client.query('commit')
    publishLife(wallet, next, writer)
    return { ok: true, revision: next }
  } catch (error) {
    try {
      await client.query('rollback')
    } catch {
      /* already closed */
    }
    throw error
  } finally {
    client.release()
  }
}

export async function enqueueHatch(wallet, ownerName, tx) {
  const key = String(wallet || '').trim().slice(0, 80)
  const owner = String(ownerName || 'friend').trim().slice(0, 24) || 'friend'
  const ref = tx ? String(tx).slice(0, 80) : null
  if (!key) return null
  if (lifeMode() !== 'postgres') {
    return { id: Date.now(), wallet: key, owner_name: owner, tx: ref }
  }
  const result = await db().query(
    'insert into hatches (wallet, owner_name, tx) values ($1, $2, $3) returning id, wallet, owner_name, tx',
    [key, owner, ref],
  )
  return result.rows[0]
}

export async function pendingHatches(limit = 8) {
  if (lifeMode() !== 'postgres') return []
  const result = await db().query(
    'select id, wallet, owner_name, tx from hatches where applied_at is null order by id asc limit $1',
    [limit],
  )
  return result.rows
}

export async function markHatch(id) {
  if (lifeMode() !== 'postgres') return
  await db().query('update hatches set applied_at = now() where id = $1 and applied_at is null', [id])
}

export async function notePresence(wallet) {
  await touchPresence(wallet)
}
