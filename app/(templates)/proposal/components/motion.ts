"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Tracks `prefers-reduced-motion`. Read through useSyncExternalStore rather than
 * an effect + setState, so there is no cascading render on mount and the server
 * snapshot is explicit.
 *
 * Note what this does NOT gate: the dodging "No" button. Its movement is the
 * whole mechanic, so it survives reduced motion — only the pulsing, bobbing and
 * drifting decoration is dropped.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Clamp helper used by every bit of absolute positioning in the template. */
export function clamp(value: number, min: number, max: number): number {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}
