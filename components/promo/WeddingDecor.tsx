"use client";

// ─── The wedding season's decor: torans, jhumkas and drifting petals ─────────
//
// The wedding twin of FestivalDecor / HalloweenCornerWebs, in daylight:
//
// WeddingCorners — from each top corner hang marigold laris (genda strands of
//   three lengths, a rose bud and a gold tassel at each end) under a short
//   swag of toran, and a gold jhumka that sways on its hook.
//   scope "page"   — the blog: pinned to the top corners of the document.
//   scope "parent" — fills the nearest positioned ancestor.
//
// WeddingPetals — rose and marigold petals drifting down, fluttering. A few
//   only: 14 on wide screens, 10 on tablets, 6 on phones.
//   scope "page"   — a fixed, viewport-sized layer (the blog).
//   scope "parent" — the nearest positioned ancestor (the home hero), falling
//                    its measured height.
//
// WeddingHeroDecor — the home hero's wash: ivory and rose-blush light from the
//   corners, a zari hem, the petals, and the corners at the top of the page.
//
// THE RULES (same as the festival layers): pure inline SVG / data-URI art, no
// request; absolutely positioned, pointer-events none, so nothing moves the
// page; only transform and opacity animate; everything is paused while the
// layer is scrolled out of view or the tab is hidden, and off entirely under
// prefers-reduced-motion. Renders nothing unless the site is in "wedding" mode.

import { useEffect, useRef, useSyncExternalStore, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useIsWedding } from "@/hooks/useSeason";
import { GendaLari, Jhumka, MarigoldToran } from "./weddingArt";

const noop = () => () => {};

/**
 * Pause a layer's animations while it is off screen or the tab is hidden:
 * sets `data-paused` on the element, which the CSS turns into
 * `animation-play-state: paused` for everything inside.
 */
function usePauseOffscreen(ref: React.RefObject<HTMLElement | null>, alwaysVisible = false) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let inView = true;
    const apply = () => {
      const paused = document.hidden || !inView;
      if (paused) el.setAttribute("data-paused", "");
      else el.removeAttribute("data-paused");
    };
    let io: IntersectionObserver | null = null;
    if (!alwaysVisible && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver((entries) => {
        inView = entries.some((e) => e.isIntersecting);
        apply();
      });
      io.observe(el);
    }
    document.addEventListener("visibilitychange", apply);
    apply();
    return () => {
      io?.disconnect();
      document.removeEventListener("visibilitychange", apply);
    };
  }, [ref, alwaysVisible]);
}

// ── corners ──────────────────────────────────────────────────────────────────

export function WeddingCorners({ scope = "page" }: { scope?: "page" | "parent" }) {
  const on = useIsWedding();
  // The page layer portals to <body>, which exists only after mount.
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  if (!on || (scope === "page" && !mounted)) return null;
  return <Corners scope={scope} />;
}

function Corners({ scope }: { scope: "page" | "parent" }) {
  const ref = useRef<HTMLDivElement>(null);
  usePauseOffscreen(ref);
  const node = (
    <div ref={ref} className={`wdc wdc-${scope}`} aria-hidden>
      <style>{WDC_CSS}</style>
      {(["l", "r"] as const).map((side) => (
        <span key={side} className={`wdc-c wdc-${side}`}>
          <span className="wdc-swag"><MarigoldToran n={2} bells={false} /></span>
          <span className="wdc-lari wdc-l1"><GendaLari n={9} /></span>
          <span className="wdc-lari wdc-l2"><GendaLari n={6} rose={false} /></span>
          <span className="wdc-lari wdc-l3"><GendaLari n={4} /></span>
          <span className="wdc-jh"><i /><Jhumka size={30} /></span>
        </span>
      ))}
    </div>
  );
  return scope === "page" ? createPortal(node, document.body) : node;
}

