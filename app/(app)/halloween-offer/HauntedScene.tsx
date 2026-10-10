"use client";

// ─── The haunted night behind the /halloween-offer hero ──────────────────────
//
// The happy-halloween template's doorstep, redrawn as a full-bleed backdrop:
// a navy-violet sky with stars, a giant butter moon, the crooked lavender house
// with ink outlines and one warm window that flickers, the bare tree, a picket
// fence, fog drifting over the hill, faint glowing orbs and a few bats.
//
// Performance: the sky, moon, house and fog are inline SVG/CSS — no request, so
// the hero headline stays the LCP. Every moving layer animates transform or
// opacity only. The template GIFs (corner webs, spider drop, witch on her
// broom, floating ghosts, grave hand, witch-hat pumpkin, the running ghost)
// come through IdleGif: requested after load + idle into boxes already sized,
// so they never shift anything. Reduced motion stills it all and drops the
// fliers.

import type { CSSProperties } from "react";
import IdleGif from "@/components/promo/IdleGif";
import { HALLOWEEN_GIF } from "@/lib/season";
import { HW } from "@/components/promo/halloweenTheme";

const VB_W = 400;
const VB_H = 420;
const pc = (v: number, of: number) => `${(v / of) * 100}%`;
const box = (x: number, y: number, w: number, h: number): CSSProperties => ({
  position: "absolute", left: pc(x, VB_W), top: pc(y, VB_H), width: pc(w, VB_W), height: pc(h, VB_H),
});

