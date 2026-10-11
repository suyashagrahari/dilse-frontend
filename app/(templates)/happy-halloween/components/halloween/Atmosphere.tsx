"use client";

// The night around the haunted house: stars, a big soft moon with clouds
// drifting over it, three low fog bands sliding at different speeds, a bat or
// two crossing on a slow sine path every 10–14 s (never a swarm), fireflies on
// a small canvas, and the owner's web GIFs flush in the top corners. After YES the moon turns into a
// heart and the whole night warms from indigo to amber.
//
// Wide screens (768px+) get the whole night, full-bleed: a big moon, the
// cobwebs in the real screen corners, cute bats across the sky and a
// graveyard along the bottom edge (rolling hills, a little haunted house on
// the far hill, tombstones, an iron fence, a bare tree, lit pumpkins). The
// graveyard keeps to the flanks, so the room's content column stays clear.
//
// Fixed, behind the rooms, pointer-events none, aria-hidden. Everything moves
// on transform/opacity only. Reduced motion: still fog, no bats, fireflies
// drawn once, the moon/heart swap is a plain fade, both corner webs are the
// still one.

import { useEffect, useRef } from "react";
import { useReducedMotion } from "../../../_valentine/kit";
import { Bat, MoonHeart } from "./art";
import { HW_GIF } from "./stage";

