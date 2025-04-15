import { index, pgTable, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";

import { getBaseColumns } from "../base.sql";

// each dev correlates to a Github user
export const devs = pgTable(
  "devs",
  {
    ...getBaseColumns("devs"),
    nodeId: text("node_id").notNull().unique(),
    login: text("login").notNull(),
    name: text("name"),
    email: text("email"),
    avatarUrl: text("avatar_url"),
    htmlUrl: text("html_url").notNull(),
    company: text("company"),
    location: text("location"),
    bio: text("bio"),
  },
  (table) => [index("email_idx").on(table.email)],
);

export const insertDevSchema = createInsertSchema(devs).omit({
  id: true,
});

export type InsertDev = z.infer<typeof insertDevSchema>;
