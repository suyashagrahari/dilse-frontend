"use client";

// The whole night behind every room, full-bleed and fixed (z 0, under the
// stage column and the desktop wings): a storm-indigo sky with a moon and
// drifting clouds, the manor on its hill (outside) or candle-lit damask
// walls with an arched window (inside), fog bands, a vignette and a faint
// grain. `phase` paints the arc of the night — storm → night → dawn after YES.
// Lightning is a CSS flash (≤ 2 per 9 s, never > 3/s), only outside, only in
// the storm, and never for family/kids or reduced motion.

import { ManorSilhouette } from "./art";

export type SkyPhase = "storm" | "night" | "dawn";

export default function Backdrop({ phase, place, scene, warm = 0, lit = 0.35, lightning }: { phase: SkyPhase; place: "outside" | "inside"; scene: string; warm?: number; lit?: number; lightning: boolean }) {
  const dawn = phase === "dawn";
  return (
    <div className={`mm-bd is-${phase} is-${place} at-${scene}`} aria-hidden style={{ ["--mm-warm" as string]: String(warm) }}>
      <div className="mm-bdSky" />
      <div className="mm-bdDawn" />
      <div className="mm-bdMoon" />
      <div className="mm-bdCloud c1" />
      <div className="mm-bdCloud c2" />
      <div className="mm-bdCloud c3" />
      <div className="mm-bdOut">
        <div className="mm-bdManor">
          <ManorSilhouette lit={dawn ? 1 : lit} dawn={dawn} />
        </div>
      </div>
      <div className="mm-bdIn">
        <div className="mm-bdWall" />
        <div className="mm-bdWindow">
          <span className="mm-bdWinMoon" />
        </div>
        <div className="mm-bdWarm" />
        <div className="mm-bdFloor" />
      </div>
      <div className="mm-bdFog f1" />
      <div className="mm-bdFog f2" />
      {lightning && <div className="mm-bdFlash" />}
      <div className="mm-bdVignette" />
      <div className="mm-bdGrain" />
      <style>{BD_CSS}</style>
    </div>
  );
}

const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='.5'/></svg>\")";
const DAMASK =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='64' height='88' viewBox='0 0 64 88'><g fill='none' stroke='%23ffffff' stroke-opacity='.05' stroke-width='1.4'><path d='M32 6 C44 20 44 34 32 44 C20 34 20 20 32 6 Z'/><path d='M32 44 C44 54 44 68 32 82 C20 68 20 54 32 44 Z'/><path d='M0 44 C8 36 8 26 0 18 M64 44 C56 36 56 26 64 18 M0 44 C8 52 8 62 0 70 M64 44 C56 52 56 62 64 70'/></g></svg>\")";

