# core ANALYSIS

## 2026-02-19
- Hardened `sync` mutation dispatch with a callable guard for `ctx.app.service.sync`.
- This avoids opaque runtime property errors and returns a deterministic TypeError when service wiring is missing.
