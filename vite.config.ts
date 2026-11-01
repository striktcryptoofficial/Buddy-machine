import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const lilyRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), 'Game engine', 'assets', 'lily')
const adjustFile = path.join(path.dirname(fileURLToPath(import.meta.url)), 'Game engine', 'creatures', 'lily', 'color-adjust.json')

function lilyColorAdjust() {
  return {
    name: 'lily-color-adjust',
    configureServer(server) {
      server.middlewares.use('/lily-src', (req, res, next) => {
        const rel = decodeURIComponent((req.url || '/').split('?')[0]).replace(/^\/+/, '')
        const file = path.resolve(lilyRoot, rel)
        const root = path.resolve(lilyRoot).toLowerCase()
        if (!file.toLowerCase().startsWith(root) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
          next()
          return
        }
        res.setHeader('Content-Type', 'image/png')
        res.setHeader('Cache-Control', 'no-cache')
        fs.createReadStream(file).pipe(res)
      })
      server.middlewares.use('/lily-color-adjust.json', (req, res) => {
        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Cache-Control', 'no-store')
          res.end(fs.existsSync(adjustFile) ? fs.readFileSync(adjustFile) : '{"rev":0}')
          return
        }
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end()
          return
        }
        const chunks = []
        req.on('data', (chunk) => chunks.push(chunk))
        req.on('end', () => {
          try {
            const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'))
            fs.mkdirSync(path.dirname(adjustFile), { recursive: true })
            fs.writeFileSync(adjustFile, JSON.stringify(parsed, null, 2))
            res.setHeader('Content-Type', 'application/json')
            res.end('{"ok":true}')
          } catch {
            res.statusCode = 400
            res.end('{"ok":false}')
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), lilyColorAdjust()],
  server: {
    port: 5173,
    host: '127.0.0.1',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        timeout: 0,
        proxyTimeout: 0,
      },
    },
  },
})
