"use client";

import { memo, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X } from "lucide-react";
import type { ContentData, PhotoItem } from "./types";

const PINK       = "#ff3d6b";
const GRAD       = "linear-gradient(135deg, #ff3d6b 0%, #a855f7 100%)";
const CARD       = "rgba(255,255,255,0.06)";
const CARD_BORDER = "rgba(255,255,255,0.09)";
const TEXT_DIM   = "rgba(255,255,255,0.50)";

const USER_MEMORY_LABELS = [
  "Sweet Moment", "Golden Hour", "Us", "Together", "Love Note", "Favorite Day",
  "Forever", "Captured", "Our Day", "Special",
];
const USER_CORNER_EMOJIS = ["💌", "💕", "✨", "🌹", "💗", "🌙", "⭐", "🌸"];

interface StoryCard { emoji: string; bg: string; label: string; letter: string; }

const demoCards: StoryCard[] = [
  { emoji: "🌅", bg: "linear-gradient(135deg, rgba(255,61,107,0.70), rgba(200,80,60,0.65))",   label: "Golden Hour",     letter: "Every sunset reminds me of the warmth you bring into my life.\nThe way the light dances in your eyes makes every evening magical.\nYou are my golden hour, forever and always 🌅" },
  { emoji: "🌸", bg: "linear-gradient(135deg, rgba(168,85,247,0.70), rgba(130,60,200,0.65))",   label: "Cherry Blossoms", letter: "Like cherry blossoms in spring, our love blooms more beautifully with each passing day.\nYou are my favorite season, my sweetest chapter, my forever bloom 🌸" },
  { emoji: "🎆", bg: "linear-gradient(135deg, rgba(100,80,220,0.75), rgba(80,60,200,0.70))",    label: "Fireworks",       letter: "Every moment with you feels like fireworks — bright, beautiful, and absolutely breathtaking.\nYou light up my world like nobody else 🎆" },
  { emoji: "💕", bg: "linear-gradient(135deg, rgba(255,61,107,0.70), rgba(168,85,247,0.65))",   label: "Our Song",        letter: "Every melody reminds me of you.\nYou are the music in my life, the rhythm of my heart, the lyrics of my soul 🎵" },
  { emoji: "🧁", bg: "linear-gradient(135deg, rgba(220,80,140,0.70), rgba(180,60,120,0.65))",   label: "Sweet Surprise",  letter: "You are the sweetest surprise life ever gave me.\nEvery day with you is a gift I never want to stop unwrapping 🧁" },
  { emoji: "🌺", bg: "linear-gradient(135deg, rgba(255,80,100,0.70), rgba(220,50,80,0.65))",    label: "Spring Day",      letter: "You brought spring into my life when everything was winter.\nYou are my bloom, my sunshine, my warmth 🌺" },
  { emoji: "✨", bg: "linear-gradient(135deg, rgba(168,85,247,0.75), rgba(130,60,220,0.70))",   label: "Date Night",      letter: "Our date nights are my favorite.\nWhether it's a fancy dinner or just staying in, every moment with you is perfect ✨" },
  { emoji: "🌙", bg: "linear-gradient(135deg, rgba(60,80,200,0.75), rgba(40,60,180,0.70))",     label: "Stargazing",      letter: "Under the stars with you, I realized that no constellation could ever be as beautiful\nas the universe we've built together 🌙" },
  { emoji: "🌹", bg: "linear-gradient(135deg, rgba(255,40,90,0.70), rgba(200,20,70,0.65))",     label: "Forever Yours",   letter: "I promise to love you through every season, every storm, and every sunrise.\nYou are my forever, my always 🌹" },
  { emoji: "⭐", bg: "linear-gradient(135deg, rgba(255,180,60,0.70), rgba(220,140,30,0.65))",   label: "Wishing Star",    letter: "I used to wish upon stars, but then I found you.\nMy greatest wish came true, and I'm never letting go ⭐" },
  { emoji: "💐", bg: "linear-gradient(135deg, rgba(60,180,140,0.70), rgba(40,160,120,0.65))",   label: "Special Moment",  letter: "In the quietest moments with you, I find the loudest happiness.\nYou are my forever peace, my calm in every storm 💐" },
  { emoji: "✈️", bg: "linear-gradient(135deg, rgba(60,140,255,0.70), rgba(40,100,220,0.65))",   label: "Adventure",       letter: "With you, even getting lost is an adventure I'd choose every single time ✈️" },
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

// ── User Photo Letter Modal ───────────────────────────────────────────────

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
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)",
      }}
      onClick={onClose}
    >
      <div style={{ minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
        <motion.div
          initial={{ scale: 0.88, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.88, y: 30, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          style={{
            maxWidth: 400, width: "100%",
            borderRadius: 24, overflow: "hidden",
            background: "rgba(18,14,34,0.98)",
            border: `1px solid ${CARD_BORDER}`,
            boxShadow: "0 30px 80px rgba(0,0,0,0.70)",
          }}
          onClick={stopProp}
        >
          <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", overflow: "hidden" }}>
            <img src={photo.url} alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover",
                objectPosition: `${photo.cropX}% ${photo.cropY}%` }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)" }} />
            <button onClick={onClose} style={{
              position: "absolute", top: 12, right: 12,
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
              border: `1px solid ${CARD_BORDER}`,
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}>
              <X size={13} color="rgba(255,255,255,0.70)" />
            </button>
            <motion.div
              initial={{ rotate: -30, scale: 0 }} animate={{ rotate: 8, scale: 1 }}
              transition={{ delay: 0.25, type: "spring", stiffness: 300 }}
              style={{
                position: "absolute", top: 12, left: 12,
                width: 36, height: 36, borderRadius: "50%",
                background: "rgba(0,0,0,0.65)",
                border: "2px dashed rgba(255,61,107,0.45)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
              }}
            >💌</motion.div>
            <div style={{
              position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)",
              fontSize: 11, color: "rgba(255,255,255,0.50)", whiteSpace: "nowrap",
            }}>
              {index + 1} / {total}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 24px 0" }}>
            <div style={{ height: 1, flex: 1, background: CARD_BORDER }} />
            <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              style={{ fontSize: 14, color: PINK }}>♡</motion.span>
            <div style={{ height: 1, flex: 1, background: CARD_BORDER }} />
          </div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            style={{ padding: "10px 24px 16px" }}>
            {photo.letter ? (
              <p style={{ fontSize: 15, lineHeight: 1.75, fontStyle: "italic", whiteSpace: "pre-line", color: "rgba(255,255,255,0.85)" }}>
                &ldquo;{photo.letter}&rdquo;
              </p>
            ) : (
              <p style={{ fontSize: 14, color: TEXT_DIM, textAlign: "center", fontStyle: "italic" }}>
                No letter added for this photo.
              </p>
            )}
          </motion.div>

          <div style={{ display: "flex", gap: 8, padding: "0 24px 20px" }}>
            <button onClick={onPrev} disabled={index === 0}
              style={{
                flex: 1, padding: "9px 0", borderRadius: 10,
                border: `1px solid ${CARD_BORDER}`, background: CARD,
                fontSize: 13, color: "rgba(255,255,255,0.60)",
                cursor: index === 0 ? "not-allowed" : "pointer",
                opacity: index === 0 ? 0.4 : 1,
              }}>← Prev</button>
            <button onClick={onClose}
              style={{
                flex: 1, padding: "9px 0", borderRadius: 10, border: "none",
                background: GRAD,
                fontSize: 13, color: "#fff", fontWeight: 700, cursor: "pointer",
              }}>Close 💕</button>
            <button onClick={onNext} disabled={index === total - 1}
              style={{
                flex: 1, padding: "9px 0", borderRadius: 10,
                border: `1px solid ${CARD_BORDER}`, background: CARD,
                fontSize: 13, color: "rgba(255,255,255,0.60)",
                cursor: index === total - 1 ? "not-allowed" : "pointer",
                opacity: index === total - 1 ? 0.4 : 1,
              }}>Next →</button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
});

