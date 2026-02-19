# arken/packages/forge/packages/protocol/ANALYSIS.md

## Scope
- Direct protocol package for Forge-local tRPC procedures.
- Current live source footprint is minimal (`index.ts`, `core/core.router.ts`).

## Findings
- `core/core.router.ts` still defines a small single-procedure surface, but now guards `ctx?.app?.service?.sync` before dispatch.
- Missing service path now throws a deterministic `TypeError` (`forge.core.sync requires ctx.app.service.sync to be a function`) rather than crashing with an indirect property error.
- Added package-level test script so `rushx test` is runnable in this repo:
  - `test`: `node --experimental-strip-types --test test/core.router.test.mjs`
- Added `test/core.router.test.mjs` to validate:
  - successful `sync(input, ctx)` dispatch,
  - clear failure when `ctx.app.service.sync` is missing.

## Follow-ups
- Tighten `createRouter` typing (`t` and context) to reduce `any` surface while keeping current API shape stable.
- Add input edge-case tests (`targets` empty, malformed reason/kind values) if behavior requirements are clarified.
