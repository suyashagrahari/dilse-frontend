"use client";

// Chapter 2: behind each frame. The four frames, now big prints in a little
// pile. Tap the top print: it turns over (3D) to what's written on the back,
// the caption and the note, with the booth's paper watermark. Tap or swipe
// it away for the next one. The last one is "the kiss".

import { animate, motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { useState } from "react";
import { CroppedPhoto, haptic, useReducedMotion } from "../../../_valentine/kit";
import { PremiumCTA, sfx } from "../../../_valentine/kit/premium";
import type { LovePhoto } from "../../../_valentine/types";
import { LipPrint } from "./LipPrint";
import { FRAME_FILTER } from "./Strip";
import { clean, type Booth } from "./model";
import { CTA_STYLE, Eyebrow, Scene } from "./ui";

const TILTS = [-2.5, 3, -1.5, 2];

function Print({ ph, i, b, top, flipped, onTap, onToss }: { ph: LovePhoto | undefined; i: number; b: Booth; top: boolean; flipped: boolean; onTap: () => void; onToss: (dir: number) => void }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const rot = useTransform(x, [-240, 0, 240], [-16, TILTS[i], 16]);
  const caption = clean(ph?.caption) || (i === 3 ? "the kiss" : `frame ${i + 1}`);
  const note = clean(ph?.note);
  const end = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 600) onToss(info.offset.x < 0 ? -1 : 1);
    else animate(x, 0, { type: "spring", stiffness: 300, damping: 28 });
  };
  return (
    <motion.div
      className={`pb-print${top ? " is-top" : ""}`}
      style={{ x, rotate: rot, zIndex: 10 - i }}
      drag={top && !reduce ? "x" : false}
      dragSnapToOrigin={false}
      onDragEnd={end}
      initial={false}
      exit={{ x: 0 }}
    >
      <button type="button" className={`pb-flip${flipped ? " is-flipped" : ""}`} onClick={onTap} disabled={!top} aria-label={flipped ? `Next print` : `Turn over frame ${i + 1}`}>
        <span className="pb-face pb-front">
          {ph ? <CroppedPhoto photo={ph} eager style={{ filter: b.mono ? FRAME_FILTER.mono : FRAME_FILTER.colour }} /> : <span className="pb-frameEmpty" />}
          <span className="pb-gloss" aria-hidden />
        </span>
        <span className="pb-face pb-back" aria-hidden={!flipped}>
          <span className="pb-backMark" aria-hidden />
          <span className="pb-backNo">Frame {i + 1} of 4</span>
          <span className="pb-backCap">{caption}</span>
          {note && <span className="pb-backNote">{note}</span>}
          {i === 3 && <LipPrint color={b.S.c} lipstick={b.lipstick} size={66} seed={11} className="pb-backKiss" />}
        </span>
      </button>
    </motion.div>
  );
}

