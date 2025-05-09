import type { PushSubscriptionJson } from "@/core/web-push/schema";

import { client, handleResponse } from "./client";

export async function getVapidPublicKey() {
  const res = await client["push-notification"]["public-key"].$get();
  return handleResponse(res);
}

export async function subscribeUser(subscription: PushSubscriptionJson) {
  const res = await client["push-notification"]["subscribe"].$post({
    json: { subscription },
  });
  return handleResponse(res);
}

export async function unsubscribeUser() {
  const res = await client["push-notification"]["unsubscribe"].$post();
  return handleResponse(res);
}

export async function sendNotification({
  subscription,
  title,
  message,
}: {
  subscription: PushSubscriptionJson;
  title: string;
  message: string;
}) {
  const res = await client["push-notification"]["send-notification"].$post({
    json: { subscription, title, message },
  });
  return handleResponse(res);
}
