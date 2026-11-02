import { spawn } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = dirname(fileURLToPath(import.meta.url))
const root = join(dir, '..')
const webPort = process.env.PORT || '8080'

function side(file, env = process.env) {
  const child = spawn(process.execPath, [join(dir, file)], { stdio: 'inherit', env })
  child.on('exit', (code) => {
    if (code) console.error(`${file} exited ${code}`)
  })
}

const talkEnv = { ...process.env, TALK_PORT: '8787', HOST: '127.0.0.1' }
delete talkEnv.PORT

side('worker.mjs')
side('indexer.mjs')
side('talk.mjs', talkEnv)

const web = spawn(
  process.execPath,
  ['node_modules/next/dist/bin/next', 'start', '--hostname', '0.0.0.0', '--port', webPort],
  { cwd: root, stdio: 'inherit', env: process.env },
)
web.on('exit', (code) => {
  if (code) console.error(`next exited ${code}`)
  process.exit(code ?? 0)
})
