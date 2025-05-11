import { usePushNotification } from "@/hooks/usePushNotification";

export function PushNotificationManager() {
  const {
    isSupported,
    subscription,
    message,
    setMessage,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification,
  } = usePushNotification();

  if (!isSupported) {
    return <p>Push notifications are not supported in this browser.</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Push Notifications</h3>

      {subscription ? (
        <div className="space-y-4">
          <p>You are subscribed to push notifications.</p>
          <button
            onClick={unsubscribeFromPush}
            className="rounded bg-red-600 px-4 py-2  hover:bg-red-700"
          >
            Unsubscribe
          </button>

          <div className="space-y-2">
            <p>Send a test notification:</p>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter notification message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 rounded border px-3 py-2"
              />
              <button
                onClick={() => sendTestNotification({ title: "Test", message })}
                disabled={!message}
                className="rounded bg-blue-600 px-4 py-2  hover:bg-blue-700 disabled:opacity-50"
              >
                Send Test
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p>You are not subscribed to push notifications.</p>
          <button
            onClick={subscribeToPush}
            className="rounded bg-green-600 px-4 py-2  hover:bg-green-700"
          >
            Subscribe
          </button>
        </div>
      )}
    </div>
  );
}
