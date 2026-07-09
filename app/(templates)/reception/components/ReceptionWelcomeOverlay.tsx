"use client";

import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Sparkles } from "lucide-react";
import Image from "next/image";

interface ReceptionWelcomeOverlayProps {
  brideName: string;
  groomName: string;
  onEnter: (playMusic: boolean) => void;
}

const GLOW_PARTICLES = [
  { color: "#e8c4a0", x: "14%", y: "16%", size: 100 },
  { color: "#d4a853", x: "80%", y: "12%", size: 85 },
  { color: "#c9a96e", x: "8%", y: "74%", size: 80 },
  { color: "#e8c4a0", x: "86%", y: "66%", size: 95 },
  { color: "#b08d57", x: "48%", y: "8%", size: 70 },
];

const RING_COLORS = [
  "rgba(232,196,160,0.22)",
  "rgba(212,168,83,0.15)",
  "rgba(201,169,110,0.1)",
  "rgba(176,141,87,0.07)",
];

const ReceptionWelcomeOverlay = memo(function ReceptionWelcomeOverlay({
  brideName,
  groomName,
  onEnter,
}: ReceptionWelcomeOverlayProps) {
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
          style={{ background: "hsl(var(--rec-bg))" }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <Image
              src="/assets/Reception/reception.webp"
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
                  "radial-gradient(ellipse at center, transparent 0%, hsl(var(--rec-bg)) 70%)",
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
                background: `radial-gradient(circle, ${p.color}30 0%, ${p.color}00 70%)`,
                filter: "blur(25px)",
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0.8, 1.2, 0.9, 1.1, 0.8],
                opacity: [0.3, 0.55, 0.35, 0.5, 0.3],
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
                    "conic-gradient(from 0deg, #e8c4a0, #d4a853, #c9a96e, #b08d57, #e8c4a0)",
                  filter: "blur(18px)",
                  opacity: 0.2,
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              />
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center relative"
                style={{
                  background: "var(--rec-glass)",
                  backdropFilter: "blur(20px)",
                  border: "2px solid rgba(232,196,160,0.2)",
                  boxShadow:
                    "0 0 40px rgba(232,196,160,0.15), 0 0 80px rgba(212,168,83,0.08), inset 0 1px 0 rgba(255,255,255,0.1)",
                }}
              >
                <motion.span
                  className="text-4xl"
                  animate={{ rotate: [0, 8, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))" }}
                >
                  🥂
                </motion.span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-5"
              style={{
                background: "var(--rec-glass)",
                backdropFilter: "blur(16px)",
                border: "1px solid var(--rec-glass-border)",
              }}
            >
              <Sparkles size={12} style={{ color: "var(--rec-accent)" }} />
              <span
                className="text-[10px] font-bold uppercase tracking-[0.25em]"
                style={{
                  color: "var(--rec-accent)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Reception Celebration
              </span>
              <Sparkles size={12} style={{ color: "var(--rec-accent)" }} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
              className="text-4xl sm:text-5xl font-bold mb-1 pt-2 leading-tight"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: "transparent",
                backgroundImage:
                  "linear-gradient(135deg, #e8c4a0 0%, #d4a853 35%, #c9a96e 65%, #e8c4a0 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                filter: "drop-shadow(0 3px 20px rgba(232,196,160,0.35))",
              }}
            >
              Reception
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-xl sm:text-2xl font-bold mb-1"
              style={{
                color: "hsl(var(--rec-fg))",
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
                color: "hsl(var(--rec-muted-fg))",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Join us for an evening of love & celebration ✨
            </motion.p>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.95, duration: 0.6, ease: "easeOut" }}
              className="w-full max-w-[200px] h-[2px] rounded-full mx-auto mb-7"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #e8c4a0, #d4a853, #c9a96e, transparent)",
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.05, type: "spring", stiffness: 200, damping: 22 }}
              className="w-full max-w-xs rounded-3xl p-6 relative overflow-hidden"
              style={{
                background: "var(--rec-glass)",
                backdropFilter: "blur(28px)",
                border: "1px solid var(--rec-glass-border)",
                boxShadow:
                  "0 20px 60px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-[2px] rounded-t-3xl"
                style={{
                  background:
                    "linear-gradient(90deg, #e8c4a0, #d4a853, #c9a96e, #b08d57)",
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
                    color: "hsl(var(--rec-fg) / 0.85)",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Reception Background Music
                </p>
              </div>

              <p
                className="text-[11px] mb-5 leading-relaxed"
                style={{
                  color: "hsl(var(--rec-muted-fg))",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Enhance your experience with elegant celebration melodies
              </p>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleEnter(true)}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[13px] font-bold transition-all"
                  style={{
                    background:
                      "linear-gradient(135deg, #e8c4a0, #d4a853, #c9a96e)",
                    color: "#1a1a2e",
                    boxShadow: "0 8px 28px rgba(212,168,83,0.25)",
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
                    background: "hsl(var(--rec-surface))",
                    color: "hsl(var(--rec-muted-fg))",
                    border: "1px solid var(--rec-glass-border)",
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
                color: "hsl(var(--rec-muted-fg) / 0.4)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Made with ❤️ for your celebration
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default ReceptionWelcomeOverlay;
