import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { api } from "../../convex/_generated/api";
import schema from "../../convex/schema";

const modules = import.meta.glob("../../convex/**/*.ts");

const ADMIN_ID = "user_admin";
const OTHER_ID = "user_other";

function setup() {
  return convexTest(schema, modules);
}

describe("admin.adminPing", () => {
  beforeEach(() => {
    process.env.ADMIN_CLERK_USER_IDS = ADMIN_ID;
  });

  afterEach(() => {
    delete process.env.ADMIN_CLERK_USER_IDS;
  });

  it("rejects when there is no identity", async () => {
    await expect(setup().query(api.admin.adminPing, {})).rejects.toThrow("Unauthenticated");
  });

  it("rejects an identity that is not allow-listed", async () => {
    const t = setup().withIdentity({ subject: OTHER_ID });
    await expect(t.query(api.admin.adminPing, {})).rejects.toThrow("Forbidden");
  });

  it("succeeds for an allow-listed identity", async () => {
    const t = setup().withIdentity({ subject: ADMIN_ID });
    await expect(t.query(api.admin.adminPing, {})).resolves.toMatchObject({
      ok: true,
      actorId: ADMIN_ID,
    });
  });

  it("matches allow-listed IDs in a comma-separated list with whitespace", async () => {
    process.env.ADMIN_CLERK_USER_IDS = ` ${OTHER_ID} , ${ADMIN_ID} `;
    const t = setup().withIdentity({ subject: ADMIN_ID });
    await expect(t.query(api.admin.adminPing, {})).resolves.toMatchObject({ ok: true });
  });

  it("rejects everyone when the list is empty", async () => {
    process.env.ADMIN_CLERK_USER_IDS = "";
    const t = setup().withIdentity({ subject: ADMIN_ID });
    await expect(t.query(api.admin.adminPing, {})).rejects.toThrow("Forbidden");
  });

  it("rejects everyone when the list is unset", async () => {
    delete process.env.ADMIN_CLERK_USER_IDS;
    const t = setup().withIdentity({ subject: ADMIN_ID });
    await expect(t.query(api.admin.adminPing, {})).rejects.toThrow("Forbidden");
  });
});

describe("access.current", () => {
  beforeEach(() => {
    process.env.ADMIN_CLERK_USER_IDS = ADMIN_ID;
  });

  afterEach(() => {
    delete process.env.ADMIN_CLERK_USER_IDS;
  });

  it('returns "unauthenticated" with no identity', async () => {
    await expect(setup().query(api.access.current, {})).resolves.toBe("unauthenticated");
  });

  it('returns "denied" for a signed-in non-admin', async () => {
    const t = setup().withIdentity({ subject: OTHER_ID });
    await expect(t.query(api.access.current, {})).resolves.toBe("denied");
  });

  it('returns "admin" for an allow-listed identity', async () => {
    const t = setup().withIdentity({ subject: ADMIN_ID });
    await expect(t.query(api.access.current, {})).resolves.toBe("admin");
  });
});
