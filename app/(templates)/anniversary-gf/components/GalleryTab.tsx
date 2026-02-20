"use client";

import { useState, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type ContentData } from "./types";

const marqueeItems = [
  "Every love story is beautiful, but ours is my favorite 💕",
  "You are my today and all of my tomorrows 🥺",
  "In your arms, I found my home ✨",
  "My heart beats only for you 💖",
  "Together is a wonderful place to be 🌹",
  "You're the reason I believe in love 💌",
  "Every moment with you is a moment I treasure ∞",
  "You stole my heart, but I'll let you keep it 😂💕",
  "Love you more than yesterday, less than tomorrow 🌸",
  "You + Me = Forever 💝",
];

interface PlaceholderCard {
  emoji: string;
  bg: string;
  glow: string;
  label: string;
  letter: string;
}

const leftCards: PlaceholderCard[] = [
  { emoji: "📸", bg: "linear-gradient(135deg, #e11d48, #fb7185)", glow: "rgba(225,29,72,0.2)", label: "First Date", letter: "The day my heart first skipped a beat.\nI knew from that moment, my life would never be the same.\nYou looked at me and the world stopped for a second 💕" },
  { emoji: "🎉", bg: "linear-gradient(135deg, #a855f7, #c084fc)", glow: "rgba(168,85,247,0.2)", label: "Celebration", letter: "Every milestone with you is a celebration.\nYou make the ordinary extraordinary.\nWith you, even the smallest moments feel grand 🎉" },
  { emoji: "🏖️", bg: "linear-gradient(135deg, #3b82f6, #60a5fa)", glow: "rgba(59,130,246,0.2)", label: "Vacation", letter: "Wherever we go becomes the most beautiful place,\nbecause you're there with me.\nYou are my home, my adventure, my peace 🏖️" },
  { emoji: "💕", bg: "linear-gradient(135deg, #e11d48, #f43f5e)", glow: "rgba(225,29,72,0.2)", label: "Our Song", letter: "Every melody reminds me of you.\nYou are the music in my life,\nthe rhythm of my heart, the lyrics of my soul 🎵" },
  { emoji: "🧁", bg: "linear-gradient(135deg, #db2777, #f472b6)", glow: "rgba(219,39,119,0.2)", label: "Sweet Surprise", letter: "You are the sweetest surprise\nlife ever gave me.\nEvery day with you is a gift I never want to stop unwrapping 🧁" },
  { emoji: "🌺", bg: "linear-gradient(135deg, #f43f5e, #fb7185)", glow: "rgba(244,63,94,0.2)", label: "Spring Day", letter: "You brought spring into my life\nwhen everything was winter.\nYou are my bloom, my sunshine, my warmth 🌺" },
];

const rightCards: PlaceholderCard[] = [
  { emoji: "🌅", bg: "linear-gradient(135deg, #f59e0b, #fbbf24)", glow: "rgba(245,158,11,0.2)", label: "Sunset Together", letter: "Watching the sun set with you is my\nfavorite ending to any day.\nYou color my world in shades of gold and love 🌅" },
  { emoji: "💐", bg: "linear-gradient(135deg, #10b981, #34d399)", glow: "rgba(16,185,129,0.2)", label: "Special Moment", letter: "In the quietest moments with you,\nI find the loudest happiness.\nYou are my forever peace, my calm in every storm 💐" },
  { emoji: "🎂", bg: "linear-gradient(135deg, #ec4899, #f472b6)", glow: "rgba(236,72,153,0.2)", label: "Anniversary", letter: "Another year of loving you,\nanother year of growing together.\nHere's to forever and beyond with you by my side 💍" },
  { emoji: "🌙", bg: "linear-gradient(135deg, #6366f1, #818cf8)", glow: "rgba(99,102,241,0.2)", label: "Late Night Talk", letter: "Those midnight conversations with you\nare the ones I treasure the most.\nYou understand my silence and hear my heart 🌙" },
  { emoji: "✈️", bg: "linear-gradient(135deg, #0ea5e9, #38bdf8)", glow: "rgba(14,165,233,0.2)", label: "Adventure", letter: "With you, even getting lost\nis an adventure I'd choose\nevery single time, without a doubt ✈️" },
  { emoji: "⭐", bg: "linear-gradient(135deg, #eab308, #facc15)", glow: "rgba(234,179,8,0.2)", label: "Stargazing", letter: "I used to wish upon stars,\nbut then I found you.\nMy greatest wish came true, and I'm never letting go ⭐" },
];

