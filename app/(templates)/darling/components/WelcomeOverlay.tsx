"use client";

import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PINK    = "#ff3d6b";
const PURPLE  = "#a855f7";
const GRAD    = "linear-gradient(135deg, #ff3d6b 0%, #a855f7 100%)";
const TEXT_DIM = "rgba(255,255,255,0.50)";

interface DarlingWelcomeOverlayProps {
  senderName: string;
  recipientName: string;
  onEnter: (playMusic: boolean) => void;
}

const FLOATS = [
  { emoji: "💗", x: "8%",  y: "12%", delay: 0,   dur: 4.5 },
  { emoji: "✨", x: "78%", y: "8%",  delay: 0.4, dur: 5   },
  { emoji: "💫", x: "4%",  y: "68%", delay: 0.8, dur: 4   },
  { emoji: "💗", x: "88%", y: "62%", delay: 0.2, dur: 5.5 },
  { emoji: "⭐", x: "45%", y: "4%",  delay: 0.6, dur: 4.2 },
  { emoji: "💜", x: "38%", y: "88%", delay: 1.0, dur: 4.8 },
];

const DarlingWelcomeOverlay = memo(function DarlingWelcomeOverlay({
  senderName,
  recipientName,
  onEnter,
}: DarlingWelcomeOverlayProps) {
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
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.65, ease: "easeInOut" }}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "#0d0d1a",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "24px 20px",
          }}
        >
          {/* Floating decorations */}
          {FLOATS.map((p, i) => (
            <motion.div
              key={i}
              style={{
                position: "absolute", left: p.x, top: p.y,
                fontSize: 18, pointerEvents: "none", opacity: 0.5,
              }}
              animate={{ y: [0, -10, 0], rotate: [0, 12, -8, 0] }}
              transition={{ duration: p.dur, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
            >
              {p.emoji}
            </motion.div>
          ))}

          {/* Glow blob */}
          <div style={{
            position: "absolute",
            top: "20%", left: "50%", transform: "translateX(-50%)",
            width: 220, height: 220, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,61,107,0.18) 0%, rgba(168,85,247,0.10) 50%, transparent 70%)",
            pointerEvents: "none",
            filter: "blur(20px)",
          }} />

          {/* Main content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.55 }}
            style={{
              width: "100%", maxWidth: 360,
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 0,
            }}
          >
            {/* Glowing heart circle */}
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: 90, height: 90, borderRadius: "50%",
                background: "rgba(255,61,107,0.10)",
                border: "1.5px solid rgba(255,61,107,0.22)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 24,
                boxShadow: "0 0 40px rgba(255,61,107,0.22), 0 0 80px rgba(168,85,247,0.12)",
              }}
            >
              <span style={{ fontSize: 40, lineHeight: 1 }}>💗</span>
            </motion.div>

            {/* Badge */}
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 999, padding: "5px 14px",
              marginBottom: 16,
            }}>
              <span style={{ fontSize: 12 }}>✦</span>
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.15em",
                color: "rgba(255,255,255,0.65)", textTransform: "uppercase" as const,
              }}>
                A LOVE LETTER
              </span>
              <span style={{ fontSize: 12 }}>✦</span>
            </div>

            {/* "I Love You" title */}
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              style={{
                fontSize: "clamp(38px, 12vw, 56px)", fontWeight: 800,
                margin: "0 0 12px",
                background: GRAD,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textAlign: "center",
                lineHeight: 1.1,
              }}
            >
              I Love You
            </motion.h1>

            {/* Hey recipient + From */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                textAlign: "center", marginBottom: 20,
                background: "rgba(255,255,255,0.04)",
                borderRadius: 16, padding: "14px 24px",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fff" }}>
                Hey, {displayName}! 💗
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 14, color: TEXT_DIM }}>
                A special surprise from{" "}
                <span style={{ color: PINK, fontWeight: 700 }}>
                  {senderName || "someone special"}
                </span>
              </p>
            </motion.div>

            {/* Gradient line */}
            <motion.div
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              style={{
                width: "100%", height: 1.5, borderRadius: 999,
                background: GRAD, marginBottom: 16,
              }}
            />

            {/* Music card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              style={{
                width: "100%", borderRadius: 18,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                padding: "16px 18px",
                marginBottom: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 18 }}>🎵</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                  Romantic Background Music
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: TEXT_DIM, lineHeight: 1.5 }}>
                Enhance your experience with beautiful love melodies
              </p>
            </motion.div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85 }}
              style={{ display: "flex", gap: 10, width: "100%" }}
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleEnter(true)}
                style={{
                  flex: 1, padding: "15px 0", borderRadius: 14, border: "none",
                  background: GRAD,
                  fontSize: 15, fontWeight: 700, color: "#fff",
                  cursor: "pointer",
                  boxShadow: "0 6px 24px rgba(255,61,107,0.40)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                }}
              >
                <span style={{ fontSize: 14 }}>🔊</span> Play &amp; Enter
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleEnter(false)}
                style={{
                  flex: "0 0 auto", padding: "15px 20px", borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.06)",
                  fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.60)",
                  cursor: "pointer",
                }}
              >
                Skip
              </motion.button>
            </motion.div>

            {/* Footer */}
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              style={{
                marginTop: 20, fontSize: 11, letterSpacing: "0.12em",
                color: "rgba(255,255,255,0.25)", textTransform: "uppercase" as const,
              }}
            >
              MADE WITH 🤍 JUST FOR YOU
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default DarlingWelcomeOverlay;