const WDC_CSS = `
.wdc { pointer-events: none; }
.wdc-page { position: absolute; left: 0; top: 0; width: 100%; height: 0; z-index: 30; }
body:has(.wdc-page) .wsb-wrap { z-index: 31; }
.wdc-parent { position: absolute; inset: 0; z-index: 2; overflow: hidden; }
.wdc-c { position: absolute; top: 0; display: block; width: 210px; height: 220px; }
.wdc-l { left: 0; }
.wdc-r { right: 0; transform: scaleX(-1); }
.wdc-swag { position: absolute; left: 0; top: -4px; width: 210px; display: block; filter: drop-shadow(0 3px 3px rgba(110,40,10,.22)); }
.wdc-swag svg { display: block; width: 100%; height: auto; }
.wdc-lari { position: absolute; top: 0; display: block; transform-origin: 50% 0; animation: wdcSway 5.2s ease-in-out infinite; filter: drop-shadow(0 3px 3px rgba(110,40,10,.25)); }
.wdc-lari svg { display: block; }
.wdc-l1 { left: 14px; }
.wdc-l2 { left: 40px; animation-duration: 4.6s; animation-delay: -1.6s; }
.wdc-l3 { left: 64px; animation-duration: 5.8s; animation-delay: -3s; }
.wdc-r .wdc-l1 { animation-delay: -2.2s; }
.wdc-jh { position: absolute; left: 112px; top: 26px; display: block; transform-origin: 50% 0; animation: wdcJh 3.4s ease-in-out infinite; }
.wdc-jh i { position: absolute; left: 50%; top: -26px; width: 1px; height: 26px; background: linear-gradient(180deg, rgba(195,154,67,.25), #c39a43); }
.wdc-jh svg { display: block; filter: drop-shadow(0 4px 5px rgba(110,70,10,.3)); }
.wdc-r .wdc-jh { animation-delay: -1.7s; }
@keyframes wdcSway { 0%, 100% { transform: rotate(-3.5deg); } 50% { transform: rotate(3.5deg); } }
@keyframes wdcJh { 0%, 100% { transform: rotate(-9deg); } 50% { transform: rotate(9deg); } }
.wdc[data-paused] * { animation-play-state: paused !important; }
@media (max-width: 1023px) {
  .wdc-c { width: 160px; height: 170px; }
  .wdc-swag { width: 160px; }
  .wdc-l1 svg { height: 150px; width: auto; }
  .wdc-jh { left: 92px; }
}
@media (max-width: 768px) {
  .wdc-c { width: 96px; height: 120px; }
  .wdc-swag { width: 96px; }
  .wdc-l1 { left: 6px; } .wdc-l1 svg { height: 104px; width: auto; }
  .wdc-l2 { left: 24px; } .wdc-l2 svg { height: 70px; width: auto; }
  .wdc-l3, .wdc-jh { display: none; }
}
@media (prefers-reduced-motion: reduce) { .wdc * { animation: none !important; } }
`;

// ── petals ───────────────────────────────────────────────────────────────────

const svgUri = (svg: string) => `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`;
const ROSE = svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10 1c6 3 8 9 4 15-2 3-6 3-8 0C2 10 4 4 10 1z" fill="#e48f9b"/><path d="M10 1c6 3 8 9 4 15-1 1.4-2.4 2.1-4 2.2 2-5 2-11 0-17.2z" fill="#d06f80" opacity=".55"/><path d="M10 3c1 5 1 9-1 13" stroke="#fff" stroke-opacity=".45" stroke-width=".8" fill="none"/></svg>`);
const BLUSH = svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10 1c6 3 8 9 4 15-2 3-6 3-8 0C2 10 4 4 10 1z" fill="#f6c3c6"/><path d="M10 3c1 5 1 9-1 13" stroke="#fff" stroke-opacity=".6" stroke-width=".8" fill="none"/></svg>`);
const GENDA = svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10 2c4 2 6 6 4 11-1 3-3 5-4 5s-3-2-4-5C4 8 6 4 10 2z" fill="#f4a21c"/><path d="M10 2c4 2 6 6 4 11-1 3-3 5-4 5 1-5 1-11 0-16z" fill="#e0780c" opacity=".55"/><path d="M7 7q3 1 6 0M7 11q3 1 6 0" stroke="#c45e06" stroke-opacity=".5" stroke-width=".7" fill="none"/></svg>`);
const ARTS = [ROSE, GENDA, BLUSH, ROSE, GENDA, ROSE, BLUSH];

/** Deterministic 0..1 noise, so the server render and the client agree. */
const noise = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};
const PETALS = Array.from({ length: 14 }, (_, i) => ({
  left: Math.round(noise(i, 1) * 96 + 2),
  size: Math.round(11 + noise(i, 2) * 9),
  dur: Math.round((11 + noise(i, 3) * 9) * 10) / 10,
  delay: -Math.round(noise(i, 4) * 200) / 10,
  dx: Math.round((noise(i, 5) - 0.5) * 160),
  rot: Math.round(240 + noise(i, 6) * 360) * (i % 2 ? 1 : -1),
  flutter: Math.round((1.6 + noise(i, 7) * 1.6) * 10) / 10,
  art: ARTS[i % ARTS.length],
}));

export function WeddingPetals({ scope = "page" }: { scope?: "page" | "parent" }) {
  const on = useIsWedding();
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  if (!on || (scope === "page" && !mounted)) return null;
  return <Petals scope={scope} />;
}

