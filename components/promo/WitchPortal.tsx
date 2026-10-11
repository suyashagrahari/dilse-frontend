"use client";

// ─── The witch portal: opening a Halloween template ──────────────────────────
//
// When a visitor opens a Halloween template from the site (the drop cards, the
// gallery cards for those slugs, the gallery teaser, the drop page's CTAs) the
// click plays a short transition instead of a plain route change:
//
//   0 ms     a navy night veil fades in over the page, the witch's cackle starts
//            (inside the click, so the browser allows the sound)
//   ~180 ms  the witch-seal on her broom flies left → right on a gentle arc,
//            a trail of gold-and-lilac sparkles behind her
//   ~600 ms  the route is pushed (it was prefetched on the click)
//   ~1.3 s   once the new page is on screen the veil dissolves into it
//
// Tap anywhere to skip. Under reduced motion it is only a quick fade, no
// flight and no sound. Open in a new tab / with a modifier key → the browser's
// own behaviour, untouched. Outside Halloween mode the links behave normally.
//
// The overlay is plain DOM on <body>, not React state: it has to survive the
// route change (the page that started it unmounts mid-flight). A template
// opened directly (typed URL, shared link) never sees it, so nothing plays
// twice; the cackle is a one-shot Audio that ends on its own (faded out after
// a few seconds) and never touches the template's own music.

import { useCallback, type MouseEvent as ReactMouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useIsHalloween } from "@/hooks/useSeason";
import { HALLOWEEN_GIF, HALLOWEEN_SLUGS } from "@/lib/season";

const WITCH_SRC = HALLOWEEN_GIF("witch-seal-broom.webp");
const LAUGH_SRC = HALLOWEEN_GIF("witch-laugh.mp3");
const FLIGHT_MS = 1150;
const PUSH_AT_MS = 600;

type Push = (href: string) => void;
type Prefetch = (href: string) => void;

let running = false;
let witchWarm = false;

/** Fetch the witch GIF ahead of the click (pointer down / hover), so she flies at once. */
export function warmWitch() {
  if (witchWarm || typeof window === "undefined") return;
  witchWarm = true;
  const img = new Image();
  img.decoding = "async";
  img.src = WITCH_SRC;
}

/** True for a /happy-halloween… template path. */
export function isHalloweenTemplateHref(href: string): boolean {
  const slug = href.replace(/^https?:\/\/[^/]+/, "").replace(/^\//, "").split(/[?#/]/)[0];
  return (HALLOWEEN_SLUGS as readonly string[]).includes(slug);
}

function playCackle(): HTMLAudioElement | null {
  try {
    const a = new Audio(LAUGH_SRC);
    a.volume = 0.85;
    const p = a.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
    // Fade it out after the transition so it never sits on top of the template's own music.
    window.setTimeout(() => {
      const t0 = performance.now();
      const step = () => {
        const k = Math.min(1, (performance.now() - t0) / 900);
        try { a.volume = Math.max(0, 0.85 * (1 - k)); } catch {}
        if (k < 1) requestAnimationFrame(step);
        else { try { a.pause(); a.src = ""; } catch {} }
      };
      requestAnimationFrame(step);
    }, 3200);
    return a;
  } catch {
    return null;
  }
}

const pathOf = (href: string) => href.replace(/^https?:\/\/[^/]+/, "").split(/[?#]/)[0] || "/";
/** The new route is on screen: the URL changed and no route skeleton (loading.tsx) is still showing. */
const onScreen = (target: string) =>
  pathOf(window.location.pathname) === target && !document.querySelector('[aria-busy="true"].skRoot');

/**
 * Run the portal and navigate to `href`. Safe to call from any click handler;
 * a second call while one is running is ignored.
 */
export function openWithWitch(href: string, push: Push, prefetch?: Prefetch) {
  if (typeof window === "undefined") return push(href);
  if (running) return;
  running = true;
  try { prefetch?.(href); } catch {}

  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (!reduced) playCackle();

  const root = document.createElement("div");
  root.className = "wpo" + (reduced ? " wpo-rm" : "");
  root.setAttribute("aria-hidden", "true");
  root.innerHTML =
    `<style>${WPO_CSS}</style><span class="wpo-veil"></span><span class="wpo-stars"></span><span class="wpo-moon"></span>` +
    (reduced
      ? ""
      : `<span class="wpo-path">${Array.from({ length: 9 }, (_, i) => `<i class="wpo-spark" style="--k:${i}"></i>`).join("")}` +
        `<span class="wpo-witch"><img src="${WITCH_SRC}" alt="" width="280" height="280" decoding="async" /></span></span>`);
  document.body.appendChild(root);
  // let the browser paint the start state, then run
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("wpo-on")));

  const target = pathOf(href);
  let pushed = false;
  const doPush = () => {
    if (pushed) return;
    pushed = true;
    push(href);
  };
  const t0 = performance.now();
  const minShow = reduced ? 220 : FLIGHT_MS + 160;
  const pushTimer = window.setTimeout(doPush, reduced ? 160 : PUSH_AT_MS);

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    window.clearTimeout(pushTimer);
    window.clearInterval(poll);
    root.classList.add("wpo-out");
    window.setTimeout(() => { root.remove(); running = false; }, reduced ? 260 : 520);
  };
  // Dissolve once the new page is on screen (or give up after 6 s and reveal whatever is there).
  const poll = window.setInterval(() => {
    const arrived = pushed && onScreen(target);
    const elapsed = performance.now() - t0;
    if ((arrived && elapsed >= minShow) || elapsed > 6000) {
      // one more frame so the template has painted under the veil
      requestAnimationFrame(() => requestAnimationFrame(finish));
      window.clearInterval(poll);
    }
  }, 50);

  // Tap to skip: navigate now, dissolve as soon as the page is there.
  root.addEventListener("pointerdown", () => {
    doPush();
    root.classList.add("wpo-skip");
    const wait = window.setInterval(() => {
      if (onScreen(target) || performance.now() - t0 > 6000) {
        window.clearInterval(wait);
        finish();
      }
    }, 40);
  }, { once: true });
}

