"use client";

// A media query as an external store, so the value is correct on the very
// first client render instead of arriving one setState later.

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
