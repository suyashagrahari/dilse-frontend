"use client";

// ─── The festival portals: opening a Dandiya or a Diwali template ────────────
//
// The festival twins of the witch portal (WitchPortal.tsx), run by the shared
// seasonPortal.ts. When a visitor opens the ACTIVE festival's drop template
// from the site (the drop cards, the gallery cards for those slugs, the gallery
// teaser, the offer page's CTAs), a short full-screen scene plays:
//
//   dandiya — "a twirl of sticks + mirror flash"
//     0 ms     a kumkum-red garba night with bandhani dots fades in; a
//              mirror-work bandhanwar drops in across the top, a ring of
//              mirror discs glints round the centre
//     ~100 ms  two lacquered dandiya sticks spin in from either side
//     ~600 ms  they cross and CLICK in the middle — a white mirror flash,
//              mirror shards burst outward, marigold petals fall; route pushed
//   diwali — "a cracker/firework burst"
//     0 ms     a maroon Diwali night fades in: stars, a row of diyas, a
//              marigold toran across the top
//     ~150 ms  the centre diya's flame swells and a rocket swooshes up
//     ~650 ms  it bursts into gold/red/teal fireworks, more follow, petals
//              drift down; the route is pushed
//   ~1.4 s     either way, once the new page is on screen the veil dissolves
//
// Silent (a template's own music starts on its own tap). Tap anywhere to skip;
// reduced motion → a quick fade. Outside the festival's mode links behave
// normally.

import { useCallback, type MouseEvent as ReactMouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFestival, useSeason } from "@/hooks/useSeason";
import { DROPS, isFestivalMode, type FestivalId, type Season } from "@/lib/season";
import { isModifiedClick, runPortal, slugOfHref, type Prefetch, type PortalScene, type Push } from "./seasonPortal";

/** A festival drop's template slugs: the live drop's while that festival is on, else the defaults. */
export function festivalSlugs(kind: FestivalId, season: Season | null | undefined): readonly string[] {
  const live = season?.mode === kind ? season.sale.slugs : null;
  return live && live.length ? live : DROPS[kind].slugs;
}

/** The festival whose drop this link opens while that festival is the active mode, else null. */
export function festivalOfHref(href: string, season: Season | null | undefined): FestivalId | null {
  const m = season?.mode;
  if (!isFestivalMode(m)) return null;
  return festivalSlugs(m, season).includes(slugOfHref(href)) ? m : null;
}

// ── Diwali: the firework ─────────────────────────────────────────────────────

const BURSTS: { x: number; y: number; c: string; s: number; d: number }[] = [
  { x: 50, y: 30, c: "#ffcf5a", s: 1, d: 0 },
  { x: 24, y: 22, c: "#ff4d4d", s: 0.62, d: 180 },
  { x: 77, y: 20, c: "#33d1c1", s: 0.7, d: 300 },
  { x: 36, y: 44, c: "#ff9a1f", s: 0.45, d: 420 },
  { x: 66, y: 40, c: "#fff0c8", s: 0.5, d: 520 },
];

const burstSvg = (c: string) => {
  const rays = Array.from({ length: 18 }, (_, i) => {
    const a = (360 / 18) * i;
    const long = i % 2 === 0;
    return `<g transform="rotate(${a} 50 50)"><path d="M50 ${long ? 30 : 34}V${long ? 6 : 14}" stroke="${c}" stroke-width="${long ? 2.4 : 1.6}" stroke-linecap="round"/><circle cx="50" cy="${long ? 3.5 : 11}" r="${long ? 2.2 : 1.5}" fill="${i % 3 ? c : "#fff8de"}"/></g>`;
  }).join("");
  return `<svg viewBox="0 0 100 100" aria-hidden="true">${rays}<circle cx="50" cy="50" r="5" fill="#fff8de"/></svg>`;
};

