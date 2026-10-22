"use client";

// ─── Cherry-blossom petals, drawn in CSS (no images, no network) ─────────────
// "drift": petals fall slowly across a layer, swaying, forever (paused while
//          the layer is off screen via .is-idle on an ancestor; none at all
//          under reduced motion).
// "burst": one shower thrown out from the centre (the gate opening, the RSVP).
// Each petal is one <i> moved by transform/opacity only.

import { useMemo } from "react";
import { useWeddingReducedMotion } from "../../../_wedding";
import { seeded } from "./art";

const TINTS = ["#f7c6d3", "#f4b3c5", "#fbd9e2", "#f9cfd9", "#efa9bd", "#fde4ea"];

export default function Petals({ mode = "drift", count = 14, seed = 7, className = "" }: { mode?: "drift" | "burst"; count?: number; seed?: number; className?: string }) {
  const reduce = useWeddingReducedMotion();
  const petals = useMemo(() => {
    const r = seeded(seed);
    return Array.from({ length: count }, (_, i) => {
      const a = r() * Math.PI * 2;
      const dist = 140 + r() * 260;
      return {
        left: 2 + r() * 96,
        size: 9 + r() * 9,
        delay: mode === "burst" ? r() * 0.25 : -r() * 16,
        dur: mode === "burst" ? 1.6 + r() * 0.9 : 11 + r() * 9,
        sway: 30 + r() * 70,
        spin: (r() > 0.5 ? 1 : -1) * (180 + r() * 360),
        tx: Math.cos(a) * dist,
        ty: Math.sin(a) * dist * 0.7 + 120,
        tint: TINTS[i % TINTS.length],
      };
    });
  }, [count, seed, mode]);
  if (reduce) return null;
  return (
    <div className={`gw-petals is-${mode} ${className}`} aria-hidden>
      {petals.map((p, i) => (
        <i
          key={i}
          style={{
            left: mode === "burst" ? "50%" : `${p.left}%`,
            width: p.size,
            height: p.size * 0.78,
            background: `radial-gradient(circle at 30% 30%, #fff6f8, ${p.tint} 62%)`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
            ["--sway" as string]: `${p.sway}px`,
            ["--spin" as string]: `${p.spin}deg`,
            ["--tx" as string]: `${p.tx}px`,
            ["--ty" as string]: `${p.ty}px`,
          }}
        />
      ))}
    </div>
  );
}
