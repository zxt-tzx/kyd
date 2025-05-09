import { useEffect, useState } from "react";

/**
 * React hook for managing PWA installation prompts
 *
 * Provides functionality to detect if the device is iOS and if the app is already
 * running in standalone mode (installed as a PWA)
 */
export function useInstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect iOS devices
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        !(window as Window & { MSStream?: unknown }).MSStream,
    );

    // Check if already running in standalone mode (installed as PWA)
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

    // // Also listen for changes in display mode
    // const mediaQuery = window.matchMedia("(display-mode: standalone)");
    // const handleChange = (e: MediaQueryListEvent) => {
    //   setIsStandalone(e.matches);
    // };

    // // Add event listener for future changes (if user installs while app is open)
    // mediaQuery.addEventListener("change", handleChange);

    // // Clean up event listener
    // return () => {
    //   mediaQuery.removeEventListener("change", handleChange);
    // };
  }, []);

  return {
    isIOS,
    isStandalone,
  };
}
