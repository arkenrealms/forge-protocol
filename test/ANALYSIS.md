# test ANALYSIS

## 2026-02-19
- Added router-level behavioral tests via Node test runner importing source TypeScript with `--experimental-strip-types`.
- Tests are run through `rushx test` using `node --experimental-strip-types --test test/core.router.test.mjs`.
