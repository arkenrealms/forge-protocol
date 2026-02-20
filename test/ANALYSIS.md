# arken/forge/protocol/test/ANALYSIS.md

- Verifies `core.sync` dispatches to `ctx.app.service.sync` when payload is valid.
- Verifies missing `sync` handler throws a clear, actionable error.
- Verifies sync-handler property accessor failures are converted into a stable protocol error.
- Verifies schema rejects empty `targets` arrays.
- Verifies schema rejects blank/whitespace `reason` values before service dispatch.
- Verifies schema rejects mixed valid/blank `targets` arrays.
- Verifies schema rejects unknown keys to prevent silent payload drift.
- Verifies schema rejects duplicate targets after trim normalization.
- Verifies dispatch payload is normalized (trimmed) before reaching the sync service.
- Verifies whitespace-only `kind` is rejected before service dispatch.
- Verifies non-`Error` sync throwables are normalized into a stable protocol error.
- Verifies non-`Error` async sync rejections are normalized into a stable protocol error.
