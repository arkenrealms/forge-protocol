# arken/forge/protocol/test/ANALYSIS.md

- Verifies `core.sync` dispatches to `ctx.app.service.sync` when payload is valid.
- Verifies missing `sync` handler throws a clear, actionable error.
- Verifies schema rejects empty `targets` arrays.
- Verifies schema rejects blank/whitespace `reason` values before service dispatch.
- Verifies schema rejects mixed valid/blank `targets` arrays.
- Verifies schema rejects unknown keys to prevent silent payload drift.
