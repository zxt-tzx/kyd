import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { Resource } from "sst";
import webpush from "web-push";

import {
  newSubscriptionSchema,
  sendNotificationSchema,
} from "@/core/web-push/schema";
import type { Context } from "@/server/app";

import { createSuccessResponse } from "../response";

webpush.setVapidDetails(
  "https://kyd.theintel.io",
  Resource.VAPID_PUBLIC_KEY.value,
  Resource.VAPID_PRIVATE_KEY.value,
);

export const pushNotificationRouter = new Hono<Context>()
  .get("/public-key", async (c) => {
    return c.json(
      createSuccessResponse({
        data: {
          vapidPublicKey: Resource.VAPID_PUBLIC_KEY.value,
        },
        message: "VAPID public key fetched successfully",
      }),
    );
  })
  .post("/subscribe", zValidator("json", newSubscriptionSchema), async (c) => {
    const { subscription } = c.req.valid("json");
    // In a production environment, you would want to store the subscription in a database
    return c.json(
      createSuccessResponse({
        data: { subscription },
        message: "Subscription added successfully",
      }),
    );
  })
  // need something from frontend to identify which subscription to remove
  .post("/unsubscribe", async (c) => {
    // In a production environment, you would want to remove the subscription from a database
    return c.json(
      createSuccessResponse({
        data: {},
        message: "Subscription removed successfully",
      }),
    );
  })
  .post(
    "/send-notification",
    zValidator("json", sendNotificationSchema),
    async (c) => {
      const { message, title, subscription } = c.req.valid("json");
      const sendResult = await webpush.sendNotification(
        subscription,
        JSON.stringify({ title, message }),
        {
          TTL: 60,
        },
      );
      console.dir(sendResult);
      return c.json(
        createSuccessResponse({
          data: { sendResult },
          message: "Notification sent successfully",
        }),
      );
    },
  );
