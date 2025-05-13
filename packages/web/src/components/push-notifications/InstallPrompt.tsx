import { useState } from "react";

import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Spinner } from "@/components/ui/spinner";

/**
 * A component that shows a prompt to install the app on the user's device
 * Only shows if the app is not already installed (running in standalone mode)
 * and only on mobile devices
 */
function InstallPrompt() {
  const { isIOS, isAndroid, isStandalone, isMobile, isLoading } =
    useInstallPrompt();
  const [open, setOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="my-4 flex justify-center">
        <Spinner size="sm" className="text-muted-foreground" />
      </div>
    );
  }

  // Don't show install button if already installed or not on mobile
  if (isStandalone || !isMobile) {
    return null;
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <div className="install-prompt bg-primary-100 my-4 cursor-pointer rounded-lg p-4 shadow-sm">
          <h3 className="mb-2 text-lg font-medium">
            Install App to receive push notifications
          </h3>
          <Button variant="outline" className="mt-2 w-full">
            Learn How
          </Button>
        </div>
      </DrawerTrigger>
      <DrawerContent className="px-4 pb-6">
        <DrawerHeader>
          <DrawerTitle className="text-center text-xl">Install App</DrawerTitle>
        </DrawerHeader>

        {isIOS && (
          <div className="mt-2 px-4">
            <h3 className="mb-4 text-lg font-medium">
              To install the app from Safari on iOS:
            </h3>

            <div className="mb-6 flex items-center gap-4">
              <div className="shrink-0">
                <img
                  src="/install/ios-share.svg"
                  alt="iOS Share Button"
                  width={36}
                  height={36}
                  className="mx-auto"
                />
              </div>
              <div>
                <p className="text-base font-medium">1. Tap Share</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="shrink-0">
                <img
                  src="/install/add-to-home-screen.svg"
                  alt="Add to Home Screen"
                  width={36}
                  height={36}
                  className="mx-auto"
                />
              </div>
              <div>
                <p className="text-base font-medium">
                  2. Swipe up and tap Add to Home Screen
                </p>
              </div>
            </div>
          </div>
        )}

        {isAndroid && (
          <div className="mt-2 px-4">
            <h3 className="mb-4 text-lg font-medium">
              To install the app on your Android device:
            </h3>

            <div className="mb-6 flex items-center gap-4">
              <div className="shrink-0">
                <span className="mx-auto block text-center text-2xl">⋮</span>
              </div>
              <div>
                <p className="text-base font-medium">1. Tap the menu button</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="shrink-0">
                <img
                  src="/install/add-to-home-screen.svg"
                  alt="Add to Home Screen"
                  width={36}
                  height={36}
                  className="mx-auto"
                />
              </div>
              <div>
                <p className="text-base font-medium">
                  2. Tap Add to Home Screen
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 px-4">
          <DrawerClose asChild>
            <Button className="w-full">Close</Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default InstallPrompt;
