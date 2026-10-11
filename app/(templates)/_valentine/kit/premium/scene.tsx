"use client";

// ─── Scene helpers: <Letterbox>, <SceneFade>, <SkipChip>, useScenes ──────────
//
//   const sc = useScenes(["gate", "threshold", "bloom", "letter", "reel", "finale"] as const);
//   <Letterbox show={sc.scene === "bloom"} />                  // cinematic bars for a moment
//   <SceneFade sceneKey={sc.scene}>{render(sc.scene)}</SceneFade>  // crossfade between scenes
//   <SkipChip onSkip={sc.next} />                              // after 1.5 s; on every timed scene
//
// Transforms + opacity only. Reduced motion: crossfades, no slide, bars appear instantly.

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "../useReducedMotion";

/** A tiny scene machine: scene, index, next(), go(id), back(). */
export function useScenes<T extends string>(order: readonly T[], initial?: T) {
  const [scene, setScene] = useState<T>(initial ?? order[0]);
  const index = order.indexOf(scene);
  const next = useCallback(() => setScene((s) => order[Math.min(order.length - 1, order.indexOf(s) + 1)]), [order]);
  const back = useCallback(() => setScene((s) => order[Math.max(0, order.indexOf(s) - 1)]), [order]);
  const go = useCallback((id: T) => setScene(id), []);
  return { scene, index, total: order.length, next, back, go, isLast: index === order.length - 1 };
}

/** 2.39:1-style black bars that slide in/out (fixed, above the scene, below the dock). */
export function Letterbox({ show, height = "9vh", z = 60 }: { show: boolean; height?: string; z?: number }) {
  const reduce = useReducedMotion();
  const tr = reduce ? "none" : "transform .7s cubic-bezier(.6,0,.2,1)";
  const bar = (top: boolean): CSSProperties => ({
    position: "fixed", left: 0, right: 0, height, background: "#000", zIndex: z, pointerEvents: "none",
    [top ? "top" : "bottom"]: 0, transform: show ? "none" : `translateY(${top ? "-100%" : "100%"})`, transition: tr,
  });
  return (
    <>
      <span aria-hidden style={bar(true)} />
      <span aria-hidden style={bar(false)} />
    </>
  );
}

/** Crossfade (and a small rise) between scenes keyed by `sceneKey`. */
export function SceneFade({ sceneKey, children, duration = 0.6, style, className }: { sceneKey: string; children: ReactNode; duration?: number; style?: CSSProperties; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={sceneKey}
        className={className}
        style={style}
        initial={{ opacity: 0, y: reduce ? 0 : 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: reduce ? 0 : -12 }}
        transition={{ duration: reduce ? 0.25 : duration, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/** "Skip ▸" — appears after `delay` ms (default 1500). Every timed/game scene needs one. */
export function SkipChip({ onSkip, label = "Skip ▸", delay = 1500, style }: { onSkip: () => void; label?: string; delay?: number; style?: CSSProperties }) {
  const [shown, setShown] = useState(delay <= 0);
  useEffect(() => {
    if (delay <= 0) return;
    const t = window.setTimeout(() => setShown(true), delay);
    return () => window.clearTimeout(t);
  }, [delay]);
  if (!shown) return null;
  return (
    <button
      type="button"
      onClick={onSkip}
      style={{
        position: "fixed", right: "max(12px, env(safe-area-inset-right, 0px))", top: "calc(64px + env(safe-area-inset-top, 0px))", zIndex: 97,
        minHeight: 44, padding: "0 16px", borderRadius: 99, border: "1px solid var(--vw-edge, rgba(0,0,0,.12))", cursor: "pointer",
        background: "var(--vw-glass, rgba(255,255,255,.7))", color: "var(--vw-ink, #333)", font: "700 13px/1 var(--vw-font-ui, system-ui), sans-serif",
        backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", ...style,
      }}
    >
      {label}
    </button>
  );
}
