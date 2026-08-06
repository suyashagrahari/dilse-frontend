"use client";

import { useEffect, useState } from "react";

/**
 * Tracks `prefers-reduced-motion: reduce`, live.
 *
 * Reduced motion in this template removes DECORATION only — Ken Burns drift,
 * scale transitions, particles, the credits crawl. It never removes
 * functionality: the choice timer still counts down, every screen is still
 * reachable, and the episode is completable start to finish with all motion
 * off. Anything that gates progress behind an animation is a bug.
 *
 * Starts `false` on the server so the first client paint matches the markup;
 * the effect corrects it before anything animates.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    if (mq.addEventListener) {
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
    mq.addListener(apply);
    return () => mq.removeListener(apply);
  }, []);

  return reduced;
}
