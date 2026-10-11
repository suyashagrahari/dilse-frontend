"use client";

// Scene 5 — "Our garba circle". Their photos dance round the garbo in
// mirror-work frames, the way a garba circle turns round its lamp; the dancing
// couple twirls in the middle. Tap a frame and the circle pauses while that
// photo's caption and note come up underneath; tap the dhol chip and the circle
// speeds up for a few beats. With no photos (preview) it shows the couple and
// a line about where the photos will go.

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CroppedPhoto, haptic, useReducedMotion } from "../../../_valentine/kit";
import type { LovePhoto } from "../../../_valentine/types";
import { FONTS } from "../../../_valentine/theme";
import { useDd, useNext } from "./stage";
import { DD, Hint, RoomTitle } from "./ui";

export default function GarbaCircle({ photos, preview, sticker, onNext }: { photos: readonly LovePhoto[]; preview: boolean; sticker: ReactNode; onNext: () => void }) {
  const reduced = useReducedMotion();
  const { cue } = useDd();
  const list = photos.filter((p) => p && p.url).slice(0, 6);
  const [open, setOpen] = useState<number | null>(null);
  const [fast, setFast] = useState(false);
  const [ready, setReady] = useState(list.length === 0);

  // The pill comes once she has looked at one photo, or after a few seconds of watching.
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 3500);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!fast) return;
    const t = window.setTimeout(() => setFast(false), 2600);
    return () => window.clearTimeout(t);
  }, [fast]);

  const spin = () => {
    haptic(10);
    cue("dd-dhol", { gain: 0.9 });
    cue("dd-dhol", { gain: 0.7, at: 0.22 });
    cue("dd-tak", { gain: 0.6, at: 0.4 });
    setOpen(null);
    setFast(true);
  };

  const pick = (k: number) => {
    haptic(8);
    cue("pop", { gain: 0.5 });
    setOpen((o) => (o === k ? null : k));
    setReady(true);
  };

  useNext(ready ? "A note for you" : null, onNext, "letter");
  const n = Math.max(list.length, 1);
  const shown = open !== null ? list[open] : null;

  return (
    <>
      <style>{CIRCLE_CSS}</style>
      <RoomTitle kicker="Round and round the garbo" title="Our garba circle" sub={list.length ? "Every photo is a step we danced together. Tap one." : undefined} />

      <div className="dd-fill">
        <div className={`dd-ring2${open !== null ? " is-paused" : ""}${fast ? " is-fast" : ""}${reduced ? " is-still" : ""}`}>
          <span className="dd-ring2-track" aria-hidden />
          <div className="dd-ring2-centre">{sticker}</div>
          <div className="dd-ring2-spin">
            {list.map((p, k) => {
              const a = (k / n) * 360;
              return (
                <div key={k} className="dd-ring2-slot" style={{ transform: `rotate(${a}deg) translateY(-41cqmin)` }}>
                  <button
                    type="button"
                    className={`dd-frame${open === k ? " is-open" : ""}`}
                    style={{ ["--a" as string]: `${-a}deg` }}
                    onClick={() => pick(k)}
                    aria-label={p.caption ? `Photo: ${p.caption}` : `Photo ${k + 1}`}
                    aria-pressed={open === k}
                  >
                    <span className="dd-frame-in">
                      <CroppedPhoto photo={p} alt={p.caption ?? ""} />
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="dd-circle-card" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {shown ? (
            <motion.div key={open} className="dd-circle-note" initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              {shown.caption && <span style={{ font: `700 clamp(14px, 2.1dvh, 16px) ${FONTS.ui}`, color: DD.kumkumDeep }}>{shown.caption}</span>}
              {shown.note && <span style={{ font: `italic 400 clamp(13.5px, 2dvh, 15.5px)/1.35 ${FONTS.serif}`, color: DD.maroon }}>{shown.note}</span>}
              {!shown.caption && !shown.note && <span style={{ font: `600 15px ${FONTS.ui}`, color: DD.maroon }}>One of my favourite steps with you 💛</span>}
            </motion.div>
          ) : list.length === 0 ? (
            <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ margin: 0, font: `500 clamp(13.5px, 2dvh, 15px)/1.4 ${FONTS.ui}`, color: DD.mist, maxWidth: 320 }}>
              {preview ? "Add photos in the form and they'll dance round the garbo here." : "The circle is ready. Our photos are still to come 💛"}
            </motion.p>
          ) : (
            <motion.div key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "grid", placeItems: "center" }}>
              {fast ? <Hint>Faster, faster! 🥁</Hint> : (
                <button type="button" className="dd-dholchip" onClick={spin}>
                  🥁 Play the dhol
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

const CIRCLE_CSS = `
.dd-ring2 { position: relative; width: min(96cqw, 100cqh, calc(380px * var(--vw-s, 1))); aspect-ratio: 1; container-type: size; }
.dd-ring2-track { position: absolute; inset: 9%; border-radius: 50%; border: 2px dashed rgba(246,210,122,.4);
  background: radial-gradient(circle, rgba(255,182,39,.2), rgba(255,182,39,0) 62%); }
.dd-ring2-centre { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); display: grid; place-items: center; }
.dd-ring2-centre > * { animation: dd-sway2 1.6s ease-in-out infinite alternate; }
@keyframes dd-sway2 { from { transform: rotate(-5deg) translateY(2px) } to { transform: rotate(5deg) translateY(-3px) } }
.dd-ring2-spin { position: absolute; inset: 0; animation: dd-spin 26s linear infinite; }
.dd-ring2.is-fast .dd-ring2-spin { animation-duration: 6s; }
.dd-ring2.is-paused .dd-ring2-spin, .dd-ring2.is-paused .dd-frame { animation-play-state: paused; }
.dd-ring2.is-still .dd-ring2-spin, .dd-ring2.is-still .dd-frame, .dd-ring2.is-still .dd-ring2-centre > * { animation: none; }
@keyframes dd-spin { to { transform: rotate(360deg) } }
.dd-ring2-slot { position: absolute; left: 50%; top: 50%; width: 0; height: 0; }
/* each frame counter-rotates, so the photos stay upright as the circle turns */
.dd-frame { position: absolute; left: 0; top: 0; width: 25cqmin; aspect-ratio: 1; margin: -12.5cqmin 0 0 -12.5cqmin; padding: 0; border: 0; border-radius: 50%; cursor: pointer;
  background: none; transform: rotate(var(--a)); animation: dd-unspin 26s linear infinite; touch-action: manipulation; -webkit-tap-highlight-color: transparent; transition: scale .25s ease; }
.dd-ring2.is-fast .dd-frame { animation-duration: 6s; }
@keyframes dd-unspin { from { transform: rotate(var(--a)) } to { transform: rotate(calc(var(--a) - 360deg)) } }
.dd-frame-in { position: absolute; inset: 0; border-radius: 50%; overflow: hidden;
  box-shadow: 0 0 0 3px #F6D27A, 0 0 0 7px #8E1022, 0 0 0 9px #F6D27A, 0 10px 24px -8px rgba(0,0,0,.8); }
/* the mirror-work halo round each frame */
.dd-frame::before { content: ""; position: absolute; inset: -16%; border-radius: 50%; pointer-events: none;
  background: repeating-conic-gradient(from 0deg, #FFFFFF 0 3deg, transparent 3deg 15deg); -webkit-mask: radial-gradient(closest-side, transparent 80%, #000 82%, #000 92%, transparent 94%); mask: radial-gradient(closest-side, transparent 80%, #000 82%, #000 92%, transparent 94%); opacity: .8; }
.dd-frame.is-open { scale: 1.18; z-index: 2; }
.dd-frame:focus-visible { outline: 3px solid #7FD8F2; outline-offset: 6px; }
.dd-circle-card { flex: none; width: 100%; max-width: calc(380px * var(--vw-s, 1)); min-height: clamp(70px, 11dvh, 92px); display: grid; place-items: center; }
.dd-circle-note { display: grid; gap: 2px; padding: 10px 16px; border-radius: 16px; background: linear-gradient(180deg, #FFF8E8, #FFEBC2); box-shadow: 0 0 0 2px #F6D27A, 0 14px 30px -14px rgba(0,0,0,.7); overflow-wrap: anywhere; }
.dd-dholchip { min-height: 44px; padding: 8px 18px; border-radius: 99px; border: 1.5px solid rgba(246,210,122,.55); background: rgba(255,247,232,.1); color: ${DD.ink};
  font: 700 15px ${FONTS.ui}; cursor: pointer; touch-action: manipulation; }
.dd-dholchip:active { transform: scale(.96); }
`;
