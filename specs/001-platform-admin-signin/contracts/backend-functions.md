# Contract: Backend Functions

All functions declare argument validators. Errors are thrown as generic `ConvexError`/`Error` messages with no data.

| Function | Kind | Caller | Args | Returns | Behavior |
|---|---|---|---|---|---|
| `access.current` | query | anyone | none | `"admin" \| "denied" \| "unauthenticated"` | Reports only the caller's own state. Not an admin function; returns no content. |
| `admin.adminPing` | query | admin | none | `{ ok: true, actorId: string }` | Calls `requireAdmin` first. Sample guarded function used by tests and the dashboard placeholder. |

## Shared helpers (not callable from clients)

- `requireAdmin(ctx)` → `actorId: string`. Reads the verified identity; throws `Unauthenticated` if none, `Forbidden` if `subject` is not in `ADMIN_CLERK_USER_IDS` (an empty or missing list rejects everyone). Must be the first statement of every `admin*` function.
- `writeAudit(ctx, entry)` → inserts an `auditLogs` record (see [data-model.md](../data-model.md)); mutation context only; no update/delete counterpart.

## Contract tests

1. `adminPing` with no identity → rejects.
2. `adminPing` with an identity not on the allow-list → rejects.
3. `adminPing` with an allow-listed identity → `{ ok: true }`.
4. Empty allow-list → rejects even a signed-in user.
5. `access.current` returns the matching state for each case.
6. `writeAudit` stores the entry and exposes no update/delete function.
