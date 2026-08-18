"use client";

import { useSyncExternalStore } from "react";

// Two subscriptions, no effects, no setState-in-effect. Both of these are
// external stores in the literal sense — the media query and the existence of
// a document — so `useSyncExternalStore` is the correct tool and the React 19
// lint rules agree.

const noopSubscribe = () => () => {};

/** False during SSR and the hydration pass, true afterwards. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

const REDUCED = "(prefers-reduced-motion: reduce)";

function subscribeReduced(onChange: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * Honoured everywhere: no staggered entrances, no page slide, instant accordion
 * expand. Everything still functions — only the motion is removed.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReduced,
    () => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(REDUCED).matches : false),
    () => false,
  );
}

// There is deliberately no `useIsDesktop` here. The knowledge panel is FIRST in
// the DOM so it sits above the results on a phone, and the desktop layout flips
// it to the right column with `flex-direction: row-reverse`. Source order is
// the accessibility order and the screenshot order; CSS does the rest, and no
// JS media query means no hydration flash on the most important element.
