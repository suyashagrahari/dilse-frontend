"use client";

// Room 2 — The Foyer of Candles. Drag the match across the matchbox's strip
// (or tap "Strike the match"), then touch each wick: every flame warms the
// room a little more and writes one memory onto the wallpaper in light. The
// chimes climb a minor triad candle by candle.

import { useRef, useState, type ReactNode } from "react";
import { sfx } from "../../../_valentine/kit/premium";
import { haptic } from "../../../_valentine/kit";
import { Candle } from "./art";
import { BOOK } from "./fonts";
import type { Manor } from "./model";
import { Gilded, Hint, Kicker, Quiet, Room, RoomTitle } from "./ui";

const LADDER = [0, 300, 700, 1200, 1500];

export default function Foyer({ m, sticker, onWarm, onNext }: { m: Manor; sticker: ReactNode; onWarm: (w: number, lit: number) => void; onNext: () => void }) {
  const n = m.candles.length;
  const [match, setMatch] = useState(false);
  const [lit, setLit] = useState<boolean[]>(() => Array(n).fill(false));
  const [order, setOrder] = useState<number[]>([]);
  const [strikeX, setStrikeX] = useState(0);
  const drag = useRef<{ x: number; max: number } | null>(null);
  const count = lit.filter(Boolean).length;
  const all = count === n;

  const strike = () => {
    if (matchRef.current && match) return;
    matchRef.current = true;
    setMatch(true);
    haptic(12);
    sfx("match-strike");
  };

  // Read through a ref so the "light them all" timeouts never see stale state.
  const litRef = useRef(lit);
  const matchRef = useRef(match);
  const light = (i: number) => {
    if (litRef.current[i]) return;
    const late = !matchRef.current;
    if (late) strike();
    matchRef.current = true;
    const next = litRef.current.map((v, k) => (k === i ? true : v));
    litRef.current = next;
    setLit(next);
    setOrder((o) => [...o, i]);
    const c = next.filter(Boolean).length;
    sfx("flame-whoosh", { gain: 0.8, at: late ? 0.2 : 0 });
    sfx("chime", { detune: LADDER[(c - 1) % LADDER.length] - 1200, at: late ? 0.32 : 0.12, gain: 0.8 });
    haptic(8);
    onWarm(c / n, c);
  };

  const lightAll = () => {
    if (!matchRef.current) {
      strike();
      matchRef.current = true;
    }
    const idx = litRef.current.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
    idx.forEach((i, k) => window.setTimeout(() => light(i), 280 * k + 250));
  };

  const onDown = (e: React.PointerEvent) => {
    if (match) return;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, max: 0 };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || match) return;
    const dx = Math.abs(e.clientX - d.x);
    d.max = Math.max(d.max, dx);
    setStrikeX(Math.min(1, dx / 90));
    if (d.max > 80) {
      drag.current = null;
      strike();
    }
  };
  const onUp = () => {
    drag.current = null;
    if (!match) setStrikeX(0);
  };

  return (
    <Room label="The foyer of candles" className="mm-foyer">
      <Kicker>The foyer</Kicker>
      <RoomTitle>Light the candles</RoomTitle>

      <ol className="mm-mems" aria-live="polite">
        {order.map((i) => (
          <li key={i} className="mm-mem" style={{ fontFamily: BOOK }}>
            {m.candles[i]}
          </li>
        ))}
        {order.length === 0 && <li className="mm-mem is-ghost" style={{ fontFamily: BOOK }}>Each flame remembers something.</li>}
      </ol>

      <div className="mm-cand" style={{ ["--n" as string]: n }}>
        <svg className="mm-candArm" viewBox="0 0 300 80" preserveAspectRatio="none" aria-hidden>
          <path d="M20 10 Q150 70 280 10" stroke="#C9973E" strokeWidth="6" fill="none" />
          <path d="M150 40 L150 80" stroke="#C9973E" strokeWidth="8" />
        </svg>
        {m.candles.map((mem, i) => (
          <button
            key={i}
            type="button"
            className={`mm-candBtn${lit[i] ? " is-lit" : ""}`}
            onClick={() => light(i)}
            aria-label={lit[i] ? `Candle ${i + 1}, lit: ${mem}` : `Light candle ${i + 1}`}
            aria-pressed={lit[i]}
            style={{ marginTop: Math.abs(i - (n - 1) / 2) * 10 }}
          >
            <Candle lit={lit[i]} h={70 + ((i * 13) % 3) * 10} delay={i * 170} />
          </button>
        ))}
        <span className="mm-candSticker">{sticker}</span>
      </div>

      {!match ? (
        <>
          <div className="mm-matchbox" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} role="img" aria-label="A matchbox. Drag the match across the strip.">
            <span className="mm-strip" />
            <span className="mm-match" style={{ transform: `translateX(${strikeX * 120}px) rotate(-8deg)` }}>
              <i />
            </span>
            <span className="mm-boxLabel">SAFETY MATCHES · {m.manorName.toUpperCase()}</span>
          </div>
          <Hint>Drag the match across the strip</Hint>
          <Quiet onClick={strike}>Strike the match</Quiet>
        </>
      ) : all ? (
        <Gilded big onClick={() => { sfx("whoosh", { gain: 0.5 }); onNext(); }}>Into the gallery →</Gilded>
      ) : (
        <>
          <Hint>{count === 0 ? "The match is lit — touch each wick" : `${n - count} more ${n - count === 1 ? "candle" : "candles"}`}</Hint>
          <Quiet onClick={lightAll}>Light them all</Quiet>
        </>
      )}
      <style>{CSS}</style>
    </Room>
  );
}

