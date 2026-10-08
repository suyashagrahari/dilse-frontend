"use client";

// ─── <FilmReel> — up to 12 photos as a projector montage, then a strip ───────
//
//   <FilmReel photos={data.photos} aspect={day.photoAspect} onDone={() => next()} title="Our reel" />
//
// Montage: each photo holds `perPhotoMs` (2.4 s) with a slow Ken Burns push
// (transform only), inside a sprocket frame with flicker + grain, and the
// `projector-loop` SFX under the music. Captions show as lower-thirds. Tap the
// screen (or "Skip ▸") to jump to the end. Then a swipeable strip; tapping a
// frame opens the shared PhotoLightbox. Reduced motion: crossfades, no push,
// no flicker. With no photos it renders nothing and calls onDone at once.

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { LovePhoto } from "../../types";
import CroppedPhoto from "../CroppedPhoto";
import PhotoLightbox from "../PhotoLightbox";
import { useReducedMotion } from "../useReducedMotion";
import { usePremiumOptional } from "./PremiumRoot";
import { sfx } from "./sfx";

export interface FilmReelProps {
  photos: readonly LovePhoto[];
  /** Frame shape (width / height) — pass day.photoAspect. */
  aspect?: number;
  perPhotoMs?: number;
  /** Small title over the reel ("Now showing"). */
  title?: string;
  /** Start the montage at once (default true). false = show the strip only. */
  autoPlay?: boolean;
  onDone?: () => void;
  /** Frame colour (default near-black film). */
  film?: string;
  style?: CSSProperties;
}

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='.55'/></svg>\")";

