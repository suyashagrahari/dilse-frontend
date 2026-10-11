"use client";

// Scene 2 — A row of diyas on the windowsill. The first one is already lit
// (the one from the door). Carry its flame along: drag it from a lit diya onto
// the next, or simply tap an unlit diya and the flame hops over to it. Every
// diya that catches lifts one of the sender's wishes into the list above.
// When the whole row glows, the sparkler penguin comes out to celebrate.

import { useEffect, useRef, useState, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { FONTS, VW } from "../../../_valentine/theme";
import { Diya } from "./art";
import { DW_DISPLAY } from "./fonts";
import { DW_GIF, preload, useDw, useNext } from "./stage";
import { DW, Hint, SceneTitle } from "./ui";

/** Outside the component: the React compiler treats these as impure inside it. */
const now = () => performance.now();

const CSS = `
.dw-wishes { position: relative; list-style: none; margin: 0; padding: 0; width: min(100%, 440px); display: grid; align-content: center; gap: clamp(4px, 1.1dvh, 10px); }
.dw-wish { display: grid; grid-template-columns: 22px 1fr; gap: 8px; align-items: center; text-align: left; min-height: calc(2.6em); font: 600 clamp(13px, 2.1dvh, 16px)/1.3 ${FONTS.ui}; color: ${DW.cream}; }
.dw-wish-num { width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; font: 700 11px ${FONTS.ui}; background: rgba(255,211,110,.12); color: rgba(255,211,110,.7); border: 1px solid rgba(255,211,110,.3); transition: background .4s, color .4s; }
.dw-wish.is-lit .dw-wish-num { background: #FFB23F; color: #3A1606; border-color: #FFD36E; box-shadow: 0 0 12px rgba(255,178,63,.7); }
.dw-wish-dots { letter-spacing: .4em; color: rgba(217,210,236,.32); font-weight: 700; }
.dw-row { position: relative; width: 100%; display: flex; justify-content: center; align-items: flex-end; gap: clamp(4px, 2cqw, 18px); padding: 0 4px 12px; box-sizing: border-box; touch-action: none; }
.dw-row::after { content: ""; position: absolute; left: -4%; right: -4%; bottom: 0; height: 16px; border-radius: 6px;
  background: linear-gradient(180deg, #6B3A1E, #3E200F); box-shadow: 0 -2px 0 #8A5530 inset, 0 10px 24px -8px rgba(0,0,0,.8); z-index: -1; }
.dw-row::before { content: ""; position: absolute; left: -4%; right: -4%; bottom: 16px; height: 6px;
  background: repeating-linear-gradient(90deg, #FF5FA2 0 8px, #FFD36E 8px 16px, #2EC4B6 16px 24px, #FF8A1E 24px 32px); opacity: .8; border-radius: 3px; z-index: -1; }
.dw-rdiya { position: relative; flex: none; width: min(calc((100cqw - 60px) / var(--n)), 104px); aspect-ratio: 200 / 150; border: 0; padding: 0; background: none; cursor: pointer; touch-action: none;
  -webkit-tap-highlight-color: transparent; }
.dw-rdiya:focus-visible { outline: 3px solid #FFF1B8; outline-offset: 4px; border-radius: 30%; }
.dw-rdiya.is-unlit:not(:disabled) { animation: dw-wait 2.2s ease-in-out infinite; }
@keyframes dw-wait { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-3px) } }
.dw-carry { position: fixed; z-index: 70; width: 30px; height: 46px; margin: -46px 0 0 -15px; pointer-events: none; }
@media (prefers-reduced-motion: reduce) { .dw-rdiya.is-unlit:not(:disabled) { animation: none; } }
`;

/** A flame that hops from one diya to another (or follows her finger). */
function Flame() {
  return (
    <svg viewBox="0 0 30 46" width="100%" height="100%" aria-hidden style={{ display: "block", overflow: "visible", filter: "drop-shadow(0 0 8px rgba(255,190,80,.95))" }}>
      <path className="dw-flame" d="M15 2 C24 18 27 28 15 44 C3 28 6 18 15 2 Z" fill="#FFB23F" />
      <path className="dw-flame-in" d="M15 16 C19 24 20 31 15 40 C10 31 11 24 15 16 Z" fill="#FFF3C4" />
    </svg>
  );
}

type Hop = { id: number; from: { x: number; y: number }; to: { x: number; y: number } };

export default function DiyaRow({ wishes, sticker, onNext }: { wishes: string[]; sticker: ReactNode; onNext: () => void }) {
  const reduced = useReducedMotion();
  const { cue } = useDw();
  const n = wishes.length;
  const [lit, setLit] = useState<boolean[]>(() => wishes.map((_, i) => i === 0));
  const [hops, setHops] = useState<Hop[]>([]);
  const [carry, setCarry] = useState<{ x: number; y: number } | null>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const pending = useRef<Set<number>>(new Set());
  const done = lit.every(Boolean);

  useEffect(() => {
    const t = window.setTimeout(() => preload(DW_GIF.rangoli), 1500);
    return () => window.clearTimeout(t);
  }, []);

  const center = (i: number) => {
    const r = refs.current[i]?.getBoundingClientRect();
    return r ? { x: r.left + r.width / 2, y: r.top + r.height * 0.42 } : { x: 0, y: 0 };
  };

  // The source of truth for "is it lit" during a drag (several catches can land before a re-render).
  const litRef = useRef<boolean[]>(lit);
  const catchFlame = (i: number) => {
    pending.current.delete(i);
    if (litRef.current[i]) return;
    const nl = litRef.current.slice();
    nl[i] = true;
    litRef.current = nl;
    setLit(nl);
    const count = nl.filter(Boolean).length;
    haptic(14);
    cue("chime", { gain: 0.45, detune: (count - 3) * 120 });
    if (nl.every(Boolean)) {
      window.setTimeout(() => {
        cue("chime-cascade", { gain: 0.5 });
        if (!reduced) burst({ kind: "sparkles", emojis: ["✨", "🪔", "🌟"], origin: { x: 0.5, y: 0.62 }, count: 26 });
      }, 250);
    }
  };

  // A tap on an unlit diya: the flame hops over from the nearest lit one.
  const tapLight = (i: number) => {
    if (litRef.current[i] || pending.current.has(i)) return;
    pending.current.add(i);
    let src = -1;
    let best = Infinity;
    litRef.current.forEach((on, j) => {
      if (on && Math.abs(j - i) < best) {
        best = Math.abs(j - i);
        src = j;
      }
    });
    if (reduced || src < 0) {
      catchFlame(i);
      return;
    }
    cue("flame-whoosh", { gain: 0.35 });
    const hop = { id: now() + i, from: center(src), to: center(i) };
    setHops((h) => [...h, hop]);
    window.setTimeout(() => {
      catchFlame(i);
      setHops((h) => h.filter((x) => x.id !== hop.id));
    }, 420);
  };

  // Drag: pick the flame up from a lit diya and carry it to the others.
  const dragging = useRef(false);
  const rects = useRef<DOMRect[]>([]);
  const onDown = (i: number, e: RPointerEvent) => {
    if (!litRef.current[i]) return;
    dragging.current = true;
    rects.current = refs.current.map((el) => el?.getBoundingClientRect() ?? new DOMRect());
    setCarry({ x: e.clientX, y: e.clientY });
  };
  useEffect(() => {
    if (!carry) return;
    const move = (e: PointerEvent) => {
      if (!dragging.current) return;
      setCarry({ x: e.clientX, y: e.clientY });
      rects.current.forEach((r, k) => {
        if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top - 20 && e.clientY <= r.bottom) catchFlame(k);
      });
    };
    const up = () => {
      dragging.current = false;
      setCarry(null);
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
    // catchFlame is stable enough (setState updater); re-binding on every move is what we avoid.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carry !== null]);

  useNext(done ? "Make a rangoli" : null, onNext, "rangoli");

  return (
    <>
      <style>{CSS}</style>
      <SceneTitle kicker={`${n} little lights`} title="Light every diya" sub="Tap a diya, or drag the flame along the row. Each one lifts a wish." />
      <div className="dw-fill" style={{ gridTemplateRows: "minmax(0, 1fr) auto", placeItems: "center", gap: "clamp(8px, 2dvh, 18px)" }}>
        <ol className="dw-wishes" aria-live="polite">
          {wishes.map((w, i) => (
            <li key={i} className={`dw-wish${lit[i] ? " is-lit" : ""}`}>
              <span className="dw-wish-num" aria-hidden>
                {i + 1}
              </span>
              <AnimatePresence mode="wait" initial={false}>
                {lit[i] ? (
                  <motion.span key="w" initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ overflowWrap: "anywhere" }}>
                    {w}
                  </motion.span>
                ) : (
                  <motion.span key="d" className="dw-wish-dots" exit={{ opacity: 0 }}>
                    · · ·
                  </motion.span>
                )}
              </AnimatePresence>
            </li>
          ))}
        </ol>
        <div className="dw-row" style={{ ["--n" as string]: n }}>
          {wishes.map((_, i) => (
            <button
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              className={`dw-rdiya${lit[i] ? "" : " is-unlit"}`}
              onClick={() => tapLight(i)}
              onPointerDown={(e) => onDown(i, e)}
              aria-label={lit[i] ? `Diya ${i + 1}, lit` : `Light diya ${i + 1}`}
              aria-pressed={lit[i]}
            >
              <Diya lit={lit[i]} hue={i} id={`row${i}`} />
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: "none", minHeight: 52, display: "grid", placeItems: "center" }}>
        {done ? (
          <motion.div initial={reduced ? false : { opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 16 }} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 60, height: 60, display: "grid", placeItems: "center", flex: "none" }}>{sticker}</span>
            <p style={{ margin: 0, font: `400 clamp(17px, 2.7dvh, 21px)/1.2 ${DW_DISPLAY}`, color: DW.gold, textAlign: "left" }}>
              All lit. Look at you glow ✨
            </p>
          </motion.div>
        ) : (
          <Hint>
            {lit.filter(Boolean).length} of {n} lit
          </Hint>
        )}
      </div>
      {hops.map((h) => (
        <motion.span
          key={h.id}
          className="dw-carry"
          initial={{ x: h.from.x, y: h.from.y, scale: 0.9 }}
          animate={{ x: [h.from.x, (h.from.x + h.to.x) / 2, h.to.x], y: [h.from.y, Math.min(h.from.y, h.to.y) - 70, h.to.y], scale: [0.9, 1.15, 0.8] }}
          transition={{ duration: 0.42, ease: "easeInOut" }}
          style={{ left: 0, top: 0, color: VW.ink }}
        >
          <Flame />
        </motion.span>
      ))}
      {carry && (
        <span className="dw-carry" style={{ left: carry.x, top: carry.y }}>
          <Flame />
        </span>
      )}
    </>
  );
}
