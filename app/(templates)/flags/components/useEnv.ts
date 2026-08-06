"use client";

import { useEffect, useState } from "react";

/**
 * `prefers-reduced-motion`.
 *
 * Note what this must NOT do: it must not disable the swipe. The gesture is the
 * mechanic — without it the template is a slideshow. Reduced motion removes the
 * card rotation and replaces the 3D flip with a cross-fade, and nothing else.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}

/** True on a mouse/trackpad, where the keyboard fallback is worth advertising. */
export function useFinePointer(): boolean {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const sync = () => setFine(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return fine;
}

/**
 * Live size of an element.
 *
 * The gesture maths is in card-relative units, so rotating the device mid-deck
 * has to re-measure rather than restart — the drag offsets are kept in state
 * and only the divisor changes.
 */
export function useElementSize<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
): { width: number; height: number } {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setSize((prev) =>
        Math.abs(prev.width - r.width) < 0.5 && Math.abs(prev.height - r.height) < 0.5
          ? prev
          : { width: r.width, height: r.height },
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("orientationchange", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", measure);
    };
  }, [ref]);
  return size;
}

/**
 * `overscroll-behavior: none` on the document.
 *
 * Without this, Android Chrome fires pull-to-refresh on every upward swipe and
 * the "it's complicated" direction becomes unusable. Restored on unmount so the
 * rest of the app is unaffected.
 */
export function useNoOverscroll(): void {
  useEffect(() => {
    const body = document.body;
    const root = document.documentElement;
    const prevBody = body.style.overscrollBehavior;
    const prevRoot = root.style.overscrollBehavior;
    body.style.overscrollBehavior = "none";
    root.style.overscrollBehavior = "none";
    return () => {
      body.style.overscrollBehavior = prevBody;
      root.style.overscrollBehavior = prevRoot;
    };
  }, []);
}
