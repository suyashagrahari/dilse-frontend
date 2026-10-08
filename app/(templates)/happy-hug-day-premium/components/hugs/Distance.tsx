"use client";

// Room 2 — The distance. Two tiny glowing figures stand far apart on a snowy
// night field, "860 km" between them. Drag either one toward the other: a
// footstep crunches every few steps, footprints trail behind, the number
// counts down, and the whole field warms from blue to amber. When they meet
// they lean into each other and a warm swell rises. "Walk to them" does it
// for you.

import { useRef, useState, type ReactNode } from "react";
import { sfx } from "../../../_valentine/kit/premium";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { HAND, SOFT } from "./fonts";
import type { Hug } from "./model";
import { Hint, Kicker, Quiet, Room, Satin, Title } from "./ui";

function Figure({ warm, label, flip }: { warm: number; label: string; flip?: boolean }) {
  const glow = `rgba(255,${Math.round(170 + warm * 40)},${Math.round(120 - warm * 40)},${0.35 + warm * 0.4})`;
  return (
    <span className="hg-fig" style={{ transform: flip ? "scaleX(-1)" : undefined }}>
      <svg viewBox="0 0 40 70" width="40" height="70" aria-hidden style={{ overflow: "visible", filter: `drop-shadow(0 0 ${8 + warm * 10}px ${glow})` }}>
        <circle cx="20" cy="13" r="9" fill="#F4EBDD" />
        <path d="M8 66 C6 40 10 26 20 26 C30 26 34 40 32 66 Z" fill="#F4EBDD" />
        <path d="M10 30 C16 34 24 34 30 30 L30 36 C24 40 16 40 10 36 Z" fill="#FF8A3D" />
        <path d="M27 34 L31 48" stroke="#FF8A3D" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <small style={{ fontFamily: HAND, transform: flip ? "scaleX(-1)" : undefined }}>{label}</small>
    </span>
  );
}

export default function Distance({ h, sticker, onNext }: { h: Hug; sticker: ReactNode; onNext: () => void }) {
  const reduce = useReducedMotion();
  const [a, setA] = useState(0.14);
  const [b, setB] = useState(0.86);
  const [met, setMet] = useState(false);
  const [prints, setPrints] = useState<{ x: number; id: number }[]>([]);
  const field = useRef<HTMLDivElement>(null);
  const drag = useRef<{ who: "a" | "b"; lastStep: number } | null>(null);
  const id = useRef(0);
  const gap = Math.max(0, b - a - 0.12) / 0.6;
  const warm = met ? 1 : 1 - gap;
  const km = Math.round(h.km * gap);

  const meet = () => {
    if (met) return;
    setMet(true);
    setA(0.44);
    setB(0.56);
    sfx("hg-warm", { gain: 0.9 });
    haptic([20, 40, 20]);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const r = field.current?.getBoundingClientRect();
    if (!d || !r || met) return;
    const x = Math.max(0.06, Math.min(0.94, (e.clientX - r.left) / r.width));
    if (d.who === "a") {
      const nx = Math.min(x, b - 0.1);
      if (Math.abs(nx - d.lastStep) > 0.05) {
        step(nx);
        d.lastStep = nx;
      }
      setA(nx);
      if (b - nx < 0.16) meet();
    } else {
      const nx = Math.max(x, a + 0.1);
      if (Math.abs(nx - d.lastStep) > 0.05) {
        step(nx);
        d.lastStep = nx;
      }
      setB(nx);
      if (nx - a < 0.16) meet();
    }
  };
  const step = (x: number) => {
    sfx("hg-step", { gain: 0.6 });
    setPrints((p) => [...p.slice(-24), { x, id: id.current++ }]);
  };
  const walk = () => {
    if (met) return;
    if (reduce) return meet();
    let n = 0;
    const t = window.setInterval(() => {
      n += 1;
      setA((v) => {
        const nx = Math.min(0.44, v + 0.05);
        step(nx);
        return nx;
      });
      setB((v) => Math.max(0.56, v - 0.05));
      if (n >= 7) {
        window.clearInterval(t);
        meet();
      }
    }, 260);
  };

  return (
    <Room label="The distance between you" className="hg-dist">
      <Kicker>{met ? "Zero kilometres" : "So far apart"}</Kicker>
      <Title>{met ? "Finally." : "Close the distance"}</Title>
      <div ref={field} className="hg-field" style={{ ["--w" as string]: String(warm) }} onPointerMove={onMove} onPointerUp={() => (drag.current = null)} onPointerCancel={() => (drag.current = null)}>
        <span className="hg-fieldWarm" aria-hidden />
        <span className="hg-ground" aria-hidden />
        {prints.map((p) => (
          <i key={p.id} className="hg-print" style={{ left: `${p.x * 100}%` }} aria-hidden />
        ))}
        {!met && (
          <span className="hg-km" style={{ fontFamily: SOFT, left: `${((a + b) / 2) * 100}%` }}>
            {h.km ? `${km.toLocaleString("en-IN")} km` : "too far"}
          </span>
        )}
        {!met && <span className="hg-line" style={{ left: `${a * 100 + 4}%`, right: `${100 - b * 100 + 4}%` }} aria-hidden />}
        <button
          type="button"
          className={`hg-figBtn${met ? " is-met" : ""}`}
          style={{ left: `${a * 100}%` }}
          onPointerDown={(e) => { (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); drag.current = { who: "a", lastStep: a }; }}
          onPointerMove={onMove}
          onPointerUp={() => (drag.current = null)}
          aria-label={`${h.sender}. Drag toward ${h.recipient}.`}
        >
          <Figure warm={warm} label={h.sender} />
        </button>
        <button
          type="button"
          className={`hg-figBtn${met ? " is-met is-r" : ""}`}
          style={{ left: `${b * 100}%` }}
          onPointerDown={(e) => { (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); drag.current = { who: "b", lastStep: b }; }}
          onPointerMove={onMove}
          onPointerUp={() => (drag.current = null)}
          aria-label={`${h.recipient}. Drag toward ${h.sender}.`}
        >
          <Figure warm={warm} label={h.recipient} flip />
        </button>
        {met && <span className="hg-metHeart" aria-hidden>🤍</span>}
        {met && <span className="hg-walkSticker">{sticker}</span>}
      </div>
      {met ? (
        <Satin big onClick={() => { sfx("hg-lubdub", { gain: 0.6 }); onNext(); }}>Hold me →</Satin>
      ) : (
        <>
          <Hint>Drag one of you toward the other</Hint>
          <Quiet onClick={walk}>Walk to them</Quiet>
        </>
      )}
      <style>{CSS}</style>
    </Room>
  );
}

