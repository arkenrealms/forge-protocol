# arken/packages/forge/packages/protocol/ANALYSIS.md

## Scope
- Direct protocol package for Forge-local tRPC procedures.
- Current live source footprint is minimal (`index.ts`, `core/core.router.ts`).

## Findings
- `core/core.router.ts` defines a single `sync` mutation with runtime guardrails:
  - rejects empty/whitespace `kind` and caps length to 128 chars,
  - rejects empty `targets` arrays, arrays above 64 entries, and whitespace-only target entries,
  - rejects overlong target entries (>128 chars),
  - rejects duplicate `targets` after trim normalization,
  - rejects Unicode control/format characters (`Cc` + `Cf`) in raw `kind`, target entries, and `reason` before trim-normalization to avoid hidden payload drift (including invisible format chars) into sync services,
  - rejects empty/whitespace `reason` and caps length to 512 chars,
  - rejects unknown input keys via strict schema mode,
  - throws a clear error when `ctx.app.service.sync` is missing and includes the received runtime type (`undefined`, `null`, etc.) for faster configuration debugging,
  - catches/normalizes accessor failures while reading `ctx.app.service.sync` (stable protocol error instead of leaking getter internals) and preserves underlying throwable as `Error.cause` for debuggability,
  - normalizes trimmed `kind`, `targets`, and `reason` before service dispatch,
  - normalizes `kind`/`targets`/`reason` to Unicode NFC for stable canonical payload representation,
  - catches non-`Error` throwables/rejections from `sync` and emits a stable protocol error to keep failure shape predictable for callers.
- `index.ts` exports router helpers and wires `core` namespace; typing remains intentionally loose.
- Package test script now runs `"test": "npm run dist && jest --runInBand"` so tests always execute against freshly built output and cannot drift from source edits; runnable via `rushx test`.
- `test/core.router.test.js` now covers both dispatch behavior and schema-level rejection paths.

## Change rationale (2026-02-20)
- Tightened control-character validation order so raw `kind`, `targets`, and `reason` are checked before trim-normalization; this closes a gap where leading/trailing control bytes (for example a trailing newline) could be trimmed away and accepted.
- Expanded control-character coverage from ASCII-only to full Unicode `Cc` controls so C1 bytes (for example `\u0085`) cannot bypass payload/log safety checks.
- Extended validation to Unicode format controls (`Cf`, for example zero-width space `\u200B`) so invisible characters cannot bypass payload/log safety checks.
- Added NFC Unicode normalization for payload strings so canonically equivalent text (for example `café` vs `cafe\u0301`) is dispatched consistently and duplicate-target detection remains reliable across composition forms.
- Updated the package test pipeline to build before Jest, preventing stale `build/` artifacts from masking source-level router changes during maintenance runs.
- Preserved original throwables in `Error.cause` for accessor/read and non-Error sync failures so operators can inspect root cause without losing the stable protocol-facing error message.
- Added explicit received-type diagnostics for missing/non-callable `ctx.app.service.sync` (including null/undefined) so environment misconfiguration can be identified directly from protocol errors without extra instrumentation.

## Next safe code targets
- Tighten `ctx` typing for `core.sync` to reduce `any` usage without adding unnecessary abstraction.
- Add schema tests for `kind` normalization edge-cases and mixed valid/invalid `targets` arrays.
