import { spawn } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const talkEnv = { ...process.env, TALK_PORT: '8787', HOST: '127.0.0.1' }
delete talkEnv.PORT

const talk = spawn(process.execPath, ['server/talk.mjs'], {
  cwd: root,
  stdio: 'inherit',
  env: talkEnv,
})
const web = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--port', '3010'], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
})

function stop() {
  talk.kill()
  web.kill()
  process.exit(0)
}

process.on('SIGINT', stop)
process.on('SIGTERM', stop)
