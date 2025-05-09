import { z } from "zod";

// Schema for the keys in a push subscription
export const pushSubscriptionKeysSchema = z.object({
  p256dh: z.string(),
  auth: z.string(),
});

// Schema for the push subscription JSON
export const pushSubscriptionJsonSchema = z.object({
  endpoint: z.string(),
  expirationTime: z.number().nullable().optional(),
  keys: pushSubscriptionKeysSchema,
});

// Type for the push subscription JSON
export type PushSubscriptionJson = z.infer<typeof pushSubscriptionJsonSchema>;

export const newSubscriptionSchema = z.object({
  subscription: pushSubscriptionJsonSchema,
});

export const sendNotificationSchema = z.object({
  subscription: pushSubscriptionJsonSchema,
  title: z.string(),
  message: z.string(),
});
