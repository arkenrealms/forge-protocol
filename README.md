# Forge Protocol

Forge protocol defines local/browser-executed tRPC procedure contracts used by Forge web (`forge.core.*`).

## Current status
- `core/core.router.ts` validates sync payloads more defensively:
  - `kind` must be non-empty,
  - `targets` must contain at least one non-empty entry,
  - each `targets` entry must be non-empty after trim,
  - `reason` must be non-empty,
  - unexpected/unknown payload keys are rejected (`.strict()`).
- Router still guards missing `ctx.app.service.sync` and throws a clear error before dispatch.
- Jest coverage in `test/core.router.test.js` includes schema-rejection cases (empty targets, blank reason, mixed target arrays, unknown keys) to prevent invalid payloads from reaching service handlers.
