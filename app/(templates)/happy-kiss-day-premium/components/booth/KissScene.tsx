"use client";

// Chapter 5: kiss the screen. The whole screen is the booth's glass. A touch
// with a big contact patch (PointerEvent width/height: lips, a cheek) kisses
// at once; anything else is a 550 ms press-and-hold with a closing ring.
// Each kiss leaves a lipstick print in the sender's shade, with a ripple and
// a reverb-tailed kiss. Up to three. Then they put it on the strip.

import { useRef, useState, type ReactNode } from "react";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { PremiumCTA, sfx } from "../../../_valentine/kit/premium";
import { LipPrint } from "./LipPrint";
import type { Booth } from "./model";
import { CTA_STYLE, Eyebrow, Scene } from "./ui";

type Print = { x: number; y: number; rot: number; id: number };
const HOLD_MS = 550;

export default function KissScene({ b, sticker, onKissed }: { b: Booth; sticker: ReactNode; onKissed: (count: number) => void }) {
  const reduce = useReducedMotion();
  const [prints, setPrints] = useState<Print[]>([]);
  const [lips, setLips] = useState(false);
  const [pressing, setPressing] = useState<{ x: number; y: number } | null>(null);
  const [sealing, setSealing] = useState(false);
  const glass = useRef<HTMLDivElement>(null);
  const timer = useRef<number | null>(null);
  const nextId = useRef(1);

  const place = (x: number, y: number, big: boolean) => {
    if (sealing) return;
    setPrints((ps) => (ps.length >= 3 ? ps : [...ps, { x, y, rot: Math.random() * 26 - 13, id: nextId.current++ }]));
    sfx("kpb-kiss", { gain: 0.95 });
    sfx("kpb-ripple", { at: 0.04, gain: 0.6 });
    haptic([18, 30, 12]);
    if (big) setLips(true);
  };
  const clear = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
    setPressing(null);
  };
  const down = (e: React.PointerEvent) => {
    if (sealing || prints.length >= 3) return;
    if ((e.target as HTMLElement).closest("button")) return;
    const r = glass.current?.getBoundingClientRect();
    if (!r) return;
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    const big = Math.max(e.width || 0, e.height || 0) >= 30;
    if (big) {
      place(x, y, true);
      return;
    }
    clear();
    setPressing({ x, y });
    timer.current = window.setTimeout(() => {
      timer.current = null;
      setPressing(null);
      place(x, y, false);
    }, HOLD_MS);
  };

  const seal = () => {
    if (!prints.length || sealing) return;
    setSealing(true);
    window.setTimeout(() => onKissed(prints.length), reduce ? 200 : 750);
  };

  const n = prints.length;
  return (
    <Scene label="Kiss the screen" className={`pb-kiss${sealing ? " is-sealing" : ""}`}>
      <div
        ref={glass}
        className="pb-glass"
        onPointerDown={down}
        onPointerUp={clear}
        onPointerLeave={clear}
        onPointerCancel={clear}
        onContextMenu={(e) => e.preventDefault()}
        role="img"
        aria-label={`The booth's glass. Press and hold anywhere to leave a kiss. ${n} of 3.`}
      >
        <span className="pb-glassSheen" aria-hidden />
        {!n && !sealing && <span className="pb-target" aria-hidden />}
        {pressing && <span className="pb-pressing" style={{ left: `${pressing.x}%`, top: `${pressing.y}%` }} aria-hidden />}
        {prints.map((p) => (
          <span key={p.id} className="pb-kissAt" style={{ left: `${p.x}%`, top: `${p.y}%`, ["--r" as string]: `${p.rot}deg` }}>
            <span className="pb-ring" aria-hidden />
            <LipPrint color={b.S.c} lipstick={b.lipstick} size={150} seed={p.id * 5} />
          </span>
        ))}
      </div>
      <div className="pb-kissTop">
        <Eyebrow>{n ? (n < 3 ? `${n} of 3 · one more?` : "3 of 3") : "Your turn"}</Eyebrow>
        <h2 className="pb-h pb-kissH">{n ? <>Mwah. <em>{n === 3 ? "Got all three." : "Got it."}</em></> : "Kiss the screen."}</h2>
        {!n && <p className="pb-sub">Or press and hold anywhere. Nobody&rsquo;s watching.</p>}
        {lips && <p className="pb-lips">…that was definitely lips.</p>}
      </div>
      {!n && sticker && <span className="pb-kissSticker">{sticker}</span>}
      <div className="pb-foot pb-kissFoot">
        {n ? (
          <PremiumCTA style={CTA_STYLE} tone="rose" cue={null} onClick={seal}>Put it on the strip</PremiumCTA>
        ) : (
          <button type="button" className="pb-quiet" onClick={() => place(35 + Math.random() * 30, 52 + Math.random() * 14, false)}>
            Leave a kiss ›
          </button>
        )}
      </div>
      <style>{CSS}</style>
    </Scene>
  );
}

