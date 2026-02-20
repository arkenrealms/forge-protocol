# Forge Protocol

Forge protocol defines local/browser-executed tRPC procedure contracts used by Forge web (`forge.core.*`).

## Current status
- `core/core.router.ts` validates sync payloads more defensively:
  - `kind` must be non-empty,
  - `targets` must contain at least one non-empty entry,
  - each `targets` entry must be non-empty after trim,
  - `reason` must be non-empty,
  - unexpected/unknown payload keys are rejected (`.strict()`).
- Router guards missing `ctx.app.service.sync` and throws a clear error before dispatch.
- Router now also guards property-accessor failures while reading `ctx.app.service.sync`, replacing opaque getter exceptions with a stable actionable error.
- Router now normalizes whitespace-trimmed `kind`/`targets`/`reason` into a clean dispatch payload before invoking `sync`, preventing whitespace drift into service handlers.
- Router rejects duplicate `targets` after trim normalization, preventing duplicate downstream sync execution for the same logical target.
- Jest coverage in `test/core.router.test.js` includes schema-rejection and normalization cases (empty targets, blank kind/reason, mixed target arrays, unknown keys, duplicate targets, dispatch payload normalization).
