"use client";

// ─── A one-shot shower of petals (the kit's PetalBurst, on in-repo art) ──────
// Same markup and keyframes as the kit's <PetalBurst> (.wk-burst / .wk-burst-bit),
// but the particles come from public/wedding-v3/palace-door/kit instead of the
// CDN. Seeded, so every render is identical. Nothing with reduced motion.

import { useMemo } from "react";
import { useWeddingReducedMotion } from "../../../_wedding";
import { PD_KIT, seeded, type PdPetal } from "../assets";

export interface PetalsProps {
  kind: PdPetal[];
  count?: number;
  /** "fall" from the top of the container or "burst" out of its centre. */
  mode?: "fall" | "burst";
  seed?: number;
}

export default function Petals({ kind, count = 22, mode = "fall", seed = 7 }: PetalsProps) {
  const reduce = useWeddingReducedMotion();
  const key = kind.join(",");
  const bits = useMemo(() => {
    const r = seeded(seed);
    const kinds = key.split(",") as PdPetal[];
    return Array.from({ length: Math.min(28, count) }, (_, i) => ({
      src: PD_KIT.petals[kinds[i % kinds.length]],
      x: r() * 100,
      dx: (r() - 0.5) * 160,
      dy: 60 + r() * 260,
      rot: (r() - 0.5) * 720,
      size: 14 + r() * 18,
      delay: r() * 0.45,
      dur: 1.6 + r() * 1.3,
    }));
  }, [count, seed, key]);
  if (reduce) return null;
  return (
    <div className={`wk-burst wk-burst-${mode}`} aria-hidden>
      {bits.map((b, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={b.src}
          alt=""
          className="wk-burst-bit"
          style={{
            left: mode === "fall" ? `${b.x}%` : "50%",
            width: b.size,
            height: b.size,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.dur}s`,
            ["--dx" as string]: `${b.dx}px`,
            ["--dy" as string]: `${b.dy}px`,
            ["--rot" as string]: `${b.rot}deg`,
          }}
        />
      ))}
    </div>
  );
}
