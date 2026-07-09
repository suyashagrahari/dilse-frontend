"use client";

import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Sparkles } from "lucide-react";
import Image from "next/image";

interface WeddingWelcomeOverlayProps {
  brideName: string;
  groomName: string;
  onEnter: (playMusic: boolean) => void;
}

const GLOW_PARTICLES = [
  { color: "#d4a853", x: "12%", y: "15%", size: 100 },
  { color: "#b8860b", x: "82%", y: "10%", size: 90 },
  { color: "#f5d98e", x: "6%", y: "72%", size: 80 },
  { color: "#d4a853", x: "88%", y: "68%", size: 95 },
  { color: "#cd853f", x: "50%", y: "6%", size: 70 },
];

const RING_COLORS = [
  "rgba(212,168,83,0.25)",
  "rgba(184,134,11,0.18)",
  "rgba(245,217,142,0.12)",
  "rgba(205,133,63,0.08)",
];

const WeddingWelcomeOverlay = memo(function WeddingWelcomeOverlay({
  brideName,
  groomName,
  onEnter,
}: WeddingWelcomeOverlayProps) {
  const [exiting, setExiting] = useState(false);

  const handleEnter = (playMusic: boolean) => {
    setExiting(true);
    setTimeout(() => onEnter(playMusic), 700);
  };

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          style={{ background: "hsl(var(--wed-bg))" }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <Image
              src="/assets/marriage/weeding.webp"
              alt=""
              fill
              className="object-cover object-center"
              sizes="100vw"
              style={{ opacity: 0.07 }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at center, transparent 0%, hsl(var(--wed-bg)) 70%)",
              }}
            />
          </div>

          {GLOW_PARTICLES.map((p, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: p.size,
                height: p.size,
                left: p.x,
                top: p.y,
                background: `radial-gradient(circle, ${p.color}35 0%, ${p.color}00 70%)`,
                filter: "blur(25px)",
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0.8, 1.2, 0.9, 1.1, 0.8],
                opacity: [0.3, 0.6, 0.4, 0.55, 0.3],
              }}
              transition={{
                scale: { duration: 6 + i, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 5 + i * 0.5, repeat: Infinity, ease: "easeInOut" },
                delay: i * 0.15,
              }}
            />
          ))}

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {RING_COLORS.map((color, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{ border: `1.5px solid ${color}` }}
                initial={{ width: 0, height: 0, opacity: 0 }}
                animate={{
                  width: [0, 280 + i * 110],
                  height: [0, 280 + i * 110],
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  delay: 1 + i * 0.7,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>

          <div className="relative z-10 text-center px-6 max-w-md mx-auto flex flex-col items-center">
            <motion.div
              className="relative mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 160, damping: 12, delay: 0.15 }}
            >
              <motion.div
                className="absolute -inset-5 rounded-full"
                style={{
                  background:
                    "conic-gradient(from 0deg, #d4a853, #f5d98e, #b8860b, #cd853f, #d4a853)",
                  filter: "blur(18px)",
                  opacity: 0.2,
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              />
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center relative"
                style={{
                  background: "var(--wed-glass)",
                  backdropFilter: "blur(20px)",
                  border: "2px solid rgba(212,168,83,0.25)",
                  boxShadow:
                    "0 0 40px rgba(212,168,83,0.2), 0 0 80px rgba(184,134,11,0.1), inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
              >
                <motion.span
                  className="text-4xl"
                  animate={{ rotate: [0, 8, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))" }}
                >
                  💍
                </motion.span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-5"
              style={{
                background: "var(--wed-glass)",
                backdropFilter: "blur(16px)",
                border: "1px solid var(--wed-glass-border)",
              }}
            >
              <Sparkles size={12} style={{ color: "var(--wed-accent-gold)" }} />
              <span
                className="text-[10px] font-bold uppercase tracking-[0.25em]"
                style={{
                  color: "var(--wed-accent-gold)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Wedding Celebration
              </span>
              <Sparkles size={12} style={{ color: "var(--wed-accent-gold)" }} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
              className="text-4xl sm:text-5xl font-bold mb-1 pt-2 leading-tight"
              style={{
                fontFamily: "'Noto Serif Devanagari', serif",
                color: "transparent",
                backgroundImage:
                  "linear-gradient(135deg, #d4a853 0%, #f5d98e 35%, #b8860b 65%, #d4a853 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                filter: "drop-shadow(0 3px 20px rgba(212,168,83,0.4))",
              }}
            >
              शुभ विवाह
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-xl sm:text-2xl font-bold mb-1"
              style={{
                color: "hsl(var(--wed-fg))",
                fontFamily: "'Cormorant Garamond', serif",
              }}
            >
              {groomName} & {brideName}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85 }}
              className="text-sm mb-5"
              style={{
                color: "hsl(var(--wed-muted-fg))",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              You&apos;re invited to celebrate their special day ✨
            </motion.p>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.95, duration: 0.6, ease: "easeOut" }}
              className="w-full max-w-[200px] h-[2px] rounded-full mx-auto mb-7"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #d4a853, #f5d98e, #b8860b, transparent)",
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.05, type: "spring", stiffness: 200, damping: 22 }}
              className="w-full max-w-xs rounded-3xl p-6 relative overflow-hidden"
              style={{
                background: "var(--wed-glass)",
                backdropFilter: "blur(28px)",
                border: "1px solid var(--wed-glass-border)",
                boxShadow:
                  "0 20px 60px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-[2px] rounded-t-3xl"
                style={{
                  background:
                    "linear-gradient(90deg, #d4a853, #f5d98e, #b8860b, #cd853f)",
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
                    color: "hsl(var(--wed-fg) / 0.85)",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Wedding Background Music
                </p>
              </div>

              <p
                className="text-[11px] mb-5 leading-relaxed"
                style={{
                  color: "hsl(var(--wed-muted-fg))",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Enhance your experience with beautiful wedding melodies
              </p>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleEnter(true)}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[13px] font-bold transition-all"
                  style={{
                    background: "var(--wed-gradient-gold)",
                    color: "#1a1a2e",
                    boxShadow: "0 8px 28px var(--wed-gold-glow)",
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
                    background: "hsl(var(--wed-surface))",
                    color: "hsl(var(--wed-muted-fg))",
                    border: "1px solid var(--wed-glass-border)",
                  }}
                >
                  Skip
                </motion.button>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="mt-6 text-[9px] tracking-wider uppercase"
              style={{
                color: "hsl(var(--wed-muted-fg) / 0.4)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Made with ❤️ for your special day
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default WeddingWelcomeOverlay;
