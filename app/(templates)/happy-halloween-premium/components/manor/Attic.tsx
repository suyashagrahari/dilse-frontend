"use client";

// Room 6 — The attic letter. Moonlight through a round window, a blank sheet
// of parchment and a candle. The letter is written in invisible ink: sweep
// the candle back and forth beneath the page and the words burn in, top to
// bottom, with a glowing brown edge (the page scrolls itself to follow). Past
// 60% — or any time, "Light the lamp" — the whole letter shows. The full text
// is in the DOM from the start (screen readers read it at once). A second
// envelope, sealed in black wax, holds the P.S.

import { useEffect, useRef, useState } from "react";
import { sfx, usePremium } from "../../../_valentine/kit/premium";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { Candle } from "./art";
import { BOOK, ENGRAVED, SCRIPT } from "./fonts";
import type { Manor } from "./model";
import { Gilded, Hint, Kicker, Quiet, Room, RoomTitle } from "./ui";

export default function Attic({ m, letter, onNext }: { m: Manor; letter: string; onNext: () => void }) {
  const p = usePremium();
  const reduce = useReducedMotion();
  const [warm, setWarm] = useState(0.035);
  const [cx, setCx] = useState(0.5);
  const [moving, setMoving] = useState(false);
  const [psOpen, setPsOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const ink = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; rustle: number } | null>(null);
  const full = warm >= 1;
  const ps = p.premium.psLetter;

  // Keep the burning edge in view inside the scrolling page.
  useEffect(() => {
    const b = box.current;
    const t = ink.current;
    if (!b || !t || full) return;
    const edge = warm * t.scrollHeight;
    const want = Math.max(0, edge - b.clientHeight * 0.6);
    if (want > b.scrollTop) b.scrollTop = want;
  }, [warm, full]);

  const lamp = () => {
    if (full) return;
    sfx("flame-whoosh", { gain: 0.7 });
    sfx("paper-rustle", { at: 0.2, gain: 0.6 });
    haptic(12);
    if (reduce) {
      setWarm(1);
      return;
    }
    const start = warm;
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / 1400);
      setWarm(start + (1 - start) * k);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const onDown = (e: React.PointerEvent) => {
    if (full) return;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, rustle: 0 };
    setMoving(true);
    const r = track.current?.getBoundingClientRect();
    if (r) setCx(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)));
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const r = track.current?.getBoundingClientRect();
    if (!d || !r || full) return;
    setCx(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)));
    const dx = Math.abs(e.clientX - d.x);
    d.x = e.clientX;
    const len = letter.length;
    const per = len > 1400 ? 4.2 : len > 600 ? 3.2 : 2.4; // sweeps needed
    setWarm((w) => {
      const n = Math.min(1, w + dx / (r.width * per));
      return n >= 0.995 ? 1 : n;
    });
    const now = performance.now();
    if (now - d.rustle > 320 && dx > 1) {
      d.rustle = now;
      sfx("paper-rustle", { gain: 0.35 });
    }
  };
  const onUp = () => {
    drag.current = null;
    setMoving(false);
  };

  return (
    <Room label="The attic letter" className="mm-attic">
      <Kicker>The attic</Kicker>
      <RoomTitle>{full ? "For your eyes only" : "Warm the ink"}</RoomTitle>

      <div ref={box} className="mm-parch" tabIndex={0} aria-label="The letter">
        <div ref={ink} className={`mm-ink${full ? " is-full" : ""}`} style={{ ["--w" as string]: String(warm) }}>
          <p className="mm-dear" style={{ fontFamily: SCRIPT }}>Dear {m.recipient},</p>
          <div className="mm-letter" style={{ fontFamily: BOOK }}>{letter}</div>
          <p className="mm-sign" style={{ fontFamily: SCRIPT }}>— {m.sender}</p>
          {!full && <span className="mm-burn" aria-hidden />}
        </div>
      </div>

      {!full ? (
        <>
          <div ref={track} className={`mm-candleTrack${moving ? " is-moving" : ""}`} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} role="img" aria-label="A candle under the page. Drag it left and right to warm the ink.">
            <span className="mm-glowTrack" style={{ left: `${cx * 100}%` }} />
            <span className="mm-candleOn" style={{ left: `${cx * 100}%` }}>
              <Candle lit h={46} />
            </span>
          </div>
          <Hint>{warm < 0.08 ? "Sweep the candle under the page" : `${Math.round(warm * 100)}% · keep it warm`}</Hint>
          <Quiet onClick={lamp}>{warm >= 0.6 ? "Light the lamp ✦" : "Light the lamp"}</Quiet>
        </>
      ) : (
        <>
          {ps && (
            <button type="button" className={`mm-ps${psOpen ? " is-open" : ""}`} onClick={() => { if (!psOpen) { sfx("wax-crack", { gain: 0.7 }); sfx("mm-flap", { at: 0.15, gain: 0.6 }); setPsOpen(true); } }} aria-expanded={psOpen}>
              {!psOpen ? (
                <span className="mm-psShut">
                  <span className="mm-psWax" aria-hidden>✦</span>
                  <span style={{ fontFamily: ENGRAVED }}>{m.T.psSeal}</span>
                </span>
              ) : (
                <span className="mm-psText" style={{ fontFamily: BOOK }}>{ps}</span>
              )}
            </button>
          )}
          <Gilded big onClick={() => { sfx("bubble", { count: 3, gain: 0.6 }); onNext(); }}>Down to the witch's kitchen →</Gilded>
        </>
      )}
      <style>{CSS}</style>
    </Room>
  );
}

