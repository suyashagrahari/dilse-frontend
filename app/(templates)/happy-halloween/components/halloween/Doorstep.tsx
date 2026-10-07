"use client";

// Room 1 — The Doorstep. A tiny crooked house glows on a hill, the sender's
// sign hangs on the gate and an envelope with the recipient's name waits on
// the mat. Knock three times: each knock shakes the door and lights another
// window; the third creaks it open and a little ghost peeks out. The knock is
// also the first gesture, so it is what starts the music.

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { FONTS, VW } from "../../../_valentine/theme";
import { Bat, Pumpkin } from "./art";
import { HW_DISPLAY } from "./fonts";
import { Btn, Hint, HW, RoomTitle, SkipChip } from "./ui";

function House({ lit, open }: { lit: number; open: boolean }) {
  const on = (n: number) => lit >= n;
  const win = (n: number) => (on(n) ? "url(#hw-win-on)" : "#1B1330");
  return (
    <svg viewBox="0 0 300 340" width="100%" height="100%" style={{ display: "block", overflow: "visible" }} aria-hidden>
      <defs>
        <radialGradient id="hw-win-on" cx="50%" cy="50%" r="70%">
          <stop offset="0" stopColor="#FFF1B8" />
          <stop offset="1" stopColor="#FFB347" />
        </radialGradient>
        <radialGradient id="hw-spill" cx="50%" cy="0%" r="100%">
          <stop offset="0" stopColor="rgba(255,210,122,.75)" />
          <stop offset="1" stopColor="rgba(255,210,122,0)" />
        </radialGradient>
        <linearGradient id="hw-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3B2A5C" />
          <stop offset="1" stopColor="#2A1D45" />
        </linearGradient>
      </defs>
      {/* hill */}
      <ellipse cx="150" cy="338" rx="170" ry="26" fill="#120C22" />
      {/* light spilling onto the path when the door opens */}
      <path d="M125 322 L175 322 L215 340 L85 340 Z" fill="url(#hw-spill)" style={{ opacity: open ? 1 : 0, transition: "opacity .8s" }} />
      {/* chimney */}
      <rect x="196" y="70" width="22" height="50" fill="#2A1D45" transform="rotate(4 207 95)" />
      <rect x="192" y="64" width="30" height="10" rx="2" fill="#1B1330" transform="rotate(4 207 69)" />
      {/* body — a little crooked */}
      <path d="M62 150 L240 140 L248 322 L54 324 Z" fill="url(#hw-wall)" stroke="#120C22" strokeWidth="3" />
      {/* planks */}
      <g stroke="rgba(18,12,34,.45)" strokeWidth="1.5">
        <path d="M60 190 L243 182" />
        <path d="M58 232 L245 226" />
        <path d="M56 276 L246 272" />
      </g>
      {/* roof */}
      <path d="M38 160 L148 48 L264 148 Z" fill="#251842" stroke="#120C22" strokeWidth="3" strokeLinejoin="round" />
      <path d="M148 48 L152 30" stroke="#120C22" strokeWidth="3" />
      <path d="M152 30 L162 34 L152 38" fill="#FF8A3D" />
      {/* attic window */}
      <circle cx="150" cy="114" r="17" fill={win(3)} stroke="#120C22" strokeWidth="3" style={{ transition: "fill .5s", filter: on(3) ? "drop-shadow(0 0 10px #FFB347)" : undefined }} />
      <path d="M150 97 L150 131 M133 114 L167 114" stroke="#120C22" strokeWidth="2.5" />
      {/* windows */}
      <g style={{ filter: on(1) ? "drop-shadow(0 0 12px #FFB347)" : undefined, transition: "filter .5s" }}>
        <rect x="80" y="178" width="38" height="44" rx="6" fill={win(1)} stroke="#120C22" strokeWidth="3" style={{ transition: "fill .5s" }} />
        <path d="M99 178 L99 222 M80 200 L118 200" stroke="#120C22" strokeWidth="2.5" />
      </g>
      <g style={{ filter: on(2) ? "drop-shadow(0 0 12px #FFB347)" : undefined, transition: "filter .5s" }}>
        <rect x="184" y="172" width="38" height="44" rx="6" fill={win(2)} stroke="#120C22" strokeWidth="3" style={{ transition: "fill .5s" }} />
        <path d="M203 172 L203 216 M184 194 L222 194" stroke="#120C22" strokeWidth="2.5" />
      </g>
      {/* window ghosts: tiny silhouettes once lit */}
      {on(1) && <path d="M93 214 C93 204 96 199 99 199 C102 199 105 204 105 214 L102 212 L99 214 L96 212 Z" fill="rgba(58,34,87,.55)" />}
      {on(2) && <circle cx="203" cy="206" r="5" fill="rgba(58,34,87,.5)" />}
      {/* doorway (what you see when the door swings open) */}
      <path d="M125 322 L125 252 Q150 222 175 252 L175 322 Z" fill={open ? "url(#hw-win-on)" : "#120C22"} style={{ transition: "fill .6s" }} />
      {/* steps + mat */}
      <rect x="112" y="322" width="76" height="8" rx="2" fill="#3B2A5C" />
      <rect x="120" y="330" width="60" height="6" rx="3" fill="#B84E14" />
      {/* lantern */}
      <g transform="translate(192 248)">
        <path d="M0 0 L0 -10" stroke="#120C22" strokeWidth="2" />
        <rect x="-6" y="0" width="12" height="16" rx="3" fill={on(1) ? "#FFD27A" : "#4A3F66"} stroke="#120C22" strokeWidth="2" style={{ transition: "fill .5s" }} />
      </g>
      {/* fence */}
      <g fill="#2A1D45" stroke="#120C22" strokeWidth="2">
        {[6, 26, 46, 230, 250, 270, 290].map((x) => (
          <path key={x} d={`M${x} 336 L${x} 300 L${x + 7} 292 L${x + 14} 300 L${x + 14} 336 Z`} />
        ))}
        <rect x="2" y="306" width="62" height="6" />
        <rect x="226" y="306" width="78" height="6" />
      </g>
    </svg>
  );
}

