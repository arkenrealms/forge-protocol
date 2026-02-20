# Forge Protocol

Forge protocol defines local/browser-executed tRPC procedure contracts used by Forge web (`forge.core.*`).

## Current status
- Source updated in this run: `core/core.router.ts` now guards missing `ctx.app.service.sync` and throws a clear error.
- Added a package test command (`rushx test`) and Jest coverage in `test/core.router.test.js`.
- This slot is now test-runnable for future protocol changes.
