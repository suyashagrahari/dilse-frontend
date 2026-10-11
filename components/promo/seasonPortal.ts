// ─── The seasonal portal machinery ───────────────────────────────────────────
//
// A drop's templates open through a short full-screen transition instead of a
// plain route change: the Halloween witch (WitchPortal.tsx), the festive
// firework (FestivePortal.tsx). Each season brings only its scene (HTML + CSS
// strings) and timings; this file runs it the same way for all of them:
//
//   0 ms        the overlay (plain DOM on <body>, so it survives the route
//               change) fades in; `onStart` runs inside the click (sound)
//   pushAt      the route is pushed (prefetched on the click)
//   ≥ minShow   once the new page is on screen the veil dissolves into it
//
// Tap anywhere to skip. Under reduced motion the season's scene is shown
// without its animations and the timings shrink to a quick fade. A second call
// while one is running is ignored.

import type { MouseEvent as ReactMouseEvent } from "react";

export type Push = (href: string) => void;
export type Prefetch = (href: string) => void;

export type PortalScene = {
  /** Root class; the scene's CSS is scoped under it. `${cls}-on`, `${cls}-out`, `${cls}-skip`, `${cls}-rm` are added. */
  cls: string;
  css: string;
  /** Inner HTML for a run; `reduced` is true under prefers-reduced-motion. */
  html: (reduced: boolean) => string;
  pushAtMs: number;
  minShowMs: number;
  /** Runs synchronously inside the click (e.g. start a sound), never under reduced motion. */
  onStart?: () => void;
};

let running = false;

const pathOf = (href: string) => href.replace(/^https?:\/\/[^/]+/, "").split(/[?#]/)[0] || "/";
/** The new route is on screen: the URL changed and no route skeleton (loading.tsx) is still showing. */
const onScreen = (target: string) =>
  pathOf(window.location.pathname) === target && !document.querySelector('[aria-busy="true"].skRoot');

/** Play `scene` and navigate to `href`. */
export function runPortal(scene: PortalScene, href: string, push: Push, prefetch?: Prefetch) {
  if (typeof window === "undefined") return push(href);
  if (running) return;
  running = true;
  try { prefetch?.(href); } catch {}

  const reduced = !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (!reduced) scene.onStart?.();

  const { cls } = scene;
  const root = document.createElement("div");
  root.className = cls + (reduced ? ` ${cls}-rm` : "");
  root.setAttribute("aria-hidden", "true");
  root.innerHTML = `<style>${scene.css}</style>${scene.html(reduced)}`;
  document.body.appendChild(root);
  // let the browser paint the start state, then run
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add(`${cls}-on`)));

  const target = pathOf(href);
  let pushed = false;
  const doPush = () => {
    if (pushed) return;
    pushed = true;
    push(href);
  };
  const t0 = performance.now();
  const minShow = reduced ? 220 : scene.minShowMs;
  const pushTimer = window.setTimeout(doPush, reduced ? 160 : scene.pushAtMs);

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    window.clearTimeout(pushTimer);
    window.clearInterval(poll);
    root.classList.add(`${cls}-out`);
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
    root.classList.add(`${cls}-skip`);
    const wait = window.setInterval(() => {
      if (onScreen(target) || performance.now() - t0 > 6000) {
        window.clearInterval(wait);
        finish();
      }
    }, 40);
  }, { once: true });
}

/** True when a click should open normally (new tab, download, middle click…). */
export function isModifiedClick(e: ReactMouseEvent) {
  return e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
}

/** The first path segment of an href — the template slug for a template link. */
export function slugOfHref(href: string): string {
  return href.replace(/^https?:\/\/[^/]+/, "").replace(/^\//, "").split(/[?#/]/)[0];
}
