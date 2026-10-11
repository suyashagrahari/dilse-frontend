"use client";

// ─── The festive portal: opening a Navratri & Diwali template ────────────────
//
// The festive twin of the witch portal (WitchPortal.tsx), run by the shared
// seasonPortal.ts. When a visitor opens a festive drop template from the site
// (the drop cards, the gallery cards for those slugs, the gallery teaser, the
// offer page's CTAs) while the site is in festive mode:
//
//   0 ms     a navy festival night fades in over the page: stars, a row of
//            diyas along the bottom, a marigold toran across the top
//   ~150 ms  the centre diya's flame swells and a rocket of light swooshes up
//            from it, leaving a golden trail
//   ~650 ms  it bursts into fireworks (gold, rose, peacock teal), two smaller
//            bursts follow and marigold petals drift down; the route is pushed
//   ~1.4 s   once the new page is on screen the veil dissolves into it
//
// Silent: no festive audio exists in the repo, and a template's own music
// starts on its own tap. Tap anywhere to skip; reduced motion → a quick fade.
// Outside festive mode the links behave normally.

import { useCallback, type MouseEvent as ReactMouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSeason } from "@/hooks/useSeason";
import { FESTIVE_SLUGS, type Season } from "@/lib/season";
import { isModifiedClick, runPortal, slugOfHref, type Prefetch, type PortalScene, type Push } from "./seasonPortal";

/** The festive drop's template slugs: the live drop's while in festive mode, else the defaults. */
export function festiveSlugs(season: Season | null | undefined): readonly string[] {
  return season?.mode === "festive" && season.sale.slugs.length ? season.sale.slugs : FESTIVE_SLUGS;
}

/** True for a link to a festive drop template. */
export function isFestiveTemplateHref(href: string, season?: Season | null): boolean {
  return festiveSlugs(season).includes(slugOfHref(href));
}

const BURSTS: { x: number; y: number; c: string; s: number; d: number }[] = [
  { x: 50, y: 30, c: "#ffd36b", s: 1, d: 0 },
  { x: 24, y: 22, c: "#ff5d8f", s: 0.62, d: 180 },
  { x: 77, y: 20, c: "#2fd3c0", s: 0.7, d: 300 },
  { x: 36, y: 44, c: "#ffb020", s: 0.45, d: 420 },
  { x: 66, y: 40, c: "#fff3c4", s: 0.5, d: 520 },
];

const burstSvg = (c: string) => {
  const rays = Array.from({ length: 18 }, (_, i) => {
    const a = (360 / 18) * i;
    const long = i % 2 === 0;
    return `<g transform="rotate(${a} 50 50)"><path d="M50 ${long ? 30 : 34}V${long ? 6 : 14}" stroke="${c}" stroke-width="${long ? 2.4 : 1.6}" stroke-linecap="round"/><circle cx="50" cy="${long ? 3.5 : 11}" r="${long ? 2.2 : 1.5}" fill="${i % 3 ? c : "#fff8de"}"/></g>`;
  }).join("");
  return `<svg viewBox="0 0 100 100" aria-hidden="true">${rays}<circle cx="50" cy="50" r="5" fill="#fff8de"/></svg>`;
};

const DIYA_SVG = `<svg viewBox="0 0 64 44" aria-hidden="true"><defs><radialGradient id="fpo-fl" cx="50%" cy="70%" r="60%"><stop offset="0" stop-color="#fff6c8"/><stop offset=".45" stop-color="#ffd36b"/><stop offset="1" stop-color="#f07c0a"/></radialGradient><linearGradient id="fpo-b" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#e2722b"/><stop offset="1" stop-color="#8a3210"/></linearGradient></defs><path class="fpo-flame" d="M32 2c5 7 7.4 12 7.4 15.6A7.4 7.4 0 0 1 32 25a7.4 7.4 0 0 1-7.4-7.4C24.6 14 27 9 32 2z" fill="url(#fpo-fl)"/><path d="M4 26h56c-2.6 10-13 16-28 16S6.6 36 4 26z" fill="url(#fpo-b)"/><path d="M4 26h56" stroke="#ffcf7a" stroke-width="2.4" stroke-linecap="round"/></svg>`;

const TORAN_SVG = (() => {
  const flowers = Array.from({ length: 23 }, (_, i) => {
    const x = 2 + i * 4.35;
    const y = 4 + Math.sin((i / 22) * Math.PI) * 6;
    return `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="1.9" fill="${i % 2 ? "#ffb020" : "#f07c0a"}"/>` +
      (i % 3 === 1 ? `<path d="M${x.toFixed(2)} ${(y + 1.6).toFixed(2)}q-1.6 3.6 0 7q1.6-3.4 0-7z" fill="#3f9b4a"/>` : "");
  }).join("");
  return `<svg class="fpo-toran" viewBox="0 0 100 16" preserveAspectRatio="none" aria-hidden="true">${flowers}</svg>`;
})();

