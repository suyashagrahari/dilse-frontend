"use client";

// The Dandiya night, full-bleed behind every scene — a kumkum-red festival
// night: the deep sindoor sky (DayConfig.theme.bg) with a faint bandhani
// weave, a slow gold rangoli-mandala breathing behind the scene, a marigold
// toran swagged across the top with mirror-work danglers, strings of fairy
// lights, diya embers drifting up, mirror sparkles that catch the light, and a
// warm diya glow along the horizon with a ring of tiny dancers. Wide screens get
// two hanging kandils and a bigger ring. After YES the whole horizon warms to
// marigold.
//
// Pure CSS + inline SVG, transform/opacity animations only, fixed behind the
// scenes (z-index 0). Reduced motion stills everything.

import { memo, useMemo } from "react";
import { Sparkle, Toran } from "./art";
import { BANDHANI, DD } from "./ui";

// Deterministic "random" (no hydration drift).
const rnd = (i: number, s: number) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

function Kandil({ side }: { side: "l" | "r" }) {
  return (
    <span className={`dd-kandil dd-kandil-${side}`} aria-hidden>
      <svg viewBox="0 0 80 190" width="100%" style={{ display: "block", overflow: "visible" }}>
        <path d="M40 0 L40 46" stroke="#E7B84C" strokeWidth="2" />
        <path d="M22 52 L58 52 L70 92 L40 140 L10 92 Z" fill={side === "l" ? DD.marigold : DD.peacock} />
        <path d="M22 52 L58 52 L70 92 L40 140 L10 92 Z" fill="url(#ddkg)" />
        <path d="M10 92 L70 92" stroke={DD.gold} strokeWidth="3" />
        <path d="M22 52 L40 140 L58 52" stroke={DD.gold} strokeWidth="1.6" fill="none" opacity=".8" />
        <circle cx="40" cy="92" r="9" fill="#FFF4C8" opacity=".95" />
        {[20, 30, 40, 50, 60].map((x, i) => (
          <path key={x} d={`M${x} ${96 + Math.abs(40 - x) * -0.3} L${x} ${150 + (i % 2) * 14}`} stroke={i % 2 ? DD.marigold : DD.gold} strokeWidth="2.4" strokeLinecap="round" />
        ))}
        <defs>
          <radialGradient id="ddkg" cx="50%" cy="60%" r="60%">
            <stop offset="0" stopColor="#FFF1C2" stopOpacity=".9" />
            <stop offset="1" stopColor="#FFE9A8" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </span>
  );
}

/** A slow, faint gold rangoli-mandala (petals + dots) — one SVG, rotated by CSS. */
function Mandala() {
  const petals = 16;
  return (
    <svg className="dd-mandala" viewBox="-100 -100 200 200" aria-hidden>
      <g fill="none" stroke="#F6D27A" strokeWidth=".8">
        <circle r="96" strokeDasharray="1 5" strokeLinecap="round" strokeWidth="2.2" />
        <circle r="86" />
        <circle r="58" />
        <circle r="24" />
        {Array.from({ length: petals }, (_, i) => (
          <g key={i} transform={`rotate(${(360 / petals) * i})`}>
            <path d="M0 -84 Q14 -70 0 -58 Q-14 -70 0 -84 Z" />
            <path d="M0 -56 Q9 -42 0 -28 Q-9 -42 0 -56 Z" />
            <circle cy="-91" r="1.8" fill="#F6D27A" />
          </g>
        ))}
      </g>
    </svg>
  );
}

/** A tiny bear-dancer silhouette with sticks raised (the horizon ring): round ears, a twirling chaniya. */
function Dancer({ i }: { i: number }) {
  const flip = i % 2 ? -1 : 1;
  return (
    <svg viewBox="0 0 40 60" width="100%" style={{ display: "block", transform: `scaleX(${flip})` }} aria-hidden>
      <circle cx="13.5" cy="4.5" r="3.4" />
      <circle cx="26.5" cy="4.5" r="3.4" />
      <circle cx="20" cy="10.5" r="8" />
      <path d="M13 18 Q20 15 27 18 L28 28 L37 54 Q20 60 3 54 L12 28 Z" />
      <path d="M14 20 L4 8 M26 20 L36 10" strokeWidth="3" strokeLinecap="round" />
      <path d="M1 5 L8 12 M33 7 L40 13" strokeWidth="2.4" strokeLinecap="round" stroke="#FFB627" />
    </svg>
  );
}

