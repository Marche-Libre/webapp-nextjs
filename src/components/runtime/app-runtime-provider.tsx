"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

const OFFLINE_BANNER_MESSAGE = "Vous êtes hors ligne. Connectez-vous à Internet pour utiliser l'application.";
export const OFFLINE_CHAT_MESSAGE = "Vous êtes hors ligne. Merci de vous connecter à Internet pour utiliser le chat.";
export const APP_RUNTIME_VERSION = "0.1.3";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type InstallStrategy =
  | "installed"
  | "native-prompt"
  | "ios-safari-manual"
  | "ios-browser-manual"
  | "desktop-safari-manual"
  | "browser-menu-manual";

type NetworkStatusContextValue = {
  isOnline: boolean;
  isStandalone: boolean;
  installPromptAvailable: boolean;
  installStrategy: InstallStrategy;
  updateAvailable: boolean;
  installApp: () => Promise<void>;
  applyUpdate: () => void;
};

const NetworkStatusContext = createContext<NetworkStatusContextValue>({
  isOnline: true,
  isStandalone: false,
  installPromptAvailable: false,
  installStrategy: "browser-menu-manual",
  updateAvailable: false,
  installApp: async () => undefined,
  applyUpdate: () => undefined,
});

function getInitialOnlineStatus() {
  if (typeof window === "undefined") return true;
  return navigator.onLine;
}

function getInitialStandaloneStatus() {
  if (typeof window === "undefined") return false;

  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || navigatorWithStandalone.standalone === true;
}

function isIosDevice() {
  if (typeof window === "undefined") return false;

  const navigatorWithTouchPoints = navigator as Navigator & { maxTouchPoints?: number };
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && (navigatorWithTouchPoints.maxTouchPoints ?? 0) > 1)
  );
}

function isSafariBrowser() {
  if (typeof window === "undefined") return false;
  return /Safari/.test(navigator.userAgent) && !/Chrome|Chromium|CriOS|FxiOS|Edg|EdgiOS|OPiOS/.test(navigator.userAgent);
}

function getInstallStrategy(isStandalone: boolean, installPromptAvailable: boolean): InstallStrategy {
  if (isStandalone) return "installed";
  if (installPromptAvailable) return "native-prompt";
  if (isIosDevice()) return isSafariBrowser() ? "ios-safari-manual" : "ios-browser-manual";
  if (isSafariBrowser()) return "desktop-safari-manual";
  return "browser-menu-manual";
}

function canRegisterServiceWorker() {
  if (typeof window === "undefined") return false;
  if (!("serviceWorker" in navigator)) return false;
  return process.env.NODE_ENV === "production";
}

function watchRegistrationForUpdates(
  registration: ServiceWorkerRegistration,
  onUpdateAvailable: (worker: ServiceWorker) => void,
) {
  if (registration.waiting) {
    onUpdateAvailable(registration.waiting);
  }

  registration.addEventListener("updatefound", () => {
    const installingWorker = registration.installing;
    if (!installingWorker) return;

    installingWorker.addEventListener("statechange", () => {
      if (installingWorker.state !== "installed") return;
      if (!navigator.serviceWorker.controller) return;
      onUpdateAvailable(installingWorker);
    });
  });
}

function scheduleServiceWorkerRegistration(onUpdateAvailable: (worker: ServiceWorker) => void) {
  const register = async () => {
    const registration = await navigator.serviceWorker.register("/sw.js");
    watchRegistrationForUpdates(registration, onUpdateAvailable);
  };

  if (document.readyState === "complete") {
    void register().catch(() => undefined);
    return;
  }

  window.addEventListener("load", () => {
    void register().catch(() => undefined);
  }, { once: true });
}

function OfflineBanner({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 py-3">
      <p className="w-full max-w-3xl rounded-lg border border-warning-300 bg-warning-50 px-4 py-3 text-center text-sm font-medium text-warning-700 shadow-modal">
        {OFFLINE_BANNER_MESSAGE}
      </p>
    </div>
  );
}

export function useNetworkStatus() {
  return useContext(NetworkStatusContext);
}

export function AppRuntimeProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(getInitialOnlineStatus);
  const [isStandalone, setIsStandalone] = useState(getInitialStandaloneStatus);
  const [installPromptAvailable, setInstallPromptAvailable] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const installPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const waitingWorkerRef = useRef<ServiceWorker | null>(null);
  const reloadAfterUpdateRef = useRef(false);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
  }, []);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
  }, []);

  const handleStandaloneChange = useCallback((event: MediaQueryListEvent) => {
    setIsStandalone(event.matches);
  }, []);

  const handleBeforeInstallPrompt = useCallback((event: Event) => {
    event.preventDefault();
    installPromptRef.current = event as BeforeInstallPromptEvent;
    setInstallPromptAvailable(true);
  }, []);

  const handleAppInstalled = useCallback(() => {
    installPromptRef.current = null;
    setInstallPromptAvailable(false);
    setIsStandalone(true);
  }, []);

  const handleServiceWorkerUpdate = useCallback((worker: ServiceWorker) => {
    waitingWorkerRef.current = worker;
    setUpdateAvailable(true);
  }, []);

  const installApp = useCallback(async () => {
    const prompt = installPromptRef.current;
    if (!prompt) return;

    await prompt.prompt();
    await prompt.userChoice.catch(() => undefined);
    installPromptRef.current = null;
    setInstallPromptAvailable(false);
  }, []);

  const applyUpdate = useCallback(() => {
    const waitingWorker = waitingWorkerRef.current;
    if (!waitingWorker) return;

    reloadAfterUpdateRef.current = true;
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
  }, []);

  useEffect(() => {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [handleOffline, handleOnline]);

  useEffect(() => {
    const standaloneQuery = window.matchMedia("(display-mode: standalone)");
    standaloneQuery.addEventListener("change", handleStandaloneChange);

    return () => {
      standaloneQuery.removeEventListener("change", handleStandaloneChange);
    };
  }, [handleStandaloneChange]);

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [handleAppInstalled, handleBeforeInstallPrompt]);

  useEffect(() => {
    const handleControllerChange = () => {
      if (!reloadAfterUpdateRef.current) return;
      window.location.reload();
    };

    navigator.serviceWorker?.addEventListener("controllerchange", handleControllerChange);

    return () => {
      navigator.serviceWorker?.removeEventListener("controllerchange", handleControllerChange);
    };
  }, []);

  const serviceWorkerRegistrationEffect = useCallback(() => {
    if (!canRegisterServiceWorker()) return;
    scheduleServiceWorkerRegistration(handleServiceWorkerUpdate);
  }, [handleServiceWorkerUpdate]);

  useEffect(serviceWorkerRegistrationEffect, [serviceWorkerRegistrationEffect]);

  const installStrategy = useMemo(() => {
    return getInstallStrategy(isStandalone, installPromptAvailable);
  }, [installPromptAvailable, isStandalone]);

  const contextValue = useMemo<NetworkStatusContextValue>(() => {
    return {
      isOnline,
      isStandalone,
      installPromptAvailable,
      installStrategy,
      updateAvailable,
      installApp,
      applyUpdate,
    };
  }, [applyUpdate, installApp, installPromptAvailable, installStrategy, isOnline, isStandalone, updateAvailable]);

  return (
    <NetworkStatusContext.Provider value={contextValue}>
      {children}
      <OfflineBanner visible={!isOnline} />
    </NetworkStatusContext.Provider>
  );
}
