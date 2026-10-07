"use client";

// Arrival: a cream envelope sealed with berry wax stamped with both initials.
// Tap the seal → it cracks in two (halves spin away, paper dust), the flap
// flips open and the corner of the Vachan Patra peeks out. The seal is a real
// <button>; there is also a plain "Open" button underneath.

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FONTS, VW } from "../../../_valentine/theme";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { Btn, Hint, Kicker, P, sfx } from "./ui";

export default function Envelope({
  recipient,
  sender,
  petName,
  line,
  seal,
  sticker,
  onOpen,
}: {
  recipient: string;
  sender: string;
  petName: string;
  line: string;
  seal: string;
  sticker: React.ReactNode;
  onOpen: () => void;
}) {
  const reduced = useReducedMotion();
  const [cracked, setCracked] = useState(false);

  const crack = (e?: React.MouseEvent) => {
    if (cracked) return;
    setCracked(true);
    haptic([14, 40, 22]);
    sfx.crack();
    const r = (e?.currentTarget as HTMLElement | undefined)?.getBoundingClientRect();
    burst({
      kind: "sparkles",
      emojis: ["✦", "·", "✧", "💗"],
      count: 18,
      spread: 0.22,
      origin: r ? { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight } : { x: 0.5, y: 0.5 },
    });
    window.setTimeout(onOpen, reduced ? 350 : 1350);
  };

  return (
    <>
      <Kicker>Happy Promise Day 🤞</Kicker>
      <h1 style={{ margin: 0, font: `700 clamp(44px, 13vw, 68px)/1.05 ${FONTS.script}`, color: VW.ink, overflowWrap: "anywhere", maxWidth: "100%" }}>{recipient}</h1>
      {petName && <p style={{ margin: "-8px 0 0", font: `italic 400 18px ${FONTS.serif}`, color: VW.inkSoft, overflowWrap: "anywhere" }}>“{petName}”</p>}

      <div style={{ position: "relative", width: "min(88vw, calc(340px * var(--vw-s, 1)))", aspectRatio: "300 / 214", marginTop: 26 }}>
        {/* the GIF slot peeks over the top-right corner */}
        <div style={{ position: "absolute", right: -6, top: -66, zIndex: 0 }}>{sticker}</div>

        <motion.div
          animate={cracked || reduced ? { rotate: 0 } : { rotate: [-1.2, 1.2, -1.2] }}
          transition={cracked || reduced ? { duration: 0.3 } : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", inset: 0, zIndex: 1, filter: "drop-shadow(0 22px 26px rgba(142,31,74,.22))" }}
        >
          <svg viewBox="0 0 300 214" width="100%" height="100%" style={{ overflow: "visible", display: "block" }} aria-hidden>
            <defs>
              <linearGradient id="pd-env" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#FFFBF4" />
                <stop offset="1" stopColor="#FCEBDD" />
              </linearGradient>
              <linearGradient id="pd-flap" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#FBE6DA" />
                <stop offset="1" stopColor="#F6D7C8" />
              </linearGradient>
              <radialGradient id="pd-wax" cx="0.38" cy="0.32" r="0.75">
                <stop offset="0" stopColor="#C2416F" />
                <stop offset="0.55" stopColor={P.berry} />
                <stop offset="1" stopColor="#5A0F2E" />
              </radialGradient>
              <clipPath id="pd-left">
                <path d="M100 60 L151 60 L146 88 L155 104 L144 120 L152 140 L148 170 L100 170 Z" />
              </clipPath>
              <clipPath id="pd-right">
                <path d="M200 60 L151 60 L146 88 L155 104 L144 120 L152 140 L148 170 L200 170 Z" />
              </clipPath>
            </defs>

            {/* the flap's inside, opening upward behind the patra (scaleY 0 → -1) */}
            <motion.g
              initial={false}
              animate={cracked ? { scaleY: -1, opacity: 1 } : { scaleY: 0, opacity: 0 }}
              transition={{ delay: reduced ? 0 : 0.6, duration: reduced ? 0 : 0.3, ease: "easeOut" }}
              style={{ originY: "2px", originX: "150px" }}
            >
              <path d="M2 10 Q2 2 10 2 L290 2 Q298 2 298 10 L298 14 L156 112 Q150 116 144 112 L2 14 Z" fill="#F3CFC0" stroke="#EBC9B9" strokeWidth="1.5" />
            </motion.g>
            {/* inside of the envelope + the patra rising out of it */}
            <rect x="2" y="2" width="296" height="210" rx="10" fill="#F1CBBE" />
            <motion.g initial={false} animate={cracked ? { y: -54 } : { y: 0 }} transition={{ delay: reduced ? 0 : 0.75, type: "spring", stiffness: 140, damping: 16 }}>
              <rect x="34" y="16" width="232" height="150" rx="4" fill={P.paper} stroke={P.gold} strokeWidth="2" />
              <rect x="40" y="22" width="220" height="138" rx="2" fill="none" stroke={P.gold} strokeWidth="0.8" strokeDasharray="3 2" />
              <text x="150" y="44" textAnchor="middle" style={{ font: `700 11px ${FONTS.ui}`, letterSpacing: "0.18em" }} fill={P.berry}>
                ₹∞ PYAAR STAMP PAPER
              </text>
              <circle cx="150" cy="70" r="13" fill="none" stroke={P.gold} strokeWidth="1.4" />
              <text x="150" y="75" textAnchor="middle" style={{ font: `700 12px ${FONTS.serif}` }} fill={P.gold}>
                ₹∞
              </text>
            </motion.g>

            {/* front pocket */}
            <path d="M2 64 L150 136 L298 64 L298 204 Q298 212 290 212 L10 212 Q2 212 2 204 Z" fill="url(#pd-env)" stroke="#EBC9B9" strokeWidth="1.5" />
            <path d="M2 212 L132 120 M298 212 L168 120" stroke="#EFD3C5" strokeWidth="1.5" fill="none" />

            {/* writing on the front */}
            <text x="150" y="178" textAnchor="middle" style={{ font: `600 17px ${FONTS.script}` }} fill={P.berry}>
              {line.length > 34 ? `${line.slice(0, 33)}…` : line}
            </text>
            <text x="150" y="198" textAnchor="middle" style={{ font: `500 9px ${FONTS.ui}`, letterSpacing: "0.22em" }} fill="#B98A8A">
              BY HAND · WITH LOVE
            </text>
            {/* little postage stamp */}
            <g transform="translate(250 150) rotate(6)">
              <rect x="0" y="0" width="34" height="40" rx="2" fill="#fff" stroke="#E7C3C3" strokeDasharray="2 2" />
              <rect x="4" y="4" width="26" height="32" rx="1" fill={P.petal} />
              <path d="M17 26 C9 20 9 13 13 12 C15.5 11.4 17 13 17 14.5 C17 13 18.5 11.4 21 12 C25 13 25 20 17 26 Z" fill="#fff" />
            </g>

            {/* the flap, front side — folds up out of view (scaleY 1 → 0) */}
            <motion.g
              initial={false}
              animate={cracked ? { scaleY: 0 } : { scaleY: 1 }}
              transition={{ delay: reduced ? 0 : 0.35, duration: reduced ? 0 : 0.25, ease: "easeIn" }}
              style={{ originY: "0px", originX: "150px" }}
            >
              <path d="M2 10 Q2 2 10 2 L290 2 Q298 2 298 10 L298 14 L156 112 Q150 116 144 112 L2 14 Z" fill="url(#pd-flap)" stroke="#EBC9B9" strokeWidth="1.5" />
            </motion.g>

            {/* wax seal — two halves that fall away */}
            {[
              { clip: "url(#pd-left)", dx: -46, rot: -38 },
              { clip: "url(#pd-right)", dx: 46, rot: 34 },
            ].map((h, i) => (
              <motion.g
                key={i}
                initial={false}
                animate={cracked ? { x: h.dx, y: 70, rotate: h.rot, opacity: 0 } : { x: 0, y: 0, rotate: 0, opacity: 1 }}
                transition={reduced ? { duration: 0 } : { duration: 0.9, ease: [0.3, 0, 0.6, 1], opacity: { delay: 0.45, duration: 0.45 } }}
                style={{ originX: "150px", originY: "112px" }}
              >
                <g clipPath={h.clip}>
                  <path
                    d="M150 80 C162 79 168 86 176 88 C184 92 182 102 184 110 C186 120 180 126 176 134 C170 142 160 141 150 144 C140 145 132 140 125 134 C118 128 116 120 117 111 C118 101 118 92 126 87 C134 82 140 80 150 80 Z"
                    fill="url(#pd-wax)"
                  />
                  <circle cx="150" cy="112" r="22" fill="none" stroke="#5A0F2E" strokeOpacity=".55" strokeWidth="2" />
                  <circle cx="150" cy="112" r="19" fill="none" stroke="#E07AA0" strokeOpacity=".35" strokeWidth="1" />
                  <text x="150" y="118" textAnchor="middle" style={{ font: `700 16px ${FONTS.serif}` }} fill="#F6C5D6" fillOpacity=".95">
                    {seal}
                  </text>
                  <ellipse cx="138" cy="94" rx="8" ry="4" fill="#fff" opacity=".22" transform="rotate(-30 138 94)" />
                </g>
              </motion.g>
            ))}
          </svg>

          <button
            type="button"
            onClick={crack}
            aria-label="Crack the wax seal to open"
            disabled={cracked}
            style={{ position: "absolute", left: "50%", top: "52%", width: 84, height: 84, transform: "translate(-50%,-50%)", borderRadius: "50%", border: 0, background: "transparent", cursor: cracked ? "default" : "pointer" }}
          >
            {!cracked && !reduced && (
              <motion.span
                aria-hidden
                animate={{ scale: [1, 1.35], opacity: [0.55, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                style={{ position: "absolute", inset: 12, borderRadius: "50%", border: `2px solid ${P.rose}` }}
              />
            )}
          </button>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {!cracked ? (
          <motion.div key="cta" exit={{ opacity: 0, y: 8 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <Hint>Tap the wax seal to crack it 💌</Hint>
            <Btn onClick={() => crack()}>Open my vaada 🤞</Btn>
          </motion.div>
        ) : (
          <motion.p key="opening" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ margin: 0, minHeight: 98, font: `italic 400 18px ${FONTS.serif}`, color: VW.inkSoft }}>
            khul gaya… ✨
          </motion.p>
        )}
      </AnimatePresence>
      <p style={{ margin: 0, font: `400 13px ${FONTS.ui}`, color: VW.inkSoft, overflowWrap: "anywhere" }}>sealed by {sender}</p>
    </>
  );
}
