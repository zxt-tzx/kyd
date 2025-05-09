import { useEffect, useState } from "react";
import type { PushSubscription } from "web-push";

import { pushSubscriptionJsonSchema } from "@/core/github/web-push/schema";
import { urlBase64ToUint8Array } from "@/core/util/crypto";

const sstStage = import.meta.env.VITE_SST_STAGE;

const isPermanentStage = sstStage === "stg" || sstStage === "prod";

async function subscribeUser(subscription: PushSubscription) {
  // TODO: replace with endpoint
  // Send the subscription object to your server
  const response = await fetch("/api/notifications/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(subscription),
  });
  return response.json();
}

async function unsubscribeUser() {
  // TODO: replace with endpoint
  // Notify your server to remove the subscription
  const response = await fetch("/api/notifications/unsubscribe", {
    method: "POST",
  });
  return response.json();
}

async function sendNotification(message: string) {
  // TODO: replace with endpoint
  // Request your server to send a test notification
  const response = await fetch("/api/notifications/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });
  return response.json();
}

/**
 * React hook for managing push notifications
 *
 * Provides functionality to check support, register service worker,
 * subscribe/unsubscribe to push notifications, and send test notifications
 */
export function usePushNotification() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function getSubscription() {
    // Use the existing service worker
    const serviceWorkerPath = isPermanentStage
      ? "prompt-sw.ts"
      : "dev-sw.js?dev-sw";
    const registration = await navigator.serviceWorker.register(
      serviceWorkerPath,
      {
        scope: "/",
        updateViaCache: "none",
      },
    );
    const sub = await registration.pushManager.getSubscription();
    return sub;
  }

  async function registerServiceWorker() {
    // no subscription exists
    const sub = await getSubscription();
    if (!sub) {
      setSubscription(null);
      return;
    }
    const res = pushSubscriptionJsonSchema.safeParse(sub.toJSON());
    if (!res.success) {
      setError(new Error("Failed to parse subscription"));
      setSubscription(null);
      return;
    }
    const validSubscription = res.data;
    setSubscription(validSubscription);
  }

  async function subscribeToPush() {
    try {
      setError(null);
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        // Using the same application server key as in prompt-sw.ts
        // TODO: This should be fetched from backend in production
        applicationServerKey: urlBase64ToUint8Array(
          "BJgPjZXgb_BKA9zO82LnSHfScw4HZgPfRNmcaoQ_XzK89QSOrawx0uxXHJrZfkm1QpaLhd2RNsNvwMBJA_g7e_k",
        ),
      });

      if (!sub) {
        setError(new Error("Failed to subscribe to push"));
        return false;
      }

      // Use parsePushSubscription to validate and parse the subscription JSON
      const validSubscription = pushSubscriptionJsonSchema.parse(sub.toJSON());
      setSubscription(validSubscription);

      // Send the subscription to the server
      await subscribeUser(validSubscription);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  }

  async function unsubscribeFromPush() {
    try {
      setError(null);
      const sub = await getSubscription();
      if (sub) {
        await sub.unsubscribe();
        setSubscription(null);
        await unsubscribeUser();
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }

  async function sendTestNotification(customMessage?: string) {
    try {
      setError(null);
      if (subscription) {
        const messageToSend = customMessage || message;
        await sendNotification(messageToSend);
        setMessage("");
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    }
  }

  return {
    isSupported,
    subscription,
    message,
    setMessage,
    error,

    // Actions
    registerServiceWorker,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification,

    // Helper properties
    isSubscribed: !!subscription,
  };
}
