#!/usr/bin/env node
import { readdirSync, statSync, mkdirSync, existsSync } from 'node:fs'
import { join, basename, extname, resolve, dirname, relative } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const scenesDir = join(rootDir, 'scenes')
const configPath = join(rootDir, 'carbon-now.json')
const presetName = 'rglprotocol'
const carbonBin = join(rootDir, 'node_modules', '.bin', 'carbon-now')
const validExt = /\.(ts|tsx|js|jsx)$/

if (!existsSync(carbonBin)) {
  console.error(`carbon-now binary not found at ${carbonBin}. Run \`npm install\` first.`)
  process.exit(1)
}

if (!existsSync(configPath)) {
  console.error(`carbon-now config not found at ${configPath}`)
  process.exit(1)
}

const sceneDirs = existsSync(scenesDir)
  ? readdirSync(scenesDir).filter((entry) => statSync(join(scenesDir, entry)).isDirectory())
  : []

let generated = 0
let failed = 0

for (const scene of sceneDirs) {
  const examplesDir = join(scenesDir, scene, 'examples')
  if (!existsSync(examplesDir)) continue

  const exampleFiles = readdirSync(examplesDir).filter((f) => validExt.test(f))
  if (exampleFiles.length === 0) continue

  const outDir = join(scenesDir, scene, 'assets', 'examples')
  mkdirSync(outDir, { recursive: true })

  for (const file of exampleFiles) {
    const input = join(examplesDir, file)
    const name = basename(file, extname(file))
    const outPath = join(outDir, `${name}.png`)
    console.log(`→ ${relative(rootDir, input)} → ${relative(rootDir, outPath)}`)

    const res = spawnSync(
      carbonBin,
      [
        input,
        '--config', configPath,
        '--preset', presetName,
        '--save-to', outDir,
        '--save-as', name,
        '--skip-display'
      ],
      { stdio: 'inherit', cwd: rootDir }
    )

    if (res.status !== 0) {
      console.error(`  ✗ failed (exit ${res.status})`)
      failed++
      continue
    }
    generated++
  }
}

console.log(`\nDone. Generated: ${generated}${failed ? `, Failed: ${failed}` : ''}`)
process.exit(failed ? 1 : 0)
