# core

Core local tRPC procedures for Forge protocol.

## Notes
- `sync` now validates that `ctx.app.service.sync` is callable before dispatch.
- Error message is intentionally explicit to simplify downstream debugging.
