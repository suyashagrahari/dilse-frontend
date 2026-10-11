"use client";

// The Dandiya night, full-bleed behind every scene: a deep navy sky with a
// soft Sharad moon and twinkling stars, a marigold toran swagged across the
// top edge, strings of fairy lights, mirror sparkles glinting in the air, and a
// warm garba glow along the horizon with a ring of tiny dancers. On wide
// screens two kandil lanterns hang at the sides and the dancers' ring grows.
// After YES the whole horizon warms to marigold.
//
// Pure CSS + inline SVG, transform/opacity animations only, fixed behind the
// scenes (z-index 0). Reduced motion stills everything.

import { memo, useMemo } from "react";
import { Sparkle, Toran } from "./art";
import { DD } from "./ui";

// Deterministic "random" (no hydration drift).
const rnd = (i: number, s: number) => {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

function Kandil({ side }: { side: "l" | "r" }) {
  return (
    <span className={`dd-kandil dd-kandil-${side}`} aria-hidden>
      <svg viewBox="0 0 80 190" width="100%" style={{ display: "block", overflow: "visible" }}>
        <path d="M40 0 L40 46" stroke="#B8862E" strokeWidth="2" />
        <path d="M22 52 L58 52 L70 92 L40 140 L10 92 Z" fill={side === "l" ? DD.kumkum : DD.peacock} />
        <path d="M22 52 L58 52 L70 92 L40 140 L10 92 Z" fill="url(#ddkg)" />
        <path d="M10 92 L70 92" stroke={DD.gold} strokeWidth="3" />
        <path d="M22 52 L40 140 L58 52" stroke={DD.gold} strokeWidth="1.6" fill="none" opacity=".8" />
        <circle cx="40" cy="92" r="9" fill="#FFF4C8" opacity=".95" />
        {[20, 30, 40, 50, 60].map((x, i) => (
          <path key={x} d={`M${x} ${96 + Math.abs(40 - x) * -0.3} L${x} ${150 + (i % 2) * 14}`} stroke={i % 2 ? DD.marigold : DD.gold} strokeWidth="2.4" strokeLinecap="round" />
        ))}
        <defs>
          <radialGradient id="ddkg" cx="50%" cy="60%" r="60%">
            <stop offset="0" stopColor="#FFE9A8" stopOpacity=".85" />
            <stop offset="1" stopColor="#FFE9A8" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </span>
  );
}

/** A tiny dancer silhouette with sticks raised (the horizon ring). */
function Dancer({ i }: { i: number }) {
  const flip = i % 2 ? -1 : 1;
  return (
    <svg viewBox="0 0 40 60" width="100%" style={{ display: "block", transform: `scaleX(${flip})` }} aria-hidden>
      <circle cx="20" cy="9" r="6" />
      <path d="M14 18 Q20 15 26 18 L27 30 L36 54 Q20 60 4 54 L13 30 Z" />
      <path d="M14 20 L4 8 M26 20 L36 10" strokeWidth="3" strokeLinecap="round" />
      <path d="M1 5 L8 12 M33 7 L40 13" strokeWidth="2.4" strokeLinecap="round" stroke="#FFB627" />
    </svg>
  );
}

function AtmosphereImpl({ warm }: { warm: boolean }) {
  const stars = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => ({
        left: rnd(i, 1) * 100,
        top: rnd(i, 2) * 62,
        size: 1 + rnd(i, 3) * 2.2,
        delay: rnd(i, 4) * 4,
        twinkle: i % 3 === 0,
      })),
    [],
  );
  const sparkles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        left: 4 + rnd(i, 5) * 92,
        top: 12 + rnd(i, 6) * 74,
        size: 8 + rnd(i, 7) * 12,
        delay: rnd(i, 8) * 5,
        dur: 2.6 + rnd(i, 9) * 2.6,
        color: [DD.gold, "#FFFFFF", "#9FE3FF", DD.marigold][i % 4],
      })),
    [],
  );
  const bulbs = useMemo(() => Array.from({ length: 22 }, (_, i) => ({ i, c: [DD.marigold, DD.kumkum, "#7FD8F2", DD.emerald, DD.rani][i % 5] })), []);
  const dancers = 14;

  return (
    <div className={`dd-atmo${warm ? " is-warm" : ""}`} aria-hidden>
      <style>{ATMO_CSS}</style>
      <span className="dd-moon" />
      {stars.map((s, i) => (
        <span
          key={i}
          className={s.twinkle ? "dd-star dd-star-tw" : "dd-star"}
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s` }}
        />
      ))}
      {/* two strings of fairy lights drooping under the toran */}
      <svg className="dd-lights" viewBox="0 0 1000 120" preserveAspectRatio="none">
        <path d="M0 20 Q250 110 500 30 Q750 110 1000 20" fill="none" stroke="rgba(246,210,122,.35)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="dd-bulbs">
        {bulbs.map((b) => {
          const t = b.i / (bulbs.length - 1);
          // follow the two swags of the light string (0→1→0 over each half)
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
      {/* the garba glow on the horizon and its ring of tiny dancers */}
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
.dd-moon { display: none; position: absolute; width: 110px; height: 110px; right: 11%; top: 16%; border-radius: 50%;
  background: radial-gradient(circle at 38% 36%, #FFFBEA 0%, #FCEFC2 52%, #EED38C 100%);
  box-shadow: 0 0 40px 10px rgba(252,239,194,.28), 0 0 120px 40px rgba(252,239,194,.1); opacity: .9; }
@media (min-width: 1100px) { .dd-moon { display: block; } }
.dd-star { position: absolute; border-radius: 50%; background: #FFF7E8; opacity: .7; }
.dd-star-tw { animation: dd-star 3.4s ease-in-out infinite alternate; }
@keyframes dd-star { from { opacity: .2; transform: scale(.7) } to { opacity: .95; transform: scale(1.15) } }
.dd-toran { position: absolute; left: 0; right: 0; top: 0; filter: drop-shadow(0 4px 6px rgba(0,0,0,.35)); }
.dd-lights { position: absolute; left: 0; top: 0; width: 100%; height: 120px; }
.dd-bulbs { position: absolute; left: 0; top: 0; width: 100%; height: 120px; }
.dd-bulb { position: absolute; width: 6px; height: 6px; margin: -3px 0 0 -3px; border-radius: 50%; box-shadow: 0 0 8px 2px currentColor; opacity: .85;
  animation: dd-bulb 1.6s ease-in-out infinite alternate; }
@keyframes dd-bulb { from { opacity: .45 } to { opacity: 1 } }
.dd-spark { position: absolute; opacity: 0; animation: dd-spark 3.6s ease-in-out infinite; }
@keyframes dd-spark { 0%, 100% { opacity: 0; transform: scale(.3) rotate(0) } 45% { opacity: .95; transform: scale(1) rotate(45deg) } 60% { opacity: .6 } }
.dd-kandil { position: absolute; top: 0; width: 64px; display: none; transform-origin: 50% 0; animation: dd-sway 4.2s ease-in-out infinite alternate; }
.dd-kandil-l { left: 4%; }
.dd-kandil-r { right: 4%; animation-delay: -2s; }
@keyframes dd-sway { from { transform: rotate(-3deg) } to { transform: rotate(3deg) } }
@media (min-width: 900px) { .dd-kandil { display: block; } }
@media (min-width: 1300px) { .dd-kandil { width: 84px; } .dd-kandil-l { left: 7%; } .dd-kandil-r { right: 7%; } }
.dd-horizon { position: absolute; left: -10%; right: -10%; bottom: -18vh; height: 46vh;
  background: radial-gradient(50% 60% at 50% 70%, rgba(255,138,31,.32), rgba(215,38,61,.16) 50%, rgba(10,15,51,0) 75%); transition: opacity 1.2s ease; opacity: .85; }
.dd-atmo::after { content: ""; position: absolute; inset: 0; opacity: 0; transition: opacity 1.6s ease;
  background: radial-gradient(120% 70% at 50% 100%, rgba(255,182,39,.42), rgba(229,72,155,.18) 45%, rgba(255,182,39,.06) 75%), linear-gradient(180deg, rgba(255,138,31,.10), rgba(0,0,0,0) 40%); }
.dd-atmo.is-warm::after { opacity: 1; }
.dd-atmo.is-warm .dd-horizon { opacity: 1; background: radial-gradient(60% 70% at 50% 70%, rgba(255,182,39,.55), rgba(229,72,155,.22) 55%, rgba(10,15,51,0) 80%); }
.dd-ring { position: absolute; left: 0; right: 0; bottom: 0; height: 34px; opacity: .55; }
@media (min-width: 768px) { .dd-ring { height: 54px; opacity: .65; } }
.dd-dancer { position: absolute; bottom: 0; width: 22px; fill: #05081F; stroke: #05081F; animation: dd-hop .9s ease-in-out infinite alternate; }
@media (min-width: 768px) { .dd-dancer { width: 34px; } }
@keyframes dd-hop { from { transform: translateY(0) } to { transform: translateY(-4px) } }
@media (prefers-reduced-motion: reduce) {
  .dd-star-tw, .dd-bulb, .dd-spark, .dd-kandil, .dd-dancer { animation: none !important; }
  .dd-spark { opacity: .6; }
}
`;

export default memo(AtmosphereImpl);
