"use client";

import { memo, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { ContentData } from "./types";

interface StoryCard {
  emoji: string;
  bg: string;
  glow: string;
  label: string;
  letter: string;
}

const leftCards: StoryCard[] = [
  { emoji: "🌅", bg: "linear-gradient(135deg, #f97316, #ec4899)", glow: "rgba(249,115,22,0.15)", label: "Golden Hour", letter: "Every sunset reminds me of the warmth you bring into my life.\nThe way the light dances in your eyes makes every evening magical.\nYou are my golden hour, forever and always 🌅" },
  { emoji: "🌸", bg: "linear-gradient(135deg, #f9a8d4, #c084fc)", glow: "rgba(249,168,212,0.15)", label: "Cherry Blossoms", letter: "Like cherry blossoms in spring, our love blooms more beautifully with each passing day.\nYou are my favorite season,\nmy sweetest chapter, my forever bloom 🌸" },
  { emoji: "🎆", bg: "linear-gradient(135deg, #6366f1, #ec4899)", glow: "rgba(99,102,241,0.15)", label: "Fireworks", letter: "Every moment with you feels like fireworks —\nbright, beautiful, and absolutely breathtaking.\nYou light up my world like nobody else 🎆" },
  { emoji: "💕", bg: "linear-gradient(135deg, #e11d48, #f43f5e)", glow: "rgba(225,29,72,0.15)", label: "Our Song", letter: "Every melody reminds me of you.\nYou are the music in my life,\nthe rhythm of my heart, the lyrics of my soul 🎵" },
  { emoji: "🧁", bg: "linear-gradient(135deg, #db2777, #f472b6)", glow: "rgba(219,39,119,0.15)", label: "Sweet Surprise", letter: "You are the sweetest surprise\nlife ever gave me.\nEvery day with you is a gift I never want to stop unwrapping 🧁" },
  { emoji: "🌺", bg: "linear-gradient(135deg, #f43f5e, #fb7185)", glow: "rgba(244,63,94,0.15)", label: "Spring Day", letter: "You brought spring into my life\nwhen everything was winter.\nYou are my bloom, my sunshine, my warmth 🌺" },
];

const rightCards: StoryCard[] = [
  { emoji: "✨", bg: "linear-gradient(135deg, #ec4899, #f43f5e)", glow: "rgba(236,72,153,0.15)", label: "Date Night", letter: "Our date nights are my favorite.\nWhether it's a fancy dinner or just staying in,\nevery moment with you is perfect and precious ✨" },
  { emoji: "🌙", bg: "linear-gradient(135deg, #1e3a5f, #6366f1)", glow: "rgba(99,102,241,0.15)", label: "Stargazing", letter: "Under the stars with you, I realized\nthat no constellation could ever be as beautiful\nas the universe we've built together 🌙" },
  { emoji: "🌹", bg: "linear-gradient(135deg, #be123c, #ec4899)", glow: "rgba(190,18,60,0.15)", label: "Forever Yours", letter: "I promise to love you through every season,\nevery storm, and every sunrise.\nYou are my forever, my always 🌹" },
  { emoji: "💐", bg: "linear-gradient(135deg, #10b981, #34d399)", glow: "rgba(16,185,129,0.15)", label: "Special Moment", letter: "In the quietest moments with you,\nI find the loudest happiness.\nYou are my forever peace, my calm in every storm 💐" },
  { emoji: "⭐", bg: "linear-gradient(135deg, #eab308, #facc15)", glow: "rgba(234,179,8,0.15)", label: "Wishing Star", letter: "I used to wish upon stars,\nbut then I found you.\nMy greatest wish came true, and I'm never letting go ⭐" },
  { emoji: "✈️", bg: "linear-gradient(135deg, #0ea5e9, #38bdf8)", glow: "rgba(14,165,233,0.15)", label: "Adventure", letter: "With you, even getting lost\nis an adventure I'd choose\nevery single time, without a doubt ✈️" },
];

const DEFAULT_PHOTOS = [
  "/assets/couple1.jpeg",
  "/assets/couple2.jpeg",
  "/assets/couple3.jpeg",
  "/assets/couple4.jpeg",
];

const doubledLeft = [...leftCards, ...leftCards];
const doubledRight = [...rightCards, ...rightCards];

const marqueeItems = [
  "Every love story is beautiful, but ours is my favorite 💕",
  "You are my today and all of my tomorrows 🥺",
  "In your arms, I found my home ✨",
  "My heart beats only for you 💖",
  "Together is a wonderful place to be 🌹",
  "You're the reason I believe in love 💌",
];
const doubledMarquee = [...marqueeItems, ...marqueeItems];

const GLOSSY = { background: "linear-gradient(145deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 40%, transparent 60%)" } as const;

const TITLE_STYLE = {
  background: "linear-gradient(135deg, #e11d48, #a855f7)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
} as const;

function getPhotoForIndex(photos: string[], index: number): string {
  return photos[index % photos.length];
}

const CardItem = memo(function CardItem({
  card, photoUrl, onClick,
}: {
  card: StoryCard;
  photoUrl: string;
  onClick: (c: StoryCard) => void;
}) {
  const handleClick = useCallback(() => onClick(card), [onClick, card]);

  return (
    <button
      onClick={handleClick}
      className="flex flex-col items-center w-full overflow-hidden rounded-2xl border border-pink-200/30 dark:border-pink-800/20 bg-white dark:bg-slate-900 active:scale-[0.96] transition-transform duration-150 shadow-sm"
    >
      <div className="relative w-full rounded-t-2xl overflow-hidden">
        <div className="relative w-full" style={{ aspectRatio: "4/3" }}>
          <img src={photoUrl} alt={card.label} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0" style={GLOSSY} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>
        <div className="absolute top-2 right-2 w-7 h-7 lg:w-9 lg:h-9 rounded-full bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm flex items-center justify-center shadow-sm">
          <span className="text-sm lg:text-base">{card.emoji}</span>
        </div>
        <div className="absolute bottom-2 left-2 flex items-center gap-1">
          <span className="text-xs lg:text-sm bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm text-foreground rounded-full px-2 lg:px-3 py-0.5 font-semibold shadow-sm">{card.label}</span>
        </div>
      </div>
      <div className="flex items-center justify-center gap-1 px-3 py-2 lg:py-2.5 w-full">
        <span className="text-[10px] lg:text-xs font-semibold text-pink-500 flex items-center gap-1">
          Open Letter <span className="inline-block letter-pulse">💌</span>
        </span>
      </div>

      <style jsx>{`
        .letter-pulse { animation: lp 1.5s ease-in-out infinite; display: inline-block; }
        @keyframes lp { 0%,100% { transform: scale(1); } 50% { transform: scale(1.2); } }
      `}</style>
    </button>
  );
});

const LetterModal = memo(function LetterModal({ card, photoUrl, onClose }: { card: StoryCard; photoUrl: string; onClose: () => void }) {
  const stopProp = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <div className="min-h-full flex items-start justify-center px-4 pt-6 pb-28 lg:items-center lg:pt-0 lg:pb-0">
        <motion.div
          initial={{ scale: 0.5, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.5, y: 50, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          className="max-w-sm w-full relative rounded-3xl my-auto overflow-hidden lg:max-w-md bg-white dark:bg-slate-900 shadow-2xl"
          onClick={stopProp}
        >
          {/* Photo header */}
          <div className="relative w-full rounded-t-3xl overflow-hidden">
            <div className="relative w-full" style={{ aspectRatio: "16/10" }}>
              <img src={photoUrl} alt={card.label} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-slate-900 to-transparent" />

            <button onClick={onClose}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm flex items-center justify-center shadow-md">
              <X size={14} className="text-foreground" />
            </button>

            <motion.div
              initial={{ rotate: -30, scale: 0 }} animate={{ rotate: 8, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
              className="absolute top-3 left-3 w-10 h-10 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-2 border-dashed border-white/40 flex items-center justify-center shadow-md"
            >
              <span className="text-lg">💌</span>
            </motion.div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
              <motion.span className="text-3xl inline-block drop-shadow-lg" animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity }}>{card.emoji}</motion.span>
            </div>
          </div>

          <div className="text-center px-6 pt-2">
            <h3 className="text-lg font-bold text-foreground">{card.label}</h3>
          </div>

          <div className="flex items-center justify-center gap-3 my-2.5 px-8">
            <div className="h-px flex-1 bg-pink-200/40 dark:bg-pink-800/20" />
            <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-xs text-pink-400">♡</motion.span>
            <div className="h-px flex-1 bg-pink-200/40 dark:bg-pink-800/20" />
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="px-6 pb-2">
            <p className="text-sm leading-relaxed italic whitespace-pre-line text-foreground/70">
              &ldquo;{card.letter}&rdquo;
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="px-6 pt-2 pb-5 text-center">
            <p className="text-sm font-semibold text-pink-500">With all my love 💕</p>
            <p className="text-[10px] mt-0.5 text-muted-foreground">— Forever yours</p>
            <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-2xl inline-block my-2.5">💝</motion.span>
            <button onClick={onClose}
              className="w-full py-2.5 rounded-xl border border-pink-200/30 dark:border-pink-800/20 text-xs font-medium text-muted-foreground hover:bg-pink-50/50 dark:hover:bg-pink-900/10 active:scale-95 transition-all">
              Close Letter 💕
            </button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
});

interface Props { data: ContentData; }

export default memo(function GallerySection({ data }: Props) {
  const [activeLetter, setActiveLetter] = useState<{ card: StoryCard; photo: string } | null>(null);
  const closeModal = useCallback(() => setActiveLetter(null), []);

  const photos = data.galleryPhotos.length > 0 ? data.galleryPhotos : DEFAULT_PHOTOS;

  const handleCardClick = useCallback((card: StoryCard, photo: string) => {
    setActiveLetter({ card, photo });
  }, []);

  const leftElements = useMemo(
    () => doubledLeft.map((card, i) => {
      const photo = getPhotoForIndex(photos, i);
      return (
        <CardItem
          key={`l-${i}`}
          card={card}
          photoUrl={photo}
          onClick={(c) => handleCardClick(c, photo)}
        />
      );
    }),
    [photos, handleCardClick],
  );

  const rightElements = useMemo(
    () => doubledRight.map((card, i) => {
      const photo = getPhotoForIndex(photos, i + 1);
      return (
        <CardItem
          key={`r-${i}`}
          card={card}
          photoUrl={photo}
          onClick={(c) => handleCardClick(c, photo)}
        />
      );
    }),
    [photos, handleCardClick],
  );

  return (
    <motion.div
      key="gallery"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="pt-5 pb-24 h-screen flex flex-col overflow-hidden relative z-10 lg:pt-8"
    >
      <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-center mb-2 lg:mb-4 px-4 shrink-0" style={TITLE_STYLE}>
        Our Memories 📸
      </h3>

      <div className="overflow-hidden mx-4 py-2 mb-3 rounded-xl bg-pink-50/60 dark:bg-pink-950/10 border border-pink-100 dark:border-pink-900/20 lg:mx-auto lg:max-w-6xl xl:max-w-7xl lg:w-full shrink-0">
        <div className="marquee-track flex gap-8 whitespace-nowrap px-4">
          {doubledMarquee.map((item, i) => (
            <span key={i} className="text-xs text-foreground/40">{item}</span>
          ))}
        </div>
      </div>

      <div className="flex gap-2.5 px-3 overflow-hidden flex-1 lg:px-8 lg:gap-4 lg:max-w-6xl xl:max-w-7xl lg:mx-auto lg:w-full">
        <div className="flex-1 overflow-hidden relative">
          <div className="scroll-col-up flex flex-col gap-2.5 lg:gap-3">
            {leftElements}
          </div>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div className="scroll-col-down flex flex-col gap-2.5 lg:gap-3 pt-20">
            {rightElements}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee-x {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scroll-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes scroll-down {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        .marquee-track {
          animation: marquee-x 22s linear infinite;
          will-change: transform;
        }
        .scroll-col-up {
          animation: scroll-up 30s linear infinite;
          will-change: transform;
        }
        .scroll-col-down {
          animation: scroll-down 32s linear infinite;
          will-change: transform;
        }
      `}</style>

      <AnimatePresence>
        {activeLetter && <LetterModal card={activeLetter.card} photoUrl={activeLetter.photo} onClose={closeModal} />}
      </AnimatePresence>
    </motion.div>
  );
});
