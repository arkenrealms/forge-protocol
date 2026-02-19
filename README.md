# Forge Protocol

Forge protocol defines local/browser-executed tRPC procedure contracts used by Forge web (`forge.core.*`).

## Current status
- Added package-local Jest + TypeScript test harness (`rushx test` now runs in this package).
- Hardened `core.sync` dispatch with an explicit missing-service error.
- Added coverage for successful dispatch and missing-service failure paths.
- `ANALYSIS.md` tracks follow-up typing hardening opportunities.
