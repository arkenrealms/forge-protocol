# arken/packages/forge/packages/protocol/ANALYSIS.md

## Scope
- Direct protocol package for Forge-local tRPC procedures.
- Current live source footprint is minimal (`index.ts`, `core/core.router.ts`).

## Findings
- `core/core.router.ts` defines a single `sync` mutation and now includes a runtime guard for missing `ctx.app.service.sync` before dispatch.
- `index.ts` exports router helpers and wires `core` namespace; typing remains intentionally loose.
- Added runnable package test script: `"test": "jest --runInBand"`.
- Added Jest coverage in `test/core.router.test.js` for:
  - successful dispatch to `ctx.app.service.sync`,
  - explicit failure message when the sync handler is missing.

## Next safe code targets
- Tighten `ctx` typing for `core.sync` to reduce `any` usage without adding unnecessary abstraction.
- Add schema-edge tests for invalid/empty `targets` and malformed `reason` payloads.
