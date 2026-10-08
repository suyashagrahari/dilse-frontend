"use client";

// Room 3 — The Portrait Gallery. Their photos hang down a long corridor as
// sepia, cracked "paintings" in gilded frames. Tap one and it wakes: a flash
// of lightning (a soft candle bloom for family/kids and reduced motion), the
// colour floods back, a slow living drift, a glint in the eyes, and the brass
// plaque whispers its caption. After three, the whole gallery remembers: the
// kit's montage (<FilmReel>) dressed as a gilded frame, to the song.

import { useEffect, useState, type ReactNode } from "react";
import { sfx, FilmReel } from "../../../_valentine/kit/premium";
import { CroppedPhoto, PhotoLightbox, haptic, useReducedMotion } from "../../../_valentine/kit";
import type { LovePhoto } from "../../../_valentine/types";
import { BOOK, ENGRAVED } from "./fonts";
import type { Manor } from "./model";
import { Gilded, Hint, Kicker, Room, RoomTitle } from "./ui";

export default function Gallery({ m, photos, aspect, sticker, onWoken, onNext }: { m: Manor; photos: LovePhoto[]; aspect: number; sticker: ReactNode; onWoken: (n: number) => void; onNext: () => void }) {
  const reduce = useReducedMotion();
  const list = photos.filter((ph) => ph && ph.url).slice(0, 12);
  const need = Math.min(3, list.length);
  const [woke, setWoke] = useState<number[]>([]);
  const [flash, setFlash] = useState<number | null>(null);
  const [phase, setPhase] = useState<"hall" | "remember" | "done">("hall");
  const [box, setBox] = useState<number | null>(null);
  const soft = m.gentle || reduce;

  useEffect(() => onWoken(woke.length), [woke.length, onWoken]);

  const wake = (i: number) => {
    if (woke.includes(i)) {
      setBox(i);
      return;
    }
    setWoke((w) => [...w, i]);
    setFlash(i);
    haptic(14);
    sfx(soft ? "mm-glow" : "mm-zap", { gain: 0.8 });
    if (list[i].caption) sfx("mm-whisper", { at: 0.55, gain: 0.7 });
    window.setTimeout(() => setFlash((f) => (f === i ? null : f)), 700);
  };

  if (phase !== "hall") {
    return (
      <Room label="The gallery remembers" className="mm-galleryReel">
        <Kicker>The gallery remembers</Kicker>
        <RoomTitle>Every portrait of us</RoomTitle>
        <div className="mm-reelWrap">
          <FilmReel photos={list} aspect={aspect} perPhotoMs={2300} film="#2A1A0C" onDone={() => setPhase("done")} />
        </div>
        {phase === "done" ? (
          <Gilded big onClick={() => { sfx("whoosh", { gain: 0.5 }); onNext(); }}>Follow the whispers →</Gilded>
        ) : (
          <Hint>The portraits are remembering…</Hint>
        )}
        <style>{CSS}</style>
      </Room>
    );
  }

  return (
    <Room label="The portrait gallery" className="mm-gallery">
      <Kicker>The portrait gallery</Kicker>
      <RoomTitle>Wake the portraits</RoomTitle>
      <p className="mm-galSub" style={{ fontFamily: BOOK }}>
        {woke.length < need ? `Touch a frame. ${woke.length} of ${need} awake.` : "They're awake. Tap one again to look closer."}
      </p>
      <div className="mm-corridor" role="list">
        {list.map((ph, i) => {
          const on = woke.includes(i);
          return (
            <div key={i} role="listitem" className="mm-portraitCell">
              <button
                type="button"
                className={`mm-portrait${on ? " is-awake" : ""}${flash === i ? (soft ? " is-bloom" : " is-zap") : ""}`}
                onClick={() => wake(i)}
                aria-label={on ? `Portrait ${i + 1}${ph.caption ? `: ${ph.caption}` : ""} — open it` : `Wake portrait ${i + 1}`}
              >
                <span className="mm-portraitIn" style={{ aspectRatio: String(aspect) }}>
                  <span className={`mm-portraitKb ${i % 2 ? "kb-b" : "kb-a"}`}>
                    <CroppedPhoto photo={ph} eager={i < 3} />
                  </span>
                  <span className="mm-crack" aria-hidden />
                  <span className="mm-glint" aria-hidden />
                </span>
              </button>
              <span className="mm-brass" style={{ fontFamily: ENGRAVED }}>{on ? ph.caption || `No. ${i + 1}` : "· · ·"}</span>
              {on && ph.note && <span className="mm-whisperLine" style={{ fontFamily: BOOK }}>{ph.note}</span>}
              {i === list.length - 1 && <span className="mm-peekPortrait">{sticker}</span>}
            </div>
          );
        })}
      </div>
      {woke.length >= need ? (
        <Gilded big onClick={() => { sfx("mm-whisper", { gain: 0.6 }); setPhase("remember"); }}>▶ Let the gallery remember</Gilded>
      ) : (
        <Hint>Swipe along the corridor · tap to wake</Hint>
      )}
      <PhotoLightbox photos={list} index={box} onIndex={setBox} onClose={() => setBox(null)} />
      <style>{CSS}</style>
    </Room>
  );
}

