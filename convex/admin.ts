import { query } from "./_generated/server";
import { requireAdmin } from "./lib/auth";

export const adminPing = query({
  args: {},
  handler: async (ctx) => {
    const actorId = await requireAdmin(ctx);
    return { ok: true as const, actorId };
  },
});
