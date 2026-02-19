# arken/packages/forge/packages/protocol/ANALYSIS.md

## Scope
- Direct protocol package for Forge-local tRPC procedures.
- Current live source footprint is minimal (`index.ts`, `core/core.router.ts`).

## Findings
- `core/core.router.ts` defines a single `sync` mutation with broad `any` typing for `t`, `ctx`, and `service` dispatch.
- `index.ts` exports router helpers and wires `core` namespace; typing is intentionally loose.
- Repo currently has no runnable local toolchain in this runtime (`tsc` and `jest` binaries unavailable), so source hardening is blocked by the source-change test gate.

## Next safe code targets (when test runtime is restored)
- Add explicit context/service types for `sync` mutation dispatch.
- Add Jest+TS unit tests for:
  - input schema validation (`kind`, `targets`, `reason`)
  - `sync` dispatch invocation shape (`ctx.app.service.sync` called once with input+ctx)
  - error propagation when service is missing or throws.
