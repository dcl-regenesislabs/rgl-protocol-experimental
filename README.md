# rgl-protocol-experimental

A multi-scene Decentraland world for demonstrating experimental Decentraland **protocol** features as they land in the SDK.

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
    └── scene/                   # parcel 0,0
```

> Previous demos (`lobby`, `scrollable-ui`) are archived on the `archive/lobby-scrollable-ui` branch.

## Local development

```bash
npm install            # installs all workspace deps (hoisted to root)
npm run start          # previews all scenes together (multi-scene)
npm run build          # builds every scene (bin/index.js per scene)
```

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

## Adding a new scene

1. Create `scenes/<scene-name>/` with `package.json`, `scene.json`, `tsconfig.json`, `.dclignore`, and `src/index.ts`.
2. In the scene's `scene.json`:
   - Set `worldConfiguration.name` to `rglprotocol.dcl.eth`.
   - Set `scene.parcels` / `scene.base` to a free parcel.
   - Fill in `display.title`, `display.description`, and `spawnPoints[0].position`.
3. Add the path to `dcl-workspace.json` under `folders` and to `package.json` `workspaces`.
4. Pin the SDK in the new scene's `package.json` to match the rest of the workspace (`7.22.6-…commit-83012ab`).

`npm install` at the root will pick up the new workspace automatically.

## SDK pinning

We pin `@dcl/sdk` to the exact `protocol-squad` build rather than `latest`/`next` because the demos depend on protocol changes that aren't on `main` yet. Bumping is intentional:

```bash
npm run upgrade-sdk:protocol-squad
```

This refreshes the SDK in both the root and every scene's `package.json`, then re-pins to whatever exact version `protocol-squad` resolves to at the time.
