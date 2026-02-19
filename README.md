# Forge Protocol

Forge protocol defines local/browser-executed tRPC procedure contracts used by Forge web (`forge.core.*`).

## Current status
- Source reviewed and updated in this run: `index.ts`, `core/core.router.ts`.
- Added a runnable package test gate via `rushx test` (`dist` + Jest unit tests).
- Added reliability guard in `core.sync` mutation to throw a clear error when `ctx.app.service.sync` is missing.
- Added unit coverage in `core/core.router.test.js` for happy path and missing-service failure path.
