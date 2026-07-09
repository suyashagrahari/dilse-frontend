"use client";

import { memo, useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { HoliData } from "./types";

function useCountdown(dateStr: string) {
  const target = useMemo(() => new Date(dateStr).getTime(), [dateStr]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, target - now);
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
  };
}

const BOX_COLORS = [
  "#FF6B9D",
  "#FF8C42",
  "#A855F7",
  "#38BDF8",
] as const;

const BOX_LABELS = ["DAYS", "HRS", "MIN", "SEC"] as const;

const CountdownBox = memo(function CountdownBox({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center relative overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(20px)",
          border: `2px solid ${color}70`,
          boxShadow: `0 0 30px ${color}35, inset 0 1px 0 rgba(255,255,255,0.25)`,
        }}
      >
        <div className="absolute inset-0 opacity-20" style={{ background: color }} />
        <span
          className="text-2xl sm:text-3xl font-extrabold tabular-nums relative z-10 text-white drop-shadow-lg"
          style={{ fontFamily: "'DM Sans', monospace" }}
        >
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span
        className="text-[10px] sm:text-xs mt-2 font-bold uppercase tracking-widest text-white/70"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {label}
      </span>
      <div
        className="w-2 h-2 rounded-full mt-1"
        style={{ background: color, boxShadow: `0 0 10px ${color}` }}
      />
    </div>
  );
});

const AnimatedCounter = memo(function AnimatedCounter({ target }: { target: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / 60);
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(id); }
      else setVal(start);
    }, 30);
    return () => clearInterval(id);
  }, [target]);
  return <>{val.toLocaleString()}</>;
});

const STATS = [
  { emoji: "🎨", label: "Colors Used", value: 7842 },
  { emoji: "🌸", label: "Wishes Sent", value: 12567 },
  { emoji: "🎵", label: "Songs Playing", value: 3421 },
] as const;

const PARTICLES = [
  { emoji: "🎨", x: 6, y: 12, delay: 0, size: "text-3xl" },
  { emoji: "🌸", x: 88, y: 8, delay: 0.4, size: "text-2xl" },
  { emoji: "💜", x: 4, y: 52, delay: 1.0, size: "text-xl" },
  { emoji: "🧡", x: 92, y: 48, delay: 0.7, size: "text-2xl" },
  { emoji: "💛", x: 10, y: 82, delay: 1.3, size: "text-xl" },
  { emoji: "💙", x: 84, y: 80, delay: 0.2, size: "text-2xl" },
  { emoji: "🌈", x: 50, y: 4, delay: 0.9, size: "text-xl" },
  { emoji: "✨", x: 76, y: 22, delay: 0.5, size: "text-lg" },
  { emoji: "💚", x: 20, y: 30, delay: 1.6, size: "text-lg" },
  { emoji: "🎊", x: 70, y: 60, delay: 0.3, size: "text-lg" },
] as const;

