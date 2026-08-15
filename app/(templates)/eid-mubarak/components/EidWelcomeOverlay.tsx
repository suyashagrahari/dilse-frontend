"use client";

import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Sparkles } from "lucide-react";
import Image from "next/image";

interface Props {
  senderName: string;
  recipientName: string;
  onEnter: (playMusic: boolean) => void;
}

const STAR_POSITIONS = [
  { x: "12%", y: "15%", size: 3, delay: 0 },
  { x: "85%", y: "10%", size: 2, delay: 0.3 },
  { x: "7%", y: "70%", size: 2.5, delay: 0.6 },
  { x: "90%", y: "65%", size: 2, delay: 0.9 },
  { x: "25%", y: "8%", size: 1.5, delay: 0.2 },
  { x: "70%", y: "80%", size: 2, delay: 0.5 },
  { x: "50%", y: "5%", size: 1.5, delay: 0.8 },
  { x: "95%", y: "40%", size: 2, delay: 1.1 },
];

const EidWelcomeOverlay = memo(function EidWelcomeOverlay({
  senderName,
  recipientName,
  onEnter,
}: Props) {
  const [exiting, setExiting] = useState(false);

  const handleEnter = (playMusic: boolean) => {
    setExiting(true);
    setTimeout(() => onEnter(playMusic), 700);
  };

  const isGeneral = !recipientName.trim();

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          style={{ background: "hsl(var(--eid-bg))" }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* Background image - subtle */}
          <div className="absolute inset-0 pointer-events-none">
            <Image
              src="https://cdn.subhsandesh.in/gifts-media/assets/Eid/hero_eid.webp"
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
                  "radial-gradient(ellipse at center, transparent 0%, hsl(var(--eid-bg)) 70%)",
              }}
            />
          </div>

          {/* Twinkling stars */}
          {STAR_POSITIONS.map((s, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: s.x,
                top: s.y,
                width: s.size,
                height: s.size,
                background: "var(--eid-gold)",
              }}
              animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.5, 1] }}
              transition={{
                duration: 2 + i * 0.3,
                repeat: Infinity,
                delay: s.delay,
              }}
            />
          ))}

          {/* Soft gold/teal glow */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 300,
              height: 300,
              background:
                "radial-gradient(circle, rgba(197,160,63,0.12) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 200,
              height: 200,
              left: "60%",
              top: "60%",
              background:
                "radial-gradient(circle, rgba(58,143,125,0.10) 0%, transparent 70%)",
              filter: "blur(30px)",
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 6, repeat: Infinity, delay: 1 }}
          />

          {/* Content */}
          <div className="relative z-10 text-center px-6 max-w-md mx-auto flex flex-col items-center">

            {/* Crescent + star icon */}
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
                    "conic-gradient(from 0deg, rgba(197,160,63,0.4), rgba(58,143,125,0.3), rgba(197,160,63,0.4))",
                  filter: "blur(16px)",
                  opacity: 0.3,
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              />
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center relative"
                style={{
                  background: "var(--eid-glass)",
                  backdropFilter: "blur(20px)",
                  border: "2px solid rgba(197,160,63,0.2)",
                  boxShadow:
                    "0 0 40px rgba(197,160,63,0.15), 0 0 80px rgba(58,143,125,0.1)",
                }}
              >
                <motion.span
                  className="text-4xl"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  🌙
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
                background: "var(--eid-glass)",
                backdropFilter: "blur(16px)",
                border: "1px solid var(--eid-glass-border)",
              }}
            >
              <Sparkles size={12} style={{ color: "var(--eid-gold)" }} />
              <span
                className="text-[10px] font-bold uppercase tracking-[0.25em]"
                style={{
                  background: "linear-gradient(135deg, var(--eid-gold), var(--eid-teal))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Eid al-Fitr 2026
              </span>
              <Sparkles size={12} style={{ color: "var(--eid-teal)" }} />
            </motion.div>

            {/* Urdu greeting */}
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="text-5xl sm:text-6xl font-bold mb-3 leading-tight"
              style={{
                fontFamily: "'Noto Nastaliq Urdu', 'Amiri', serif",
                color: "transparent",
                backgroundImage:
                  "linear-gradient(135deg, #C5A03F 0%, #E0C96E 40%, #C5A03F 70%, #D4A855 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                filter: "drop-shadow(0 3px 20px rgba(197,160,63,0.35))",
              }}
            >
              عید مبارک
            </motion.h1>

            {/* English greeting */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-xl sm:text-2xl font-bold mb-1.5"
              style={{
                color: "hsl(var(--eid-fg))",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {isGeneral ? "Eid Mubarak to All! ✨" : `Eid Mubarak, ${recipientName}! ✨`}
            </motion.p>

            {/* From sender */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85 }}
              className="text-sm mb-5"
              style={{
                color: "hsl(var(--eid-muted-fg))",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {senderName ? (
                <>A blessed greeting from{" "}
                <span
                  className="font-bold"
                  style={{
                    background: "linear-gradient(135deg, var(--eid-gold), var(--eid-teal))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {senderName}
                </span></>
              ) : "A blessed Eid greeting for everyone"}
            </motion.p>

            {/* Gold line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.95, duration: 0.6 }}
              className="w-full max-w-[200px] h-[2px] rounded-full mx-auto mb-7"
              style={{
                background:
                  "linear-gradient(90deg, transparent, var(--eid-gold), var(--eid-teal), var(--eid-gold), transparent)",
              }}
            />

            {/* Music card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.05, type: "spring", stiffness: 200, damping: 22 }}
              className="w-full max-w-xs rounded-3xl p-6 relative overflow-hidden"
              style={{
                background: "var(--eid-glass)",
                backdropFilter: "blur(28px)",
                border: "1px solid var(--eid-glass-border)",
                boxShadow:
                  "0 20px 60px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-[2px] rounded-t-3xl"
                style={{
                  background:
                    "linear-gradient(90deg, var(--eid-gold), var(--eid-teal), var(--eid-gold))",
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
                  style={{ color: "hsl(var(--eid-fg) / 0.85)" }}
                >
                  Nasheed Background Music
                </p>
              </div>

              <p
                className="text-[11px] mb-5 leading-relaxed"
                style={{ color: "hsl(var(--eid-muted-fg))" }}
              >
                Enhance your experience with soothing Eid nasheeds
              </p>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleEnter(true)}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[13px] font-bold transition-all text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--eid-gold), var(--eid-teal))",
                    boxShadow: "0 8px 28px rgba(197,160,63,0.25)",
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
                    background: "hsl(var(--eid-surface))",
                    color: "hsl(var(--eid-muted-fg))",
                    border: "1px solid hsl(var(--eid-border))",
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
              style={{ color: "hsl(var(--eid-muted-fg) / 0.4)" }}
            >
              Made with ❤️ for the blessed Eid
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default EidWelcomeOverlay;
