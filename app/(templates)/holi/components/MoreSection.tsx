"use client";

import { memo, useMemo, useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import type { HoliData } from "./types";

const STORY_CARDS = [
  {
    num: "01",
    emoji: "👑",
    title: "The Demon King",
    accent: "#FF6B9D",
    gradient: "linear-gradient(135deg, #FF6B9D22, #FF6B9D08)",
    text: "Hiranyakashipu, a powerful demon king, demanded everyone worship him. But his own son, Prahlad, remained devoted to Lord Vishnu — defying his father's command.",
  },
  {
    num: "02",
    emoji: "🔥",
    title: "The Trial by Fire",
    accent: "#FF8C42",
    gradient: "linear-gradient(135deg, #FF8C4222, #FF8C4208)",
    text: "Hiranyakashipu's sister Holika, blessed with immunity to fire, sat in a blazing pyre with young Prahlad in her lap — intending to destroy him once and for all.",
  },
  {
    num: "03",
    emoji: "🌟",
    title: "Good Triumphs",
    accent: "#A855F7",
    gradient: "linear-gradient(135deg, #A855F722, #A855F708)",
    text: "By divine grace, Prahlad emerged unharmed while Holika perished in the flames. This eternal triumph of devotion over evil is celebrated every year as Holika Dahan.",
  },
] as const;

const FACTS = [
  { icon: "📅", text: "Holi is celebrated over two days — Holika Dahan (bonfire night) and Rangwali Holi (color play day).", accent: "#FF6B9D" },
  { icon: "🌸", text: "The festival marks the arrival of spring and the glorious end of winter.", accent: "#A855F7" },
  { icon: "🛕", text: "In Mathura and Vrindavan, Holi celebrations last for over a week!", accent: "#FF8C42" },
  { icon: "🌺", text: "Gulaal (colored powder) was traditionally made from flowers like Tesu and Palash.", accent: "#38BDF8" },
  { icon: "🌍", text: "Holi is celebrated not just in India but in Nepal, Bangladesh, and by diaspora communities worldwide.", accent: "#4CAF50" },
] as const;

const REGIONS = [
  { name: "Mathura", desc: "Week-long celebrations at Krishna's birthplace", emoji: "🛕", color: "#FF6B9D" },
  { name: "Barsana", desc: "Famous Lathmar Holi with sticks", emoji: "🏏", color: "#FF8C42" },
  { name: "Purulia", desc: "Holi with traditional Chhau dance", emoji: "💃", color: "#A855F7" },
  { name: "Shantiniketan", desc: "Cultural Basanta Utsav festival", emoji: "🎭", color: "#38BDF8" },
  { name: "Udaipur", desc: "Royal Holi with grand processions", emoji: "👑", color: "#4CAF50" },
  { name: "Jaipur", desc: "Elephant Holi at royal palace grounds", emoji: "🐘", color: "#FFD700" },
  { name: "Vrindavan", desc: "Flower Holi at Banke Bihari Temple", emoji: "🌸", color: "#E91E63" },
] as const;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { delay, duration: 0.5, ease: "easeOut" as const },
});

const SectionHeading = memo(function SectionHeading({ title }: { title: string }) {
  return (
    <motion.div {...fadeUp(0)} className="flex items-center gap-3 mb-6">
      <div
        className="h-[1px] flex-1"
        style={{
          background: "linear-gradient(90deg, transparent, var(--holi-pink), transparent)",
          opacity: 0.35,
        }}
      />
      <h3
        className="text-lg font-bold holi-text-gradient whitespace-nowrap px-1"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        {title}
      </h3>
      <div
        className="h-[1px] flex-1"
        style={{
          background: "linear-gradient(90deg, transparent, var(--holi-purple), transparent)",
          opacity: 0.35,
        }}
      />
    </motion.div>
  );
});

