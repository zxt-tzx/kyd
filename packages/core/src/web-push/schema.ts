import { z } from "zod";

// Schema for the keys in a push subscription
export const PushSubscriptionKeysSchema = z.object({
  p256dh: z.string(),
  auth: z.string(),
});

// Schema for the push subscription JSON
export const PushSubscriptionJsonSchema = z.object({
  endpoint: z.string(),
  expirationTime: z.number().nullable().optional(),
  keys: PushSubscriptionKeysSchema,
});

// Type for the push subscription JSON
export type PushSubscriptionJson = z.infer<typeof PushSubscriptionJsonSchema>;

export const NewSubscriptionSchema = z.object({
  subscription: PushSubscriptionJsonSchema,
});

export const SendNotificationSchema = z.object({
  subscription: PushSubscriptionJsonSchema,
  title: z.string(),
  message: z.string(),
});

// Define notification action schema
export const NotificationActionSchema = z.object({
  action: z
    .string()
    .describe(
      "A string identifying a user action to be displayed on the notification",
    ),
  title: z
    .string()
    .describe("A string containing action text to be shown to the user"),
  icon: z
    .string()
    .optional()
    .describe(
      "A string containing the URL of an icon to display with the action",
    ),
});

export type NotificationAction = z.infer<typeof NotificationActionSchema>;

// custom notification data schema
export const NotificationDataSchema = z
  .object({
    urlToOpen: z.string().url(),
  })
  .optional()
  .describe("Arbitrary data associated with the notification");

export type NotificationData = z.infer<typeof NotificationDataSchema>;

// Define direction enum for notifications
export const DirectionEnum = z.enum(["auto", "ltr", "rtl"]);

// see https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification#options
export const NotificationOptionsSchema = z.object({
  // Optional fields
  actions: z
    .array(NotificationActionSchema)
    .optional()
    .describe("Array of actions to display in the notification (Experimental)"),
  badge: z
    .string()
    .optional()
    .describe(
      "URL of image to represent the notification when there isn't enough space",
    ),
  body: z
    .string()
    .optional()
    .describe("Body text of the notification, displayed below the title"),
  data: NotificationDataSchema.optional().describe(
    "Arbitrary data to associate with the notification",
  ),
  dir: DirectionEnum.optional().describe(
    "Direction in which to display the notification: auto, ltr, or rtl",
  ),
  icon: z
    .string()
    .optional()
    .describe("URL of icon to be displayed in the notification"),
  image: z
    .string()
    .optional()
    .describe(
      "URL of image to be displayed in the notification (Experimental)",
    ),
  lang: z
    .string()
    .optional()
    .describe("Notification's language as RFC 5646 language tag"),
  renotify: z
    .boolean()
    .optional()
    .describe(
      "Whether to notify user when a new notification replaces an old one",
    ),
  requireInteraction: z
    .boolean()
    .optional()
    .describe(
      "Whether notification should remain active until user clicks/dismisses",
    ),
  silent: z
    .boolean()
    .optional()
    .describe(
      "Whether notification should be silent (no sounds or vibrations)",
    ),
  tag: z
    .string()
    .optional()
    .describe("Identifying tag for the notification for grouping"),
  timestamp: z
    .number()
    .optional()
    .describe(
      "Time associated with the notification in milliseconds since epoch",
    ),
  vibrate: z
    .union([z.number().array(), z.number()])
    .optional()
    .describe("Vibration pattern for device hardware"),
});

export type FullNotificationOptions = z.infer<typeof NotificationOptionsSchema>;

// Base schema for push notification payloads (minimal version)
export const PushNotificationPayloadSchema = z.object({
  title: z.string(),
  options: NotificationOptionsSchema,
});

export type PushNotificationPayload = z.infer<
  typeof PushNotificationPayloadSchema
>;
