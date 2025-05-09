/// <reference lib="webworker" />
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";

declare let self: ServiceWorkerGlobalScope;

self.addEventListener("message", (event) => {
  // TODO: ReloadPrompt.tsx?
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

// self.__WB_MANIFEST is default injection point
precacheAndRoute(self.__WB_MANIFEST);

// clean old assets
cleanupOutdatedCaches();

// to allow work offline
registerRoute(new NavigationRoute(createHandlerBoundToURL("index.html")));

async function getEndpoint() {
  const subscription = await self.registration.pushManager.getSubscription();
  console.log(subscription?.endpoint);
  await subscribeUser();
}

// Register event listener for the ‘push’ event.
self.addEventListener("push", function (event) {
  // Keep the service worker alive until the notification is created.
  event.waitUntil(
    getEndpoint()
      .then(function (endpoint) {
        // TODO: modify this to fit our actual endpoint for this
        // Retrieve the textual payload from the server using a GET request. We are using the endpoint as an unique ID
        // of the user for simplicity.
        return fetch("./getPayload?endpoint=" + endpoint);
      })
      .then(function (response) {
        return response.text();
      })
      .then(function (payload) {
        // Show a notification with title ‘ServiceWorker Cookbook’ and use the payload as the body.
        self.registration.showNotification("ServiceWorker Cookbook", {
          body: payload,
        });
      }),
  );
});
