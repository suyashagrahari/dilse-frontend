"use client";

import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BROWN = "#5D3F31";
const COPPER = "#AD684A";
const WARM = "rgb(108, 74, 46)";
const WARM_DIM = "rgba(108, 74, 46, 0.58)";
const SCRIPT = "'Great Vibes', cursive";
const SERIF = "'Cormorant Garamond', Georgia, serif";

interface Props {
  senderName: string;
  recipientName: string;
  sharePhoto?: string;
  onEnter: (playMusic: boolean) => void;
}

const FLOATIES = [
  { emoji: "🎈", x: "6%",  y: "10%", delay: 0,    dur: 4.5, size: 24 },
  { emoji: "🎉", x: "82%", y: "7%",  delay: 0.35, dur: 5.2, size: 20 },
  { emoji: "✨", x: "3%",  y: "55%", delay: 0.7,  dur: 3.8, size: 18 },
  { emoji: "🎂", x: "88%", y: "52%", delay: 0.15, dur: 5.0, size: 22 },
  { emoji: "🎊", x: "48%", y: "3%",  delay: 0.55, dur: 4.3, size: 20 },
  { emoji: "🌸", x: "15%", y: "82%", delay: 0.9,  dur: 4.7, size: 18 },
  { emoji: "✨", x: "75%", y: "80%", delay: 0.4,  dur: 4.0, size: 16 },
  { emoji: "🎈", x: "62%", y: "90%", delay: 1.1,  dur: 5.5, size: 20 },
];

