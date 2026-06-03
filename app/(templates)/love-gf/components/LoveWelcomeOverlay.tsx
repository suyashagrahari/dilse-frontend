"use client";

import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CURSIVE = "'Dancing Script', 'Brush Script MT', cursive";
const WARM = "rgb(108, 74, 46)";
const WARM_DIM = "rgba(108, 74, 46, 0.60)";

interface LoveWelcomeOverlayProps {
  senderName: string;
  recipientName: string;
  sharePhoto?: string;
  onEnter: (playMusic: boolean) => void;
}

const PETALS = [
  { emoji: "🌸", x: "8%",  y: "12%", delay: 0,    dur: 4.5 },
  { emoji: "🌹", x: "78%", y: "8%",  delay: 0.4,  dur: 5   },
  { emoji: "✿",  x: "4%",  y: "68%", delay: 0.8,  dur: 4   },
  { emoji: "🌸", x: "88%", y: "62%", delay: 0.2,  dur: 5.5 },
  { emoji: "💮", x: "45%", y: "4%",  delay: 0.6,  dur: 4.2 },
  { emoji: "✿",  x: "38%", y: "88%", delay: 1.0,  dur: 4.8 },
];

const LoveWelcomeOverlay = memo(function LoveWelcomeOverlay({
  senderName,
  recipientName,
  sharePhoto,
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
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.65, ease: "easeInOut" }}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: `
              radial-gradient(ellipse at 50% 50%, transparent 22%, rgba(28,15,6,0.45) 100%),
              url(/love/image18.webp) center / cover no-repeat
            `,
            padding: "24px 20px",
          }}
        >
          <style>{`@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;600;700&display=swap');`}</style>

          {/* Floating petal decorations */}
          {PETALS.map((p, i) => (
            <motion.div
              key={i}
              style={{
                position: "absolute",
                left: p.x, top: p.y,
                fontSize: 18,
                pointerEvents: "none",
                opacity: 0.65,
              }}
              animate={{ y: [0, -10, 0], rotate: [0, 12, -8, 0] }}
              transition={{ duration: p.dur, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
            >
              {p.emoji}
            </motion.div>
          ))}

          {/* Card */}
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 18 }}
            animate={{ scale: 1,    opacity: 1, y: 0  }}
            transition={{ type: "spring", stiffness: 180, damping: 18, delay: 0.1 }}
            style={{
              width: "100%", maxWidth: 340,
              borderRadius: 24,
              background: "rgba(250, 246, 240, 0.97)",
              boxShadow: "0 30px 80px rgba(28,15,6,0.50), 0 2px 0 rgba(255,255,255,0.6) inset",
              padding: "36px 28px 32px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Top decorative bar */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 4,
              background: "linear-gradient(90deg, transparent, rgba(180,100,80,0.45), rgba(158,126,97,0.6), rgba(180,100,80,0.45), transparent)",
              borderRadius: "24px 24px 0 0",
            }} />

            {/* Share photo or fallback heart */}
            <motion.div
              style={{ marginBottom: 16 }}
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.25 }}
            >
              {sharePhoto ? (
                <motion.div
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{ margin: "0 auto", width: 90, height: 90 }}
                >
                  <div style={{
                    width: 90, height: 90, borderRadius: "50%",
                    overflow: "hidden",
                    border: "3px solid rgba(158,126,97,0.40)",
                    boxShadow: "0 0 0 5px rgba(158,126,97,0.12), 0 8px 32px rgba(108,74,46,0.28)",
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={sharePhoto}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    width: 68, height: 68, borderRadius: "50%",
                    background: "rgba(158,126,97,0.10)",
                    border: "1.5px solid rgba(158,126,97,0.22)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto",
                    boxShadow: "0 0 28px rgba(158,126,97,0.20)",
                  }}
                >
                  <span style={{ fontSize: 34, lineHeight: 1 }}>💕</span>
                </motion.div>
              )}
            </motion.div>

            {/* "A love page for" tag */}
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                fontFamily: CURSIVE, fontSize: 12, color: WARM_DIM,
                letterSpacing: "0.08em", textTransform: "uppercase" as const,
                margin: "0 0 8px",
              }}
            >
              A love page for
            </motion.p>

            {/* Recipient name */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              style={{
                fontFamily: CURSIVE, fontSize: 34, fontWeight: 700, color: WARM,
                margin: "0 0 6px", lineHeight: 1.1,
                textShadow: "0 2px 8px rgba(108,74,46,0.14)",
              }}
            >
              {displayName} ♡
            </motion.h1>

            {/* From line */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              style={{
                fontFamily: CURSIVE, fontSize: 14, color: WARM_DIM,
                margin: "0 0 22px", lineHeight: 1.6,
              }}
            >
              with love from{" "}
              <span style={{ color: WARM, fontWeight: 700 }}>{senderName || "someone who cares"}</span>
            </motion.p>

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.75, duration: 0.5 }}
              style={{
                height: 1, margin: "0 auto 22px",
                width: "80%",
                background: "linear-gradient(90deg, transparent, rgba(158,126,97,0.35), transparent)",
                borderRadius: 999,
              }}
            />

            {/* Music card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, type: "spring", stiffness: 220, damping: 22 }}
              style={{
                borderRadius: 16,
                border: "1px solid rgba(158,126,97,0.20)",
                background: "rgba(158,126,97,0.06)",
                padding: "14px 16px",
                marginBottom: 18,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 6 }}>
                <motion.span
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  style={{ fontSize: 18 }}
                >
                  🎵
                </motion.span>
                <span style={{ fontFamily: CURSIVE, fontSize: 14, fontWeight: 700, color: WARM }}>
                  Romantic background music
                </span>
              </div>
              <p style={{
                fontFamily: CURSIVE, fontSize: 11, color: WARM_DIM,
                margin: 0, lineHeight: 1.55,
              }}>
                Set the mood with love melodies playing softly in the background
              </p>
            </motion.div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              style={{ display: "flex", gap: 10 }}
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleEnter(true)}
                style={{
                  flex: 1, padding: "13px 0", borderRadius: 999, border: "none",
                  background: "linear-gradient(135deg, rgb(158,126,97), rgb(120,85,55))",
                  fontFamily: CURSIVE, fontSize: 15, fontWeight: 700, color: "#fff",
                  cursor: "pointer",
                  boxShadow: "0 6px 20px rgba(108,74,46,0.32)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                }}
              >
                ♫ Play &amp; Enter
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleEnter(false)}
                style={{
                  flex: "0 0 auto", padding: "13px 18px", borderRadius: 999,
                  border: "1.5px solid rgba(158,126,97,0.28)",
                  background: "rgba(250,246,240,0.5)",
                  fontFamily: CURSIVE, fontSize: 14, fontWeight: 600, color: WARM_DIM,
                  cursor: "pointer",
                }}
              >
                Skip
              </motion.button>
            </motion.div>

            {/* Footer note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.25 }}
              style={{
                fontFamily: CURSIVE, fontSize: 10, color: "rgba(108,74,46,0.35)",
                margin: "16px 0 0", letterSpacing: "0.05em",
              }}
            >
              made with love ♡
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default LoveWelcomeOverlay;
