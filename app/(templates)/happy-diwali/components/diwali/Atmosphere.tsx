"use client";

// The Diwali night around every scene: a moonless sky (Diwali falls on
// amavasya, the new moon, which is why every lamp matters) washed deep
// maroon-red by a whole town of lamps, warm bokeh, a few stars, a marigold
// toran strung along the top edge, paper sky lanterns drifting up, little
// fireworks blooming far away, and a sleepy town along the bottom whose windows
// and light strings come on as she goes (`glow`, 0 → 1, rises scene by scene).
//
// Fixed, behind the scenes, pointer-events none, aria-hidden. Everything moves
// on transform/opacity only; reduced motion keeps it all still.

import { useMemo, type ReactElement } from "react";

/** One swag of the toran: a sagging string with marigolds and a mango leaf, tiled along the top edge. */
const TORAN_SVG = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='132' height='44' viewBox='0 0 132 44'>
<path d='M0 4 Q66 34 132 4' fill='none' stroke='#7A4A12' stroke-width='1.4'/>
${[0.1, 0.24, 0.38, 0.5, 0.62, 0.76, 0.9]
  .map((t) => {
    const x = 132 * t;
    const y = 4 + 30 * 4 * t * (1 - t) * 0.5 + 1;
    const c = t === 0.5 ? "#FF5A1F" : t === 0.24 || t === 0.76 ? "#FFC83D" : "#FF9A1F";
    return `<circle cx='${x.toFixed(1)}' cy='${y.toFixed(1)}' r='5.4' fill='${c}'/><circle cx='${x.toFixed(1)}' cy='${y.toFixed(1)}' r='2.4' fill='#C2410C' opacity='.55'/>`;
  })
  .join("")}
