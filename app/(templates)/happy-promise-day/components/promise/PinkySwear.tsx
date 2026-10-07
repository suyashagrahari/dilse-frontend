"use client";

// The wow: two hand-drawn hands enter from the edges. Drag YOUR hand (left)
// toward theirs; within reach the pinkies snap, curl and hook, the hands give
// a little "promise shake", hearts pop. Fallback: "Tap to pinky swear".
//
// Everything is one SVG (viewBox 360×230). The left hand rides a motion value
// in viewBox units; pointer deltas are scaled by the SVG's rendered width.

import { useRef, useState } from "react";
import { animate, AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import { FONTS, VW } from "../../../_valentine/theme";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { Btn, Hint, P, Title, clamp, sfx } from "./ui";

const START = -82;
const LOCK = -12;
const SNAP = 30;
/** Both hands are drawn at this scale around the stage centre. */
const K = 0.84;

const PINKY = {
  open: "M108 136 C130 139 152 135 176 128 C184 126 190 122 193 116",
  openWiggle: "M108 136 C130 139 152 133 175 124 C183 121 188 116 190 109",
  hookDown: "M108 136 C130 139 150 133 168 126 C186 119 194 131 183 142",
  hookUp: "M108 136 C130 139 150 133 166 128 C184 122 190 108 179 101",
};

function Hand({ skin, sleeve, sleeveInk, cuff, pinky, wiggle, reduced }: { skin: string; sleeve: string; sleeveInk: string; cuff: string; pinky: string; wiggle?: boolean; reduced: boolean }) {
  return (
    <g>
      {/* sleeve */}
      <path d="M-700 60 L22 74 Q34 112 22 150 L-700 164 Z" fill={sleeve} stroke={sleeveInk} strokeWidth="3" strokeLinejoin="round" />
      <path d="M-40 92 l6 0 M-70 120 l6 0 M-100 98 l6 0 M-20 134 l6 0" stroke="#fff" strokeOpacity=".55" strokeWidth="5" strokeLinecap="round" />
      <path d="M12 74 Q26 112 12 152" fill="none" stroke={cuff} strokeWidth="13" strokeLinecap="round" />
      <path d="M12 74 Q26 112 12 152" fill="none" stroke={sleeveInk} strokeOpacity=".35" strokeWidth="1.5" />

      {/* pinky (drawn first so the fist overlaps its root) */}
      <motion.path
        d={pinky}
        initial={false}
        animate={wiggle && !reduced ? { d: [PINKY.open, PINKY.openWiggle, PINKY.open] } : { d: pinky }}
        transition={wiggle && !reduced ? { duration: 1.4, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.4 } : { type: "spring", stiffness: 300, damping: 20 }}
        fill="none"
        stroke={P.skinInk}
        strokeWidth="18"
        strokeLinecap="round"
      />
      <motion.path
        d={pinky}
        initial={false}
        animate={wiggle && !reduced ? { d: [PINKY.open, PINKY.openWiggle, PINKY.open] } : { d: pinky }}
        transition={wiggle && !reduced ? { duration: 1.4, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.4 } : { type: "spring", stiffness: 300, damping: 20 }}
        fill="none"
        stroke={skin}
        strokeWidth="12.5"
        strokeLinecap="round"
      />

      {/* fist */}
      <path d="M18 84 C40 66 98 62 116 80 C132 96 132 130 116 144 C100 156 40 154 18 140 Q8 112 18 84 Z" fill={skin} stroke={P.skinInk} strokeWidth="3" strokeLinejoin="round" />
      <path d="M30 140 C50 150 92 150 108 140" fill="none" stroke={P.skinShade} strokeWidth="5" strokeLinecap="round" opacity=".55" />
      {/* curled fingers */}
      {[
        [119, 92, 14, 10],
        [122, 111, 14, 10],
        [119, 129, 12.5, 9],
      ].map(([cx, cy, rx, ry], i) => (
        <g key={i}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={skin} stroke={P.skinInk} strokeWidth="2.6" />
          <path d={`M${cx + 4} ${cy - 5} q5 3 4 8`} fill="none" stroke="#fff" strokeOpacity=".45" strokeWidth="2" strokeLinecap="round" />
        </g>
      ))}
      {/* thumb over the top */}
      <path d="M32 88 C54 72 84 72 104 84" fill="none" stroke={P.skinInk} strokeWidth="19" strokeLinecap="round" />
      <path d="M32 88 C54 72 84 72 104 84" fill="none" stroke={skin} strokeWidth="13.5" strokeLinecap="round" />
      <ellipse cx="101" cy="81" rx="5" ry="3.6" fill="#FFE9DD" transform="rotate(28 101 81)" />
      {/* cheek blush on the back of the hand */}
      <ellipse cx="60" cy="118" rx="12" ry="6.5" fill="#F39C8A" opacity=".45" />
    </g>
  );
}

export default function PinkySwear({ prompt, me, them, sticker, onDone }: { prompt: string; me: string; them: string; sticker: React.ReactNode; onDone: () => void }) {
  const reduced = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const x = useMotionValue(START);
  const [hooked, setHooked] = useState(false);
  const [grabbed, setGrabbed] = useState(false);
  const [touched, setTouched] = useState(false);
  const drag = useRef<{ id: number; startX: number; startV: number } | null>(null);
  const near = useTransform(x, [START, LOCK - SNAP, LOCK], [0, 0.35, 1]);
  const targetOpacity = useTransform(near, (v) => 0.25 + v * 0.6);

  const hook = () => {
    if (hooked) return;
    setHooked(true);
    drag.current = null;
    setGrabbed(false);
    animate(x, LOCK, reduced ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 26 });
    haptic([18, 40, 30]);
    sfx.click(1.1);
    window.setTimeout(() => sfx.chime(), 160);
    const r = svgRef.current?.getBoundingClientRect();
    burst({
      kind: "hearts",
      count: 26,
      spread: 0.3,
      origin: r ? { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height * 0.55) / window.innerHeight } : { x: 0.5, y: 0.5 },
    });
  };

  const unitsPerPx = () => {
    const r = svgRef.current?.getBoundingClientRect();
    return r && r.width ? 360 / r.width / K : 1;
  };

  const onDown = (e: React.PointerEvent) => {
    if (hooked) return;
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    drag.current = { id: e.pointerId, startX: e.clientX, startV: x.get() };
    setGrabbed(true);
    setTouched(true);
    haptic(6);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId || hooked) return;
    const v = clamp(d.startV + (e.clientX - d.startX) * unitsPerPx(), START - 20, LOCK + 18);
    x.set(v);
    if (Math.abs(v - LOCK) < SNAP) hook();
  };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    setGrabbed(false);
    if (!hooked) animate(x, START, { duration: 0.22, ease: "easeOut" });
  };

  return (
    <>
      <Title>{prompt}</Title>
      <p style={{ margin: "-6px 0 0", maxWidth: 330, font: `400 15px/1.45 ${FONTS.ui}`, color: VW.inkSoft }}>
        Slide your hand across and hook your pinky with {them}&rsquo;s. Rules are rules 🤞
      </p>

      <div style={{ position: "relative", width: "min(100%, 440px)", marginTop: 6 }}>
        <div style={{ position: "absolute", left: "50%", top: -34, transform: "translateX(-50%)", zIndex: 3, pointerEvents: "none" }}>
          <AnimatePresence>
            {hooked && (
              <motion.div initial={{ scale: 0, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.25 }}>
                {sticker}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <motion.svg
          ref={svgRef}
          viewBox="0 0 360 230"
          width="100%"
          style={{ display: "block", overflow: "visible", touchAction: "none", userSelect: "none", aspectRatio: "360 / 230" }}
          animate={hooked && !reduced ? { y: [0, -8, 0, -6, 0, -3, 0] } : { y: 0 }}
          transition={{ duration: 1.1, delay: 0.25, ease: "easeInOut" }}
          aria-hidden
        >
          {/* the meeting point */}
          {!hooked && (
            <motion.g style={{ opacity: targetOpacity }}>
              <circle cx="180" cy="128" r="22" fill="none" stroke={P.rose} strokeWidth="2" strokeDasharray="4 5" />
              {!reduced && (
                <motion.circle cx="180" cy="128" r="22" fill="none" stroke={P.rose} strokeWidth="2" animate={{ scale: [1, 1.6], opacity: [0.6, 0] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ originX: "180px", originY: "128px" }} />
              )}
            </motion.g>
          )}

          <g transform={`translate(180 120) scale(${K}) translate(-180 -120)`}>
          {/* THEIR hand (right, mirrored), waiting with a wiggling pinky */}
          <g transform="translate(360 0) scale(-1 1)">
            <g transform="translate(0 6)">
              <Hand skin="#EDB48E" sleeve={P.berry} sleeveInk={P.berryDeep} cuff="#F3D58C" pinky={hooked ? PINKY.hookUp : PINKY.open} wiggle={!hooked} reduced={reduced} />
            </g>
          </g>

          {/* YOUR hand (left), draggable */}
          <motion.g style={{ x, cursor: hooked ? "default" : grabbed ? "grabbing" : "grab" }} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
            <motion.g animate={grabbed ? { scale: 1.04 } : { scale: 1 }} style={{ originX: "60px", originY: "112px" }} transition={{ type: "spring", stiffness: 400, damping: 18 }}>
              {/* generous invisible hit area */}
              <rect x="-150" y="40" width="360" height="150" fill="transparent" />
              <Hand skin={P.skin} sleeve={P.petal} sleeveInk="#C9708F" cuff="#FFFFFF" pinky={hooked ? PINKY.hookDown : PINKY.open} reduced={reduced} />
            </motion.g>
          </motion.g>

          </g>
          {/* the joint heart */}
          <AnimatePresence>
            {hooked && (
              <motion.g initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 420, damping: 12, delay: 0.12 }} style={{ originX: "178px", originY: "86px" }}>
                <path d="M178 100 C160 88 158 74 167 70 C173 67.5 178 72 178 76 C178 72 183 67.5 189 70 C198 74 196 88 178 100 Z" fill={P.rose} stroke="#fff" strokeWidth="3" />
              </motion.g>
            )}
          </AnimatePresence>

          {/* name tags */}
          <g style={{ font: `600 12px ${FONTS.ui}` }}>
            <text x="44" y="214" textAnchor="middle" fill={VW.inkSoft as string}>
              you
            </text>
            <text x="316" y="214" textAnchor="middle" fill={VW.inkSoft as string}>
              {them.length > 14 ? `${them.slice(0, 13)}…` : them}
            </text>
          </g>
        </motion.svg>

        {!touched && !hooked && !reduced && (
          <motion.div
            aria-hidden
            initial={{ x: 0, opacity: 0 }}
            animate={{ x: [0, 70, 70], opacity: [0, 1, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 0.5, times: [0, 0.7, 1] }}
            style={{ position: "absolute", left: "16%", top: "54%", fontSize: 30, pointerEvents: "none" }}
          >
            👆
          </motion.div>
        )}
      </div>

      <div style={{ minHeight: 112, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <AnimatePresence mode="wait">
          {!hooked ? (
            <motion.div key="ask" exit={{ opacity: 0 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <Hint>Drag your hand → to hook pinkies</Hint>
              <button type="button" onClick={hook} style={{ minHeight: 44, padding: "8px 16px", border: 0, background: "transparent", color: VW.accentDeep, font: `600 14px ${FONTS.ui}`, textDecoration: "underline", textUnderlineOffset: 4, cursor: "pointer" }}>
                Tap to pinky swear instead
              </button>
            </motion.div>
          ) : (
            <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <p style={{ margin: 0, font: `700 22px ${FONTS.ui}`, color: VW.accentDeep }}>Vaada pakka! 🤞</p>
              <Btn onClick={onDone}>Open the promise jar →</Btn>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <span className="vw-sr" aria-live="polite">
        {hooked ? `Pinkies hooked with ${them}. ${me}, it's a promise.` : ""}
      </span>
    </>
  );
}
