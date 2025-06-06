/// <reference lib="webworker" />
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";

import { isDevStage } from "@/core/util/stage";
import type { FullNotificationOptions } from "@/core/web-push/schema";
import {
  NotificationDataSchema,
  PushNotificationPayloadSchema,
} from "@/core/web-push/schema";

/* DEV NOTES FOR FUTURE ME */
/* To see console log for service workers
  1. go to chrome://inspect/#service-workers
  2. look for your service worker and click 'inspect'
*/

declare let self: ServiceWorkerGlobalScope;

const sstStage = import.meta.env.VITE_SST_STAGE;

const isDev = isDevStage(sstStage);

// somehow calling workbox methods on dev results in error
if (!isDev) {
  // self.__WB_MANIFEST is default injection point
  precacheAndRoute(self.__WB_MANIFEST);

  // clean old assets
  cleanupOutdatedCaches();

  // to allow work offline
  registerRoute(new NavigationRoute(createHandlerBoundToURL("index.html")));
}

// With autoUpdate, always skip waiting to apply updates immediately
self.skipWaiting();

// Register event listener for the 'push' event.
self.addEventListener("push", function (event) {
  if (event.data) {
    // Parse data using the schema for validation
    const res = PushNotificationPayloadSchema.safeParse(event.data.json());

    if (!res.success) {
      console.error("Failed to parse push notification data:", res.error);
      return;
    }
    const {
      options: { body, badge, icon, data },
      title,
    } = res.data;

    // Create browser notification options
    // NOTE: Our schema has 'message' but browser expects 'body'
    const options: FullNotificationOptions = {
      body,
      icon: icon ?? "/icon.png",
      badge: badge ?? "/badge.png",
      data,
      // Optional settings - uncomment as needed
      // tag: 'kyd-research', // Group related notifications
      // renotify: true, // Alert user even if there's an existing notification with same tag
      // requireInteraction: true, // Don't auto-close the notification
      // silent: false, // Allow sounds/vibrations
      // image: "/notification-image.png", // Large image to display
      /* Other available options:
      actions: [{ action: 'view', title: 'View', icon: '/action-icon.png' }],
      dir: 'auto', // or 'ltr', 'rtl'
      lang: 'en',
      timestamp: Date.now(), // Time associated with the notification
      */
    };

    // Title is passed as first parameter to showNotification
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  // Retrieve data from the notification
  const notificationData = NotificationDataSchema.parse(
    event.notification.data,
  );

  // Use the URL from notification data or fallback to default
  const url = notificationData?.urlToOpen || "https://kyd.theintel.io";

  event.waitUntil(self.clients.openWindow(url));
});