const DIYA_SVG = `<svg viewBox="0 0 64 44" aria-hidden="true"><defs><radialGradient id="fpo-fl" cx="50%" cy="70%" r="60%"><stop offset="0" stop-color="#fff6c8"/><stop offset=".45" stop-color="#ffd36b"/><stop offset="1" stop-color="#f07c0a"/></radialGradient><linearGradient id="fpo-b" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#d9452b"/><stop offset="1" stop-color="#7a0f12"/></linearGradient></defs><path class="fpo-flame" d="M32 2c5 7 7.4 12 7.4 15.6A7.4 7.4 0 0 1 32 25a7.4 7.4 0 0 1-7.4-7.4C24.6 14 27 9 32 2z" fill="url(#fpo-fl)"/><path d="M4 26h56c-2.6 10-13 16-28 16S6.6 36 4 26z" fill="url(#fpo-b)"/><path d="M4 26h56" stroke="#ffcf7a" stroke-width="2.4" stroke-linecap="round"/></svg>`;

const MARIGOLD_TORAN = (() => {
  const flowers = Array.from({ length: 23 }, (_, i) => {
    const x = 2 + i * 4.35;
    const y = 4 + Math.sin((i / 22) * Math.PI) * 6;
    return `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="1.9" fill="${i % 2 ? "#ffb020" : "#f07c0a"}"/>` +
      (i % 3 === 1 ? `<path d="M${x.toFixed(2)} ${(y + 1.6).toFixed(2)}q-1.6 3.6 0 7q1.6-3.4 0-7z" fill="#3f9b4a"/>` : "");
  }).join("");
  return `<svg class="fpo-toran" viewBox="0 0 100 16" preserveAspectRatio="none" aria-hidden="true">${flowers}</svg>`;
})();

const petals = (cls: string, n: number) =>
  Array.from({ length: n }, (_, i) =>
    `<i class="${cls}" style="--x:${(i * 6.3 + 3) % 100}%;--d:${(i % 5) * 0.12 + 0.5}s;--r:${(i * 47) % 360}deg;--c:${i % 3 ? "#ffb020" : "#f07c0a"}"></i>`,
  ).join("");

const DIWALI_HTML = (reduced: boolean) =>
  `<span class="fpo-scene"><span class="fpo-veil"></span><span class="fpo-stars"></span>${MARIGOLD_TORAN}` +
  `<span class="fpo-row">${Array.from({ length: 7 }, (_, i) => `<span class="fpo-d fpo-d${i}">${DIYA_SVG}</span>`).join("")}</span>` +
  `<span class="fpo-glowfloor"></span></span>` +
  (reduced
    ? ""
    : `<span class="fpo-rocket"><i></i></span>` +
      BURSTS.map((b, i) => `<span class="fpo-burst" style="left:${b.x}%;top:${b.y}%;--s:${b.s};--d:${650 + b.d}ms;--c:${b.c}">${burstSvg(b.c)}</span><i class="fpo-flash fpo-flash${i}" style="left:${b.x}%;top:${b.y}%;--d:${650 + b.d}ms;--c:${b.c}"></i>`).join("") +
      `<span class="fpo-petals">${petals("fpo-petal", 16)}</span>`) +
  `<span class="fpo-cap"><em>Lighting up your Diwali card…</em><i class="fpo-glow"></i></span>`;

