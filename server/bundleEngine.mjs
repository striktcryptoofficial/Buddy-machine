import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as esbuild from 'esbuild'

const here = dirname(fileURLToPath(import.meta.url))
const outfile = join(here, 'dist', 'tick.mjs')

let loading

export function loadEngine() {
  loading ??= build()
  return loading
}

async function build() {
  mkdirSync(dirname(outfile), { recursive: true })
  await esbuild.build({
    entryPoints: [join(here, 'tickEntry.ts')],
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile,
    logLevel: 'silent',
  })
  return import(`./dist/tick.mjs?v=${Date.now()}`)
}
