<!-- agents.md -->
# React Forge Protocol (package/local contracts)

## Intention
Forge “protocol” defines the **browser-local contract** for procedures that run inside the Forge React runtime.
These procedures are executed locally (no network), but still use tRPC-style typing and a consistent call surface.

The goal is:
- keep local UX actions (e.g. showLogin, authorize, ui state changes) type-safe
- allow OneJS/Unity to call into Forge using string-path `core.*` methods that normalize to `forge.core.*`
- avoid duplicating contract shapes in multiple places

## Architecture
### Local router execution in browser
Forge creates a browser-safe router:
- `initTRPC.context<AppCtx>().create({ isServer: true })`
- `t.router({ core: Core.createRouter(t) })`
- invoked via `t.createCallerFactory(router)(ctx)` inside `localLink`

### Contracts source of truth
Local procedures should be defined once:
- prefer a `core.router.ts` that builds procedures with zod schemas
- optionally also export a “contract” object (zod inputs/outputs) if UI code needs the schema

Consumers should derive types from the real router:
- `export type ForgeRouter = typeof router` (from localLink/router factory)

## Public API surface
### Preferred call paths
- `forge.core.showLogin` (mutation/command)
- `forge.core.authorize` (if implemented as local tRPC proc)
- `forge.account.*` (future)

Unity inbound normalization:
- `core.authorize` → `forge.core.authorize`

### Hook usage (React Query)
Forge should preserve:
- `trpc.forge.core.showLogin.useMutation()`

This requires:
- exporting `trpc = createTRPCReact<AppRouter>()`
- including `forge: ForgeRouter` in `AppRouter` typing

## Important files
- `arken/forge/web/src/modules/core/core.router.ts`
  - defines local procedures
- `arken/forge/web/src/utils/localLink.ts`
  - builds local router + caller + intercept link
- `arken/forge/web/src/utils/trpc.ts`
  - defines AppRouter type for hooks and exports `trpc`

## Conventions
- Local-only procedures are always under the `forge.*` namespace
- If Unity sends bare `core.*`, the web app normalizes it to `forge.core.*`
- Keep these procedures side-effect oriented (commands), not data fetching, unless it’s truly local state

## Debugging checklist
- If Unity calls land in localLink but fail:
  - confirm the proc exists in `Core.createRouter(t)`
  - confirm normalization to `forge.core.*` matches link routing
- If hooks fail to typecheck:
  - verify `AppRouter` includes `forge: ForgeRouter`
  - verify `trpc` is exported and Provider uses `trpcClientReact`