const CSS = `
.mm-mems { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; width: 100%; max-width: 440px; min-height: 64px; }
.mm-mem { font-size: clamp(17px, 4.6vw, 20px); line-height: 1.35; font-style: italic; color: #FFE6B0;
  text-shadow: 0 0 16px rgba(255,200,107,.65), 0 0 2px rgba(255,200,107,.8); animation: mm-memIn 1.2s cubic-bezier(.22,1,.36,1) both; text-wrap: balance; }
.mm-mem.is-ghost { color: var(--vw-ink-soft); text-shadow: none; opacity: .7; animation: none; }
@keyframes mm-memIn { from { opacity: 0; filter: blur(6px); transform: translateY(8px); } to { opacity: 1; filter: none; transform: none; } }
.mm-cand { position: relative; display: flex; justify-content: center; align-items: flex-start; gap: clamp(6px, 3vw, 18px); padding: 0 12px 54px; margin-top: 4px; }
.mm-candArm { position: absolute; left: 6%; right: 6%; bottom: 0; height: 80px; width: 88%; pointer-events: none; }
.mm-candBtn { all: unset; cursor: pointer; position: relative; min-width: 44px; display: grid; justify-items: center; -webkit-tap-highlight-color: transparent; }
.mm-candBtn:focus-visible { outline: 3px solid var(--vw-gold); outline-offset: 4px; border-radius: 10px; }
.mm-candBtn:not(.is-lit)::after { content: ""; position: absolute; top: 18px; left: 50%; width: 12px; height: 12px; margin-left: -6px; border-radius: 50%;
  box-shadow: 0 0 0 2px rgba(255,200,107,.5); animation: mm-wick 1.8s ease-out infinite; }
@keyframes mm-wick { from { transform: scale(.6); opacity: 1; } to { transform: scale(2.2); opacity: 0; } }
.mm-flame { opacity: 0; transform: scale(.2); transition: opacity .35s ease, transform .5s cubic-bezier(.3,1.6,.5,1); }
.mm-flame.is-lit { opacity: 1; transform: scale(1); animation: mm-flicker 1.6s ease-in-out infinite; }
@keyframes mm-flicker { 0%, 100% { transform: scale(1) skewX(0deg); } 30% { transform: scale(1.04, .96) skewX(2deg); } 60% { transform: scale(.97, 1.04) skewX(-2deg); } }
.mm-candSticker { position: absolute; right: -10px; bottom: 6px; }
.mm-matchbox { position: relative; width: min(280px, 80vw); height: 64px; border-radius: 10px; touch-action: none; cursor: grab;
  background: linear-gradient(180deg, #7A1E2C, #4A0F19); border: 2px solid #C9973E; box-shadow: 0 12px 26px -10px rgba(0,0,0,.7); }
.mm-strip { position: absolute; left: 10px; right: 10px; bottom: 8px; height: 12px; border-radius: 4px;
  background: repeating-linear-gradient(90deg, #3A2418 0 3px, #5A3A26 3px 6px); }
.mm-match { position: absolute; left: 12px; bottom: 22px; width: 110px; height: 7px; border-radius: 4px; background: #E9D2A0; transform-origin: 0 50%; transition: transform .2s; }
.mm-match i { position: absolute; right: -6px; top: -3px; width: 14px; height: 13px; border-radius: 50%; background: radial-gradient(circle at 40% 40%, #E85A4F, #8E1F1F); }
.mm-boxLabel { position: absolute; left: 0; right: 0; top: 8px; text-align: center; font: 700 9.5px/1 var(--font-mm-engraved), serif; letter-spacing: .16em; color: #F4D58D; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 10px; }
@media (prefers-reduced-motion: reduce) { .mm-flame.is-lit, .mm-candBtn::after { animation: none; } .mm-mem { animation: none; } }
`;
