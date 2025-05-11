/// <reference lib="webworker" />
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";

import { isDevStage } from "@/core/util/stage";

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

// in dev, don't wait and always use the latest worker
if (isDev) {
  self.skipWaiting();
}

self.addEventListener("message", (event) => {
  // TODO: ReloadPrompt.tsx?
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

// Register event listener for the 'push' event.
self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();
    // TODO: schema to parse this, since any is unsafe
    const options: NotificationOptions = {
      body: data.message,
      icon: data.icon || "/icon.png",
      badge: "/badge.png",
      data: {
        dateOfArrival: Date.now(),
        primaryKey: "2",
      },
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener("notificationclick", function (event) {
  console.log("Notification click received.");
  event.notification.close();
  event.waitUntil(self.clients.openWindow("https://kyd.theintel.io"));
});