function Petals({ scope }: { scope: "page" | "parent" }) {
  const ref = useRef<HTMLDivElement>(null);
  usePauseOffscreen(ref, scope === "page");
  // A parent-scoped layer falls its own height (the hero's), measured once and on resize.
  useEffect(() => {
    const el = ref.current;
    if (!el || scope !== "parent" || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => el.style.setProperty("--wp-h", `${Math.round(e.contentRect.height + 60)}px`));
    ro.observe(el);
    return () => ro.disconnect();
  }, [scope]);
  const node = (
    <div ref={ref} className={`wp wp-${scope}`} aria-hidden>
      <style>{WP_CSS}</style>
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="wp-p"
          style={{ left: `${p.left}%`, "--d": `${p.dur}s`, "--dl": `${p.delay}s`, "--dx": `${p.dx}px`, "--r": `${p.rot}deg` } as CSSProperties}
        >
          <i style={{ width: p.size, height: p.size, backgroundImage: p.art, animationDuration: `${p.flutter}s` }} />
        </span>
      ))}
    </div>
  );
  return scope === "page" ? createPortal(node, document.body) : node;
}

const WP_CSS = `
.wp { pointer-events: none; overflow: hidden; contain: strict; }
.wp-page { position: fixed; inset: 0; z-index: 29; --wp-h: 108vh; }
.wp-parent { position: absolute; inset: 0; z-index: 0; --wp-h: 900px; }
.wp-p { position: absolute; top: -36px; display: block; will-change: transform; opacity: 0;
  animation: wpFall var(--d) linear var(--dl) infinite; }
.wp-p i { display: block; background: center / contain no-repeat; animation: wpFlutter 2.4s ease-in-out infinite alternate; }
@keyframes wpFall {
  0% { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 0; }
  8% { opacity: .9; }
  85% { opacity: .85; }
  100% { transform: translate3d(var(--dx), var(--wp-h), 0) rotate(var(--r)); opacity: 0; }
}
@keyframes wpFlutter { from { transform: rotateX(0deg) scaleX(1); } to { transform: rotateX(55deg) scaleX(.82); } }
.wp[data-paused] * { animation-play-state: paused !important; }
@media (max-width: 1023px) { .wp-p:nth-child(n+12) { display: none; } }
@media (max-width: 640px) { .wp-p:nth-child(n+8) { display: none; } }
@media (prefers-reduced-motion: reduce) { .wp { display: none; } }
`;

// ── the home hero's wash ─────────────────────────────────────────────────────

export function WeddingHeroDecor() {
  const on = useIsWedding();
  if (!on) return null;
  return (
    <>
      <div className="wdhero" aria-hidden>
        <style>{WDHERO_CSS}</style>
        <span className="wdhero-haze" />
        <span className="wdhero-jaali" />
        <span className="wdhero-hem" />
      </div>
      <WeddingPetals scope="parent" />
      {/* The corners hang from the very top of the page, above the strip and the hero. */}
      <WeddingCorners scope="page" />
    </>
  );
}

const WDHERO_CSS = `
/* The home page's floral top corners (CornerOrnaments) give way to the wedding's own. */
body:has(.wdhero) [data-corner-top] { display: none; }
.wdhero { position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
.wdhero-haze { position: absolute; inset: 0;
  background: radial-gradient(55% 50% at 86% 18%, rgba(231,154,163,.26), transparent 70%),
    radial-gradient(50% 55% at 4% 96%, rgba(244,162,28,.16), transparent 70%),
    radial-gradient(40% 40% at 100% 100%, rgba(195,154,67,.16), transparent 70%),
    linear-gradient(180deg, rgba(255,250,242,.55), rgba(255,250,242,0) 40%, rgba(249,225,220,.35)); }
/* a faint gold jaali lattice, strongest at the edges */
.wdhero-jaali { position: absolute; inset: 0; opacity: .38;
  background: radial-gradient(circle at 50% 50%, transparent 7px, rgba(195,154,67,.22) 7.5px 8.5px, transparent 9px) 0 0 / 28px 28px,
    radial-gradient(circle at 50% 50%, rgba(195,154,67,.28) 0 1.3px, transparent 1.8px) 14px 14px / 28px 28px;
  -webkit-mask-image: radial-gradient(80% 75% at 50% 50%, transparent 45%, #000 90%); mask-image: radial-gradient(80% 75% at 50% 50%, transparent 45%, #000 90%); }
/* a zari hem along the hero's bottom edge */
.wdhero-hem { position: absolute; left: 0; right: 0; bottom: 0; height: 9px; opacity: .9;
  background: radial-gradient(circle, #f4a21c 2.4px, transparent 2.8px) 0 50% / 14px 9px repeat-x,
    linear-gradient(90deg, #c39a43, #f2dea4 25%, #c39a43 50%, #f2dea4 75%, #c39a43); }
`;