/** True when a click should open normally (new tab, download, middle click…). */
function isModified(e: ReactMouseEvent) {
  return e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
}

/**
 * `const go = useWitchPortal()` → `onClick={(e) => go(e, href)}` on any link to
 * a Halloween surface. Returns false (and does nothing) outside Halloween mode.
 */
export function useWitchPortal() {
  const router = useRouter();
  const on = useIsHalloween();
  return useCallback(
    (e: ReactMouseEvent, href: string) => {
      if (!on || isModified(e)) return false;
      e.preventDefault();
      openWithWitch(href, (h) => router.push(h), (h) => router.prefetch(h));
      return true;
    },
    [on, router],
  );
}

type WitchLinkProps = Omit<React.ComponentProps<typeof Link>, "href"> & { href: string };

/** A next/link that opens through the witch portal in Halloween mode. */
export function WitchLink({ href, onClick, onPointerEnter, onPointerDown, ...rest }: WitchLinkProps) {
  const go = useWitchPortal();
  return (
    <Link
      href={href}
      {...rest}
      onPointerEnter={(e) => { warmWitch(); onPointerEnter?.(e); }}
      onPointerDown={(e) => { warmWitch(); onPointerDown?.(e); }}
      onClick={(e) => { onClick?.(e); go(e, href); }}
    />
  );
}