const PETALS = Array.from({ length: 16 }, (_, i) =>
  `<i class="fpo-petal" style="--x:${(i * 6.3 + 3) % 100}%;--d:${(i % 5) * 0.12 + 0.5}s;--r:${(i * 47) % 360}deg;--c:${i % 3 ? "#ffb020" : "#f07c0a"}"></i>`,
).join("");

const SCENE_HTML = (reduced: boolean) =>
  `<span class="fpo-scene"><span class="fpo-veil"></span><span class="fpo-stars"></span>${TORAN_SVG}` +
  `<span class="fpo-row">${Array.from({ length: 7 }, (_, i) => `<span class="fpo-d fpo-d${i}">${DIYA_SVG}</span>`).join("")}</span>` +
  `<span class="fpo-glowfloor"></span></span>` +
  (reduced
    ? ""
    : `<span class="fpo-rocket"><i></i></span>` +
      BURSTS.map((b, i) => `<span class="fpo-burst" style="left:${b.x}%;top:${b.y}%;--s:${b.s};--d:${650 + b.d}ms;--c:${b.c}">${burstSvg(b.c)}</span><i class="fpo-flash fpo-flash${i}" style="left:${b.x}%;top:${b.y}%;--d:${650 + b.d}ms;--c:${b.c}"></i>`).join("") +
      `<span class="fpo-petals">${PETALS}</span>`) +
  `<span class="fpo-cap"><em>Lighting up your festive card…</em><i class="fpo-glow"></i></span>`;

