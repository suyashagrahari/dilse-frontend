"use client";

import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Sparkles } from "lucide-react";

interface LoveWelcomeOverlayProps {
  senderName: string;
  recipientName: string;
  onEnter: (playMusic: boolean) => void;
}

const HEART_PARTICLES = [
  { color: "#e11d48", x: "12%", y: "16%", size: 100 },
  { color: "#ec4899", x: "82%", y: "10%", size: 90 },
  { color: "#f43f5e", x: "6%", y: "72%", size: 85 },
  { color: "#a855f7", x: "88%", y: "65%", size: 95 },
  { color: "#fb7185", x: "50%", y: "6%", size: 70 },
  { color: "#be185d", x: "42%", y: "85%", size: 65 },
];

const RING_COLORS = [
  "rgba(225,29,72,0.2)",
  "rgba(236,72,153,0.15)",
  "rgba(168,85,247,0.1)",
  "rgba(251,113,133,0.08)",
];

const LoveWelcomeOverlay = memo(function LoveWelcomeOverlay({
  senderName,
  recipientName,
  onEnter,
}: LoveWelcomeOverlayProps) {
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
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-background"
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {HEART_PARTICLES.map((p, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: p.size,
                height: p.size,
                left: p.x,
                top: p.y,
                background: `radial-gradient(circle, ${p.color}30 0%, ${p.color}00 70%)`,
                filter: "blur(25px)",
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0.8, 1.3, 0.9, 1.15, 0.8],
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
                  duration: 3,
                  repeat: Infinity,
                  delay: 1 + i * 0.6,
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
                    "conic-gradient(from 0deg, #e11d48, #ec4899, #a855f7, #fb7185, #e11d48)",
                  filter: "blur(18px)",
                  opacity: 0.2,
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center relative"
                style={{
                  background: "rgba(225,29,72,0.08)",
                  backdropFilter: "blur(20px)",
                  border: "2px solid rgba(225,29,72,0.15)",
                  boxShadow:
                    "0 0 40px rgba(225,29,72,0.15), 0 0 80px rgba(236,72,153,0.08), inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
              >
                <motion.span
                  className="text-4xl"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  style={{ filter: "drop-shadow(0 2px 8px rgba(225,29,72,0.3))" }}
                >
                  💕
                </motion.span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-5"
              style={{
                background: "rgba(225,29,72,0.06)",
                border: "1px solid rgba(225,29,72,0.12)",
              }}
            >
              <Sparkles size={12} style={{ color: "#e11d48" }} />
              <span
                className="text-[10px] font-bold uppercase tracking-[0.25em]"
                style={{
                  color: "#e11d48",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                A Love Letter
              </span>
              <Sparkles size={12} style={{ color: "#ec4899" }} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
              className="text-4xl sm:text-5xl font-bold mb-3 leading-tight"
              style={{
                color: "transparent",
                backgroundImage:
                  "linear-gradient(135deg, #e11d48 0%, #ec4899 35%, #a855f7 65%, #e11d48 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                filter: "drop-shadow(0 3px 20px rgba(225,29,72,0.3))",
              }}
            >
              I Love You
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-xl sm:text-2xl font-bold mb-1.5 text-foreground"
            >
              Hey, {displayName}! 💗
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85 }}
              className="text-sm mb-5 text-muted-foreground"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              A special surprise from{" "}
              <span className="font-bold" style={{ color: "#e11d48" }}>{senderName}</span>
            </motion.p>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.95, duration: 0.6, ease: "easeOut" }}
              className="w-full max-w-[200px] h-[2px] rounded-full mx-auto mb-7"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #e11d48, #ec4899, #a855f7, transparent)",
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.05, type: "spring", stiffness: 200, damping: 22 }}
              className="w-full max-w-xs rounded-3xl p-6 relative overflow-hidden"
              style={{
                background: "rgba(225,29,72,0.04)",
                backdropFilter: "blur(28px)",
                border: "1px solid rgba(225,29,72,0.1)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-[2px] rounded-t-3xl"
                style={{
                  background:
                    "linear-gradient(90deg, #e11d48, #ec4899, #a855f7, #fb7185)",
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
                  className="text-[13px] font-semibold text-foreground/85"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Romantic Background Music
                </p>
              </div>

              <p
                className="text-[11px] mb-5 leading-relaxed text-muted-foreground"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Enhance your experience with beautiful love melodies
              </p>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleEnter(true)}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[13px] font-bold transition-all text-white"
                  style={{
                    background: "linear-gradient(135deg, #e11d48, #ec4899)",
                    boxShadow: "0 8px 28px rgba(225,29,72,0.25)",
                  }}
                >
                  <Volume2 size={15} />
                  Play & Enter
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleEnter(false)}
                  className="flex-[0.65] inline-flex items-center justify-center gap-1.5 py-3.5 rounded-2xl text-[13px] font-semibold transition-all text-muted-foreground"
                  style={{
                    background: "rgba(225,29,72,0.04)",
                    border: "1px solid rgba(225,29,72,0.1)",
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
              className="mt-6 text-[9px] tracking-wider uppercase text-muted-foreground/40"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Made with ❤️ just for you
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default LoveWelcomeOverlay;
