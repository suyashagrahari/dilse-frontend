"use client";

import { memo, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Languages, Heart } from "lucide-react";
import Image from "next/image";
import type { EidData, GreetingCard } from "./types";

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
  const stopProp = useCallback(
    (e: React.MouseEvent) => e.stopPropagation(),
    []
  );

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative rounded-3xl max-w-md w-full shadow-2xl overflow-hidden"
        style={{
          background: "hsl(var(--eid-card))",
          border: "1px solid hsl(var(--eid-border))",
          boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 60px ${card.accent}12`,
        }}
        initial={{ scale: 0.8, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 25 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        onClick={stopProp}
      >
        {/* Header with eid_mubarak image */}
        <div className="relative overflow-hidden" style={{ height: 180 }}>
          <Image
            src="/assets/Eid/eid_mubarak.jpeg"
            alt={card.title}
            fill
            className="object-cover object-center"
            sizes="(max-width: 28rem) 100vw, 448px"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${card.accent}50, rgba(197,160,63,0.3), ${card.accent}40)`,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.55) 100%)",
            }}
          />
          {[...Array(6)].map((_, j) => (
            <motion.div
              key={j}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${14 + (j * 13) % 72}%`,
                top: `${18 + (j * 11) % 55}%`,
                background: `rgba(197,160,63,${0.3 + (j % 3) * 0.1})`,
              }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{
                duration: 2 + (j % 3),
                delay: j * 0.3,
                repeat: Infinity,
              }}
            />
          ))}
          <div className="absolute inset-x-0 bottom-0 p-4">
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg font-bold text-white drop-shadow-lg"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {card.title}
            </motion.h3>
          </div>

          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-transform"
            style={{
              background: "rgba(0,0,0,0.45)",
              border: "1px solid rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
            }}
          >
            <X size={14} className="text-white" />
          </button>
        </div>

        <div className="px-6 py-5">
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-1"
            style={{ color: card.accent }}
          >
            A Letter For You
          </p>
          <h3
            className="text-lg font-bold mb-0.5"
            style={{
              color: "hsl(var(--eid-fg))",
              fontFamily: "'Cormorant Garamond', serif",
            }}
          >
            {card.title}
          </h3>

          <div className="flex items-center gap-2 my-3">
            <div
              className="h-px flex-1"
              style={{ background: `${card.accent}30` }}
            />
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ color: card.accent }}
              className="text-xs"
            >
              ♡
            </motion.span>
            <div
              className="h-px flex-1"
              style={{ background: `${card.accent}30` }}
            />
          </div>

          <p
            className="text-xl leading-relaxed mb-1"
            dir="rtl"
            lang="ur"
            style={{
              color: "var(--eid-gold)",
              fontFamily: "'Noto Nastaliq Urdu', serif",
            }}
          >
            {card.urdu}
          </p>
          <p
            className="text-xs italic mb-3"
            style={{ color: "hsl(var(--eid-muted-fg))" }}
          >
            {card.english}
          </p>

          <p
            className="text-sm leading-relaxed whitespace-pre-wrap"
            dir={showEnglish ? "ltr" : "rtl"}
            lang={showEnglish ? "en" : "ur"}
            style={{
              color: "hsl(var(--eid-fg) / 0.75)",
              fontFamily: showEnglish
                ? "'DM Sans', sans-serif"
                : "'Noto Nastaliq Urdu', serif",
            }}
          >
            {showEnglish ? card.paragraphEn : card.paragraph}
          </p>

          {senderName && (
            <div className="flex items-center gap-2 mt-4">
              <div
                className="h-px flex-1"
                style={{ background: `${card.accent}20` }}
              />
              <span
                className="text-[10px]"
                style={{ color: card.accent }}
              >
                ♡
              </span>
              <div
                className="h-px flex-1"
                style={{ background: `${card.accent}20` }}
              />
            </div>
          )}

          {senderName && (
            <div className="text-right mt-2">
              <p
                className="text-sm font-semibold"
                style={{ color: card.accent }}
              >
                With love,
              </p>
              <p
                className="text-xs font-bold mt-0.5"
                style={{ color: "hsl(var(--eid-fg))" }}
              >
                {senderName} 🌙
              </p>
            </div>
          )}
        </div>

        <div className="px-6 pb-5 flex gap-2">
          <button
            onClick={toggleLang}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
            style={{
              background: `${card.accent}10`,
              color: card.accent,
              border: `1px solid ${card.accent}20`,
            }}
          >
            <Languages size={14} />
            {showEnglish ? "اردو" : "English"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-colors"
            style={{
              background: "rgba(197,160,63,0.08)",
              color: "var(--eid-gold)",
              border: "1px solid rgba(197,160,63,0.15)",
            }}
          >
            Close Letter 🌙
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
      className="w-full text-left rounded-2xl shadow-sm active:scale-[0.98] transition-all overflow-hidden"
      style={{
        background: "hsl(var(--eid-card))",
        border: "1px solid hsl(var(--eid-border))",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.05,
        type: "spring",
        stiffness: 200,
        damping: 25,
      }}
    >
      {/* Image header */}
      <div className="relative h-36 lg:h-40 overflow-hidden">
        <Image
          src={card.image}
          alt={card.title}
          fill
          className="object-cover"
          sizes="(max-width:768px) 100vw, 50vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${card.accent}35 0%, transparent 35%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.7) 100%)`,
          }}
        />
        <div
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-lg"
          style={{
            background: `${card.accent}40`,
            border: `1px solid ${card.accent}60`,
            backdropFilter: "blur(10px)",
          }}
        >
          {card.emoji}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-3.5">
          <h3
            className="text-base lg:text-lg font-bold text-white leading-tight drop-shadow-lg"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              textShadow: "0 2px 8px rgba(0,0,0,0.4)",
            }}
          >
            {card.title}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 lg:p-4">
        <div className="flex items-center justify-between mb-1.5 lg:mb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 lg:w-9 lg:h-9 rounded-full flex items-center justify-center text-sm lg:text-base"
              style={{
                background: `${card.accent}15`,
                border: `1px solid ${card.accent}25`,
              }}
            >
              {card.emoji}
            </div>
            <p
              className="text-xs lg:text-sm font-semibold truncate"
              dir="rtl"
              lang="ur"
              style={{
                color: "hsl(var(--eid-fg))",
                fontFamily: "'Noto Nastaliq Urdu', serif",
              }}
            >
              {card.urdu}
            </p>
          </div>
        </div>
        <p
          className="text-[11px] lg:text-xs leading-relaxed line-clamp-2"
          style={{ color: "hsl(var(--eid-fg) / 0.6)" }}
        >
          {card.english}
        </p>
        <span
          className="text-[10px] lg:text-xs font-medium mt-1.5 inline-flex items-center gap-1"
          style={{ color: card.accent }}
        >
          Read full letter <Heart size={9} className="fill-current" />
        </span>
      </div>
    </motion.button>
  );
});

