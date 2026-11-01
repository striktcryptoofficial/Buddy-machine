import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const { Pool } = pg

let pool = null

export function lifeMode() {
  return pool ? 'postgres' : 'file'
}

export async function openDb() {
  const url = process.env.DATABASE_URL
  if (!url) return null
  const tls = /[?&]sslmode=(require|verify-ca|verify-full)|[?&]ssl=true/.test(url)
  const next = new Pool({
    connectionString: url,
    max: 8,
    connectionTimeoutMillis: 10000,
    ssl: tls ? { rejectUnauthorized: false } : undefined,
  })
  try {
    const schema = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'schema.sql'), 'utf8')
    await next.query(schema)
    pool = next
    return pool
  } catch (error) {
    await next.end()
    throw error
  }
}

export function db() {
  return pool
}

export async function closeDb() {
  if (!pool) return
  await pool.end()
  pool = null
}
