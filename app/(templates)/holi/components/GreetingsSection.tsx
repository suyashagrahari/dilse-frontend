"use client";

import { memo, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Languages, Heart } from "lucide-react";
import Image from "next/image";
import type { HoliData, GreetingCard } from "./types";

const GreetingModal = memo(function GreetingModal({
  card,
  senderName,
  onClose,
}: {
  card: GreetingCard;
  senderName: string;
  onClose: () => void;
}) {
  const [showEnglish, setShowEnglish] = useState(false);
  const toggleLang = useCallback(() => setShowEnglish((p) => !p), []);
  const stopProp = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(14px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative rounded-3xl max-w-md w-full shadow-2xl overflow-hidden"
        style={{
          background: "hsl(var(--holi-card))",
          border: "1px solid hsl(var(--holi-border))",
          boxShadow: `0 30px 80px rgba(0,0,0,0.35), 0 0 60px ${card.accent}20`,
        }}
        initial={{ scale: 0.8, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 25 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        onClick={stopProp}
      >
        {/* Modal header with card_image.png */}
        <div className="relative overflow-hidden" style={{ height: 180 }}>
          <Image
            src="/assets/Holi/card_image.png"
            alt={card.title}
            fill
            className="object-cover object-center"
            sizes="(max-width: 28rem) 100vw, 448px"
          />
          <div
            className="absolute inset-0"
            style={{ background: card.gradient, opacity: 0.65 }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.55) 100%)" }}
          />
          {/* Animated dots */}
          {[...Array(8)].map((_, j) => (
            <div
              key={j}
              className="absolute w-1.5 h-1.5 rounded-full bg-white/40"
              style={{
                left: `${12 + (j * 11) % 76}%`,
                top: `${15 + (j * 13) % 60}%`,
                animation: `holi-pulse-beat ${2 + (j % 3)}s ease-in-out ${j * 0.3}s infinite`,
              }}
            />
          ))}
          {/* Title at bottom */}
          <div className="absolute inset-x-0 bottom-0 p-4">
            <h3
              className="text-lg font-bold text-white drop-shadow-lg leading-tight"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {card.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-transform"
            style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <X size={14} className="text-white" />
          </button>
        </div>

        <div className="px-6 py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: card.accent }}>
            A Colorful Blessing
          </p>

          {/* Hindi quote */}
          <div className="flex items-center gap-2 my-2">
            <div className="h-px flex-1" style={{ background: `${card.accent}30` }} />
            <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ color: card.accent }} className="text-xs">
              ♡
            </motion.span>
            <div className="h-px flex-1" style={{ background: `${card.accent}30` }} />
          </div>

          <p
            className="text-base leading-relaxed mb-0.5"
            style={{ color: "var(--holi-pink)", fontFamily: "'Noto Serif Devanagari', serif" }}
          >
            {card.hindi}
          </p>
          <p className="text-xs italic mb-3" style={{ color: "hsl(var(--holi-muted-fg))" }}>
            {card.english}
          </p>

          {/* Shayri box */}
          {card.shayri && (
            <div
              className="rounded-xl p-3 mb-3 text-center"
              style={{
                background: `${card.accent}0D`,
                border: `1px solid ${card.accent}28`,
              }}
            >
              <p
                className="text-sm leading-loose"
                style={{
                  color: card.accent,
                  fontFamily: "'Noto Serif Devanagari', serif",
                  whiteSpace: "pre-line",
                }}
              >
                {card.shayri}
              </p>
            </div>
          )}

          {/* Paragraph */}
          <p
            className="text-sm leading-relaxed whitespace-pre-wrap"
            style={{
              color: "hsl(var(--holi-fg) / 0.75)",
              fontFamily: showEnglish ? "'DM Sans', sans-serif" : "'Noto Serif Devanagari', serif",
            }}
          >
            {showEnglish ? card.paragraphEn : card.paragraph}
          </p>

          {senderName && (
            <>
              <div className="flex items-center gap-2 mt-4">
                <div className="h-px flex-1" style={{ background: `${card.accent}20` }} />
                <span className="text-[10px]" style={{ color: card.accent }}>♡</span>
                <div className="h-px flex-1" style={{ background: `${card.accent}20` }} />
              </div>
              <div className="text-right mt-2">
                <p className="text-sm font-semibold" style={{ color: card.accent }}>With colorful love,</p>
                <p className="text-xs font-bold mt-0.5" style={{ color: "hsl(var(--holi-fg))" }}>{senderName} 🎨</p>
              </div>
            </>
          )}
        </div>

        <div className="px-6 pb-5 flex gap-2">
          <button
            onClick={toggleLang}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
            style={{ background: `${card.accent}12`, color: card.accent, border: `1px solid ${card.accent}25` }}
          >
            <Languages size={14} />
            {showEnglish ? "हिंदी" : "English"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-colors active:scale-95"
            style={{ background: "var(--holi-gradient-cta)", color: "#fff" }}
          >
            Close 🎨
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
});

const GreetingCardItem = memo(function GreetingCardItem({
  card,
  index,
  onSelect,
}: {
  card: GreetingCard;
  index: number;
  onSelect: (c: GreetingCard) => void;
}) {
  const handleClick = useCallback(() => onSelect(card), [onSelect, card]);

  return (
    <motion.button
      onClick={handleClick}
      className="w-full text-left rounded-2xl shadow-sm active:scale-[0.97] transition-all overflow-hidden"
      style={{
        background: "hsl(var(--holi-card))",
        border: "1px solid hsl(var(--holi-border))",
        boxShadow: `0 4px 20px ${card.accent}12`,
      }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 200, damping: 25 }}
      whileHover={{ y: -3, boxShadow: `0 12px 36px ${card.accent}25` }}
    >
      {/* Card header with card_image.png */}
      <div className="relative h-36 lg:h-44 overflow-hidden">
        <Image
          src="/assets/Holi/card_image.png"
          alt={card.title}
          fill
          className="object-cover object-center"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        <div
          className="absolute inset-0"
          style={{ background: card.gradient, opacity: 0.6 }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.55) 100%)" }}
        />
        {/* Emoji badge */}
        <div
          className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-base shadow-lg"
          style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.3)" }}
        >
          {card.emoji}
        </div>
        {/* Title */}
        <div className="absolute inset-x-0 bottom-0 p-3">
          <h3
            className="text-base lg:text-lg font-bold text-white leading-tight drop-shadow-lg"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {card.title}
          </h3>
        </div>
      </div>

      <div className="p-3.5 lg:p-4">
        <div className="flex items-start gap-2 mb-1.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
            style={{ background: `${card.accent}18`, border: `1px solid ${card.accent}28` }}
          >
            {card.emoji}
          </div>
          <p
            className="text-xs font-semibold"
            style={{ color: "hsl(var(--holi-fg))", fontFamily: "'Noto Serif Devanagari', serif" }}
          >
            {card.hindi}
          </p>
        </div>

        {/* Shayri preview */}
        {card.shayri && (
          <p
            className="text-[11px] leading-snug mb-1.5 pl-9"
            style={{ color: card.accent, fontFamily: "'Noto Serif Devanagari', serif", opacity: 0.8 }}
          >
            {card.shayri.split("\n")[0]}
          </p>
        )}

        <p
          className="text-[11px] lg:text-xs leading-relaxed line-clamp-2 pl-9"
          style={{ color: "hsl(var(--holi-fg) / 0.55)" }}
        >
          {card.english}
        </p>
        <span
          className="text-[10px] lg:text-xs font-medium mt-2 inline-flex items-center gap-1 pl-9"
          style={{ color: card.accent }}
        >
          Read full letter <Heart size={9} className="fill-current" />
        </span>
      </div>
    </motion.button>
  );
});

