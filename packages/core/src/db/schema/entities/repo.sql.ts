import { pgTable, text, jsonb, index, pgEnum } from "drizzle-orm/pg-core";
import { z } from "zod";
import { getBaseColumns } from "../base.sql";

// this is GitHub's GraphQL API cursor
// we basically use this to only find issues that were updated AFTER this cursor
const _lastSeenCursorSchema = z.object({
  since: z.string().datetime(), // jsonb in postgres defaults to string, not date
  after: z.string().nullable(),
});

export const trackingStatusEnum = pgEnum("tracking_status", [
  "active",
  "paused",
]);

export type lastSeenCursor = z.infer<typeof _lastSeenCursorSchema>;

export const repos = pgTable("repos", {
  ...getBaseColumns("repos"),
  ownerLogin: text("owner_login").notNull(),
  ownerAvatarUrl: text("owner_avatar_url").notNull(),
  name: text("name").notNull(),
  nodeId: text("node_id").notNull().unique(),
  htmlUrl: text("html_url").notNull(),
  lastSeenCursor: jsonb("last_seen_cursor").$type<lastSeenCursor>(),
}, (table) => [
  index("owner_name_idx").on(table.ownerLogin, table.name),
  index("owner_idx").on(table.ownerLogin),
]);
