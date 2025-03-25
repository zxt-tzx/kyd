import { index, jsonb, pgTable, text } from "drizzle-orm/pg-core";

import { getBaseColumns } from "../base.sql";

export type UserMetadata = {
  company: string | null;
  location: string | null;
  bio: string | null;
  emails: string[];
};

// each dev correlates to a Github user
export const devs = pgTable(
  "devs",
  {
    ...getBaseColumns("devs"),
    nodeId: text("node_id").notNull().unique(),
    login: text("login").notNull(),
    name: text("name"),
    email: text("email").notNull(), // not unique because users can change their emails. we track the underlying Github user using nodeId
    avatarUrl: text("avatar_url"),
    htmlUrl: text("html_url").notNull(),
    metadata: jsonb("metadata").$type<UserMetadata>(),
  },
  (table) => [index("email_idx").on(table.email)],
);
