import { spawn } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = dirname(fileURLToPath(import.meta.url))

function side(file) {
  const child = spawn(process.execPath, [join(dir, file)], { stdio: 'inherit' })
  child.on('exit', (code) => {
    if (code) console.error(`${file} exited ${code}`)
  })
}

side('worker.mjs')
side('indexer.mjs')
await import('./talk.mjs')
