import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  auditLogs: defineTable({
    actorId: v.string(),
    action: v.string(),
    entityTable: v.string(),
    entityId: v.string(),
    summary: v.optional(v.string()),
    changedFields: v.optional(v.array(v.string())),
  }).index("by_entity", ["entityTable", "entityId"]),
});
