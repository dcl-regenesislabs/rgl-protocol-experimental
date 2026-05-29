# rgl-protocol-experimental

A multi-scene Decentraland world for demonstrating experimental Decentraland **protocol** features as they land in the SDK.

- **World:** [`rglprotocol.dcl.eth`](https://decentraland.org/play/?realm=rglprotocol.dcl.eth)
- **SDK:** `@dcl/sdk` tracking the `next` tag (see [SDK pinning](#sdk-pinning))
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
    ├── physics/                 # parcels 0,0–4,5 — player-physics demo
    ├── avatar-attach-points/    # parcel 5,0 — all 26 avatar anchor points
    └── ui-borders/              # parcel 6,0 — UiTransform border features
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

Under the hood `npm run deploy` runs `scripts/deploy-all.mjs`, which deploys **each** scene in `dcl-workspace.json` individually and additively:

```
# once per scene, from that scene's folder
sdk-commands deploy \
  --target-content https://worlds-content-server.decentraland.org \
  --multi-scene
```

The current `@dcl/sdk` rejects deploying a multi-project workspace in a single call (`DEPLOY_WORKSPACE_NOT_SUPPORTED`), so each scene is deployed on its own. `--multi-scene` makes every deploy *additive* — it publishes into the world without deleting the scenes already there, so the scenes accumulate rather than overwrite one another (except where their parcels overlap).

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
4. Pin the SDK in the new scene's `package.json` to match the rest of the workspace (`@dcl/sdk` / `@dcl/js-runtime` set to `next`).

`npm install` at the root will pick up the new workspace automatically.

## SDK pinning

`@dcl/sdk` and `@dcl/js-runtime` track the `next` dist-tag across the root and every scene's `package.json`, so the whole workspace builds against the same unreleased protocol surface (currently resolves to `7.23.3-…commit-04270ca`). The demos depend on protocol features that aren't on stable yet, which is why we track `next` rather than `latest`. Keep all `package.json` files on the same spec so npm hoists a single copy — mixing a stable pin with a prerelease tag makes npm install a second SDK nested per scene.

To target a different channel (e.g. the `protocol-squad` build), re-pin every `package.json` to that tag and reinstall:

```bash
npm run upgrade-sdk:protocol-squad
```

This refreshes the SDK in both the root and every scene's `package.json`.
