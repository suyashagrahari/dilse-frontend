"use client";

import { memo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Heart, ChevronRight } from "lucide-react";
import Image from "next/image";
import type { HoliData } from "./types";

const HOLI_QUOTES = [
  "May the colors of Holi paint your life with love and joy.",
  "Holi is a time of togetherness, a time to celebrate life's colors.",
  "May the magic of colors bring happiness to every corner of your world.",
  "Wishing you love, laughter, and a rainbow of blessings.",
  "May the festival of colors fill every day with vibrant possibilities.",
];

interface WishProps {
  data: HoliData;
  onGoGreetings?: () => void;
}

const WishSection = memo(function WishSection({ data, onGoGreetings }: WishProps) {
  const [quoteIdx, setQuoteIdx] = useState(0);

  useEffect(() => {
    const iv = setInterval(
      () => setQuoteIdx((i) => (i + 1) % HOLI_QUOTES.length),
      6000
    );
    return () => clearInterval(iv);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-screen flex flex-col relative overflow-y-auto overflow-x-hidden"
    >
      {/* Full background image with low opacity */}
      <div className="absolute inset-0 pointer-events-none">
        <Image
          src="/assets/Holi/holi_wish.png"
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
          style={{ opacity: 0.7 }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, hsl(var(--holi-bg) / 0.5) 0%, hsl(var(--holi-bg) / 0.7) 30%, hsl(var(--holi-bg) / 0.55) 60%, hsl(var(--holi-bg) / 0.5) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 30% 20%, var(--holi-pink)12 0%, transparent 55%), radial-gradient(ellipse at 70% 70%, var(--holi-purple)08 0%, transparent 50%)`,
          }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center relative z-10 pb-28 lg:pb-10 lg:max-w-2xl lg:mx-auto lg:w-full">

        {/* Overlaid greeting text (was on hero image, now on full bg) */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="w-full flex flex-col items-center justify-center pt-10 pb-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.25, type: "spring", stiffness: 180 }}
            className="text-center px-4"
          >
            <div
              className="text-4xl sm:text-5xl font-bold drop-shadow-2xl pt-2 leading-tight"
              style={{
                fontFamily: "'Noto Serif Devanagari', serif",
                color: "transparent",
                backgroundImage: "linear-gradient(135deg, #FF6B9D, #FFD700, #FF8C00)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                filter: "drop-shadow(0 2px 18px rgba(255,107,157,0.55))",
              }}
            >
              होली मुबारक
            </div>
            <p
              className="text-sm font-semibold mt-1 drop-shadow-lg"
              style={{
                fontFamily: "'Outfit', sans-serif",
                color: "hsl(var(--holi-fg) / 0.85)",
                textShadow: "0 1px 10px rgba(0,0,0,0.3)",
              }}
            >
              Happy Holi 🌈
            </p>
          </motion.div>
        </motion.div>

        {/* Content below image */}
        <div className="w-full flex flex-col items-center px-5 pt-2">

          {/* Happy Holi label */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 mb-3"
          >
            <span className="text-base">🎨</span>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] holi-text-gradient">
              Happy Holi
            </p>
            <span className="text-base">🎨</span>
          </motion.div>

          {/* Sender name */}
          {data.senderName && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-base sm:text-lg font-bold text-center mb-3"
              style={{ color: "hsl(var(--holi-fg))" }}
            >
              {data.senderName}
            </motion.p>
          )}

          {/* Photo avatar */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.35 }}
            className="relative mb-4"
          >
           
            <div
              className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden relative shadow-2xl flex items-center justify-center"
              style={{
                background: "var(--holi-gradient-primary)",
                boxShadow: "0 0 40px var(--holi-pink-glow), 0 0 80px var(--holi-purple-glow)",
              }}
            >
              {data.senderPhoto ? (
                <img src={data.senderPhoto} alt={data.senderName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">🎨</span>
              )}
            </div>
            <motion.span
              animate={{ y: [-4, 4, -4], x: [-2, 2, -2] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-2 -right-1 text-base drop-shadow"
            >
              ✨
            </motion.span>
            
          </motion.div>

          {/* Family subtitle */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="flex items-center gap-2 mb-2"
          >
            <div className="h-px w-10" style={{ background: "var(--holi-gradient-primary)", opacity: 0.4 }} />
            <p className="text-xs font-medium flex items-center gap-1.5" style={{ color: "hsl(var(--holi-muted-fg))" }}>
              {data.senderFamily || "Happy Holi"}{" "}
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ color: "var(--holi-pink)" }}
              >
                <Heart size={10} className="fill-current" />
              </motion.span>
            </p>
            <div className="h-px w-10" style={{ background: "var(--holi-gradient-primary)", opacity: 0.4 }} />
          </motion.div>

          {/* Family members */}
          {data.senderMembers.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-1.5 mb-4"
            >
              {data.senderMembers.map((m, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2.5 py-1 rounded-full font-medium backdrop-blur-md"
                  style={{
                    background: "var(--holi-purple)10",
                    color: "var(--holi-purple)",
                    border: "1px solid var(--holi-purple)20",
                  }}
                >
                  {m.name} &bull; {m.relation}
                </span>
              ))}
            </motion.div>
          )}

          {/* Recipient or General heading */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52 }}
            className="mb-3 text-center"
          >
            {data.recipientName ? (
              <p className="text-sm font-semibold" style={{ color: "hsl(var(--holi-fg))" }}>
                Dear{" "}
                <span style={{ color: "var(--holi-pink)", fontWeight: 700 }}>{data.recipientName}</span>
                , 🎨
              </p>
            ) : (
              <p className="text-xs font-medium" style={{ color: "hsl(var(--holi-muted-fg))" }}>
                🌈 For All My Friends &amp; Family
              </p>
            )}
          </motion.div>

          {/* Message glass card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="w-full max-w-sm lg:max-w-lg mb-4 rounded-2xl p-4"
            style={{
              background: "var(--holi-glass)",
              backdropFilter: "blur(24px)",
              border: "1px solid var(--holi-glass-border)",
              boxShadow: "var(--holi-glass-shadow)",
            }}
          >
            <motion.span
              className="block text-center text-sm mb-2"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{ color: "var(--holi-pink)", opacity: 0.6 }}
            >
              <Sparkles size={14} className="mx-auto" />
            </motion.span>
            <p
              className="text-sm leading-relaxed text-center"
              style={{ color: "hsl(var(--holi-fg) / 0.85)", fontFamily: "'DM Sans', sans-serif" }}
            >
              {data.congratsMessage}
            </p>
          </motion.div>

          {/* Signature */}
          <div className="w-full max-w-sm lg:max-w-md px-5 py-2 mb-4 text-center">
            <p className="text-sm italic font-semibold holi-text-gradient">
              {data.recipientName ? "With colorful wishes," : "Happy Holi to all,"}
            </p>
            {data.senderName && (
              <p className="text-xs font-bold mt-0.5" style={{ color: "hsl(var(--holi-fg))" }}>
                {data.senderName} 🎨
              </p>
            )}
          </div>

          {/* Rotating quote */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.75 }}
            className="mb-5 px-4"
          >
            <p
              className="text-[11px] lg:text-sm italic text-center"
              style={{ color: "hsl(var(--holi-muted-fg))" }}
            >
              &ldquo;{HOLI_QUOTES[quoteIdx]}&rdquo;{" "}
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="inline-block"
              >
                🌈
              </motion.span>
            </p>
          </motion.div>

          {/* CTA Button */}
          {onGoGreetings && (
            <motion.button
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.85 }}
              onClick={onGoGreetings}
              className="inline-flex items-center justify-center gap-1.5 px-8 py-3 lg:py-3.5 rounded-2xl font-semibold text-xs lg:text-sm active:scale-95 transition-transform shadow-lg"
              style={{
                background: "var(--holi-gradient-cta)",
                color: "#fff",
                boxShadow: "0 6px 20px var(--holi-pink-glow)",
              }}
            >
              Explore Holi Greetings <ChevronRight size={14} />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
});

export default WishSection;
