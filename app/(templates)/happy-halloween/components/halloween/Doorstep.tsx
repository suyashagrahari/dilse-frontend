"use client";

// Room 1 — The Doorstep. The first screen, and the one that has to make her
// gasp: a big crooked haunted house fills the night under a huge moon, with a
// witchy tower, flickering candle-lit windows, a bare tree, a picket fence,
// pumpkins on the steps, ground fog rolling past and bats circling the tower
// (the giant corner webs and the dangling spider live in ./Atmosphere.tsx).
// The sender's sign hangs on the fence and an envelope with her name waits on
// the path. Knock three times: each knock shakes the house and lights more
// windows; the third creaks the door open and — BOO — a ghost bursts out of a
// pumpkin at her (the first jump-scare, see ./stage.tsx), then "got you! 💜",
// the little ghost waves from the doorway and the night carries her inside.
// The knock is also the first gesture, so it starts the Haunted Piano.
//
// Performance: the house is one static SVG. Everything that moves (window
// flicker, fog, bats, the moon's halo) is an HTML layer animating transform or
// opacity only, so the compositor does it; reduced motion keeps it all still.

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { FONTS, VW } from "../../../_valentine/theme";
import { Bat, Pumpkin, Spider } from "./art";
import { HW_DISPLAY } from "./fonts";
import { HW_GIF, preload, useHw, useNext } from "./stage";
import { HW, RoomTitle } from "./ui";

/** The drawing's own units (the house box keeps this ratio). */
const VB_W = 400;
const VB_H = 420;
const pct = (v: number, of: number) => `${(v / of) * 100}%`;

/** Window glows (HTML, so their flicker is composited). `at` = the knock that lights it (0 = lit from the start). */
const WINDOWS: { x: number; y: number; w: number; h: number; at: number; round?: boolean }[] = [
  { x: 271, y: 196, w: 28, h: 38, at: 0 }, // tower, upper: the one candle that is always on
  { x: 104, y: 244, w: 40, h: 48, at: 1 },
  { x: 208, y: 240, w: 36, h: 48, at: 1 },
  { x: 274, y: 282, w: 22, h: 30, at: 2 }, // tower, lower
  { x: 159, y: 149, w: 38, h: 38, at: 3, round: true }, // attic
];

