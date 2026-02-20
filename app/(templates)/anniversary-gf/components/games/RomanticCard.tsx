"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";

interface Props {
  emoji: string;
  title: string;
  body: string;
  onAction: () => void;
  actionLabel: string;
}

export default memo(function RomanticCard({ emoji, title, body, onAction, actionLabel }: Props) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="text-center py-4"
    >
      <div
        className="rounded-3xl p-6 border relative overflow-hidden"
        style={{ background: "var(--anni-romantic-bg)", borderColor: "var(--anni-romantic-border)" }}
      >
        <div className="absolute top-2 right-3 opacity-20 text-lg">💕</div>
        <div className="absolute bottom-2 left-3 opacity-20 text-lg">✨</div>
        <motion.span
          className="text-5xl block mb-3 relative z-10"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", delay: 0.2 }}
        >
          {emoji}
        </motion.span>
        <h3 className="text-lg font-bold mb-2 relative z-10" style={{ color: "var(--anni-text)" }}>{title}</h3>
        <p className="text-sm leading-relaxed whitespace-pre-line italic relative z-10" style={{ color: "var(--anni-text-muted)" }}>
          &ldquo;{body}&rdquo;
        </p>
        <div className="flex justify-center gap-1 my-3 relative z-10">
          {[0, 1, 2].map((i) => (
            <span key={i} className="heart-beat" style={{ animationDelay: `${i * 0.2}s`, fontSize: 10, color: "var(--anni-pink)" }}>♥</span>
          ))}
        </div>
      </div>
      <button
        onClick={onAction}
        className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-white font-semibold text-sm active:scale-95 transition-transform"
        style={{ background: "linear-gradient(90deg, #e11d48, #ec4899)", boxShadow: "0 4px 15px rgba(225,29,72,0.25)" }}
      >
        <RotateCcw size={14} /> {actionLabel}
      </button>
      <style jsx>{`
        .heart-beat { animation: hb 1.5s ease-in-out infinite; display: inline-block; }
        @keyframes hb { 0%,100% { transform: scale(1); } 50% { transform: scale(1.3); } }
      `}</style>
    </motion.div>
  );
});