const GreetingsSection = memo(function GreetingsSection({ data }: { data: HoliData }) {
  const [selected, setSelected] = useState<GreetingCard | null>(null);
  const close = useCallback(() => setSelected(null), []);
  const cards = useMemo(() => data.greetings, [data.greetings]);

  const cardItems = useMemo(
    () => cards.map((card, i) => (
      <GreetingCardItem key={i} card={card} index={i} onSelect={setSelected} />
    )),
    [cards],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="h-screen flex flex-col overflow-y-auto overflow-x-hidden relative"
    >
      {/* Full background image with low opacity */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Image
          src="/assets/Holi/card_image.png"
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
          style={{ opacity: 0.07 }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, hsl(var(--holi-bg) / 0.5) 0%, hsl(var(--holi-bg) / 0.65) 50%, hsl(var(--holi-bg) / 0.5) 100%)",
          }}
        />
      </div>

      <div className="flex-1 px-4 pt-7 pb-24 lg:pt-10 lg:max-w-5xl xl:max-w-6xl lg:mx-auto lg:w-full lg:px-8 relative z-10">
        <div className="text-center mb-5 lg:mb-8">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-0.5 holi-text-gradient" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Holi Greetings 🎨
          </h2>
          <p className="text-[11px] lg:text-sm" style={{ color: "hsl(var(--holi-muted-fg))" }}>
            Tap a card to read the full blessing & shayri
          </p>
        </div>

        <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0">
          {cardItems}
        </div>
      </div>

      <AnimatePresence>
        {selected && <GreetingModal card={selected} senderName={data.senderName} onClose={close} />}
      </AnimatePresence>
    </motion.div>
  );
});

export default GreetingsSection;