<path d='M66 20 q-6 8 0 18 q6 -10 0 -18z' fill='#2F8F4E'/><path d='M66 21 v15' stroke='#1E6B37' stroke-width='.8'/>
<circle cx='0' cy='4' r='4' fill='#FF5FA2'/><circle cx='132' cy='4' r='4' fill='#FF5FA2'/>
</svg>`);

const CSS = `
.dw-atmo { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;
  background: radial-gradient(120% 70% at 50% 0%, #8F1416 0%, #5E0B0F 46%, #2A0507 100%); }
/* a warm red-gold sky glow low on the horizon (the town's lamps), breathing slowly */
.dw-skyglow { position: absolute; inset: 0; background: radial-gradient(90% 45% at 50% 100%, rgba(246,168,33,.32), rgba(179,18,27,.22) 45%, transparent 75%),
  radial-gradient(60% 40% at 12% 18%, rgba(179,18,27,.35), transparent 70%), radial-gradient(60% 40% at 88% 22%, rgba(179,18,27,.3), transparent 70%); }
.dw-skyglow::after { content: ""; position: absolute; inset: 0; background: radial-gradient(70% 30% at 50% 100%, rgba(255,207,90,.22), transparent 70%); animation: dw-breathe 5.5s ease-in-out infinite alternate; will-change: opacity; }
@keyframes dw-breathe { from { opacity: .45 } to { opacity: 1 } }
/* soft out-of-focus diya lights (bokeh), drifting a little */
.dw-bokeh { position: absolute; border-radius: 50%; background: radial-gradient(circle, rgba(255,207,90,.55), rgba(246,168,33,.18) 45%, transparent 70%); will-change: transform, opacity; animation: dw-bok 9s ease-in-out infinite alternate; }
@keyframes dw-bok { from { transform: translate(0,0) scale(1); opacity: .5 } to { transform: translate(12px,-16px) scale(1.15); opacity: .95 } }
/* hanging akash kandils (star lanterns) at the two top corners, swaying */
.dw-kandil { position: absolute; top: 0; width: 46px; transform-origin: 50% 0; animation: dw-sway 4.6s ease-in-out infinite alternate; filter: drop-shadow(0 0 16px rgba(255,170,40,.65)); }
.dw-kandil.r { animation-duration: 5.3s; animation-delay: -2s; }
@keyframes dw-sway { from { transform: rotate(-4deg) } to { transform: rotate(4deg) } }
@media (max-width: 767px) { .dw-kandil { display: none; } }
.dw-stars { position: absolute; inset: 0 0 45% 0; opacity: .7; }
.dw-stars > div { position: absolute; inset: 0; }
.dw-stars i { position: absolute; width: 2px; height: 2px; border-radius: 50%; background: #FFF6E3; opacity: .5; }
.dw-stars .tw1, .dw-stars .tw2 { will-change: opacity; }
.dw-stars .tw1 { animation: dw-tw 3.8s ease-in-out infinite; }
.dw-stars .tw2 { animation: dw-tw 5.4s ease-in-out infinite 1.2s; }
.dw-stars .tw1 i, .dw-stars .tw2 i { opacity: 1; }
.dw-stars .tw2 i { width: 1.5px; height: 1.5px; background: #FFE3A3; }
@keyframes dw-tw { 0%,100% { opacity: .2 } 50% { opacity: .9 } }

/* The toran: tiled swags along the very top (behind the trail and the logo). */
.dw-toran { position: absolute; left: -20px; right: -20px; top: -6px; height: 44px; background: url("data:image/svg+xml,${TORAN_SVG}") repeat-x 0 0 / 132px 44px; opacity: .92;
  filter: drop-shadow(0 4px 8px rgba(255,140,30,.25)); }
@media (min-width: 768px) { .dw-toran { height: 54px; background-size: 162px 54px; } }

/* The town: a silhouette strip along the bottom, windows lit by the glow. */
.dw-town { position: absolute; left: 0; right: 0; bottom: 0; height: clamp(90px, 17dvh, 170px); }
.dw-town svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.dw-town .win { transition: opacity 1.4s ease; }
.dw-ground { position: absolute; left: -10%; right: -10%; bottom: -12%; height: 55%; background: radial-gradient(50% 60% at 50% 100%, rgba(255,180,60,.6), rgba(214,60,30,.25) 55%, transparent 75%);
  transition: opacity 1.6s ease; }

/* Paper sky lanterns rising (each one a single composited translate). */
.dw-lantern { position: absolute; bottom: -80px; width: 22px; height: 30px; will-change: transform; animation: dw-rise linear infinite; opacity: 0; }
.dw-lantern b { position: absolute; inset: 0; border-radius: 40% 40% 30% 30% / 30% 30% 45% 45%;
  background: radial-gradient(60% 55% at 50% 70%, #FFF1B8 0%, #F6A821 45%, #C8321A 100%); box-shadow: 0 0 18px 4px rgba(255,170,60,.45); }
.dw-lantern b::after { content: ""; position: absolute; left: 30%; right: 30%; bottom: -3px; height: 4px; border-radius: 2px; background: #7A2A0C; }
@keyframes dw-rise { 0% { transform: translate(0, 0) rotate(-3deg); opacity: 0 } 8% { opacity: .85 } 50% { transform: translate(18px, -55vh) rotate(3deg) } 85% { opacity: .7 } 100% { transform: translate(-6px, -112vh) rotate(-2deg); opacity: 0 } }

/* Far-away fireworks: a ring of sparks blooming and fading. */
.dw-far { position: absolute; width: 90px; height: 90px; margin: -45px 0 0 -45px; border-radius: 50%; opacity: 0; will-change: transform, opacity;
  background:
    radial-gradient(circle at 50% 8%, var(--c) 0 2.5px, transparent 3px), radial-gradient(circle at 50% 92%, var(--c) 0 2.5px, transparent 3px),
    radial-gradient(circle at 8% 50%, var(--c) 0 2.5px, transparent 3px), radial-gradient(circle at 92% 50%, var(--c) 0 2.5px, transparent 3px),
    radial-gradient(circle at 20% 20%, var(--c) 0 2px, transparent 2.5px), radial-gradient(circle at 80% 20%, var(--c) 0 2px, transparent 2.5px),
    radial-gradient(circle at 20% 80%, var(--c) 0 2px, transparent 2.5px), radial-gradient(circle at 80% 80%, var(--c) 0 2px, transparent 2.5px),
    radial-gradient(circle, rgba(255,240,200,.35) 0 6px, transparent 30px);
  animation: dw-far 6.5s ease-out infinite; }
@keyframes dw-far { 0% { transform: scale(.15); opacity: 0 } 4% { opacity: 1 } 22% { transform: scale(1); opacity: .9 } 34% { transform: scale(1.12); opacity: 0 } 100% { transform: scale(1.12); opacity: 0 } }
@media (max-width: 767px) { .dw-far.wide { display: none; } }

@media (prefers-reduced-motion: reduce) {
  .dw-stars .tw1, .dw-stars .tw2 { animation: none; opacity: .6; }
  .dw-lantern, .dw-far { animation: none; display: none; }
  .dw-skyglow::after, .dw-bokeh, .dw-kandil { animation: none; }
}
`;

/** Deterministic pseudo-random (so server and client agree and nothing jumps). */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const LANTERNS = [
  { left: "6%", dur: 26, delay: 0, scale: 0.8 },
  { left: "88%", dur: 31, delay: 7, scale: 1 },
  { left: "18%", dur: 35, delay: 15, scale: 0.65 },
  { left: "74%", dur: 28, delay: 21, scale: 0.75 },
  { left: "95%", dur: 38, delay: 12, scale: 0.55 },
];

const FAR = [
  { left: "14%", top: "26%", c: "#FFD36E", delay: 1, wide: false },
  { left: "84%", top: "18%", c: "#FF8A1E", delay: 3.4, wide: false },
  { left: "8%", top: "52%", c: "#FFF1B8", delay: 5.1, wide: true },
  { left: "92%", top: "46%", c: "#FFB23F", delay: 2.2, wide: true },
];

const BOKEH = [
  { left: "6%", top: "58%", s: 70 },
  { left: "80%", top: "62%", s: 90 },
  { left: "30%", top: "70%", s: 46 },
  { left: "62%", top: "50%", s: 38 },
  { left: "90%", top: "34%", s: 54 },
  { left: "2%", top: "30%", s: 40 },
];

/** An akash kandil: the star-shaped paper lantern hung outside homes for Diwali. */
function Kandil() {
  return (
    <svg viewBox="0 0 46 150" width="46" height="150" aria-hidden style={{ display: "block", overflow: "visible" }}>
      <path d="M23 0 V58" stroke="#C98A3A" strokeWidth="1.2" />
      <path d="M23 58 L32 72 L46 76 L34 86 L37 102 L23 94 L9 102 L12 86 L0 76 L14 72 Z" fill="#E0301E" stroke="#FFCF5A" strokeWidth="1.6" />
      <circle cx="23" cy="81" r="7" fill="#FFF1B8" opacity=".95" />
      <circle cx="23" cy="81" r="12" fill="rgba(255,207,90,.35)" />
      {[-8, -3, 2, 7].map((dx, k) => (
        <path key={k} d={`M${23 + dx} 96 q${dx * 0.2} 22 ${dx * 0.4} ${34 + (k % 2) * 8}`} stroke={k % 2 ? "#FFCF5A" : "#FF8A1E"} strokeWidth="1.6" fill="none" />
      ))}
    </svg>
  );
}

/** Little houses along the bottom: x, width, height, roof kind. Windows are drawn per house. */
const HOUSES: { x: number; w: number; h: number; roof: "flat" | "dome" | "peak" }[] = [
  { x: 0, w: 70, h: 62, roof: "flat" },
  { x: 66, w: 54, h: 84, roof: "dome" },
  { x: 116, w: 80, h: 56, roof: "peak" },
  { x: 192, w: 60, h: 92, roof: "flat" },
  { x: 248, w: 74, h: 66, roof: "dome" },
  { x: 318, w: 58, h: 78, roof: "peak" },
  { x: 372, w: 84, h: 58, roof: "flat" },
  { x: 452, w: 56, h: 96, roof: "dome" },
  { x: 504, w: 76, h: 64, roof: "peak" },
  { x: 576, w: 64, h: 82, roof: "flat" },
  { x: 636, w: 84, h: 60, roof: "dome" },
];
const TOWN_W = 720;
const TOWN_H = 110;

function Town({ glow }: { glow: number }) {
  const r = rng(7);
  return (
    <svg viewBox={`0 0 ${TOWN_W} ${TOWN_H}`} preserveAspectRatio="xMidYMax slice" aria-hidden>
      <defs>
        <linearGradient id="dw-house" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3A0609" />
          <stop offset="1" stopColor="#1C0204" />
        </linearGradient>
      </defs>
      {HOUSES.map((h, i) => {
        const top = TOWN_H - h.h;
        const wins: ReactElement[] = [];
        for (let row = 0; row < Math.floor((h.h - 22) / 18); row++) {
          for (let col = 0; col < Math.floor((h.w - 12) / 18); col++) {
            const on = r() < 0.25 + glow * 0.6;
            wins.push(
              <rect key={`${row}-${col}`} className="win" x={h.x + 10 + col * 18} y={top + 14 + row * 18} width={8} height={10} rx={1.5} fill="#FFC75A" opacity={on ? 0.95 : 0.1} />,
            );
          }
        }
        return (
          <g key={i}>
            {h.roof === "dome" && <path d={`M${h.x + h.w * 0.25} ${top} Q${h.x + h.w / 2} ${top - 22} ${h.x + h.w * 0.75} ${top} Z`} fill="url(#dw-house)" />}
            {h.roof === "peak" && <path d={`M${h.x - 2} ${top} L${h.x + h.w / 2} ${top - 16} L${h.x + h.w + 2} ${top} Z`} fill="url(#dw-house)" />}
            <rect x={h.x} y={top} width={h.w} height={h.h} fill="url(#dw-house)" />
            {wins}
            {/* a string of fairy lights along the parapet */}
            <path d={`M${h.x + 2} ${top + 4} Q${h.x + h.w / 2} ${top + 12} ${h.x + h.w - 2} ${top + 4}`} fill="none" stroke="rgba(255,211,110,.35)" strokeWidth="0.8" />
            {Array.from({ length: 5 }, (_, k) => {
              const t = (k + 0.5) / 5;
              const x = h.x + 2 + (h.w - 4) * t;
              const y = top + 4 + 8 * 4 * t * (1 - t) * 0.5 + 0.5;
              const colors = ["#FFCF5A", "#FF8A1E", "#FFF1B8", "#F6A821"];
              return <circle key={k} className="win" cx={x} cy={y} r={1.6} fill={colors[(i + k) % 4]} opacity={glow > 0.15 ? 1 : 0.25} />;
            })}
          </g>
        );
      })}
    </svg>
  );
}

export default function Atmosphere({ glow }: { glow: number }) {
  const stars = useMemo(() => {
    const r = rng(42);
    return [0, 1, 2].map(() => Array.from({ length: 14 }, () => ({ x: r() * 100, y: r() * 100 })));
  }, []);
  return (
    <div className="dw-atmo" aria-hidden>
      <style>{CSS}</style>
      <div className="dw-skyglow" />
      {BOKEH.map((b, i) => (
        <span key={`b${i}`} className="dw-bokeh" style={{ left: b.left, top: b.top, width: b.s, height: b.s, animationDelay: `${-i * 1.7}s` }} />
      ))}
      <div className="dw-stars">
        {stars.map((layer, li) => (
          <div key={li} className={li === 0 ? undefined : `tw${li}`}>
            {layer.map((s, i) => (
              <i key={i} style={{ left: `${s.x}%`, top: `${s.y}%` }} />
            ))}
          </div>
        ))}
      </div>
      {FAR.map((f, i) => (
        <span key={i} className={`dw-far${f.wide ? " wide" : ""}`} style={{ left: f.left, top: f.top, ["--c" as string]: f.c, animationDelay: `${f.delay}s` }} />
      ))}
      {LANTERNS.map((l, i) => (
        <span key={i} className="dw-lantern" style={{ left: l.left, animationDuration: `${l.dur}s`, animationDelay: `${l.delay}s`, scale: String(l.scale) }}>
          <b />
        </span>
      ))}
      <div className="dw-ground" style={{ opacity: 0.25 + glow * 0.75 }} />
      <div className="dw-town">
        <Town glow={glow} />
      </div>
      <span className="dw-kandil" style={{ left: "4%" }}>
        <Kandil />
      </span>
      <span className="dw-kandil r" style={{ right: "4%" }}>
        <Kandil />
      </span>
      <div className="dw-toran" />
    </div>
  );
}