function HouseSvg() {
  const ink = HW.ink;
  const dark = "#1c1532";
  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="hsHouseSvg" aria-hidden preserveAspectRatio="xMidYMax meet">
      <defs>
        <radialGradient id="hs-win" cx="50%" cy="62%" r="75%">
          <stop offset="0" stopColor="#fff4c2" />
          <stop offset=".55" stopColor="#ffc65c" />
          <stop offset="1" stopColor="#ff9a3c" />
        </radialGradient>
        <linearGradient id="hs-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#62508c" />
          <stop offset="1" stopColor="#3f3163" />
        </linearGradient>
        <linearGradient id="hs-tower" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#4d3d74" />
          <stop offset="1" stopColor="#36295a" />
        </linearGradient>
        <linearGradient id="hs-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={HW.roof} />
          <stop offset="1" stopColor="#272042" />
        </linearGradient>
        <linearGradient id="hs-rim" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="rgba(255,236,190,0)" />
          <stop offset="1" stopColor="rgba(255,236,190,.14)" />
        </linearGradient>
        <linearGradient id="hs-door" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a5fb4" />
          <stop offset="1" stopColor="#5a4390" />
        </linearGradient>
      </defs>

      {/* the bare old tree, left */}
      <path
        d="M26 404 C36 362 42 322 38 284 C35 258 24 240 6 228 L10 222 C26 232 38 244 44 258 C46 236 40 212 26 194 L32 190 C46 208 52 230 52 252 C58 236 70 226 88 222 L90 228 C72 234 62 246 58 264 C57 300 60 352 68 404 Z"
        fill="#120d20"
      />
      <path d="M33 214 C26 204 18 200 8 200 M40 196 C38 184 32 176 22 170 M70 230 C78 220 86 216 98 216 M30 190 C28 176 30 166 36 156" stroke="#120d20" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* the hill */}
      <ellipse cx="200" cy="424" rx="270" ry="40" fill="#120d22" />

      {/* chimney */}
      <path d="M222 108 L244 110 L242 168 L220 166 Z" fill="#3a2d5e" stroke={ink} strokeWidth="3" />
      <rect x="216" y="100" width="32" height="11" rx="2" fill="#2b2245" stroke={ink} strokeWidth="3" transform="rotate(3 232 105)" />

      {/* main house, a little crooked */}
      <path d="M86 214 L262 206 L268 394 L80 396 Z" fill="url(#hs-wall)" stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M86 214 L262 206 L268 394 L80 396 Z" fill="url(#hs-rim)" />
      <g stroke="rgba(22,17,31,.45)" strokeWidth="1.6">
        <path d="M84 240 L263 233" />
        <path d="M83 300 L265 296" />
        <path d="M82 350 L267 348" />
      </g>
      {/* gable roof with scalloped shingles */}
      <path d="M62 222 L176 92 L286 212 Z" fill="url(#hs-roof)" stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />
      <g stroke="rgba(22,17,31,.65)" strokeWidth="1.6" fill="none">
        <path d="M96 184 Q106 190 116 184 Q126 190 136 184 Q146 190 156 184 Q166 190 176 184 Q186 190 196 184 Q206 190 216 184 Q226 190 236 184 Q246 190 254 186" />
        <path d="M122 154 Q132 160 142 154 Q152 160 162 154 Q172 160 182 154 Q192 160 202 154 Q212 160 222 154 Q228 158 230 157" />
        <path d="M148 124 Q158 130 168 124 Q178 130 188 124 Q198 130 204 126" />
      </g>
      <path d="M176 92 L178 72" stroke={ink} strokeWidth="3" />

      {/* attic round window */}
      <circle cx="178" cy="168" r="19" fill={dark} stroke={ink} strokeWidth="3.5" />
      <path d="M178 149 L178 187 M159 168 L197 168" stroke={ink} strokeWidth="2.6" />

      {/* first-floor windows with crooked shutters */}
      <rect x="104" y="244" width="40" height="48" rx="7" fill={dark} stroke={ink} strokeWidth="3.5" />
      <path d="M124 244 L124 292 M104 266 L144 266" stroke={ink} strokeWidth="2.6" />
      <path d="M92 242 L102 244 L101 294 L90 292 Z" fill="#2b2245" stroke={ink} strokeWidth="2" transform="rotate(-4 96 268)" />
      <rect x="208" y="240" width="36" height="48" rx="7" fill={dark} stroke={ink} strokeWidth="3.5" />
      <path d="M226 240 L226 288 M208 262 L244 262" stroke={ink} strokeWidth="2.6" />
      <path d="M246 240 L256 238 L257 290 L247 290 Z" fill="#2b2245" stroke={ink} strokeWidth="2" transform="rotate(5 251 264)" />

      {/* the tower */}
      <path d="M250 168 L316 162 L322 396 L250 396 Z" fill="url(#hs-tower)" stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M238 174 L284 44 L332 166 Z" fill="url(#hs-roof)" stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />
      <g stroke="rgba(22,17,31,.65)" strokeWidth="1.5" fill="none">
        <path d="M256 128 Q264 133 272 128 Q280 133 288 128 Q296 133 304 128 Q310 132 314 130" />
        <path d="M266 96 Q274 101 282 96 Q290 101 298 96 Q302 99 304 98" />
      </g>
      <path d="M284 44 L285 24" stroke={ink} strokeWidth="3" />
      <path d="M285 24 L298 29 L285 34" fill={HW.pumpkin} />
      {/* the one warm window, always lit */}
      <path d="M271 234 L271 212 Q285 190 299 212 L299 234 Z" fill="url(#hs-win)" stroke={ink} strokeWidth="3.5" />
      <path d="M285 196 L285 234 M271 218 L299 218" stroke={ink} strokeWidth="2.4" />
      <path d="M279 234 L279 224 L281 219 L283 223 L287 223 L289 219 L291 224 L291 234 Z" fill="rgba(40,22,64,.78)" />
      <path d="M274 312 L274 292 Q285 278 296 292 L296 312 Z" fill={dark} stroke={ink} strokeWidth="3" />

      {/* porch and the purple door */}
      <path d="M138 300 L178 276 L218 298 Z" fill="#2b2245" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
      <rect x="143" y="298" width="7" height="96" fill="#3a2d5e" stroke={ink} strokeWidth="2" />
      <rect x="207" y="296" width="7" height="98" fill="#3a2d5e" stroke={ink} strokeWidth="2" />
      <path d="M156 394 L156 330 Q178 298 200 330 L200 394 Z" fill="url(#hs-door)" stroke={ink} strokeWidth="3" />
      <g stroke="rgba(22,17,31,.35)" strokeWidth="1.4"><path d="M166 322 L166 394 M178 314 L178 394 M190 322 L190 394" /></g>
      <circle cx="178" cy="368" r="4.5" fill="none" stroke="#e8b86a" strokeWidth="2" />
      <rect x="146" y="394" width="64" height="7" rx="2" fill="#4a3b6e" stroke={ink} strokeWidth="1.5" />
      <rect x="138" y="401" width="80" height="7" rx="2" fill="#3f3163" stroke={ink} strokeWidth="1.5" />
      <g transform="translate(224 306)">
        <path d="M0 0 L0 -8" stroke={ink} strokeWidth="2" />
        <rect x="-6" y="0" width="12" height="16" rx="3" fill="#6a5a92" stroke={ink} strokeWidth="2" />
      </g>

      {/* picket fences */}
      <g fill="#2f2550" stroke={ink} strokeWidth="2">
        {[4, 24, 44, 64, 334, 354, 374, 394].map((x) => (
          <path key={x} d={`M${x - 7} 414 L${x - 7} 374 L${x} 366 L${x + 7} 374 L${x + 7} 414 Z`} />
        ))}
        <rect x="-6" y="382" width="82" height="6" />
        <rect x="322" y="382" width="86" height="6" />
      </g>
      {/* a crooked tombstone */}
      <path d="M336 414 L336 380 Q352 362 368 380 L368 414 Z" fill="#4a3f66" stroke={ink} strokeWidth="2.5" transform="rotate(-4 352 400)" />
      <path d="M345 392 L359 392 M352 386 L352 402" stroke="rgba(22,17,31,.55)" strokeWidth="2" transform="rotate(-4 352 400)" />
    </svg>
  );
}