const DIWALI_CSS = `
.fpo { position: fixed; inset: 0; z-index: 2147483000; overflow: hidden; pointer-events: auto; cursor: pointer; contain: strict; }
.fpo > span, .fpo-scene > * { position: absolute; }
.fpo-scene { inset: 0; opacity: 0; transition: opacity .3s ease; }
.fpo-on .fpo-scene { opacity: 1; }
.fpo-veil { inset: 0;
  background: radial-gradient(60% 45% at 50% 30%, rgba(255,190,70,.18), transparent 70%),
    radial-gradient(90% 50% at 50% 105%, rgba(232,134,12,.32), transparent 70%),
    linear-gradient(180deg, #22040a 0%, #4f090d 48%, #7a1013 76%, #33060a 100%); }
.fpo-stars { inset: 0 0 40% 0; opacity: .9;
  background-image: radial-gradient(1.4px 1.4px at 12% 18%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 28% 8%, #fff 50%, transparent 51%),
    radial-gradient(1.2px 1.2px at 46% 32%, #fff4cf 50%, transparent 51%), radial-gradient(1px 1px at 66% 12%, #fff 50%, transparent 51%),
    radial-gradient(1.6px 1.6px at 84% 40%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 92% 6%, #fff4cf 50%, transparent 51%),
    radial-gradient(1px 1px at 6% 64%, #fff 50%, transparent 51%), radial-gradient(1.2px 1.2px at 38% 70%, #fff 50%, transparent 51%),
    radial-gradient(1.1px 1.1px at 56% 6%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 74% 26%, #fff 50%, transparent 51%);
  animation: fpoTwinkle 2.4s ease-in-out infinite alternate; }
@keyframes fpoTwinkle { to { opacity: .55; } }
.fpo-toran { left: 0; top: 0; width: 100%; height: clamp(34px, 6vh, 64px); filter: drop-shadow(0 4px 8px rgba(0,0,0,.4)); transform: translateY(-100%);
  transition: transform .6s cubic-bezier(.3,1.4,.5,1) .05s; }
.fpo-on .fpo-toran { transform: none; }
.fpo-row { left: 50%; bottom: clamp(56px, 12vh, 120px); transform: translateX(-50%); display: flex; align-items: flex-end; gap: clamp(14px, 4vw, 54px); }
.fpo-d { display: block; width: clamp(34px, 6vw, 64px); aspect-ratio: 64 / 44; filter: drop-shadow(0 0 18px rgba(255,196,77,.6)); }
.fpo-d svg { display: block; width: 100%; height: 100%; overflow: visible; }
.fpo-d3 { width: clamp(64px, 11vw, 120px); }
.fpo-flame { transform-box: fill-box; transform-origin: 50% 100%; animation: fpoFlick 1.1s ease-in-out infinite alternate; }
.fpo-d1 .fpo-flame, .fpo-d4 .fpo-flame { animation-delay: -.4s; }
.fpo-d2 .fpo-flame, .fpo-d6 .fpo-flame { animation-delay: -.8s; }
@keyframes fpoFlick { from { transform: scale(1, 1) rotate(-3deg); } to { transform: scale(.9, 1.12) rotate(3deg); } }
.fpo-on .fpo-d3 .fpo-flame { animation: fpoSwell .5s ease-out .1s both, fpoFlick 1.1s ease-in-out .6s infinite alternate; }
@keyframes fpoSwell { 50% { transform: scale(1.5, 1.9); } 100% { transform: scale(1, 1); } }
.fpo-glowfloor { left: 0; right: 0; bottom: 0; height: 32vh; background: radial-gradient(60% 80% at 50% 100%, rgba(255,176,32,.36), transparent 70%); }
.fpo-rocket { left: 50%; bottom: calc(clamp(56px, 12vh, 120px) + clamp(40px, 7vw, 76px)); width: 4px; height: 0; z-index: 2; }
.fpo-rocket i { position: absolute; left: -3px; bottom: 0; width: 10px; height: 10px; border-radius: 50%;
  background: radial-gradient(circle, #fff 0%, #ffd36b 45%, transparent 72%); box-shadow: 0 0 16px 6px rgba(255,211,107,.7); opacity: 0; }
.fpo-rocket i::after { content: ""; position: absolute; left: 3.5px; top: 8px; width: 3px; height: 26vh; border-radius: 3px; transform-origin: 50% 0; transform: scaleY(0);
  background: linear-gradient(180deg, rgba(255,211,107,.95), rgba(255,176,32,.35) 40%, transparent); }
.fpo-on .fpo-rocket i { animation: fpoRise .52s cubic-bezier(.3,.2,.4,1) .14s forwards; }
.fpo-on .fpo-rocket i::after { animation: fpoTrail .52s ease-out .14s forwards; }
@keyframes fpoRise { 0% { opacity: 0; transform: translateY(0); } 10% { opacity: 1; } 92% { opacity: 1; } 100% { opacity: 0; transform: translateY(calc(-1 * (100vh - 30vh - clamp(56px, 12vh, 120px) - clamp(40px, 7vw, 76px)))); } }
@keyframes fpoTrail { 0% { transform: scaleY(0); opacity: 1; } 60% { transform: scaleY(1); opacity: .9; } 100% { transform: scaleY(.6); opacity: 0; } }
.fpo-burst { z-index: 2; width: calc(min(62vmin, 520px) * var(--s)); aspect-ratio: 1; transform: translate(-50%, -50%) scale(0); opacity: 0; }
.fpo-burst svg { display: block; width: 100%; height: 100%; filter: drop-shadow(0 0 10px var(--c)); }
.fpo-on .fpo-burst { animation: fpoBurst 1.15s cubic-bezier(.15,.75,.3,1) var(--d) forwards; }
@keyframes fpoBurst { 0% { opacity: 1; transform: translate(-50%, -50%) scale(.08) rotate(0deg); } 55% { opacity: 1; }
  100% { opacity: 0; transform: translate(-50%, -42%) scale(1) rotate(10deg); } }
.fpo-flash { position: absolute; z-index: 1; width: 40vmin; aspect-ratio: 1; border-radius: 50%; transform: translate(-50%, -50%) scale(.2); opacity: 0;
  background: radial-gradient(circle, color-mix(in srgb, var(--c) 55%, transparent) 0%, transparent 65%); }
.fpo-on .fpo-flash { animation: fpoFlash .9s ease-out var(--d) forwards; }
@keyframes fpoFlash { 0% { opacity: .9; transform: translate(-50%, -50%) scale(.2); } 100% { opacity: 0; transform: translate(-50%, -50%) scale(1.3); } }
.fpo-petals { inset: 0; z-index: 2; pointer-events: none; }
.fpo-petal { position: absolute; left: var(--x); top: -4vh; width: 9px; height: 14px; border-radius: 60% 60% 50% 50%; background: var(--c); opacity: 0;
  transform: rotate(var(--r)); box-shadow: inset -2px -2px 0 rgba(150,60,0,.25); }
.fpo-on .fpo-petal { animation: fpoPetal 2.2s linear var(--d) forwards; }
@keyframes fpoPetal { 0% { opacity: 0; transform: translate(0, 0) rotate(var(--r)); } 10% { opacity: 1; }
  100% { opacity: .9; transform: translate(4vw, 92vh) rotate(calc(var(--r) + 420deg)); } }
.fpo-cap { z-index: 3; left: 50%; bottom: calc(max(14px, 3vh) + env(safe-area-inset-bottom, 0px)); transform: translate(-50%, 6px); opacity: 0;
  display: flex; flex-direction: column; align-items: center; gap: 10px; white-space: nowrap; transition: opacity .4s ease .3s, transform .6s ease .3s; }
.fpo-cap em { font: italic 600 clamp(15px, 2.2vh, 20px)/1.2 var(--font-playfair), 'Playfair Display', Georgia, serif; color: #fff4e2;
  text-shadow: 0 0 18px rgba(255,196,77,.6), 0 2px 10px rgba(30,3,6,.9); }
.fpo-glow { position: relative; display: block; width: clamp(96px, 14vw, 150px); height: 3px; border-radius: 3px; overflow: hidden; background: rgba(255,211,107,.2); }
.fpo-glow::after { content: ""; position: absolute; inset: 0; border-radius: inherit; transform-origin: left; transform: scaleX(0);
  background: linear-gradient(90deg, #e2343c, #ffcf5a, #ff9a1f); box-shadow: 0 0 10px rgba(255,176,32,.8); }
.fpo-on .fpo-cap { opacity: 1; transform: translate(-50%, 0); }
.fpo-on .fpo-glow::after { animation: fpoFill 1.6s cubic-bezier(.3,.6,.3,1) .2s forwards; }
@keyframes fpoFill { 0% { transform: scaleX(0); } 70% { transform: scaleX(.86); } 100% { transform: scaleX(.96); } }
@media (max-width: 640px) { .fpo-d0, .fpo-d6 { display: none; } }
.fpo-out { pointer-events: none; }
.fpo-out .fpo-scene, .fpo-out .fpo-cap, .fpo-out .fpo-petals { opacity: 0; transition: opacity .5s ease; }
.fpo-skip .fpo-burst, .fpo-skip .fpo-rocket { opacity: 0 !important; transition: opacity .2s ease; }
.fpo-rm .fpo-scene { transition-duration: .18s; }
.fpo-rm *, .fpo-rm *::after { animation: none !important; transition: none !important; }
.fpo-rm .fpo-toran { transform: none; }
.fpo-rm .fpo-glow { display: none; }
`;