// ── Demo Letter Modal ─────────────────────────────────────────────────────

const DemoLetterModal = memo(function DemoLetterModal({
  card, photoUrl, onClose,
}: { card: StoryCard; photoUrl: string; onClose: () => void }) {
  const stopProp = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 999, overflowY: "auto",
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)",
      }}
      onClick={onClose}
    >
      <div style={{ minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
        <motion.div
          initial={{ scale: 0.88, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.88, y: 30, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          style={{
            maxWidth: 400, width: "100%", borderRadius: 24, overflow: "hidden",
            background: "rgba(18,14,34,0.98)",
            border: `1px solid ${CARD_BORDER}`,
            boxShadow: "0 30px 80px rgba(0,0,0,0.70)",
          }}
          onClick={stopProp}
        >
          <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", overflow: "hidden" }}>
            <img src={photoUrl} alt={card.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.65), transparent)" }} />
            <button onClick={onClose} style={{
              position: "absolute", top: 12, right: 12,
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
              border: `1px solid ${CARD_BORDER}`,
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}>
              <X size={13} color="rgba(255,255,255,0.70)" />
            </button>
          </div>

          <div style={{ padding: "16px 24px 20px" }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, textAlign: "center", margin: "0 0 8px",
              background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {card.emoji} {card.label}
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0 12px" }}>
              <div style={{ height: 1, flex: 1, background: CARD_BORDER }} />
              <span style={{ fontSize: 14, color: PINK, opacity: 0.7 }}>♡</span>
              <div style={{ height: 1, flex: 1, background: CARD_BORDER }} />
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.75, fontStyle: "italic", whiteSpace: "pre-line", color: "rgba(255,255,255,0.85)" }}>
              &ldquo;{card.letter}&rdquo;
            </p>
            <button onClick={onClose}
              style={{
                display: "block", width: "100%", marginTop: 16, padding: "10px 0", borderRadius: 12,
                border: `1px solid ${CARD_BORDER}`, background: CARD,
                fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.65)", cursor: "pointer",
              }}>
              Close Letter 💕
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
});

