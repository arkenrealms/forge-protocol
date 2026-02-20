# Forge Protocol

Forge protocol defines local/browser-executed tRPC procedure contracts used by Forge web (`forge.core.*`).

## Current status
- `core/core.router.ts` validates sync payloads more defensively:
  - `kind` must be non-empty,
  - `targets` must contain at least one non-empty entry,
  - `reason` must be non-empty.
- Router still guards missing `ctx.app.service.sync` and throws a clear error before dispatch.
- Jest coverage in `test/core.router.test.js` now includes schema-rejection cases to prevent invalid payloads from reaching service handlers.