function BatSvg({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 64 32" aria-hidden>
      <path
        d="M32 10 C29 6 27 6 26 9 C22 4 14 3 6 6 C10 8 12 12 11 16 C15 13 20 14 22 18 C25 15 28 16 32 22 C36 16 39 15 42 18 C44 14 49 13 53 16 C52 12 54 8 58 6 C50 3 42 4 38 9 C37 6 35 6 32 10 Z"
        fill="#0d0918"
      />
      <circle cx="30" cy="12" r="1" fill="#ffc35a" />
      <circle cx="34" cy="12" r="1" fill="#ffc35a" />
    </svg>
  );
}

export default function HauntedScene() {
  return (
    <div className="hs" aria-hidden>
      <span className="hsStars" />
      <span className="hsMoon" />
      <span className="hsOrb o1" />
      <span className="hsOrb o2" />
      <span className="hsOrb o3" />
      <span className="hsOrb o4" />

      <div className="hsHouse">
        <HouseSvg />
        {/* the lit window's halo + a flicker, as composited HTML */}
        <span className="hsWinGlow" style={box(246, 168, 78, 92)} />
        <span className="hsWinFlick" style={box(271, 196, 28, 38)} />
        <BatSvg className="hsBat b1" />
        <BatSvg className="hsBat b2" />
        <BatSvg className="hsBat b3" />
        <IdleGif src={HALLOWEEN_GIF("floating-ghosts.webp")} width={300} height={300} className="hsGhosts" />
        <IdleGif src={HALLOWEEN_GIF("witch-hat-pumpkin.webp")} width={240} height={285} className="hsPumpkin" />
      </div>

      <span className="hsHill" />
      <span className="hsFog f1" />
      <span className="hsFog f2" />
      <span className="hsFog f3" />

      <IdleGif src={HALLOWEEN_GIF("cute-spider-web.webp")} width={300} height={300} className="hsWeb tl" />
      <IdleGif src={HALLOWEEN_GIF("corner-web-spider.webp")} width={280} height={362} className="hsWeb tr" />
      <IdleGif src={HALLOWEEN_GIF("spider-drop-from-top.gif")} width={214} height={498} className="hsDrop" />
      <span className="hsFly hsWitch"><IdleGif src={HALLOWEEN_GIF("witch-seal-broom.webp")} width={280} height={280} className="hsFlyImg" /></span>
      <span className="hsFly hsRun"><IdleGif src={HALLOWEEN_GIF("ghost-running.webp")} width={220} height={220} className="hsFlyImg" /></span>
      <IdleGif src={HALLOWEEN_GIF("grave-zombie-hand.webp")} width={150} height={139} className="hsGrave" />
    </div>
  );
}