// ── Dandiya: the twirl and the mirror flash ──────────────────────────────────

const STICK_SVG = (body: string, deep: string, tassel: string, id: string) =>
  `<svg viewBox="0 0 24 200" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="${deep}"/><stop offset=".45" stop-color="${body}"/><stop offset="1" stop-color="${deep}"/></linearGradient></defs>` +
  `<rect x="5" y="4" width="14" height="176" rx="7" fill="url(#${id})"/>` +
  `<rect x="5" y="4" width="14" height="8" rx="4" fill="#f7c64a"/><rect x="5" y="30" width="14" height="5" fill="#f7c64a"/><rect x="5" y="150" width="14" height="5" fill="#f7c64a"/>` +
  `<path d="M12 60l6 12-6 12-6-12z" fill="#f7c64a"/><path d="M12 92l5 10-5 10-5-10z" fill="${tassel}"/><path d="M12 120l6 12-6 12-6-12z" fill="#f7c64a"/>` +
  `<path d="M12 180v6" stroke="#f7c64a" stroke-width="2"/><path d="M7 186h10l3 13H4z" fill="${tassel}"/></svg>`;

const MIRROR_SVG = `<svg viewBox="0 0 40 40" aria-hidden="true"><defs><radialGradient id="dpo-m" cx="38%" cy="34%" r="70%"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#e3e9f1"/><stop offset="1" stop-color="#8f9cad"/></radialGradient></defs>${Array.from({ length: 10 }, (_, i) => `<ellipse cx="20" cy="5.4" rx="2.8" ry="4.2" fill="${i % 2 ? "#ff3d9a" : "#ffb000"}" transform="rotate(${i * 36} 20 20)"/>`).join("")}<circle cx="20" cy="20" r="11" fill="#7a0f12"/><circle cx="20" cy="20" r="11" fill="none" stroke="#f7c64a" stroke-width="1.4" stroke-dasharray="1.8 1.4"/><circle cx="20" cy="20" r="8" fill="url(#dpo-m)"/><path d="M15 17a6 6 0 0 1 4.6-4" stroke="#fff" stroke-width="1.8" stroke-linecap="round" fill="none"/></svg>`;

