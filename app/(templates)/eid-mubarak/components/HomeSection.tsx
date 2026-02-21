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
        className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center eid-glow"
        style={{
          background: "hsl(var(--eid-card) / 0.8)",
          backdropFilter: "blur(12px)",
          border: "2px solid rgba(197,160,63,0.4)",
        }}
      >
        <span
          className="text-xl sm:text-3xl font-bold tabular-nums"
          style={{ color: "var(--eid-gold)", fontFamily: "'Cormorant Garamond', serif" }}
        >
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span
        className="text-[10px] sm:text-xs mt-1.5 font-semibold uppercase tracking-wider"
        style={{ color: "hsl(var(--eid-muted-fg))", fontFamily: "'DM Sans', sans-serif" }}
      >
        {label}
      </span>
    </div>
  );
});

const HomeSection = memo(function HomeSection({ data }: { data: EidData }) {
  const cd = useCountdown(data.eidDate);

  const yearLabel = useMemo(() => {
    const d = new Date(data.eidDate);
    return `Counting down to Eid al-Fitr ${d.getFullYear()}`;
  }, [data.eidDate]);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
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
              "linear-gradient(180deg, hsl(var(--eid-bg) / 0.45) 0%, hsl(var(--eid-bg) / 0.25) 30%, hsl(var(--eid-bg) / 0.6) 60%, hsl(var(--eid-bg) / 0.9) 100%)",
          }}
        />
      </div>

      <StarField count={30} />

      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto flex flex-col items-center">
        <motion.div
          className="text-5xl sm:text-7xl mb-3"
          style={{ animation: "eid-glow-pulse 3s ease-in-out infinite" }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          🌙
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-7xl mb-2 leading-relaxed"
          dir="rtl"
          lang="ur"
          style={{ color: "var(--eid-gold)", fontFamily: "'Noto Nastaliq Urdu', serif" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {data.urduTitle}
        </motion.h1>

        <motion.p
          className="text-base sm:text-xl mb-2 leading-loose"
          dir="rtl"
          lang="ur"
          style={{ color: "hsl(var(--eid-fg) / 0.8)", fontFamily: "'Noto Nastaliq Urdu', serif" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {data.urduSubtitle}
        </motion.p>

        <motion.p
          className="text-sm sm:text-xl italic mb-6"
          style={{ color: "hsl(var(--eid-muted-fg))", fontFamily: "'Cormorant Garamond', serif" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          &ldquo;{data.englishSubtitle}&rdquo;
        </motion.p>

        <div className="eid-gold-divider w-36 mx-auto mb-6" />

        <motion.div
          className="flex justify-center gap-3 sm:gap-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <CountdownBox value={cd.days} label="Days" />
          <CountdownBox value={cd.hours} label="Hours" />
          <CountdownBox value={cd.minutes} label="Mins" />
          <CountdownBox value={cd.seconds} label="Secs" />
        </motion.div>

        <motion.p
          className="text-xs mt-4"
          style={{ color: "hsl(var(--eid-muted-fg))", fontFamily: "'DM Sans', sans-serif" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {yearLabel}
        </motion.p>
      </div>
    </section>
  );
});

export default HomeSection;
