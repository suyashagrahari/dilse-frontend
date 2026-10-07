"use client";

// The night around the haunted house: stars, a big soft moon with clouds
// drifting over it, three low fog bands sliding at different speeds, a bat or
// two crossing on a slow sine path every 10–14 s (never a swarm), fireflies on
// a small canvas, and cobwebs in the corners. After YES the moon turns into a
// heart and the whole night warms from indigo to amber.
//
// Fixed, behind the rooms, pointer-events none, aria-hidden. Everything moves
// on transform/opacity only. Reduced motion: still fog, no bats, fireflies
// drawn once, the moon/heart swap is a plain fade.

import { useEffect, useRef } from "react";
import { useReducedMotion } from "../../../_valentine/kit";
import { Bat, Cobweb, MoonHeart } from "./art";

const CSS = `
.hw-atmo { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.hw-stars { position: absolute; inset: 0 0 40% 0; }
.hw-stars i { position: absolute; width: 2px; height: 2px; border-radius: 50%; background: #F7F3FF; opacity: .55; }
.hw-stars i:nth-child(3n) { animation: hw-tw 3.6s ease-in-out infinite; }
.hw-stars i:nth-child(3n+1) { animation: hw-tw 5.2s ease-in-out infinite 1s; width: 1.5px; height: 1.5px; }
@keyframes hw-tw { 0%,100% { opacity: .2 } 50% { opacity: .85 } }
.hw-moon { position: absolute; top: 64px; right: calc(var(--vw-gutter, 0px) - 64px); filter: drop-shadow(0 0 28px rgba(255,235,170,.45)); }
/* Phones: tuck the moon half off the edge so it never sits under a room's heading. */
@media (max-width: 767px) { .hw-moon { top: 96px; right: -24px; transform: scale(.76); transform-origin: top right; } }
.hw-cloud { position: absolute; height: 26px; border-radius: 30px; background: rgba(247,243,255,.10); filter: blur(6px); }
.hw-cloud.c1 { top: 104px; width: 160px; animation: hw-cloud 46s linear infinite; }
.hw-cloud.c2 { top: 142px; width: 110px; animation: hw-cloud 64s linear infinite -30s; opacity: .7; }
@keyframes hw-cloud { from { transform: translateX(-30vw) } to { transform: translateX(130vw) } }
.hw-fog { position: absolute; left: 0; width: 200%; bottom: 0; pointer-events: none; }
.hw-fog.f1 { height: 34vh; background: radial-gradient(40% 60% at 25% 100%, rgba(207,198,232,.20), transparent 70%), radial-gradient(40% 60% at 75% 100%, rgba(207,198,232,.18), transparent 70%); animation: hw-fog 38s linear infinite; }
.hw-fog.f2 { height: 26vh; background: radial-gradient(35% 55% at 15% 100%, rgba(183,156,255,.16), transparent 70%), radial-gradient(35% 55% at 60% 100%, rgba(183,156,255,.14), transparent 70%); animation: hw-fog 58s linear infinite reverse; }
.hw-fog.f3 { height: 18vh; background: radial-gradient(30% 70% at 40% 100%, rgba(247,243,255,.16), transparent 70%), radial-gradient(30% 70% at 90% 100%, rgba(247,243,255,.14), transparent 70%); animation: hw-fog 80s linear infinite; }
@keyframes hw-fog { from { transform: translateX(0) } to { transform: translateX(-50%) } }
.hw-bat { position: absolute; left: 0; opacity: 0; }
.hw-bat.b1 { top: 22%; animation: hw-batx 13s linear infinite 2s; }
.hw-bat.b2 { top: 38%; animation: hw-batx 17s linear infinite 9s; }
.hw-bat svg { filter: drop-shadow(0 0 3px rgba(183,156,255,.55)); }
.hw-bat > span { display: block; animation: hw-baty 1.6s ease-in-out infinite alternate; }
.hw-bat > span > span { display: block; animation: hw-flap .26s ease-in-out infinite alternate; transform-origin: 50% 40%; }
@keyframes hw-batx { 0% { transform: translateX(-12vw); opacity: 0 } 3% { opacity: .85 } 45% { opacity: .85 } 50% { transform: translateX(112vw); opacity: 0 } 100% { transform: translateX(112vw); opacity: 0 } }
@keyframes hw-baty { from { transform: translateY(-14px) } to { transform: translateY(14px) } }
@keyframes hw-flap { from { transform: scaleY(1) } to { transform: scaleY(.45) } }
.hw-web { position: absolute; top: 0; opacity: .9; }
.hw-warm { position: absolute; inset: 0; background: radial-gradient(120% 80% at 50% 0%, rgba(255,170,90,.38), rgba(255,120,150,.20) 50%, rgba(255,190,110,.10) 100%); opacity: 0; transition: opacity 2s ease; }
.hw-warm.is-on { opacity: 1; }
.hw-flies { position: absolute; inset: 0; width: 100%; height: 100%; }
@media (prefers-reduced-motion: reduce) {
  .hw-stars i, .hw-cloud, .hw-fog, .hw-bat, .hw-bat > span, .hw-bat > span > span { animation: none !important; }
  .hw-bat { display: none; }
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
    const dpr = Math.min(2, window.devicePixelRatio || 1);
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
    const loop = (t: number) => {
      draw(t);
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

export default function Atmosphere({ warm = false }: { warm?: boolean }) {
  return (
    <div className="hw-atmo" aria-hidden>
      <style>{CSS}</style>
      <div className="hw-stars">
        {STARS.map((s, i) => (
          <i key={i} style={{ left: `${s.left}%`, top: `${s.top}%` }} />
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
      <div className="hw-fog f1" />
      <div className="hw-fog f2" />
      <div className="hw-fog f3" />
      <span className="hw-web" style={{ left: "var(--vw-gutter, 0px)", top: 52 }}>
        <Cobweb size={74} />
      </span>
      <span className="hw-web" style={{ right: "var(--vw-gutter, 0px)", top: 52, transform: "scaleX(-1)" }}>
        <Cobweb size={60} />
      </span>
    </div>
  );
}
