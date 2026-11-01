import { spawn } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

process.env.DATABASE_URL ||= 'postgres://buddy:buddy@127.0.0.1:5432/buddy'
process.env.REDIS_URL ||= 'redis://127.0.0.1:6379'

function run(command, args) {
  const child = spawn(command, args, {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  })
  child.on('exit', (code) => {
    if (code) console.error(`${command} ${args.join(' ')} exited ${code}`)
  })
  return child
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const compose = run('docker', ['compose', 'up', '-d'])
compose.on('exit', async (code) => {
  if (code) {
    process.exit(code)
  }
  await wait(2000)
  const children = [
    run('node', ['server/talk.mjs']),
    run('node', ['server/worker.mjs']),
    run('node', ['server/indexer.mjs']),
  ]
  const stop = () => {
    for (const child of children) child.kill()
    process.exit(0)
  }
  process.on('SIGINT', stop)
  process.on('SIGTERM', stop)
})