const HomeSection = memo(function HomeSection({ data }: { data: HoliData }) {
  const cd = useCountdown(data.holiDate);

  const yearLabel = useMemo(() => {
    const d = new Date(data.holiDate);
    return `Counting down to Holi ${d.getFullYear()} — March 14`;
  }, [data.holiDate]);

  const countdownKeys = useMemo(
    () => ["days", "hours", "minutes", "seconds"] as const,
    [],
  );

  const countdownValues = useMemo(
    () => [cd.days, cd.hours, cd.minutes, cd.seconds],
    [cd.days, cd.hours, cd.minutes, cd.seconds],
  );

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Hero Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/assets/Holi/hero_holi.webp"
          alt="Happy Holi"
          fill
          className="object-cover lg:object-[center_20%]"
          priority
          sizes="100vw"
          // style={{ opacity: 0.9 }}
        />
        {/* Dark gradient overlay for readability */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.1) 25%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.85) 100%)",
          }}
        />
        {/* Color tint overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(233,30,99,0.12) 0%, transparent 40%, rgba(156,39,176,0.10) 70%, transparent 100%)",
          }}
        />
      </div>

      {/* Floating emoji particles */}
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className={`absolute pointer-events-none select-none ${p.size}`}
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          animate={{
            y: [0, -16, -5, -20, 0],
            x: [0, 5, -3, 3, 0],
            scale: [1, 1.15, 0.92, 1.08, 1],
            opacity: [0.35, 0.65, 0.45, 0.6, 0.35],
          }}
          transition={{ duration: 5 + i * 0.4, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        >
          {p.emoji}
        </motion.span>
      ))}

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto flex flex-col items-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-5"
          style={{
            background: "rgba(255,255,255,0.13)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.28)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          }}
        >
          <span className="text-sm">🎨</span>
          <span
            className="text-xs font-bold tracking-wider uppercase text-white/90"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Festival of Colors 2026
          </span>
          <span className="text-sm">🌈</span>
        </motion.div>

        {/* Hindi Title */}
        <motion.h1
          className="text-6xl sm:text-8xl font-bold mb-3 pt-3 leading-tight"
          style={{
            fontFamily: "'Noto Serif Devanagari', serif",
            color: "transparent",
            backgroundImage: "linear-gradient(135deg, #FF6B9D 0%, #FFD700 40%, #FF8C00 70%, #FF6B9D 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            filter: "drop-shadow(0 3px 25px rgba(255,107,157,0.6))",
          }}
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
        >
          {data.hindiTitle}
        </motion.h1>

        {/* Animated emoji */}
        <motion.div
          className="text-5xl mb-3"
          initial={{ opacity: 0, scale: 0, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.35, type: "spring", stiffness: 220, damping: 15 }}
          style={{ filter: "drop-shadow(0 0 18px rgba(255,107,157,0.7))" }}
        >
          🎨
        </motion.div>

        {/* Holi Mubarak */}
        <motion.p
          className="text-2xl sm:text-3xl font-bold mb-1 text-white drop-shadow-lg"
          style={{ fontFamily: "'Outfit', sans-serif", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.6 }}
        >
          Holi Mubarak
        </motion.p>

        {/* English subtitle */}
        <motion.p
          className="text-sm sm:text-base italic mb-1 text-white/75"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.6 }}
        >
          &ldquo;{data.englishSubtitle}&rdquo;
        </motion.p>

        {/* Hindi subtitle */}
        <motion.p
          className="text-sm mb-6 text-white/55"
          style={{ fontFamily: "'Noto Serif Devanagari', serif" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
        >
          {data.hindiSubtitle}
        </motion.p>

        {/* Rainbow divider */}
        <motion.div
          className="w-44 h-1.5 rounded-full mx-auto mb-6"
          style={{
            background: "linear-gradient(90deg, #FF6B9D, #FF8C42, #FFD700, #4CAF50, #38BDF8, #A855F7)",
            boxShadow: "0 0 25px rgba(255,107,157,0.55)",
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        />

        {/* Countdown */}
        <motion.div
          className="flex justify-center gap-3 sm:gap-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.6 }}
        >
          {countdownKeys.map((key, i) => (
            <CountdownBox
              key={key}
              value={countdownValues[i]}
              label={BOX_LABELS[i]}
              color={BOX_COLORS[i]}
            />
          ))}
        </motion.div>

        <motion.p
          className="text-[10px] sm:text-xs mt-3 mb-6 text-white/45"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          {yearLabel}
        </motion.p>

        {/* Stats */}
        <motion.div
          className="flex flex-wrap justify-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          {STATS.map((s) => (
            <div
              key={s.label}
              className="px-4 py-3 text-center rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.2)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              <div className="text-xl mb-0.5">{s.emoji}</div>
              <div
                className="text-lg font-bold text-white"
                style={{ textShadow: "0 1px 10px rgba(0,0,0,0.4)" }}
              >
                <AnimatedCounter target={s.value} />+
              </div>
              <div
                className="text-[10px] font-semibold text-white/55"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Home page personal wish card */}
        {data.homeWishMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.25 }}
            className="w-full max-w-sm mt-5 rounded-2xl px-5 py-4 relative overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.12)",
            }}
          >
            {/* Rainbow top accent */}
            <div
              className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl"
              style={{
                background: "linear-gradient(90deg, #FF6B9D, #FF8C42, #FFD700, #4CAF50, #38BDF8, #A855F7)",
              }}
            />
            {/* Recipient / General label */}
            <p
              className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-bold text-center mb-2 text-white/50"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {data.recipientName ? `For ${data.recipientName} 🎨` : "For Everyone 🌈"}
            </p>
            <motion.span
              className="block text-center text-sm mb-2"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              ✨
            </motion.span>
            <p
              className="text-sm leading-relaxed text-center text-white/90"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {data.homeWishMessage}
            </p>
            {data.senderName && data.senderName !== "Your Name" && (
              <p className="text-[10px] text-center mt-2 text-white/50 font-medium">
                — {data.senderName}
              </p>
            )}
          </motion.div>
        )}

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-6 text-xs flex flex-col items-center gap-1 text-white/40"
        >
          <span style={{ fontFamily: "'DM Sans', sans-serif" }}>Scroll to Celebrate</span>
          <motion.span
            animate={{ y: [0, 7, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-xl"
          >
            ↓
          </motion.span>
        </motion.div>
      </div>
    </section>
  );
});

export default HomeSection;
