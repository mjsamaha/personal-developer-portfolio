import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import * as audit from "../../convex/lib/audit";
import schema from "../../convex/schema";

const modules = import.meta.glob("../../convex/**/*.ts");

describe("writeAudit", () => {
  it("inserts a record with all provided fields", async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      await audit.writeAudit(ctx, {
        actorId: "user_admin",
        action: "update",
        entityTable: "projects",
        entityId: "abc123",
        summary: "Changed title",
        changedFields: ["title"],
      });
    });

    const rows = await t.run((ctx) => ctx.db.query("auditLogs").collect());
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      actorId: "user_admin",
      action: "update",
      entityTable: "projects",
      entityId: "abc123",
      summary: "Changed title",
      changedFields: ["title"],
    });
  });

  it("allows summary and changedFields to be omitted", async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      await audit.writeAudit(ctx, {
        actorId: "user_admin",
        action: "create",
        entityTable: "projects",
        entityId: "def456",
      });
    });

    const rows = await t.run((ctx) => ctx.db.query("auditLogs").collect());
    expect(rows).toHaveLength(1);
    expect(rows[0].summary).toBeUndefined();
    expect(rows[0].changedFields).toBeUndefined();
  });

  it("exports no update or delete helper", () => {
    expect(Object.keys(audit)).toEqual(["writeAudit"]);
  });
});