export default function FilmReel({ photos, aspect = 0.8, perPhotoMs = 2400, title, autoPlay = true, onDone, film = "#0d0a0c", style }: FilmReelProps) {
  const reduce = useReducedMotion();
  const premium = usePremiumOptional();
  const list = photos.filter((p) => p && p.url).slice(0, 12);
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<"montage" | "strip">(autoPlay && list.length ? "montage" : "strip");
  const [box, setBox] = useState<number | null>(null);
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  });

  useEffect(() => {
    if (!list.length) doneRef.current?.();
    // once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The projector hum under the montage.
  useEffect(() => {
    if (phase !== "montage") return;
    const h = sfx("projector-loop", { gain: 0.6 });
    return () => h.stop(600);
  }, [phase]);

  useEffect(() => {
    if (phase !== "montage") return;
    const t = window.setTimeout(() => {
      if (i + 1 < list.length) setI(i + 1);
      else {
        setPhase("strip");
        doneRef.current?.();
      }
    }, perPhotoMs);
    return () => window.clearTimeout(t);
  }, [phase, i, list.length, perPhotoMs]);

  if (!list.length) return null;

  const skip = () => {
    if (phase !== "montage") return;
    premium?.sfx("snap");
    setPhase("strip");
    doneRef.current?.();
  };

  return (
    <div className={`pm-reel${reduce ? " is-reduced" : ""}`} style={{ ["--pm-film" as string]: film, ["--pm-hold" as string]: `${perPhotoMs}ms`, ...style }}>
      {title && <p className="pm-reelTitle">{title}</p>}
      {phase === "montage" ? (
        <div className="pm-reelStage" onClick={skip} role="group" aria-roledescription="slideshow" aria-label={`Photo ${i + 1} of ${list.length}`}>
          <div className="pm-reelFrame" style={{ aspectRatio: String(aspect) }}>
            {list.map((p, k) => (
              <div key={k} className={`pm-reelShot${k === i ? " is-on" : ""}`} aria-hidden={k !== i}>
                <div className="pm-reelKb" style={{ animationDuration: `${perPhotoMs + 600}ms`, animationName: k % 2 ? "pm-kbB" : "pm-kbA" }}>
                  <CroppedPhoto photo={p} eager={k <= i + 1} />
                </div>
                {p.caption && <p className="pm-reelCap">{p.caption}</p>}
              </div>
            ))}
            <span className="pm-reelGrain" aria-hidden style={{ backgroundImage: GRAIN }} />
            <span className="pm-reelFlicker" aria-hidden />
          </div>
          <div className="pm-reelBar" aria-hidden><i style={{ width: `${((i + 1) / list.length) * 100}%` }} /></div>
          <button type="button" className="pm-reelSkip" onClick={(e) => { e.stopPropagation(); skip(); }}>Skip ▸</button>
        </div>
      ) : (
        <div className="pm-reelStrip" role="list">
          {list.map((p, k) => (
            <button key={k} type="button" role="listitem" className="pm-reelCell" style={{ aspectRatio: String(aspect) }} onClick={() => setBox(k)} aria-label={`Open photo ${k + 1}${p.caption ? `: ${p.caption}` : ""}`}>
              <CroppedPhoto photo={p} />
            </button>
          ))}
        </div>
      )}
      <PhotoLightbox photos={list} index={box} onIndex={setBox} onClose={() => setBox(null)} />
      <style>{REEL_CSS}</style>
    </div>
  );
}

const REEL_CSS = `
.pm-reel { display: grid; gap: 12px; justify-items: center; width: 100%; }
.pm-reelTitle { margin: 0; font: 700 12px/1 var(--vw-font-ui, system-ui), sans-serif; letter-spacing: .3em; text-transform: uppercase; opacity: .8; }
.pm-reelStage { position: relative; width: min(100%, 440px); cursor: pointer; }
.pm-reelFrame { position: relative; width: 100%; border-radius: 6px; overflow: hidden; background: var(--pm-film);
  border-left: 22px solid var(--pm-film); border-right: 22px solid var(--pm-film); box-shadow: 0 30px 60px -30px rgba(0,0,0,.8); }
.pm-reelFrame::before, .pm-reelFrame::after { content: ""; position: absolute; top: 0; bottom: 0; width: 22px; z-index: 4;
  background: repeating-linear-gradient(180deg, transparent 0 8px, rgba(255,255,255,.85) 8px 18px, transparent 18px 26px); background-size: 10px 26px; background-repeat: repeat-y; }
.pm-reelFrame::before { left: -16px; } .pm-reelFrame::after { right: -16px; }
.pm-reelShot { position: absolute; inset: 0; opacity: 0; transition: opacity .5s ease; }
.pm-reelShot.is-on { opacity: 1; }
.pm-reelKb { position: absolute; inset: 0; animation-timing-function: linear; animation-fill-mode: both; will-change: transform; }
.pm-reelShot:not(.is-on) .pm-reelKb { animation: none !important; }
@keyframes pm-kbA { from { transform: scale(1.02) translate(0, 0); } to { transform: scale(1.14) translate(-2%, -2%); } }
@keyframes pm-kbB { from { transform: scale(1.14) translate(2%, 1%); } to { transform: scale(1.03) translate(0, 0); } }
.pm-reelCap { position: absolute; left: 10px; right: 10px; bottom: 12px; margin: 0; z-index: 3; color: #fff; text-align: left;
  font: 600 14px/1.3 var(--vw-font-ui, system-ui), sans-serif; text-shadow: 0 2px 10px rgba(0,0,0,.8); }
.pm-reelGrain { position: absolute; inset: -20%; z-index: 2; opacity: .18; mix-blend-mode: overlay; pointer-events: none; animation: pm-grain .5s steps(4) infinite; }
.pm-reelFlicker { position: absolute; inset: 0; z-index: 2; pointer-events: none; background: rgba(255,240,210,.06); animation: pm-flick 3.1s steps(9) infinite; }
@keyframes pm-grain { 0% { transform: translate(0,0); } 25% { transform: translate(-5%,3%); } 50% { transform: translate(4%,-4%); } 75% { transform: translate(-3%,-2%); } }
@keyframes pm-flick { 0%, 100% { opacity: .2; } 30% { opacity: .5; } 60% { opacity: .1; } 80% { opacity: .4; } }
.pm-reelBar { height: 3px; margin-top: 10px; border-radius: 3px; background: rgba(255,255,255,.2); overflow: hidden; }
.pm-reelBar i { display: block; height: 100%; background: var(--vw-accent, #e2b44a); transition: width .4s ease; }
.pm-reelSkip { position: absolute; right: 0; top: -40px; min-height: 36px; padding: 0 14px; border-radius: 99px; border: 0; cursor: pointer;
  background: rgba(0,0,0,.45); color: #fff; font: 700 12px/1 var(--vw-font-ui, system-ui), sans-serif; }
.pm-reelStrip { display: grid; grid-auto-flow: column; grid-auto-columns: min(42vw, 180px); gap: 10px; width: 100%; overflow-x: auto; padding: 4px 16px 12px;
  scroll-snap-type: x mandatory; scrollbar-width: none; }
.pm-reelStrip::-webkit-scrollbar { display: none; }
.pm-reelCell { all: unset; cursor: pointer; scroll-snap-align: center; border-radius: 10px; overflow: hidden; border: 6px solid var(--pm-film); }
.pm-reelCell:focus-visible, .pm-reelSkip:focus-visible { outline: 3px solid var(--vw-accent, #e2b44a); outline-offset: 2px; }
@media (min-width: 1024px) { .pm-reelStage { width: min(100%, 520px); } .pm-reelStrip { justify-content: center; } }
.pm-reel.is-reduced .pm-reelKb, .pm-reel.is-reduced .pm-reelGrain, .pm-reel.is-reduced .pm-reelFlicker { animation: none !important; }
@media (prefers-reduced-motion: reduce) { .pm-reelKb, .pm-reelGrain, .pm-reelFlicker { animation: none !important; } }
`;
