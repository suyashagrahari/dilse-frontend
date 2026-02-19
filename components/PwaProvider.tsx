"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Platform = "ios" | "android" | "other";

interface PwaCtx {
  isStandalone: boolean;
  platform: Platform;
  triggerInstall: () => Promise<"accepted" | "dismissed" | "unsupported">;
}

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  return "other";
}

const PwaContext = createContext<PwaCtx>({
  isStandalone: false,
  platform: "other",
  triggerInstall: async () => "unsupported",
});

export const usePwa = () => useContext(PwaContext);

export default function PwaProvider({ children }: { children: ReactNode }) {
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [platform, setPlatform] = useState<Platform>("other");

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    setPlatform(detectPlatform());
    setIsStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true
    );

    const handler = (e: Event) => {
      e.preventDefault();
      deferredRef.current = e as BeforeInstallPromptEvent;
    };
    window.addEventListener("beforeinstallprompt", handler);

    const installed = () => {
      setIsStandalone(true);
      deferredRef.current = null;
    };
    window.addEventListener("appinstalled", installed);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  const triggerInstall = useCallback(async (): Promise<"accepted" | "dismissed" | "unsupported"> => {
    if (deferredRef.current) {
      try {
        await deferredRef.current.prompt();
        const { outcome } = await deferredRef.current.userChoice;
        if (outcome === "accepted") deferredRef.current = null;
        return outcome;
      } catch {
        return "unsupported";
      }
    }
    return "unsupported";
  }, []);

  return (
    <PwaContext.Provider value={{ isStandalone, platform, triggerInstall }}>
      {children}
    </PwaContext.Provider>
  );
}
