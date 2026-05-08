import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface PwaInstallContextValue {
  canPromptInstall: boolean;
  isIos: boolean;
  isDismissed: boolean;
  promptInstall: () => Promise<boolean>;
  dismissPrompt: () => void;
  resetPromptDismissal: () => void;
}

const STORAGE_KEY = "easycredit:pwa-install-dismissed";

const PwaInstallContext = createContext<PwaInstallContextValue | undefined>(undefined);

export function PwaInstallProvider({ children }: { children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === "true"
  );

  const isIos =
    /iphone|ipad|ipod/i.test(window.navigator.userAgent) &&
    !(window.navigator as Navigator & { standalone?: boolean }).standalone;

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setDeferredPrompt(null);
      localStorage.removeItem(STORAGE_KEY);
      setIsDismissed(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  async function promptInstall() {
    if (!deferredPrompt) {
      return false;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setDeferredPrompt(null);
      return true;
    }

    return false;
  }

  function dismissPrompt() {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsDismissed(true);
  }

  function resetPromptDismissal() {
    localStorage.removeItem(STORAGE_KEY);
    setIsDismissed(false);
  }

  const value = useMemo<PwaInstallContextValue>(
    () => ({
      canPromptInstall: Boolean(deferredPrompt),
      isIos,
      isDismissed,
      promptInstall,
      dismissPrompt,
      resetPromptDismissal,
    }),
    [deferredPrompt, isDismissed, isIos]
  );

  return <PwaInstallContext.Provider value={value}>{children}</PwaInstallContext.Provider>;
}

export function usePwaInstall() {
  const context = useContext(PwaInstallContext);
  if (!context) {
    throw new Error("usePwaInstall must be used within a PwaInstallProvider");
  }

  return context;
}