function House({ lit, open }: { lit: number; open: boolean }) {
  const on = (n: number) => lit >= n;
  const glass = (n: number) => (on(n) ? "url(#hw-win-on)" : "#150F28");
  const ink = "#0E0A1C";
  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width="100%" height="100%" style={{ position: "absolute", inset: 0, display: "block", overflow: "visible" }} aria-hidden>
      <defs>
        <radialGradient id="hw-win-on" cx="50%" cy="60%" r="75%">
          <stop offset="0" stopColor="#FFF4C2" />
          <stop offset=".55" stopColor="#FFC65C" />
          <stop offset="1" stopColor="#FF9A3C" />
        </radialGradient>
        <radialGradient id="hw-spill" cx="50%" cy="0%" r="100%">
          <stop offset="0" stopColor="rgba(255,210,122,.8)" />
          <stop offset="1" stopColor="rgba(255,210,122,0)" />
        </radialGradient>
        <linearGradient id="hw-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#47336E" />
          <stop offset="1" stopColor="#2A1D47" />
        </linearGradient>
        <linearGradient id="hw-tower" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3B2A60" />
          <stop offset="1" stopColor="#261A42" />
        </linearGradient>
        <linearGradient id="hw-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2E2050" />
          <stop offset="1" stopColor="#1E1538" />
        </linearGradient>
        {/* the moon's rim light on the left edges */}
        <linearGradient id="hw-rim" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="rgba(255,236,190,0)" />
          <stop offset="1" stopColor="rgba(255,236,190,.16)" />
        </linearGradient>
      </defs>

      {/* the bare old tree, left */}
      <path
        d="M26 404 C36 362 42 322 38 284 C35 258 24 240 6 228 L10 222 C26 232 38 244 44 258 C46 236 40 212 26 194 L32 190 C46 208 52 230 52 252 C58 236 70 226 88 222 L90 228 C72 234 62 246 58 264 C57 300 60 352 68 404 Z"
        fill="#0B0717"
      />
      <path d="M33 214 C26 204 18 200 8 200 M40 196 C38 184 32 176 22 170 M70 230 C78 220 86 216 98 216" stroke="#0B0717" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* the hill */}
      <ellipse cx="200" cy="420" rx="250" ry="40" fill="#110B21" />

      {/* chimney */}
      <path d="M222 108 L244 110 L242 168 L220 166 Z" fill="#2A1D47" stroke={ink} strokeWidth="3" />
      <rect x="216" y="100" width="32" height="11" rx="2" fill="#1E1538" stroke={ink} strokeWidth="3" transform="rotate(3 232 105)" />

      {/* main house: a little crooked */}
      <path d="M86 214 L262 206 L268 394 L80 396 Z" fill="url(#hw-wall)" stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M86 214 L262 206 L268 394 L80 396 Z" fill="url(#hw-rim)" />
      <g stroke="rgba(14,10,28,.45)" strokeWidth="1.6">
        <path d="M84 240 L263 233" />
        <path d="M83 300 L265 296" />
        <path d="M82 350 L267 348" />
      </g>
      {/* gable roof with shingle rows */}
      <path d="M62 222 L176 92 L286 212 Z" fill="url(#hw-roof)" stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />
      <g stroke="rgba(14,10,28,.6)" strokeWidth="1.6" fill="none">
        <path d="M96 184 Q106 190 116 184 Q126 190 136 184 Q146 190 156 184 Q166 190 176 184 Q186 190 196 184 Q206 190 216 184 Q226 190 236 184 Q246 190 254 186" />
        <path d="M122 154 Q132 160 142 154 Q152 160 162 154 Q172 160 182 154 Q192 160 202 154 Q212 160 222 154 Q228 158 230 157" />
        <path d="M148 124 Q158 130 168 124 Q178 130 188 124 Q198 130 204 126" />
      </g>
      <path d="M176 92 L178 72" stroke={ink} strokeWidth="3" />

      {/* attic round window */}
      <circle cx="178" cy="168" r="19" fill={glass(3)} stroke={ink} strokeWidth="3.5" style={{ transition: "fill .5s" }} />
      <path d="M178 149 L178 187 M159 168 L197 168" stroke={ink} strokeWidth="2.6" />

      {/* first-floor windows with crooked shutters */}
      <rect x="104" y="244" width="40" height="48" rx="7" fill={glass(1)} stroke={ink} strokeWidth="3.5" style={{ transition: "fill .5s" }} />
      <path d="M124 244 L124 292 M104 266 L144 266" stroke={ink} strokeWidth="2.6" />
      <path d="M92 242 L102 244 L101 294 L90 292 Z" fill="#1E1538" stroke={ink} strokeWidth="2" transform="rotate(-4 96 268)" />
      <rect x="208" y="240" width="36" height="48" rx="7" fill={glass(1)} stroke={ink} strokeWidth="3.5" style={{ transition: "fill .5s" }} />
      <path d="M226 240 L226 288 M208 262 L244 262" stroke={ink} strokeWidth="2.6" />
      <path d="M246 240 L256 238 L257 290 L247 290 Z" fill="#1E1538" stroke={ink} strokeWidth="2" transform="rotate(5 251 264)" />
      {/* who's home: tiny silhouettes once a window is lit */}
      {on(1) && <path d="M117 290 C117 276 120 270 124 270 C128 270 131 276 131 290 L127 287 L124 290 L121 287 Z" fill="rgba(58,34,87,.6)" />}
      {on(1) && <path d="M219 288 L219 278 L222 281 L226 278 L230 281 L233 278 L233 288 Z" fill="rgba(58,34,87,.55)" />}

      {/* the tower, right */}
      <path d="M250 168 L316 162 L322 396 L250 396 Z" fill="url(#hw-tower)" stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M238 174 L284 44 L332 166 Z" fill="url(#hw-roof)" stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />
      <g stroke="rgba(14,10,28,.6)" strokeWidth="1.5" fill="none">
        <path d="M256 128 Q264 133 272 128 Q280 133 288 128 Q296 133 304 128 Q310 132 314 130" />
        <path d="M266 96 Q274 101 282 96 Q290 101 298 96 Q302 99 304 98" />
      </g>
      <path d="M284 44 L285 24" stroke={ink} strokeWidth="3" />
      <path d="M285 24 L298 29 L285 34" fill={HW.pumpkin} />
      <path d="M271 234 L271 212 Q285 190 299 212 L299 234 Z" fill={glass(0)} stroke={ink} strokeWidth="3.5" />
      <path d="M285 196 L285 234 M271 218 L299 218" stroke={ink} strokeWidth="2.4" />
      {/* the cat in the tower window, always home */}
      <path d="M279 234 L279 224 L281 219 L283 223 L287 223 L289 219 L291 224 L291 234 Z" fill="rgba(40,22,64,.75)" />
      <path d="M274 312 L274 292 Q285 278 296 292 L296 312 Z" fill={glass(2)} stroke={ink} strokeWidth="3" style={{ transition: "fill .5s" }} />

      {/* light spilling down the path when the door opens */}
      <path d="M152 398 L204 398 L252 420 L104 420 Z" fill="url(#hw-spill)" style={{ opacity: open ? 1 : 0, transition: "opacity .8s" }} />
      {/* porch: little roof + posts */}
      <path d="M138 300 L178 276 L218 298 Z" fill="#1E1538" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
      <rect x="143" y="298" width="7" height="96" fill="#2A1D47" stroke={ink} strokeWidth="2" />
      <rect x="207" y="296" width="7" height="98" fill="#2A1D47" stroke={ink} strokeWidth="2" />
      {/* doorway (seen when the door swings open) */}
      <path d="M156 394 L156 330 Q178 298 200 330 L200 394 Z" fill={open ? "url(#hw-win-on)" : "#0B0717"} style={{ transition: "fill .6s" }} />
      {/* steps */}
      <rect x="146" y="394" width="64" height="7" rx="2" fill="#3B2A5C" stroke={ink} strokeWidth="1.5" />
      <rect x="138" y="401" width="80" height="7" rx="2" fill="#33244F" stroke={ink} strokeWidth="1.5" />
      {/* porch lantern */}
      <g transform="translate(224 306)">
        <path d="M0 0 L0 -8" stroke={ink} strokeWidth="2" />
        <rect x="-6" y="0" width="12" height="16" rx="3" fill={on(1) ? "#FFD27A" : "#5A4A7E"} stroke={ink} strokeWidth="2" style={{ transition: "fill .5s" }} />
      </g>

      {/* picket fences */}
      <g fill="#24183F" stroke={ink} strokeWidth="2">
        {[4, 24, 44, 64, 334, 354, 374, 394].map((x) => (
          <path key={x} d={`M${x - 7} 414 L${x - 7} 374 L${x} 366 L${x + 7} 374 L${x + 7} 414 Z`} />
        ))}
        <rect x="-6" y="382" width="82" height="6" />
        <rect x="322" y="382" width="86" height="6" />
      </g>
      {/* a cute heart-stone */}
      <path d="M336 414 L336 380 Q352 362 368 380 L368 414 Z" fill="#4A3F66" stroke={ink} strokeWidth="2.5" />
      <path d="M352 400 C344 394 345 387 349 388 C350.5 388.3 352 390 352 390 C352 390 353.5 388.3 355 388 C359 387 360 394 352 400Z" fill="#FF9EC4" opacity=".85" />
    </svg>
  );
}

