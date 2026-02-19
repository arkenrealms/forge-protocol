# arken/packages/forge/packages/protocol/ANALYSIS.md

## Scope
- Direct protocol package for Forge-local tRPC procedures.
- Current live source footprint is minimal (`index.ts`, `core/core.router.ts`).

## Findings
- `core/core.router.ts` defines a single `sync` mutation with broad `any` typing for `t`, `ctx`, and `service` dispatch.
- `index.ts` exports router helpers and wires `core` namespace; typing is intentionally loose.
- Gate verification in this run:
  - `npm test` fails (`Missing script: "test"`).
  - `rushx test` fails (package command `test` not defined).
- With no repo-defined test command, source hardening is blocked by the source-change test gate for this slot.

## Next safe code targets (after minimal Jest+TS harness is added)
- Add package scripts:
  - `"test": "jest --runInBand"`
  - `"test:watch": "jest --watch"` (optional)
- Add minimal Jest TS support in-package (no ad-hoc npx):
  - dev deps: `ts-jest`, `typescript`.
  - `jest.config.ts` using `preset: 'ts-jest'`.
- Then apply focused source improvements with tests:
  - explicit context/service typing for `sync` dispatch,
  - input schema validation edge tests (`kind`, `targets`, `reason`),
  - dispatch/error-shape tests (`ctx.app.service.sync` invocation + thrown/missing service behavior).
