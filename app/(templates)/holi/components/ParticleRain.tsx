"use client";

import { memo, useMemo } from "react";

const COLORS = [
  "var(--holi-pink)",
  "var(--holi-purple)",
  "var(--holi-orange)",
  "var(--holi-blue)",
  "var(--holi-green)",
  "var(--holi-yellow)",
  "var(--holi-coral)",
];

const ParticleRain = memo(function ParticleRain({ count = 14 }: { count?: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        color: COLORS[i % COLORS.length],
        left: Math.random() * 100,
        size: 2 + Math.random() * 4,
        dur: `${8 + Math.random() * 12}s`,
        del: `${Math.random() * 10}s`,
      })),
    [count],
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {particles.map((p) => (
        <div
          key={p.id}
          className="holi-particle"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: "-10px",
            background: p.color,
            opacity: 0.5,
            "--dur": p.dur,
            "--del": p.del,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
});

export default ParticleRain;