const CSS = `
.hg-field { position: relative; width: 100%; max-width: 460px; height: min(40vh, 320px); min-height: 240px; border-radius: 26px; overflow: hidden; touch-action: none;
  background: linear-gradient(180deg, #1B2340 0%, #2A3560 60%, #DCE8F2 100%); box-shadow: 0 30px 60px -30px rgba(0,0,0,.8); }
.hg-fieldWarm { position: absolute; inset: 0; opacity: var(--w); transition: opacity .3s; background: linear-gradient(180deg, #3A2048 0%, #B24A5E 55%, #FFC79A 100%); }
.hg-ground { position: absolute; left: -10%; right: -10%; bottom: -30%; height: 55%; border-radius: 50%; background: radial-gradient(60% 60% at 50% 30%, #F4F8FC, #C9D8E6); opacity: calc(1 - var(--w) * .5); }
.hg-print { position: absolute; bottom: 18%; width: 7px; height: 10px; margin-left: -3px; border-radius: 50%; background: rgba(27,35,64,.35); }
.hg-km { position: absolute; top: 22%; transform: translateX(-50%); font-size: clamp(22px, 6vw, 30px); font-style: italic; color: #FFF6EA; white-space: nowrap; text-shadow: 0 2px 12px rgba(0,0,0,.4); }
.hg-line { position: absolute; top: 38%; height: 0; border-top: 2px dashed rgba(255,246,234,.45); }
.hg-figBtn { all: unset; position: absolute; bottom: 14%; transform: translateX(-50%); cursor: grab; touch-action: none; padding: 8px; transition: left .25s ease;
  -webkit-tap-highlight-color: transparent; }
.hg-figBtn:focus-visible { outline: 3px solid #FFC79A; outline-offset: 2px; border-radius: 12px; }
.hg-figBtn.is-met { transition: left .9s cubic-bezier(.22,1,.36,1), transform .9s; transform: translateX(-50%) rotate(8deg); }
.hg-figBtn.is-met.is-r { transform: translateX(-50%) rotate(-8deg); }
.hg-fig { display: grid; justify-items: center; gap: 2px; }
.hg-fig small { font-size: 16px; color: #FFF6EA; text-shadow: 0 1px 6px rgba(0,0,0,.5); }
.hg-metHeart { position: absolute; left: 50%; bottom: 52%; transform: translateX(-50%); font-size: 30px; animation: hg-rise 1.6s ease both; }
@keyframes hg-rise { from { opacity: 0; transform: translate(-50%, 20px) scale(.6); } to { opacity: 1; transform: translate(-50%, 0) scale(1); } }
.hg-walkSticker { position: absolute; right: 8px; top: 8px; pointer-events: none; }
@media (prefers-reduced-motion: reduce) { .hg-metHeart { animation: none; } .hg-figBtn, .hg-figBtn.is-met { transition: none; } }
`;
