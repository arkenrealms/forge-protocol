# Forge Protocol

Forge protocol defines local/browser-executed tRPC procedure contracts used by Forge web (`forge.core.*`).

## Current status
- `core/core.router.ts` validates sync payloads more defensively:
  - `kind` must be non-empty and at most 128 chars,
  - `targets` must contain 1..64 entries,
  - each `targets` entry must be non-empty after trim and at most 128 chars,
  - `reason` must be non-empty and at most 512 chars,
  - raw `kind` / each `targets` entry / `reason` reject Unicode control and format chars (`Cc` + `Cf`, including ASCII/C1 controls like `\n`, `\t`, `\u0085` and invisibles like `\u200B`) before trim-normalization so hidden bytes cannot slip through (error text now explicitly says `control/format`),
  - unexpected/unknown payload keys are rejected (`.strict()`).
- Router guards missing `ctx.app.service.sync` and throws a clear error before dispatch, including constructor-aware received runtime type details (for example `undefined`, `null`, `object:Object`) to speed misconfiguration triage.
- Missing-handler type diagnostics now sanitize control/format characters and cap constructor-name detail length, keeping protocol errors single-line and log-safe even under hostile/proxy constructor metadata.
- Router now also guards property-accessor failures while reading `ctx.app.service.sync`, replacing opaque getter exceptions with a stable actionable error while preserving original throwable via `Error.cause` for debugging.
- Router now normalizes whitespace-trimmed `kind`/`targets`/`reason` into a clean dispatch payload before invoking `sync`, preventing whitespace drift into service handlers.
- Router now also normalizes those strings to Unicode NFC so canonically equivalent input values dispatch consistently.
- Router rejects duplicate `targets` after trim + Unicode normalization, preventing duplicate downstream sync execution for the same logical target.
- Router normalizes non-`Error` throwables/rejections from `ctx.app.service.sync` into a stable protocol error, now including the received throwable runtime type (for example `string`, `number`) to speed triage while preventing raw non-Error values from leaking through the tRPC surface.
- Jest coverage in `test/core.router.test.js` includes schema-rejection and normalization cases (empty targets, blank kind/reason, mixed target arrays, unknown keys, duplicate targets, dispatch payload normalization, non-Error throwable/rejection normalization, control-character rejection).
