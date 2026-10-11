"use client";

// Scene 6 — "A note tucked in the dupatta". The sender's letter on a cream
// panel framed by a bandhani dupatta with a zari border and tassels. A long
// letter is split into pages that fit the screen (never a scroll); she taps the
// note (or "next fold") to turn to the next fold, and the pill appears on the
// last one.

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { FONTS } from "../../../_valentine/theme";
import { useDd, useNext } from "./stage";
import { BANDHANI, DD, RoomTitle } from "./ui";

/** Characters that fit one fold, by the screen's height (the card is a fixed share of it). */
function budget(h: number, w: number): number {
  const base = h < 680 ? 250 : h < 780 ? 320 : h < 900 ? 420 : 560;
  return w >= 1100 ? Math.round(base * 1.15) : base;
}

/** Split into folds at paragraph, then sentence, then word boundaries. */
function paginate(text: string, max: number): string[] {
  const out: string[] = [];
  let cur = "";
  const push = () => {
    if (cur.trim()) out.push(cur.trim());
    cur = "";
  };
  const pieces = text.replace(/\r/g, "").split(/(\n\s*\n)/);
  for (const piece of pieces) {
    if (/^\n\s*\n$/.test(piece)) {
      if (cur) cur += "\n\n";
      continue;
    }
    const sentences = piece.match(/[^.!?…]+[.!?…]*\s*/g) ?? [piece];
    for (const s of sentences) {
      if ((cur + s).length <= max) {
        cur += s;
        continue;
      }
      if (cur.trim()) push();
      if (s.length <= max) {
        cur = s;
        continue;
      }
      for (const w of s.split(/(\s+)/)) {
        if ((cur + w).length > max) push();
        cur += w;
      }
    }
  }
  push();
  return out.length ? out : [text];
}

export default function DupattaLetter({ letter, recipient, sender, onNext }: { letter: string; recipient: string; sender: string; onNext: () => void }) {
  const reduced = useReducedMotion();
  const { cue } = useDd();
  const [size, setSize] = useState({ h: 800, w: 390 });
  useEffect(() => {
    const on = () => setSize({ h: window.innerHeight, w: window.innerWidth });
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  const pages = useMemo(() => paginate(letter, budget(size.h, size.w)), [letter, size]);
  const [p, setP] = useState(0);
  const page = Math.min(p, pages.length - 1);
  const last = page >= pages.length - 1;

  const turn = () => {
    if (last) return;
    haptic(8);
    cue("paper-rustle", { gain: 0.6 });
    setP(page + 1);
  };

  useNext(last ? "See the invitation" : null, onNext, "sparkle");

  return (
    <>
      <style>{LETTER_CSS}</style>
      <RoomTitle kicker="Tucked in the dupatta" title="A note for you" />

      <div className="dd-fill">
        <div className="dd-dupatta">
          <span className="dd-dupatta-tassels" aria-hidden />
          <button type="button" className="dd-note" onClick={turn} disabled={last} aria-label={last ? undefined : "Next fold of the note"}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={page}
                className="dd-note-in"
                initial={reduced ? false : { opacity: 0, rotateX: -12, y: 10 }}
                animate={{ opacity: 1, rotateX: 0, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
              >
                {page === 0 && <p className="dd-note-dear">Dear {recipient},</p>}
                <p className="dd-note-text">{pages[page]}</p>
                {last && <p className="dd-note-sign">— {sender}</p>}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
      </div>

      <div style={{ flex: "none", minHeight: 30, display: "grid", placeItems: "center" }}>
        {pages.length > 1 && (
          <p style={{ margin: 0, font: `600 clamp(13px, 2dvh, 15px) ${FONTS.ui}`, color: DD.mist }}>
            {last ? `Fold ${page + 1} of ${pages.length}` : `Fold ${page + 1} of ${pages.length} · tap the note for the next fold`}
          </p>
        )}
      </div>
    </>
  );
}

const LETTER_CSS = `
.dd-dupatta { position: relative; width: min(94cqw, calc(430px * var(--vw-s, 1))); height: min(100cqh, calc(620px * var(--vw-s, 1))); box-sizing: border-box; padding: 16px;
  border-radius: 18px; background: ${BANDHANI}, linear-gradient(160deg, #E0324A, #A3132A 60%, #8E1022);
  box-shadow: inset 0 0 0 4px #F6D27A, inset 0 0 0 6px #B8862E, 0 30px 60px -24px rgba(0,0,0,.85); transform: rotate(-1deg); }
.dd-dupatta-tassels { position: absolute; left: 12px; right: 12px; bottom: -11px; height: 16px; pointer-events: none;
  background: radial-gradient(circle at 50% 70%, #FFB627 0 4px, rgba(0,0,0,0) 4.5px) 0 0 / 18px 16px repeat-x; }
.dd-note { position: relative; width: 100%; height: 100%; border: 0; padding: 0; margin: 0; cursor: pointer; border-radius: 12px; text-align: left;
  background: linear-gradient(180deg, #FFF9EC, #FFEFD0); box-shadow: inset 0 0 0 1.5px rgba(184,134,46,.5); perspective: 900px; overflow: hidden; }
.dd-note:disabled { cursor: default; color: inherit; }
.dd-note:focus-visible { outline: 3px solid #7FD8F2; outline-offset: 4px; }
.dd-note-in { position: absolute; inset: 0; padding: clamp(14px, 3dvh, 26px) clamp(16px, 5cqw, 26px); display: flex; flex-direction: column; justify-content: center; gap: 10px; color: ${DD.maroon}; }
.dd-note-dear { margin: 0; font: 700 clamp(22px, 3.6dvh, 30px) ${FONTS.script}; color: ${DD.kumkumDeep}; }
.dd-note-text { margin: 0; font: 400 clamp(15.5px, 2.35dvh, 18.5px)/1.55 ${FONTS.serif}; white-space: pre-line; overflow-wrap: anywhere; }
.dd-note-sign { margin: 0; align-self: flex-end; font: 700 clamp(20px, 3.2dvh, 26px) ${FONTS.script}; color: ${DD.kumkumDeep}; }
`;
