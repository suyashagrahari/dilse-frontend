"use client";

// Room 6 — The Potion of Us. Mini-game B, drag-to-brew.
// The sender's 3–5 ingredients stand on a shelf as little bottles. Drag one
// into the bubbling cauldron (or just tap it) and it pours: its line rises in
// a bubble, the brew changes colour and sparks pop. With everything in, hold
// to stir (the kit's useHoldProgress — it springs back if you let go early;
// five quick taps work too), then a poof of smoke reveals the potion's spell
// on a scroll. "Brew it for me" does the lot.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { burst, haptic, useHoldProgress, useReducedMotion } from "../../../_valentine/kit";
import { FONTS, VW } from "../../../_valentine/theme";
import { Bottle, Cauldron } from "./art";
import { HW_DISPLAY } from "./fonts";
import { Btn, Hint, HW, RoomTitle, SkipChip } from "./ui";

export interface Ingredient {
  name: string;
  line: string;
}

const BOTTLE_COLORS = ["#B79CFF", "#9BE7C4", "#FF9EC4", "#FFD27A", "#7FC8FF"];
const BREW = ["#4A3A7A", "#6E4AA8", "#3FA48A", "#D05E95", "#E8963D", "#FF7FA8"];

const CSS = `
.hw-bub { animation: hw-bub 1.8s ease-in infinite; transform-box: fill-box; transform-origin: center; }
.hw-bub2 { animation-delay: .6s; }
.hw-bub3 { animation-delay: 1.1s; }
@keyframes hw-bub { 0% { transform: translateY(0) scale(.6); opacity: 0 } 30% { opacity: .7 } 100% { transform: translateY(-26px) scale(1.1); opacity: 0 } }
.hw-fire { animation: hw-fire .9s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: 50% 100%; }
@keyframes hw-fire { from { transform: scaleY(.9) } to { transform: scaleY(1.08) } }
@media (prefers-reduced-motion: reduce) { .hw-bub, .hw-fire { animation: none; } }
`;