const doubledLeft = [...leftCards, ...leftCards];
const doubledRight = [...rightCards, ...rightCards];
const doubledMarquee = [...marqueeItems, ...marqueeItems];

const TITLE_STYLE = {
  background: "linear-gradient(90deg, #e11d48, #ec4899, #a855f7)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
} as const;

export default memo(function GalleryTab({ data }: { data: ContentData }) {
  const [activeLetter, setActiveLetter] = useState<PlaceholderCard | null>(null);
  const hasPhotos = data.galleryPhotos.length > 0;

  const closeModal = useCallback(() => setActiveLetter(null), []);

  const leftElements = useMemo(
    () =>
      doubledLeft.map((card, i) => (
        <StoryCardItem
          key={`l-${i}`}
          card={card}
          photoUrl={hasPhotos ? data.galleryPhotos[i % leftCards.length] : undefined}
          onClick={setActiveLetter}
        />
      )),
    [hasPhotos, data.galleryPhotos]
  );

  const rightElements = useMemo(
    () =>
      doubledRight.map((card, i) => (
        <StoryCardItem
          key={`r-${i}`}
          card={card}
          photoUrl={hasPhotos ? data.galleryPhotos[(i % rightCards.length) + leftCards.length] : undefined}
          onClick={setActiveLetter}
        />
      )),
    [hasPhotos, data.galleryPhotos]
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
      <h3 className="font-script text-2xl lg:text-3xl text-center mb-3 px-4" style={TITLE_STYLE}>
        Our Memories 📸
      </h3>

      <div className="overflow-hidden mx-4 py-2 mb-3 rounded-xl lg:mx-auto lg:max-w-4xl lg:w-full" style={{ background: "var(--anni-marquee-bg)", border: "1px solid var(--anni-marquee-border)" }}>
        <div className="marquee-track flex gap-8 whitespace-nowrap px-4">
          {doubledMarquee.map((item, i) => (
            <span key={i} className="text-xs text-foreground/50">{item}</span>
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
        {activeLetter && (
          <LetterModal card={activeLetter} onClose={closeModal} />
        )}
      </AnimatePresence>
    </motion.div>
  );
});

/* ─── Memoized Card ─── */
const StoryCardItem = memo(function StoryCardItem({
  card,
  photoUrl,
  onClick,
}: {
  card: PlaceholderCard;
  photoUrl?: string;
  onClick: (c: PlaceholderCard) => void;
}) {
  const handleClick = useCallback(() => onClick(card), [onClick, card]);

  const cardStyle = useMemo(
    () => ({
      background: "var(--anni-card-bg)",
      border: "1.5px solid var(--anni-card-border)",
      boxShadow: `0 2px 12px ${card.glow}`,
    }),
    [card.glow]
  );

  return (
    <button
      onClick={handleClick}
      className="flex flex-col items-center w-full overflow-hidden rounded-2xl active:scale-[0.96] transition-transform duration-150"
      style={cardStyle}
    >
      <div className="relative w-full rounded-t-2xl overflow-hidden">
        <div className="relative w-full" style={{ aspectRatio: "4/3" }}>
          {photoUrl ? (
            <img src={photoUrl} alt={card.label} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center relative" style={{ background: card.bg }}>
              <div className="absolute inset-0 pointer-events-none" style={GLOSSY_OVERLAY} />
              <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full pointer-events-none" style={CIRCLE_A} />
              <div className="absolute -bottom-4 -left-4 w-10 h-10 rounded-full pointer-events-none" style={CIRCLE_B} />
              <span className="text-4xl drop-shadow-lg relative z-10">{card.emoji}</span>
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-6" style={{ background: "var(--anni-modal-fade)" }} />
        <div className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center" style={BADGE_STYLE}>
          <span className="text-base">{card.emoji}</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1 px-3 py-2.5 w-full">
        <p className="text-[11px] font-bold text-foreground leading-tight text-center">{card.label}</p>
        <span className="text-[10px] font-semibold flex items-center gap-1" style={{ color: "var(--anni-pink)" }}>
          Open Letter <span className="letter-pulse">💌</span>
        </span>
      </div>

      <style jsx>{`
        .letter-pulse {
          animation: pulse-letter 1.5s ease-in-out infinite;
          display: inline-block;
        }
        @keyframes pulse-letter {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
      `}</style>
    </button>
  );
});

const GLOSSY_OVERLAY = { background: "linear-gradient(145deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 40%, transparent 60%)" } as const;
const CIRCLE_A = { background: "rgba(255,255,255,0.12)" } as const;
const CIRCLE_B = { background: "rgba(255,255,255,0.08)" } as const;
const BADGE_STYLE = { background: "var(--anni-badge-bg)", backdropFilter: "blur(8px)", boxShadow: "0 2px 6px rgba(0,0,0,0.08)" } as const;

/* ─── Letter Modal ─── */
const LetterModal = memo(function LetterModal({
  card,
  onClose,
}: {
  card: PlaceholderCard;
  onClose: () => void;
}) {
  const stopProp = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[999] overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <div className="min-h-full flex items-start justify-center px-4 pt-6 pb-28 lg:items-center lg:pt-0 lg:pb-0">
        <motion.div
          initial={{ scale: 0.5, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.5, y: 50, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          className="max-w-sm w-full relative rounded-3xl my-auto overflow-hidden lg:max-w-md"
          style={{
            background: "var(--anni-modal-bg)",
            boxShadow: "0 25px 60px rgba(190,50,90,0.2), 0 4px 20px rgba(0,0,0,0.1)",
          }}
          onClick={stopProp}
        >
          <div className="relative w-full rounded-t-3xl overflow-hidden">
            <div
              className="relative w-full flex items-center justify-center"
              style={{ aspectRatio: "4/3", background: card.bg }}
            >
              <div className="absolute inset-0 pointer-events-none" style={GLOSSY_OVERLAY} />
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none" style={CIRCLE_A} />
              <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full pointer-events-none" style={CIRCLE_B} />
              <motion.span
                className="text-6xl drop-shadow-lg relative z-10"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                {card.emoji}
              </motion.span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-12" style={{ background: "var(--anni-modal-fade)" }} />

            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: "var(--anni-badge-bg)", backdropFilter: "blur(8px)", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", color: "#e11d48" }}
            >
              ✕
            </button>

            <motion.div
              initial={{ rotate: -30, scale: 0 }}
              animate={{ rotate: 8, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
              className="absolute top-3 left-3 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "var(--anni-badge-bg)", backdropFilter: "blur(8px)", border: "2px dashed var(--anni-divider)", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
            >
              <span className="text-lg">💌</span>
            </motion.div>
          </div>

          <div className="text-center px-6 -mt-4 relative z-10">
            <motion.span
              className="text-3xl inline-block"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              {card.emoji}
            </motion.span>
            <h3 className="font-script text-xl mt-1" style={{ color: "var(--anni-text)" }}>{card.label}</h3>
          </div>

          <div className="flex items-center justify-center gap-3 my-3 px-8">
            <div className="h-px flex-1" style={{ background: "var(--anni-divider)" }} />
            <span className="text-xs heart-beat" style={{ color: "var(--anni-pink)" }}>♡</span>
            <div className="h-px flex-1" style={{ background: "var(--anni-divider)" }} />
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="px-6 pb-2">
            <p className="text-sm leading-relaxed italic whitespace-pre-line" style={{ color: "var(--anni-text-body)" }}>
              &ldquo;{card.letter}&rdquo;
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="px-6 pt-3 pb-6 text-center">
            <p className="font-script text-base" style={{ color: "var(--anni-text)" }}>With all my love 💕</p>
            <p className="text-[10px] mt-0.5 text-foreground/40">— Forever yours</p>

            <div className="my-3 py-2">
              <span className="text-2xl inline-block heart-beat">💝</span>
            </div>

            <button
              onClick={onClose}
              className="px-8 py-2.5 text-sm font-semibold w-full rounded-xl active:scale-95 transition-transform"
              style={{
                background: "var(--anni-glass)",
                border: "1.5px solid var(--anni-divider)",
                color: "var(--anni-text)",
              }}
            >
              Close Letter 💕
            </button>
          </motion.div>

          <style jsx>{`
            .heart-beat { animation: hb 1.5s ease-in-out infinite; display: inline-block; }
            @keyframes hb { 0%,100% { transform: scale(1); } 50% { transform: scale(1.3); } }
          `}</style>
        </motion.div>
      </div>
    </motion.div>
  );
});
