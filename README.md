# rgl-protocol-experimental

A multi-scene Decentraland world that demonstrates experimental Decentraland **protocol** features as they land in the SDK, one parcel per demo.

- **World:** [`rglprotocol.dcl.eth`](https://decentraland.org/play/?realm=rglprotocol.dcl.eth)
- **SDK:** `@dcl/sdk` pinned to the `protocol-squad` build (see [SDK pinning](#sdk-pinning))
- **Runtime:** SDK7

## Repo layout

```
.
├── dcl-workspace.json           # lists scenes the deploy tool publishes
├── package.json                 # npm workspace root + top-level scripts
├── .github/workflows/
│   ├── ci.yml                   # build verification on every push/PR
│   └── deploy.yml               # deploys to rglprotocol.dcl.eth on push to main
└── scenes/
    ├── lobby/                   # parcel 0,0  — index of available demos
    └── scrollable-ui/           # parcel 1,0  — demo of protocol#412
```

The lobby is the entry point (default spawn). Each demo lives on its own parcel; players walk between them.

## Current demos

| Scene | Parcel | Feature exercised | Reference |
|---|---|---|---|
| `lobby` | `0,0` | n/a — index UI | — |
| `scrollable-ui` | `1,0` | `UiTransform.overflow=scroll`, `scrollPosition` (both `Vector2` and `elementId` reference), `scrollVisible`, `elementId`, `UiScrollResult` readback | [decentraland/protocol#412](https://github.com/decentraland/protocol/pull/412) |

## Local development

```bash
npm install            # installs all workspace deps (hoisted to root)
npm run start          # previews all scenes together (multi-scene)
npm run build          # builds every scene (bin/index.js per scene)
```

`npm run start` opens the local preview with all scenes loaded — walk from `0,0` east to `1,0` to exercise the demos.

## Deploying

CI deploys automatically on every push to `main`. To deploy manually:

```bash
DCL_PRIVATE_KEY=0x... npm run deploy
```

Under the hood this runs:

```
sdk-commands deploy \
  --target-content https://worlds-content-server.decentraland.org \
  --multi-scene
```

### World ACL

The deployer address must be authorized on the World ACL for `rglprotocol.dcl.eth`. The ENS owner grants access with:

```bash
npx @dcl/sdk-commands world-acl grant <deployer-address> --world-name rglprotocol.dcl.eth
```

### CI secrets

- `DCL_PRIVATE_KEY` — Ethereum private key for the deployer wallet. Configured in `Settings → Secrets and variables → Actions`. The matching public address must be on the World ACL above.

## Adding a new demo

1. Create `scenes/<demo-name>/` with `package.json`, `scene.json`, `tsconfig.json`, `.dclignore`, and `src/index.ts` (+ optional `src/ui.tsx`).
2. In the scene's `scene.json`:
   - Set `worldConfiguration.name` to `rglprotocol.dcl.eth`.
   - Set `scene.parcels` / `scene.base` to a free parcel (current grid uses `0,0` and `1,0` — pick `2,0`, `0,1`, etc.).
   - Fill in `display.title`, `display.description`, and `spawnPoints[0].position` — these feed the lobby's auto-generated demo list.
3. Add the path to `dcl-workspace.json` under `folders`.
4. Pin the SDK in the new scene's `package.json` to match the rest of the workspace (`7.22.6-…commit-83012ab`).

The lobby panel is generated from every `scenes/*/scene.json` (excluding `lobby`) — see [Lobby demo generator](#lobby-demo-generator). `npm run start`, `build`, and `deploy` regenerate it automatically.

`npm install` at the root will pick up the new workspace automatically.

## Lobby demo generator

`scripts/generate-lobby-demos.mjs` parses every `scenes/*/scene.json` (excluding `lobby`) and writes `scenes/lobby/src/generated/demos.ts`. Each card on the lobby panel — title, description, target parcel, spawn-centre coordinates — is sourced from that scene's own `scene.json`, and the **TELEPORT →** button uses `teleportTo({ worldCoordinates })` against the base parcel.

```bash
npm run generate-lobby-demos
```

Runs automatically as `prestart` / `prebuild` / `predeploy`; the output file is committed so CI doesn't need a separate generation step.

## Code snapshots

Each scene can ship illustrative code snippets as rendered images (used in the lobby panel, READMEs, social posts, etc.). Source snippets live next to the scene; PNGs are written into the scene's deployed `assets/` so the world can reference them.

```
scenes/<scene>/examples/example1.ts          # source — committed, not deployed
scenes/<scene>/assets/examples/example1.png  # rendered image — deployed with the scene
```

Generate (or regenerate) every image with:

```bash
npm run generate-code-images
```

The script scans `scenes/*/examples/*.{ts,tsx,js,jsx}` and writes each PNG to the matching scene's `assets/examples/`. Output filenames mirror source filenames (`example1.ts` → `example1.png`); re-running overwrites in place.

Rendering uses [`carbon-now-cli`](https://github.com/mixn/carbon-now-cli) with a shared preset in `carbon-now.json` (one-dark theme, JetBrains Mono, 2x export). Adjust that file to change styling for all snippets at once. Carbon-now drives a headless Chromium via Playwright, so the first run downloads ~150 MB of browser binaries into `~/.cache/ms-playwright/`.

To add a snippet to a scene: drop a new file into that scene's `examples/` folder and re-run the command. No per-scene wiring needed.

## SDK pinning

We pin `@dcl/sdk` to the exact `protocol-squad` build rather than `latest`/`next` because the demos depend on protocol changes that aren't on `main` yet. Bumping is intentional:

```bash
npm run upgrade-sdk:protocol-squad
```

This refreshes the SDK in both the root and every scene's `package.json`, then re-pins to whatever exact version `protocol-squad` resolves to at the time.
