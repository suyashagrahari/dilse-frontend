"use client";

// Scene 2 — "Nine nights, one question". Nine clay diyas stand in a garba
// circle around the garbo (the perforated pot lamp). Each one she taps lights
// up and shows that night's line in the card underneath (nights 3, 6 and 9
// also show one of the photos). Every diya lit makes the garbo glow brighter;
// all nine and it blazes. Any order, any speed; the card never changes size.

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CroppedPhoto, haptic, useReducedMotion } from "../../../_valentine/kit";
import type { LovePhoto } from "../../../_valentine/types";
import { FONTS } from "../../../_valentine/theme";
import { Diya, Garbo } from "./art";
import { DD_DISPLAY } from "./fonts";
import { useDd, useNext } from "./stage";
import { DD, Hint, RoomTitle } from "./ui";

const HUES = [DD.kumkum, DD.marigold, DD.peacock, DD.emerald, DD.rani, "#7B4FD6", DD.saffron, "#1FA2C4", DD.gold];

export default function NineNights({ lines, photos, onNext }: { lines: readonly string[]; photos: readonly LovePhoto[]; onNext: () => void }) {
  const reduced = useReducedMotion();
  const { cue } = useDd();
  const [lit, setLit] = useState<boolean[]>(() => Array(9).fill(false));
  const [shown, setShown] = useState<number | null>(null);
  const count = lit.filter(Boolean).length;
  const all = count === 9;
  const withPhoto = (k: number) => (k === 2 || k === 5 || k === 8) && photos.length > 0;
  const photoFor = (k: number) => photos[[2, 5, 8].indexOf(k) % photos.length];

  const light = (k: number) => {
    haptic(10);
    setShown(k);
    if (lit[k]) return;
    cue("match-strike", { gain: 0.4 });
    cue("dd-bells", { gain: 0.35, at: 0.12, detune: k * 60 });
    const next = lit.map((v, i) => v || i === k);
    setLit(next);
    if (next.every(Boolean)) {
      window.setTimeout(() => cue("chime-cascade", { gain: 0.6 }), 260);
      window.setTimeout(() => cue("dd-dhol", { gain: 0.9 }), 260);
    }
  };

  useNext(all ? "Clash sticks" : null, onNext, "diya");

  return (
    <>
      <style>{NIGHTS_CSS}</style>
      <RoomTitle kicker="Navratri · nine nights" title="Nine nights, one question" sub="Light a diya for every night of Navratri." />

      <div className="dd-fill">
        <div className={`dd-circle${all ? " is-all" : ""}`}>
          <div className="dd-circle-garbo">
            <Garbo size="100%" glow={count / 9} />
          </div>
          {lit.map((on, k) => {
            const a = (k / 9) * Math.PI * 2 - Math.PI / 2;
            return (
              <button
                key={k}
                type="button"
                className={`dd-diya${on ? " is-lit" : ""}${shown === k ? " is-shown" : ""}`}
                style={{ left: `${50 + Math.cos(a) * 41}%`, top: `${50 + Math.sin(a) * 41}%` }}
                onClick={() => light(k)}
                aria-label={on ? `Night ${k + 1}: ${lines[k]}` : `Light the diya for night ${k + 1}`}
                aria-pressed={on}
              >
                <Diya lit={on} hue={HUES[k]} size="100%" />
                <span className="dd-diya-n" aria-hidden>
                  {k + 1}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* the night's card: fixed height, so lighting one never moves anything */}
      <div className="dd-night-card" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {shown === null ? (
            <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "grid", placeItems: "center", height: "100%" }}>
              <Hint>Tap a diya to light it 🪔</Hint>
            </motion.div>
          ) : (
            <motion.div
              key={shown}
              className="dd-night-inner"
              initial={reduced ? false : { opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.28 }}
            >
              {withPhoto(shown) && (
                <span className="dd-night-photo">
                  <CroppedPhoto photo={photoFor(shown)} alt={photoFor(shown).caption ?? ""} />
                </span>
              )}
              <span style={{ minWidth: 0, display: "grid", gap: 2, textAlign: withPhoto(shown) ? "left" : "center" }}>
                <span style={{ font: `700 11px ${FONTS.ui}`, letterSpacing: ".18em", textTransform: "uppercase", color: DD.kumkum }}>Night {shown + 1}</span>
                <span style={{ font: `500 clamp(14.5px, 2.2dvh, 16.5px)/1.35 ${FONTS.ui}`, color: DD.maroon, overflowWrap: "anywhere" }}>{lines[shown]}</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p style={{ flex: "none", margin: 0, font: `400 clamp(15px, 2.3dvh, 18px) ${DD_DISPLAY}`, color: all ? DD.marigold : DD.mist }}>
        {all ? "All nine lit ✨" : `${count} of 9 lit`}
      </p>
    </>
  );
}

const NIGHTS_CSS = `
.dd-circle { position: relative; width: min(94cqw, 100cqh, calc(360px * var(--vw-s, 1))); aspect-ratio: 1; }
.dd-circle::before { content: ""; position: absolute; inset: 9%; border-radius: 50%; border: 2px dashed rgba(246,210,122,.35); }
.dd-circle.is-all::before { border-style: solid; border-color: rgba(255,182,39,.6); box-shadow: 0 0 40px rgba(255,182,39,.35), inset 0 0 40px rgba(255,182,39,.25); transition: all .6s ease; }
.dd-circle-garbo { position: absolute; left: 50%; top: 52%; width: 34%; transform: translate(-50%, -50%); }
.dd-circle.is-all .dd-circle-garbo { animation: dd-garbo-pulse 1.4s ease-in-out infinite alternate; }
@keyframes dd-garbo-pulse { from { transform: translate(-50%, -50%) scale(1) } to { transform: translate(-50%, -50%) scale(1.06) } }
.dd-diya { position: absolute; width: 20%; aspect-ratio: 1; transform: translate(-50%, -50%); border: 0; padding: 0; background: none; cursor: pointer;
  border-radius: 50%; touch-action: manipulation; -webkit-tap-highlight-color: transparent; transition: transform .25s cubic-bezier(.3,1.5,.5,1); }
.dd-diya:not(.is-lit) { animation: dd-diya-call 2.2s ease-in-out infinite; }
.dd-diya:nth-child(3n) { animation-delay: .7s; } .dd-diya:nth-child(3n+1) { animation-delay: 1.4s; }
@keyframes dd-diya-call { 0%, 70%, 100% { transform: translate(-50%, -50%) } 80% { transform: translate(-50%, -54%) rotate(-4deg) } 90% { transform: translate(-50%, -50%) rotate(3deg) } }
.dd-diya:active { transform: translate(-50%, -50%) scale(.9); }
.dd-diya.is-shown { transform: translate(-50%, -50%) scale(1.14); }
.dd-diya:focus-visible { outline: 3px solid #7FD8F2; outline-offset: 2px; }
.dd-diya-n { position: absolute; left: 50%; bottom: -8%; transform: translateX(-50%); font: 700 10px ${FONTS.ui}; color: rgba(255,247,232,.6); }
.dd-diya.is-lit .dd-diya-n { color: ${DD.gold}; }
.dd-night-card { flex: none; width: 100%; max-width: calc(380px * var(--vw-s, 1)); height: clamp(74px, 12dvh, 96px); position: relative; }
.dd-night-inner { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 12px; padding: 8px 14px; border-radius: 16px; box-sizing: border-box;
  background: linear-gradient(180deg, #FFF8E8, #FFEBC2); box-shadow: 0 0 0 2px #F6D27A, 0 14px 30px -14px rgba(0,0,0,.7); }
.dd-night-photo { flex: none; height: 100%; aspect-ratio: 1; border-radius: 10px; overflow: hidden; box-shadow: 0 0 0 2px #F6D27A; }
@media (prefers-reduced-motion: reduce) { .dd-diya, .dd-circle.is-all .dd-circle-garbo { animation: none !important; } }
`;
