"use client";
// ─── <PetalBurst> — a one-shot shower of petals / foil confetti ──────────────
//
//   {done && <PetalBurst kind={["rose-petal", "gold-confetti"]} />}
//
// Pure CSS keyframes on ≤ 28 absolutely-positioned images (transform/opacity
// only). Renders nothing with reduced motion. Positions are seeded, so the
// render is pure and identical across re-renders.

import { useMemo } from "react";
import { particleUrl, type ParticleId } from "../ornaments";
import { useWeddingReducedMotion } from "../WeddingRoot";

export interface PetalBurstProps {
  kind?: ParticleId | ParticleId[];
  count?: number;
  /** "fall" from the top of the container (default) or "burst" out of its centre. */
  mode?: "fall" | "burst";
  seed?: number;
}

const rand = (seed: number) => {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
};

export default function PetalBurst({ kind = ["rose-petal", "gold-confetti", "gold-confetti-round"], count = 22, mode = "fall", seed = 7 }: PetalBurstProps) {
  const reduce = useWeddingReducedMotion();
  const kinds = Array.isArray(kind) ? kind : [kind];
  const bits = useMemo(() => {
    const r = rand(seed);
    return Array.from({ length: Math.min(28, count) }, (_, i) => ({
      src: particleUrl(kinds[i % kinds.length]),
      x: r() * 100,
      dx: (r() - 0.5) * 160,
      dy: 60 + r() * 260,
      rot: (r() - 0.5) * 720,
      size: 14 + r() * 18,
      delay: r() * 0.45,
      dur: 1.6 + r() * 1.3,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- kinds is derived from `kind`
  }, [count, seed, String(kinds)]);
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
