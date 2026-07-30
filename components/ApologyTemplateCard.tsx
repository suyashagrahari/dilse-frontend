"use client";

import React, { memo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import FavoriteButton from "@/components/FavoriteButton";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import type { TemplateListItem } from "@/types/template-config";

interface Props {
  template: TemplateListItem;
  isFav: boolean;
  index: number;
  onFavorite: (e: React.MouseEvent, slug: string) => void;
}

// little floating hearts scattered across the card
const HEARTS = [
  { left: "12%", size: 13, delay: 0, dur: 5.5, op: 0.5 },
  { left: "26%", size: 9, delay: 1.4, dur: 6.8, op: 0.35 },
  { left: "44%", size: 16, delay: 0.6, dur: 5, op: 0.55 },
  { left: "62%", size: 10, delay: 2.1, dur: 7, op: 0.4 },
  { left: "78%", size: 14, delay: 1, dur: 6, op: 0.5 },
  { left: "88%", size: 8, delay: 2.6, dur: 6.4, op: 0.3 },
];

// a mini version of the app's morphing bear — sits in the card, blushing & happy
function MiniBear() {
  return (
    <motion.svg
      viewBox="0 0 200 200"
      className="w-16 h-16 md:w-20 md:h-20 drop-shadow"
      initial={{ rotate: -4 }}
      animate={{ rotate: [-4, 4, -4], y: [0, -3, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <circle cx="55" cy="55" r="22" fill="#b57a5e" />
      <circle cx="55" cy="55" r="12" fill="#e6b393" />
      <circle cx="145" cy="55" r="22" fill="#b57a5e" />
      <circle cx="145" cy="55" r="12" fill="#e6b393" />
      <ellipse cx="100" cy="110" rx="70" ry="65" fill="#c98d6e" />
      <ellipse cx="100" cy="125" rx="42" ry="35" fill="#f2d3b8" />
      <circle cx="60" cy="130" r="10" fill="#ff7aa8" opacity={0.9} />
      <circle cx="140" cy="130" r="10" fill="#ff7aa8" opacity={0.9} />
      <path d="M75 100 q10 -14 20 0" stroke="#2b1b24" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M105 100 q10 -14 20 0" stroke="#2b1b24" strokeWidth="4" fill="none" strokeLinecap="round" />
      <ellipse cx="100" cy="128" rx="6" ry="4" fill="#2b1b24" />
      <path d="M80 145 q20 22 40 0" stroke="#2b1b24" strokeWidth="4" fill="none" strokeLinecap="round" />
    </motion.svg>
  );
}

const ApologyTemplateCard = memo(function ApologyTemplateCard({ template, isFav, index, onFavorite }: Props) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.03, type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* Records the click only — Link still owns navigation. The favourite
          button stops propagation, so it is not counted as a card open. */}
      <Link
        href={`/${template.slug}`}
        className="block group"
        onClick={() =>
          track(EVENTS.TEMPLATE_CARD_CLICKED, {
            template: template.slug,
            position: index,
            is_premium: Boolean(template.isPremium),
          })
        }
      >
        <motion.div
          className="relative aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden transition-all duration-300"
          style={{ border: "1px solid rgba(230,64,114,0.28)" }}
          whileHover={{ y: -8, scale: 1.02, boxShadow: "0 22px 60px rgba(230,64,114,0.35), 0 0 0 1.5px rgba(255,122,168,0.65)" }}
          whileTap={{ scale: 0.98 }}
        >
          <style>{`
            @keyframes apoCardHeart { 0%{transform:translateY(8px) scale(.9);opacity:0} 15%{opacity:1} 85%{opacity:1} 100%{transform:translateY(-64px) scale(1.05);opacity:0} }
            @keyframes apoCardShine { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
          `}</style>

          {/* dreamy rose gradient base */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(160deg,#ffe3ec 0%,#ffc2d6 46%,#ff9bbd 100%)" }} />
          {/* dotted romance texture */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(rgba(230,64,114,.22) 1.4px, transparent 1.5px)",
              backgroundSize: "16px 16px",
              opacity: 0.5,
              maskImage: "radial-gradient(ellipse at 50% 35%, #000 55%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(ellipse at 50% 35%, #000 55%, transparent 100%)",
            }}
          />
          {/* soft glow blobs */}
          <div className="absolute -top-10 -right-8 w-32 h-32 rounded-full" style={{ background: "radial-gradient(circle,rgba(255,255,255,.6),transparent 70%)" }} />

          {/* floating hearts */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {HEARTS.map((h, i) => (
              <span
                key={i}
                className="absolute bottom-6"
                style={{ left: h.left, fontSize: h.size, opacity: h.op, animation: `apoCardHeart ${h.dur}s ease-in-out ${h.delay}s infinite` }}
              >
                💗
              </span>
            ))}
          </div>

          {/* readability gradient */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(122,20,50,0.10), rgba(122,20,50,0.02) 38%, rgba(90,12,38,0.72))" }} />

          {/* top row: emoji badge + favorite */}
          <div className="relative z-10 p-3 md:p-4 flex items-start justify-between">
            <motion.div
              className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.35)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.5)" }}
              whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-xl md:text-2xl">🥺</span>
            </motion.div>
            <FavoriteButton isFavorited={isFav} onClick={(e) => onFavorite(e, template.slug)} />
          </div>

          {/* centre stage: bear + live anger-o-meter + whack spark */}
          <div className="relative z-10 flex flex-col items-center -mt-1 px-4">
            <MiniBear />
            {/* dishoom spark */}
            <motion.span
              className="absolute text-lg"
              style={{ top: 6, right: "26%" }}
              animate={{ scale: [0, 1.15, 0], rotate: [0, 12, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.1 }}
            >
              💥
            </motion.span>

            <div className="w-[78%] mt-2">
              <div className="flex items-center justify-between text-[8px] md:text-[9px] font-bold mb-1" style={{ color: "rgba(122,20,50,.75)" }}>
                <span>💚 love</span>
                <span>anger-o-meter</span>
                <span>fuming ❤️‍🔥</span>
              </div>
              <div className="rounded-full overflow-hidden" style={{ height: 8, background: "rgba(255,255,255,.6)", boxShadow: "inset 0 1px 2px rgba(230,64,114,.25)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg,#8ee6a8,#ffe082,#ff5f8a,#e64072)", transformOrigin: "right center" }}
                  animate={{ scaleX: [1, 0.32, 0.7, 0.15, 1] }}
                  transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </div>
          </div>

          {/* bottom: type + title + description + open arrow */}
          <div className="absolute inset-x-0 bottom-0 z-10 p-3 md:p-4">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider mb-1.5"
              style={{ background: "rgba(255,255,255,0.35)", color: "#7a1432", backdropFilter: "blur(4px)" }}
            >
              ✨ interactive
            </span>
            <h3 className="font-bold text-sm md:text-[15px] leading-tight mb-1 text-white" style={{ fontFamily: "'Playfair Display', serif", textShadow: "0 1px 6px rgba(90,12,38,.5)" }}>
              {template.title}
            </h3>
            <p className="text-[11px] md:text-xs leading-snug line-clamp-2" style={{ color: "rgba(255,255,255,0.82)" }}>
              Anger-o-meter • whack game • scratch secret • will-you-forgive-me finale 💗
            </p>
            <div className="mt-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white">Say sorry</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: "#fff" }}>
                <path d="M2.5 6H9.5M9.5 6L6.5 3M9.5 6L6.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* accent bottom bar on hover */}
          <div className="absolute inset-x-0 bottom-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(to right,#ff7aa8,transparent)" }} />
        </motion.div>
      </Link>
    </motion.div>
  );
});

export default ApologyTemplateCard;
