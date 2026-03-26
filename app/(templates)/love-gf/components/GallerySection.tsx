"use client";

import { memo, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { ContentData } from "./types";

const WARM = "rgb(108, 74, 46)";
const WARM_BORDER = "rgba(158, 126, 97, 0.22)";
const CREAM_CARD = "rgba(250, 248, 242, 0.90)";
const CURSIVE = "'Dancing Script', 'Brush Script MT', cursive";

interface StoryCard {
  emoji: string;
  bg: string;
  label: string;
  letter: string;
}

const leftCards: StoryCard[] = [
  { emoji: "🌅", bg: "linear-gradient(135deg, #c9956c, #e8b89a)", label: "Golden Hour", letter: "Every sunset reminds me of the warmth you bring into my life.\nThe way the light dances in your eyes makes every evening magical.\nYou are my golden hour, forever and always 🌅" },
  { emoji: "🌸", bg: "linear-gradient(135deg, #d4a5a5, #e8c5c5)", label: "Cherry Blossoms", letter: "Like cherry blossoms in spring, our love blooms more beautifully with each passing day.\nYou are my favorite season,\nmy sweetest chapter, my forever bloom 🌸" },
  { emoji: "🎆", bg: "linear-gradient(135deg, #9e7e6e, #b8948a)", label: "Fireworks", letter: "Every moment with you feels like fireworks —\nbright, beautiful, and absolutely breathtaking.\nYou light up my world like nobody else 🎆" },
  { emoji: "💕", bg: "linear-gradient(135deg, #b4665e, #c97878)", label: "Our Song", letter: "Every melody reminds me of you.\nYou are the music in my life,\nthe rhythm of my heart, the lyrics of my soul 🎵" },
  { emoji: "🧁", bg: "linear-gradient(135deg, #c47e7e, #d49a9a)", label: "Sweet Surprise", letter: "You are the sweetest surprise\nlife ever gave me.\nEvery day with you is a gift I never want to stop unwrapping 🧁" },
  { emoji: "🌺", bg: "linear-gradient(135deg, #b86060, #cb8080)", label: "Spring Day", letter: "You brought spring into my life\nwhen everything was winter.\nYou are my bloom, my sunshine, my warmth 🌺" },
];

const rightCards: StoryCard[] = [
  { emoji: "✨", bg: "linear-gradient(135deg, #c4826a, #d8a090)", label: "Date Night", letter: "Our date nights are my favorite.\nWhether it's a fancy dinner or just staying in,\nevery moment with you is perfect and precious ✨" },
  { emoji: "🌙", bg: "linear-gradient(135deg, #6e7e8e, #8e9eae)", label: "Stargazing", letter: "Under the stars with you, I realized\nthat no constellation could ever be as beautiful\nas the universe we've built together 🌙" },
  { emoji: "🌹", bg: "linear-gradient(135deg, #a85858, #c47878)", label: "Forever Yours", letter: "I promise to love you through every season,\nevery storm, and every sunrise.\nYou are my forever, my always 🌹" },
  { emoji: "💐", bg: "linear-gradient(135deg, #7e9e8e, #9ebaa0)", label: "Special Moment", letter: "In the quietest moments with you,\nI find the loudest happiness.\nYou are my forever peace, my calm in every storm 💐" },
  { emoji: "⭐", bg: "linear-gradient(135deg, #c4a060, #d4b870)", label: "Wishing Star", letter: "I used to wish upon stars,\nbut then I found you.\nMy greatest wish came true, and I'm never letting go ⭐" },
  { emoji: "✈️", bg: "linear-gradient(135deg, #7e9ea8, #9ebec8)", label: "Adventure", letter: "With you, even getting lost\nis an adventure I'd choose\nevery single time, without a doubt ✈️" },
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
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        overflow: "hidden",
        borderRadius: 16,
        border: `1px solid ${WARM_BORDER}`,
        background: CREAM_CARD,
        boxShadow: "0 4px 16px rgba(80,50,20,0.12)",
        transition: "transform 0.15s",
        cursor: "pointer",
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <div style={{ position: "relative", width: "100%", borderRadius: "16px 16px 0 0", overflow: "hidden" }}>
        <div style={{ position: "relative", width: "100%", aspectRatio: "4/3" }}>
          <img src={photoUrl} alt={card.label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy" />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(145deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 40%, transparent 60%)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(80,50,20,0.35), transparent)" }} />
        </div>
        {/* Emoji badge */}
        <div style={{
          position: "absolute", top: 8, right: 8,
          width: 28, height: 28,
          borderRadius: "50%",
          background: "rgba(250,248,242,0.80)",
          backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(80,50,20,0.15)",
          fontSize: 14,
        }}>
          {card.emoji}
        </div>
        {/* Label chip */}
        <div style={{ position: "absolute", bottom: 8, left: 8 }}>
          <span style={{
            fontFamily: CURSIVE,
            fontSize: 11,
            fontWeight: 600,
            color: "rgba(250,248,242,0.95)",
            background: "rgba(80,50,20,0.55)",
            backdropFilter: "blur(4px)",
            borderRadius: 999,
            padding: "2px 10px",
          }}>
            {card.label}
          </span>
        </div>
      </div>

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
        padding: "8px 12px", width: "100%",
      }}>
        <span style={{
          fontFamily: CURSIVE,
          fontSize: 11,
          fontWeight: 600,
          color: WARM,
          display: "flex", alignItems: "center", gap: 4,
        }}>
          Open Letter <span className="letter-pulse">💌</span>
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
      style={{
        position: "fixed", inset: 0, zIndex: 999, overflowY: "auto",
        background: "rgba(40,22,8,0.55)", backdropFilter: "blur(10px)",
      }}
      onClick={onClose}
    >
      <div style={{ minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px 24px" }}>
        <motion.div
          initial={{ scale: 0.5, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.5, y: 50, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          style={{
            maxWidth: 400, width: "100%", position: "relative",
            borderRadius: 24, overflow: "hidden",
            background: CREAM_CARD,
            boxShadow: "0 30px 80px rgba(40,22,8,0.35), 0 0 0 1px rgba(158,126,97,0.18)",
            border: `1px solid ${WARM_BORDER}`,
          }}
          onClick={stopProp}
        >
          {/* Photo header */}
          <div style={{ position: "relative", width: "100%", overflow: "hidden", borderRadius: "24px 24px 0 0" }}>
            <div style={{ position: "relative", width: "100%", aspectRatio: "16/10" }}>
              <img src={photoUrl} alt={card.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(40,22,8,0.5), rgba(40,22,8,0.1))" }} />
            </div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 48, background: `linear-gradient(to top, ${CREAM_CARD}, transparent)` }} />

            <button onClick={onClose}
              style={{
                position: "absolute", top: 12, right: 12,
                width: 32, height: 32, borderRadius: "50%",
                background: "rgba(250,248,242,0.70)",
                backdropFilter: "blur(4px)",
                border: `1px solid ${WARM_BORDER}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", boxShadow: "0 2px 8px rgba(80,50,20,0.15)",
              }}>
              <X size={13} color={WARM} />
            </button>

            <motion.div
              initial={{ rotate: -30, scale: 0 }} animate={{ rotate: 8, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
              style={{
                position: "absolute", top: 12, left: 12,
                width: 36, height: 36, borderRadius: "50%",
                background: "rgba(250,248,242,0.70)",
                backdropFilter: "blur(4px)",
                border: "2px dashed rgba(158,126,97,0.40)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 8px rgba(80,50,20,0.12)",
                fontSize: 16,
              }}
            >💌</motion.div>

            <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
              <motion.span style={{ fontSize: 30, display: "inline-block" }} animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity }}>{card.emoji}</motion.span>
            </div>
          </div>

          <div style={{ textAlign: "center", padding: "8px 24px 0" }}>
            <h3 style={{ fontFamily: CURSIVE, fontSize: 20, fontWeight: 700, color: WARM, margin: 0 }}>{card.label}</h3>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "10px 32px" }}>
            <div style={{ height: 1, flex: 1, background: WARM_BORDER }} />
            <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              style={{ fontFamily: CURSIVE, fontSize: 14, color: WARM, opacity: 0.7 }}>♡</motion.span>
            <div style={{ height: 1, flex: 1, background: WARM_BORDER }} />
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ padding: "0 24px 8px" }}>
            <p style={{
              fontFamily: CURSIVE, fontSize: 15, lineHeight: 1.75,
              fontStyle: "italic", whiteSpace: "pre-line", color: "rgb(90, 60, 35)",
            }}>
              &ldquo;{card.letter}&rdquo;
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            style={{ padding: "8px 24px 20px", textAlign: "center" }}>
            <p style={{ fontFamily: CURSIVE, fontSize: 14, fontWeight: 700, color: WARM }}>With all my love 💕</p>
            <p style={{ fontFamily: CURSIVE, fontSize: 11, marginTop: 2, color: "rgba(108,74,46,0.55)" }}>— Forever yours</p>
            <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              style={{ fontSize: 24, display: "inline-block", margin: "10px 0" }}>💝</motion.span>
            <button onClick={onClose}
              style={{
                display: "block", width: "100%", padding: "10px 0", borderRadius: 12,
                border: `1px solid ${WARM_BORDER}`,
                background: "rgba(158,126,97,0.08)",
                fontFamily: CURSIVE, fontSize: 13, fontWeight: 600, color: WARM,
                cursor: "pointer", transition: "all 0.15s",
              }}>
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
        <CardItem key={`l-${i}`} card={card} photoUrl={photo} onClick={(c) => handleCardClick(c, photo)} />
      );
    }),
    [photos, handleCardClick],
  );

  const rightElements = useMemo(
    () => doubledRight.map((card, i) => {
      const photo = getPhotoForIndex(photos, i + 1);
      return (
        <CardItem key={`r-${i}`} card={card} photoUrl={photo} onClick={(c) => handleCardClick(c, photo)} />
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
      style={{ paddingTop: 20, paddingBottom: 96, height: "100svh", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 10 }}
    >
      {/* Title */}
      <h3 style={{
        fontFamily: CURSIVE,
        fontSize: "clamp(20px, 5vw, 30px)",
        fontWeight: 700,
        color: WARM,
        textAlign: "center",
        marginBottom: 8,
        padding: "0 16px",
        flexShrink: 0,
        textShadow: "0 2px 8px rgba(250,248,242,0.6)",
      }}>
        Our Memories 📸
      </h3>

      {/* Marquee */}
      <div style={{
        overflow: "hidden", margin: "0 16px 12px", padding: "6px 0", borderRadius: 12,
        background: "rgba(250,248,242,0.60)", border: `1px solid ${WARM_BORDER}`,
        flexShrink: 0,
      }}>
        <div className="marquee-track" style={{ display: "flex", gap: 32, whiteSpace: "nowrap", padding: "0 16px" }}>
          {doubledMarquee.map((item, i) => (
            <span key={i} style={{ fontFamily: CURSIVE, fontSize: 11, color: WARM, opacity: 0.7 }}>{item}</span>
          ))}
        </div>
      </div>

      {/* Two-column scroll */}
      <div style={{ display: "flex", gap: 10, padding: "0 12px", overflow: "hidden", flex: 1 }}>
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          <div className="scroll-col-up" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {leftElements}
          </div>
        </div>
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          <div className="scroll-col-down" style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 80 }}>
            {rightElements}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee-x { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes scroll-up { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
        @keyframes scroll-down { 0% { transform: translateY(-50%); } 100% { transform: translateY(0); } }
        .marquee-track { animation: marquee-x 22s linear infinite; will-change: transform; }
        .scroll-col-up { animation: scroll-up 30s linear infinite; will-change: transform; }
        .scroll-col-down { animation: scroll-down 32s linear infinite; will-change: transform; }
      `}</style>

      <AnimatePresence>
        {activeLetter && <LetterModal card={activeLetter.card} photoUrl={activeLetter.photo} onClose={closeModal} />}
      </AnimatePresence>
    </motion.div>
  );
});
