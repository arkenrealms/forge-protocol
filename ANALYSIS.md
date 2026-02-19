# arken/packages/forge/packages/protocol/ANALYSIS.md

## Scope
- Direct protocol package for Forge-local tRPC procedures.
- Current live source footprint is minimal (`index.ts`, `core/core.router.ts`).

## Findings
- `core/core.router.ts` now validates `ctx.app.service.sync` before dispatching and throws a clear error if the service hook is missing.
- `index.ts` exports router helpers and wires `core` namespace; typing remains intentionally loose, but runtime failure mode for `core.sync` is now deterministic.
- Added package-level test gate compatible with required workflow:
  - `rushx test` now runs `dist` and then Jest unit tests (`test:unit`).
- Added focused Jest unit coverage in `core/core.router.test.js`:
  - verifies sync dispatch call-through,
  - verifies explicit missing-service error path.

## Next safe code targets
- Tighten `createRouter` typing for `service` and `ctx` without introducing abstraction layers.
- Add schema edge-case tests for invalid `targets` and empty `reason` handling based on product expectations.
- If future slots need TS-based tests directly against source, evaluate lightweight `ts-jest` adoption; current compiled-JS test path is sufficient for gate compliance.
