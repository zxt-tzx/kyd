import InstallPrompt from "@/components/push-notifications/InstallPrompt";
import { PushNotificationManager } from "@/components/push-notifications/PushNotificationManager";

export function TestPage() {
  return (
    <div className="relative flex w-full justify-center pt-16">
      <div className="w-full max-w-4xl px-4">
        <div className="mx-auto mb-8">
          <div className="card border border-primary/20 bg-card p-6">
            <h1 className="my-4 text-3xl font-bold text-primary">Test Page</h1>
            <p className="my-2 text-foreground">
              This is a test page to demonstrate push notifications in our
              application
            </p>
            <PushNotificationManager />
            <InstallPrompt />
          </div>
        </div>
      </div>
    </div>
  );
}