export default function Doorstep({
  recipient,
  petName,
  houseName,
  sticker,
  onEnter,
}: {
  recipient: string;
  petName: string;
  houseName: string;
  sticker: ReactNode;
  onEnter: () => void;
}) {
  const reduced = useReducedMotion();
  const [knocks, setKnocks] = useState(0);
  const open = knocks >= 3;

  const knock = () => {
    if (open) return;
    haptic(open ? 10 : 18);
    setKnocks((k) => Math.min(3, k + 1));
  };

  return (
    <>
      <RoomTitle as="h1" kicker="Someone left something on your doorstep…" title={<>A little haunted house</>} />

      <motion.div
        key={knocks}
        animate={reduced || knocks === 0 ? undefined : { x: [0, -6, 6, -4, 4, 0], rotate: [0, -0.6, 0.6, 0] }}
        transition={{ duration: 0.42 }}
        style={{ position: "relative", width: "min(84vw, calc(320px * var(--vw-s, 1)))", aspectRatio: "300 / 340", marginTop: 4 }}
      >
        <House lit={knocks} open={open} />

        {/* bat on the roof */}
        <span aria-hidden style={{ position: "absolute", left: "58%", top: "6%" }} className={reduced ? undefined : "vw-anim-float"}>
          <Bat size={34} color="#0B0718" />
        </span>
        {/* pumpkins by the steps */}
        <span aria-hidden style={{ position: "absolute", left: "24%", top: "85%" }}>
          <Pumpkin size={34} face lit={knocks >= 1} />
        </span>
        <span aria-hidden style={{ position: "absolute", left: "66%", top: "87%" }}>
          <Pumpkin size={26} face lit={knocks >= 2} />
        </span>

        {/* the door leaf — a real button: tap it to knock */}
        <div style={{ position: "absolute", left: `${(125 / 300) * 100}%`, top: `${(222 / 340) * 100}%`, width: `${(50 / 300) * 100}%`, height: `${(100 / 340) * 100}%`, perspective: 600 }}>
          <AnimatePresence>
            {open && (
              <div style={{ position: "absolute", left: -40, right: -40, bottom: "2%", display: "flex", justifyContent: "center", zIndex: 0, pointerEvents: "none" }}>
                <motion.div
                  initial={{ opacity: 0, y: 26, scale: 0.6 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: reduced ? 0 : 0.45, type: "spring", stiffness: 200, damping: 14 }}
                >
                  {sticker}
                </motion.div>
              </div>
            )}
          </AnimatePresence>
          <button
            type="button"
            onClick={knock}
            aria-label={open ? "The door is open" : `Knock on the door (${knocks} of 3)`}
            disabled={open}
            style={{
              position: "absolute",
              inset: 0,
              border: "3px solid #120C22",
              borderRadius: "50% 50% 4px 4px / 34% 34% 4px 4px",
              background: "repeating-linear-gradient(90deg, #5B3A7A 0 11px, #4C2F68 11px 13px)",
              boxShadow: "inset 0 -10px 18px rgba(0,0,0,.35)",
              transformOrigin: "left center",
              transform: open ? "rotateY(-78deg)" : "rotateY(0deg)",
              transition: reduced ? "none" : "transform 1.1s cubic-bezier(.3,.7,.2,1)",
              cursor: open ? "default" : "pointer",
              zIndex: 1,
              padding: 0,
            }}
          >
            <span aria-hidden style={{ position: "absolute", right: "16%", top: "52%", width: 9, height: 9, borderRadius: "50%", background: HW.candle, boxShadow: "0 0 6px #FFB347" }} />
            <span aria-hidden style={{ position: "absolute", left: "50%", top: "24%", transform: "translateX(-50%)", width: 14, height: 14, borderRadius: "50%", border: `3px solid ${HW.candle}`, opacity: 0.85 }} />
          </button>
          <AnimatePresence>
            {knocks > 0 && !open && (
              <motion.span
                key={knocks}
                aria-hidden
                initial={{ opacity: 0, y: 0, scale: 0.7 }}
                animate={{ opacity: [0, 1, 0], y: -46, scale: 1.1 }}
                transition={{ duration: 0.9 }}
                style={{ position: "absolute", left: "50%", top: 0, marginLeft: -40, width: 80, textAlign: "center", font: `400 20px ${HW_DISPLAY}`, color: HW.candle, pointerEvents: "none", zIndex: 2 }}
              >
                knock!
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* the sign on the gate */}
        {houseName && (
          <div
            style={{
              position: "absolute",
              left: "-2%",
              top: "70%",
              maxWidth: "42%",
              padding: "6px 9px 7px",
              borderRadius: 6,
              background: "linear-gradient(180deg, #A8743E, #8A5A2B)",
              border: "2px solid #5A3818",
              boxShadow: "0 6px 14px -6px rgba(0,0,0,.6)",
              transform: "rotate(-6deg)",
              font: `400 calc(13px * var(--vw-s, 1))/1.15 ${HW_DISPLAY}`,
              color: "#FFF6E6",
              textAlign: "center",
              overflowWrap: "anywhere",
              zIndex: 2,
            }}
          >
            {houseName}
          </div>
        )}
      </motion.div>

      {/* the envelope on the mat */}
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 12, rotate: -4 }}
        animate={{ opacity: 1, y: 0, rotate: -2 }}
        transition={{ delay: 0.3 }}
        style={{ position: "relative", padding: "12px 26px 14px", borderRadius: 10, background: VW.paper, color: VW.paperInk, boxShadow: "0 14px 30px -14px rgba(0,0,0,.7)", minWidth: 190 }}
      >
        <span aria-hidden style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 6, background: HW.pumpkin, opacity: 0.85, transform: "translateY(-50%)" }} />
        <span aria-hidden style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", fontSize: 20 }}>🎀</span>
        <p style={{ position: "relative", margin: 0, font: `600 12px ${FONTS.ui}`, letterSpacing: ".18em", textTransform: "uppercase", background: VW.paper, display: "inline-block", padding: "0 6px" }}>for</p>
        <p style={{ position: "relative", margin: "2px 0 0", font: `400 calc(30px * var(--vw-s, 1))/1.05 ${HW_DISPLAY}`, background: VW.paper, padding: "0 8px", overflowWrap: "anywhere" }}>{recipient}</p>
        {petName && <p style={{ position: "relative", margin: "4px 0 0", font: `italic 400 15px ${FONTS.serif}`, background: VW.paper, display: "inline-block", padding: "0 6px" }}>“{petName}”</p>}
      </motion.div>

      {!open ? (
        <>
          <div aria-hidden style={{ display: "flex", gap: 8 }}>
            {[1, 2, 3].map((n) => (
              <span key={n} style={{ width: 12, height: 12, borderRadius: "50%", background: knocks >= n ? HW.candle : "rgba(247,243,255,.2)", boxShadow: knocks >= n ? "0 0 8px #FFB347" : undefined, transition: "background .3s" }} />
            ))}
          </div>
          <Btn onClick={knock}>Knock knock ✊ {knocks > 0 ? `(${knocks}/3)` : ""}</Btn>
          <Hint>Knock three times on the door</Hint>
          <SkipChip onClick={() => setKnocks(3)}>Just open it</SkipChip>
        </>
      ) : (
        <motion.div initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduced ? 0 : 0.9 }} style={{ display: "grid", gap: 10, justifyItems: "center" }}>
          <p style={{ margin: 0, font: `600 16px ${FONTS.ui}`, color: VW.ink }}>The door creaked open… someone&apos;s home 👻</p>
          <Btn onClick={onEnter}>Step inside →</Btn>
        </motion.div>
      )}
    </>
  );
}
