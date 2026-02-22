"use client";

import { useState, useEffect, memo } from "react";
import { motion } from "framer-motion";
import { ChevronRight, ChevronDown } from "lucide-react";
import { type ContentData } from "./types";
import { GLASS_CARD, GLASS_LIGHT, GLASS_STRONG } from "./styles";

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

const FLOAT_HEARTS = [
  { emoji: "💕", left: 8, top: 18 },
  { emoji: "💗", left: 28, top: 42 },
  { emoji: "✨", left: 55, top: 12 },
  { emoji: "💖", left: 75, top: 55 },
  { emoji: "🌸", left: 90, top: 30 },
];

const CLOCK_CELL = GLASS_STRONG;

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

export default memo(function CoverTab({ data, onNext }: Props) {
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
      className="px-4 pt-5 pb-24 h-screen flex flex-col overflow-hidden relative z-10 lg:items-center lg:justify-center lg:pt-6 lg:pb-28"
    >
      {/* Radial bg glow */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 30%, var(--anni-radial) 0%, transparent 70%)" }}
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
      <div className="text-center mb-3 relative z-10 lg:mb-5">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full mb-2"
          style={{ background: "var(--anni-badge-bg)", backdropFilter: "blur(8px)", border: "1px solid var(--anni-badge-border)" }}
        >
          <span className="text-sm heart-beat">💝</span>
          <span className="text-[10px] font-bold tracking-wider uppercase lg:text-xs" style={{ color: "var(--anni-text)", textShadow: "var(--anni-glow-subtle)" }}>
            Happy Anniversary
          </span>
          <span className="text-sm heart-beat" style={{ animationDelay: "0.5s" }}>💝</span>
        </motion.div>

        <motion.h1
          className="font-script text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-tight"
          style={{ color: "var(--anni-text)", textShadow: "var(--anni-glow)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Our Love Story
        </motion.h1>

        <motion.h2
          className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mt-1"
          style={{ textShadow: "var(--anni-glow-subtle)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {data.recipientName}
        </motion.h2>
      </div>

      <div className="flex flex-col lg:flex-row lg:gap-6 lg:w-full lg:max-w-4xl xl:max-w-5xl lg:items-start">
        {/* Together For — Clock section */}
        <motion.div
          className="flex-shrink-0 relative z-10 w-full max-w-sm mx-auto lg:max-w-none lg:flex-1 rounded-3xl overflow-hidden p-4 lg:p-6"
          style={GLASS_CARD}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <motion.span
              className="text-3xl lg:text-4xl"
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              💖
            </motion.span>
            <div className="flex-1">
              <h2 className="font-script text-lg lg:text-xl leading-tight" style={{ color: "var(--anni-text)", textShadow: "var(--anni-glow)" }}>
                Together For
              </h2>
              <p className="text-[10px] lg:text-xs font-medium" style={{ color: "var(--anni-text-muted)", textShadow: "var(--anni-glow-subtle)" }}>
                Every second with you is a gift 💕
              </p>
            </div>
            <span className="text-2xl heart-beat">💍</span>
          </div>

          <div className="grid grid-cols-3 gap-2 lg:gap-3">
            {units.map((unit, i) => (
              <motion.div
                key={unit.label}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.7 + i * 0.06, type: "spring", stiffness: 300 }}
                className="flex flex-col items-center"
              >
                <div className="w-full py-2 lg:py-3 flex flex-col items-center rounded-2xl" style={CLOCK_CELL}>
                  <span
                    key={unit.value}
                    className="font-bold text-2xl lg:text-3xl tabular-nums"
                    style={{ color: "var(--anni-text)", textShadow: "var(--anni-glow-num)" }}
                  >
                    {unit.value}
                  </span>
                  <span
                    className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: "var(--anni-text-muted)" }}
                  >
                    {unit.label}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right column: Message + Quote */}
        <div className="flex flex-col lg:flex-1">
          {/* Message card */}
          <motion.div
            className="flex-shrink-0 relative z-10 w-full max-w-sm mx-auto lg:max-w-none rounded-3xl overflow-hidden p-4 lg:p-6 mt-3 lg:mt-0"
            style={GLASS_CARD}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="absolute top-3 right-3 opacity-20 text-sm">💕</div>
            <div className="absolute bottom-3 left-3 opacity-20 text-sm">✨</div>

            <p className="text-sm lg:text-base leading-relaxed whitespace-pre-wrap" style={{ color: "var(--anni-text-body)" }}>
              {data.personalMessage}
            </p>

            <div className="mt-3 pt-3 text-right" style={{ borderTop: "1px solid var(--anni-divider)" }}>
              <p className="font-script text-base lg:text-lg" style={{ color: "var(--anni-text)", textShadow: "var(--anni-glow-subtle)" }}>
                With all my love,
              </p>
              <p className="font-bold text-foreground text-xs lg:text-sm mt-0.5">{data.senderName}</p>
            </div>
          </motion.div>

          {/* Quote card */}
          <motion.div
            className="flex-shrink-0 relative z-10 w-full max-w-sm mx-auto lg:max-w-none rounded-2xl p-3 mt-2 text-center"
            style={GLASS_LIGHT}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <p className="text-xs lg:text-sm italic leading-relaxed" style={{ color: "var(--anni-text)", textShadow: "var(--anni-glow-subtle)" }}>
              &quot;{loveQuotes[quoteIdx]}&quot;
            </p>
          </motion.div>
        </div>
      </div>

    

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
});