// ── User Photo Card ───────────────────────────────────────────────────────

const UserPhotoCard = memo(function UserPhotoCard({
  photo, photoIndex, onClick,
}: { photo: PhotoItem; photoIndex: number; onClick: () => void }) {
  const cornerEmoji = USER_CORNER_EMOJIS[photoIndex % USER_CORNER_EMOJIS.length];
  const memoryLabel = USER_MEMORY_LABELS[photoIndex % USER_MEMORY_LABELS.length];

  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", flexDirection: "column", width: "100%", overflow: "hidden",
        borderRadius: 16, border: `1px solid ${CARD_BORDER}`, background: CARD,
        cursor: "pointer", padding: 0,
        boxShadow: "0 4px 16px rgba(0,0,0,0.30)",
      }}
    >
      <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", overflow: "hidden", borderRadius: "16px 16px 0 0" }}>
        <img src={photo.url} alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover",
            objectPosition: `${photo.cropX}% ${photo.cropY}%` }}
          loading="lazy" />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.60), rgba(0,0,0,0.10))" }} />
        <div style={{
          position: "absolute", top: 8, right: 8,
          width: 28, height: 28, borderRadius: "50%",
          background: "rgba(0,0,0,0.70)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
        }}>
          {cornerEmoji}
        </div>
        <div style={{ position: "absolute", bottom: 8, left: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.90)",
            background: "rgba(0,0,0,0.60)", backdropFilter: "blur(4px)",
            borderRadius: 999, padding: "2px 10px",
          }}>
            {memoryLabel}
          </span>
        </div>
      </div>
      <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: PINK }}>Open Letter</span>
        <span style={{ fontSize: 14 }} aria-hidden>💌</span>
      </div>
    </button>
  );
});

// ── Demo Card ─────────────────────────────────────────────────────────────

