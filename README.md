# Forge Protocol

Forge protocol defines local/browser-executed tRPC procedure contracts used by Forge web (`forge.core.*`).

## Current status
- Added a runnable `rushx test` path (`node --experimental-strip-types --test test/core.router.test.mjs`) so source edits stay test-gated without requiring extra build tooling in this runtime.
- Hardened `forge.core.sync` dispatch to fail fast with a clear error when `ctx.app.service.sync` is missing/non-function.
- Added coverage for successful sync dispatch and missing-service failure path.
- Source analyzed in this run: `index.ts`, `core/core.router.ts`, `test/core.router.test.js`.
