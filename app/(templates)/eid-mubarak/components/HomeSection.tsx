"use client";

import { memo, useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import StarField from "./StarField";
import type { EidData } from "./types";

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

const CountdownBox = memo(function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center relative overflow-hidden"
        style={{
          background: "rgba(197,160,63,0.15)",
          backdropFilter: "blur(20px)",
          border: "2px solid rgba(197,160,63,0.4)",
          boxShadow: "0 0 25px rgba(197,160,63,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        <div className="absolute inset-0 opacity-10" style={{ background: "var(--eid-gold)" }} />
        <span
          className="text-xl sm:text-2xl font-extrabold tabular-nums relative z-10 drop-shadow-lg"
          style={{ color: "var(--eid-gold)", fontFamily: "'Cormorant Garamond', serif" }}
        >
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span
        className="text-[9px] sm:text-[10px] mt-1.5 font-bold uppercase tracking-widest"
        style={{ color: "rgba(197,160,63,0.6)", fontFamily: "'DM Sans', sans-serif" }}
      >
        {label}
      </span>
    </div>
  );
});

const SPARKLES = [
  { emoji: "✨", x: 6,  y: 12, delay: 0 },
  { emoji: "🌙", x: 88, y: 8,  delay: 0.5 },
  { emoji: "⭐", x: 4,  y: 52, delay: 1.2 },
  { emoji: "✨", x: 92, y: 48, delay: 0.8 },
  { emoji: "🌙", x: 10, y: 80, delay: 1.5 },
  { emoji: "⭐", x: 82, y: 78, delay: 0.3 },
  { emoji: "✨", x: 50, y: 4,  delay: 0.9 },
  { emoji: "🌙", x: 74, y: 22, delay: 0.5 },
] as const;

const HomeSection = memo(function HomeSection({ data }: { data: EidData }) {
  const cd = useCountdown(data.eidDate);

  const yearLabel = useMemo(() => {
    const d = new Date(data.eidDate);
    return `Counting down to Eid al-Fitr ${d.getFullYear()}`;
  }, [data.eidDate]);

  const showWishCard = !!(data.homeWishMessage || data.recipientName);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src={data.heroImage}
          alt="Eid Mubarak"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 20%, rgba(0,0,0,0.5) 65%, rgba(0,0,0,0.88) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(58,143,125,0.08) 0%, transparent 40%, rgba(197,160,63,0.06) 70%, transparent 100%)",
          }}
        />
      </div>

      {/* Stars */}
      <StarField count={25} />

      {/* Floating sparkles */}
      {SPARKLES.map((s, i) => (
        <motion.span
          key={i}
          className="absolute pointer-events-none select-none text-lg sm:text-xl"
          style={{ left: `${s.x}%`, top: `${s.y}%`, opacity: 0.18 }}
          animate={{
            y: [0, -14, -4, -18, 0],
            scale: [1, 1.2, 0.9, 1.1, 1],
            opacity: [0.18, 0.45, 0.22, 0.38, 0.18],
          }}
          transition={{ duration: 5 + i * 0.5, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
        >
          {s.emoji}
        </motion.span>
      ))}

      {/* Main content */}
      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto flex flex-col items-center w-full">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-3"
          style={{
            background: "rgba(197,160,63,0.15)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(197,160,63,0.3)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          }}
        >
          <span className="text-xs">🌙</span>
          <span
            className="text-[10px] font-bold tracking-wider uppercase"
            style={{ color: "var(--eid-gold)", fontFamily: "'DM Sans', sans-serif" }}
          >
            Eid al-Fitr {new Date(data.eidDate).getFullYear()}
          </span>
          <span className="text-xs">🌙</span>
        </motion.div>

        {/* Moon emoji */}
        <motion.div
          className="text-4xl sm:text-5xl mb-1"
          initial={{ opacity: 0, scale: 0, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
          style={{ filter: "drop-shadow(0 0 20px rgba(197,160,63,0.6))" }}
        >
          🌙
        </motion.div>

        {/* Urdu title */}
        <motion.h1
          className="text-4xl sm:text-6xl lg:text-7xl mb-0.5 leading-relaxed"
          dir="rtl"
          lang="ur"
          style={{
            color: "var(--eid-gold)",
            fontFamily: "'Noto Nastaliq Urdu', serif",
            filter: "drop-shadow(0 2px 20px rgba(197,160,63,0.5))",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
        >
          {data.urduTitle}
        </motion.h1>

        {/* Urdu subtitle */}
        <motion.p
          className="text-xs sm:text-sm mb-1 leading-loose"
          dir="rtl"
          lang="ur"
          style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'Noto Nastaliq Urdu', serif" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.6 }}
        >
          {data.urduSubtitle}
        </motion.p>

        {/* English subtitle */}
        <motion.p
          className="text-xs sm:text-sm italic mb-4"
          style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Cormorant Garamond', serif" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.6 }}
        >
          &ldquo;{data.englishSubtitle}&rdquo;
        </motion.p>

        {/* Gold divider */}
        <motion.div
          className="w-28 h-px mx-auto mb-4"
          style={{ background: "linear-gradient(90deg, transparent, var(--eid-gold), transparent)" }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        />

        {/* Countdown */}
        <motion.div
          className="flex justify-center gap-3 sm:gap-4 mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <CountdownBox value={cd.days}    label="Days"  />
          <CountdownBox value={cd.hours}   label="Hours" />
          <CountdownBox value={cd.minutes} label="Mins"  />
          <CountdownBox value={cd.seconds} label="Secs"  />
        </motion.div>

        <motion.p
          className="text-[10px] mb-4"
          style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
        >
          {yearLabel}
        </motion.p>

        {/* Personal wish card — compact glassmorphism, inline */}
        {showWishCard && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            className="w-full max-w-xs sm:max-w-sm rounded-2xl px-5 py-4 relative overflow-hidden"
            style={{
              background: "rgba(197,160,63,0.08)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(197,160,63,0.25)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(197,160,63,0.12)",
            }}
          >
            {/* Gold top accent */}
            <div
              className="absolute inset-x-0 top-0 h-px rounded-t-2xl"
              style={{ background: "linear-gradient(90deg, transparent, var(--eid-gold), transparent)" }}
            />

            <p
              className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-bold text-center mb-2"
              style={{ color: "rgba(197,160,63,0.6)", fontFamily: "'DM Sans', sans-serif" }}
            >
              {data.recipientName ? `For ${data.recipientName}` : "For Everyone 🌙"}
            </p>

            <motion.span
              className="block text-center text-sm mb-1.5"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              🌙
            </motion.span>

            <p
              className="text-xs sm:text-sm leading-relaxed text-center"
              style={{ color: "rgba(255,255,255,0.85)", fontFamily: "'DM Sans', sans-serif" }}
            >
              {data.homeWishMessage}
            </p>

            {data.senderName && (
              <p
                className="text-[9px] sm:text-[10px] text-center mt-2 font-medium"
                style={{ color: "rgba(197,160,63,0.55)" }}
              >
                — {data.senderName}
              </p>
            )}
          </motion.div>
        )}

        {/* Scroll hint when NO wish card */}
        {!showWishCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-4 text-xs flex flex-col items-center gap-1"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            <span style={{ fontFamily: "'DM Sans', sans-serif" }}>Scroll to explore</span>
            <motion.span
              animate={{ y: [0, 7, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-lg"
            >
              ↓
            </motion.span>
          </motion.div>
        )}
      </div>
    </section>
  );
});

export default HomeSection;
