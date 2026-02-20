# arken/packages/forge/packages/protocol/ANALYSIS.md

## Scope
- Direct protocol package for Forge-local tRPC procedures.
- Current live source footprint is minimal (`index.ts`, `core/core.router.ts`).

## Findings
- `core/core.router.ts` defines a single `sync` mutation with runtime guardrails:
  - rejects empty/whitespace `kind`,
  - rejects empty `targets` arrays and whitespace-only target entries,
  - rejects duplicate `targets` after trim normalization,
  - rejects empty/whitespace `reason`,
  - rejects unknown input keys via strict schema mode,
  - throws a clear error when `ctx.app.service.sync` is missing,
  - catches/normalizes accessor failures while reading `ctx.app.service.sync` (stable protocol error instead of leaking getter internals),
  - normalizes trimmed `kind`, `targets`, and `reason` before service dispatch.
- `index.ts` exports router helpers and wires `core` namespace; typing remains intentionally loose.
- Package test script remains `"test": "jest --runInBand"` and is runnable via `rushx test`.
- `test/core.router.test.js` now covers both dispatch behavior and schema-level rejection paths.

## Next safe code targets
- Tighten `ctx` typing for `core.sync` to reduce `any` usage without adding unnecessary abstraction.
- Add schema tests for `kind` normalization edge-cases and mixed valid/invalid `targets` arrays.