const InfiniteScroll = memo(function InfiniteScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animRef = useRef<number>(0);
  const posRef = useRef(0);

  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const halfWidth = el.scrollWidth / 2;
    const speed = 0.5;

    const tick = () => {
      if (!isPaused) {
        posRef.current += speed;
        if (posRef.current >= halfWidth) posRef.current = 0;
        el.scrollLeft = posRef.current;
      }
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPaused]);

  const items = [...REGIONS, ...REGIONS];

  return (
    <div
      ref={scrollRef}
      className="flex gap-4 overflow-x-hidden py-2"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
    >
      {items.map((r, i) => (
        <div
          key={`${r.name}-${i}`}
          className="rounded-2xl p-5 min-w-[180px] flex-shrink-0 text-center relative overflow-hidden cursor-default group"
          style={{
            background: "var(--holi-glass)",
            backdropFilter: "blur(24px)",
            border: `1px solid ${r.color}25`,
          }}
        >
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `radial-gradient(circle at 50% 100%, ${r.color}15 0%, transparent 70%)`,
            }}
          />
          <div
            className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-[0.07]"
            style={{ background: r.color, filter: "blur(20px)" }}
          />
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 relative z-10"
            style={{
              background: `${r.color}15`,
              border: `1px solid ${r.color}25`,
              boxShadow: `0 4px 16px ${r.color}15`,
            }}
          >
            {r.emoji}
          </div>
          <div
            className="font-bold text-sm mb-1 relative z-10"
            style={{ color: r.color, fontFamily: "'Outfit', sans-serif" }}
          >
            {r.name}
          </div>
          <div
            className="text-[11px] leading-relaxed relative z-10"
            style={{ color: "hsl(var(--holi-muted-fg))", fontFamily: "'DM Sans', sans-serif" }}
          >
            {r.desc}
          </div>
        </div>
      ))}
    </div>
  );
});