const WPO_CSS = `
.wpo { position: fixed; inset: 0; z-index: 2147483000; overflow: hidden; pointer-events: auto; cursor: pointer; contain: strict; }
.wpo-veil { position: absolute; inset: 0; opacity: 0; transition: opacity .3s ease;
  background: radial-gradient(70% 55% at 72% 22%, rgba(185,166,240,.32), transparent 70%),
    radial-gradient(90% 70% at 50% 110%, rgba(255,154,60,.18), transparent 70%),
    linear-gradient(180deg, #17132a 0%, #231c3d 55%, #120e21 100%); }
.wpo-stars { position: absolute; inset: 0; opacity: 0; transition: opacity .5s ease .1s;
  background-image: radial-gradient(1.4px 1.4px at 12% 18%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 28% 8%, #fff 50%, transparent 51%),
    radial-gradient(1.2px 1.2px at 46% 32%, #fff4cf 50%, transparent 51%), radial-gradient(1px 1px at 66% 12%, #fff 50%, transparent 51%),
    radial-gradient(1.6px 1.6px at 84% 40%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 92% 6%, #fff4cf 50%, transparent 51%),
    radial-gradient(1px 1px at 6% 64%, #fff 50%, transparent 51%), radial-gradient(1.2px 1.2px at 38% 70%, #fff 50%, transparent 51%),
    radial-gradient(1.3px 1.3px at 20% 88%, #e2d8fa 50%, transparent 51%), radial-gradient(1px 1px at 74% 76%, #fff 50%, transparent 51%); }
.wpo-moon { position: absolute; top: 12%; right: 12%; width: min(34vw, 260px); aspect-ratio: 1; border-radius: 50%; opacity: 0;
  transform: scale(.86); transition: opacity .45s ease .05s, transform 1.4s cubic-bezier(.2,.7,.2,1);
  background: radial-gradient(circle at 38% 36%, #fffbe6 0%, #f6e7a6 46%, #ead48a 100%);
  box-shadow: 0 0 80px 30px rgba(246,231,166,.28), 0 0 200px 80px rgba(246,231,166,.1); }
.wpo-on .wpo-veil, .wpo-on .wpo-stars { opacity: 1; }
.wpo-on .wpo-moon { opacity: .9; transform: scale(1); }

/* the flight: one shared path for the witch and her sparkle trail (each spark runs it a beat later) */
.wpo-path { position: absolute; left: 0; top: 36%; width: 100%; height: 0; }
.wpo-witch, .wpo-spark { position: absolute; left: 0; top: 0; will-change: transform; transform: translate(-40vw, 0); }
.wpo-witch { width: clamp(150px, 32vw, 250px); aspect-ratio: 1; margin-top: calc(clamp(150px, 32vw, 250px) / -2);
  filter: drop-shadow(0 0 22px rgba(255,214,150,.45)); }
.wpo-witch img { display: block; width: 100%; height: 100%; }
.wpo-on .wpo-witch { animation: wpoFly ${FLIGHT_MS}ms cubic-bezier(.45,.05,.55,.95) .18s forwards; }
.wpo-spark { width: 10px; height: 10px; margin: -5px 0 0 calc(clamp(150px, 32vw, 250px) * .18); border-radius: 50%; opacity: 0;
  background: radial-gradient(circle, #fff7d6 0%, #ffc35a 45%, rgba(185,166,240,0) 72%); box-shadow: 0 0 12px 4px rgba(255,195,90,.45); }
.wpo-spark:nth-child(even) { width: 6px; height: 6px; background: radial-gradient(circle, #fff 0%, #cfc2f7 50%, transparent 72%); box-shadow: 0 0 10px 3px rgba(185,166,240,.5); }
.wpo-on .wpo-spark { animation: wpoFly ${FLIGHT_MS}ms cubic-bezier(.45,.05,.55,.95) forwards, wpoSpark ${FLIGHT_MS}ms linear forwards;
  animation-delay: calc(.18s + var(--k) * 55ms), calc(.18s + var(--k) * 55ms); }
.wpo-spark:nth-child(3n) { margin-top: 6px; }
.wpo-spark:nth-child(3n+1) { margin-top: -14px; }
@keyframes wpoFly {
  0%   { transform: translate(-40vw, 10vh) rotate(-8deg); }
  30%  { transform: translate(18vw, -4vh) rotate(-3deg); }
  55%  { transform: translate(52vw, -10vh) rotate(2deg); }
  80%  { transform: translate(84vw, -6vh) rotate(6deg); }
  100% { transform: translate(120vw, 4vh) rotate(10deg); }
}
@keyframes wpoSpark { 0% { opacity: 0; } 12% { opacity: 1; } 80% { opacity: .8; } 100% { opacity: 0; } }

/* the dissolve into the template */
.wpo-out { pointer-events: none; }
.wpo-out .wpo-veil, .wpo-out .wpo-stars, .wpo-out .wpo-moon { opacity: 0; transition: opacity .5s ease; }
.wpo-out .wpo-moon { transform: scale(1.15); }
.wpo-out .wpo-path { opacity: 0; transition: opacity .3s ease; }
.wpo-skip .wpo-path { opacity: 0; transition: opacity .2s ease; }

.wpo-rm .wpo-veil { transition-duration: .18s; }
.wpo-rm.wpo-out .wpo-veil, .wpo-rm.wpo-out .wpo-stars, .wpo-rm.wpo-out .wpo-moon { transition-duration: .22s; }
.wpo-rm .wpo-moon { transition: opacity .18s ease; transform: none; }
`;
