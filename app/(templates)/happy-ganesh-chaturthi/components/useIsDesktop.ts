"use client";

import { useSyncExternalStore } from "react";

/** Matches the 1024px breakpoint in `ganesh.css`. Change one, change the other. */
const DESKTOP = "(min-width: 1024px)";

// Module scope so the identities are stable — a `subscribe` recreated per render
// makes useSyncExternalStore tear down and re-add the listener every time.
const subscribe = (onChange: () => void) => {
  const mq = window.matchMedia(DESKTOP);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};
const getSnapshot = () => window.matchMedia(DESKTOP).matches;
const getServerSnapshot = () => false;

/**
 * True once the viewport is at the docked-rail breakpoint.
 *
 * ── ONLY THE BUILDER NEEDS THIS ─────────────────────────────────────────────
 *
 * The page itself is laid out entirely in CSS — see the breakpoint table at the
 * top of `ganesh.css` — so nothing on it reads this. The builder does, because
 * the sheet and the rail animate in from different edges and framer-motion needs
 * the direction as a value, not as a class.
 *
 * `useSyncExternalStore` rather than `useState` + an effect, because the viewport
 * is exactly what it is for: state that lives outside React and that the server
 * cannot know. It reads `false` during the server render and the hydration pass,
 * then swaps to the real value — the one arrangement React does not treat as a
 * hydration mismatch. Reading `matchMedia` in the render body would produce two
 * different trees and throw the server HTML away; setting state in an effect gets
 * the same answer but trips `react-hooks/set-state-in-effect`.
 */
export function useIsDesktop(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
