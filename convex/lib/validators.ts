import { v } from "convex/values";

export const status = v.union(
  v.literal("draft"),
  v.literal("review"),
  v.literal("published"),
  v.literal("archived"),
);
