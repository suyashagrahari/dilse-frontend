"use client";

import { memo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, X, Heart } from "lucide-react";
import Image from "next/image";
import type { ContentData } from "./types";

interface TimeUnit { value: number; label: string; color: string; }

function useTimer(startDate: string): TimeUnit[] {
  const [units, setUnits] = useState<TimeUnit[]>([]);
  useEffect(() => {
    const update = () => {
      const diff = Date.now() - new Date(startDate).getTime();
      const totalSec = Math.floor(diff / 1000);
      const totalMin = Math.floor(totalSec / 60);
      const totalHr = Math.floor(totalMin / 60);
      const totalDays = Math.floor(totalHr / 24);
      const years = Math.floor(totalDays / 365.25);
      const months = Math.floor((totalDays % 365.25) / 30.44);
      const days = Math.floor(totalDays % 30.44);
      setUnits([
        { value: years, label: "Years", color: "#e11d48" },
        { value: months, label: "Months", color: "#ec4899" },
        { value: days, label: "Days", color: "#a855f7" },
        { value: totalHr % 24, label: "Hours", color: "#e11d48" },
        { value: totalMin % 60, label: "Mins", color: "#ec4899" },
        { value: totalSec % 60, label: "Secs", color: "#a855f7" },
      ]);
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [startDate]);
  return units;
}

const QUOTES = [
  "In all the world, there is no heart for me like yours.",
  "I love you not only for what you are, but for what I am when I am with you.",
  "You are my today and all of my tomorrows.",
  "Every love story is beautiful, but ours is my favorite.",
  "I have found the one whom my soul loves.",
  "You are the finest, loveliest, tenderest person I have ever known.",
];

const SPARKLES = [
  { emoji: "✨", left: 12, top: 15, delay: 0 },
  { emoji: "💕", left: 82, top: 22, delay: 0.5 },
  { emoji: "💖", left: 8, top: 55, delay: 1.2 },
  { emoji: "✨", left: 88, top: 60, delay: 0.8 },
  { emoji: "🌸", left: 20, top: 80, delay: 1.5 },
  { emoji: "💫", left: 75, top: 78, delay: 0.3 },
];

interface Props {
  data: ContentData;
  onGoGallery: () => void;
  onGoNotes: () => void;
}

export default memo(function HeroSection({ data, onGoGallery, onGoNotes }: Props) {
  const timeUnits = useTimer(data.loveDate);
  const [letterOpen, setLetterOpen] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const iv = setInterval(() => setQuoteIdx((i) => (i + 1) % QUOTES.length), 6000);
    return () => clearInterval(iv);
  }, []);

  const openLetter = useCallback(() => setLetterOpen(true), []);
  const closeLetter = useCallback(() => setLetterOpen(false), []);
  const stopProp = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

  const hasPhoto = data.galleryPhotos.length > 0 && !!data.galleryPhotos[0]?.url;
  const avatarPhoto = hasPhoto ? data.galleryPhotos[0].url : "https://cdn.subhsandesh.in/gifts-media/assets/couple1.webp";

  if (!mounted) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-screen flex flex-col relative overflow-y-auto overflow-x-hidden"
    >
      {/* Background layers */}
      <div className="absolute inset-0">
        <Image src="https://cdn.subhsandesh.in/gifts-media/assets/hero-bg.webp" alt="" fill className="object-cover" priority />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white/90 dark:from-slate-950/85 dark:via-slate-950/70 dark:to-slate-950/90 backdrop-blur-[6px]" />

      {/* Radial glow behind avatar */}
      <div className="absolute top-[8%] left-1/2 -translate-x-1/2 w-80 h-80 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)" }} />

      {/* Floating sparkles — CSS only */}
      {SPARKLES.map((s, i) => (
        <span key={i} className="absolute pointer-events-none text-xl sparkle-float"
          style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s` }}>
          {s.emoji}
        </span>
      ))}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-5 py-6 lg:py-10 lg:max-w-2xl lg:mx-auto lg:w-full">

        {/* Avatar with photo */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
          className="relative mb-5"
        >
          {/* Rotating ring */}
          <div className="absolute -inset-3 rounded-full ring-rotate" style={{ border: "2px dashed rgba(236,72,153,0.25)" }} />

          {/* Glow ring */}
          <div className="absolute -inset-1.5 rounded-full"
            style={{ background: "linear-gradient(135deg, #e11d48, #ec4899, #a855f7, #ec4899, #e11d48)", padding: "3px", WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }} />

          {/* Photo circle */}
          <div className="w-28 h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 rounded-full overflow-hidden relative shadow-2xl"
            style={{ boxShadow: "0 0 40px rgba(236,72,153,0.3), 0 0 80px rgba(236,72,153,0.1)" }}>
            <Image src={avatarPhoto} alt="Couple" fill className="object-cover" sizes="144px" />
          </div>

          {/* Floating mini hearts around avatar */}
          <motion.span
            animate={{ y: [-4, 4, -4], x: [-2, 2, -2] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-2 -right-1 text-lg drop-shadow">💕</motion.span>
          <motion.span
            animate={{ y: [3, -3, 3], x: [2, -2, 2] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            className="absolute -bottom-1 -left-2 text-base drop-shadow">✨</motion.span>
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-1/2 -right-5 text-sm drop-shadow">💖</motion.span>
        </motion.div>

        {/* Names */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-center mb-1"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
            style={{ background: "linear-gradient(135deg, #e11d48, #ec4899, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {data.senderName} & {data.recipientName}
          </h1>
        </motion.div>

        {/* Subtitle with heart */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex items-center gap-2 mb-6"
        >
          <div className="h-px w-8 bg-pink-300/40 dark:bg-pink-700/30" />
          <p className="text-muted-foreground text-xs md:text-sm font-medium flex items-center gap-1.5">
            Together through every moment
            <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-pink-500">
              <Heart size={12} className="fill-current" />
            </motion.span>
          </p>
          <div className="h-px w-8 bg-pink-300/40 dark:bg-pink-700/30" />
        </motion.div>

        {/* Love Letter button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45 }}
          onClick={openLetter}
          className="w-full max-w-sm lg:max-w-md rounded-2xl border border-white/20 dark:border-white/[0.08] shadow-lg backdrop-blur-xl bg-white/80 dark:bg-slate-900/70 px-4 py-4 lg:px-5 lg:py-5 mb-6 active:scale-[0.97] transition-transform group"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-pink-100 dark:bg-pink-900/30">
              <span className="text-xl">💌</span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-foreground">Love Letter</p>
              <p className="text-[10px] text-muted-foreground">Tap to read your special message</p>
            </div>
            <ChevronRight size={16} className="text-pink-400/60 group-hover:text-pink-500 group-hover:translate-x-0.5 transition-all" />
          </div>
        </motion.button>

        {/* Together For — Timer */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="w-full max-w-sm lg:max-w-lg mb-5 rounded-3xl overflow-hidden p-4 lg:p-6 border border-white/20 dark:border-white/[0.08] shadow-xl backdrop-blur-xl bg-white/70 dark:bg-slate-900/70"
        >
          <div className="flex items-center gap-3 mb-3">
            <motion.span
              className="text-3xl"
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >💖</motion.span>
            <div className="flex-1">
              <h2 className="text-lg font-bold italic leading-tight text-rose-800 dark:text-pink-300">
                Together For
              </h2>
              <p className="text-[10px] font-medium text-muted-foreground">
                Every second with you is a gift 💕
              </p>
            </div>
            <span className="text-2xl heart-beat">💍</span>
          </div>

          <div className="grid grid-cols-3 gap-2 lg:gap-3">
            {timeUnits.map((unit, i) => (
              <motion.div
                key={unit.label}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 + i * 0.06, type: "spring", stiffness: 300 }}
                className="flex flex-col items-center"
              >
                <div className="w-full py-3 lg:py-4 flex flex-col items-center rounded-2xl border border-white/20 dark:border-white/[0.06] shadow-sm backdrop-blur-md bg-white/50 dark:bg-white/[0.04]">
                  <span className="font-bold text-2xl lg:text-3xl tabular-nums" style={{ color: unit.color }}>
                    {unit.value}
                  </span>
                  <span className="text-[8px] lg:text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
                    {unit.label}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Rotating quote */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="w-full max-w-sm lg:max-w-md rounded-xl px-5 py-3 lg:py-4 mb-6 text-center border border-white/15 dark:border-white/[0.06] shadow-sm backdrop-blur-md bg-white/40 dark:bg-white/[0.04]"
        >
          <p className="text-[11px] lg:text-sm italic text-muted-foreground">&quot;{QUOTES[quoteIdx]}&quot;</p>
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.75 }}
          className="flex gap-3 w-full max-w-sm lg:max-w-md"
        >
          <button onClick={onGoGallery}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 lg:py-3.5 rounded-2xl text-white font-semibold text-xs lg:text-sm active:scale-95 transition-transform shadow-lg"
            style={{ background: "linear-gradient(135deg, #e11d48, #ec4899)", boxShadow: "0 6px 20px rgba(225,29,72,0.3)" }}>
            Our Gallery <ChevronRight size={13} />
          </button>
          <button onClick={onGoNotes}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-3 lg:py-3.5 rounded-2xl text-white font-semibold text-xs lg:text-sm active:scale-95 transition-transform shadow-lg"
            style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)", boxShadow: "0 6px 20px rgba(168,85,247,0.3)" }}>
            Love Notes <ChevronRight size={13} />
          </button>
        </motion.div>
      </div>

      {/* Letter Modal */}
      <AnimatePresence>
        {letterOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeLetter}
            className="fixed inset-0 z-50 flex items-center justify-center p-5"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(10px)" }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 25 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              onClick={stopProp}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-pink-200/30 dark:border-pink-800/20 overflow-hidden"
            >
              {/* Envelope header */}
              <div className="relative overflow-hidden" style={{ height: 120 }}>
                <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #fce7f3, #fdf2f8, #ede9fe)" }} />
                <div className="hidden dark:block absolute inset-0" style={{ background: "linear-gradient(135deg, #1e1b2e, #2d1f3d, #1e1b2e)" }} />

                {/* Decorative circles */}
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-20" style={{ background: "linear-gradient(135deg, #ec4899, #a855f7)" }} />
                <div className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full opacity-15" style={{ background: "linear-gradient(135deg, #e11d48, #ec4899)" }} />

                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ y: [0, -5, 0], rotate: [0, 3, -3, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <span className="text-5xl drop-shadow-lg">💌</span>
                  </motion.div>
                </div>

                <button onClick={closeLetter}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/60 dark:bg-slate-800/60 flex items-center justify-center text-muted-foreground hover:text-foreground shadow-sm">
                  <X size={14} />
                </button>
              </div>

              <div className="px-6 py-5">
                <p className="text-[10px] font-bold text-pink-500 uppercase tracking-widest mb-1">A Letter For You</p>
                <h3 className="text-lg font-bold text-foreground mb-0.5">My Dearest {data.recipientName},</h3>

                <div className="flex items-center gap-2 my-3">
                  <div className="h-px flex-1 bg-pink-200/40 dark:bg-pink-800/20" />
                  <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-pink-400 text-xs">♡</motion.span>
                  <div className="h-px flex-1 bg-pink-200/40 dark:bg-pink-800/20" />
                </div>

                <p className="text-sm text-foreground/75 leading-relaxed whitespace-pre-wrap">{data.personalMessage}</p>

                <div className="flex items-center gap-2 my-4">
                  <div className="h-px flex-1 bg-pink-200/40 dark:bg-pink-800/20" />
                  <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} className="text-pink-400 text-xs">♡</motion.span>
                  <div className="h-px flex-1 bg-pink-200/40 dark:bg-pink-800/20" />
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold" style={{ color: "#e11d48" }}>With all my love,</p>
                  <p className="text-xs text-foreground font-bold mt-0.5">{data.senderName} 💕</p>
                </div>
              </div>

              <div className="px-6 pb-5">
                <button onClick={closeLetter}
                  className="w-full py-2.5 rounded-xl border border-pink-200/40 dark:border-pink-800/20 text-xs font-semibold text-muted-foreground hover:bg-pink-50/50 dark:hover:bg-pink-900/10 transition-colors">
                  Close Letter 💕
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .sparkle-float {
          opacity: 0.15;
          animation: sparkleF 5s ease-in-out infinite;
        }
        @keyframes sparkleF {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.15; }
          25% { transform: translateY(-12px) scale(1.15); opacity: 0.35; }
          50% { transform: translateY(-4px) scale(0.95); opacity: 0.2; }
          75% { transform: translateY(-16px) scale(1.1); opacity: 0.3; }
        }
        .ring-rotate {
          animation: ringR 12s linear infinite;
        }
        @keyframes ringR {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .heart-beat {
          animation: hb 2s ease-in-out infinite;
          display: inline-block;
        }
        @keyframes hb {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
      `}</style>
    </motion.div>
  );
});