const BANDHANWAR = (() => {
  const n = 24;
  const w = n * 24;
  const fills = ["#c8141f", "#0f8f84", "#e5197d", "#f29a00"];
  const flaps = Array.from({ length: n }, (_, i) => {
    const x = i * 24;
    return `<path d="M${x + 1.5} 9H${x + 22.5}L${x + 12} 33z" fill="${fills[i % 4]}" stroke="#d4a537" stroke-width="1"/><circle cx="${x + 12}" cy="18" r="3.6" fill="#e6ecf3" stroke="#d4a537" stroke-width=".9"/><path d="M${x + 12} 33v5" stroke="#d4a537" stroke-width=".8"/><circle cx="${x + 12}" cy="40" r="2.4" fill="${i % 2 ? "#ffb000" : "#ff3d9a"}"/>`;
  }).join("");
  return `<svg class="dpo-band" viewBox="0 0 ${w} 46" preserveAspectRatio="xMidYMin slice" aria-hidden="true"><rect width="${w}" height="9" fill="#7a0f12"/><path d="M0 9H${w}" stroke="#d4a537" stroke-width="1.6"/>${flaps}</svg>`;
})();

const RING = Array.from({ length: 10 }, (_, i) => `<span class="dpo-ring-m" style="--a:${i * 36}deg;--d:${(i % 5) * 90}ms">${MIRROR_SVG}</span>`).join("");
const SHARDS = Array.from({ length: 18 }, (_, i) => `<i class="dpo-shard" style="--a:${i * 20 + (i % 2) * 7}deg;--l:${30 + (i % 3) * 9}vmin;--c:${["#ffffff", "#e6ecf3", "#ffb000", "#ff3d9a", "#12b5a6"][i % 5]}"></i>`).join("");

const DANDIYA_HTML = (reduced: boolean) =>
  `<span class="dpo-scene"><span class="dpo-veil"></span><span class="dpo-dots"></span>${BANDHANWAR}<span class="dpo-floor"></span>` +
  `<span class="dpo-ring">${RING}</span></span>` +
  `<span class="dpo-stick dpo-l">${STICK_SVG("#2f74ee", "#123a8a", "#ff3d9a", "dpo-sl")}</span>` +
  `<span class="dpo-stick dpo-r">${STICK_SVG("#ff4fa6", "#a80f5f", "#12b5a6", "dpo-sr")}</span>` +
  (reduced
    ? ""
    : `<i class="dpo-flash"></i><span class="dpo-shards">${SHARDS}</span><span class="dpo-click">Click!</span><span class="dpo-petals">${petals("dpo-petal", 18)}</span>`) +
  `<span class="dpo-cap"><em>Twirling into your Dandiya night…</em><i class="dpo-glow"></i></span>`;

