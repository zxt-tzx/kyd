import { pgTable, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";

import { getBaseColumns } from "../base.sql";
import { devs } from "./dev.sql";

export const queries = pgTable("queries", {
  ...getBaseColumns("queries"),
  urlId: text("url_id").notNull(),
  prompt: text("prompt").notNull(),
  devId: text("dev_id")
    .references(() => devs.id)
    .notNull(),
});

export const insertQuerySchema = createInsertSchema(queries).omit({
  id: true,
});

export type InsertQuery = z.infer<typeof insertQuerySchema>;
