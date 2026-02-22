"use client";

import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Sparkles } from "lucide-react";
import Image from "next/image";

interface WelcomeOverlayProps {
  senderName: string;
  recipientName: string;
  onEnter: (playMusic: boolean) => void;
}

const RING_COLORS = [
  "rgba(255,107,157,0.3)",
  "rgba(168,85,247,0.2)",
  "rgba(255,140,66,0.15)",
  "rgba(56,189,248,0.12)",
];

const COLOR_POWDER = [
  { color: "#FF6B9D", x: "15%", y: "18%", size: 120 },
  { color: "#A855F7", x: "80%", y: "12%", size: 100 },
  { color: "#FF8C42", x: "8%", y: "75%", size: 90 },
  { color: "#38BDF8", x: "85%", y: "70%", size: 110 },
  { color: "#FFD700", x: "50%", y: "8%", size: 80 },
  { color: "#4CAF50", x: "45%", y: "85%", size: 70 },
];

const WelcomeOverlay = memo(function WelcomeOverlay({
  senderName,
  recipientName,
  onEnter,
}: WelcomeOverlayProps) {
  const [exiting, setExiting] = useState(false);

  const handleEnter = (playMusic: boolean) => {
    setExiting(true);
    setTimeout(() => onEnter(playMusic), 700);
  };

  const displayName = recipientName || "You";

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          style={{ background: "hsl(var(--holi-bg))" }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* Background hero image - very subtle */}
          <div className="absolute inset-0 pointer-events-none">
            <Image
              src="/assets/Holi/hero_holi.png"
              alt=""
              fill
              className="object-cover object-center"
              sizes="100vw"
              style={{ opacity: 0.06 }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at center, transparent 0%, hsl(var(--holi-bg)) 70%)",
              }}
            />
          </div>

          {/* Color powder bursts */}
          {COLOR_POWDER.map((p, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: p.size,
                height: p.size,
                left: p.x,
                top: p.y,
                background: `radial-gradient(circle, ${p.color}40 0%, ${p.color}00 70%)`,
                filter: "blur(30px)",
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0.8, 1.2, 0.9, 1.1, 0.8],
                opacity: [0.4, 0.7, 0.5, 0.65, 0.4],
              }}
              transition={{
                scale: { duration: 6 + i, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 5 + i * 0.5, repeat: Infinity, ease: "easeInOut" },
                delay: i * 0.15,
              }}
            />
          ))}

          {/* Expanding rings from center */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {RING_COLORS.map((color, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  border: `1.5px solid ${color}`,
                }}
                initial={{ width: 0, height: 0, opacity: 0 }}
                animate={{
                  width: [0, 300 + i * 120],
                  height: [0, 300 + i * 120],
                  opacity: [0, 0.6, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: 1 + i * 0.6,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>

          {/* Main content */}
          <div className="relative z-10 text-center px-6 max-w-md mx-auto flex flex-col items-center">

            {/* Central Holi splash */}
            <motion.div
              className="relative mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 160, damping: 12, delay: 0.15 }}
            >
              {/* Outer glow ring */}
              <motion.div
                className="absolute -inset-5 rounded-full"
                style={{
                  background:
                    "conic-gradient(from 0deg, #FF6B9D, #FF8C42, #FFD700, #4CAF50, #38BDF8, #A855F7, #FF6B9D)",
                  filter: "blur(18px)",
                  opacity: 0.25,
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
              {/* Inner circle */}
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center relative"
                style={{
                  background: "var(--holi-glass)",
                  backdropFilter: "blur(20px)",
                  border: "2px solid rgba(255,255,255,0.15)",
                  boxShadow:
                    "0 0 40px rgba(255,107,157,0.25), 0 0 80px rgba(168,85,247,0.15), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
              >
                <motion.span
                  className="text-4xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))" }}
                >
                  🎨
                </motion.span>
              </div>
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
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

            {/* Hindi greeting - large */}
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
              className="text-5xl sm:text-6xl font-bold mb-3 pt-2 leading-tight"
              style={{
                fontFamily: "'Noto Serif Devanagari', serif",
                color: "transparent",
                backgroundImage:
                  "linear-gradient(135deg, #FF6B9D 0%, #FFD700 35%, #FF8C00 65%, #FF6B9D 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                filter: "drop-shadow(0 3px 25px rgba(255,107,157,0.45))",
              }}
            >
              होली मुबारक
            </motion.h1>

            {/* English greeting */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-xl sm:text-2xl font-bold mb-1.5"
              style={{
                color: "hsl(var(--holi-fg))",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              Happy Holi, {displayName}! 🌈
            </motion.p>

            {/* From sender */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85 }}
              className="text-sm mb-5"
              style={{
                color: "hsl(var(--holi-muted-fg))",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              A colorful greeting from{" "}
              <span className="font-bold holi-text-gradient">{senderName}</span>
            </motion.p>

            {/* Rainbow line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.95, duration: 0.6, ease: "easeOut" }}
              className="w-full max-w-[200px] h-[2px] rounded-full mx-auto mb-7"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #FF6B9D, #FF8C42, #FFD700, #4CAF50, #38BDF8, #A855F7, transparent)",
              }}
            />

            {/* Music card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.05, type: "spring", stiffness: 200, damping: 22 }}
              className="w-full max-w-xs rounded-3xl p-6 relative overflow-hidden"
              style={{
                background: "var(--holi-glass)",
                backdropFilter: "blur(28px)",
                border: "1px solid var(--holi-glass-border)",
                boxShadow:
                  "0 20px 60px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              {/* Subtle gradient accent on card */}
              <div
                className="absolute inset-x-0 top-0 h-[2px] rounded-t-3xl"
                style={{
                  background:
                    "linear-gradient(90deg, #FF6B9D, #FF8C42, #FFD700, #A855F7, #38BDF8)",
                }}
              />

              <div className="flex items-center justify-center gap-2 mb-3">
                <motion.span
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-lg"
                >
                  🎵
                </motion.span>
                <p
                  className="text-[13px] font-semibold"
                  style={{
                    color: "hsl(var(--holi-fg) / 0.85)",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Festive Background Music
                </p>
              </div>

              <p
                className="text-[11px] mb-5 leading-relaxed"
                style={{
                  color: "hsl(var(--holi-muted-fg))",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Enhance your experience with traditional Holi melodies
              </p>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleEnter(true)}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[13px] font-bold transition-all"
                  style={{
                    background: "var(--holi-gradient-cta)",
                    color: "#fff",
                    boxShadow: "0 8px 28px var(--holi-pink-glow)",
                  }}
                >
                  <Volume2 size={15} />
                  Play & Enter
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
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

            {/* Tiny credit */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
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
