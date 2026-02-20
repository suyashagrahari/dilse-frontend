"use client";

import { useState, useEffect, memo } from "react";

const EMOJIS = ["💕", "💖", "💗", "💝", "🌸", "✨"];

const HEARTS = Array.from({ length: 8 }, (_, i) => {
  const s = (seed: number) => { const x = Math.sin(seed) * 10000; return x - Math.floor(x); };
  return {
    id: i,
    left: `${(s(i * 7 + 1) * 90 + 5).toFixed(2)}%`,
    fontSize: `${(12 + s(i * 3 + 2) * 10).toFixed(1)}px`,
    dur: `${(8 + s(i * 5 + 3) * 8).toFixed(2)}s`,
    del: `${(s(i * 11 + 4) * 6).toFixed(2)}s`,
    emoji: EMOJIS[i % EMOJIS.length],
  };
});

export default memo(function FloatingHearts() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-30 dark:opacity-20">
      {HEARTS.map((h) => (
        <div
          key={h.id}
          className="absolute select-none animate-float-heart"
          style={{
            left: h.left,
            fontSize: h.fontSize,
            animationDuration: h.dur,
            animationDelay: h.del,
          }}
        >
          {h.emoji}
        </div>
      ))}

      <style jsx>{`
        @keyframes float-heart {
          0% { transform: translateY(110vh); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-10vh); opacity: 0; }
        }
        .animate-float-heart {
          animation: float-heart linear infinite;
          will-change: transform;
        }
      `}</style>
    </div>
  );
});
