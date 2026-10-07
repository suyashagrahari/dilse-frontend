"use client";

// The wow: two chubby characters at either edge, arms open, wobbling.
// Pinch inward with two fingers — or drag one into the other with one —
// and the gap between them tracks your fingers 1:1; the closer they get the
// more they squash (squish = 1 − gap/contact). At contact the hug LOCKS:
// arms wrap, eyes go ^^, cheeks blush, hearts puff, they sway together.
// Let go early → they spring apart in 200 ms. No hold, no timer, no meter.

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FONTS, VW } from "../../../_valentine/theme";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { HeartPuffs, NameTag, Pair, type Species } from "./Characters";
import { Btn, Hint, Title, clamp, sfx } from "./ui";

const START_GAP = 200;
const LOCK_GAP = 106;
const HUG_GAP = 74;
const MIN_GAP = 60;

export default function FirstSquish({ prompt, species, tagMe, tagYou, sticker, onDone }: { prompt: string; species: [Species, Species]; tagMe: string; tagYou: string; sticker: React.ReactNode; onDone: () => void }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  // centre-offset of the pair (one-finger drags move one side only)
  const [pos, setPos] = useState({ l: 180 - START_GAP / 2, r: 180 + START_GAP / 2 });
  const [hugged, setHugged] = useState(false);
  const [active, setActive] = useState(false);
  const [touched, setTouched] = useState(false);
  const pts = useRef(new Map<number, { x: number; y: number }>());
  const start = useRef<{ l: number; r: number; d?: number; x?: number; side?: "l" | "r" } | null>(null);
  const anim = useRef<number | null>(null);

  const gap = pos.r - pos.l;
  const squish = hugged ? 0.35 : clamp((START_GAP - gap) / (START_GAP - LOCK_GAP), 0, 1);

  const unit = () => {
    const r = ref.current?.getBoundingClientRect();
    return r && r.width ? 360 / r.width : 1;
  };

  const tween = (to: { l: number; r: number }, ms: number, done?: () => void) => {
    if (anim.current) cancelAnimationFrame(anim.current);
    const from = { ...pos };
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      setPos({ l: from.l + (to.l - from.l) * e, r: from.r + (to.r - from.r) * e });
      if (k < 1) anim.current = requestAnimationFrame(step);
      else done?.();
    };
    anim.current = requestAnimationFrame(step);
  };

  const lock = () => {
    if (hugged) return;
    setHugged(true);
    setActive(false);
    pts.current.clear();
    start.current = null;
    const mid = (pos.l + pos.r) / 2;
    const c = clamp(mid, 140, 220);
    tween({ l: c - HUG_GAP / 2, r: c + HUG_GAP / 2 }, reduced ? 1 : 260, () => tween({ l: 180 - HUG_GAP / 2, r: 180 + HUG_GAP / 2 }, reduced ? 1 : 400));
    haptic([40, 30, 80]);
    sfx.squish();
    window.setTimeout(() => sfx.chime(), 200);
    const r = ref.current?.getBoundingClientRect();
    burst({ kind: "hearts", count: 28, spread: 0.32, origin: r ? { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height * 0.45) / window.innerHeight } : undefined });
  };

  const setGap = (l: number, r: number) => {
    const g = r - l;
    if (g <= LOCK_GAP) {
      setPos({ l, r });
      lock();
      return;
    }
    setPos({ l, r });
  };

  const down = (e: React.PointerEvent) => {
    if (hugged) return;
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    if (anim.current) cancelAnimationFrame(anim.current);
    pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setActive(true);
    setTouched(true);
    const all = [...pts.current.values()];
    if (all.length >= 2) {
      start.current = { l: pos.l, r: pos.r, d: Math.abs(all[0].x - all[1].x) || 1 };
    } else {
      const rect = ref.current!.getBoundingClientRect();
      const ux = ((e.clientX - rect.left) / rect.width) * 360;
      start.current = { l: pos.l, r: pos.r, x: e.clientX, side: ux < (pos.l + pos.r) / 2 ? "l" : "r" };
    }
    haptic(6);
  };
  const move = (e: React.PointerEvent) => {
    if (hugged || !pts.current.has(e.pointerId)) return;
    pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const s = start.current;
    if (!s) return;
    const all = [...pts.current.values()];
    if (all.length >= 2 && s.d) {
      const d = Math.abs(all[0].x - all[1].x);
      const g = clamp(((s.r - s.l) * d) / s.d, MIN_GAP, START_GAP + 20);
      const mid = (s.l + s.r) / 2;
      setGap(mid - g / 2, mid + g / 2);
    } else if (s.x != null) {
      const dx = (e.clientX - s.x) * unit();
      if (s.side === "l") setGap(clamp(s.l + dx, 40, s.r - MIN_GAP), s.r);
      else setGap(s.l, clamp(s.r + dx, s.l + MIN_GAP, 320));
    }
  };
  const up = (e: React.PointerEvent) => {
    pts.current.delete(e.pointerId);
    if (hugged) return;
    if (pts.current.size === 0) {
      // forgiving: nearly touching counts — they "snap" into the hug
      if (pos.r - pos.l <= LOCK_GAP + 34) {
        lock();
        return;
      }
      setActive(false);
      start.current = null;
      tween({ l: 180 - START_GAP / 2, r: 180 + START_GAP / 2 }, 200);
    } else {
      // one finger left: restart as a one-finger drag from here
      const [id, p] = [...pts.current.entries()][0];
      void id;
      const rect = ref.current!.getBoundingClientRect();
      const ux = ((p.x - rect.left) / rect.width) * 360;
      start.current = { l: pos.l, r: pos.r, x: p.x, side: ux < (pos.l + pos.r) / 2 ? "l" : "r" };
    }
  };

  const wob = !hugged && !active && !reduced;

  return (
    <>
      <Title>{prompt}</Title>
      <p style={{ margin: "-6px 0 0", maxWidth: 320, font: `400 15px/1.45 ${FONTS.ui}`, color: VW.inkSoft }}>Pinch them together with two fingers — or drag one into the other.</p>

      <div style={{ position: "relative", width: "min(100%, calc(420px * var(--vw-s, 1)))" }}>
        <div style={{ position: "absolute", left: "50%", top: -40, transform: "translateX(-50%)", zIndex: 0, pointerEvents: "none" }}>
          <AnimatePresence>
            {hugged && (
              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 280, damping: 14, delay: 0.3 }}>
                {sticker}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div
          ref={ref}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          style={{ position: "relative", zIndex: 1, touchAction: "none", userSelect: "none", cursor: hugged ? "default" : active ? "grabbing" : "grab" }}
        >
          <svg viewBox="0 0 360 270" width="100%" style={{ display: "block", overflow: "visible", aspectRatio: "360 / 270" }} aria-hidden>
            {/* café floor + rug */}
            <ellipse cx="180" cy="236" rx="170" ry="22" fill="#FFD9C4" />
            <ellipse cx="180" cy="236" rx="150" ry="16" fill="none" stroke="#FFB59A" strokeWidth="3" strokeDasharray="2 6" strokeLinecap="round" />
            {/* the gap meter of love: little arrows */}
            {!hugged && (
              <g opacity={0.5 - squish * 0.4}>
                <path d="M150 120 l-10 -8 M150 120 l-10 8 M210 120 l10 -8 M210 120 l10 8" stroke="#FF8FAB" strokeWidth="3" strokeLinecap="round" transform="scale(-1 1) translate(-360 0)" />
              </g>
            )}
            <motion.g
              animate={hugged && !reduced ? { rotate: [-3, 3, -3] } : { rotate: 0 }}
              transition={hugged ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
              style={{ originX: "180px", originY: "230px" }}
            >
              <motion.g animate={wob ? { y: [0, -4, 0] } : { y: 0 }} transition={{ duration: 1.1, repeat: wob ? Infinity : 0, ease: "easeInOut" }}>
                <Pair
                  species={species}
                  lx={pos.l}
                  rx={pos.r}
                  ground={226}
                  left={{ squish, hugging: hugged, reach: 62, happy: squish > 0.6 }}
                  right={{ squish, hugging: hugged, reach: 62, happy: squish > 0.6 }}
                  leftRot={hugged ? 4 : wob ? -2 : 0}
                  rightRot={hugged ? 4 : wob ? -2 : 0}
                />
              </motion.g>
            </motion.g>
            <HeartPuffs x={180} y={70} on={hugged && !reduced} />
            <NameTag text={tagMe} x={hugged ? 140 : pos.l} y={244} />
            <NameTag text={tagYou} x={hugged ? 220 : pos.r} y={244} color="#FFD3DE" />
          </svg>
        </div>
        {!touched && !hugged && !reduced && (
          <>
            <motion.span aria-hidden animate={{ x: [0, 40, 40], opacity: [0, 1, 0] }} transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 0.4 }} style={{ position: "absolute", left: "16%", top: "46%", fontSize: 28, pointerEvents: "none", zIndex: 2 }}>
              👆
            </motion.span>
            <motion.span aria-hidden animate={{ x: [0, -40, -40], opacity: [0, 1, 0] }} transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 0.4 }} style={{ position: "absolute", right: "16%", top: "46%", fontSize: 28, pointerEvents: "none", zIndex: 2 }}>
              👆
            </motion.span>
          </>
        )}
      </div>

      <div style={{ minHeight: 112, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <AnimatePresence mode="wait">
          {!hugged ? (
            <motion.div key="ask" exit={{ opacity: 0 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <Hint>{active ? (squish > 0.5 ? "Almost… thoda aur 🥺" : "Closer…") : "Pinch or drag them together 🫶"}</Hint>
              <button type="button" onClick={lock} style={{ minHeight: 44, padding: "8px 16px", border: 0, background: "transparent", color: VW.accentDeep, font: `600 14px ${FONTS.ui}`, textDecoration: "underline", textUnderlineOffset: 4, cursor: "pointer" }}>
                Tap to hug instead
              </button>
            </motion.div>
          ) : (
            <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduced ? 0 : 0.6 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <p style={{ margin: 0, font: `700 22px ${FONTS.ui}`, color: VW.accentDeep }}>Jaadu ki jhappi! 🤗</p>
              <Btn onClick={onDone}>See the Hug Menu →</Btn>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <span className="vw-sr" aria-live="polite">{hugged ? "They're hugging." : ""}</span>
    </>
  );
}
