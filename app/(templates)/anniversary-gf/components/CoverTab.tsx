"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronRight, ChevronDown } from "lucide-react";
import { type ContentData } from "./types";

const loveQuotes = [
  "Every love story is beautiful, but ours is my favorite 💕",
  "You are my today and all of my tomorrows 🥺",
  "In your arms, I found my home ✨",
  "My heart beats only for you — forever and always 💖",
  "You stole my heart, but I'll let you keep it 😂💕",
  "Some love stories are written in the stars — ours is one 🌹",
  "Every second with you is a gift I'll never take for granted ∞",
  "You're not just my love, you're my whole world 🌸",
  "Falling for you was the best decision I never made 💌",
];

const textGlow = "0 0 16px rgba(255,255,255,1), 0 0 6px rgba(255,255,255,1), 0 1px 4px rgba(255,255,255,1)";
const subtleGlow = "0 0 12px rgba(255,255,255,1), 0 0 4px rgba(255,255,255,1)";
const numGlow = "0 0 10px rgba(255,255,255,0.9), 0 0 3px rgba(255,255,255,1)";

const FLOAT_HEARTS = [
  { emoji: "💕", left: 8, top: 18 },
  { emoji: "💗", left: 28, top: 42 },
  { emoji: "✨", left: 55, top: 12 },
  { emoji: "💖", left: 75, top: 55 },
  { emoji: "🌸", left: 90, top: 30 },
];

const GLASS_CARD = {
  background: "rgba(255,255,255,0.12)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1.5px solid rgba(255,255,255,0.25)",
  boxShadow: "0 4px 24px rgba(225,29,72,0.06)",
} as const;

const GLASS_LIGHT = {
  background: "rgba(255,255,255,0.12)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.25)",
} as const;

const CLOCK_CELL = {
  background: "rgba(255,255,255,0.15)",
  backdropFilter: "blur(8px)",
  border: "1.5px solid rgba(255,255,255,0.25)",
} as const;

interface TimeUnit {
  value: number;
  label: string;
}

interface Props {
  data: ContentData;
  onNext: () => void;
}

function computeUnits(dateStr: string): TimeUnit[] {
  const diff = Date.now() - new Date(dateStr).getTime();
  const totalSec = Math.floor(diff / 1000);
  const totalMin = Math.floor(totalSec / 60);
  const totalHr = Math.floor(totalMin / 60);
  const totalDays = Math.floor(totalHr / 24);
  const years = Math.floor(totalDays / 365.25);
  const months = Math.floor((totalDays % 365.25) / 30.44);
  const days = Math.floor(totalDays % 30.44);
  return [
    { value: years, label: "Years" },
    { value: months, label: "Months" },
    { value: days, label: "Days" },
    { value: totalHr % 24, label: "Hours" },
    { value: totalMin % 60, label: "Mins" },
    { value: totalSec % 60, label: "Secs" },
  ];
}

