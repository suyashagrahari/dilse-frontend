"use client";

// The letter, tucked in a hoodie pocket. An oversized hoodie fills the
// screen; a card corner peeks out of the kangaroo pocket. Tap the pocket →
// the card slides up and out, then opens into a soft, slightly creased card
// with the letter in a handwriting face. Scroll to the end and the hoodie's
// two sleeves wrap round the card's edges — a hug, as a final flourish.

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FONTS, VW } from "../../../_valentine/theme";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { Btn, H, Hint, Title, sfx } from "./ui";

const HOODIE = "#FFB59A";
const HOODIE_DEEP = "#F29A7B";

function Sleeve({ side }: { side: "l" | "r" }) {
  return (
    <svg viewBox="0 0 90 170" width="76" height="144" aria-hidden style={{ display: "block", transform: side === "r" ? "scaleX(-1)" : undefined, overflow: "visible" }}>
      <path d="M0 0 C40 10 66 50 70 100 L76 130 L40 146 L28 110 C20 70 8 46 0 40 Z" fill={HOODIE} stroke={H.cocoa} strokeWidth="3" strokeLinejoin="round" />
      <path d="M34 108 L72 94 L80 130 L42 146 Z" fill={HOODIE_DEEP} stroke={H.cocoa} strokeWidth="3" strokeLinejoin="round" />
      <path d="M44 112 L76 100 M46 120 L78 108 M48 128 L79 116 M50 136 L80 124" stroke="#E68767" strokeWidth="1.6" />
      {/* a little hand peeking out of the cuff */}
      <ellipse cx="72" cy="150" rx="15" ry="11" fill="#F8C9A6" stroke={H.cocoa} strokeWidth="2.6" transform="rotate(-24 72 150)" />
    </svg>
  );
}