const box = (x: number, y: number, w: number, h: number): CSSProperties => ({ position: "absolute", left: pct(x, VB_W), top: pct(y, VB_H), width: pct(w, VB_W), height: pct(h, VB_H) });

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
  const hw = useHw();
  const [knocks, setKnocks] = useState(0);
  const [greeted, setGreeted] = useState(false);
  const open = knocks >= 3;
  const play = `door${hw.round}`;

  useEffect(() => preload(`${HW_GIF.boo}?play=${play}`), [play]);

  const opened = () => {
    hw.cue("creak", { gain: 0.8 });
    // the door swings for ~0.9 s, then whoever's home says hello
    window.setTimeout(
      () =>
        hw.scare({
          kind: "boo",
          play,
          line: <>It&apos;s only me. Happy Halloween, {recipient}!</>,
          onDone: () => setGreeted(true),
        }),
      reduced ? 200 : 950,
    );
  };

  const knock = () => {
    if (open) return;
    haptic(18);
    const k = Math.min(3, knocks + 1);
    hw.cue("knock", { gain: 0.9, detune: (k - 2) * 60 });
    setKnocks(k);
    if (k === 3) opened();
  };
  // the ghost waves from the doorway; she steps inside when she's ready
  useNext(greeted ? "Step inside" : null, onEnter, "ghost");

  return (
    <>
      <style>{CSS}</style>
      <RoomTitle as="h1" kicker="Someone left something on your doorstep…" title={<>A little haunted house</>} />
      {/* a little spider drops in from the big corner web and bobs on its thread */}
      <span className="hw-spider" aria-hidden>
        <i />
        <Spider size={28} thread={0} />
      </span>

      <div className="hw-fill hw-door-fill">
        <motion.div
          key={knocks}
          className="hw-house"
          animate={reduced || knocks === 0 ? undefined : { x: [0, -6, 6, -4, 4, 0], rotate: [0, -0.5, 0.5, 0] }}
          transition={{ duration: 0.42 }}
        >
          {/* the huge moon behind the tower, and its slow-breathing halo */}
          <span className="hw-door-halo" aria-hidden />
          <span className="hw-door-moon" aria-hidden />

          <House lit={knocks} open={open} />

          {/* candle-lit windows: the glow spills past the frame and flickers */}
          {WINDOWS.map((wn, k) => (
            <span
              key={k}
              aria-hidden
              className={`hw-glow${knocks >= wn.at ? " is-on" : ""}${wn.round ? " is-round" : ""}`}
              style={{ ...box(wn.x - wn.w * 0.6, wn.y - wn.h * 0.5, wn.w * 2.2, wn.h * 2), animationDelay: `${-k * 0.7}s` }}
            />
          ))}
          {/* the open door's warm light */}
          <span aria-hidden className={`hw-glow is-door${open ? " is-on" : ""}`} style={box(126, 290, 104, 140)} />

          {/* bats circling the tower */}
          <span className="hw-orbit" aria-hidden style={box(232, 20, 110, 90)}>
            {[0, 1, 2].map((n) => (
              <span key={n} className={`hw-obat b${n}`}>
                <span>
                  <Bat size={n === 0 ? 30 : 22} color="#0B0717" />
                </span>
              </span>
            ))}
          </span>
          {/* three cute bats (GIF) by the chimney */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="hw-door-gifbats" src={HW_GIF.bats} alt="" aria-hidden width={360} height={360} decoding="async" style={{ position: "absolute", left: "8%", top: "2%", width: "28%", height: "auto", pointerEvents: "none" }} />

          {/* ground fog rolling past the house's feet */}
          <span className="hw-gfog f1" aria-hidden />
          <span className="hw-gfog f2" aria-hidden />

          {/* pumpkins on the steps */}
          <span aria-hidden style={{ position: "absolute", left: pct(214, VB_W), top: pct(380, VB_H), zIndex: 2 }}>
            <Pumpkin size={30} face lit={knocks >= 2} />
          </span>
          <span aria-hidden style={{ position: "absolute", left: pct(118, VB_W), top: pct(384, VB_H), zIndex: 2 }}>
            <Pumpkin size={22} face lit={knocks >= 1} />
          </span>

          {/* the door leaf — a real button: tap it to knock */}
          <div style={{ ...box(156, 298, 44, 96), perspective: 600, zIndex: 3 }}>
            <AnimatePresence>
              {greeted && (
                <div style={{ position: "absolute", left: -50, right: -50, bottom: "2%", display: "flex", justifyContent: "center", zIndex: 0, pointerEvents: "none" }}>
                  <motion.div initial={{ opacity: 0, y: 26, scale: 0.6 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 14 }}>
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
              className="hw-door"
              style={{
                transform: open ? "rotateY(-78deg)" : "rotateY(0deg)",
                transition: reduced ? "none" : "transform 1.1s cubic-bezier(.3,.7,.2,1)",
                cursor: open ? "default" : "pointer",
              }}
            >
              <span aria-hidden style={{ position: "absolute", right: "14%", top: "56%", width: "16%", aspectRatio: "1", borderRadius: "50%", background: HW.candle, boxShadow: "0 0 6px #FFB347" }} />
              <span aria-hidden style={{ position: "absolute", left: "50%", top: "28%", transform: "translateX(-50%)", width: "26%", aspectRatio: "1", borderRadius: "50%", border: `3px solid ${HW.candle}`, opacity: 0.85 }} />
            </button>
            <AnimatePresence>
              {knocks > 0 && !open && (
                <motion.span
                  key={knocks}
                  aria-hidden
                  initial={{ opacity: 0, y: 0, scale: 0.7 }}
                  animate={{ opacity: [0, 1, 0], y: -54, scale: 1.15 }}
                  transition={{ duration: 0.9 }}
                  style={{ position: "absolute", left: "50%", top: 0, marginLeft: -50, width: 100, textAlign: "center", font: `400 24px ${HW_DISPLAY}`, color: HW.candle, textShadow: "0 0 12px rgba(255,138,61,.8)", pointerEvents: "none", zIndex: 2 }}
                >
                  knock!
                </motion.span>
              )}
            </AnimatePresence>
          </div>


          {/* the envelope waiting on the path */}
          <motion.div initial={reduced ? false : { opacity: 0, y: 12, rotate: -4 }} animate={{ opacity: 1, y: 0, rotate: -2 }} transition={{ delay: 0.3 }} className="hw-envelope">
            <span aria-hidden style={{ position: "absolute", left: -6, top: "50%", transform: "translateY(-50%) rotate(-8deg)", fontSize: 17 }}>🎀</span>
            <span style={{ font: `600 10px ${FONTS.ui}`, letterSpacing: ".18em", textTransform: "uppercase" }}>for</span>
            <span style={{ font: `400 clamp(19px, 3.1dvh, 26px)/1.05 ${HW_DISPLAY}`, overflowWrap: "anywhere" }}>{recipient}</span>
            {petName && <span style={{ font: `italic 400 13px ${FONTS.serif}` }}>“{petName}”</span>}
          </motion.div>
        </motion.div>
        {/* pinned to the room's edges (the house may bleed past them) */}
        {/* the title card on the lawn: HAPPY HALLOWEEN + a penguin in a pumpkin */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HW_GIF.title}
          alt="Happy Halloween"
          width={320}
          height={320}
          decoding="async"
          fetchPriority="low"
          style={{ position: "absolute", left: "-1%", bottom: "5%", width: "min(30%, 150px)", height: "auto", zIndex: 2, pointerEvents: "none", filter: "drop-shadow(0 6px 10px rgba(0,0,0,.45))" }}
        />
        {houseName && <div className="hw-sign">{houseName}</div>}
      </div>

      {/* The knock lives in the candy pill's spot (the pill itself only appears once the door is open and the ghost said hello). */}
      {!open ? (
        <div className="hw-next-wrap">
          <button type="button" className="hw-next hw-knock" onClick={knock} aria-label={`Knock on the door (${knocks} of 3)`}>
            <span className="hw-next-stripes" aria-hidden />
            <span className="hw-next-gloss" aria-hidden />
            {knocks === 0 && <span className="hw-next-ring" aria-hidden />}
            <span className="hw-next-ico" aria-hidden>
              ✊
            </span>
            <span className="hw-next-label">Knock knock</span>
            <span aria-hidden className="hw-knock-dots">
              {[1, 2, 3].map((n) => (
                <i key={n} className={knocks >= n ? "is-on" : undefined} />
              ))}
            </span>
          </button>
        </div>
      ) : (
        <motion.p
          className="hw-door-note"
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: greeted ? 0 : 1, y: 0 }}
          transition={{ delay: reduced ? 0 : 0.4 }}
          style={{ font: `600 clamp(14px, 2.2dvh, 16px) ${FONTS.ui}`, color: VW.ink }}
        >
          The door is creaking open…
        </motion.p>
      )}
    </>
  );
}