const GreetingsSection = memo(function GreetingsSection({
  data,
}: {
  data: EidData;
}) {
  const [selected, setSelected] = useState<GreetingCard | null>(null);
  const close = useCallback(() => setSelected(null), []);
  const cards = useMemo(() => data.greetings, [data.greetings]);

  const cardItems = useMemo(
    () =>
      cards.map((card, i) => (
        <GreetingCardItem
          key={i}
          card={card}
          index={i}
          onSelect={setSelected}
        />
      )),
    [cards]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="h-screen flex flex-col overflow-y-auto overflow-x-hidden"
    >
      <div className="flex-1 px-4 pt-7 pb-24 lg:pt-10 lg:max-w-5xl xl:max-w-6xl lg:mx-auto lg:w-full lg:px-8">
        <div className="text-center mb-5 lg:mb-8">
          <h2
            className="text-xl md:text-2xl lg:text-3xl font-bold mb-0.5"
            style={{
              background:
                "linear-gradient(135deg, var(--eid-gold), var(--eid-teal))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Eid Greetings 🌙
          </h2>
          <p
            className="text-[11px] lg:text-sm"
            style={{ color: "hsl(var(--eid-muted-fg))" }}
          >
            Tap a card to read the full blessing
          </p>
        </div>

        <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0">
          {cardItems}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <GreetingModal
            card={selected}
            senderName={data.senderName}
            onClose={close}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export default GreetingsSection;
