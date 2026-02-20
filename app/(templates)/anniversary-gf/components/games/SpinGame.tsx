"use client";

import { useState, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SPIN_LETTERS } from "./constants";

interface Props {
  items: string[];
}

const COLORS = ["#e11d48", "#f97316", "#a855f7", "#3b82f6", "#10b981", "#eab308"];

export default memo(function SpinGame({ items }: Props) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [showCard, setShowCard] = useState(false);

  const segAngle = 360 / items.length;

  const spin = useCallback(() => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    setShowCard(false);
    const newRot = rotation + 1800 + Math.random() * 360;
    setRotation(newRot);
    setTimeout(() => {
      const normDeg = newRot % 360;
      const idx = Math.floor(normDeg / segAngle) % items.length;
      setResult(items[items.length - 1 - idx]);
      setSpinning(false);
      setTimeout(() => setShowCard(true), 400);
    }, 3200);
  }, [spinning, rotation, segAngle, items]);

  const letterIdx = result ? items.indexOf(result) % SPIN_LETTERS.length : 0;

  return (
    <div className="flex flex-col items-center gap-5 py-4">
      <div className="relative">
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderTop: "16px solid #e11d48",
              filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.2))",
            }}
          />
        </div>
        <svg
          width="240"
          height="240"
          viewBox="-120 -120 240 240"
          className="drop-shadow-xl"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? "transform 3s cubic-bezier(0.15, 0.8, 0.25, 1)" : "none",
          }}
        >
          {items.map((item, i) => {
            const startA = i * segAngle - 90;
            const endA = startA + segAngle;
            const sR = (startA * Math.PI) / 180;
            const eR = (endA * Math.PI) / 180;
            const x1 = Math.cos(sR) * 110;
            const y1 = Math.sin(sR) * 110;
            const x2 = Math.cos(eR) * 110;
            const y2 = Math.sin(eR) * 110;
            const midA = (((startA + endA) / 2) * Math.PI) / 180;
            const tX = Math.cos(midA) * 70;
            const tY = Math.sin(midA) * 70;
            const emoji = item.match(/\p{Emoji_Presentation}/u)?.[0] || "💕";
            return (
              <g key={i}>
                <path
                  d={`M 0 0 L ${x1} ${y1} A 110 110 0 0 1 ${x2} ${y2} Z`}
                  fill={COLORS[i % COLORS.length]}
                  stroke="white"
                  strokeWidth="2"
                />
                <text x={tX} y={tY} textAnchor="middle" dominantBaseline="central" fontSize="24">
                  {emoji}
                </text>
              </g>
            );
          })}
          <circle cx="0" cy="0" r="24" fill="white" />
          <circle cx="0" cy="0" r="21" fill="#e11d48" />
          <text x="0" y="1" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="8" fontWeight="bold">
            SPIN
          </text>
        </svg>
      </div>
      <button
        onClick={spin}
        disabled={spinning}
        className="px-8 py-3 rounded-full text-white font-bold text-sm disabled:opacity-50 active:scale-95 transition-transform"
        style={{ background: "linear-gradient(90deg, #e11d48, #ec4899)", boxShadow: "0 4px 15px rgba(225,29,72,0.3)" }}
      >
        {spinning ? "Spinning..." : "🎡 Spin!"}
      </button>
      <AnimatePresence>
        {showCard && result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring" }}
            className="w-full"
          >
            <div
              className="rounded-3xl p-5 border text-center relative overflow-hidden"
              style={{ background: "var(--anni-romantic-bg)", borderColor: "var(--anni-romantic-border)" }}
            >
              <p className="text-xs font-semibold mb-2 uppercase tracking-wider relative z-10" style={{ color: "#e11d48" }}>
                Your Surprise Activity
              </p>
              <p className="text-xl font-bold mb-3 relative z-10" style={{ color: "var(--anni-text)" }}>
                {result}
              </p>
              <div className="w-10 h-[1px] mx-auto mb-3" style={{ background: "var(--anni-divider)" }} />
              <p className="text-xs leading-relaxed italic whitespace-pre-line relative z-10" style={{ color: "var(--anni-text-muted)" }}>
                &ldquo;{SPIN_LETTERS[letterIdx]}&rdquo;
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