const MoreSection = memo(function MoreSection({ data }: { data: HoliData }) {
  const colorMeanings = useMemo(() => data.colorMeanings, [data.colorMeanings]);

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
          src="/assets/Holi/hero_holi.png"
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
          style={{ opacity: 0.06 }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, hsl(var(--holi-bg) / 0.5) 0%, hsl(var(--holi-bg) / 0.65) 50%, hsl(var(--holi-bg) / 0.5) 100%)",
          }}
        />
      </div>

      <div className="flex-1 px-4 pt-7 pb-24 lg:pt-10 lg:max-w-3xl lg:mx-auto lg:w-full lg:px-8 space-y-12 relative z-10">

        {/* Header */}
        <motion.div {...fadeUp(0)} className="text-center">
          <div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-4"
            style={{
              background: "var(--holi-glass)",
              backdropFilter: "blur(16px)",
              border: "1px solid var(--holi-glass-border)",
            }}
          >
            <span className="text-base">📖</span>
            <span
              className="text-xs font-bold uppercase tracking-widest holi-text-gradient"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              The Story of Holi
            </span>
            <span className="text-base">🎨</span>
          </div>
          <h2
            className="text-2xl md:text-3xl lg:text-4xl font-bold holi-text-gradient leading-tight"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Festival of Colors
          </h2>
          <p className="text-xs mt-1.5" style={{ color: "hsl(var(--holi-muted-fg))", fontFamily: "'DM Sans', sans-serif" }}>
            The ancient legend behind the celebration
          </p>
        </motion.div>

        {/* Big quote */}
        <motion.div
          {...fadeUp(0.05)}
          className="rounded-3xl p-7 text-center relative overflow-hidden"
          style={{
            background: "var(--holi-glass)",
            backdropFilter: "blur(24px)",
            border: "1px solid var(--holi-glass-border)",
            boxShadow: "var(--holi-glass-shadow)",
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{ background: "var(--holi-gradient-primary)" }}
          />
          <span className="text-3xl block mb-2">🙏</span>
          <p
            className="text-xl md:text-2xl font-bold holi-text-gradient leading-snug relative z-10"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            &ldquo;Good always triumphs<br />over Evil&rdquo;
          </p>
          <p
            className="text-sm mt-2.5 relative z-10 pt-1 leading-tight"
            style={{ color: "hsl(var(--holi-muted-fg))", fontFamily: "'Noto Serif Devanagari', serif" }}
          >
            बुराई पर सदा अच्छाई की जीत होती है
          </p>
        </motion.div>

        {/* Story Cards */}
        <div className="space-y-4">
          {STORY_CARDS.map((s, i) => (
            <motion.div
              key={s.num}
              {...fadeUp(i * 0.1)}
              className="rounded-2xl p-5 flex gap-4 relative overflow-hidden cursor-default"
              style={{
                background: s.gradient,
                backdropFilter: "blur(24px)",
                border: `1px solid ${s.accent}20`,
                boxShadow: `0 2px 20px ${s.accent}08`,
              }}
            >
              <div
                className="absolute -right-10 -top-10 w-36 h-36 rounded-full opacity-[0.08]"
                style={{ background: s.accent, filter: "blur(30px)" }}
              />
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{
                    background: `${s.accent}15`,
                    border: `1px solid ${s.accent}25`,
                  }}
                >
                  <span className="text-xl">{s.emoji}</span>
                </div>
                <span
                  className="text-2xl font-black leading-none"
                  style={{ color: `${s.accent}60`, fontFamily: "'Outfit', sans-serif" }}
                >
                  {s.num}
                </span>
              </div>
              <div className="flex-1 relative z-10">
                <h4
                  className="font-bold text-sm mb-1.5"
                  style={{ color: s.accent, fontFamily: "'Outfit', sans-serif" }}
                >
                  {s.title}
                </h4>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "hsl(var(--holi-fg) / 0.75)", fontFamily: "'DM Sans', sans-serif" }}
                >
                  {s.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Color Meanings */}
        <div>
          <SectionHeading title="Colors of Holi 🎨" />
          <div className="grid grid-cols-3 md:grid-cols-3 gap-3">
            {colorMeanings.map((c, i) => (
              <motion.div
                key={c.name}
                {...fadeUp(i * 0.06)}
                whileTap={{ scale: 0.96 }}
                className="rounded-2xl p-4 text-center cursor-pointer relative overflow-hidden group"
                style={{
                  background: "var(--holi-glass)",
                  backdropFilter: "blur(24px)",
                  border: `1px solid ${c.color}30`,
                }}
              >
                {/* Color glow at bottom */}
                <div
                  className="absolute inset-x-0 bottom-0 h-1 rounded-b-2xl"
                  style={{ background: c.color }}
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-16 opacity-[0.12]"
                  style={{
                    background: `linear-gradient(to top, ${c.color}, transparent)`,
                  }}
                />

                {/* Color dot */}
                <div
                  className="w-8 h-8 rounded-full mx-auto mb-2 relative z-10"
                  style={{
                    background: `linear-gradient(135deg, ${c.color}, ${c.color}CC)`,
                    boxShadow: `0 4px 14px ${c.color}40`,
                  }}
                />

                <div
                  className="font-bold text-sm relative z-10"
                  style={{ color: c.color }}
                >
                  {c.name}
                </div>
                <div
                  className="text-[11px] relative z-10 mt-0.5 pt-0.5 leading-tight"
                  style={{ color: "hsl(var(--holi-muted-fg))", fontFamily: "'Noto Serif Devanagari', serif" }}
                >
                  {c.hindi}
                </div>
                <div
                  className="text-[10px] mt-1 relative z-10 font-medium"
                  style={{ color: "hsl(var(--holi-fg) / 0.55)" }}
                >
                  {c.meaning}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Fun Facts */}
        <div>
          <SectionHeading title="Fun Facts 🎉" />
          <div className="space-y-3">
            {FACTS.map((f, i) => (
              <motion.div
                key={i}
                {...fadeUp(i * 0.08)}
                className="rounded-2xl p-4 flex items-start gap-3.5 relative overflow-hidden"
                style={{
                  background: "var(--holi-glass)",
                  backdropFilter: "blur(24px)",
                  border: `1px solid ${f.accent}18`,
                }}
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
                  style={{ background: f.accent }}
                />
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{
                    background: `${f.accent}12`,
                    border: `1px solid ${f.accent}20`,
                  }}
                >
                  {f.icon}
                </div>
                <p
                  className="text-xs leading-relaxed flex-1 pt-1.5"
                  style={{ color: "hsl(var(--holi-fg) / 0.8)", fontFamily: "'DM Sans', sans-serif" }}
                >
                  {f.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Holi Across India - infinite scroll */}
        <div>
          <SectionHeading title="Holi Across India 🇮🇳" />
          <div className="-mx-4 lg:-mx-8">
            <InfiniteScroll />
          </div>
        </div>

        {/* Footer */}
        <motion.div
          {...fadeUp(0.05)}
          className="text-center py-8 rounded-3xl relative overflow-hidden"
          style={{
            background: "var(--holi-glass)",
            backdropFilter: "blur(24px)",
            border: "1px solid var(--holi-glass-border)",
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{ background: "var(--holi-gradient-primary)" }}
          />
          <motion.p
            className="font-bold text-xl holi-text-gradient relative z-10 pt-2 leading-tight"
            style={{ fontFamily: "'Noto Serif Devanagari', serif" }}
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            🎨 होली है!
          </motion.p>
          <p
            className="text-sm mt-2 font-semibold relative z-10"
            style={{ color: "hsl(var(--holi-fg) / 0.7)", fontFamily: "'DM Sans', sans-serif" }}
          >
            Spread Colors, Spread Love
          </p>
          <div
            className="w-32 h-1 rounded-full mx-auto mt-3 mb-3"
            style={{
              background: "linear-gradient(90deg, #FF6B9D, #FF8C42, #FFD700, #4CAF50, #38BDF8, #A855F7)",
            }}
          />
          <p
            className="text-[10px] relative z-10"
            style={{ color: "hsl(var(--holi-muted-fg))", fontFamily: "'DM Sans', sans-serif" }}
          >
            Made with ❤️ for the Festival of Colors
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
});

export default MoreSection;
