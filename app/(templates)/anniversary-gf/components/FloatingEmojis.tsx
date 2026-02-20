"use client";

import { memo } from "react";
import { FLOAT_SEEDS } from "./types";

export default memo(function FloatingEmojis() {
  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {FLOAT_SEEDS.map((f) => (
          <div
            key={f.id}
            className="absolute"
            style={{
              left: `${f.left}%`,
              bottom: "-30px",
              fontSize: `${f.size}px`,
              animation: `anni-float ${f.dur}s ${f.delay}s linear infinite`,
              opacity: 0,
            }}
          >
            {f.emoji}
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes anni-float {
          0% { transform: translateY(0); opacity: 0; }
          5% { opacity: 0.35; }
          85% { opacity: 0.35; }
          100% { transform: translateY(-110vh) rotate(25deg); opacity: 0; }
        }
      `}</style>
    </>
  );
});
