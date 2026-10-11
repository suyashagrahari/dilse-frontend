"use client";

// Scene 3 · Loves me, loves me not. Seven petals around a heart: each tap plucks one (it flies off with a pop and
// a puff of tiny hearts) and the label flips. A blushing face gets more nervous with every petal… the seventh is
// always LOVES ME: the slot GIF jumps in, a big heart burst, the chime. Fallback: "Pluck one for me".

import { useRef, useState } from "react";
import { burst, haptic } from "../../../_valentine/kit";
import { usePremium } from "../../../_valentine/kit/premium";
import type { DayConfig } from "../../../_valentine/types";
import { CENTER_SPIRAL, PLUCK_PETAL, PLUCK_VEIN, shadesFor } from "../../../happy-rose-day/components/rose/art";
import { Gif, Slot } from "./art";
import { Puffy, Scene, originOf, useAww } from "./ui";
import { FIXED_GIF, type Garden } from "./util";

const N = 7;

export function PluckScene({ g, day, gifs, step, total, onDone }: { g: Garden; day: DayConfig; gifs?: Record<string, string>; step: number; total: number; onDone: () => void }) {
  const { sfx } = usePremium();
  const aww = useAww();
  const [gone, setGone] = useState<number[]>([]);
  const petalRefs = useRef<(SVGGElement | null)[]>([]);
  const flowerRef = useRef<HTMLDivElement>(null);
  const n = gone.length;
  const done = n >= N;
  const sh = shadesFor(g.color);
  const fill = sh.petal === "#FFF6EE" ? "#FFE3EC" : sh.petal;

  const pluck = (i: number) => {
    if (done || gone.includes(i)) return;
    const next = [...gone, i];
    setGone(next);
    const o = originOf(petalRefs.current[i]);
    sfx("pop", { gain: 0.7, detune: next.length * 60 });
    burst({ kind: "hearts", origin: o, emojis: ["💗", "💕"], count: 6, spread: 0.08 });
    haptic(14);
    if (next.length === N) window.setTimeout(() => aww(originOf(flowerRef.current, 0.4), true), 380);
  };
  const pluckForMe = () => {
    const i = Array.from({ length: N }, (_, k) => k).find((k) => !gone.includes(k));
    if (i !== undefined) pluck(i);
  };

  const word = n === 0 ? "who knows… 🤭" : n % 2 === 1 ? "loves me 💗" : "loves me not 🙈";

  return (
    <Scene
      id="pluck"
      step={step}
      total={total}
      label="Loves me, loves me not"
      kicker="Step 3 · the real test"
      title={
        <>
          Loves me… <em>loves me not?</em>
        </>
      }
      sub={done ? "The petals have spoken." : "Pluck a petal 🌼"}
    >
      <div className="rg-pluckStage">
        <div className={`rg-flower${done ? " is-done" : ""}`} ref={flowerRef}>
          <svg viewBox="-120 -120 240 240" width="100%" height="100%" style={{ overflow: "visible" }}>
            <defs>
              <radialGradient id="pl-p" cx="50%" cy="90%" r="90%">
                <stop offset="0" stopColor={sh.dark} />
                <stop offset=".55" stopColor={fill} />
                <stop offset="1" stopColor={sh.light} />
              </radialGradient>
            </defs>
            <path d="M-60 70 C -90 50 -110 70 -112 92 C -84 98 -66 88 -60 70 Z" fill="#7BC47F" stroke="#fff" strokeWidth="3" />
            <path d="M64 -78 C 96 -96 110 -74 106 -56 C 84 -56 70 -64 64 -78 Z" fill="#7BC47F" stroke="#fff" strokeWidth="3" />
            {Array.from({ length: N }, (_, i) => {
              const a = (360 / N) * i;
              const off = gone.includes(i);
              return (
                <g key={i} transform={`rotate(${a})`}>
                  <g
                    ref={(el) => {
                      petalRefs.current[i] = el;
                    }}
                    className={`rg-petal${off ? " is-gone" : ""}`}
                    style={{ ["--dir" as string]: i % 2 ? "1" : "-1" }}
                    role="button"
                    tabIndex={off ? -1 : 0}
                    aria-label={off ? undefined : `Pluck petal ${i + 1}`}
                    aria-hidden={off || undefined}
                    onClick={() => pluck(i)}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), pluck(i))}
                  >
                    <path d={PLUCK_PETAL} fill="url(#pl-p)" stroke="#fff" strokeWidth="3" />
                    <path d={PLUCK_VEIN} fill="none" stroke="rgba(255,255,255,.45)" strokeWidth="1.6" />
                  </g>
                </g>
              );
            })}
            <circle r="24" fill="#FFE27A" stroke="#fff" strokeWidth="4" />
            <path d={CENTER_SPIRAL} fill="none" stroke="rgba(214,63,114,.35)" strokeWidth="1.8" transform="scale(.8)" />
            <path d="M0 10 c-8 -6 -13 -9 -13 -14 a6.5 6.5 0 0 1 13 -3 a6.5 6.5 0 0 1 13 3 c0 5 -5 8 -13 14 Z" fill="#FF6F9C" className="rg-flowerHeart" />
          </svg>
        </div>
        <div className="rg-reactor rg-reactor--pluck" style={{ ["--nerv" as string]: String(Math.min(1, n / (N - 1))) }}>
          {done ? <Slot key="yes" day={day} gifs={gifs} id="rg4-lovesme" size={118} className="rg-pop" tilt={-5} eager /> : <Gif src={FIXED_GIF.nervous} size={78} className="rg-nervous" eager />}
        </div>
      </div>
      <div className="rg-pluckWord" aria-live="polite">
        {done ? (
          <>
            <strong className="rg-lovesMe">LOVES ME 💖</strong>
            <span>
              The petals never lie, {g.to}. {g.from} checked twice.
            </span>
          </>
        ) : (
          <>
            <strong key={n} className="rg-word">
              {word}
            </strong>
            <span>{N - n} petals left</span>
          </>
        )}
      </div>
      <div className="rg-foot">
        {done ? (
          <Puffy onClick={onDone}>Someone left you a note 💌</Puffy>
        ) : (
          <Puffy variant="ghost" onClick={pluckForMe} cue={null}>
            Pluck one for me 🌸
          </Puffy>
        )}
      </div>
    </Scene>
  );
}