const CSS = `
.hw-atmo { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.hw-stars { position: absolute; inset: 0 0 40% 0; }
/* Three star layers: one still, two twinkling as a whole — two composited
   opacity animations instead of ~30 per-star ones. */
.hw-stars > div { position: absolute; inset: 0; }
.hw-stars i { position: absolute; width: 2px; height: 2px; border-radius: 50%; background: #F7F3FF; opacity: .55; }
.hw-stars .tw1, .hw-stars .tw2 { will-change: opacity; }
.hw-stars .tw1 { animation: hw-tw 3.6s ease-in-out infinite; }
.hw-stars .tw2 { animation: hw-tw 5.2s ease-in-out infinite 1s; }
.hw-stars .tw1 i, .hw-stars .tw2 i { opacity: 1; }
.hw-stars .tw2 i { width: 1.5px; height: 1.5px; }
@keyframes hw-tw { 0%,100% { opacity: .2 } 50% { opacity: .85 } }
.hw-moon { position: absolute; top: 64px; right: calc(var(--vw-gutter, 0px) - 64px); filter: drop-shadow(0 0 28px rgba(255,235,170,.45)); }
/* Phones: tuck the moon half off the edge so it never sits under a room's heading. */
@media (max-width: 767px) { .hw-moon { top: 92px; right: -36px; transform: scale(.76); transform-origin: top right; } }
/* Soft edges from the gradient itself — a blur() filter on a moving layer is not composited. */
.hw-cloud { position: absolute; height: 38px; border-radius: 50%; background: radial-gradient(closest-side, rgba(247,243,255,.12) 40%, rgba(247,243,255,0)); will-change: transform; }
.hw-cloud.c1 { top: 98px; width: 160px; animation: hw-cloud 46s linear infinite; }
.hw-cloud.c2 { top: 136px; width: 110px; animation: hw-cloud 64s linear infinite -30s; opacity: .7; }
@keyframes hw-cloud { from { transform: translateX(-30vw) } to { transform: translateX(130vw) } }
.hw-fog { position: absolute; left: 0; width: 200%; bottom: 0; pointer-events: none; }
.hw-fog.f1 { height: 34vh; background: radial-gradient(40% 60% at 25% 100%, rgba(207,198,232,.20), transparent 70%), radial-gradient(40% 60% at 75% 100%, rgba(207,198,232,.18), transparent 70%); animation: hw-fog 38s linear infinite; }
.hw-fog.f2 { height: 26vh; background: radial-gradient(35% 55% at 15% 100%, rgba(183,156,255,.16), transparent 70%), radial-gradient(35% 55% at 60% 100%, rgba(183,156,255,.14), transparent 70%); animation: hw-fog 58s linear infinite reverse; }
.hw-fog.f3 { height: 18vh; background: radial-gradient(30% 70% at 40% 100%, rgba(247,243,255,.16), transparent 70%), radial-gradient(30% 70% at 90% 100%, rgba(247,243,255,.14), transparent 70%); animation: hw-fog 80s linear infinite; }
@keyframes hw-fog { from { transform: translateX(0) } to { transform: translateX(-50%) } }
.hw-bat { position: absolute; left: 0; opacity: 0; }
.hw-bat.b1 { top: 22%; animation: hw-batx 13s linear infinite 2s; }
.hw-bat.b2 { top: 38%; animation: hw-batx 17s linear infinite 9s; }
/* A thin lilac rim instead of a drop-shadow filter (which blocks compositing of the flight). */
.hw-bat svg path { stroke: rgba(183,156,255,.55); stroke-width: 1.2px; }
.hw-bat > span { display: block; animation: hw-baty 1.6s ease-in-out infinite alternate; }
.hw-bat > span > span { display: block; animation: hw-flap .26s ease-in-out infinite alternate; transform-origin: 50% 40%; }
@keyframes hw-batx { 0% { transform: translateX(-12vw); opacity: 0 } 3% { opacity: .85 } 45% { opacity: .85 } 50% { transform: translateX(112vw); opacity: 0 } 100% { transform: translateX(112vw); opacity: 0 } }
@keyframes hw-baty { from { transform: translateY(-14px) } to { transform: translateY(14px) } }
@keyframes hw-flap { from { transform: scaleY(1) } to { transform: scaleY(.45) } }
.hw-moon { transition: opacity .8s ease; }
.hw-atmo.is-grand .hw-moon { opacity: 0; }
/* The owner's web GIFs, flush in the true screen corners (zero margin): grand on the doorstep, a little
   smaller in the other rooms (scaled, so it is one composited change). Top-left: the pale web with the cute
   spider, behind the trail. Top-right: the corner web whose red spider lowers itself, mirrored, and its black
   silk turned to moonlit white (invert + a half-turn of hue keeps the spider red). */
.hw-web { position: absolute; top: 0; height: auto; pointer-events: none; transform-origin: top left; transition: transform .9s cubic-bezier(.3,.7,.2,1), opacity .9s; }
.hw-web.l { left: 0; width: min(48vw, 230px); opacity: .92; }
.hw-web.r { right: 0; width: min(40vw, 196px); transform-origin: top right; opacity: .9; }
.hw-web.r.is-moon { filter: invert(1) hue-rotate(180deg) brightness(.92); }
.hw-web.r img, .hw-web.l img { display: block; width: 100%; height: auto; }
.hw-web.r img { transform: scaleX(-1); }
.hw-atmo:not(.is-grand) .hw-web { transform: scale(.74); opacity: .78; }
.hw-warm { position: absolute; inset: 0; background: radial-gradient(120% 80% at 50% 0%, rgba(255,170,90,.38), rgba(255,120,150,.20) 50%, rgba(255,190,110,.10) 100%); opacity: 0; transition: opacity 2s ease; }
.hw-warm.is-on { opacity: 1; }
.hw-flies { position: absolute; inset: 0; width: 100%; height: 100%; }
.hw-land, .hw-gifbats, .hw-bat.b3 { display: none; }
@media (min-width: 768px) {
  .hw-land { display: block; position: absolute; left: 0; right: 0; bottom: 0; height: clamp(200px, 36vh, 420px); }
  .hw-land svg { display: block; width: 100%; height: 100%; }
  .hw-land-house { transition: opacity .9s ease; }
  .hw-atmo.is-grand .hw-land-house { opacity: 0; }
  .hw-land-win { animation: hw-land-flk 4.4s steps(1, end) infinite; }
  @keyframes hw-land-flk { 0%, 100% { opacity: 1 } 40% { opacity: .7 } 43% { opacity: 1 } 77% { opacity: .82 } }
  .hw-moon { top: 10vh; right: 9vw; transform: scale(1.9); transform-origin: top right; }
  .hw-cloud.c1 { top: 16vh; width: 260px; height: 54px; }
  .hw-cloud.c2 { top: 24vh; width: 180px; height: 44px; }
  .hw-web.l { width: clamp(220px, 19vw, 360px); }
  .hw-web.r { width: clamp(190px, 16vw, 300px); }
  .hw-gifbats { display: block; position: absolute; left: 7vw; top: 15vh; width: clamp(110px, 9vw, 170px); height: auto; opacity: .95; }
  .hw-bat.b3 { display: block; top: 12%; animation: hw-batx 21s linear infinite 5s; }
  .hw-fog.f1 { height: 30vh; }
}
@media (prefers-reduced-motion: reduce) {
  .hw-land-win { animation: none !important; }
  .hw-stars > div, .hw-cloud, .hw-fog, .hw-bat, .hw-bat > span, .hw-bat > span > span { animation: none !important; }
  .hw-web { transition: none; }
  .hw-bat { display: none; }
  .hw-stars .tw1 i, .hw-stars .tw2 i { opacity: .55; }
}
`;