const FPO_CSS = `
.fpo { position: fixed; inset: 0; z-index: 2147483000; overflow: hidden; pointer-events: auto; cursor: pointer; contain: strict; }
.fpo > span, .fpo-scene > * { position: absolute; }
.fpo-scene { inset: 0; opacity: 0; transition: opacity .3s ease; }
.fpo-on .fpo-scene { opacity: 1; }
.fpo-veil { inset: 0;
  background: radial-gradient(60% 45% at 50% 30%, rgba(255,196,77,.16), transparent 70%),
    radial-gradient(90% 50% at 50% 105%, rgba(240,124,10,.26), transparent 70%),
    linear-gradient(180deg, #0b0d2a 0%, #1a1f52 50%, #232a66 74%, #0d0f2e 100%); }
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
.fpo-d { display: block; width: clamp(34px, 6vw, 64px); aspect-ratio: 64 / 44; filter: drop-shadow(0 0 18px rgba(255,196,77,.55)); }
.fpo-d svg { display: block; width: 100%; height: 100%; overflow: visible; }
.fpo-d3 { width: clamp(64px, 11vw, 120px); }
.fpo-flame { transform-box: fill-box; transform-origin: 50% 100%; animation: fpoFlick 1.1s ease-in-out infinite alternate; }
.fpo-d1 .fpo-flame, .fpo-d4 .fpo-flame { animation-delay: -.4s; }
.fpo-d2 .fpo-flame, .fpo-d6 .fpo-flame { animation-delay: -.8s; }
@keyframes fpoFlick { from { transform: scale(1, 1) rotate(-3deg); } to { transform: scale(.9, 1.12) rotate(3deg); } }
.fpo-on .fpo-d3 .fpo-flame { animation: fpoSwell .5s ease-out .1s both, fpoFlick 1.1s ease-in-out .6s infinite alternate; }
@keyframes fpoSwell { 50% { transform: scale(1.5, 1.9); } 100% { transform: scale(1, 1); } }
.fpo-glowfloor { left: 0; right: 0; bottom: 0; height: 32vh; background: radial-gradient(60% 80% at 50% 100%, rgba(255,176,32,.32), transparent 70%); }

/* the rocket of light: from the centre diya's flame up to the first burst */
.fpo-rocket { left: 50%; bottom: calc(clamp(56px, 12vh, 120px) + clamp(40px, 7vw, 76px)); width: 4px; height: 0; z-index: 2; }
.fpo-rocket i { position: absolute; left: -3px; bottom: 0; width: 10px; height: 10px; border-radius: 50%;
  background: radial-gradient(circle, #fff 0%, #ffd36b 45%, transparent 72%); box-shadow: 0 0 16px 6px rgba(255,211,107,.7); opacity: 0; }
.fpo-rocket i::after { content: ""; position: absolute; left: 3.5px; top: 8px; width: 3px; height: 26vh; border-radius: 3px; transform-origin: 50% 0; transform: scaleY(0);
  background: linear-gradient(180deg, rgba(255,211,107,.95), rgba(255,176,32,.35) 40%, transparent); }
.fpo-on .fpo-rocket i { animation: fpoRise .52s cubic-bezier(.3,.2,.4,1) .14s forwards; }
.fpo-on .fpo-rocket i::after { animation: fpoTrail .52s ease-out .14s forwards; }
@keyframes fpoRise { 0% { opacity: 0; transform: translateY(0); } 10% { opacity: 1; } 92% { opacity: 1; } 100% { opacity: 0; transform: translateY(calc(-1 * (100vh - 30vh - clamp(56px, 12vh, 120px) - clamp(40px, 7vw, 76px)))); } }
@keyframes fpoTrail { 0% { transform: scaleY(0); opacity: 1; } 60% { transform: scaleY(1); opacity: .9; } 100% { transform: scaleY(.6); opacity: 0; } }

/* the bursts */
.fpo-burst { z-index: 2; width: calc(min(62vmin, 520px) * var(--s)); aspect-ratio: 1; transform: translate(-50%, -50%) scale(0); opacity: 0; }
.fpo-burst svg { display: block; width: 100%; height: 100%; filter: drop-shadow(0 0 10px var(--c)); }
.fpo-on .fpo-burst { animation: fpoBurst 1.15s cubic-bezier(.15,.75,.3,1) var(--d) forwards; }
@keyframes fpoBurst { 0% { opacity: 1; transform: translate(-50%, -50%) scale(.08) rotate(0deg); } 55% { opacity: 1; }
  100% { opacity: 0; transform: translate(-50%, -42%) scale(1) rotate(10deg); } }
.fpo-flash { position: absolute; z-index: 1; width: 40vmin; aspect-ratio: 1; border-radius: 50%; transform: translate(-50%, -50%) scale(.2); opacity: 0;
  background: radial-gradient(circle, color-mix(in srgb, var(--c) 55%, transparent) 0%, transparent 65%); }
.fpo-on .fpo-flash { animation: fpoFlash .9s ease-out var(--d) forwards; }
@keyframes fpoFlash { 0% { opacity: .9; transform: translate(-50%, -50%) scale(.2); } 100% { opacity: 0; transform: translate(-50%, -50%) scale(1.3); } }

/* marigold petals drifting down after the burst */
.fpo-petals { inset: 0; z-index: 2; pointer-events: none; }
.fpo-petal { position: absolute; left: var(--x); top: -4vh; width: 9px; height: 14px; border-radius: 60% 60% 50% 50%; background: var(--c); opacity: 0;
  transform: rotate(var(--r)); box-shadow: inset -2px -2px 0 rgba(150,60,0,.25); }
.fpo-on .fpo-petal { animation: fpoPetal 2.2s linear var(--d) forwards; }
@keyframes fpoPetal { 0% { opacity: 0; transform: translate(0, 0) rotate(var(--r)); } 10% { opacity: 1; }
  100% { opacity: .9; transform: translate(4vw, 92vh) rotate(calc(var(--r) + 420deg)); } }

/* the caption and a small glow that fills while the card opens */
.fpo-cap { z-index: 3; left: 50%; bottom: calc(max(14px, 3vh) + env(safe-area-inset-bottom, 0px)); transform: translate(-50%, 6px); opacity: 0;
  display: flex; flex-direction: column; align-items: center; gap: 10px; white-space: nowrap; transition: opacity .4s ease .3s, transform .6s ease .3s; }
.fpo-cap em { font: italic 600 clamp(15px, 2.2vh, 20px)/1.2 var(--font-playfair), 'Playfair Display', Georgia, serif; color: #fff7e8;
  text-shadow: 0 0 18px rgba(255,196,77,.6), 0 2px 10px rgba(6,6,24,.9); }
.fpo-glow { position: relative; display: block; width: clamp(96px, 14vw, 150px); height: 3px; border-radius: 3px; overflow: hidden; background: rgba(255,211,107,.2); }
.fpo-glow::after { content: ""; position: absolute; inset: 0; border-radius: inherit; transform-origin: left; transform: scaleX(0);
  background: linear-gradient(90deg, #ff5d8f, #ffd36b, #ffb020); box-shadow: 0 0 10px rgba(255,176,32,.8); }
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

const FESTIVE_SCENE: PortalScene = {
  cls: "fpo",
  css: FPO_CSS,
  html: SCENE_HTML,
  pushAtMs: 650,
  minShowMs: 1400,
};

/** Run the festive portal and navigate to `href`. A second call while one runs is ignored. */
export function openWithFireworks(href: string, push: Push, prefetch?: Prefetch) {
  runPortal(FESTIVE_SCENE, href, push, prefetch);
}

/**
 * `const go = useFestivePortal()` → `onClick={(e) => go(e, href)}` on any link
 * to a festive surface. Returns false (and does nothing) outside festive mode.
 */
export function useFestivePortal() {
  const router = useRouter();
  const on = useSeason()?.mode === "festive";
  return useCallback(
    (e: ReactMouseEvent, href: string) => {
      if (!on || isModifiedClick(e)) return false;
      e.preventDefault();
      openWithFireworks(href, (h) => router.push(h), (h) => router.prefetch(h));
      return true;
    },
    [on, router],
  );
}

type FestiveLinkProps = Omit<React.ComponentProps<typeof Link>, "href"> & { href: string };

/** A next/link that opens through the festive portal in festive mode. */
export function FestiveLink({ href, onClick, ...rest }: FestiveLinkProps) {
  const go = useFestivePortal();
  return <Link href={href} {...rest} onClick={(e) => { onClick?.(e); go(e, href); }} />;
}
