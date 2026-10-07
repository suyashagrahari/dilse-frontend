"use client";

// ─── The signature: tap anywhere to stamp a kiss, it flies into the heart jar ─
//
// Each tap stamps the day's kiss at the finger (bouncy spring, random tilt and
// size), then the mark curves down into the glass jar where it lands on the
// pile. A counter climbs to the sender's target; the sender's notes pop at
// their kiss numbers ("Kiss #7 — …" lands on the 7th, unnumbered ones spread
// out). Every 5th kiss wobbles the jar. At the target the jar overflows and
// `onFull` fires. Keyboard / no-touch fallback: the "Send a kiss" button.
// Reduced motion: marks drop straight into the jar, no flight.

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
// (The flight layer is portalled to <body>: the step's own enter transform would
// otherwise turn position:fixed into position:absolute.)
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { burst, haptic, useReducedMotion } from "../../_valentine/kit";
import { FONTS, VW } from "../../_valentine/theme";
import { HeartJar, KissStamp, jarSlots, kissPalette, type KissStyle, type ShadeId } from "./kissArt";

interface Flyer {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  rot: number;
  s: number;
}

/** kiss number → note. "Kiss #7 — …" goes to 7; the rest spread evenly over the free numbers. */
export function noteSchedule(notes: readonly string[], target: number): Map<number, string> {
  const out = new Map<number, string>();
  const loose: string[] = [];
  for (const raw of notes) {
    const t = (raw ?? "").trim();
    if (!t) continue;
    const m = t.match(/#\s*(\d{1,2})/);
    const n = m ? Math.min(target, Math.max(1, Number(m[1]))) : 0;
    if (n && !out.has(n)) out.set(n, t);
    else loose.push(t);
  }
  loose.forEach((t, i) => {
    let n = Math.max(1, Math.round(((i + 1) * target) / (loose.length + 1)));
    while (out.has(n) && n < target) n++;
    while (out.has(n) && n > 1) n--;
    if (!out.has(n)) out.set(n, t);
  });
  return out;
}

export default function KissJarGame({
  kind,
  shade,
  target,
  notes,
  sticker,
  bottomPad,
  onFull,
}: {
  kind: KissStyle;
  shade: ShadeId;
  target: number;
  notes: readonly string[];
  sticker: ReactNode;
  bottomPad: number;
  onFull: (count: number) => void;
}) {
  const reduced = useReducedMotion();
  const slots = useMemo(() => jarSlots(target), [target]);
  const schedule = useMemo(() => noteSchedule(notes, target), [notes, target]);
  const pal = kissPalette(kind, shade);
  const [given, setGiven] = useState(0);
  const [inJar, setInJar] = useState(0);
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const [note, setNote] = useState<{ n: number; text: string } | null>(null);
  const [wobble, setWobble] = useState(0);
  const [overflow, setOverflow] = useState(false);
  const [mounted, setMounted] = useState(false);
  const jarRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const givenRef = useRef(0);
  const doneRef = useRef(false);

  useEffect(() => setMounted(true), []);

  const stamp = useCallback(
    (x: number, y: number) => {
      if (givenRef.current >= target) return;
      const n = givenRef.current + 1;
      givenRef.current = n;
      setGiven(n);
      haptic(8);
      const txt = schedule.get(n);
      if (txt) setNote({ n, text: txt });
      const r = jarRef.current?.getBoundingClientRect();
      if (reduced || !r) {
        setInJar((c) => c + 1);
        return;
      }
      const tx = r.left + r.width / 2 + (Math.random() - 0.5) * r.width * 0.3;
      const ty = r.top + r.height * 0.32;
      setFlyers((f) => [...f, { id: ++idRef.current, x, y, dx: tx - x, dy: ty - y, rot: (Math.random() - 0.5) * 50, s: 0.8 + Math.random() * 0.4 }]);
    },
    [reduced, schedule, target],
  );

  const land = (id: number) => {
    setFlyers((f) => f.filter((q) => q.id !== id));
    setInJar((c) => c + 1);
  };

  useEffect(() => {
    if (inJar && inJar % 5 === 0 && inJar < target) setWobble((w) => w + 1);
  }, [inJar, target]);

  // Full jar → overflow → hand over to the MWAH.
  useEffect(() => {
    if (inJar < target || doneRef.current) return;
    doneRef.current = true;
    setOverflow(true);
    haptic([20, 60, 30]);
    const r = jarRef.current?.getBoundingClientRect();
    const origin = r ? { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height * 0.15) / window.innerHeight } : { x: 0.5, y: 0.7 };
    burst({ kind: "hearts", origin, emojis: kind === "lipstick" ? ["💋", "💗", "💖"] : ["💗", "💖", "😚", "💕"], count: 34, spread: 0.5 });
    const t = window.setTimeout(() => onFull(target), reduced ? 500 : 1500);
    return () => window.clearTimeout(t);
  }, [inJar, target, kind, onFull, reduced]);

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button, a")) return;
    stamp(e.clientX, e.clientY);
  };

  const left = Math.max(0, target - given);

  return (
    <div
      onPointerDown={onPointerDown}
      style={{ position: "relative", minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", padding: `64px 18px ${bottomPad}px`, touchAction: "manipulation", userSelect: "none", WebkitUserSelect: "none", cursor: "pointer" }}
    >
      <p style={{ margin: 0, font: `600 12px ${FONTS.ui}`, letterSpacing: ".2em", textTransform: "uppercase", color: VW.inkSoft }}>The kiss jar</p>
      <h2 style={{ margin: "6px 0 0", font: `700 clamp(26px, 7.4vw, 34px)/1.1 ${FONTS.serif}`, color: VW.ink, textAlign: "center" }}>
        {overflow ? "It's overflowing!" : given === 0 ? "Tap anywhere to leave a kiss" : left === 1 ? "One more…" : "Keep going 💗"}
      </h2>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
        <motion.div
          key={given}
          initial={reduced ? false : { scale: 1.35 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 14 }}
          aria-live="polite"
          style={{ padding: "8px 16px", borderRadius: 999, background: "rgba(255,255,255,.78)", border: `1.5px solid ${VW.edge}`, boxShadow: "0 8px 22px -14px rgba(157,23,77,.6)", font: `700 18px ${FONTS.ui}`, color: VW.accentDeep, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}
        >
          {Math.min(given, target)} <span style={{ opacity: 0.5 }}>/ {target}</span> <span style={{ fontWeight: 500, fontSize: 14 }}>kisses</span>
        </motion.div>
        <div style={{ width: 64, height: 64 }}>{sticker}</div>
      </div>

      {/* the milestone note */}
      <div style={{ minHeight: 96, width: "min(100%, 360px)", display: "grid", placeItems: "center", marginTop: 8 }}>
        <AnimatePresence mode="wait">
          {note && (
            <motion.div
              key={note.n}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14, rotate: -4, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, rotate: -1.5, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 320, damping: 20 }}
              style={{ position: "relative", padding: "12px 16px 12px 18px", borderRadius: 14, background: "#FFF8F1", boxShadow: "0 14px 30px -18px rgba(59,10,30,.55)", border: `1px solid ${VW.edge}`, font: `500 16px/1.4 ${FONTS.serif}`, color: VW.paperInk, textAlign: "left" }}
            >
              <span style={{ position: "absolute", top: -12, left: 14, padding: "2px 9px", borderRadius: 99, background: pal.hex, color: "#fff", font: `700 11px ${FONTS.ui}`, letterSpacing: ".08em" }}>KISS #{note.n}</span>
              {note.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* tap hint ripple */}
      {given === 0 && !reduced && (
        <div aria-hidden style={{ position: "relative", width: 90, height: 90, marginTop: 4, pointerEvents: "none" }}>
          <motion.span
            animate={{ scale: [0.6, 1.4], opacity: [0.55, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
            style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `3px solid ${pal.hex}` }}
          />
          <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 34 }}>👆</span>
        </div>
      )}

      <div style={{ flex: 1 }} />

      {/* the jar */}
      <motion.div
        ref={jarRef}
        animate={
          reduced
            ? undefined
            : overflow
              ? { scale: [1, 1.1, 0.94, 1.06, 1], rotate: [0, -6, 6, -3, 0] }
              : { rotate: wobble ? [0, -5, 5, -2.5, 0] : 0 }
        }
        key={overflow ? "full" : `w${wobble}`}
        transition={{ duration: overflow ? 0.9 : 0.6, ease: "easeInOut" }}
        style={{ width: "min(58vw, 232px)", aspectRatio: "200 / 226", transformOrigin: "50% 90%", position: "relative" }}
      >
        <HeartJar slots={slots} count={Math.min(inJar, slots.length)} kind={kind} shade={shade} fill={inJar / target} glow={overflow} />
        {overflow &&
          !reduced &&
          Array.from({ length: 7 }, (_, i) => (
            <motion.span
              key={i}
              aria-hidden
              initial={{ x: "-50%", y: 0, opacity: 0, scale: 0.3 }}
              animate={{ x: `calc(-50% + ${(i - 3) * 34}px)`, y: -80 - (i % 3) * 36, opacity: [0, 1, 1, 0], scale: 1, rotate: (i - 3) * 14 }}
              transition={{ duration: 1.3, delay: i * 0.05, ease: "easeOut" }}
              style={{ position: "absolute", left: "50%", top: "4%" }}
            >
              <KissStamp kind={kind} shade={shade} size={38} face={false} />
            </motion.span>
          ))}
      </motion.div>

      <button
        type="button"
        onClick={() => {
          const r = jarRef.current?.getBoundingClientRect();
          stamp(window.innerWidth / 2 + (Math.random() - 0.5) * 120, r ? r.top - 120 - Math.random() * 80 : window.innerHeight / 2);
        }}
        disabled={given >= target}
        style={{ marginTop: 14, minHeight: 46, padding: "10px 22px", borderRadius: 999, border: 0, background: VW.accent, color: VW.accentInk, font: `700 15px ${FONTS.ui}`, boxShadow: `0 4px 0 ${VW.accentDeep}`, cursor: "pointer", opacity: given >= target ? 0.5 : 1 }}
      >
        {kind === "lipstick" ? "💋" : "😚"} Send a kiss
      </button>

      {mounted &&
        createPortal(
          <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 300, overflow: "hidden" }}>
            {flyers.map((f) => (
              <div key={f.id} style={{ position: "absolute", left: f.x, top: f.y }}>
                <span style={{ position: "absolute", left: 0, top: 0, transform: "translate(-50%,-50%)" }}>
                  <motion.span
                    initial={{ opacity: 0, y: -4, scale: 0.6 }}
                    animate={{ opacity: [0, 1, 0], y: -46, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    style={{ position: "absolute", left: "50%", top: -14, transform: "translateX(-50%)", font: `700 15px ${FONTS.script}`, color: pal.deep, whiteSpace: "nowrap" }}
                  >
                    mwah
                  </motion.span>
                </span>
                <motion.div
                  initial={{ x: 0, y: 0, scale: 0, rotate: f.rot }}
                  animate={{
                    x: [0, 0, 0, f.dx * 0.35 + (f.dx > 0 ? -40 : 40), f.dx],
                    y: [0, 0, 0, f.dy * 0.2 - 70, f.dy],
                    scale: [0, 1.3 * f.s, f.s, f.s * 0.8, 0.32],
                    rotate: [f.rot, f.rot, f.rot, f.rot + 30, f.rot + 60],
                  }}
                  transition={{ duration: 1.05, times: [0, 0.12, 0.34, 0.68, 1], ease: "easeInOut" }}
                  onAnimationComplete={() => land(f.id)}
                  style={{ position: "absolute", left: 0, top: 0 }}
                >
                  <span style={{ display: "block", transform: "translate(-50%,-50%)", filter: "drop-shadow(0 6px 8px rgba(157,23,77,.25))" }}>
                    <KissStamp kind={kind} shade={shade} size={78} />
                  </span>
                </motion.div>
              </div>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
