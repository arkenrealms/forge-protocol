# arken/forge/protocol/test/ANALYSIS.md

- Verifies `core.sync` dispatches to `ctx.app.service.sync` when payload is valid.
- Verifies missing `sync` handler throws a clear, actionable error.
- Verifies sync-handler property accessor failures are converted into a stable protocol error while preserving the original exception in `Error.cause`.
- Verifies schema rejects empty `targets` arrays.
- Verifies schema rejects blank/whitespace `reason` values before service dispatch.
- Verifies schema rejects mixed valid/blank `targets` arrays.
- Verifies schema rejects unknown keys to prevent silent payload drift.
- Verifies schema rejects duplicate targets after trim normalization.
- Verifies schema rejects oversized `kind` values (>128 chars).
- Verifies schema rejects oversized target entries (>128 chars).
- Verifies schema rejects oversized target arrays (>64 entries).
- Verifies schema rejects oversized `reason` values (>512 chars).
- Verifies dispatch payload is normalized (trimmed) before reaching the sync service.
- Verifies whitespace-only `kind` is rejected before service dispatch.
- Verifies non-`Error` sync throwables are normalized into a stable protocol error.
- Verifies non-`Error` async sync rejections are normalized into a stable protocol error.
- Verifies schema rejects control characters in kind, target entries, and reason text to keep sync payloads transport/log safe.
- Verifies leading/trailing control characters are rejected before trim-normalization (for example kind/reason values that would otherwise become valid after trim).
