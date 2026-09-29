"use client";

import { useSyncExternalStore } from "react";

export type Viewport = "phone" | "tablet" | "desktop";

/** Phone gets the mobile app; tablet and up get the web app. */
export const PHONE_MAX = 739;
export const TABLET_MAX = 1099;

const read = (): Viewport => {
  const w = window.innerWidth;
  return w <= PHONE_MAX ? "phone" : w <= TABLET_MAX ? "tablet" : "desktop";
};

const subscribe = (cb: () => void) => {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
};

export function useViewport(): Viewport {
  return useSyncExternalStore(subscribe, read, () => "desktop");
}

const hoverQuery = "(hover: hover) and (pointer: fine)";
const subHover = (cb: () => void) => {
  const mq = window.matchMedia(hoverQuery);
  mq.addEventListener?.("change", cb);
  return () => mq.removeEventListener?.("change", cb);
};

/** True on a mouse — hover previews only make sense there. */
export function useCanHover(): boolean {
  return useSyncExternalStore(subHover, () => window.matchMedia(hoverQuery).matches, () => false);
}
