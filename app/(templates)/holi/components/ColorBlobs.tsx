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

const ColorBlobs = memo(function ColorBlobs({ count = 8 }: { count?: number }) {
  const blobs = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        color: COLORS[i % COLORS.length],
        size: 100 + Math.random() * 180,
        left: Math.random() * 100,
        top: Math.random() * 100,
        dur: `${8 + Math.random() * 12}s`,
        morph: `${11 + Math.random() * 8}s`,
        del: `${Math.random() * 6}s`,
      })),
    [count],
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {blobs.map((b) => (
        <div
          key={b.id}
          className="holi-color-blob"
          style={{
            width: b.size,
            height: b.size,
            left: `${b.left}%`,
            top: `${b.top}%`,
            background: `radial-gradient(circle, ${b.color} 0%, transparent 70%)`,
            opacity: 0.2,
            "--dur": b.dur,
            "--del": b.del,
            "--morph": b.morph,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
});

export default ColorBlobs;
