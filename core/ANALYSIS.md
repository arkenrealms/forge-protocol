# core ANALYSIS

## 2026-02-19
- Hardened `sync` mutation dispatch with a callable guard for `ctx.app.service.sync`.
- This avoids opaque runtime property errors and returns a deterministic TypeError when service wiring is missing.
- Added input-shape guardrails directly in the router schema:
  - `kind` and `reason` are trimmed and must remain non-empty.
  - `targets` must be a non-empty list of non-blank strings.
- This prevents no-op/invalid sync requests from reaching service handlers.