const BirthdayWelcomeOverlay = memo(function BirthdayWelcomeOverlay({
  senderName,
  recipientName,
  sharePhoto,
  onEnter,
}: Props) {
  const [exiting, setExiting] = useState(false);

  const handleEnter = (playMusic: boolean) => {
    setExiting(true);
    setTimeout(() => onEnter(playMusic), 650);
  };

  const displayName = recipientName || "You";

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{
            position: "fixed", inset: 0, zIndex: 300,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "24px 20px",
            overflow: "hidden",
          }}
        >
          <style>{`@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap');`}</style>

          {/* Background: kraft paper texture + dark overlay */}
          <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://cdn.subhsandesh.in/gifts-media/assets/Birthday1/backgorundImage.webp"
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            <div style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(ellipse at 50% 50%, rgba(40,18,6,0.20) 0%, rgba(28,12,4,0.58) 100%)",
            }} />
          </div>

          {/* Floating birthday decorations */}
          {FLOATIES.map((f, i) => (
            <motion.div
              key={i}
              style={{
                position: "absolute",
                left: f.x, top: f.y,
                fontSize: f.size,
                pointerEvents: "none",
                zIndex: 1,
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.75, y: [0, -12, 0], rotate: [0, 10, -7, 0] }}
              transition={{ duration: f.dur, repeat: Infinity, ease: "easeInOut", delay: f.delay }}
            >
              {f.emoji}
            </motion.div>
          ))}

          {/* Card */}
          <motion.div
            initial={{ scale: 0.86, opacity: 0, y: 22 }}
            animate={{ scale: 1,    opacity: 1, y: 0  }}
            transition={{ type: "spring", stiffness: 175, damping: 18, delay: 0.1 }}
            style={{
              width: "100%", maxWidth: 348,
              borderRadius: 26,
              background: "rgba(252, 248, 242, 0.97)",
              boxShadow: "0 32px 90px rgba(20,8,2,0.55), inset 0 1.5px 0 rgba(255,255,255,0.75)",
              padding: "0 0 30px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
              zIndex: 2,
            }}
          >
            {/* Top gradient bar */}
            <div style={{
              height: 5,
              background: `linear-gradient(90deg, transparent, ${COPPER}, ${BROWN}, ${COPPER}, transparent)`,
              borderRadius: "26px 26px 0 0",
              marginBottom: 28,
            }} />

            {/* Photo or cake icon */}
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.28 }}
              style={{ marginBottom: 18 }}
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
                    border: `3px solid rgba(173,104,74,0.40)`,
                    boxShadow: `0 0 0 5px rgba(173,104,74,0.12), 0 8px 32px rgba(93,63,49,0.28)`,
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
                  animate={{ scale: [1, 1.10, 1] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    width: 72, height: 72, borderRadius: "50%",
                    background: `rgba(173,104,74,0.10)`,
                    border: `1.5px solid rgba(173,104,74,0.22)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto",
                    boxShadow: `0 0 32px rgba(173,104,74,0.22)`,
                  }}
                >
                  <span style={{ fontSize: 36, lineHeight: 1 }}>🎂</span>
                </motion.div>
              )}
            </motion.div>

            {/* "A birthday surprise for" tag */}
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42 }}
              style={{
                fontFamily: SERIF, fontSize: 11, fontWeight: 600,
                color: WARM_DIM, letterSpacing: "0.14em",
                textTransform: "uppercase" as const,
                margin: "0 0 10px",
              }}
            >
              A birthday surprise for
            </motion.p>

            {/* Recipient name */}
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.52, duration: 0.6 }}
              style={{
                fontFamily: SCRIPT, fontSize: 38, fontWeight: 400, color: BROWN,
                margin: "0 0 8px", lineHeight: 1.1,
                textShadow: "0 2px 10px rgba(93,63,49,0.16)",
                padding: "0 20px",
              }}
            >
              {displayName} 🎂
            </motion.h1>

            {/* From line */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.68 }}
              style={{
                fontFamily: SERIF, fontStyle: "italic", fontSize: 14,
                color: WARM_DIM, margin: "0 0 24px", lineHeight: 1.6,
                padding: "0 24px",
              }}
            >
              with love from{" "}
              <span style={{ color: COPPER, fontStyle: "normal", fontWeight: 600 }}>
                {senderName || "someone special"}
              </span>
            </motion.p>

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.78, duration: 0.5 }}
              style={{
                height: 1, width: "78%", margin: "0 auto 22px",
                background: `linear-gradient(90deg, transparent, rgba(173,104,74,0.35), transparent)`,
                borderRadius: 999,
              }}
            />

            {/* Music card */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.88, type: "spring", stiffness: 220, damping: 22 }}
              style={{
                borderRadius: 16,
                border: `1px solid rgba(173,104,74,0.18)`,
                background: "rgba(173,104,74,0.06)",
                padding: "14px 18px",
                margin: "0 20px 20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginBottom: 6 }}>
                <motion.span
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  style={{ fontSize: 18 }}
                >
                  🎵
                </motion.span>
                <span style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600, color: WARM }}>
                  Birthday background music
                </span>
              </div>
              <p style={{
                fontFamily: SERIF, fontStyle: "italic", fontSize: 12,
                color: WARM_DIM, margin: 0, lineHeight: 1.6,
              }}>
                Let the birthday vibes play softly in the background
              </p>
            </motion.div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.02 }}
              style={{ display: "flex", gap: 10, padding: "0 20px" }}
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleEnter(true)}
                style={{
                  flex: 1, padding: "13px 0", borderRadius: 999, border: "none",
                  background: `linear-gradient(135deg, ${COPPER}, ${BROWN})`,
                  fontFamily: SERIF, fontSize: 14, fontWeight: 700,
                  color: "rgba(252,248,242,0.96)",
                  cursor: "pointer",
                  boxShadow: `0 6px 22px rgba(93,63,49,0.34)`,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  letterSpacing: "0.02em",
                }}
              >
                ♫ Play &amp; Enter
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleEnter(false)}
                style={{
                  flex: "0 0 auto", padding: "13px 20px", borderRadius: 999,
                  border: `1.5px solid rgba(173,104,74,0.28)`,
                  background: "rgba(252,248,242,0.50)",
                  fontFamily: SERIF, fontSize: 14, fontWeight: 600,
                  color: WARM_DIM, cursor: "pointer",
                }}
              >
                Skip
              </motion.button>
            </motion.div>

            {/* Footer */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.28 }}
              style={{
                fontFamily: SERIF, fontStyle: "italic", fontSize: 10,
                color: "rgba(108,74,46,0.32)",
                margin: "16px 0 0", letterSpacing: "0.05em",
              }}
            >
              made with love 🎂
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default BirthdayWelcomeOverlay;
