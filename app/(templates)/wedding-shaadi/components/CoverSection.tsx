"use client";

import { useState, useEffect, useMemo, memo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { WeddingData } from "./types";
import { GLASS_CARD } from "./styles";

interface Props {
  data: WeddingData;
}

const CoverSection = memo(function CoverSection({ data }: Props) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const weddingTs = useMemo(() => new Date(data.weddingDate).getTime(), [data.weddingDate]);

  useEffect(() => {
    const tick = () => {
      const diff = weddingTs - Date.now();
      if (diff <= 0) return;
      setTimeLeft({
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff / 3_600_000) % 24),
        minutes: Math.floor((diff / 60_000) % 60),
        seconds: Math.floor((diff / 1_000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [weddingTs]);

  const units = useMemo(
    () => [
      { label: "DAYS", value: timeLeft.days },
      { label: "HRS", value: timeLeft.hours },
      { label: "MIN", value: timeLeft.minutes },
      { label: "SEC", value: timeLeft.seconds },
    ],
    [timeLeft],
  );

  return (
    <section className="h-[calc(100vh-4rem)] lg:h-screen relative flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://cdn.subhsandesh.in/gifts-media/assets/marriage/weeding.webp"
          alt="Wedding couple"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0" style={{ background: "var(--wed-hero-overlay)" }} />
        <div className="absolute inset-0" style={{ background: "var(--wed-hero-gradient)" }} />
      </div>

      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        <motion.p
          className="text-sm md:text-base tracking-wider mb-6"
          style={{ color: "var(--wed-gold)", fontFamily: "'Noto Serif Devanagari', serif" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {data.blessing}
        </motion.p>

        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-4 md:gap-8">
            <h1
              className="text-4xl md:text-7xl lg:text-8xl font-light tracking-wide"
              style={{ color: "hsl(var(--wed-fg))", fontFamily: "'Playfair Display', serif" }}
            >
              {data.brideName}
            </h1>
            <motion.span
              className="text-3xl md:text-5xl italic"
              style={{ color: "var(--wed-accent-gold)", fontFamily: "'Cormorant Garamond', serif" }}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 1, type: "spring", stiffness: 100 }}
            >
              &
            </motion.span>
            <h1
              className="text-4xl md:text-7xl lg:text-8xl font-light tracking-wide"
              style={{ color: "hsl(var(--wed-fg))", fontFamily: "'Playfair Display', serif" }}
            >
              {data.groomName}
            </h1>
          </div>
        </motion.div>

        <motion.p
          className="text-xs md:text-sm tracking-[0.3em] uppercase mb-10"
          style={{ color: "hsl(var(--wed-muted-fg))" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          15 March 2026 · {data.venue}
        </motion.p>

        <motion.div
          className="flex items-center justify-center gap-2 md:gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          {units.map((unit, idx) => (
            <div key={unit.label} className="flex items-center gap-2 md:gap-4">
              <div
                className="rounded-xl px-3 py-3 md:px-5 md:py-4 min-w-[60px] md:min-w-[80px]"
                style={GLASS_CARD}
              >
                <span
                  className="text-2xl md:text-4xl block leading-none"
                  style={{ color: "var(--wed-accent-gold)", fontFamily: "'Playfair Display', serif" }}
                >
                  {String(unit.value).padStart(2, "0")}
                </span>
                <span
                  className="text-[9px] md:text-[10px] tracking-widest mt-1 block"
                  style={{ color: "hsl(var(--wed-muted-fg))" }}
                >
                  {unit.label}
                </span>
              </div>
              {idx < units.length - 1 && (
                <span className="text-lg md:text-2xl font-light" style={{ color: "var(--wed-gold-glow)" }}>
                  :
                </span>
              )}
            </div>
          ))}
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <motion.div
            className="w-px h-12 mx-auto"
            style={{
              background: `linear-gradient(to bottom, var(--wed-accent-gold), transparent)`,
              opacity: 0.6,
            }}
            animate={{ scaleY: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </section>
  );
});

export default CoverSection;
