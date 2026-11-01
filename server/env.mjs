import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export function loadEnv() {
  const file = join(dirname(fileURLToPath(import.meta.url)), '..', '.env')
  if (existsSync(file)) {
    for (const raw of readFileSync(file, 'utf8').split(/\r?\n/)) {
      const line = raw.trim()
      if (!line || line.startsWith('#')) continue
      const cut = line.indexOf('=')
      if (cut < 1) continue
      const key = line.slice(0, cut).trim()
      let value = line.slice(cut + 1).trim()
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      if (process.env[key] === undefined) process.env[key] = value
    }
  }
  process.env.DATABASE_URL ||= 'postgres://buddy:buddy@127.0.0.1:5432/buddy'
  process.env.REDIS_URL ||= 'redis://127.0.0.1:6379'
}
