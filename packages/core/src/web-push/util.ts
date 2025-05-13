import webpush from "web-push";

import type { PushNotificationPayload } from "./schema";

/**
 * Sends a push notification with type-safe payload validation
 * @param subscription The push subscription object
 * @param payload The notification payload that must conform to PushNotificationPayload
 * @param options Optional configuration options for the notification
 * @returns Promise with the result from webpush.sendNotification
 */
export const sendPushNotification = async (
  subscription: webpush.PushSubscription,
  payload: PushNotificationPayload,
  options?: webpush.RequestOptions,
): Promise<webpush.SendResult> => {
  // Validate the payload against the schema
  // Send the notification with validated payload
  return webpush.sendNotification(
    subscription,
    JSON.stringify(payload),
    options,
  );
};