/** Deterministic star field (no hydration mismatch, no Math.random in render). */
const STARS = Array.from({ length: 46 }, (_, i) => {
  const r = (k: number) => {
    const x = Math.sin((i + 1) * 12.9898 + k * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  return { left: r(1) * 100, top: r(2) * 100 };
});

function Fireflies({ count = 16, warm }: { count?: number; warm: boolean }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const reduced = useReducedMotion();
  const warmRef = useRef(warm);
  useEffect(() => {
    warmRef.current = warm;
  }, [warm]);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let w = 0;
    let h = 0;
    // Soft glows need no retina pixels: 1× halves-to-quarters the fill cost of
    // a full-screen canvas, and 30 fps is plenty for drifting fireflies.
    const dpr = 1;
    const flies = Array.from({ length: count }, (_, i) => ({
      x: Math.random(),
      y: 0.35 + Math.random() * 0.6,
      r: 1.6 + Math.random() * 1.8,
      sp: 0.00008 + Math.random() * 0.00012,
      ph: Math.random() * Math.PI * 2,
      amp: 0.02 + Math.random() * 0.04,
      hue: i % 3,
    }));
    const size = () => {
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const f of flies) {
        const x = ((f.x + t * f.sp) % 1) * w;
        const y = (f.y + Math.sin(t * 0.0009 + f.ph) * f.amp) * h;
        const a = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(t * 0.002 + f.ph));
        const col = warmRef.current ? (f.hue === 0 ? "255,180,120" : f.hue === 1 ? "255,158,196" : "255,210,122") : f.hue === 0 ? "155,231,196" : f.hue === 1 ? "255,210,122" : "183,156,255";
        const g = ctx.createRadialGradient(x, y, 0, x, y, f.r * 5);
        g.addColorStop(0, `rgba(${col},${a})`);
        g.addColorStop(1, `rgba(${col},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, f.r * 5, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      if (t - last >= 32) {
        last = t;
        draw(t);
      }
      raf = requestAnimationFrame(loop);
    };
    if (reduced) draw(4000);
    else raf = requestAnimationFrame(loop);
    const onResize = () => {
      size();
      if (reduced) draw(4000);
    };
    window.addEventListener("resize", onResize);
    const onVis = () => {
      if (reduced) return;
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [count, reduced]);
  return <canvas ref={ref} className="hw-flies" aria-hidden />;
}

export default function Atmosphere({ warm = false, grand = false }: { warm?: boolean; grand?: boolean }) {
  const reduced = useReducedMotion();
  return (
    <div className={`hw-atmo${grand ? " is-grand" : ""}`} aria-hidden>
      <style>{CSS}</style>
      <div className="hw-stars">
        {(["tw1", "tw2", "still"] as const).map((layer, g) => (
          <div key={layer} className={layer}>
            {STARS.filter((_, i) => (i + 1) % 3 === g).map((s, i) => (
              <i key={i} style={{ left: `${s.left}%`, top: `${s.top}%` }} />
            ))}
          </div>
        ))}
      </div>
      <div className="hw-moon">
        <MoonHeart heart={warm} size={86} />
      </div>
      <span className="hw-cloud c1" />
      <span className="hw-cloud c2" />
      <div className={`hw-warm${warm ? " is-on" : ""}`} />
      <Fireflies warm={warm} />
      <span className="hw-bat b1">
        <span>
          <span>
            <Bat size={44} color="#0B0718" />
          </span>
        </span>
      </span>
      <span className="hw-bat b2">
        <span>
          <span>
            <Bat size={30} color="#120C22" />
          </span>
        </span>
      </span>
      <span className="hw-bat b3">
        <span>
          <span>
            <Bat size={36} color="#0B0718" />
          </span>
        </span>
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="hw-gifbats" src={HW_GIF.bats} alt="" width={360} height={360} loading="lazy" decoding="async" />
      <Graveyard />
      <div className="hw-fog f1" />
      <div className="hw-fog f2" />
      <div className="hw-fog f3" />
      <span className="hw-web l">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={HW_GIF.cuteWeb} alt="" width={300} height={300} decoding="async" draggable={false} />
      </span>
      {/* reduced motion: the still web in this corner too */}
      <span className={`hw-web r${reduced ? "" : " is-moon"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={reduced ? HW_GIF.cuteWeb : HW_GIF.cornerWeb} alt="" width={reduced ? 300 : 280} height={reduced ? 300 : 362} decoding="async" draggable={false} />
      </span>
    </div>
  );
}

/** Spear-topped iron fence from x0 to x1 (the drawing's units). */
function fence(x0: number, x1: number) {
  let d = `M${x0} 272 L${x1} 272 M${x0} 304 L${x1} 304`;
  for (let x = x0 + 6; x <= x1; x += 22) d += ` M${x} 318 L${x} 262 M${x - 4} 264 L${x} 254 L${x + 4} 264`;
  return d;
}

/** The wide screens' graveyard along the bottom edge (decorative). Its middle stays low and empty for the room's content. */
function Graveyard() {
  const ink = "#0B0717";
  const stone = "#372C55";
  return (
    <div className="hw-land">
      <svg viewBox="0 0 1600 360" preserveAspectRatio="xMidYMax slice" aria-hidden>
        <defs>
          <radialGradient id="hw-land-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="rgba(255,190,90,.55)" />
            <stop offset="1" stopColor="rgba(255,190,90,0)" />
          </radialGradient>
          <linearGradient id="hw-land-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#261A44" />
            <stop offset="1" stopColor="#171029" />
          </linearGradient>
        </defs>
        {/* far hills */}
        <path d="M0 236 C170 196 330 194 480 226 C660 266 900 268 1100 236 C1260 210 1430 196 1600 226 L1600 360 L0 360 Z" fill="url(#hw-land-far)" />
        {/* the little haunted house on the far hill (hidden on the doorstep, where the big one stands) */}
        <g className="hw-land-house">
          <path d="M150 206 L232 202 L234 240 L148 242 Z" fill="#140D26" />
          <path d="M138 208 L192 156 L244 204 Z" fill="#140D26" />
          <path d="M222 214 L254 212 L256 242 L222 242 Z" fill="#140D26" />
          <path d="M216 216 L238 160 L262 214 Z" fill="#140D26" />
          <path d="M238 160 L239 148" stroke="#140D26" strokeWidth="3" />
          <g className="hw-land-win" fill="#FFC65C">
            <rect x="166" y="214" width="12" height="14" rx="2" />
            <rect x="200" y="214" width="12" height="14" rx="2" opacity=".7" />
            <circle cx="191" cy="186" r="6" />
            <rect x="233" y="220" width="9" height="12" rx="2" />
          </g>
        </g>
        {/* near ground */}
        <path d="M0 300 C240 282 520 290 800 302 C1080 312 1330 288 1600 296 L1600 360 L0 360 Z" fill="#0F0A1E" />
        {/* iron fences on the flanks */}
        <path d={fence(-10, 470)} stroke={ink} strokeWidth="4" fill="none" strokeLinejoin="round" />
        <path d={fence(1130, 1610)} stroke={ink} strokeWidth="4" fill="none" strokeLinejoin="round" />
        {/* tombstones */}
        <g fill={stone} stroke={ink} strokeWidth="3">
          <path d="M300 318 L300 272 Q320 248 340 272 L340 318 Z" />
          <path d="M372 318 L372 286 L360 286 L360 272 L372 272 L372 260 L384 260 L384 272 L396 272 L396 286 L384 286 L384 318 Z" />
          <path d="M420 318 L420 292 Q433 278 446 292 L446 318 Z" />
          <path d="M1160 318 L1160 284 Q1174 266 1188 284 L1188 318 Z" />
          <path d="M1220 318 L1220 288 L1206 288 L1206 274 L1220 274 L1220 260 L1234 260 L1234 274 L1248 274 L1248 288 L1234 288 L1234 318 Z" />
          <path d="M1276 318 L1276 268 Q1300 240 1324 268 L1324 318 Z" />
        </g>
        <path d="M1300 296 C1290 289 1291 281 1296 282 C1298 282.4 1300 285 1300 285 C1300 285 1302 282.4 1304 282 C1309 281 1310 289 1300 296Z" fill="#FF9EC4" opacity=".8" />
        <path d="M312 284 L328 284 M312 292 L328 292" stroke="rgba(14,10,28,.6)" strokeWidth="2.5" />
        {/* the bare tree, right */}
        <path
          d="M1468 336 C1476 282 1482 232 1476 192 C1472 162 1458 142 1432 126 L1438 118 C1460 130 1476 146 1484 164 C1488 132 1482 102 1462 76 L1470 72 C1492 96 1498 126 1496 154 C1506 132 1526 118 1552 112 L1554 120 C1530 128 1514 144 1508 170 C1504 222 1508 282 1520 336 Z"
          fill={ink}
        />
        <path d="M1446 122 C1436 110 1426 106 1414 106 M1466 80 C1462 66 1454 58 1442 52 M1540 116 C1552 104 1566 100 1580 102 M1478 186 C1494 180 1506 172 1514 160" stroke={ink} strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* lit pumpkins */}
        {[
          [486, 318, 15],
          [1112, 322, 12],
          [1360, 320, 17],
          [262, 322, 11],
        ].map(([x, y, r]) => (
          <g key={x}>
            <circle cx={x} cy={y - 4} r={r * 3} fill="url(#hw-land-glow)" />
            <ellipse cx={x} cy={y} rx={r * 1.25} ry={r} fill="#FF8A3D" stroke="#7A3410" strokeWidth="2" />
            <path d={`M${x} ${y - r} l1 -6`} stroke="#6FBF8E" strokeWidth="3" strokeLinecap="round" />
            <path d={`M${x - r * 0.55} ${y - 2} l${r * 0.25} -${r * 0.35} l${r * 0.25} ${r * 0.35} Z M${x + r * 0.05} ${y - 2} l${r * 0.25} -${r * 0.35} l${r * 0.25} ${r * 0.35} Z M${x - r * 0.5} ${y + r * 0.25} Q${x} ${y + r * 0.7} ${x + r * 0.5} ${y + r * 0.25} Z`} fill="#FFE08A" />
          </g>
        ))}
      </svg>
    </div>
  );
}
