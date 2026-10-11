"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(cb: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia(QUERY);
  mq.addEventListener?.("change", cb);
  return () => mq.removeEventListener?.("change", cb);
}

const snapshot = () => (typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(QUERY).matches);

/**
 * `true` when the visitor asked the OS for less motion. SSR-safe (false on the
 * server), live-updating. Every kit animation consults it; day Experiences
 * should too — swap motion for an instant state change, never remove content.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}

/** Non-hook read for event handlers and imperative code. */
export const prefersReducedMotion = snapshot;
