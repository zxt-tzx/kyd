import { index, pgTable, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";

import { getBaseColumns } from "../base.sql";

// each dev correlates to a Github user
export const pushNotificationSubscriptions = pgTable(
  "push_notification_subscriptions",
  {
    ...getBaseColumns("push_notification_subscriptions"),
  },
);
