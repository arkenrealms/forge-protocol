# arken/packages/forge/packages/protocol/ANALYSIS.md

## Scope
- Direct protocol package for Forge-local tRPC procedures.
- Current live source footprint is minimal (`index.ts`, `core/core.router.ts`).

## Findings
- `core/core.router.ts` now guards `ctx.app.service.sync` before invocation and throws a stable, explicit error (`forge.core.sync service is unavailable`) when missing.
- Package now has runnable local test entrypoints via `rushx test` using a Jest+TS harness (`jest.config.js` with `ts-jest`).
- Added regression tests for:
  - successful dispatch to `ctx.app.service.sync(input, ctx)`
  - missing sync handler error path.

## Next safe code targets
- Reduce broad `any` usage in `index.ts` + `core/core.router.ts` by introducing a minimal typed app context shape.
- Add schema-edge tests for invalid `targets` entries and empty `reason` handling once product expectations are confirmed.
- Add build/test CI parity check in package docs (same command: `rushx test`).
