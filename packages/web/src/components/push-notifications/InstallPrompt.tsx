import { useInstallPrompt } from "@/hooks/useInstallPrompt";

/**
 * A component that shows a prompt to install the app on the user's device
 * Only shows if the app is not already installed (running in standalone mode)
 */
function InstallPrompt() {
  const { isIOS, isStandalone } = useInstallPrompt();

  if (isStandalone) {
    return null; // Don't show install button if already installed
  }

  return (
    <div className="install-prompt bg-primary-100 my-4 rounded-lg p-4 shadow-sm">
      <h3 className="mb-2 text-lg font-medium">Install App</h3>
      <button className="bg-primary-500 hover:bg-primary-600 rounded-md px-4 py-2 transition-colors">
        Add to Home Screen
      </button>
      {isIOS && (
        <p className="mt-2 text-sm text-gray-700">
          To install this app on your iOS device, tap the share button
          <span role="img" aria-label="share icon">
            {" "}
            ⎋{" "}
          </span>
          and then &quot;Add to Home Screen&quot;
          <span role="img" aria-label="plus icon">
            {" "}
            ➕{" "}
          </span>
          .
        </p>
      )}
    </div>
  );
}

export default InstallPrompt;
