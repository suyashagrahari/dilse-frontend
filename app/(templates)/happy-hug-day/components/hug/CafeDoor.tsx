"use client";

// Arrival: the Jhappi Café shopfront — striped scalloped awning, fairy
// lights, warm windows with two steaming chai cups, a wooden door with a
// round window and a brass bell. Tap the door → it swings open on its hinge
// (3D rotateY), the bell sways and jingles, warm light spills out.

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FONTS, VW } from "../../../_valentine/theme";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { Btn, H, Hint, Kicker, sfx } from "./ui";

export default function CafeDoor({ recipient, petName, sign, sender, sticker, onEnter }: { recipient: string; petName: string; sign: string; sender: string; sticker: React.ReactNode; onEnter: () => void }) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);

  const push = () => {
    if (open) return;
    setOpen(true);
    sfx.bell();
    haptic([10, 40, 10]);
    window.setTimeout(onEnter, reduced ? 400 : 1700);
  };

  const bulbs = Array.from({ length: 11 }, (_, k) => {
    const t = (k + 0.5) / 11;
    return { x: 24 + t * 292, y: 104 + 4 * 12 * t * (1 - t), c: [H.butter, H.strawberry, "#FFF3C4", H.mint][k % 4] };
  });

  return (
    <>
      <Kicker>Happy Hug Day 🤗</Kicker>
      <h1 style={{ margin: 0, font: `700 clamp(42px, 12.5vw, 66px)/1.05 ${FONTS.script}`, color: VW.ink, overflowWrap: "anywhere", maxWidth: "100%" }}>{recipient}</h1>
      {petName && <p style={{ margin: "-8px 0 0", font: `italic 400 18px ${FONTS.serif}`, color: VW.inkSoft, overflowWrap: "anywhere" }}>“{petName}”</p>}

      <style>{`
        @keyframes hd-steam { 0% { transform: translateY(0) scaleX(1); opacity: 0 } 30% { opacity: .8 } 100% { transform: translateY(-16px) scaleX(1.4); opacity: 0 } }
        @keyframes hd-tw { 0%,100% { opacity: .35 } 50% { opacity: 1 } }
        .hd-steam { animation: hd-steam 2.4s ease-in-out infinite; transform-box: fill-box; transform-origin: bottom }
        .hd-tw { animation: hd-tw 2s ease-in-out infinite }
        @keyframes hd-ring { 0% { transform: rotate(0) } 15% { transform: rotate(26deg) } 32% { transform: rotate(-22deg) } 50% { transform: rotate(16deg) } 68% { transform: rotate(-10deg) } 84% { transform: rotate(5deg) } 100% { transform: rotate(0) } }
        .hd-ring { animation: hd-ring 1.2s ease-out both; transform-box: view-box; transform-origin: 170px 176px }
        @media (prefers-reduced-motion: reduce) { .hd-steam, .hd-tw, .hd-ring { animation: none } }
      `}</style>

      <div style={{ position: "relative", width: "min(88vw, 340px)", aspectRatio: "340 / 360", marginTop: 6 }}>
        <svg viewBox="0 0 340 360" width="100%" height="100%" aria-hidden style={{ display: "block", overflow: "visible" }}>
          <defs>
            <radialGradient id="hd-in" cx=".5" cy=".6" r=".7">
              <stop offset="0" stopColor="#FFF0C2" />
              <stop offset=".6" stopColor="#FFC98A" />
              <stop offset="1" stopColor="#E9925F" />
            </radialGradient>
            <linearGradient id="hd-win" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FFF3C9" />
              <stop offset="1" stopColor="#FFD08F" />
            </linearGradient>
            <pattern id="hd-knit" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="10" height="10" fill="#FFE6D2" />
              <path d="M0 5 l2.5 -3 l2.5 3 M5 5 l2.5 -3 l2.5 3 M0 10 l2.5 -3 l2.5 3 M5 10 l2.5 -3 l2.5 3" fill="none" stroke="#F6D2BA" strokeWidth="1.1" />
            </pattern>
          </defs>
          {/* ground shadow */}
          <ellipse cx="170" cy="352" rx="160" ry="10" fill="rgba(107,66,50,.12)" />
          {/* wall */}
          <rect x="18" y="74" width="304" height="276" rx="12" fill="url(#hd-knit)" stroke={H.cocoa} strokeWidth="3.5" />
          {/* sign board + chains */}
          <path d="M120 58 V40 M220 58 V40" stroke={H.cocoa} strokeWidth="2.5" />
          <rect x="88" y="10" width="164" height="42" rx="12" fill={H.cocoa} stroke={H.cocoaDeep} strokeWidth="3" />
          <text x="170" y="40" textAnchor="middle" style={{ font: `700 24px ${FONTS.script}` }} fill="#FFF1E0">
            Jhappi Café
          </text>
          <path d="M100 18 l4 4 M236 18 l-4 4" stroke={H.butter} strokeWidth="2" strokeLinecap="round" />
          {/* awning */}
          {Array.from({ length: 10 }, (_, k) => (
            <rect key={k} x={10 + k * 32} y="62" width="32" height="34" fill={k % 2 ? "#FFF6EC" : H.strawberry} />
          ))}
          {Array.from({ length: 10 }, (_, k) => (
            <circle key={k} cx={26 + k * 32} cy="96" r="16" fill={k % 2 ? "#FFF6EC" : H.strawberry} />
          ))}
          <path d={`M10 62 H330 V96 ${Array.from({ length: 10 }, (_, k) => `A16 16 0 0 1 ${330 - (k + 1) * 32} 96`).join(" ")} Z`} fill="none" stroke={H.cocoa} strokeWidth="3" strokeLinejoin="round" />
          {/* fairy lights */}
          <path d="M18 104 Q170 152 322 104" fill="none" stroke="#7A5A48" strokeWidth="1.4" />
          {bulbs.map((b, k) => (
            <g key={k}>
              <circle cx={b.x} cy={b.y + 6} r="7" fill={b.c} opacity=".35" className={reduced ? undefined : "hd-tw"} style={{ animationDelay: `${(k % 5) * 0.37}s` }} />
              <circle cx={b.x} cy={b.y + 6} r="3.4" fill={b.c} stroke="rgba(0,0,0,.12)" />
            </g>
          ))}
          {/* windows */}
          {[38, 236].map((x, i) => (
            <g key={x}>
              <rect x={x} y="150" width="66" height="78" rx="8" fill="url(#hd-win)" stroke={H.cocoa} strokeWidth="3.5" />
              <path d={`M${x + 33} 150 V228 M${x} 189 H${x + 66}`} stroke={H.cocoa} strokeWidth="3" />
              <rect x={x - 6} y="226" width="78" height="9" rx="3" fill={H.wood} stroke={H.cocoa} strokeWidth="2.5" />
              {i === 0 ? (
                <g>
                  {/* two chai cups with steam */}
                  {[x + 18, x + 46].map((cx, j) => (
                    <g key={cx}>
                      <path d={`M${cx - 9} 212 h18 v6 q0 8 -9 8 q-9 0 -9 -8 z`} fill="#fff" stroke={H.cocoa} strokeWidth="2" />
                      <path d={`M${cx + 9} 214 q6 0 5 5 q-1 4 -5 3`} fill="none" stroke={H.cocoa} strokeWidth="2" />
                      <path d={`M${cx - 3} 208 q-3 -5 1 -9 q3 -3 0 -7`} fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" className={reduced ? undefined : "hd-steam"} style={{ animationDelay: `${j * 0.8}s` }} />
                      <path d={`M${cx + 3} 208 q-3 -5 1 -9 q3 -3 0 -7`} fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" className={reduced ? undefined : "hd-steam"} style={{ animationDelay: `${j * 0.8 + 1.1}s` }} />
                    </g>
                  ))}
                </g>
              ) : (
                <g>
                  <path d={`M${x + 8} 160 Q${x + 33} 176 ${x + 58} 160`} fill="none" stroke={H.cocoa} strokeWidth="1.4" />
                  {[0.2, 0.5, 0.8].map((t) => (
                    <path key={t} transform={`translate(${x + 8 + t * 50} ${163 + 12 * t * (1 - t) * 2.4})`} d="M0 6 C-6 2 -6 -3 -3 -4 C-1.5 -4.5 0 -3.5 0 -2.5 C0 -3.5 1.5 -4.5 3 -4 C6 -3 6 2 0 6 Z" fill={H.cheek} />
                  ))}
                  <path d={`M${x + 22} 224 v-14 h22 v14 z`} fill="#E8A07A" stroke={H.cocoa} strokeWidth="2" />
                  <path d={`M${x + 33} 210 q-10 -14 -2 -24 M${x + 33} 210 q8 -12 2 -22 M${x + 33} 210 q14 -6 12 -16`} fill="none" stroke="#6BAA7F" strokeWidth="3" strokeLinecap="round" />
                </g>
              )}
            </g>
          ))}
          {/* door frame + warm inside */}
          <rect x="118" y="182" width="104" height="168" rx="6" fill={H.cocoaDeep} />
          <rect x="125" y="189" width="90" height="161" rx="3" fill="url(#hd-in)" />
          <path d="M150 300 C140 292 140 282 147 281 C150 280.5 152 283 152 285 C152 283 154 280.5 157 281 C164 282 164 292 152 300 Z" fill={H.cheek} opacity=".55" />
          <path d="M184 270 C177 264 177 257 182 256 C184 255.6 185 257.4 185 258.6 C185 257.4 186 255.6 188 256 C193 257 193 264 185 270 Z" fill={H.cheek} opacity=".45" />
          {/* doormat */}
          <rect x="128" y="342" width="84" height="12" rx="4" fill="#C9804F" stroke={H.cocoa} strokeWidth="2" />
          <text x="170" y="352" textAnchor="middle" style={{ font: `700 8px ${FONTS.ui}`, letterSpacing: ".2em" }} fill="#FFF1E0">
            JHAPPI
          </text>
          {/* bell */}
          <path d="M170 170 v6" stroke={H.cocoa} strokeWidth="2.5" />
          <g className={open && !reduced ? "hd-ring" : undefined}>
            <path d="M170 176 c-9 0 -11 8 -11 14 l-3 5 h28 l-3 -5 c0 -6 -2 -14 -11 -14 z" fill="#E7B44E" stroke={H.cocoa} strokeWidth="2.2" strokeLinejoin="round" />
            <circle cx="170" cy="198" r="2.8" fill={H.cocoa} />
            <path d="M163 184 q2 -4 6 -5" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity=".7" />
          </g>
        </svg>

        {/* the door */}
        <div style={{ position: "absolute", left: `${(125 / 340) * 100}%`, top: `${(189 / 360) * 100}%`, width: `${(90 / 340) * 100}%`, height: `${(161 / 360) * 100}%`, perspective: 600 }}>
          {/* who's peeking from inside */}
          <AnimatePresence>
            {open && (
              <motion.div initial={{ opacity: 0, scale: 0.6, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: reduced ? 0 : 0.35, type: "spring", stiffness: 260, damping: 15 }} style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                {sticker}
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
            type="button"
            onClick={push}
            aria-label="Push the café door open"
            disabled={open}
            initial={false}
            animate={open ? { rotateY: -78 } : { rotateY: 0 }}
            whileTap={open || reduced ? undefined : { rotateY: -8 }}
            transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 90, damping: 11 }}
            style={{ position: "absolute", inset: 0, padding: 0, border: 0, background: "transparent", transformOrigin: "0% 50%", cursor: open ? "default" : "pointer", transformStyle: "preserve-3d" }}
          >
            <svg viewBox="0 0 90 161" width="100%" height="100%" preserveAspectRatio="none" aria-hidden style={{ display: "block" }}>
              <rect x="0" y="0" width="90" height="161" rx="3" fill="#B97D4E" stroke={H.cocoa} strokeWidth="3" />
              {[22, 45, 68].map((x) => (
                <path key={x} d={`M${x} 4 V157`} stroke="#A36A3F" strokeWidth="1.5" />
              ))}
              <circle cx="45" cy="40" r="20" fill="url(#hd-in)" stroke={H.cocoa} strokeWidth="3" />
              <path d="M45 20 V60 M25 40 H65" stroke={H.cocoa} strokeWidth="2" />
              <path d="M34 76 L45 66 L56 76" fill="none" stroke={H.cocoa} strokeWidth="1.4" />
              <rect x="20" y="76" width="50" height="22" rx="5" fill="#FFF6EC" stroke={H.cocoa} strokeWidth="2" />
              <text x="45" y="91" textAnchor="middle" style={{ font: `700 10px ${FONTS.ui}`, letterSpacing: ".1em" }} fill={H.cheek}>
                OPEN
              </text>
              <circle cx="76" cy="100" r="4.5" fill="#E7B44E" stroke={H.cocoa} strokeWidth="2" />
              <rect x="8" y="114" width="74" height="38" rx="4" fill="none" stroke="#A36A3F" strokeWidth="2" />
            </svg>
          </motion.button>
        </div>
      </div>

      <p style={{ margin: 0, maxWidth: 320, font: `600 16px/1.4 ${FONTS.ui}`, color: VW.ink, overflowWrap: "anywhere" }}>{sign}</p>
      <AnimatePresence mode="wait">
        {!open ? (
          <motion.div key="cta" exit={{ opacity: 0 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <Hint>Tap the door — the bell will tell them you&apos;re here 🔔</Hint>
            <Btn onClick={push}>Come in 🤗</Btn>
          </motion.div>
        ) : (
          <motion.p key="in" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ margin: 0, minHeight: 98, font: `italic 400 18px ${FONTS.serif}`, color: VW.inkSoft }}>
            ting-ting! welcome in ☕
          </motion.p>
        )}
      </AnimatePresence>
      <p style={{ margin: 0, font: `400 13px ${FONTS.ui}`, color: VW.inkSoft, overflowWrap: "anywhere" }}>your table is booked by {sender}</p>
    </>
  );
}
