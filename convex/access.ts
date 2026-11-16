import { query } from "./_generated/server";
import { isAllowListed } from "./lib/auth";

export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      return "unauthenticated" as const;
    }
    return isAllowListed(identity.subject) ? ("admin" as const) : ("denied" as const);
  },
});
