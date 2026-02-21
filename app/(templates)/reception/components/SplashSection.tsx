"use client";

import { memo, useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { MapPin } from "lucide-react";
import type { ReceptionData } from "./types";

interface Props {
  data: ReceptionData;
}

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

function CountBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className="text-3xl md:text-4xl font-light tabular-nums"
        style={{
          color: "var(--rec-accent)",
          fontFamily: "'Cormorant Garamond', serif",
          animation: "rec-count-glow 4s ease-in-out infinite",
        }}
      >
        {String(value).padStart(2, "0")}
      </span>
      <span
        className="text-[8px] mt-1 tracking-[0.35em] uppercase"
        style={{ color: "hsl(var(--rec-muted-fg))", fontFamily: "'DM Sans', sans-serif" }}
      >
        {label}
      </span>
    </div>
  );
}

const SplashSection = memo(function SplashSection({ data }: Props) {
  const cd = useCountdown(data.receptionDate);
  const [taps, setTaps] = useState(0);
  const [easterEgg, setEasterEgg] = useState(false);

  const handlePhotoTap = useCallback(() => {
    setTaps((p) => {
      const next = p + 1;
      if (next >= 7) setEasterEgg(true);
      return next;
    });
  }, []);

  const dateStr = useMemo(() => {
    const d = new Date(data.receptionDate);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  }, [data.receptionDate]);

  const timeStr = useMemo(() => {
    const d = new Date(data.receptionDate);
    return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
  }, [data.receptionDate]);

  return (
    <section className="h-screen relative flex items-end lg:items-center justify-center overflow-hidden">
      <div className="absolute inset-0" onClick={handlePhotoTap}>
        <Image
          src={data.heroImage}
          alt="Couple"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(11,15,26,0.65) 0%, rgba(11,15,26,0.55) 20%, rgba(11,15,26,0.7) 50%, rgba(11,15,26,0.92) 80%, rgba(11,15,26,0.98) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 text-center px-5 pb-24 lg:pb-0 max-w-2xl mx-auto w-full">
        <motion.p
          className="text-[9px] md:text-[10px] tracking-[0.6em] uppercase mb-6"
          style={{ color: "var(--rec-rose)", fontFamily: "'DM Sans', sans-serif" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Reception Evening
        </motion.p>

        <motion.div
          className="mb-5"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
        >
          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-light leading-[0.9] mb-2"
            style={{ color: "hsl(var(--rec-fg))", fontFamily: "'Cormorant Garamond', serif" }}
          >
            {data.brideName}
          </h1>
          <motion.span
            className="inline-block text-2xl md:text-3xl my-1"
            style={{
              color: "var(--rec-accent)",
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
            }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            &amp;
          </motion.span>
          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-light leading-[0.9]"
            style={{ color: "hsl(var(--rec-fg))", fontFamily: "'Cormorant Garamond', serif" }}
          >
            {data.groomName}
          </h1>
        </motion.div>

        <motion.p
          className="text-sm md:text-base italic mb-8"
          style={{
            color: "var(--rec-accent-light)",
            fontFamily: "'Cormorant Garamond', serif",
            opacity: 0.65,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.65 }}
          transition={{ delay: 0.8 }}
        >
          {data.tagline}
        </motion.p>

        <motion.div
          className="flex items-center justify-center gap-6 md:gap-8 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <CountBlock value={cd.days} label="Days" />
          <span className="text-lg font-light" style={{ color: "rgba(212,165,116,0.25)" }}>·</span>
          <CountBlock value={cd.hours} label="Hours" />
          <span className="text-lg font-light" style={{ color: "rgba(212,165,116,0.25)" }}>·</span>
          <CountBlock value={cd.minutes} label="Min" />
          <span className="text-lg font-light" style={{ color: "rgba(212,165,116,0.25)" }}>·</span>
          <CountBlock value={cd.seconds} label="Sec" />
        </motion.div>

        <motion.div
          className="flex flex-col items-center gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <p
            className="text-xs tracking-wider"
            style={{ color: "var(--rec-accent)", fontFamily: "'DM Sans', sans-serif" }}
          >
            {dateStr} · {timeStr}
          </p>
          <p className="flex items-center gap-1 text-[11px]" style={{ color: "hsl(var(--rec-muted-fg))" }}>
            <MapPin size={10} /> {data.venue}, {data.venueAddress.split(",").pop()?.trim()}
          </p>
        </motion.div>
      </div>

      {easterEgg && (
        <motion.div
          className="absolute bottom-28 left-0 right-0 text-center px-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p
            className="text-xs italic"
            style={{ color: "var(--rec-rose)", fontFamily: "'Cormorant Garamond', serif" }}
          >
            &ldquo;In your eyes, I found my home. In your heart, I found my love.&rdquo;
          </p>
        </motion.div>
      )}
    </section>
  );
});

export default SplashSection;