export default function Potion({ ingredients, spell, sticker, onNext }: { ingredients: Ingredient[]; spell: string; sticker: ReactNode; onNext: () => void }) {
  const reduced = useReducedMotion();
  const potRef = useRef<HTMLDivElement | null>(null);
  const dragged = useRef(false);
  const [poured, setPoured] = useState<number[]>([]);
  const [bubble, setBubble] = useState<number | null>(null);
  const [brewed, setBrewed] = useState(false);
  const all = poured.length >= ingredients.length;
  const color = BREW[Math.min(BREW.length - 1, poured.length + (brewed ? 1 : 0))];

  const stir = useHoldProgress({
    duration: 2200,
    disabled: !all || brewed,
    onComplete: () => {
      setBrewed(true);
      haptic([20, 60, 30]);
      burst({ kind: "sparkles", emojis: ["✨", "💜", "🧡", "⭐"], origin: { x: 0.5, y: 0.55 }, count: 30 });
    },
  });

  const pour = (i: number) => {
    if (poured.includes(i)) return;
    haptic(14);
    setPoured((p) => (p.includes(i) ? p : [...p, i]));
    setBubble(i);
    const r = potRef.current?.getBoundingClientRect();
    if (r) burst({ kind: "sparkles", emojis: ["✨", "🫧", "✨"], origin: { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height * 0.3) / window.innerHeight }, count: 12, spread: 0.2 });
  };

  useEffect(() => {
    if (bubble == null) return;
    const t = window.setTimeout(() => setBubble((b) => (b === bubble ? null : b)), 3200);
    return () => window.clearTimeout(t);
  }, [bubble]);

  const brewForMe = () => {
    ingredients.forEach((_, i) => window.setTimeout(() => pour(i), reduced ? 0 : i * 280));
    window.setTimeout(() => {
      setBrewed(true);
      burst({ kind: "sparkles", emojis: ["✨", "💜", "🧡", "⭐"], origin: { x: 0.5, y: 0.55 }, count: 30 });
    }, reduced ? 50 : ingredients.length * 280 + 500);
  };

  const inPot = (x: number, y: number) => {
    const r = potRef.current?.getBoundingClientRect();
    return !!r && x >= r.left - 20 && x <= r.right + 20 && y >= r.top - 40 && y <= r.bottom;
  };

  return (
    <>
      <style>{CSS}</style>
      <RoomTitle
        kicker="Room 6 · the potion room"
        title="The potion of us"
        sub={!all ? "Drag each bottle into the cauldron (or tap it) to brew us a potion." : !brewed ? "Everything's in. Now stir it." : "It worked. Read the spell 👇"}
      />

      {/* the shelf of bottles */}
      {!brewed && (
        <div role="group" aria-label="Potion ingredients" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, width: "100%", maxWidth: "calc(440px * var(--vw-s, 1))", padding: "10px 6px 12px", borderRadius: 14, background: "linear-gradient(180deg, rgba(138,90,43,.0), rgba(138,90,43,.0) 82%, #6E4420 82%, #8A5A2B 100%)" }}>
          {ingredients.map((ing, i) => {
            const done = poured.includes(i);
            return (
              <motion.button
                key={i}
                type="button"
                drag={!done && !reduced}
                dragSnapToOrigin
                dragElastic={0.6}
                whileDrag={{ scale: 1.12, rotate: -18, zIndex: 30 }}
                onDragStart={() => {
                  dragged.current = true;
                }}
                onDragEnd={(e) => {
                  const t = (e as TouchEvent).changedTouches?.[0];
                  const pe = e as PointerEvent;
                  if (inPot(t ? t.clientX : pe.clientX, t ? t.clientY : pe.clientY)) pour(i);
                  window.setTimeout(() => {
                    dragged.current = false;
                  }, 50);
                }}
                onClick={() => {
                  if (!dragged.current) pour(i);
                }}
                disabled={done}
                aria-label={done ? `${ing.name} — in the potion` : `Pour in: ${ing.name}`}
                animate={done ? { opacity: 0.28, y: 0, scale: 0.9 } : { opacity: 1 }}
                style={{ display: "grid", justifyItems: "center", gap: 4, width: 78, padding: "4px 2px", border: 0, background: "transparent", color: VW.ink, cursor: done ? "default" : "grab", touchAction: "none", position: "relative" }}
              >
                <Bottle color={BOTTLE_COLORS[i % BOTTLE_COLORS.length]} size={46} shape={i} />
                <span style={{ font: `600 11.5px/1.2 ${FONTS.ui}`, padding: "3px 6px", borderRadius: 6, background: HW.paper, color: HW.paperInk, maxWidth: 78, overflowWrap: "anywhere", boxShadow: "0 2px 4px rgba(0,0,0,.3)" }}>{ing.name}</span>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* the cauldron */}
      <div ref={potRef} style={{ position: "relative", display: "grid", justifyItems: "center", marginTop: 4 }}>
        <AnimatePresence>
          {bubble != null && ingredients[bubble] && !brewed && (
            <motion.div
              key={bubble}
              initial={{ opacity: 0, y: 30, scale: 0.6 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 220, damping: 16 }}
              role="status"
              style={{ position: "absolute", bottom: "78%", left: "50%", marginLeft: -130, width: 260, padding: "10px 14px", borderRadius: 22, background: "rgba(247,243,255,.95)", color: HW.paperInk, boxShadow: "0 10px 24px -10px rgba(0,0,0,.6)", zIndex: 5 }}
            >
              <b style={{ display: "block", font: `400 17px ${HW_DISPLAY}`, color: HW.pumpkinDeep }}>{ingredients[bubble].name}</b>
              <span style={{ font: `500 14px/1.35 ${FONTS.ui}` }}>{ingredients[bubble].line}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div animate={stir.holding && !reduced ? { rotate: [-1.5, 1.5, -1.5] } : { rotate: 0 }} transition={{ duration: 0.4, repeat: stir.holding ? Infinity : 0 }}>
          <Cauldron color={color} size={210} stirring={brewed ? 0 : stir.progress} />
        </motion.div>
        <span style={{ position: "absolute", right: -26, top: 6 }}>{sticker}</span>
      </div>

      {/* poured so far */}
      {poured.length > 0 && !brewed && (
        <p aria-live="polite" style={{ margin: 0, font: `400 18px ${HW_DISPLAY}`, color: HW.candle }}>
          {poured.length} of {ingredients.length} in the brew
        </p>
      )}

      {!all && !brewed && (
        <>
          <Hint>{reduced ? "Tap a bottle to pour it in" : "Drag a bottle into the cauldron 🧪"}</Hint>
          <SkipChip onClick={brewForMe}>Brew it for me</SkipChip>
        </>
      )}

      {all && !brewed && (
        <div style={{ display: "grid", gap: 8, justifyItems: "center" }}>
          <button
            type="button"
            {...stir.bind}
            aria-label="Hold to stir the potion"
            style={{
              ...stir.bind.style,
              position: "relative",
              minHeight: 58,
              minWidth: 220,
              padding: "14px 26px",
              borderRadius: 18,
              border: 0,
              overflow: "hidden",
              background: HW.plum,
              color: HW.ghost,
              font: `700 17px ${FONTS.ui}`,
              boxShadow: `0 5px 0 #1B1330, 0 0 0 2px ${HW.lavender}`,
              cursor: "pointer",
            }}
          >
            <span aria-hidden style={{ position: "absolute", inset: 0, width: `${Math.round(stir.progress * 100)}%`, background: "linear-gradient(90deg, #B79CFF, #FF9EC4)", opacity: 0.55, transition: stir.holding ? "none" : "width .3s" }} />
            <span style={{ position: "relative" }}>{stir.holding ? "Stirring… 🌀" : "Hold to stir 🥄"}</span>
          </button>
          <span style={{ font: `500 13px ${FONTS.ui}`, color: VW.inkSoft }}>…or tap it five times</span>
          <SkipChip onClick={() => { setBrewed(true); burst({ kind: "sparkles", emojis: ["✨", "💜", "🧡"], origin: { x: 0.5, y: 0.55 }, count: 24 }); }}>Stir it for me</SkipChip>
        </div>
      )}

      {brewed && (
        <motion.div
          initial={reduced ? false : { opacity: 0, scaleY: 0.2 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          style={{ position: "relative", transformOrigin: "top", width: "100%", maxWidth: 380, padding: "22px 22px 20px", borderRadius: 10, background: `linear-gradient(180deg, ${VW.paper}, #F3E2BF)`, color: HW.paperInk, boxShadow: "0 18px 40px -16px rgba(0,0,0,.8)" }}
        >
          <span aria-hidden style={{ position: "absolute", left: -6, right: -6, top: -8, height: 16, borderRadius: 8, background: "#C9A36A" }} />
          <span aria-hidden style={{ position: "absolute", left: -6, right: -6, bottom: -8, height: 16, borderRadius: 8, background: "#C9A36A" }} />
          <p style={{ margin: 0, font: `700 12px ${FONTS.ui}`, letterSpacing: ".18em", textTransform: "uppercase", color: HW.pumpkinDeep }}>The spell</p>
          <p style={{ margin: "8px 0 0", font: `italic 400 20px/1.45 ${FONTS.serif}`, overflowWrap: "anywhere" }}>{spell || "Whoever drinks this stays my favourite person. Side effects: me, forever."}</p>
          <ul style={{ margin: "12px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 4, textAlign: "left" }}>
            {ingredients.map((ing, i) => (
              <li key={i} style={{ font: `500 13px/1.35 ${FONTS.ui}`, color: "#4A3A5E" }}>
                ✓ <b>{ing.name}</b>{ing.line ? ` — ${ing.line}` : ""}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
      {brewed && <Btn onClick={onNext}>One last room →</Btn>}
    </>
  );
}