const CSS = `
.mm-gallery { gap: 10px; }
.mm-galSub { margin: 0; font-size: 16px; font-style: italic; color: var(--vw-ink-soft); }
.mm-corridor { display: grid; grid-auto-flow: column; grid-auto-columns: min(58vw, 220px); gap: 22px; width: calc(100% + 32px); margin: 6px -16px 4px;
  padding: 14px max(16px, calc(50% - 110px)) 18px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; box-sizing: border-box; }
.mm-corridor::-webkit-scrollbar { display: none; }
.mm-portraitCell { position: relative; scroll-snap-align: center; display: grid; justify-items: center; align-content: start; gap: 8px; }
.mm-portrait { all: unset; cursor: pointer; display: block; width: 100%; padding: 12px; box-sizing: border-box; border-radius: 6px; position: relative;
  background: linear-gradient(135deg, #F4D58D 0%, #B9832E 22%, #FBE3A0 40%, #8E5D1A 62%, #E9B95A 80%, #7A4E14 100%);
  box-shadow: inset 0 0 0 3px rgba(60,35,8,.55), inset 0 0 0 7px rgba(255,236,180,.35), 0 18px 34px -12px rgba(0,0,0,.75), 0 0 0 1px #3A240A;
  -webkit-tap-highlight-color: transparent; transition: transform .4s cubic-bezier(.22,1,.36,1); }
.mm-portrait:active { transform: scale(.98); }
.mm-portrait:focus-visible { outline: 3px solid var(--vw-gold); outline-offset: 4px; }
.mm-portraitIn { position: relative; display: block; width: 100%; overflow: hidden; box-shadow: inset 0 0 0 2px rgba(0,0,0,.6); background: #1a120a; }
.mm-portraitKb { position: absolute; inset: 0; display: block; filter: sepia(.95) contrast(.92) brightness(.72) saturate(.55); transition: filter 1.6s ease; }
.mm-portrait.is-awake .mm-portraitKb { filter: none; animation: mm-kbA 14s ease-in-out infinite alternate; }
.mm-portrait.is-awake .mm-portraitKb.kb-b { animation-name: mm-kbB; }
@keyframes mm-kbA { from { transform: scale(1.02); } to { transform: scale(1.12) translate(-2%, -2%); } }
@keyframes mm-kbB { from { transform: scale(1.12) translate(2%, 1%); } to { transform: scale(1.02); } }
.mm-crack { position: absolute; inset: 0; pointer-events: none; transition: opacity 1.2s ease; opacity: .85;
  background: linear-gradient(115deg, transparent 47%, rgba(30,18,6,.55) 47.5%, transparent 48.3%), linear-gradient(35deg, transparent 63%, rgba(30,18,6,.45) 63.4%, transparent 64%),
  radial-gradient(120% 90% at 50% 40%, transparent 50%, rgba(40,22,6,.55) 100%); }
.mm-portrait.is-awake .mm-crack { opacity: .12; }
.mm-glint { position: absolute; left: 40%; top: 32%; width: 10px; height: 10px; border-radius: 50%; opacity: 0;
  background: radial-gradient(circle, #fff, rgba(255,255,255,0) 70%); }
.mm-portrait.is-awake .mm-glint { animation: mm-glint 4.5s ease-in-out 1.2s infinite; }
@keyframes mm-glint { 0%, 80%, 100% { opacity: 0; transform: scale(.4); } 86% { opacity: 1; transform: scale(1.4); } }
.mm-portrait.is-zap::after, .mm-portrait.is-bloom::after { content: ""; position: absolute; inset: -30px; border-radius: 20px; pointer-events: none; }
.mm-portrait.is-zap::after { background: radial-gradient(circle, rgba(235,240,255,.95), rgba(200,210,255,0) 70%); animation: mm-zap .6s ease-out forwards; }
.mm-portrait.is-bloom::after { background: radial-gradient(circle, rgba(255,214,140,.8), rgba(255,200,107,0) 70%); animation: mm-bloom .9s ease-out forwards; }
@keyframes mm-zap { 0% { opacity: 0; } 8% { opacity: 1; } 22% { opacity: .2; } 32% { opacity: .85; } 100% { opacity: 0; } }
@keyframes mm-bloom { 0% { opacity: 0; } 30% { opacity: 1; } 100% { opacity: 0; } }
.mm-brass { min-height: 28px; max-width: 100%; box-sizing: border-box; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
  color: #2A1A06; background: linear-gradient(180deg, #F4D58D, #B9832E); box-shadow: 0 4px 10px rgba(0,0,0,.45); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mm-whisperLine { font-size: 15px; line-height: 1.35; font-style: italic; color: #E8E1FF; animation: mm-memIn 1.2s ease both; text-wrap: balance; }
.mm-peekPortrait { position: absolute; right: -26px; top: -18px; transform: rotate(10deg); }
.mm-reelWrap { width: 100%; }
.mm-reelWrap .pm-reelFrame { border-left-color: #2A1A0C; border-right-color: #2A1A0C; border-radius: 4px;
  box-shadow: 0 0 0 10px #B9832E, 0 0 0 13px #3A240A, 0 0 0 16px #E9B95A, 0 30px 60px -20px rgba(0,0,0,.85); }
.mm-reelWrap .pm-reelFrame::before, .mm-reelWrap .pm-reelFrame::after { display: none; }
.mm-reelWrap .pm-reelStage { margin: 22px auto 6px; width: min(78vw, 360px); }
.mm-reelWrap .pm-reelCap { font-family: ${BOOK}; font-style: italic; font-size: 17px; }
.mm-reelWrap .pm-reelBar i { background: #E9B95A; }
.mm-reelWrap .pm-reelBar { margin-top: 26px; }
.mm-reelWrap .pm-reelSkip { top: auto; bottom: -58px; right: 0; background: rgba(11,10,20,.6); border: 1px solid rgba(233,185,90,.4); min-height: 40px; }
.mm-galleryReel .mm-hint, .mm-galleryReel .mm-btn { margin-top: 30px; }
.mm-reelWrap .pm-reelCell { border-color: #B9832E; }
@media (prefers-reduced-motion: reduce) { .mm-portrait.is-awake .mm-portraitKb, .mm-portrait.is-awake .mm-glint { animation: none; } }
`;
