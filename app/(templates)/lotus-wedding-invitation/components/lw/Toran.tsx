"use client";

// ─── The toran: a gold mango-leaf band with real marigold strings ────────────
// The band is the kit's toran-strip in foil; the strings are narrow crops of the
// marigold-garland photo (one strand each, a background-position into the same
// cached image), alternating long and short, fading out at the tip. The whole
// toran sways as one layer (rotate, transform only).

import { useMemo } from "react";
import { art, art2x, seeded } from "./art";

// Strand centres in the photo, at the 0.8 scale the strands are drawn at.
const CENTRES = [104, 156, 202, 276, 306];
const STRAND_W = 14;

export default function Toran({ count = 15, seed = 5, className = "" }: { count?: number; seed?: number; className?: string }) {
  const strands = useMemo(() => {
    const r = seeded(seed);
    return Array.from({ length: count }, (_, i) => {
      const c = CENTRES[Math.floor(r() * CENTRES.length)];
      const long = i % 2 === 0;
      return {
        left: ((i + 0.5) / count) * 100,
        h: Math.round((long ? 92 : 54) + r() * 26),
        x: -(c - STRAND_W / 2),
        y: -Math.round(r() * 300),
      };
    });
  }, [count, seed]);
  const photo = "scene/marigold-garland-strings-photo-01" as const;
  const bg = `image-set(url("${art(photo).src}") 1x, url("${art2x(photo)}") 2x)`;
  return (
    <div className={`lw-toran ${className}`} aria-hidden>
      <div className="lw-toran-strands">
        {strands.map((s, i) => (
          <span key={i} className="lw-strand" style={{ left: `${s.left}%`, height: s.h, backgroundImage: bg, backgroundPosition: `${s.x}px ${s.y}px` }} />
        ))}
      </div>
      <div className="lw-toran-band" />
    </div>
  );
}
