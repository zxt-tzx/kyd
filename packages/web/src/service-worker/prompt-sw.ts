/// <reference lib="webworker" />
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";

declare let self: ServiceWorkerGlobalScope;

const sstStage = import.meta.env.VITE_SST_STAGE;

const isPermanentStage = sstStage === "stg" || sstStage === "prod";

// somehow calling workbox methods on dev results in error
if (isPermanentStage) {
  // self.__WB_MANIFEST is default injection point
  precacheAndRoute(self.__WB_MANIFEST);

  // clean old assets
  cleanupOutdatedCaches();

  // to allow work offline
  registerRoute(new NavigationRoute(createHandlerBoundToURL("index.html")));
}

self.addEventListener("message", (event) => {
  // TODO: ReloadPrompt.tsx?
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

// Register event listener for the ‘push’ event.
self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();
    const options: NotificationOptions = {
      body: data.body,
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
