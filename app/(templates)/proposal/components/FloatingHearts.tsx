"use client";

// ─── Proposal — ambient background ───────────────────────────────────────────
// Hearts drifting upward + slow glowing orbs. Entirely CSS: no per-frame React
// state, no rAF loop, and every animated property is `transform` (or a static
// opacity), so the whole thing stays on the compositor.
//
// The layout values are derived from a deterministic hash of the index rather
// than Math.random(), so the server-rendered markup and the hydrated markup are
// byte-identical.

import { memo } from "react";

const GLYPHS = ["💗", "💕", "🤍", "✨", "💞", "💖", "🌸", "💫"];

/** Deterministic pseudo-random in [0,1) — same on the server and the client. */
function seeded(n: number): number {
  const x = Math.sin(n * 12.9898 + 4.1414) * 43758.5453;
  return x - Math.floor(x);
}

const HEARTS = Array.from({ length: 16 }, (_, i) => ({
  left: 2 + seeded(i + 1) * 94,
  size: 11 + Math.round(seeded(i + 17) * 17),
  rise: 15 + Math.round(seeded(i + 33) * 13),
  sway: 3 + seeded(i + 49) * 3.5,
  delay: -Math.round(seeded(i + 65) * 26),
  opacity: 0.26 + seeded(i + 81) * 0.42,
  glyph: GLYPHS[i % GLYPHS.length],
}));

const ORBS = [
  { size: 300, left: -12, top: 4, from: "rgba(255,168,198,.5)", dur: 26 },
  { size: 240, left: 62, top: 22, from: "rgba(200,182,255,.46)", dur: 33 },
  { size: 340, left: 18, top: 66, from: "rgba(255,214,228,.44)", dur: 29 },
  { size: 190, left: 78, top: 78, from: "rgba(214,240,255,.4)", dur: 37 },
];

function FloatingHeartsBase() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
        // Fade the hearts out at the very top and bottom so they never appear to
        // pop into or out of existence at a hard edge.
        maskImage: "linear-gradient(to bottom, transparent 0%, #000 14%, #000 84%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 14%, #000 84%, transparent 100%)",
      }}
    >
      {ORBS.map((o, i) => (
        <span
          key={`orb-${i}`}
          className="ps-orb"
          style={{
            left: `${o.left}%`,
            top: `${o.top}%`,
            width: o.size,
            height: o.size,
            background: `radial-gradient(circle at 34% 30%, ${o.from} 0%, rgba(255,255,255,0) 70%)`,
            animationDuration: `${o.dur}s`,
            animationDelay: `${-i * 5}s`,
          }}
        />
      ))}

      {HEARTS.map((h, i) => (
        <span
          key={`heart-${i}`}
          className="ps-h-out"
          style={{
            left: `${h.left}%`,
            opacity: h.opacity,
            animationDuration: `${h.rise}s`,
            animationDelay: `${h.delay}s`,
          }}
        >
          <span
            className="ps-h-in"
            style={{ fontSize: h.size, animationDuration: `${h.sway}s`, animationDelay: `${h.delay}s` }}
          >
            {h.glyph}
          </span>
        </span>
      ))}
    </div>
  );
}

/** Static across every re-render — memo keeps 20 nodes out of React's diff. */
const FloatingHearts = memo(FloatingHeartsBase);
export default FloatingHearts;