export default function HoodieLetter({ letter, sender, recipient, sticker, onNext }: { letter: string; sender: string; recipient: string; sticker: React.ReactNode; onNext: () => void }) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<"pocket" | "rising" | "reading">("pocket");
  const [hugged, setHugged] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const paras = letter.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  const pull = () => {
    if (phase !== "pocket") return;
    setPhase("rising");
    haptic(12);
    sfx.pop(0.8);
    window.setTimeout(() => setPhase("reading"), reduced ? 100 : 1100);
  };

  useEffect(() => {
    if (phase !== "reading" || hugged) return;
    const el = end.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      const t = window.setTimeout(() => setHugged(true), 1200);
      return () => window.clearTimeout(t);
    }
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          setHugged(true);
          haptic([30, 40, 60]);
          sfx.squish();
        }
      },
      { threshold: 1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [phase, hugged]);

  if (phase !== "reading") {
    return (
      <>
        <Title>Hoodie pehen lo, letter padh lo</Title>
        <p style={{ margin: "-6px 0 0", maxWidth: 320, font: `400 15px/1.45 ${FONTS.ui}`, color: VW.inkSoft }}>Something&apos;s tucked in the pocket. Still warm.</p>
        <div style={{ position: "relative", width: "min(92vw, 360px)", aspectRatio: "340 / 320" }}>
          {/* hoodie body */}
          <svg viewBox="0 0 340 320" width="100%" height="100%" aria-hidden style={{ position: "absolute", inset: 0, display: "block", overflow: "visible" }}>
            <path d="M120 40 C110 0 230 0 220 40 C214 70 126 70 120 40 Z" fill={HOODIE_DEEP} stroke={H.cocoa} strokeWidth="3.5" />
            <path d="M70 52 C100 40 130 36 170 44 C210 36 240 40 270 52 L320 210 L286 226 L262 150 L262 300 Q170 314 78 300 L78 150 L54 226 L20 210 Z" fill={HOODIE} stroke={H.cocoa} strokeWidth="3.5" strokeLinejoin="round" />
            <path d="M80 286 Q170 300 260 286 L262 304 Q170 318 78 304 Z" fill={HOODIE_DEEP} stroke={H.cocoa} strokeWidth="3" />
            <path d="M24 206 L52 220 M318 206 L290 220" stroke={H.cocoa} strokeWidth="3" />
            <path d="M126 46 C140 70 200 70 214 46" fill="none" stroke={H.cocoa} strokeWidth="3" />
            {/* drawstrings */}
            <path d="M150 64 C148 90 152 104 146 122 M190 64 C192 92 188 108 194 128" fill="none" stroke="#FFF6EC" strokeWidth="4" strokeLinecap="round" />
            <rect x="142" y="120" width="8" height="14" rx="3" fill="#E7B44E" stroke={H.cocoa} strokeWidth="1.6" />
            <rect x="190" y="126" width="8" height="14" rx="3" fill="#E7B44E" stroke={H.cocoa} strokeWidth="1.6" />
            {/* embroidered heart */}
            <path d="M232 120 C222 112 222 104 228 103 C231 102.5 233 105 233 107 C233 105 235 102.5 238 103 C244 104 244 112 233 120 Z" fill={H.cheek} stroke="#fff" strokeWidth="1.4" strokeDasharray="2 2" />
          </svg>

          {/* the card, inside the pocket */}
          <motion.button
            type="button"
            onClick={pull}
            aria-label="Pull the letter out of the hoodie pocket"
            initial={false}
            animate={phase === "rising" ? { y: reduced ? 0 : -150, rotate: -4 } : reduced ? { y: 0 } : { y: [0, -8, 0], rotate: [-2, 2, -2] }}
            transition={phase === "rising" ? { type: "spring", stiffness: 120, damping: 14 } : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: "absolute", left: "32%", width: "36%", top: "52%", height: "26%", padding: 0, border: 0, background: "transparent", cursor: "pointer", zIndex: 1 }}
          >
            <span style={{ display: "block", width: "100%", height: "100%", borderRadius: 6, background: H.paper, boxShadow: "0 8px 16px -8px rgba(74,44,32,.5)", border: `1.5px solid ${H.peach}` }}>
              <span style={{ display: "block", paddingTop: 10, font: `700 16px ${FONTS.script}`, color: H.cocoa }}>for {recipient.length > 10 ? `${recipient.slice(0, 9)}…` : recipient} ♡</span>
            </span>
          </motion.button>

          {/* the pocket, in front of the card */}
          <svg viewBox="0 0 340 320" width="100%" height="100%" aria-hidden style={{ position: "absolute", inset: 0, display: "block", pointerEvents: "none", zIndex: 2 }}>
            <path d="M104 196 L236 196 L262 270 Q170 284 78 270 Z" fill={HOODIE_DEEP} stroke={H.cocoa} strokeWidth="3.5" strokeLinejoin="round" />
            <path d="M112 204 L228 204 L250 264 Q170 276 90 264 Z" fill="none" stroke="#FFE0D3" strokeWidth="1.6" strokeDasharray="5 5" />
          </svg>
          <button type="button" onClick={pull} aria-label="Tap the hoodie pocket" style={{ position: "absolute", left: "24%", width: "52%", top: "60%", height: "30%", border: 0, background: "transparent", cursor: "pointer", zIndex: 3 }} />
        </div>
        <div style={{ minHeight: 100, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <Hint>Tap the pocket 👐</Hint>
          <Btn onClick={pull}>Take the letter out</Btn>
        </div>
      </>
    );
  }

  return (
    <>
      {sticker}
      <Title size={30}>From the hoodie pocket</Title>
      <motion.div
        initial={reduced ? false : { scaleY: 0.2, y: -40, opacity: 0 }}
        animate={{ scaleY: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 140, damping: 18 }}
        style={{ position: "relative", width: "min(100%, 420px)", transformOrigin: "50% 0" }}
      >
        <article
          style={{
            position: "relative",
            padding: "26px 22px 30px",
            borderRadius: 10,
            background: `linear-gradient(180deg, ${H.paper} 0%, #FFF4E6 49.6%, #F7E6D2 50%, #FFF6EA 50.6%, ${H.paper} 100%)`,
            boxShadow: "0 26px 50px -28px rgba(74,44,32,.6), 0 2px 0 #fff inset",
            textAlign: "left",
            color: H.cocoaDeep,
          }}
        >
          {/* embroidered corner heart */}
          <svg viewBox="0 0 30 28" width="30" height="28" aria-hidden style={{ position: "absolute", right: 14, top: 12 }}>
            <path d="M15 26 C2 17 1 7 7 4 C11 2 14 5 15 8 C16 5 19 2 23 4 C29 7 28 17 15 26 Z" fill={H.strawberry} stroke="#fff" strokeWidth="1.6" strokeDasharray="2.4 2" />
          </svg>
          <p style={{ margin: "0 0 12px", font: `700 11px ${FONTS.ui}`, letterSpacing: ".2em", color: H.peach }}>WARM · HANDLE WITH HUGS</p>
          {paras.map((p, k) => (
            <motion.p
              key={k}
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduced ? 0 : 0.35 + k * 0.35, duration: 0.5 }}
              style={{ margin: "0 0 14px", font: `500 21px/1.5 ${FONTS.script}`, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
            >
              {p}
            </motion.p>
          ))}
          <p style={{ margin: "6px 0 0", paddingRight: 28, textAlign: "right", font: `700 24px ${FONTS.script}`, color: H.cheek, overflowWrap: "anywhere" }}>— {sender}</p>
          <div ref={end} style={{ height: 1 }} />
        </article>

        {/* the sleeves close in at the end */}
        {(["l", "r"] as const).map((side) => (
          <motion.div
            key={side}
            aria-hidden
            initial={false}
            animate={hugged ? { x: 0, opacity: 1, rotate: 0 } : { x: side === "l" ? -70 : 70, opacity: 0, rotate: side === "l" ? -20 : 20 }}
            transition={reduced ? { duration: 0.2 } : { type: "spring", stiffness: 160, damping: 13 }}
            style={{ position: "absolute", bottom: -34, [side === "l" ? "left" : "right"]: -44, pointerEvents: "none" }}
          >
            <Sleeve side={side} />
          </motion.div>
        ))}
      </motion.div>

      <div style={{ minHeight: 100, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginTop: 14 }}>
        <AnimatePresence>
          {hugged && (
            <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{ margin: 0, font: `700 18px ${FONTS.ui}`, color: VW.accentDeep }}>
              *hoodie hug* 🤗
            </motion.p>
          )}
        </AnimatePresence>
        <Btn onClick={onNext}>Our memory quilt →</Btn>
      </div>
    </>
  );
}
