import type { MutationCtx, QueryCtx } from "../_generated/server";

export function isAllowListed(subject: string): boolean {
  const allowed = (process.env.ADMIN_CLERK_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
  return allowed.includes(subject);
}

export async function requireAdmin(ctx: QueryCtx | MutationCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    throw new Error("Unauthenticated");
  }
  if (!isAllowListed(identity.subject)) {
    throw new Error("Forbidden");
  }
  return identity.subject;
}