export const HS_CSS = `
.hs { position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
.hsStars { position: absolute; inset: 0 0 30% 0; opacity: .8;
  background-image: radial-gradient(1.4px 1.4px at 12% 18%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 28% 8%, #fff 50%, transparent 51%),
    radial-gradient(1.2px 1.2px at 46% 22%, #fff4cf 50%, transparent 51%), radial-gradient(1px 1px at 66% 12%, #fff 50%, transparent 51%),
    radial-gradient(1.6px 1.6px at 84% 30%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 92% 6%, #fff4cf 50%, transparent 51%),
    radial-gradient(1px 1px at 6% 44%, #fff 50%, transparent 51%), radial-gradient(1.2px 1.2px at 38% 40%, #fff 50%, transparent 51%),
    radial-gradient(1px 1px at 56% 4%, #fff 50%, transparent 51%), radial-gradient(1.3px 1.3px at 20% 58%, #e2d8fa 50%, transparent 51%),
    radial-gradient(1px 1px at 74% 46%, #fff 50%, transparent 51%), radial-gradient(1.1px 1.1px at 3% 12%, #fff 50%, transparent 51%);
  animation: hsTwinkle 4.5s ease-in-out infinite alternate; }
@keyframes hsTwinkle { from { opacity: .45; } to { opacity: .9; } }
.hsMoon { position: absolute; bottom: 330px; right: 16%; width: 190px; height: 190px; border-radius: 50%;
  background: radial-gradient(circle at 38% 36%, #fffbe6 0%, ${HW.moon} 46%, #ead48a 100%);
  box-shadow: 0 0 80px 30px ${HW.moonGlow}, 0 0 220px 80px rgba(246,231,166,.12), inset -18px -14px 0 rgba(200,170,90,.16); }
.hsMoon::before, .hsMoon::after { content: ""; position: absolute; border-radius: 50%; background: rgba(214,190,120,.28); }
.hsMoon::before { width: 18%; height: 18%; left: 24%; top: 30%; }
.hsMoon::after { width: 11%; height: 11%; left: 56%; top: 58%; }
.hsOrb { position: absolute; width: 14px; height: 14px; border-radius: 50%; filter: blur(3px);
  background: radial-gradient(circle, rgba(226,216,250,.95), rgba(185,166,240,0) 70%); animation: hsOrb 9s ease-in-out infinite alternate; }
.hsOrb.o1 { left: 14%; top: 34%; }
.hsOrb.o2 { left: 6%; top: 70%; width: 20px; height: 20px; animation-delay: -3s; background: radial-gradient(circle, rgba(255,214,150,.9), rgba(255,154,60,0) 70%); }
.hsOrb.o3 { right: 6%; top: 62%; width: 22px; height: 22px; animation-delay: -5s; }
.hsOrb.o4 { left: 48%; top: 16%; width: 10px; height: 10px; animation-delay: -7s; }
@keyframes hsOrb { 0% { transform: translate(0,0); opacity: .35; } 50% { opacity: .95; } 100% { transform: translate(16px,-26px); opacity: .5; } }

/* the house: phones put it under the hero copy, bottom-right */
.hsHouse { position: absolute; right: -24vw; bottom: 4px; width: 118vw; max-width: 620px; aspect-ratio: ${VB_W} / ${VB_H}; }
.hsHouseSvg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; overflow: visible; filter: drop-shadow(0 0 30px rgba(10,6,24,.6)); }
.hsWinGlow { border-radius: 50%; background: radial-gradient(circle, rgba(255,195,90,.55) 0%, rgba(255,154,60,.18) 45%, transparent 70%);
  animation: hsFlicker 4.2s ease-in-out infinite; }
.hsWinFlick { border-radius: 40% 40% 4px 4px; background: rgba(255,244,194,.5); mix-blend-mode: screen; animation: hsFlicker2 3.1s steps(1) infinite; }
@keyframes hsFlicker { 0%, 100% { opacity: .9; } 30% { opacity: .65; } 33% { opacity: 1; } 60% { opacity: .78; } 62% { opacity: .5; } 64% { opacity: .95; } }
@keyframes hsFlicker2 { 0% { opacity: 0; } 40% { opacity: .55; } 44% { opacity: 0; } 70% { opacity: .3; } 72% { opacity: 0; } }
.hsBat { position: absolute; width: 9%; height: auto; filter: drop-shadow(0 0 6px rgba(246,231,166,.35)); }
.hsBat.b1 { left: 62%; top: 4%; animation: hsBat1 7s ease-in-out infinite; }
.hsBat.b2 { left: 80%; top: 14%; width: 6%; animation: hsBat1 6s ease-in-out -2s infinite reverse; }
.hsBat.b3 { left: 40%; top: 10%; width: 5%; animation: hsBat1 8s ease-in-out -4s infinite; }
@keyframes hsBat1 { 0% { transform: translate(0,0) scaleY(1); } 12% { transform: translate(14px,-10px) scaleY(.55); } 25% { transform: translate(30px,-4px) scaleY(1); }
  37% { transform: translate(40px,8px) scaleY(.55); } 50% { transform: translate(26px,18px) scaleY(1); } 62% { transform: translate(6px,14px) scaleY(.55); }
  75% { transform: translate(-12px,6px) scaleY(1); } 87% { transform: translate(-8px,-6px) scaleY(.55); } 100% { transform: translate(0,0) scaleY(1); } }
.hsGhosts { position: absolute; left: 2%; top: 30%; width: 26%; aspect-ratio: 1; animation: hsBob 5s ease-in-out infinite; opacity: .92; }
@keyframes hsBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
.hsPumpkin { position: absolute; left: 50%; bottom: 0.5%; width: 15%; aspect-ratio: 240 / 285; }

.hsHill { position: absolute; left: -10%; right: -10%; bottom: -40px; height: 120px; border-radius: 50%;
  background: radial-gradient(60% 100% at 50% 0%, #1a1430 0%, #0f0b1d 70%); }
.hsFog { position: absolute; left: -30%; right: -30%; height: 150px; bottom: -10px; filter: blur(22px);
  background: radial-gradient(40% 60% at 25% 50%, rgba(214,202,245,.22), transparent 70%), radial-gradient(35% 55% at 70% 60%, rgba(214,202,245,.18), transparent 70%); }
.hsFog.f1 { animation: hsFog 16s ease-in-out infinite alternate; }
.hsFog.f2 { bottom: 40px; opacity: .6; animation: hsFog 22s ease-in-out -6s infinite alternate-reverse; }
.hsFog.f3 { bottom: 110px; opacity: .3; height: 110px; animation: hsFog 28s ease-in-out -12s infinite alternate; }
@keyframes hsFog { from { transform: translateX(-8%); } to { transform: translateX(8%); } }

.hsWeb { position: absolute; top: 0; z-index: 3; width: 120px; height: 120px; }
.hsWeb.tl { left: 0; }
.hsWeb.tr { right: 0; width: 100px; height: 129px; }
.hsDrop { position: absolute; top: 0; left: 22%; z-index: 3; width: 42px; height: 98px; }
.hsFly { position: absolute; z-index: 2; }
.hsFlyImg { width: 100%; height: 100%; }
.hsWitch { top: 16%; right: 0; width: 96px; height: 96px; transform: translateX(130px); animation: hsWitch 19s linear 3s infinite; }
@keyframes hsWitch { 0% { transform: translate(130px, 0) rotate(-4deg); } 40% { transform: translate(-60vw, -40px) rotate(3deg); } 70%, 100% { transform: translate(-115vw, 10px) rotate(-2deg); } }
.hsRun { bottom: 18px; left: 0; width: 70px; height: 70px; transform: translateX(-90px); animation: hsRun 11s linear 1.5s infinite; }
@keyframes hsRun { 0% { transform: translateX(-90px); } 55%, 100% { transform: translateX(calc(100vw + 40px)); } }
.hsGrave { position: absolute; left: 3%; bottom: 6px; z-index: 2; width: 84px; height: 78px; }

@media (max-width: 767px) {
  /* phones: the house stands under the glass, roofline just clearing it, the
     moon rising behind the tower, the witch flying low across the porch */
  .hsHouse { right: -5vw; width: min(86vw, 380px); bottom: 0; }
  .hsMoon { bottom: auto; top: calc(100% - min(86vw, 380px) * 1.05 - 18px); right: 3%; width: 118px; height: 118px; }
  .hsWeb { width: 132px; height: 132px; }
  .hsWeb.tr { width: 112px; height: 145px; }
  .hsDrop { display: none; }
  .hsWitch { top: auto; bottom: 34%; width: 84px; height: 84px; animation-duration: 15s; }
  .hsGhosts { left: -6%; top: 22%; width: 30%; }
  .hsOrb.o1 { top: 56%; }
}
@media (min-width: 640px) {
  .hsHouse { right: -8vw; width: 80vw; }
  .hsWeb { width: 170px; height: 170px; }
  .hsWeb.tr { width: 150px; height: 194px; }
  .hsDrop { width: 56px; height: 130px; }
  .hsGrave { width: 130px; height: 120px; }
}
@media (min-width: 1024px) {
  /* desktop: the house fills the right half of the night, under a giant moon */
  .hsMoon { top: 9%; bottom: auto; right: 9%; width: 380px; height: 380px; }
  .hsHouse { right: 2vw; bottom: 0; width: auto; height: 90%; max-width: none; }
  .hsWeb { width: 220px; height: 220px; }
  .hsWeb.tr { width: 190px; height: 246px; }
  .hsDrop { left: 50%; width: 64px; height: 149px; }
  /* desktop: the witch crosses the moon and the house only — never the headline */
  .hsWitch { width: 130px; height: 130px; top: 34%; animation-name: hsWitchD; animation-duration: 15s; }
  @keyframes hsWitchD { 0% { transform: translate(130px, 0) rotate(-4deg); opacity: 1; } 34% { transform: translate(-20vw, -50px) rotate(3deg); opacity: 1; }
    48% { transform: translate(-36vw, -20px) rotate(-2deg); opacity: 0; } 100% { transform: translate(-36vw, -20px); opacity: 0; } }
  .hsRun { width: 96px; height: 96px; bottom: 26px; animation-duration: 14s; }
  .hsGrave { left: 42%; width: 140px; height: 130px; }
}
@media (min-width: 1600px) { .hsHouse { right: 6vw; } .hsMoon { right: 13%; } }
@media (prefers-reduced-motion: reduce) {
  .hs *, .hs *::before, .hs *::after { animation: none !important; }
  .hsFly, .hsDrop { display: none; }
}
`;
