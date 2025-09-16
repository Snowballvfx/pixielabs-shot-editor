import { existsSync, mkdirSync, copyFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const root = resolve(__dirname, '..')
const dist = resolve(root, 'dist')
const srcCss = resolve(root, 'src', 'index.css')
const outCss = resolve(dist, 'style.css')

if (!existsSync(dist)) mkdirSync(dist, { recursive: true })

try {
  copyFileSync(srcCss, outCss)
  console.log('[pixielabs-shot-editor] Ensured dist/style.css exists')
} catch (err) {
  console.warn('[pixielabs-shot-editor] Could not copy CSS:', err?.message || err)
}


