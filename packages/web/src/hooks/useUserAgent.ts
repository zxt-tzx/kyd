// from https://github.com/Poolshark/react-hook-useagent v1.1.0
import { useEffect, useState } from "react";

export type Browsers =
  | "Chrome"
  | "Chromium"
  | "Firefox"
  | "Seamonkey"
  | "Opera15+"
  | "Opera12-"
  | "Safari"
  | "unknown";

export type UserAgent = {
  device: {
    isMobile: boolean;
    platform: string;
    device: string;
  };
  browser: {
    name: string;
    version: string;
  };
  renderingEngine: {
    name: string;
    version: string;
  };
};

// Default values
export const DEFAULT_DEVICE = {
  isMobile: false,
  platform: "Unknown",
  device: "Unknown",
};

export const DEFAULT_BROWSER = {
  name: "unknown",
  version: "0",
};

export const DEFAULT_RENDERING_ENGINE = {
  name: "Unknown",
  version: "0",
};

/**
 * -----------------------------------------------------------
 *  Detect Browser
 * -----------------------------------------------------------
 * Detects the browser and returns an object with the current
 * browser and version.
 *
 * @param navigator The window.navigator object
 * @returns         The browser object
 * -----------------------------------------------------------
 */
export const detectBrowser = (
  navigator: Navigator,
): { name: string; version: string } => {
  const browserRegexes = new Map<Browsers, RegExp>([
    ["Chrome", /Chrome\/([0-9.]+)/],
    ["Chromium", /Chromium\/([0-9.]+)/],
    ["Firefox", /Firefox\/([0-9.]+)/],
    ["Seamonkey", /Seamonkey\/([0-9.]+)/],
    ["Safari", /Version\/([0-9.]+).*Safari/],
    ["Opera15+", /OPR\/([0-9.]+)/],
    ["Opera12-", /Opera\/([0-9.]+)/],
  ]);

  for (const [browser, regex] of browserRegexes) {
    const match = navigator.userAgent.match(regex);

    if (match) {
      let test = false;

      if (browser === "Chrome") {
        test = /(Chromium\/([0-9.]+))|(Edg.*\/([0-9.]+))/.test(
          navigator.userAgent,
        );
      }

      if (browser === "Firefox") {
        test = /Seamonkey\/([0-9.]+)/.test(navigator.userAgent);
      }

      if (!test) {
        return {
          name: browser,
          version: match[1] || "0",
        };
      }
    }
  }

  return DEFAULT_BROWSER;
};

/**
 * -----------------------------------------------------------
 *  Detect Rendering Engine
 * -----------------------------------------------------------
 * Detects the renbdering engine and returns an object with the
 * current rendering engine and version.
 *
 * @param navigator The window.navigator object
 * @returns         The rendering engine object
 * -----------------------------------------------------------
 */
export const detectRenderingEngine = (
  navigator: Navigator,
): { name: string; version: string } => {
  const renderingEngineRegexes = new Map([
    ["Blink", /Chrome\/([0-9.]+)/],
    ["Gecko", /Gecko\/([0-9.]+)/],
    ["Presto", /Opera\/([0-9.]+)/],
    ["WebKit", /AppleWebKit\/([0-9.]+)/],
    ["EdgeHTML", /Edge\/([0-9.]+)/],
  ]);

  for (const [engine, regex] of renderingEngineRegexes) {
    const match = navigator.userAgent.match(regex);

    if (match) {
      return {
        name: engine,
        version: match[1] || "0",
      };
    }
  }

  return DEFAULT_RENDERING_ENGINE;
};

/**
 * -----------------------------------------------------------
 *  Detect Device
 * -----------------------------------------------------------
 * Detects the if the user is using a mobile or desktop device
 * and returns an object with the current platform, device and
 * mobile flag.
 *
 * @param navigator The window.navigator object
 * @returns         The device object
 * -----------------------------------------------------------
 */
export const detectDevice = (navigator: Navigator) => {
  const mobileRegexes = new Map([
    ["Android", /Android/i],
    ["iOS", /iPhone|iPad|iPod/i],
    ["Windows", /win/i],
    ["Linux", /linux/i],
    ["Mac OS", /mac/i],
  ]);

  for (const [platform, regex] of mobileRegexes) {
    const match = navigator.userAgent.match(regex);
    if (match) {
      const isMobile = /Mobi/.test(navigator.userAgent);
      return {
        isMobile,
        platform,
        device: isMobile ? match[0] : "Desktop PC",
      };
    }
  }
  return DEFAULT_DEVICE;
};

/**
 * -----------------------------------------------------------
 *  Use User Agent
 * -----------------------------------------------------------
 * Detects the user agent and returns an object with the current
 * `device`, the `browser` and the `renderingEngine` the user is
 * using.
 *
 * *Type*: React Hook
 *
 * @returns The user agent object
 * -----------------------------------------------------------
 */
export const useUserAgent = () => {
  const [userAgent, setUserAgent] = useState<UserAgent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== "undefined") {
      const navigator = window.navigator;

      const _userAgent = {
        device: detectDevice(navigator),
        browser: detectBrowser(navigator),
        renderingEngine: detectRenderingEngine(navigator),
      };

      setUserAgent(_userAgent);
      setIsLoading(false);
    }
  }, []);

  return { userAgent, isLoading };
};