const CSS = `
/* The doorstep: the house takes every pixel between the title and the knock (which sits in the pill's spot). */
.hw-scene[data-hw-scene="door"] { gap: clamp(4px, 1.2dvh, 12px); }
.hw-door-fill { overflow: visible; place-items: end center; }
.hw-scene[data-hw-scene="door"] > header { position: relative; z-index: 5; }
.hw-scene[data-hw-scene="door"] header > p { text-shadow: 0 1px 0 #2B1E3F, 0 0 10px rgba(23,18,43,.95), 0 0 18px rgba(23,18,43,.8); }
.hw-scene[data-hw-scene="door"] h1 { text-shadow: 0 2px 0 #2B1E3F, 0 0 14px rgba(23,18,43,.95), 0 0 30px rgba(255,138,61,.3) !important; }
/* Short screens: no slack above the house, so the moon stays inside its box (never behind the title). */
/* Wide screens: the stage column is the frame, so the house fits it instead of bleeding. */
/* Wide screens: the night around it is full-bleed, so nothing clips here; the house grows up into the sky behind the title. */
@media (min-width: 768px) {
  .hw-scene[data-hw-scene="door"] { overflow: visible; }
  .hw-door-fill { margin-top: -12dvh; }
  .hw-door-gifbats { display: none; }
  .hw-house { width: min(112cqw, calc(100cqh * ${VB_W} / ${VB_H}), calc(720px * var(--vw-s, 1))); }
}
@media (max-height: 760px) { .hw-door-moon { left: 50%; top: 3%; width: 44%; } .hw-door-halo { left: 30%; top: -20%; width: 86%; } }
.hw-spider { position: fixed; z-index: 3; top: -60px; right: calc(var(--vw-gutter, 0px) + 6%); height: calc(var(--vw-top-space, 0px) + 300px); width: 28px; pointer-events: none;
  display: flex; flex-direction: column; align-items: center; animation: hw-spider-in 1.8s cubic-bezier(.3,1.35,.5,1) both, hw-spider-bob 3.4s ease-in-out 1.8s infinite alternate; }
.hw-spider i { flex: 1; width: 1px; background: linear-gradient(rgba(247,243,255,.15), rgba(247,243,255,.6)); }
@keyframes hw-spider-in { from { transform: translateY(-270px) } to { transform: translateY(0) } }
@keyframes hw-spider-bob { from { transform: translateY(0) rotate(-2deg) } to { transform: translateY(14px) rotate(2deg) } }
/* The house: as big as the room allows, bleeding a little past the sides on phones. */
.hw-house { position: relative; width: min(132cqw, calc(100cqh * ${VB_W} / ${VB_H}), calc(640px * var(--vw-s, 1))); aspect-ratio: ${VB_W} / ${VB_H}; container-type: inline-size; }
.hw-door-moon { position: absolute; left: 45%; top: -14%; width: 54%; aspect-ratio: 1; border-radius: 50%;
  background: radial-gradient(circle at 38% 36%, #FFFBEA 0%, #FFF0C4 38%, #F4D98E 70%, #E6C373 100%);
  box-shadow: inset -10px -12px 0 rgba(214,170,90,.25), 0 0 60px 10px rgba(255,236,170,.28); }
.hw-door-moon::before, .hw-door-moon::after { content: ""; position: absolute; border-radius: 50%; background: rgba(214,170,90,.28); }
.hw-door-moon::before { left: 24%; top: 30%; width: 16%; height: 16%; }
.hw-door-moon::after { left: 56%; top: 58%; width: 11%; height: 11%; }
.hw-door-halo { position: absolute; left: 22%; top: -38%; width: 100%; aspect-ratio: 1; border-radius: 50%;
  background: radial-gradient(closest-side, rgba(255,236,170,.30), rgba(255,200,140,.10) 55%, transparent); animation: hw-halo 6s ease-in-out infinite alternate; }
@keyframes hw-halo { from { opacity: .7; transform: scale(.96) } to { opacity: 1; transform: scale(1.04) } }

.hw-glow { position: absolute; pointer-events: none; border-radius: 40%; opacity: 0; transition: opacity .6s ease;
  background: radial-gradient(closest-side, rgba(255,214,120,.62), rgba(255,160,70,.22) 55%, transparent); }
.hw-glow.is-round { border-radius: 50%; }
.hw-glow.is-on { opacity: 1; animation: hw-flicker 3.2s steps(1, end) infinite; }
.hw-glow.is-door { border-radius: 50% 50% 30% 30%; background: radial-gradient(closest-side, rgba(255,226,150,.7), rgba(255,170,80,.25) 60%, transparent); animation: none; }
@keyframes hw-flicker {
  0% { opacity: 1 } 7% { opacity: .78 } 9% { opacity: 1 } 31% { opacity: .9 } 33% { opacity: .58 } 35% { opacity: .96 }
  58% { opacity: 1 } 70% { opacity: .82 } 72% { opacity: 1 } 88% { opacity: .9 } 90% { opacity: .66 } 92% { opacity: 1 } }

.hw-orbit { position: absolute; pointer-events: none; }
.hw-obat { position: absolute; left: 50%; top: 50%; animation: hw-orbit 7s linear infinite; }
.hw-obat.b1 { animation-duration: 9s; animation-delay: -3s; animation-direction: reverse; }
.hw-obat.b2 { animation-duration: 8s; animation-delay: -5.5s; }
.hw-obat > span { display: block; animation: hw-flap2 .28s ease-in-out infinite alternate; transform-origin: 50% 40%; }
.hw-obat svg path { stroke: rgba(183,156,255,.55); stroke-width: 1.2px; }
@keyframes hw-orbit {
  0% { transform: translate(-50%, -50%) translate(-14cqw, 2cqw) scale(1) } 25% { transform: translate(-50%, -50%) translate(0, -5cqw) scale(.8) }
  50% { transform: translate(-50%, -50%) translate(14cqw, 1cqw) scale(1) } 75% { transform: translate(-50%, -50%) translate(0, 8cqw) scale(1.2) }
  100% { transform: translate(-50%, -50%) translate(-14cqw, 2cqw) scale(1) } }
@keyframes hw-flap2 { from { transform: scaleY(1) } to { transform: scaleY(.45) } }

.hw-gfog { position: absolute; left: -30%; width: 220%; pointer-events: none; z-index: 2; }
.hw-gfog.f1 { bottom: -3%; height: 22%; background: radial-gradient(30% 60% at 20% 70%, rgba(220,212,245,.34), transparent 70%), radial-gradient(28% 55% at 55% 75%, rgba(207,198,232,.28), transparent 70%), radial-gradient(30% 60% at 85% 70%, rgba(220,212,245,.3), transparent 70%); animation: hw-gfog 26s linear infinite alternate; }
.hw-gfog.f2 { bottom: 6%; height: 16%; opacity: .8; background: radial-gradient(26% 60% at 30% 60%, rgba(183,156,255,.24), transparent 70%), radial-gradient(24% 50% at 72% 60%, rgba(183,156,255,.2), transparent 70%); animation: hw-gfog 34s linear infinite alternate-reverse; }
@keyframes hw-gfog { from { transform: translateX(0) } to { transform: translateX(-30%) } }

.hw-door { position: absolute; inset: 0; padding: 0; z-index: 1; border: 3px solid #0E0A1C; border-radius: 50% 50% 4px 4px / 34% 34% 4px 4px;
  background: repeating-linear-gradient(90deg, #6A4690 0 11%, #563778 11% 14%); box-shadow: inset 0 -10px 18px rgba(0,0,0,.35);
  transform-origin: left center; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }

.hw-sign { position: absolute; right: 2%; bottom: 13%; max-width: 30%; padding: 4px 7px 5px; border-radius: 6px; z-index: 3;
  background: linear-gradient(180deg, #A8743E, #8A5A2B); border: 2px solid #5A3818; box-shadow: 0 6px 14px -6px rgba(0,0,0,.6); transform: rotate(5deg);
  font: 400 clamp(10.5px, 3.2cqw, 13px)/1.15 ${HW_DISPLAY}; color: #FFF6E6; text-align: center; overflow-wrap: anywhere; }

.hw-envelope { position: absolute; left: 50%; bottom: -2%; z-index: 4; margin-left: -29%; width: 58%; box-sizing: border-box; display: flex; align-items: baseline; justify-content: center; gap: 7px; flex-wrap: wrap;
  padding: 6px 16px 7px; border-radius: 10px; background: ${VW.paper}; color: ${VW.paperInk}; box-shadow: 0 14px 30px -12px rgba(0,0,0,.75), 0 0 0 1px rgba(255,210,122,.25); }

.hw-knock-dots { position: relative; display: inline-flex; gap: 5px; margin-left: 4px; }
.hw-knock-dots i { display: block; width: 9px; height: 9px; border-radius: 50%; background: rgba(58,22,6,.3); transition: background .3s, box-shadow .3s; }
.hw-knock-dots i.is-on { background: #FFF1B8; box-shadow: 0 0 8px #FFF1B8; }
.hw-door-note { position: fixed; z-index: 6; left: 0; right: 0; bottom: calc(env(safe-area-inset-bottom, 0px) + 34px); margin: 0; text-align: center; pointer-events: none;
  text-shadow: 0 1px 0 #2B1E3F, 0 0 12px rgba(23,18,43,.95); }
@media (min-width: 768px) { .hw-door-note { bottom: 46px; } }

@media (prefers-reduced-motion: reduce) {
  .hw-door-halo, .hw-glow.is-on, .hw-obat, .hw-obat > span, .hw-gfog, .hw-spider { animation: none !important; }
  .hw-obat { display: none; }
}
`;
