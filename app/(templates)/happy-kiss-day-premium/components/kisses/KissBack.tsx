"use client";

// Room 6 — Kiss me back (mini-game 2). "Your turn. Kiss the screen. (Or use
// your thumb. We won't tell.)" A long press (600 ms) anywhere on the glass
// leaves a lipstick print right there, with a ripple, a big reverb-tailed
// mwah and a burst of hearts. A wide contact patch (pointer width ≥ 36 px)
// gets "…that was definitely lips 😳". After 1–3 kisses: send them —
// react("answered", { count }) — the prints gather into a wax SWAK seal with
// both initials. Keyboard / no-hold fallback: "Leave a kiss".

import { useRef, useState, type ReactNode } from "react";
import { sfx } from "../../../_valentine/kit/premium";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { Lips } from "./art";
import { HAND, SERIF } from "./fonts";
import { initialOf, type Kisses } from "./model";
import { Hint, Kicker, Quiet, Room, Satin, Title } from "./ui";

type Print = { x: number; y: number; rot: number; id: number };

export default function KissBack({ k, sticker, onSent, onNext }: { k: Kisses; sticker: ReactNode; onSent: (count: number) => void; onNext: () => void }) {
  const reduce = useReducedMotion();
  const [prints, setPrints] = useState<Print[]>([]);
  const [lips, setLips] = useState(false);
  const [sent, setSent] = useState(false);
  const [pressing, setPressing] = useState<{ x: number; y: number } | null>(null);
  const arena = useRef<HTMLDivElement>(null);
  const timer = useRef<number | null>(null);
  const nextId = useRef(1);

  const place = (x: number, y: number, big: boolean) => {
    if (sent) return;
    setPrints((ps) => (ps.length >= 3 ? ps : [...ps, { x, y, rot: Math.random() * 30 - 15, id: nextId.current++ }]));
    sfx("kd-screenkiss", { gain: 0.9 });
    sfx("kd-ripple", { at: 0.05, gain: 0.7 });
    haptic([18, 30, 12]);
    const r = arena.current?.getBoundingClientRect();
    if (r && !reduce) burst({ kind: "hearts", emojis: ["💋", "💗", "💖"], origin: { x: (r.left + (x / 100) * r.width) / window.innerWidth, y: (r.top + (y / 100) * r.height) / window.innerHeight }, count: 18 });
    if (big) setLips(true);
  };

  const down = (e: React.PointerEvent) => {
    if (sent || prints.length >= 3) return;
    const r = arena.current?.getBoundingClientRect();
    if (!r) return;
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    const big = Math.max(e.width || 0, e.height || 0) >= 36;
    setPressing({ x, y });
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      timer.current = null;
      setPressing(null);
      place(x, y, big);
    }, 600);
  };
  const up = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
    setPressing(null);
  };

  const send = () => {
    if (!prints.length || sent) return;
    setSent(true);
    onSent(prints.length);
    sfx("kd-sealed", { gain: 0.9 });
    haptic([20, 50, 30]);
  };

  return (
    <Room label="Kiss me back" className="kd-back">
      <Kicker>Your turn</Kicker>
      <Title>{sent ? `${prints.length} ${prints.length === 1 ? "kiss" : "kisses"} sent to ${k.sender}` : "Kiss the screen"}</Title>
      {!sent && <p className="kd-backSub" style={{ fontFamily: SERIF }}>(Or use your thumb. We won&rsquo;t tell.)</p>}
      <div
        ref={arena}
        className={`kd-glassPad${sent ? " is-sent" : ""}`}
        onPointerDown={down}
        onPointerUp={up}
        onPointerLeave={up}
        onPointerCancel={up}
        onContextMenu={(e) => e.preventDefault()}
        role="img"
        aria-label={`A glass pane. Press and hold anywhere to leave a kiss. ${prints.length} of 3.`}
      >
        {pressing && <span className="kd-pressing" style={{ left: `${pressing.x}%`, top: `${pressing.y}%` }} aria-hidden />}
        {prints.map((p) => (
          <span key={p.id} className="kd-print" style={sent ? { left: "50%", top: "46%", transform: `translate(-50%,-50%) scale(.3) rotate(${p.rot}deg)`, opacity: 0 } : { left: `${p.x}%`, top: `${p.y}%`, transform: `translate(-50%,-50%) rotate(${p.rot}deg)` }}>
            <span className="kd-ring" aria-hidden />
            <Lips color={k.S.c} size={96} />
          </span>
        ))}
        {sent && (
          <span className="kd-swak" aria-hidden>
            <b style={{ fontFamily: SERIF }}>{initialOf(k.recipient)}♥{initialOf(k.sender)}</b>
            <small>S · W · A · K</small>
          </span>
        )}
        {!sent && prints.length === 0 && <span className="kd-padSticker">{sticker}</span>}
      </div>
      {lips && !sent && <p className="kd-lipsDetected" style={{ fontFamily: HAND }}>…that was definitely lips 😳</p>}
      {sent ? (
        <Satin big onClick={() => { sfx("chime", { gain: 0.6 }); onNext(); }}>See your strip →</Satin>
      ) : prints.length ? (
        <>
          <Satin big onClick={send}>Send {prints.length} {prints.length === 1 ? "kiss" : "kisses"} to {k.sender} ✦</Satin>
          {prints.length < 3 && <Hint>…or leave another ({prints.length}/3)</Hint>}
        </>
      ) : (
        <>
          <Hint>Press and hold anywhere on the glass</Hint>
          <Quiet onClick={() => place(30 + Math.random() * 40, 30 + Math.random() * 40, false)}>Leave a kiss</Quiet>
        </>
      )}
      <style>{CSS}</style>
    </Room>
  );
}

