import { notePresence, readByCreature, readByWallet, writeLife, enqueueHatch, listCreatures } from './lifeStore.mjs'
import { busMode, onLife, publishHatch } from './bus.mjs'
import { lifeMode } from './db.mjs'

function send(res, status, body) {
  res.writeHead(status, {
    'content-type': 'application/json',
    'cache-control': 'no-store',
  })
  res.end(JSON.stringify(body))
}

async function readBody(req, limit) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > limit) return { error: 413 }
    chunks.push(chunk)
  }
  try {
    return { body: JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}') }
  } catch {
    return { error: 400 }
  }
}

function publicCat(row) {
  const save = row?.save
  const buddy = save?.buddies?.find((item) => item?.id === save?.activeId) ?? save?.buddies?.[0]
  if (!buddy?.name || !buddy?.dna) return null
  return {
    wallet: row.wallet,
    name: buddy.name,
    coat: buddy.dna.coatName ?? '',
    rarity: buddy.dna.rarity ?? '',
    awakened: Boolean(buddy.awakenedAt),
    scraps: buddy.scrapCount ?? 0,
    charm: save.charm ?? null,
    explorations: save.explorations ?? 0,
    visualSeed: buddy.visualSeed ?? buddy.dna.visualSeed ?? 0,
    createdAt: buddy.createdAt ?? 0,
  }
}

export async function handleGallery(req, res) {
  const url = new URL(req.url || '/', 'http://127.0.0.1')
  if (url.pathname !== '/api/gallery') {
    send(res, 404, { ok: false })
    return
  }
  const rows = await listCreatures()
  const wallet = url.searchParams.get('wallet')
  const cats = rows.map(publicCat).filter(Boolean)
  const found = wallet ? cats.filter((cat) => cat.wallet === wallet) : cats
  send(res, 200, { ok: true, cats: found })
}

export function archStatus() {
  return { life: lifeMode(), bus: busMode() }
}

export async function handleLifeRequest(req, res) {
  const url = new URL(req.url || '/', 'http://127.0.0.1')
  if (url.pathname !== '/api/life') {
    send(res, 404, { ok: false })
    return
  }

  if (req.method === 'GET') {
    const id = url.searchParams.get('id')
    const wallet = url.searchParams.get('wallet')
    const row = wallet ? await readByWallet(wallet) : id ? await readByCreature(id) : null
    if (!row) {
      send(res, 200, { ok: false })
      return
    }
    if (wallet) await notePresence(row.wallet)
    send(res, 200, { ok: true, wallet: row.wallet, revision: row.revision, save: row.save })
    return
  }

  if (req.method === 'POST') {
    const incoming = await readBody(req, 256 * 1024)
    if (incoming.error) {
      send(res, incoming.error, { ok: false })
      return
    }
    const body = incoming.body
    const wallet = typeof body?.wallet === 'string' ? body.wallet.trim().slice(0, 80) : ''
    const id = typeof body?.id === 'string' ? body.id.trim().slice(0, 80) : ''
    const writer = typeof body?.writer === 'string' ? body.writer.trim().slice(0, 80) : 'glass'
    const revision = Number(body?.revision) || 0
    if (!wallet || !id || typeof body?.save !== 'object' || body.save === null || Array.isArray(body.save)) {
      send(res, 400, { ok: false })
      return
    }
    try {
      const written = await writeLife(wallet, id, body.save, revision, writer)
      if (written.conflict) {
        send(res, 409, { ok: false, conflict: true, revision: written.revision, save: written.save })
        return
      }
      if (!written.ok) {
        send(res, 400, { ok: false })
        return
      }
      await notePresence(wallet)
      send(res, 200, { ok: true, revision: written.revision })
    } catch (error) {
      console.error('life write', error instanceof Error ? error.message : error)
      send(res, 500, { ok: false })
    }
    return
  }

  send(res, 404, { ok: false })
}

export async function handleHatchRequest(req, res) {
  if (req.method !== 'POST') {
    send(res, 404, { ok: false })
    return
  }
  const incoming = await readBody(req, 16 * 1024)
  if (incoming.error) {
    send(res, incoming.error, { ok: false })
    return
  }
  const body = incoming.body
  const wallet = typeof body?.wallet === 'string' ? body.wallet.trim().slice(0, 80) : ''
  const ownerName = typeof body?.ownerName === 'string' ? body.ownerName : 'friend'
  const tx = typeof body?.tx === 'string' ? body.tx : ''
  if (!wallet) {
    send(res, 400, { ok: false })
    return
  }
  if (lifeMode() !== 'postgres') {
    send(res, 200, { ok: false, queued: false, reason: 'indexer needs postgres' })
    return
  }
  const queued = await enqueueHatch(wallet, ownerName, tx)
  publishHatch(wallet)
  const started = Date.now()
  while (Date.now() - started < 4000) {
    const row = await readByWallet(wallet)
    if (row) {
      send(res, 200, { ok: true, wallet, revision: row.revision, save: row.save })
      return
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  send(res, 202, { ok: true, queued: true, id: queued?.id ?? null })
}

export function handleStream(req, res) {
  const url = new URL(req.url || '/', 'http://127.0.0.1')
  const wallet = (url.searchParams.get('wallet') || '').trim().slice(0, 80)
  if (!wallet) {
    send(res, 400, { ok: false })
    return
  }
  res.writeHead(200, {
    'content-type': 'text/event-stream',
    'cache-control': 'no-cache, no-transform',
    connection: 'keep-alive',
    'x-accel-buffering': 'no',
  })
  res.write(`event: ready\ndata: ${JSON.stringify({ wallet })}\n\n`)

  const stop = onLife((event) => {
    if (event.wallet !== wallet) return
    res.write(`event: life\ndata: ${JSON.stringify(event)}\n\n`)
  })
  const beat = setInterval(() => {
    res.write(': ping\n\n')
    void notePresence(wallet)
  }, 15000)
  void notePresence(wallet)

  const close = () => {
    clearInterval(beat)
    stop()
  }
  req.on('close', close)
  res.on('close', close)
}
