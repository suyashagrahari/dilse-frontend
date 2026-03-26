"use client";

import { memo, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { ContentData, PhotoItem } from "./types";

const WARM = "rgb(108, 74, 46)";
const WARM_BORDER = "rgba(158, 126, 97, 0.22)";
const CREAM_CARD = "rgba(250, 248, 242, 0.90)";
const CURSIVE = "'Dancing Script', 'Brush Script MT', cursive";

// ── Demo story cards (shown when user has no photos) ──────────────────────

interface StoryCard {
  emoji: string;
  bg: string;
  label: string;
  letter: string;
}

const demoCards: StoryCard[] = [
  { emoji: "🌅", bg: "linear-gradient(135deg, #c9956c, #e8b89a)", label: "Golden Hour",    letter: "Every sunset reminds me of the warmth you bring into my life.\nThe way the light dances in your eyes makes every evening magical.\nYou are my golden hour, forever and always 🌅" },
  { emoji: "🌸", bg: "linear-gradient(135deg, #d4a5a5, #e8c5c5)", label: "Cherry Blossoms",letter: "Like cherry blossoms in spring, our love blooms more beautifully with each passing day.\nYou are my favorite season, my sweetest chapter, my forever bloom 🌸" },
  { emoji: "🎆", bg: "linear-gradient(135deg, #9e7e6e, #b8948a)", label: "Fireworks",       letter: "Every moment with you feels like fireworks — bright, beautiful, and absolutely breathtaking.\nYou light up my world like nobody else 🎆" },
  { emoji: "💕", bg: "linear-gradient(135deg, #b4665e, #c97878)", label: "Our Song",         letter: "Every melody reminds me of you.\nYou are the music in my life, the rhythm of my heart, the lyrics of my soul 🎵" },
  { emoji: "🧁", bg: "linear-gradient(135deg, #c47e7e, #d49a9a)", label: "Sweet Surprise",   letter: "You are the sweetest surprise life ever gave me.\nEvery day with you is a gift I never want to stop unwrapping 🧁" },
  { emoji: "🌺", bg: "linear-gradient(135deg, #b86060, #cb8080)", label: "Spring Day",        letter: "You brought spring into my life when everything was winter.\nYou are my bloom, my sunshine, my warmth 🌺" },
  { emoji: "✨", bg: "linear-gradient(135deg, #c4826a, #d8a090)", label: "Date Night",        letter: "Our date nights are my favorite.\nWhether it's a fancy dinner or just staying in, every moment with you is perfect ✨" },
  { emoji: "🌙", bg: "linear-gradient(135deg, #6e7e8e, #8e9eae)", label: "Stargazing",        letter: "Under the stars with you, I realized that no constellation could ever be as beautiful\nas the universe we've built together 🌙" },
  { emoji: "🌹", bg: "linear-gradient(135deg, #a85858, #c47878)", label: "Forever Yours",     letter: "I promise to love you through every season, every storm, and every sunrise.\nYou are my forever, my always 🌹" },
  { emoji: "⭐", bg: "linear-gradient(135deg, #c4a060, #d4b870)", label: "Wishing Star",      letter: "I used to wish upon stars, but then I found you.\nMy greatest wish came true, and I'm never letting go ⭐" },
  { emoji: "💐", bg: "linear-gradient(135deg, #7e9e8e, #9ebaa0)", label: "Special Moment",    letter: "In the quietest moments with you, I find the loudest happiness.\nYou are my forever peace, my calm in every storm 💐" },
  { emoji: "✈️", bg: "linear-gradient(135deg, #7e9ea8, #9ebec8)", label: "Adventure",         letter: "With you, even getting lost is an adventure I'd choose every single time ✈️" },
];

const DEFAULT_PHOTOS = [
  "/assets/couple1.jpeg",
  "/assets/couple2.jpeg",
  "/assets/couple3.jpeg",
  "/assets/couple4.jpeg",
];

const marqueeItems = [
  "Every love story is beautiful, but ours is my favorite 💕",
  "You are my today and all of my tomorrows 🥺",
  "In your arms, I found my home ✨",
  "My heart beats only for you 💖",
  "Together is a wonderful place to be 🌹",
  "You're the reason I believe in love 💌",
];
const doubledMarquee = [...marqueeItems, ...marqueeItems];

// ── User Photo Letter Modal ────────────────────────────────────────────────

const UserPhotoModal = memo(function UserPhotoModal({
  photo, index, total, onClose, onPrev, onNext,
}: {
  photo: PhotoItem; index: number; total: number;
  onClose: () => void; onPrev: () => void; onNext: () => void;
}) {
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
      <div style={{ minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
        <motion.div
          initial={{ scale: 0.85, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.85, y: 40, opacity: 0 }}
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
          {/* Photo */}
          <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", overflow: "hidden" }}>
            <img
              src={photo.url}
              alt=""
              style={{
                width: "100%", height: "100%", objectFit: "cover", display: "block",
                objectPosition: `${photo.cropX}% ${photo.cropY}%`,
              }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(40,22,8,0.45), rgba(40,22,8,0.05))" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 56, background: `linear-gradient(to top, ${CREAM_CARD}, transparent)` }} />

            <button onClick={onClose}
              style={{
                position: "absolute", top: 12, right: 12,
                width: 32, height: 32, borderRadius: "50%",
                background: "rgba(250,248,242,0.75)", backdropFilter: "blur(4px)",
                border: `1px solid ${WARM_BORDER}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", boxShadow: "0 2px 8px rgba(80,50,20,0.15)",
              }}>
              <X size={13} color={WARM} />
            </button>

            <motion.div
              initial={{ rotate: -30, scale: 0 }} animate={{ rotate: 8, scale: 1 }}
              transition={{ delay: 0.25, type: "spring", stiffness: 300 }}
              style={{
                position: "absolute", top: 12, left: 12,
                width: 36, height: 36, borderRadius: "50%",
                background: "rgba(250,248,242,0.75)", backdropFilter: "blur(4px)",
                border: "2px dashed rgba(158,126,97,0.40)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 8px rgba(80,50,20,0.12)", fontSize: 16,
              }}
            >💌</motion.div>

            <div style={{
              position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)",
              fontFamily: CURSIVE, fontSize: 11, color: "rgba(108,74,46,0.6)", whiteSpace: "nowrap",
            }}>
              {index + 1} / {total}
            </div>
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 28px 0" }}>
            <div style={{ height: 1, flex: 1, background: WARM_BORDER }} />
            <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              style={{ fontFamily: CURSIVE, fontSize: 14, color: WARM, opacity: 0.7 }}>♡</motion.span>
            <div style={{ height: 1, flex: 1, background: WARM_BORDER }} />
          </div>

          {/* Letter */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ padding: "10px 24px 16px" }}>
            {photo.letter ? (
              <p style={{
                fontFamily: CURSIVE, fontSize: 15, lineHeight: 1.75,
                fontStyle: "italic", whiteSpace: "pre-line", color: "rgb(90, 60, 35)",
              }}>
                &ldquo;{photo.letter}&rdquo;
              </p>
            ) : (
              <p style={{ fontFamily: CURSIVE, fontSize: 14, color: "rgba(108,74,46,0.45)", textAlign: "center", fontStyle: "italic" }}>
                No letter added for this photo.
              </p>
            )}
          </motion.div>

          {/* Nav + Close */}
          <div style={{ display: "flex", gap: 8, padding: "0 24px 20px" }}>
            <button onClick={onPrev} disabled={index === 0}
              style={{
                flex: 1, padding: "9px 0", borderRadius: 10,
                border: `1px solid ${WARM_BORDER}`,
                background: "rgba(158,126,97,0.06)",
                fontFamily: CURSIVE, fontSize: 13, color: WARM,
                cursor: index === 0 ? "not-allowed" : "pointer",
                opacity: index === 0 ? 0.4 : 1,
              }}>← Prev</button>
            <button onClick={onClose}
              style={{
                flex: 1, padding: "9px 0", borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg, rgb(158,126,97), rgb(120,85,55))",
                fontFamily: CURSIVE, fontSize: 13, color: "#fff", fontWeight: 700,
                cursor: "pointer",
              }}>Close 💕</button>
            <button onClick={onNext} disabled={index === total - 1}
              style={{
                flex: 1, padding: "9px 0", borderRadius: 10,
                border: `1px solid ${WARM_BORDER}`,
                background: "rgba(158,126,97,0.06)",
                fontFamily: CURSIVE, fontSize: 13, color: WARM,
                cursor: index === total - 1 ? "not-allowed" : "pointer",
                opacity: index === total - 1 ? 0.4 : 1,
              }}>Next →</button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
});

// ── Demo Letter Modal (for default cards) ─────────────────────────────────

const DemoLetterModal = memo(function DemoLetterModal({
  card, photoUrl, onClose,
}: { card: StoryCard; photoUrl: string; onClose: () => void }) {
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
      <div style={{ minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
        <motion.div
          initial={{ scale: 0.85, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.85, y: 40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          style={{
            maxWidth: 400, width: "100%", borderRadius: 24, overflow: "hidden",
            background: CREAM_CARD,
            boxShadow: "0 30px 80px rgba(40,22,8,0.35), 0 0 0 1px rgba(158,126,97,0.18)",
          }}
          onClick={stopProp}
        >
          <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", overflow: "hidden" }}>
            <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(40,22,8,0.5), rgba(40,22,8,0.1))" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, background: `linear-gradient(to top, ${CREAM_CARD}, transparent)` }} />
            <button onClick={onClose} style={{
              position: "absolute", top: 12, right: 12,
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(250,248,242,0.70)", backdropFilter: "blur(4px)",
              border: `1px solid ${WARM_BORDER}`,
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}>
              <X size={13} color={WARM} />
            </button>
          </div>

          <div style={{ padding: "16px 24px 20px" }}>
            <h3 style={{ fontFamily: CURSIVE, fontSize: 20, fontWeight: 700, color: WARM, margin: "0 0 8px", textAlign: "center" }}>
              {card.emoji} {card.label}
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0 12px" }}>
              <div style={{ height: 1, flex: 1, background: WARM_BORDER }} />
              <span style={{ fontFamily: CURSIVE, fontSize: 14, color: WARM, opacity: 0.6 }}>♡</span>
              <div style={{ height: 1, flex: 1, background: WARM_BORDER }} />
            </div>
            <p style={{
              fontFamily: CURSIVE, fontSize: 15, lineHeight: 1.75,
              fontStyle: "italic", whiteSpace: "pre-line", color: "rgb(90,60,35)",
            }}>
              &ldquo;{card.letter}&rdquo;
            </p>
            <button onClick={onClose}
              style={{
                display: "block", width: "100%", marginTop: 16, padding: "10px 0", borderRadius: 12,
                border: `1px solid ${WARM_BORDER}`, background: "rgba(158,126,97,0.08)",
                fontFamily: CURSIVE, fontSize: 13, fontWeight: 600, color: WARM, cursor: "pointer",
              }}>
              Close Letter 💕
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
});

// ── User Photo Card ────────────────────────────────────────────────────────

const UserPhotoCard = memo(function UserPhotoCard({
  photo, onClick,
}: { photo: PhotoItem; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        width: "100%", overflow: "hidden", borderRadius: 16,
        border: `1px solid ${WARM_BORDER}`,
        background: CREAM_CARD,
        boxShadow: "0 4px 16px rgba(80,50,20,0.12)",
        cursor: "pointer", padding: 0,
      }}
    >
      <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", overflow: "hidden", borderRadius: "16px 16px 0 0" }}>
        <img
          src={photo.url} alt=""
          style={{
            width: "100%", height: "100%", objectFit: "cover", display: "block",
            objectPosition: `${photo.cropX}% ${photo.cropY}%`,
          }}
          loading="lazy"
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(80,50,20,0.30), transparent)" }} />
        {photo.letter && (
          <div style={{ position: "absolute", bottom: 8, left: 8 }}>
            <span style={{
              fontFamily: CURSIVE, fontSize: 11, fontWeight: 600,
              color: "rgba(250,248,242,0.95)",
              background: "rgba(80,50,20,0.55)", backdropFilter: "blur(4px)",
              borderRadius: 999, padding: "2px 10px",
            }}>
              has letter 💌
            </span>
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "8px 12px", width: "100%" }}>
        <span style={{ fontFamily: CURSIVE, fontSize: 11, fontWeight: 600, color: WARM, display: "flex", alignItems: "center", gap: 4 }}>
          Open Memory <span className="letter-pulse">💌</span>
        </span>
      </div>
      <style jsx>{`
        .letter-pulse { animation: lp 1.5s ease-in-out infinite; display: inline-block; }
        @keyframes lp { 0%,100% { transform: scale(1); } 50% { transform: scale(1.2); } }
      `}</style>
    </button>
  );
});

// ── Demo Card ────────────────────────────────────────────────────────────

const DemoCard = memo(function DemoCard({
  card, photoUrl, onClick,
}: { card: StoryCard; photoUrl: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", flexDirection: "column", width: "100%", overflow: "hidden",
        borderRadius: 16, border: `1px solid ${WARM_BORDER}`, background: CREAM_CARD,
        boxShadow: "0 4px 16px rgba(80,50,20,0.12)", cursor: "pointer", padding: 0,
      }}
    >
      <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", borderRadius: "16px 16px 0 0", overflow: "hidden" }}>
        <img src={photoUrl} alt={card.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(80,50,20,0.35), transparent)" }} />
        <div style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%",
          background: "rgba(250,248,242,0.80)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
          {card.emoji}
        </div>
        <div style={{ position: "absolute", bottom: 8, left: 8 }}>
          <span style={{
            fontFamily: CURSIVE, fontSize: 11, fontWeight: 600,
            color: "rgba(250,248,242,0.95)", background: "rgba(80,50,20,0.55)",
            backdropFilter: "blur(4px)", borderRadius: 999, padding: "2px 10px",
          }}>
            {card.label}
          </span>
        </div>
      </div>
      <div style={{ padding: "8px 12px" }}>
        <span style={{ fontFamily: CURSIVE, fontSize: 11, fontWeight: 600, color: WARM }}>
          Open Letter <span>💌</span>
        </span>
      </div>
    </button>
  );
});

// ── Main GallerySection ────────────────────────────────────────────────────

interface Props { data: ContentData; }

export default memo(function GallerySection({ data }: Props) {
  const [activeUserPhoto, setActiveUserPhoto] = useState<number | null>(null);
  const [activeDemoCard, setActiveDemoCard] = useState<{ card: StoryCard; photo: string } | null>(null);

  const userPhotos = (data.galleryPhotos || []).filter((p) => p.url);
  const hasUserPhotos = userPhotos.length > 0;

  // Build column arrays — duplicate to fill for infinite scroll effect
  const leftItems = useMemo(() => {
    if (hasUserPhotos) {
      const doubled = [...userPhotos, ...userPhotos, ...userPhotos];
      return doubled.filter((_, i) => i % 2 === 0);
    }
    const doubled = [...demoCards, ...demoCards];
    return doubled.filter((_, i) => i % 2 === 0);
  }, [hasUserPhotos, userPhotos]);

  const rightItems = useMemo(() => {
    if (hasUserPhotos) {
      const doubled = [...userPhotos, ...userPhotos, ...userPhotos];
      return doubled.filter((_, i) => i % 2 !== 0);
    }
    const doubled = [...demoCards, ...demoCards];
    return doubled.filter((_, i) => i % 2 !== 0);
  }, [hasUserPhotos, userPhotos]);

  const defaultPhotos = DEFAULT_PHOTOS;

  const handleUserClick = useCallback((idx: number) => setActiveUserPhoto(idx % userPhotos.length), [userPhotos.length]);
  const handleDemoClick = useCallback((card: StoryCard, photo: string) => setActiveDemoCard({ card, photo }), []);

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
        fontFamily: CURSIVE, fontSize: "clamp(20px, 5vw, 30px)", fontWeight: 700,
        color: WARM, textAlign: "center", marginBottom: 8, padding: "0 16px", flexShrink: 0,
        textShadow: "0 2px 8px rgba(250,248,242,0.6)",
      }}>
        {hasUserPhotos ? `Our Memories 📸 (${userPhotos.length})` : "Our Memories 📸"}
      </h3>

      {/* Marquee */}
      <div style={{
        overflow: "hidden", margin: "0 16px 12px", padding: "6px 0", borderRadius: 12,
        background: "rgba(250,248,242,0.60)", border: `1px solid ${WARM_BORDER}`, flexShrink: 0,
      }}>
        <div className="marquee-track" style={{ display: "flex", gap: 32, whiteSpace: "nowrap", padding: "0 16px" }}>
          {doubledMarquee.map((item, i) => (
            <span key={i} style={{ fontFamily: CURSIVE, fontSize: 11, color: WARM, opacity: 0.7 }}>{item}</span>
          ))}
        </div>
      </div>

      {/* Two-column scroll */}
      <div style={{ display: "flex", gap: 10, padding: "0 12px", overflow: "hidden", flex: 1 }}>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div className="scroll-col-up" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {leftItems.map((item, i) =>
              hasUserPhotos ? (
                <UserPhotoCard key={`l-${i}`} photo={item as PhotoItem} onClick={() => handleUserClick(i * 2)} />
              ) : (
                <DemoCard key={`l-${i}`} card={item as StoryCard} photoUrl={defaultPhotos[i % defaultPhotos.length]} onClick={() => handleDemoClick(item as StoryCard, defaultPhotos[i % defaultPhotos.length])} />
              )
            )}
          </div>
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div className="scroll-col-down" style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 80 }}>
            {rightItems.map((item, i) =>
              hasUserPhotos ? (
                <UserPhotoCard key={`r-${i}`} photo={item as PhotoItem} onClick={() => handleUserClick(i * 2 + 1)} />
              ) : (
                <DemoCard key={`r-${i}`} card={item as StoryCard} photoUrl={defaultPhotos[(i + 1) % defaultPhotos.length]} onClick={() => handleDemoClick(item as StoryCard, defaultPhotos[(i + 1) % defaultPhotos.length])} />
              )
            )}
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
        {activeUserPhoto !== null && (
          <UserPhotoModal
            photo={userPhotos[activeUserPhoto]}
            index={activeUserPhoto}
            total={userPhotos.length}
            onClose={() => setActiveUserPhoto(null)}
            onPrev={() => setActiveUserPhoto((p) => Math.max(0, (p ?? 0) - 1))}
            onNext={() => setActiveUserPhoto((p) => Math.min(userPhotos.length - 1, (p ?? 0) + 1))}
          />
        )}
        {activeDemoCard && (
          <DemoLetterModal
            card={activeDemoCard.card}
            photoUrl={activeDemoCard.photo}
            onClose={() => setActiveDemoCard(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
});