export default function CoverTab({ data, onNext }: Props) {
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [units, setUnits] = useState<TimeUnit[]>([]);

  useEffect(() => {
    setMounted(true);
    setQuoteIdx(Math.floor(Math.random() * loveQuotes.length));

    const update = () => setUnits(computeUnits(data.anniversaryDate));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [data.anniversaryDate]);

  if (!mounted) return null;

  return (
    <motion.div
      key="cover"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="px-4 pt-5 pb-24 h-screen flex flex-col overflow-hidden relative z-10"
    >
      {/* Soft pink radial bg glow */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(251,207,232,0.4) 0%, transparent 70%)" }}
      />

      {/* Floating hearts — CSS only */}
      {FLOAT_HEARTS.map((h, i) => (
        <span
          key={i}
          className="absolute pointer-events-none text-2xl float-heart"
          style={{ left: `${h.left}%`, top: `${h.top}%`, animationDelay: `${i * 0.8}s`, animationDuration: `${4 + i * 0.6}s` }}
        >
          {h.emoji}
        </span>
      ))}

      {/* Header */}
      <div className="text-center mb-3 relative z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full mb-2"
          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)" }}
        >
          <span className="text-sm heart-beat">💝</span>
          <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: "#881337", textShadow: subtleGlow }}>
            Happy Anniversary
          </span>
          <span className="text-sm heart-beat" style={{ animationDelay: "0.5s" }}>💝</span>
        </motion.div>

        <motion.h1
          className="font-script text-4xl sm:text-5xl leading-tight"
          style={{ color: "#881337", textShadow: textGlow }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Our Love Story
        </motion.h1>

        <motion.h2
          className="text-2xl sm:text-3xl font-bold text-foreground mt-1"
          style={{ textShadow: subtleGlow }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {data.recipientName}
        </motion.h2>
      </div>

      {/* Together For — Clock section (glassmorphism) */}
      <motion.div
        className="flex-shrink-0 relative z-10 w-full max-w-sm mx-auto lg:max-w-md rounded-3xl overflow-hidden p-4"
        style={GLASS_CARD}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center gap-3 mb-3">
          <motion.span
            className="text-3xl"
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            💖
          </motion.span>
          <div className="flex-1">
            <h2 className="font-script text-lg leading-tight" style={{ color: "#881337", textShadow: textGlow }}>
              Together For
            </h2>
            <p className="text-[10px] font-medium" style={{ color: "rgba(136,19,55,0.6)", textShadow: subtleGlow }}>
              Every second with you is a gift 💕
            </p>
          </div>
          <span className="text-2xl heart-beat">💍</span>
        </div>

        {/* Clock grid */}
        <div className="grid grid-cols-3 gap-2">
          {units.map((unit, i) => (
            <motion.div
              key={unit.label}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.7 + i * 0.06, type: "spring", stiffness: 300 }}
              className="flex flex-col items-center"
            >
              <div className="w-full py-2 flex flex-col items-center rounded-2xl" style={CLOCK_CELL}>
                <span
                  key={unit.value}
                  className="font-bold text-2xl tabular-nums"
                  style={{ color: "#881337", textShadow: numGlow }}
                >
                  {unit.value}
                </span>
                <span
                  className="text-[9px] font-bold uppercase tracking-widest"
                  style={{ color: "rgba(136,19,55,0.5)", textShadow: "0 0 6px rgba(255,255,255,0.8)" }}
                >
                  {unit.label}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Message card — glassmorphism */}
      <motion.div
        className="flex-shrink-0 relative z-10 w-full max-w-sm mx-auto lg:max-w-md rounded-3xl overflow-hidden p-4 lg:p-6 mt-3"
        style={GLASS_CARD}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="absolute top-3 right-3 opacity-20 text-sm">💕</div>
        <div className="absolute bottom-3 left-3 opacity-20 text-sm">✨</div>

        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "rgba(0,0,0,0.7)", textShadow: "0 0 8px rgba(255,255,255,0.8)" }}>
          {data.personalMessage}
        </p>

        <div className="mt-3 pt-3 text-right" style={{ borderTop: "1px solid rgba(236,72,153,0.12)" }}>
          <p className="font-script text-base" style={{ color: "#881337", textShadow: subtleGlow }}>
            With all my love,
          </p>
          <p className="font-bold text-foreground text-xs mt-0.5">{data.senderName}</p>
        </div>
      </motion.div>

      {/* Quote card */}
      <motion.div
        className="flex-shrink-0 relative z-10 w-full max-w-sm mx-auto lg:max-w-md rounded-2xl p-3 mt-2 text-center"
        style={GLASS_LIGHT}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <p className="text-xs italic leading-relaxed" style={{ color: "#881337", textShadow: subtleGlow }}>
          &quot;{loveQuotes[quoteIdx]}&quot;
        </p>
      </motion.div>

      {/* Explore button */}
      <motion.div
        className="flex-shrink-0 text-center relative z-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
      >
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm active:scale-95 transition-transform"
          style={{ background: "linear-gradient(90deg, #e11d48, #ec4899)", boxShadow: "0 8px 25px rgba(225,29,72,0.3)" }}
        >
          Explore Our Journey
          <ChevronRight size={16} />
        </button>
      </motion.div>

      {/* Bounce arrow */}
      <div className="flex-1 flex items-end justify-center relative z-10 pb-2 min-h-0">
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <ChevronDown size={20} style={{ color: "rgba(225,29,72,0.3)" }} />
        </motion.div>
      </div>

      <style jsx>{`
        .heart-beat { animation: hb 2s ease-in-out infinite; display: inline-block; }
        @keyframes hb { 0%,100% { transform: scale(1); } 50% { transform: scale(1.2); } }
        .float-heart { opacity: 0.2; animation: fh 4s ease-in-out infinite; }
        @keyframes fh {
          0%,100% { transform: translateY(0) rotate(0deg); opacity: 0.2; }
          25% { transform: translateY(-12px) rotate(8deg); opacity: 0.35; }
          50% { transform: translateY(-4px) rotate(-6deg); opacity: 0.25; }
          75% { transform: translateY(-15px) rotate(10deg); opacity: 0.35; }
        }
      `}</style>
    </motion.div>
  );
}