const DemoCard = memo(function DemoCard({ card, photoUrl, onClick }: { card: StoryCard; photoUrl: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", flexDirection: "column", width: "100%", overflow: "hidden",
        borderRadius: 16, border: `1px solid ${CARD_BORDER}`, background: CARD,
        cursor: "pointer", padding: 0,
        boxShadow: "0 4px 16px rgba(0,0,0,0.30)",
      }}
    >
      <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", borderRadius: "16px 16px 0 0", overflow: "hidden" }}>
        <img src={photoUrl} alt={card.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.60), rgba(0,0,0,0.10))" }} />
        <div style={{
          position: "absolute", top: 8, right: 8,
          width: 28, height: 28, borderRadius: "50%",
          background: "rgba(0,0,0,0.70)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
        }}>
          {card.emoji}
        </div>
        <div style={{ position: "absolute", bottom: 8, left: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.90)",
            background: "rgba(0,0,0,0.60)", backdropFilter: "blur(4px)",
            borderRadius: 999, padding: "2px 10px",
          }}>
            {card.label}
          </span>
        </div>
      </div>
      <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: PINK }}>Open Letter</span>
        <span style={{ fontSize: 14 }} aria-hidden>💌</span>
      </div>
    </button>
  );
});

// ── Main ──────────────────────────────────────────────────────────────────

interface Props {
  data: ContentData;
  /** Editor mobile: title lives in page top bar; section shows title again from `lg` up only. */
  titleInTopBar?: boolean;
}

function GalleryHeading({
  hasUser,
  userCount,
  titleInTopBar,
}: {
  hasUser: boolean;
  userCount: number;
  titleInTopBar: boolean;
}) {
  const inner = (
    <>
      <h3
        style={{
          margin: 0,
          padding: 0,
          fontSize: "1em",
          fontWeight: 800,
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
          background: GRAD,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: "100%",
        }}
      >
        {hasUser ? `Our Memories (${userCount})` : "Our Memories"}
      </h3>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          lineHeight: 0,
          transform: "translateY(0.08em)",
        }}
        aria-hidden
      >
        <Camera
          color={PINK}
          strokeWidth={2.25}
          style={{ width: "0.9em", height: "0.9em", display: "block" }}
        />
      </span>
    </>
  );

  if (titleInTopBar) {
    return <div className="drl-gallery-heading-desktop">{inner}</div>;
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.38em",
        marginBottom: 8,
        padding: "0 16px",
        flexShrink: 0,
        width: "100%",
        fontSize: "clamp(20px, 5vw, 28px)",
      }}
    >
      {inner}
    </div>
  );
}

