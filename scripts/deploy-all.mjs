#!/usr/bin/env node
// Deploys every scene listed in dcl-workspace.json to the world, one at a time.
//
// Why per-scene: as of @dcl/sdk 7.23.x the `deploy` command operates on a single
// project and rejects a multi-project workspace (DEPLOY_WORKSPACE_NOT_SUPPORTED).
// `--multi-scene` means "additive deploy into a world that already has scenes,
// without deleting the others". So we run it once per scene; each scene's parcels
// overwrite their own pointers in the world while leaving the rest intact.
import { readFileSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const targetContent = 'https://worlds-content-server.decentraland.org'

const workspace = JSON.parse(readFileSync(join(rootDir, 'dcl-workspace.json'), 'utf8'))
const scenes = workspace.folders.map((f) => f.path)

const sdkBin = join(rootDir, 'node_modules', '.bin', 'sdk-commands')
if (!existsSync(sdkBin)) {
  console.error(`sdk-commands binary not found at ${sdkBin}. Run \`npm install\` first.`)
  process.exit(1)
}

console.log(`Deploying ${scenes.length} scene(s) to ${targetContent} (additive --multi-scene)\n`)

for (const rel of scenes) {
  const cwd = join(rootDir, rel)
  console.log(`=== Deploying ${rel} ===`)
  const result = spawnSync(
    sdkBin,
    ['deploy', '--target-content', targetContent, '--multi-scene', '--no-browser'],
    { cwd, stdio: 'inherit', env: process.env }
  )
  if (result.status !== 0) {
    console.error(`\nDeploy failed for ${rel} (exit code ${result.status}).`)
    process.exit(result.status || 1)
  }
  console.log('')
}

console.log('All scenes deployed.')
