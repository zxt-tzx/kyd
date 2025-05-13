import { useEffect, useState } from "react";

import { useUserAgent } from "./useUserAgent";

/**
 * React hook for managing PWA installation prompts
 *
 * Provides functionality to detect if the device is iOS/Android,
 * if it's a mobile device, and if the app is already
 * running in standalone mode (installed as a PWA)
 */
export function useInstallPrompt() {
  const { userAgent, isLoading: userAgentIsLoading } = useUserAgent();
  const [isIOS, setIsIOS] = useState<boolean | null>(null);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Detect iOS devices
      setIsIOS(
        /iPad|iPhone|iPod/.test(navigator.userAgent) &&
          !(window as Window & { MSStream?: unknown }).MSStream,
      );

      // Detect mobile devices
      setIsMobile(userAgent?.device.isMobile ?? false);

      // Check if already running in standalone mode (installed as PWA)
      setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

      setIsLoading(false);
    }
  }, [userAgent]);

  // Derive isAndroid from isMobile and isIOS (if mobile but not iOS, consider it Android)
  const isAndroid = isMobile && !isIOS;

  return {
    isIOS,
    isAndroid,
    isMobile,
    isStandalone,
    userAgent,
    isLoading: userAgentIsLoading || isLoading,
  };
}
