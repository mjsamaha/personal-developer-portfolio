import type { MutationCtx } from "../_generated/server";

export type AuditEntry = {
  actorId: string;
  action: string;
  entityTable: string;
  entityId: string;
  summary?: string;
  changedFields?: string[];
};

export async function writeAudit(ctx: MutationCtx, entry: AuditEntry) {
  const { actorId, action, entityTable, entityId, summary, changedFields } = entry;
  return await ctx.db.insert("auditLogs", {
    actorId,
    action,
    entityTable,
    entityId,
    summary,
    changedFields,
  });
}
