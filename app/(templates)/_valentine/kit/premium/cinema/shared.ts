"use client";

// ─── Cinema kit internals: easing, colour, visibility, one shared tilt source ─
//
// Nothing here touches `window` at module scope — every listener is attached
// lazily by the first subscriber and removed by the last, so a page that never
// mounts a tilting thing never pays for one.

import { useEffect, useState, type RefObject } from "react";

/** The house curve: fast out, long silky settle. Use it for almost everything. */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
/** For things that leave: slow start, decisive exit. */
export const EASE_IN_OUT: [number, number, number, number] = [0.65, 0, 0.35, 1];
export const EASE_CSS = "cubic-bezier(.22,1,.36,1)";

export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

/** "#ff8fab" / "#f8a" → [r,g,b] in 0–1. Bad input → mid grey, never throws. */
export function hexToRgb01(hex: string): [number, number, number] {
  let h = (hex || "").trim().replace(/^#/, "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h.slice(0, 6), 16);
  if (Number.isNaN(n) || h.length < 6) return [0.5, 0.5, 0.5];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** "#ff8fab", 0.4 → "rgba(255,143,171,0.4)". */
export function hexA(hex: string, a: number): string {
  const [r, g, b] = hexToRgb01(hex);
  return `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)},${a})`;
}

/** True while the element is on screen AND the tab is visible. Drives every rAF loop. */
export function useActive(ref: RefObject<Element | null>, rootMargin = "120px"): boolean {
  const [onScreen, setOnScreen] = useState(true);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { rootMargin });
    io.observe(el);
    const onVis = () => setVisible(!document.hidden);
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [ref, rootMargin]);
  return onScreen && visible;
}

// ── One tilt source for the whole page (pointer on desktop, gyro on phones) ──

export interface TiltSample {
  /** -1 … 1, left → right. */
  x: number;
  /** -1 … 1, top → bottom. */
  y: number;
  /** Where the last sample came from. */
  source: "none" | "pointer" | "gyro";
}

type Listener = (s: TiltSample) => void;
const listeners = new Set<Listener>();
let sample: TiltSample = { x: 0, y: 0, source: "none" };
let base: { b: number; g: number } | null = null;
let detach: (() => void) | null = null;

function emit(next: TiltSample) {
  sample = next;
  listeners.forEach((l) => l(next));
}

function attach() {
  const onPointer = (e: PointerEvent) => {
    // Touch drags are scrolls, not looks — and once a gyro is live it wins.
    if (e.pointerType !== "mouse" || sample.source === "gyro") return;
    emit({ x: (e.clientX / window.innerWidth) * 2 - 1, y: (e.clientY / window.innerHeight) * 2 - 1, source: "pointer" });
  };
  const onOrient = (e: DeviceOrientationEvent) => {
    if (e.beta == null || e.gamma == null) return;
    // Relative to how the phone was held when the first reading arrived, so a
    // reader lying in bed isn't permanently tilted to one corner.
    if (!base) base = { b: e.beta, g: e.gamma };
    base.b += (e.beta - base.b) * 0.004; // a slow re-centre over ~10 s
    base.g += (e.gamma - base.g) * 0.004;
    emit({ x: clamp((e.gamma - base.g) / 25, -1, 1), y: clamp((e.beta - base.b) / 25, -1, 1), source: "gyro" });
  };
  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("deviceorientation", onOrient, { passive: true });
  return () => {
    window.removeEventListener("pointermove", onPointer);
    window.removeEventListener("deviceorientation", onOrient);
  };
}

/** Subscribe to the shared tilt source. Returns the unsubscribe. */
export function subscribeTilt(l: Listener): () => void {
  listeners.add(l);
  if (!detach && typeof window !== "undefined") detach = attach();
  l(sample);
  return () => {
    listeners.delete(l);
    if (!listeners.size && detach) {
      detach();
      detach = null;
      base = null;
    }
  };
}

/**
 * iOS 13+ hides DeviceOrientation behind a permission prompt that may ONLY be
 * shown from inside a user gesture. Call this in your gate/start button's
 * onClick (it is a no-op that resolves `true` everywhere else).
 *
 *   <button onClick={() => { void requestTiltPermission(); start(); }}>Open</button>
 */
export async function requestTiltPermission(): Promise<boolean> {
  try {
    if (typeof window === "undefined" || typeof DeviceOrientationEvent === "undefined") return false;
    const D = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<"granted" | "denied"> };
    if (typeof D.requestPermission !== "function") return true;
    return (await D.requestPermission()) === "granted";
  } catch {
    return false;
  }
}
