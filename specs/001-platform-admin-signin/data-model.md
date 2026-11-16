# Data Model: Platform Foundation and Admin Sign-In

Follows `docs/Data Model and Schema Conventions.md`. Only one table is created in this feature.

## auditLogs (admin-only, no `status`)

| Field | Type | Notes |
|---|---|---|
| `actorId` | string | Clerk user ID (token `subject`) |
| `action` | string | e.g. `"article.publish"`; dotted `entity.verb` |
| `entityTable` | string | Table name affected |
| `entityId` | string | Affected document ID |
| `summary` | optional string | Short human text; never full bodies, tokens, credentials |
| `changedFields` | optional array of string | Field names only |

- Index: `by_entity` (`entityTable`, `entityId`).
- System fields `_id` and `_creationTime` provide identity and time; no `createdAt`.
- Append-only: no update or delete function exists. Written by `writeAudit` in the same transaction as the change.
- Not exposed to public queries. No viewer in this feature.

## Non-stored concepts

- **Administrator**: not stored. Derived at call time: token `subject` is in the `ADMIN_CLERK_USER_IDS` environment allow-list.
- **Session**: owned by Clerk; ends on sign-out or expiry.

## Shared validators (`convex/lib/validators.ts`)

Created now with the content `status` union (`draft | review | published | archived`) so later modules import one definition. It is unused by this feature's tables.

## State transitions

None in this feature.