const DANDIYA_CSS = `
.dpo { position: fixed; inset: 0; z-index: 2147483000; overflow: hidden; pointer-events: auto; cursor: pointer; contain: strict; }
.dpo > span, .dpo > i, .dpo-scene > * { position: absolute; }
.dpo-scene { inset: 0; opacity: 0; transition: opacity .28s ease; }
.dpo-on .dpo-scene { opacity: 1; }
.dpo-veil { inset: 0;
  background: radial-gradient(55% 45% at 50% 46%, rgba(255,176,0,.30), transparent 70%),
    radial-gradient(80% 60% at 100% 0%, rgba(255,61,154,.30), transparent 60%),
    radial-gradient(80% 60% at 0% 100%, rgba(255,176,0,.22), transparent 60%),
    linear-gradient(180deg, #8a0d15 0%, #b3121b 45%, #9e0f18 70%, #4d070b 100%); }
.dpo-dots { inset: 0; opacity: .45;
  background: radial-gradient(circle at 50% 50%, rgba(255,240,220,.6) 0 1.6px, transparent 2.1px) 0 0 / 26px 26px,
    radial-gradient(circle at 50% 50%, rgba(255,214,120,.5) 0 1.3px, transparent 1.8px) 13px 13px / 26px 26px; }
.dpo-band { left: 0; top: 0; width: 100%; height: clamp(40px, 6.5vh, 66px); filter: drop-shadow(0 5px 8px rgba(40,0,4,.5)); transform: translateY(-100%);
  transition: transform .55s cubic-bezier(.3,1.4,.5,1) .05s; }
.dpo-on .dpo-band { transform: none; }
.dpo-floor { left: 0; right: 0; bottom: 0; height: 30vh; background: radial-gradient(60% 80% at 50% 100%, rgba(255,176,0,.3), transparent 70%); }
/* a ring of mirror discs around the centre, catching the light in turn */
.dpo-ring { left: 50%; top: 46%; width: 0; height: 0; }
.dpo-ring-m { position: absolute; left: 0; top: 0; width: clamp(34px, 5.4vmin, 56px); aspect-ratio: 1;
  transform: rotate(var(--a)) translateY(calc(-1 * min(30vmin, 260px))) rotate(calc(-1 * var(--a))) translate(-50%, -50%) scale(.4); opacity: 0;
  transition: transform .5s cubic-bezier(.3,1.5,.5,1) var(--d), opacity .3s ease var(--d); filter: drop-shadow(0 0 10px rgba(255,255,255,.55)); }
.dpo-ring-m svg { display: block; width: 100%; height: 100%; }
.dpo-on .dpo-ring-m { opacity: 1; transform: rotate(var(--a)) translateY(calc(-1 * min(30vmin, 260px))) rotate(calc(-1 * var(--a))) translate(-50%, -50%) scale(1); }
.dpo-on .dpo-ring { animation: dpoRing 2.6s linear .2s forwards; }
@keyframes dpoRing { to { transform: rotate(120deg); } }
/* the two sticks spin in from either side and cross in the middle */
.dpo-stick { z-index: 3; left: 50%; top: 46%; width: clamp(20px, 3.6vmin, 34px); height: clamp(170px, 34vmin, 300px); margin: calc(clamp(170px, 34vmin, 300px) / -2) 0 0 calc(clamp(20px, 3.6vmin, 34px) / -2); opacity: 0;
  filter: drop-shadow(0 6px 14px rgba(40,0,4,.55)) drop-shadow(0 0 10px rgba(255,214,120,.45)); }
.dpo-stick svg { display: block; width: 100%; height: 100%; }
.dpo-on .dpo-l { animation: dpoInL .62s cubic-bezier(.25,.8,.35,1) .06s forwards, dpoClickL .26s ease-out .68s; }
.dpo-on .dpo-r { animation: dpoInR .62s cubic-bezier(.25,.8,.35,1) .06s forwards, dpoClickR .26s ease-out .68s; }
@keyframes dpoInL { 0% { opacity: 0; transform: translateX(-60vw) rotate(-560deg); } 15% { opacity: 1; } 100% { opacity: 1; transform: translateX(0) rotate(-34deg); } }
@keyframes dpoInR { 0% { opacity: 0; transform: translateX(60vw) rotate(560deg); } 15% { opacity: 1; } 100% { opacity: 1; transform: translateX(0) rotate(34deg); } }
@keyframes dpoClickL { 0% { transform: rotate(-34deg); } 40% { transform: rotate(-24deg) scale(1.06); } 100% { transform: rotate(-34deg); } }
@keyframes dpoClickR { 0% { transform: rotate(34deg); } 40% { transform: rotate(24deg) scale(1.06); } 100% { transform: rotate(34deg); } }
.dpo-l, .dpo-r { animation-fill-mode: forwards; }
/* the mirror flash: white light from the crossing, then shards fly out */
.dpo-flash { z-index: 2; left: 50%; top: 46%; width: 90vmax; aspect-ratio: 1; border-radius: 50%; transform: translate(-50%, -50%) scale(.05); opacity: 0;
  background: radial-gradient(circle, #fff 0%, rgba(255,255,255,.85) 12%, rgba(255,246,220,.5) 26%, rgba(255,176,0,.18) 44%, transparent 62%); }
.dpo-on .dpo-flash { animation: dpoFlash .75s cubic-bezier(.2,.8,.3,1) .66s forwards; }
@keyframes dpoFlash { 0% { opacity: 0; transform: translate(-50%, -50%) scale(.05); } 18% { opacity: 1; } 100% { opacity: 0; transform: translate(-50%, -50%) scale(1); } }
.dpo-shards { z-index: 3; left: 50%; top: 46%; width: 0; height: 0; }
.dpo-shard { position: absolute; left: 0; top: 0; width: 10px; height: 10px; background: var(--c); opacity: 0;
  clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%); box-shadow: 0 0 8px var(--c); transform: rotate(var(--a)) translateY(0) scale(.4); }
.dpo-on .dpo-shard { animation: dpoShard .8s cubic-bezier(.15,.7,.3,1) .68s forwards; }
@keyframes dpoShard { 0% { opacity: 1; transform: rotate(var(--a)) translateY(0) scale(.4); } 70% { opacity: 1; } 100% { opacity: 0; transform: rotate(var(--a)) translateY(calc(-1 * var(--l))) scale(1.1) rotate(180deg); } }
.dpo-click { z-index: 4; left: 50%; top: calc(46% - min(22vmin, 190px)); transform: translate(-50%, 0) scale(.4); opacity: 0;
  font: 800 italic clamp(20px, 3.4vmin, 32px)/1 var(--font-playfair), 'Playfair Display', serif; color: #fff4e2; letter-spacing: .02em;
  text-shadow: 0 0 18px rgba(255,176,0,.9), 0 2px 0 #7a0f12; }
.dpo-on .dpo-click { animation: dpoWord .7s cubic-bezier(.3,1.6,.5,1) .7s forwards; }
@keyframes dpoWord { 0% { opacity: 0; transform: translate(-50%, 10px) scale(.4) rotate(-8deg); } 50% { opacity: 1; transform: translate(-50%, -6px) scale(1.1) rotate(4deg); } 100% { opacity: 1; transform: translate(-50%, -10px) scale(1) rotate(-3deg); } }
.dpo-petals { inset: 0; z-index: 2; pointer-events: none; }
.dpo-petal { position: absolute; left: var(--x); top: -4vh; width: 11px; height: 11px; border-radius: 50%; background: radial-gradient(circle, #ffcf3a 0 30%, var(--c) 32%); opacity: 0;
  box-shadow: 0 0 0 1px rgba(150,60,0,.2); }
.dpo-on .dpo-petal { animation: dpoPetal 2.2s linear calc(var(--d) + .3s) forwards; }
@keyframes dpoPetal { 0% { opacity: 0; transform: translate(0, 0) rotate(var(--r)); } 10% { opacity: 1; }
  100% { opacity: .9; transform: translate(-3vw, 92vh) rotate(calc(var(--r) + 360deg)); } }
.dpo-cap { z-index: 5; left: 50%; bottom: calc(max(14px, 3vh) + env(safe-area-inset-bottom, 0px)); transform: translate(-50%, 6px); opacity: 0;
  display: flex; flex-direction: column; align-items: center; gap: 10px; white-space: nowrap; transition: opacity .4s ease .3s, transform .6s ease .3s; }
.dpo-cap em { font: italic 600 clamp(15px, 2.2vh, 20px)/1.2 var(--font-playfair), 'Playfair Display', Georgia, serif; color: #fff6ea;
  text-shadow: 0 0 18px rgba(255,176,0,.6), 0 2px 10px rgba(42,3,6,.9); }
.dpo-glow { position: relative; display: block; width: clamp(96px, 14vw, 150px); height: 3px; border-radius: 3px; overflow: hidden; background: rgba(255,214,120,.25); }
.dpo-glow::after { content: ""; position: absolute; inset: 0; border-radius: inherit; transform-origin: left; transform: scaleX(0);
  background: linear-gradient(90deg, #ff3d9a, #ffb000, #12b5a6); box-shadow: 0 0 10px rgba(255,176,0,.8); }
.dpo-on .dpo-cap { opacity: 1; transform: translate(-50%, 0); }
.dpo-on .dpo-glow::after { animation: dpoFill 1.6s cubic-bezier(.3,.6,.3,1) .2s forwards; }
@keyframes dpoFill { 0% { transform: scaleX(0); } 70% { transform: scaleX(.86); } 100% { transform: scaleX(.96); } }
.dpo-out { pointer-events: none; }
.dpo-out .dpo-scene, .dpo-out .dpo-cap, .dpo-out .dpo-petals, .dpo-out .dpo-stick, .dpo-out .dpo-click { opacity: 0 !important; transition: opacity .5s ease; }
.dpo-skip .dpo-shards, .dpo-skip .dpo-flash { opacity: 0 !important; transition: opacity .2s ease; }
.dpo-rm .dpo-scene { transition-duration: .18s; }
.dpo-rm *, .dpo-rm *::after { animation: none !important; transition: none !important; }
.dpo-rm .dpo-band, .dpo-rm .dpo-ring-m { transform: none; opacity: 1; }
.dpo-rm .dpo-ring-m { display: none; }
.dpo-rm .dpo-l { opacity: 1; transform: rotate(-34deg); }
.dpo-rm .dpo-r { opacity: 1; transform: rotate(34deg); }
.dpo-rm .dpo-glow { display: none; }
`;