function AtmosphereImpl({ warm }: { warm: boolean }) {
  // Diya embers drifting up (they replace the old night's stars).
  const embers = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        left: rnd(i, 1) * 100,
        size: 2 + rnd(i, 3) * 3,
        delay: -rnd(i, 4) * 14,
        dur: 10 + rnd(i, 2) * 10,
        drift: (rnd(i, 6) - 0.5) * 60,
      })),
    [],
  );
  const sparkles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        left: 4 + rnd(i, 5) * 92,
        top: 14 + rnd(i, 6) * 70,
        size: 8 + rnd(i, 7) * 12,
        delay: rnd(i, 8) * 5,
        dur: 2.6 + rnd(i, 9) * 2.6,
        color: [DD.gold, "#FFFFFF", "#FFE08A", "#9FE3FF"][i % 4],
      })),
    [],
  );
  const bulbs = useMemo(() => Array.from({ length: 22 }, (_, i) => ({ i, c: [DD.marigold, "#FFF1C2", "#7FD8F2", DD.emerald, "#FF9ACB"][i % 5] })), []);
  const dancers = 14;

  return (
    <div className={`dd-atmo${warm ? " is-warm" : ""}`} aria-hidden>
      <style>{ATMO_CSS}</style>
      <span className="dd-weave" />
      <span className="dd-vignette" />
      <Mandala />
      {embers.map((e, i) => (
        <span
          key={i}
          className="dd-ember"
          style={{ left: `${e.left}%`, width: e.size, height: e.size, animationDelay: `${e.delay}s`, animationDuration: `${e.dur}s`, ["--dx" as string]: `${e.drift}px` }}
        />
      ))}
      {/* two strings of fairy lights drooping under the toran */}
      <svg className="dd-lights" viewBox="0 0 1000 120" preserveAspectRatio="none">
        <path d="M0 20 Q250 110 500 30 Q750 110 1000 20" fill="none" stroke="rgba(246,210,122,.4)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="dd-bulbs">
        {bulbs.map((b) => {
          const t = b.i / (bulbs.length - 1);
          const half = t < 0.5 ? t * 2 : (t - 0.5) * 2;
          const y = 16 + Math.sin(half * Math.PI) * 62;
          return <span key={b.i} className="dd-bulb" style={{ left: `${t * 100}%`, top: `${y}%`, background: b.c, color: b.c, animationDelay: `${(b.i % 5) * 0.4}s` }} />;
        })}
      </div>
      <Toran className="dd-toran" height={44} />
      {sparkles.map((s, i) => (
        <span key={i} className="dd-spark" style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s` }}>
          <Sparkle size={s.size} color={s.color} />
        </span>
      ))}
      <Kandil side="l" />
      <Kandil side="r" />
      {/* the diya glow on the horizon and its ring of tiny dancers */}
      <span className="dd-horizon" />
      <div className="dd-ring">
        {Array.from({ length: dancers }, (_, i) => (
          <span key={i} className="dd-dancer" style={{ left: `${(i / dancers) * 100}%`, animationDelay: `${-i * 0.35}s` }}>
            <Dancer i={i} />
          </span>
        ))}
      </div>
    </div>
  );
}

const ATMO_CSS = `
.dd-atmo { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; contain: strict; }
/* the bandhani weave of the night itself, barely there */
.dd-weave { position: absolute; inset: 0; background: ${BANDHANI}; opacity: .07; }
.dd-vignette { position: absolute; inset: 0; background: radial-gradient(120% 90% at 50% 40%, rgba(0,0,0,0) 55%, rgba(30,2,4,.55) 100%); }
.dd-mandala { position: absolute; left: 50%; top: 46%; width: min(150vw, 150vh); height: min(150vw, 150vh); margin: calc(min(150vw, 150vh) / -2) 0 0 calc(min(150vw, 150vh) / -2);
  opacity: .1; animation: dd-mandala 120s linear infinite; will-change: transform; }
@keyframes dd-mandala { to { transform: rotate(360deg) } }
.dd-ember { position: absolute; bottom: -10px; border-radius: 50%; background: radial-gradient(circle, #FFF6D0 0 30%, #FFB627 60%, rgba(255,138,31,0) 100%);
  box-shadow: 0 0 8px 2px rgba(255,182,39,.55); opacity: 0; animation: dd-ember 14s linear infinite; will-change: transform, opacity; }
@keyframes dd-ember { 0% { transform: translate(0, 0); opacity: 0 } 10% { opacity: .9 } 70% { opacity: .55 } 100% { transform: translate(var(--dx, 0px), -105vh); opacity: 0 } }
.dd-toran { position: absolute; left: 0; right: 0; top: 0; filter: drop-shadow(0 4px 6px rgba(30,0,0,.45)); }
.dd-lights { position: absolute; left: 0; top: 0; width: 100%; height: 120px; }
.dd-bulbs { position: absolute; left: 0; top: 0; width: 100%; height: 120px; }
.dd-bulb { position: absolute; width: 6px; height: 6px; margin: -3px 0 0 -3px; border-radius: 50%; box-shadow: 0 0 8px 2px currentColor; opacity: .85;
  animation: dd-bulb 1.6s ease-in-out infinite alternate; }
@keyframes dd-bulb { from { opacity: .45 } to { opacity: 1 } }
.dd-spark { position: absolute; opacity: 0; animation: dd-spark 3.6s ease-in-out infinite; }
@keyframes dd-spark { 0%, 100% { opacity: 0; transform: scale(.3) rotate(0) } 45% { opacity: .95; transform: scale(1) rotate(45deg) } 60% { opacity: .6 } }
.dd-kandil { position: absolute; top: 0; width: 64px; display: none; transform-origin: 50% 0; animation: dd-sway 4.2s ease-in-out infinite alternate; filter: drop-shadow(0 0 18px rgba(255,182,39,.45)); }
.dd-kandil-l { left: 4%; }
.dd-kandil-r { right: 4%; animation-delay: -2s; }
@keyframes dd-sway { from { transform: rotate(-3deg) } to { transform: rotate(3deg) } }
@media (min-width: 900px) { .dd-kandil { display: block; } }
@media (min-width: 1300px) { .dd-kandil { width: 84px; } .dd-kandil-l { left: 7%; } .dd-kandil-r { right: 7%; } }
.dd-horizon { position: absolute; left: -10%; right: -10%; bottom: -18vh; height: 50vh;
  background: radial-gradient(50% 60% at 50% 70%, rgba(255,182,39,.42), rgba(255,138,31,.2) 45%, rgba(62,6,9,0) 75%); transition: opacity 1.2s ease; opacity: .9; }
.dd-atmo::after { content: ""; position: absolute; inset: 0; opacity: 0; transition: opacity 1.6s ease;
  background: radial-gradient(120% 70% at 50% 100%, rgba(255,182,39,.5), rgba(255,154,203,.16) 45%, rgba(255,182,39,.06) 75%), linear-gradient(180deg, rgba(255,182,39,.12), rgba(0,0,0,0) 40%); }
.dd-atmo.is-warm::after { opacity: 1; }
.dd-atmo.is-warm .dd-horizon { opacity: 1; background: radial-gradient(60% 70% at 50% 70%, rgba(255,208,90,.65), rgba(255,138,31,.25) 55%, rgba(62,6,9,0) 80%); }
.dd-ring { position: absolute; left: 0; right: 0; bottom: 0; height: 34px; opacity: .7; }
@media (min-width: 768px) { .dd-ring { height: 54px; opacity: .78; } }
.dd-dancer { position: absolute; bottom: 0; width: 22px; fill: #2A0306; stroke: #2A0306; animation: dd-hop .9s ease-in-out infinite alternate; }
@media (min-width: 768px) { .dd-dancer { width: 34px; } }
@keyframes dd-hop { from { transform: translateY(0) } to { transform: translateY(-4px) } }
@media (prefers-reduced-motion: reduce) {
  .dd-bulb, .dd-spark, .dd-kandil, .dd-dancer, .dd-mandala { animation: none !important; }
  .dd-ember { animation: none !important; opacity: 0; }
  .dd-spark { opacity: .6; }
}
`;

export default memo(AtmosphereImpl);