const CSS = `
.pb-kiss .pb-in { pointer-events: none; }
.pb-kiss .pb-in > * { pointer-events: auto; }
.pb-glass { position: absolute; inset: 0; z-index: 0; touch-action: none; cursor: pointer; -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; overflow: hidden; }
.pb-glassSheen { position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(115deg, rgba(255,255,255,.07) 0%, rgba(255,255,255,0) 30%, rgba(255,255,255,0) 58%, rgba(255,255,255,.05) 66%, rgba(255,255,255,0) 74%),
  radial-gradient(60% 40% at 50% 62%, color-mix(in srgb, var(--pb-shade) 22%, transparent), transparent 70%); }
.pb-target { position: absolute; left: 50%; top: 60%; width: 200px; height: 200px; margin: -100px 0 0 -100px; border-radius: 50%; pointer-events: none;
  background: radial-gradient(circle, color-mix(in srgb, var(--pb-shade-hi) 38%, transparent) 0%, color-mix(in srgb, var(--pb-shade) 14%, transparent) 45%, transparent 70%);
  animation: pb-breathe 2.8s ease-in-out infinite; }
.pb-target::after { content: ""; position: absolute; inset: 34px; border-radius: 50%; border: 1px solid color-mix(in srgb, var(--pb-shade-hi) 55%, transparent); animation: pb-halo 2.8s var(--pb-ease) infinite; }
@keyframes pb-breathe { 0%, 100% { transform: scale(.92); opacity: .75; } 50% { transform: scale(1.06); opacity: 1; } }
@keyframes pb-halo { from { transform: scale(.8); opacity: .9; } to { transform: scale(1.5); opacity: 0; } }
.pb-kissTop { position: relative; z-index: 1; display: grid; justify-items: center; gap: 14px; pointer-events: none !important; margin-top: 4vh; }
.pb-kissH { font-size: clamp(42px, 12.4vw, 92px); max-width: 9ch; }
.pb-lips { margin: 0; font: 400 22px/1.2 var(--pb-display); color: var(--pb-shade-hi); animation: pb-up .6s var(--pb-ease) both; }
.pb-kissSticker { position: absolute; left: 50%; top: 58%; transform: translate(-50%, -50%); z-index: 1; pointer-events: none !important; opacity: .95; }
.pb-kissFoot { position: relative; z-index: 2; }
.pb-pressing { position: absolute; width: 110px; height: 110px; margin: -55px 0 0 -55px; border-radius: 50%; border: 2px solid var(--pb-shade-hi); pointer-events: none;
  animation: pb-press ${HOLD_MS}ms linear forwards; }
@keyframes pb-press { from { transform: scale(1.5); opacity: .1; } to { transform: scale(.55); opacity: .9; } }
.pb-kissAt { position: absolute; width: 150px; margin: -45px 0 0 -75px; pointer-events: none; transform: rotate(var(--r)); animation: pb-kissIn .5s cubic-bezier(.2,1.3,.4,1) both;
  transition: transform .7s cubic-bezier(.6,0,.3,1), opacity .6s ease .1s; }
.pb-kissAt svg { mix-blend-mode: screen; filter: drop-shadow(0 0 18px color-mix(in srgb, var(--pb-shade) 60%, transparent)); }
@keyframes pb-kissIn { from { transform: rotate(var(--r)) scale(1.35); opacity: 0; } to { transform: rotate(var(--r)) scale(1); opacity: 1; } }
.pb-ring { position: absolute; left: 50%; top: 50%; width: 160px; height: 160px; margin: -80px 0 0 -80px; border-radius: 50%; border: 1.5px solid var(--pb-shade-hi); animation: pb-ring 1.1s ease-out forwards; }
@keyframes pb-ring { from { transform: scale(.35); opacity: .9; } to { transform: scale(2.6); opacity: 0; } }
.pb-kiss.is-sealing .pb-kissAt { transform: translateY(40vh) rotate(var(--r)) scale(.2); opacity: 0; }
@media (prefers-reduced-motion: reduce) { .pb-kissAt, .pb-ring, .pb-pressing, .pb-target, .pb-target::after { animation: none; } .pb-kissAt { transition: opacity .3s; } }
`;