const CSS = `
.kd-back { gap: 10px; }
.kd-backSub { margin: -4px 0 0; font-size: 16px; font-style: italic; color: var(--vw-ink-soft); }
.kd-glassPad { position: relative; width: 100%; max-width: 440px; height: min(46vh, 400px); min-height: 260px; border-radius: 28px; overflow: hidden; touch-action: none; cursor: pointer;
  -webkit-user-select: none; user-select: none; -webkit-touch-callout: none;
  background: linear-gradient(150deg, rgba(255,255,255,.85), rgba(255,236,242,.55) 50%, rgba(255,255,255,.75)); border: 1px solid rgba(122,15,46,.14);
  box-shadow: 0 24px 50px -28px rgba(122,15,46,.55), inset 0 0 0 6px rgba(255,255,255,.5); }
.kd-pressing { position: absolute; width: 90px; height: 90px; margin: -45px 0 0 -45px; border-radius: 50%; border: 3px solid var(--vw-accent); opacity: .5; animation: kd-press .6s linear forwards; pointer-events: none; }
@keyframes kd-press { from { transform: scale(1.4); opacity: .1; } to { transform: scale(.6); opacity: .8; } }
.kd-print { position: absolute; transition: left 1s cubic-bezier(.6,0,.2,1), top 1s cubic-bezier(.6,0,.2,1), transform 1s cubic-bezier(.6,0,.2,1), opacity 1s ease .4s; mix-blend-mode: multiply; pointer-events: none; }
.kd-ring { position: absolute; left: 50%; top: 50%; width: 120px; height: 120px; margin: -60px 0 0 -60px; border-radius: 50%; border: 2px solid var(--vw-accent); animation: kd-ring 1s ease-out forwards; }
@keyframes kd-ring { from { transform: scale(.4); opacity: .8; } to { transform: scale(2.2); opacity: 0; } }
.kd-swak { position: absolute; left: 50%; top: 46%; width: 132px; height: 132px; margin: -66px 0 0 -66px; border-radius: 50%; display: grid; place-content: center; gap: 4px;
  background: radial-gradient(circle at 36% 30%, #E2455F, #B3122E 55%, #5A0A18); color: #FFE9C4; box-shadow: inset 0 -5px 0 rgba(0,0,0,.25), 0 14px 30px -8px rgba(90,10,24,.6);
  animation: kd-swak .7s .7s cubic-bezier(.3,1.5,.5,1) both; }
.kd-swak b { font-size: 34px; font-style: italic; letter-spacing: .04em; }
.kd-swak small { font: 700 10px/1 var(--vw-font-ui, system-ui); letter-spacing: .2em; opacity: .85; }
@keyframes kd-swak { from { transform: scale(2.2) rotate(-20deg); opacity: 0; } to { transform: none; opacity: 1; } }
.kd-padSticker { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); pointer-events: none; opacity: .9; }
.kd-lipsDetected { margin: 0; font-size: 24px; color: var(--vw-accent); animation: kd-in .5s ease both; }
@media (prefers-reduced-motion: reduce) { .kd-ring, .kd-pressing, .kd-swak { animation: none; } .kd-print { transition: opacity .3s; } }
`;
