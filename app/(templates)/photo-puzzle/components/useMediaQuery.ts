"use client";

// A media query as an external store, so the value is correct on the very
// first client render instead of arriving one setState later. (Same helper the
// catch template uses — copied rather than imported so template directories
// stay independent.)

import { useCallback, useSyncExternalStore } from "react";

const NOOP = () => () => {};

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === "undefined" || !window.matchMedia) return NOOP();
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query],
  );

  const get = useCallback(
    () => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(query).matches : false),
    [query],
  );

  return useSyncExternalStore(subscribe, get, () => false);
}

/** True when the visitor has asked for less motion. Decoration off, mechanic on. */
export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");

/** ≥1024px — the letter panel moves to a column on the right. */
export const useWideScreen = () => useMediaQuery("(min-width: 1024px)");
