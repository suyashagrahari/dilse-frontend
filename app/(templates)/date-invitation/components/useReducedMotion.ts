"use client";

// LEAD-OWNED. One implementation, imported everywhere.
//
// `prefers-reduced-motion` must be honoured and the template must remain fully
// completable with all motion off: reduced motion removes DECORATION, never
// FUNCTIONALITY. If a handler fires "when the animation ends", it must still
// fire — immediately — when there is no animation.
//
// `useSyncExternalStore` rather than useState + useEffect. The media query IS an
// external store, and reading it in an effect body means one wasted render on
// every mount plus a `react-hooks/set-state-in-effect` violation. This form also
// gives a correct server snapshot for free: SSR renders `false` (motion allowed,
// the safe default for markup), and the client reads the real value during the
// very first commit rather than a frame later.

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

const NOOP = () => () => {};

function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return NOOP();
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(QUERY).matches;
}

/** Motion is allowed until the client tells us otherwise. */
const getServerSnapshot = (): boolean => false;

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default useReducedMotion;