export default function FramesScene({ b, onNext }: { b: Booth; onNext: () => void }) {
  const [top, setTop] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [gone, setGone] = useState<Record<number, number>>({});
  const done = top >= 4;

  const toss = (dir: number) => {
    if (done) return;
    sfx("kpb-toss", { gain: 0.6, pan: dir * 0.5 });
    haptic(8);
    setGone((g) => ({ ...g, [top]: dir }));
    setFlipped(false);
    setTop((t) => t + 1);
  };
  const tap = () => {
    if (done) return;
    if (!flipped) {
      setFlipped(true);
      sfx("kpb-flip", { gain: 0.7 });
      haptic(10);
    } else toss(-1);
  };

  return (
    <Scene label="Behind each frame" className="pb-frames">
      <Eyebrow>{done ? "All four, read" : `Frame ${top + 1} of 4`}</Eyebrow>
      <h2 className="pb-h pb-framesH">{done ? <>Every one a <em>keeper.</em></> : <>What&rsquo;s on <em>the back.</em></>}</h2>
      <div className="pb-pile">
        {b.frames.map((ph, i) =>
          i in gone ? (
            <motion.div key={i} className="pb-print" style={{ zIndex: 20 }} initial={{ x: 0, rotate: TILTS[i], opacity: 1 }} animate={{ x: gone[i] * 520, rotate: gone[i] * 28, opacity: 0 }} transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }} aria-hidden>
              <span className="pb-flip is-flipped" style={{ pointerEvents: "none" }}>
                <span className="pb-face pb-back"><span className="pb-backCap">{clean(ph?.caption) || " "}</span></span>
              </span>
            </motion.div>
          ) : (
            <Print key={i} ph={ph} i={i} b={b} top={i === top} flipped={i === top && flipped} onTap={tap} onToss={toss} />
          ),
        )}
        {done && (
          <div className="pb-spread" aria-label="All four frames">
            {b.frames.map((ph, i) => (
              <span key={i} className="pb-spreadItem" style={{ ["--i" as string]: i, ["--t" as string]: `${TILTS[i] * 1.6}deg` }}>
                {ph ? <CroppedPhoto photo={ph} eager style={{ filter: b.mono ? FRAME_FILTER.mono : FRAME_FILTER.colour }} /> : <span className="pb-frameEmpty" />}
                <span className="pb-spreadCap">{clean(ph?.caption) || (i === 3 ? "the kiss" : "")}</span>
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="pb-foot">
        {done ? (
          <PremiumCTA style={CTA_STYLE} tone="pearl" onClick={onNext}>Next</PremiumCTA>
        ) : (
          <button type="button" className="pb-quiet" onClick={tap}>
            {flipped ? "Next print ›" : "Turn it over ›"}
          </button>
        )}
      </div>
      <style>{CSS}</style>
    </Scene>
  );
}

const CSS = `
.pb-framesH { margin-top: 12px; font-size: clamp(34px, 9.6vw, 64px); min-height: 1em; }
.pb-pile { position: relative; flex: 1; width: 100%; display: grid; place-items: center; min-height: 300px; margin-top: 18px; }
.pb-print { position: absolute; perspective: 1400px; width: min(84vw, 560px, calc((100svh - 330px) * 1.25)); aspect-ratio: 4 / 3.3; touch-action: pan-y; }
.pb-print:not(.is-top) { pointer-events: none; }
.pb-flip { all: unset; display: block; position: relative; width: 100%; height: 100%; cursor: pointer; transform-style: preserve-3d;
  transition: transform .9s cubic-bezier(.22,1,.36,1); -webkit-tap-highlight-color: transparent; }
.pb-flip.is-flipped { transform: rotateY(180deg); }
.pb-flip:focus-visible { outline: 3px solid var(--pb-shade-hi); outline-offset: 6px; }
.pb-face { position: absolute; inset: 0; -webkit-backface-visibility: hidden; backface-visibility: hidden; border-radius: 6px; overflow: hidden;
  box-shadow: 0 1px 0 rgba(255,255,255,.6) inset, 0 34px 60px -26px rgba(0,0,0,.9), 0 10px 22px -12px rgba(0,0,0,.6); }
.pb-front { background: #F7F2E8; padding: 4.2%; box-sizing: border-box; }
.pb-front > span:first-child { border-radius: 2px; }
.pb-front .pb-gloss { inset: 4.2%; }
.pb-back { transform: rotateY(180deg); background: linear-gradient(180deg, #F8F4EC, #EFE8DA); color: #2a1f20; display: grid; align-content: center; justify-items: center; gap: 10px; padding: 8% 10%; box-sizing: border-box; text-align: center; }
.pb-backMark { position: absolute; inset: -20%; transform: rotate(-24deg); opacity: .045; pointer-events: none; }
.pb-backMark::before { content: "PHOTO BOOTH · PHOTO BOOTH · PHOTO BOOTH · PHOTO BOOTH · PHOTO BOOTH · PHOTO BOOTH · PHOTO BOOTH · PHOTO BOOTH · PHOTO BOOTH · PHOTO BOOTH · PHOTO BOOTH · PHOTO BOOTH · PHOTO BOOTH · PHOTO BOOTH · PHOTO BOOTH · PHOTO BOOTH · PHOTO BOOTH · PHOTO BOOTH";
  position: absolute; inset: 0; font: 700 12px/30px var(--pb-mono); letter-spacing: .3em; color: #000; word-break: break-all; }
.pb-backNo { position: relative; font: 700 10px/1 var(--pb-mono); letter-spacing: .3em; text-transform: uppercase; color: #9a2230; }
.pb-backCap { position: relative; font: 400 clamp(26px, 7.4vw, 44px)/1.02 var(--pb-display); letter-spacing: -.01em; text-wrap: balance; }
.pb-backNote { position: relative; font: 400 13.5px/1.55 var(--pb-mono); color: #5a4a4b; max-width: 30ch; text-wrap: pretty; }
.pb-backKiss { position: absolute; right: 8%; bottom: 9%; transform: rotate(-12deg); mix-blend-mode: multiply; }
.pb-spread { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; width: min(88vw, 560px); }
.pb-spreadItem { position: relative; display: grid; gap: 0; padding: 6px 6px 0; background: #F7F2E8; border-radius: 3px; transform: rotate(var(--t));
  box-shadow: 0 22px 40px -22px rgba(0,0,0,.95); animation: pb-deal .8s calc(var(--i) * 120ms) var(--pb-ease) both; }
.pb-spreadItem > span:first-child { aspect-ratio: 4 / 3; height: auto !important; }
.pb-spreadCap { display: block; min-height: 30px; padding: 7px 4px 8px; font: 400 15px/1.1 var(--pb-display); color: #2a1f20; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
@keyframes pb-deal { from { opacity: 0; transform: translateY(40px) rotate(0deg) scale(.9); } to { opacity: 1; transform: rotate(var(--t)); } }
@media (prefers-reduced-motion: reduce) { .pb-flip { transition: none; } }
`;