const BD_CSS = `
.mm-bd { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; contain: strict; }
.mm-bd > *, .mm-bdOut > *, .mm-bdIn > * { position: absolute; }
.mm-bd.is-inside .mm-bdMoon, .mm-bd.is-inside .mm-bdCloud { opacity: 0; }
.mm-bdMoon, .mm-bdCloud { transition: opacity 1.2s ease; }
.mm-bdSky { inset: 0; background: radial-gradient(120% 80% at 70% 0%, #2E2758 0%, #1A1633 42%, #0B0A14 100%); }
.mm-bdDawn { inset: 0; opacity: 0; transition: opacity 3.5s ease; background:
  radial-gradient(90% 55% at 50% 100%, #FFD49A 0%, rgba(255,179,167,.85) 30%, rgba(122,62,110,.6) 62%, rgba(42,35,80,0) 100%),
  linear-gradient(180deg, #2A2350 0%, #6B3F6E 48%, #E8949A 78%, #FFD49A 100%); }
.mm-bd.is-dawn .mm-bdDawn { opacity: 1; }
.mm-bdMoon { width: clamp(90px, 22vw, 170px); aspect-ratio: 1; right: 12%; top: 9%; border-radius: 50%;
  background: radial-gradient(circle at 38% 36%, #FFFFFF 0%, #DCE3F2 46%, #A9B3CF 100%);
  box-shadow: 0 0 60px 18px rgba(220,227,242,.25), 0 0 160px 60px rgba(150,160,220,.12); transition: opacity 3s ease, transform 3s ease; }
.mm-bd.is-dawn .mm-bdMoon { opacity: .25; transform: translateY(-20px); }
.mm-bdCloud { height: 70px; border-radius: 99px; background: rgba(20,17,38,.85); filter: blur(14px); opacity: .9; will-change: transform; }
.mm-bdCloud.c1 { width: 48vw; top: 14%; left: -10%; animation: mm-cloud 70s linear infinite; }
.mm-bdCloud.c2 { width: 36vw; top: 24%; left: 40%; opacity: .7; animation: mm-cloud 95s linear infinite -30s; }
.mm-bdCloud.c3 { width: 60vw; top: 5%; left: 20%; opacity: .55; animation: mm-cloud 120s linear infinite -60s; }
.mm-bd.is-dawn .mm-bdCloud { background: rgba(255,190,170,.35); }
@keyframes mm-cloud { from { transform: translateX(-30vw); } to { transform: translateX(80vw); } }
.mm-bdOut, .mm-bdIn { inset: 0; transition: opacity 1.2s ease; }
.mm-bd.is-inside .mm-bdOut { opacity: 0; }
.mm-bd.is-outside .mm-bdIn { opacity: 0; }
.mm-bdManor { left: 50%; bottom: calc(var(--vw-dock-space, 0px) * .4); width: min(1180px, 130vw); height: min(56vh, 520px); transform: translateX(-50%); transition: opacity 1.2s ease, bottom 1.2s ease; }
.mm-bd.at-approach .mm-bdManor { bottom: 17vh; height: 42vh; opacity: .9; }
.mm-bd.at-midnight:not(.is-dawn) .mm-bdManor { opacity: .35; bottom: -6vh; }
.mm-bd.at-ending .mm-bdManor { opacity: .4; }
.mm-bdWall { inset: 0; background: ${DAMASK}, radial-gradient(120% 90% at 50% 30%, #2D1B36 0%, #1B1024 55%, #0B0711 100%); background-size: 64px 88px, auto; }
.mm-bdWindow { left: 50%; top: 8%; width: min(150px, 34vw); aspect-ratio: 3 / 5; transform: translateX(-50%); border-radius: 999px 999px 6px 6px;
  background: linear-gradient(180deg, #2A2350, #141029); border: 6px solid #120C18; box-shadow: inset 0 0 30px rgba(0,0,0,.6), 0 0 80px rgba(150,160,220,.12); overflow: hidden; opacity: .55; }
.mm-bdWindow::before, .mm-bdWindow::after { content: ""; position: absolute; background: #120C18; }
.mm-bdWindow::before { left: 50%; top: 0; bottom: 0; width: 5px; transform: translateX(-50%); }
.mm-bdWindow::after { left: 0; right: 0; top: 48%; height: 5px; }
.mm-bdWinMoon { position: absolute; right: 18%; top: 14%; width: 34%; aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle at 40% 38%, #fff, #C9D2EA); box-shadow: 0 0 24px rgba(220,227,242,.5); }
.mm-bd.is-dawn .mm-bdWindow { background: linear-gradient(180deg, #6B3F6E, #FFD49A); }
.mm-bdWarm { inset: 0; opacity: calc(.15 + var(--mm-warm) * .85); transition: opacity 1.1s ease;
  background: radial-gradient(60% 45% at 50% 62%, rgba(255,200,107,.36) 0%, rgba(255,122,47,.12) 45%, rgba(0,0,0,0) 75%); mix-blend-mode: screen; }
.mm-bdFloor { left: 0; right: 0; bottom: 0; height: 22%; background: linear-gradient(180deg, rgba(0,0,0,0), rgba(8,5,12,.85)); }
.mm-bdFog { left: -20%; width: 140%; height: 34%; bottom: -6%; border-radius: 50%; will-change: transform;
  background: radial-gradient(50% 50% at 50% 50%, rgba(200,205,235,.16), rgba(200,205,235,0) 70%); }
.mm-bdFog.f1 { animation: mm-fog 26s ease-in-out infinite alternate; }
.mm-bdFog.f2 { bottom: 4%; height: 26%; opacity: .7; animation: mm-fog 34s ease-in-out infinite alternate-reverse; }
.mm-bd.is-dawn .mm-bdFog { background: radial-gradient(50% 50% at 50% 50%, rgba(255,220,200,.22), rgba(255,220,200,0) 70%); }
@keyframes mm-fog { from { transform: translateX(-6%); } to { transform: translateX(6%); } }
.mm-bdFlash { inset: 0; background: radial-gradient(80% 60% at 70% 10%, rgba(230,235,255,.55), rgba(200,210,255,.08) 60%, transparent); opacity: 0;
  animation: mm-flash 9s linear infinite 2.5s; }
.mm-bd.is-inside .mm-bdFlash, .mm-bd:not(.is-storm) .mm-bdFlash { display: none; }
@keyframes mm-flash { 0%, 61%, 63.5%, 66%, 100% { opacity: 0; } 62% { opacity: .9; } 64.5% { opacity: .6; } }
.mm-bdVignette { inset: 0; background: radial-gradient(130% 90% at 50% 45%, transparent 55%, rgba(0,0,0,.55) 100%); }
.mm-bdGrain { inset: -50%; background-image: ${GRAIN}; opacity: .05; mix-blend-mode: overlay; animation: mm-grain .9s steps(4) infinite; }
@keyframes mm-grain { 0% { transform: translate(0,0); } 25% { transform: translate(-3%,2%); } 50% { transform: translate(2%,-3%); } 75% { transform: translate(-2%,-1%); } }
@media (min-width: 768px) { .mm-bdManor { height: min(52vh, 560px); } .mm-bdWindow { width: 170px; } }
@media (prefers-reduced-motion: reduce) {
  .mm-bdCloud, .mm-bdFog, .mm-bdGrain { animation: none !important; }
  .mm-bdFlash { display: none; }
}
`;
