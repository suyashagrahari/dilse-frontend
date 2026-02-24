"use client";

import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Sparkles } from "lucide-react";
import Image from "next/image";

interface WelcomeOverlayProps {
  senderName: string;
  recipientName: string;
  onEnter: (playMusic: boolean) => void;
}

// Fewer blobs, no JS animation — use CSS class holi-powder-blob
const COLOR_POWDER = [
  { color: "#FF6B9D", x: "8%",  y: "12%", size: 110, dur: "7s",  del: "0s" },
  { color: "#A855F7", x: "78%", y: "8%",  size: 95,  dur: "9s",  del: "0.6s" },
  { color: "#FF8C42", x: "80%", y: "70%", size: 105, dur: "8s",  del: "1.1s" },
];

// Fixed ring sizes — animate with scale (GPU-composited, no layout reflow)
const RINGS = [
  { color: "rgba(255,107,157,0.28)", size: 280 },
  { color: "rgba(168,85,247,0.18)",  size: 400 },
  { color: "rgba(255,140,66,0.14)",  size: 520 },
  { color: "rgba(56,189,248,0.10)",  size: 640 },
];

const WelcomeOverlay = memo(function WelcomeOverlay({
  senderName,
  recipientName,
  onEnter,
}: WelcomeOverlayProps) {
  const [exiting, setExiting] = useState(false);

  const handleEnter = (playMusic: boolean) => {
    setExiting(true);
    setTimeout(() => onEnter(playMusic), 500);
  };

  const isGeneral = !recipientName.trim();

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          style={{ background: "hsl(var(--holi-bg))" }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
        >
          {/* Background hero — subtle */}
          <div className="absolute inset-0 pointer-events-none">
            <Image
              src="/assets/Holi/hero_holi.png"
              alt=""
              fill
              className="object-cover object-center"
              sizes="100vw"
              style={{ opacity: 0.05 }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at center, transparent 0%, hsl(var(--holi-bg)) 68%)",
              }}
            />
          </div>

          {/* Color powder blobs — CSS animated, no JS loop */}
          {COLOR_POWDER.map((p, i) => (
            <div
              key={i}
              className="holi-powder-blob"
              style={{
                width: p.size,
                height: p.size,
                left: p.x,
                top: p.y,
                background: `radial-gradient(circle, ${p.color}38 0%, ${p.color}00 70%)`,
                filter: "blur(24px)",
                "--dur": p.dur,
                "--del": p.del,
              } as React.CSSProperties}
            />
          ))}

          {/* Expanding rings — fixed size + scale transform (GPU-composited) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {RINGS.map((r, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{ border: `1.5px solid ${r.color}`, width: r.size, height: r.size }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1], opacity: [0, 0.9, 0] }}
                transition={{
                  duration: 2.6,
                  repeat: Infinity,
                  delay: 0.6 + i * 0.65,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>

          {/* Main content */}
          <div className="relative z-10 text-center px-6 max-w-md mx-auto flex flex-col items-center">

            {/* Central icon */}
            <motion.div
              className="relative mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 160, damping: 14, delay: 0.1 }}
            >
              {/* Glow ring — CSS rotate, no JS loop */}
              <div
                className="absolute -inset-5 rounded-full"
                style={{
                  background:
                    "conic-gradient(from 0deg, #FF6B9D, #FF8C42, #FFD700, #4CAF50, #38BDF8, #A855F7, #FF6B9D)",
                  filter: "blur(16px)",
                  opacity: 0.22,
                  animation: "holi-disc-spin 10s linear infinite",
                  willChange: "transform",
                }}
              />
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center relative"
                style={{
                  background: "var(--holi-glass)",
                  backdropFilter: "blur(20px)",
                  border: "2px solid rgba(255,255,255,0.15)",
                  boxShadow:
                    "0 0 36px rgba(255,107,157,0.22), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
              >
                <span className="text-4xl" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))" }}>
                  🎨
                </span>
              </div>
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-5"
              style={{
                background: "var(--holi-glass)",
                backdropFilter: "blur(16px)",
                border: "1px solid var(--holi-glass-border)",
              }}
            >
              <Sparkles size={12} style={{ color: "var(--holi-pink)" }} />
              <span
                className="text-[10px] font-bold uppercase tracking-[0.25em] holi-text-gradient"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Festival of Colors
              </span>
              <Sparkles size={12} style={{ color: "var(--holi-orange)" }} />
            </motion.div>

            {/* Hindi greeting */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
              className="text-5xl sm:text-6xl font-bold mb-3 pt-2 leading-tight"
              style={{
                fontFamily: "'Noto Serif Devanagari', serif",
                color: "transparent",
                backgroundImage:
                  "linear-gradient(135deg, #FF6B9D 0%, #FFD700 35%, #FF8C00 65%, #FF6B9D 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                filter: "drop-shadow(0 2px 20px rgba(255,107,157,0.4))",
              }}
            >
              होली मुबारक
            </motion.h1>

            {/* English greeting */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="text-xl sm:text-2xl font-bold mb-1.5"
              style={{ color: "hsl(var(--holi-fg))", fontFamily: "'Outfit', sans-serif" }}
            >
              {isGeneral ? "Happy Holi to All! 🌈" : `Happy Holi, ${recipientName}! 🌈`}
            </motion.p>

            {/* From sender */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="text-sm mb-5"
              style={{ color: "hsl(var(--holi-muted-fg))", fontFamily: "'DM Sans', sans-serif" }}
            >
              {senderName ? (
                <>A colorful greeting from{" "}
                <span className="font-bold holi-text-gradient">{senderName}</span></>
              ) : "A festive Holi greeting for everyone"}
            </motion.p>

            {/* Rainbow divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.75, duration: 0.5, ease: "easeOut" }}
              className="w-full max-w-[200px] h-[2px] rounded-full mx-auto mb-7"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #FF6B9D, #FF8C42, #FFD700, #4CAF50, #38BDF8, #A855F7, transparent)",
              }}
            />

            {/* Music card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, type: "spring", stiffness: 220, damping: 24 }}
              className="w-full max-w-xs rounded-3xl p-6 relative overflow-hidden"
              style={{
                background: "var(--holi-glass)",
                backdropFilter: "blur(24px)",
                border: "1px solid var(--holi-glass-border)",
                boxShadow: "0 16px 48px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-[2px] rounded-t-3xl"
                style={{
                  background:
                    "linear-gradient(90deg, #FF6B9D, #FF8C42, #FFD700, #A855F7, #38BDF8)",
                }}
              />

              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-lg">🎵</span>
                <p
                  className="text-[13px] font-semibold"
                  style={{ color: "hsl(var(--holi-fg) / 0.85)", fontFamily: "'DM Sans', sans-serif" }}
                >
                  Festive Background Music
                </p>
              </div>

              <p
                className="text-[11px] mb-5 leading-relaxed"
                style={{ color: "hsl(var(--holi-muted-fg))", fontFamily: "'DM Sans', sans-serif" }}
              >
                Enhance your experience with traditional Holi melodies
              </p>

              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEnter(true)}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[13px] font-bold transition-all"
                  style={{
                    background: "var(--holi-gradient-cta)",
                    color: "#fff",
                    boxShadow: "0 6px 22px var(--holi-pink-glow)",
                  }}
                >
                  <Volume2 size={15} />
                  Play &amp; Enter
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEnter(false)}
                  className="flex-[0.65] inline-flex items-center justify-center gap-1.5 py-3.5 rounded-2xl text-[13px] font-semibold transition-all"
                  style={{
                    background: "hsl(var(--holi-surface))",
                    color: "hsl(var(--holi-muted-fg))",
                    border: "1px solid hsl(var(--holi-border))",
                  }}
                >
                  Skip
                </motion.button>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="mt-6 text-[9px] tracking-wider uppercase"
              style={{
                color: "hsl(var(--holi-muted-fg) / 0.4)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Made with ❤️ for the Festival of Colors
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default WelcomeOverlay;