const CSS = `
.mm-attic { gap: 12px; }
.mm-parch { position: relative; width: 100%; max-width: 480px; max-height: min(50vh, 460px); overflow-y: auto; overscroll-behavior: contain; box-sizing: border-box;
  padding: 22px 22px 26px; border-radius: 6px; text-align: left; color: #3B2414; scrollbar-width: thin;
  background: radial-gradient(120% 90% at 50% 40%, #F7EDD6 0%, #EADBB8 70%, #D9C49A 100%);
  box-shadow: 0 30px 60px -24px rgba(0,0,0,.85), inset 0 0 40px rgba(120,80,30,.25); }
.mm-parch:focus-visible { outline: 3px solid var(--vw-gold); outline-offset: 3px; }
.mm-ink { position: relative; -webkit-mask-image: linear-gradient(180deg, #000 0, #000 calc(var(--w) * 100%), rgba(0,0,0,.018) calc(var(--w) * 100% + 80px));
  mask-image: linear-gradient(180deg, #000 0, #000 calc(var(--w) * 100%), rgba(0,0,0,.018) calc(var(--w) * 100% + 80px)); }
.mm-ink.is-full { -webkit-mask-image: none; mask-image: none; }
.mm-dear { margin: 0 0 10px; font-size: 26px; color: #4A2A12; }
.mm-letter { white-space: pre-wrap; font-size: 18.5px; line-height: 1.6; color: #3B2414; overflow-wrap: anywhere; user-select: text; -webkit-user-select: text; }
.mm-sign { margin: 14px 0 0; text-align: right; font-size: 28px; color: #4A2A12; }
.mm-burn { position: absolute; left: -8px; right: -8px; top: calc(var(--w) * 100%); height: 36px; margin-top: -10px; pointer-events: none;
  background: radial-gradient(60% 50% at 50% 50%, rgba(255,160,60,.45), rgba(150,70,20,.15) 60%, transparent 80%); mix-blend-mode: multiply; filter: blur(2px);
  animation: mm-burn 1.2s ease-in-out infinite alternate; }
@keyframes mm-burn { from { opacity: .55; } to { opacity: 1; } }
.mm-candleTrack { position: relative; width: min(100%, 440px); height: 92px; touch-action: none; cursor: grab; border-radius: 16px;
  background: linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,.06)); border: 1px dashed rgba(255,200,107,.35); }
.mm-candleTrack.is-moving { cursor: grabbing; }
.mm-candleOn { position: absolute; bottom: 4px; transform: translateX(-50%); pointer-events: none; transition: left .06s linear; }
.mm-glowTrack { position: absolute; top: -60px; width: 200px; height: 160px; margin-left: -100px; pointer-events: none; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,200,107,.35), rgba(255,200,107,0) 65%); transition: left .06s linear; }
.mm-ps { all: unset; cursor: pointer; width: min(100%, 440px); box-sizing: border-box; border-radius: 10px; -webkit-tap-highlight-color: transparent; }
.mm-ps:focus-visible { outline: 3px solid var(--vw-gold); outline-offset: 3px; }
.mm-psShut { display: flex; align-items: center; gap: 14px; padding: 16px 18px; border-radius: 10px; background: linear-gradient(135deg, #17121F, #0E0B14);
  border: 1px solid rgba(233,185,90,.5); color: #F4D58D; font-size: 13px; letter-spacing: .14em; text-transform: uppercase; box-shadow: 0 14px 30px -14px rgba(0,0,0,.8); }
.mm-psWax { flex: none; display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; color: #F4D58D; font-size: 16px;
  background: radial-gradient(circle at 36% 30%, #3A3046, #0B0910 70%); box-shadow: inset 0 -3px 0 rgba(0,0,0,.4), 0 0 0 2px rgba(233,185,90,.35); }
.mm-psText { display: block; padding: 18px 20px; border-radius: 10px; background: #F7EDD6; color: #3B2414; font-size: 18px; line-height: 1.55; white-space: pre-wrap; text-align: left;
  animation: mm-memIn 1s ease both; box-shadow: 0 20px 40px -20px rgba(0,0,0,.8); user-select: text; -webkit-user-select: text; }
@media (prefers-reduced-motion: reduce) { .mm-burn { animation: none; } }
`;
