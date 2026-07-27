"use client";

import { useMemo } from "react";

const EMOJIS = ["🤍", "💗", "✨", "💌", "💞", "🌸"];

// A one-shot celebratory burst of hearts/sparkles from a point (vw/vh). Pure
// transform+opacity so it composites on the GPU; auto-hidden under reduced motion.
// Render it conditionally and unmount it after ~2s.
export default function Confetti({
  originX = 50,
  originY = 46,
  count = 32,
}: {
  originX?: number;
  originY?: number;
  count?: number;
}) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const dist = 120 + Math.random() * 280;
        return {
          id: i,
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist + 140, // gravity bias
          rot: Math.random() * 720 - 360,
          dur: 0.9 + Math.random() * 1,
          emoji: EMOJIS[i % EMOJIS.length],
          size: 14 + Math.random() * 16,
        };
      }),
    [count],
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[70]">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="mu-confetti-piece"
          style={
            {
              "--x": `${originX}vw`,
              "--y": `${originY}vh`,
              "--dx": `${p.dx}px`,
              "--dy": `${p.dy}px`,
              "--rot": `${p.rot}deg`,
              "--dur": `${p.dur}s`,
              fontSize: p.size,
            } as React.CSSProperties
          }
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
