"use client";

import { memo, useMemo } from "react";

const BokehParticles = memo(function BokehParticles() {
  const orbs = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const colors = [
          "radial-gradient(circle, rgba(212,165,116,0.25) 0%, transparent 70%)",
          "radial-gradient(circle, rgba(196,166,181,0.2) 0%, transparent 70%)",
          "radial-gradient(circle, rgba(127,184,176,0.18) 0%, transparent 70%)",
        ];
        return {
          id: i,
          size: 20 + Math.random() * 60,
          left: `${Math.random() * 100}%`,
          top: `${40 + Math.random() * 60}%`,
          delay: Math.random() * 12,
          duration: 16 + Math.random() * 14,
          bg: colors[i % 3],
        };
      }),
    [],
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {orbs.map((o) => (
        <div
          key={o.id}
          className="absolute rounded-full blur-xl"
          style={{
            width: o.size,
            height: o.size,
            left: o.left,
            top: o.top,
            background: o.bg,
            animation: `rec-orb-drift ${o.duration}s ease-in-out ${o.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
});

export default BokehParticles;
