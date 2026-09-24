"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    __loadTemplateFonts?: () => void;
  }
}

/**
 * Loads the template font stylesheet (Cormorant, DM Sans, Noto Devanagari,
 * Noto Nastaliq, Amiri) on client-side navigation away from the landing page.
 *
 * The inline script in app/layout.tsx loads it on the first document load of
 * every page EXCEPT the landing, which uses none of those families and paid a
 * full-page relayout for them. That leaves one gap: land on "/", then click
 * into a template — no new document, so the inline script never runs again.
 * This closes it. The loader is idempotent, so calling it on every navigation
 * is harmless.
 */
export default function TemplateFontsLoader() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname !== "/") window.__loadTemplateFonts?.();
  }, [pathname]);
  return null;
}
