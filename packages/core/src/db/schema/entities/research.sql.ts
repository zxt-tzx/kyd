import { pgTable, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";

import { getBaseColumns } from "../base.sql";
import { devs } from "./dev.sql";

export const researches = pgTable("researches", {
  ...getBaseColumns("researches"),
  nanoId: text("url_id").notNull().unique(),
  prompt: text("prompt").notNull(),
  devId: text("dev_id")
    .references(() => devs.id)
    .notNull(),
});

export const insertResearchSchema = createInsertSchema(researches).omit({
  id: true,
});

export type InsertResearch = z.infer<typeof insertResearchSchema>;
