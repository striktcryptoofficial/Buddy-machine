import { EventEmitter } from 'node:events'
import Redis from 'ioredis'

const local = new EventEmitter()
local.setMaxListeners(50)

const presence = new Map()
let pub = null
let sub = null
let redisReady = false

export function busMode() {
  return redisReady ? 'redis' : 'local'
}

export async function openBus() {
  const url = process.env.REDIS_URL
  if (!url) return false
  try {
    const options = {
      connectTimeout: 10000,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
      ...(url.startsWith('rediss://') ? { tls: { rejectUnauthorized: false } } : {}),
    }
    pub = new Redis(url, options)
    sub = new Redis(url, options)
    pub.on('error', () => {})
    sub.on('error', () => {})
    await Promise.all([pub.ping(), sub.ping()])
    await sub.subscribe('life', 'hatch')
    sub.on('message', (channel, message) => {
      local.emit(channel, message)
    })
    redisReady = true
    return true
  } catch (error) {
    console.error('redis unavailable', error instanceof Error ? error.message : error)
    pub?.disconnect()
    sub?.disconnect()
    pub = null
    sub = null
    redisReady = false
    return false
  }
}

export async function closeBus() {
  redisReady = false
  await pub?.quit()
  await sub?.quit()
  pub = null
  sub = null
}

function send(channel, payload) {
  const message = JSON.stringify(payload)
  if (redisReady && pub) {
    void pub.publish(channel, message).catch(() => {
      local.emit(channel, message)
    })
    return
  }
  local.emit(channel, message)
}

export function publishLife(wallet, revision, writer) {
  send('life', { wallet, revision, writer })
}

export function publishHatch(wallet) {
  send('hatch', { wallet })
}

export function onLife(listener) {
  const wrapped = (message) => {
    try {
      listener(JSON.parse(message))
    } catch {
      /* ignore a bad frame */
    }
  }
  local.on('life', wrapped)
  return () => local.off('life', wrapped)
}

export function onHatch(listener) {
  const wrapped = (message) => {
    try {
      listener(JSON.parse(message))
    } catch {
      listener({})
    }
  }
  local.on('hatch', wrapped)
  return () => local.off('hatch', wrapped)
}

export async function touchPresence(wallet) {
  if (!wallet) return
  if (redisReady && pub) {
    await pub.set(`presence:${wallet}`, '1', 'EX', 30)
    return
  }
  presence.set(wallet, Date.now() + 30000)
}

export async function isPresent(wallet) {
  if (redisReady && pub) {
    const hit = await pub.exists(`presence:${wallet}`)
    return hit === 1
  }
  const until = presence.get(wallet) ?? 0
  if (until < Date.now()) {
    presence.delete(wallet)
    return false
  }
  return true
}