const SCENES: Record<FestivalId, PortalScene> = {
  dandiya: { cls: "dpo", css: DANDIYA_CSS, html: DANDIYA_HTML, pushAtMs: 700, minShowMs: 1450 },
  diwali: { cls: "fpo", css: DIWALI_CSS, html: DIWALI_HTML, pushAtMs: 650, minShowMs: 1400 },
};

/** Run a festival's portal and navigate to `href`. A second call while one runs is ignored. */
export function openWithFestival(kind: FestivalId, href: string, push: Push, prefetch?: Prefetch) {
  runPortal(SCENES[kind], href, push, prefetch);
}

/**
 * `const go = useFestivalPortal()` → `onClick={(e) => go(e, href)}` on any
 * link into the active festival's drop. Returns false (and does nothing)
 * outside a festival mode.
 */
export function useFestivalPortal() {
  const router = useRouter();
  const season = useSeason();
  const kind = useFestival();
  return useCallback(
    (e: ReactMouseEvent, href: string) => {
      if (!kind || isModifiedClick(e)) return false;
      // Only the ACTIVE festival's templates (or its offer page) open through its portal:
      // the Dandiya card on /dandiya-offer must not burst into Diwali fireworks.
      const intoDrop = festivalOfHref(href, season) === kind || slugOfHref(href) === slugOfHref(DROPS[kind].path);
      if (!intoDrop) return false;
      e.preventDefault();
      openWithFestival(kind, href, (h) => router.push(h), (h) => router.prefetch(h));
      return true;
    },
    [kind, season, router],
  );
}

/** True for a link into the active festival's drop (gallery cards use it). */
export function useIsFestivalTemplate(slug: string): boolean {
  const season = useSeason();
  return festivalOfHref(`/${slug}`, season) !== null;
}

type FestivalLinkProps = Omit<React.ComponentProps<typeof Link>, "href"> & { href: string };

/** A next/link that opens through the active festival's portal. */
export function FestivalLink({ href, onClick, ...rest }: FestivalLinkProps) {
  const go = useFestivalPortal();
  return <Link href={href} {...rest} onClick={(e) => { onClick?.(e); go(e, href); }} />;
}
