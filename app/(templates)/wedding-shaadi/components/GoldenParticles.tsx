"use client";

import { memo, useMemo } from "react";

const GoldenParticles = memo(function GoldenParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 25 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        duration: 10 + Math.random() * 15,
        delay: Math.random() * 12,
        size: 2 + Math.random() * 4,
        opacity: 0.2 + Math.random() * 0.5,
      })),
    [],
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: `radial-gradient(circle, var(--wed-gold) ${p.opacity * 100}%, transparent)`,
            boxShadow: `0 0 ${p.size * 3}px var(--wed-gold-glow)`,
            animation: `wed-float-particle ${p.duration}s ${p.delay}s linear infinite`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
});

export default GoldenParticles;
