"use client";

// ─── Proposal — confetti ─────────────────────────────────────────────────────
// canvas-confetti is a hard dependency of the app (never a CDN script). Heart
// glyphs are rendered into a bitmap shape once and cached, so the multi-volley
// celebration costs a single text-to-canvas rasterisation.

import confetti from "canvas-confetti";

type Shape = ReturnType<typeof confetti.shapeFromText>;

/** Pastel + heart palette. Deliberately soft — no primary reds. */
export const CONFETTI_COLORS = [
  "#ff92b4",
  "#ef537d",
  "#ffc2d4",
  "#c8b6ff",
  "#ffe3ec",
  "#ffd9a5",
  "#fff6fa",
];

let cachedShapes: Shape[] | null = null;

/** Heart + sparkle emoji shapes, falling back to plain circles if unsupported. */
function shapes(): Shape[] | undefined {
  if (cachedShapes === null) {
    try {
      cachedShapes = [
        confetti.shapeFromText({ text: "💖", scalar: 2.2 }),
        confetti.shapeFromText({ text: "💗", scalar: 2 }),
        confetti.shapeFromText({ text: "✨", scalar: 1.8 }),
        "circle",
      ];
    } catch {
      cachedShapes = ["circle", "square"];
    }
  }
  return cachedShapes.length ? cachedShapes : undefined;
}

/**
 * The YES payoff: a centre cannon, two side cannons, a slow drift of big hearts
 * and one final wave. Returns a cancel function so a component that unmounts
 * mid-celebration does not leave stray timers behind.
 */
export function celebrationBurst(reduced = false): () => void {
  const timers: ReturnType<typeof setTimeout>[] = [];
  const colors = CONFETTI_COLORS;
  const shape = shapes();

  const fire = (opts: confetti.Options) =>
    void confetti({ colors, shapes: shape, disableForReducedMotion: false, ...opts });

  fire({ particleCount: reduced ? 60 : 150, spread: 100, startVelocity: 44, scalar: 1.1, origin: { y: 0.62 } });

  // A reduced-motion viewer still gets a single celebratory pop — just not four.
  if (reduced) return () => timers.forEach(clearTimeout);

  timers.push(
    setTimeout(() => {
      fire({ particleCount: 70, angle: 62, spread: 74, origin: { x: 0, y: 0.72 } });
      fire({ particleCount: 70, angle: 118, spread: 74, origin: { x: 1, y: 0.72 } });
    }, 220),
  );
  timers.push(
    setTimeout(
      () =>
        fire({
          particleCount: 44,
          spread: 130,
          startVelocity: 24,
          gravity: 0.48,
          decay: 0.94,
          scalar: 1.7,
          ticks: 280,
          origin: { y: 0.14 },
        }),
      620,
    ),
  );
  timers.push(setTimeout(() => fire({ particleCount: 95, spread: 112, startVelocity: 48, origin: { y: 0.68 } }), 1050));

  return () => timers.forEach(clearTimeout);
}

/**
 * A tiny puff of hearts at a viewport pixel coordinate — fired wherever the
 * recipient just failed to catch the "No" button.
 */
export function heartPuff(clientX: number, clientY: number): void {
  if (typeof window === "undefined") return;
  const w = window.innerWidth || 1;
  const h = window.innerHeight || 1;
  void confetti({
    particleCount: 9,
    spread: 60,
    startVelocity: 22,
    gravity: 0.7,
    decay: 0.9,
    scalar: 0.9,
    ticks: 90,
    colors: CONFETTI_COLORS,
    shapes: shapes(),
    origin: { x: Math.min(Math.max(clientX / w, 0), 1), y: Math.min(Math.max(clientY / h, 0), 1) },
  });
}