export default memo(function GallerySection({ data, titleInTopBar = false }: Props) {
  const [activeUserPhoto, setActiveUserPhoto] = useState<number | null>(null);
  const [activeDemoCard, setActiveDemoCard] = useState<{ card: StoryCard; photo: string } | null>(null);

  const userPhotos  = (data.galleryPhotos || []).filter((p) => p.url);
  const hasUser     = userPhotos.length > 0;

  const leftItems = useMemo(() => {
    const src = hasUser ? [...userPhotos, ...userPhotos, ...userPhotos] : [...demoCards, ...demoCards];
    return src.filter((_, i) => i % 2 === 0);
  }, [hasUser, userPhotos]);

  const rightItems = useMemo(() => {
    const src = hasUser ? [...userPhotos, ...userPhotos, ...userPhotos] : [...demoCards, ...demoCards];
    return src.filter((_, i) => i % 2 !== 0);
  }, [hasUser, userPhotos]);

  const handleUserClick  = useCallback((idx: number) => setActiveUserPhoto(idx % userPhotos.length), [userPhotos.length]);
  const handleDemoClick  = useCallback((card: StoryCard, photo: string) => setActiveDemoCard({ card, photo }), []);

  return (
    <>
      <style jsx global>{`
        .drl-gallery-root-pad {
          padding-top: max(46px, calc(env(safe-area-inset-top, 0px) + 38px));
        }
        @media (min-width: 1024px) {
          .drl-gallery-root-pad {
            padding-top: 20px;
          }
        }
        .drl-gallery-heading-desktop {
          display: none;
          margin-bottom: 10px;
          padding: 0 16px;
          flex-shrink: 0;
          width: 100%;
          font-size: clamp(20px, 5vw, 28px);
          align-items: center;
          justify-content: center;
          gap: 0.38em;
        }
        @media (min-width: 1024px) {
          .drl-gallery-heading-desktop {
            display: flex;
            font-size: clamp(22px, 2.4vw, 34px);
            margin-bottom: 14px;
          }
        }
        @keyframes drl-marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes drl-scroll-up {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        @keyframes drl-scroll-down {
          0% {
            transform: translateY(-50%);
          }
          100% {
            transform: translateY(0);
          }
        }
        .drl-marquee-track {
          animation: drl-marquee 22s linear infinite;
          will-change: transform;
        }
        .drl-scroll-up {
          animation: drl-scroll-up 30s linear infinite;
          will-change: transform;
        }
        .drl-scroll-down {
          animation: drl-scroll-down 32s linear infinite;
          will-change: transform;
        }
      `}</style>
      <motion.div
        key="gallery"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
        className={`pb-24 lg:pb-10 ${titleInTopBar ? "drl-gallery-root-pad" : ""}`}
        style={{
          paddingTop: titleInTopBar
            ? undefined
            : "max(72px, calc(env(safe-area-inset-top, 0px) + 52px))",
          height: "100svh", display: "flex", flexDirection: "column",
          overflow: "hidden", position: "relative", zIndex: 10,
          background: "#0d0b18",
        }}
      >
      <GalleryHeading
        hasUser={hasUser}
        userCount={userPhotos.length}
        titleInTopBar={titleInTopBar}
      />

      <div className="flex flex-1 min-h-0 w-full flex-col lg:max-w-[min(1320px,calc(100vw-7rem))] lg:mx-auto lg:px-8 xl:px-10">
      {/* Marquee */}
      <div
        className="mx-4 mb-3 shrink-0 overflow-hidden rounded-xl lg:mx-0 lg:mb-4"
        style={{
          padding: "8px 0",
          background: CARD, border: `1px solid ${CARD_BORDER}`,
        }}
      >
        <div className="drl-marquee-track flex gap-8 whitespace-nowrap px-4 lg:gap-10 lg:px-5">
          {doubledMarquee.map((item, i) => (
            <span key={i} className="text-xs font-medium tracking-wide lg:text-sm" style={{ color: TEXT_DIM }}>{item}</span>
          ))}
        </div>
      </div>

      {/* Two-column auto-scroll grid */}
      <div className="flex min-h-0 flex-1 gap-2.5 overflow-hidden px-3 lg:gap-5 lg:px-0">
        <div className="min-h-0 flex-1 overflow-hidden">
          <div className="drl-scroll-up flex flex-col gap-2.5 lg:gap-5">
            {leftItems.map((item, i) =>
              hasUser ? (
                <UserPhotoCard
                  key={`l-${i}`}
                  photo={item as PhotoItem}
                  photoIndex={i * 2}
                  onClick={() => handleUserClick(i * 2)}
                />
              ) : (
                <DemoCard key={`l-${i}`} card={item as StoryCard}
                  photoUrl={DEFAULT_PHOTOS[i % DEFAULT_PHOTOS.length]}
                  onClick={() => handleDemoClick(item as StoryCard, DEFAULT_PHOTOS[i % DEFAULT_PHOTOS.length])} />
              )
            )}
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          <div className="drl-scroll-down flex flex-col gap-2.5 pt-20 lg:gap-5 lg:pt-14">
            {rightItems.map((item, i) =>
              hasUser ? (
                <UserPhotoCard
                  key={`r-${i}`}
                  photo={item as PhotoItem}
                  photoIndex={i * 2 + 1}
                  onClick={() => handleUserClick(i * 2 + 1)}
                />
              ) : (
                <DemoCard key={`r-${i}`} card={item as StoryCard}
                  photoUrl={DEFAULT_PHOTOS[(i + 1) % DEFAULT_PHOTOS.length]}
                  onClick={() => handleDemoClick(item as StoryCard, DEFAULT_PHOTOS[(i + 1) % DEFAULT_PHOTOS.length])} />
              )
            )}
          </div>
        </div>
      </div>
      </div>

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
    </>
  );
});
