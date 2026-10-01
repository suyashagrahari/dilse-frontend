"use client";

// ─── Swipe between sibling tabs ──────────────────────────────────────────────
//
// Wraps the page area of a group of tabs (the bottom nav's Templates · Love
// Wall · Home · Manifesto, the admin navbar's sections) so a sideways swipe
// moves to the neighbouring tab, like flipping through a strip of cards.
// Drag left for the next tab, right for the previous one.
//
// How it stays smooth on a real page:
//  • The moment a drag is recognised, the visible page is cloned into a
//    fixed "ghost" layer and the live page is hidden underneath. The finger
//    moves only the ghost: one composited layer, so no layout, no React
//    re-render, no work in the page itself during the drag.
//  • Fixed bits inside the page (a top bar, a floating toast) sit inside the
//    ghost's viewport-sized box, so they travel with the page instead of
//    jumping.
//  • On release past the threshold (or after a flick) the ghost carries on at
//    the finger's speed, the route is pushed at once (neighbours are
//    prefetched), and the new page slides in glued to the ghost's edge. Both
//    run on the compositor with the same curve and timing.
//  • Short of the threshold the ghost springs back and the live page returns
//    exactly where it was, scroll position included.
//  • Tapping one of these tabs in any nav plays the same slide.
//
// It keeps out of the way of anything that owns a sideways drag: a row or
// table that scrolls sideways, a carousel (touch-action: pan-y), form fields,
// iframes, open dialogs, the browser's edge swipe for back/forward, and any
// page that isn't one of the tabs.

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

export interface SwipeTab { href: string; label?: string }

const EDGE = 22;   // px left to the browser's own back/forward swipe
const LOCK = 10;   // px of travel before the axis is decided
const OUT = "cubic-bezier(0.22, 0.8, 0.28, 1)";  // starts at finger speed, settles softly
const SKIP = "input, textarea, select, [contenteditable='true'], iframe, [role='dialog'], [data-no-swipe]";

/**
 * Something under the finger wants this sideways drag for itself: a carousel,
 * or a row that can still scroll that way. A row already at its end hands the
 * drag on to the page, the way nested scrolling works in native apps.
 */
function ownsSidewaysDrag(from: Element | null, stop: Element, dx: number) {
  for (let el = from; el && el !== stop; el = el.parentElement) {
    const cs = getComputedStyle(el);
    if (cs.touchAction === "none" || cs.touchAction.includes("pan-y")) return true;
    if ((cs.overflowX !== "auto" && cs.overflowX !== "scroll") || el.scrollWidth <= el.clientWidth + 1) continue;
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft); // RTL rows report negative offsets
    if (dx < 0 ? pos < max - 1 : pos > 1) return true;
  }
  return false;
}

/** The page as a fixed, non-interactive picture the finger can move. */
function makeGhost(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const holder = document.createElement("div");
  holder.setAttribute("aria-hidden", "true");
  holder.style.cssText =
    "position:fixed;inset:0;z-index:44;pointer-events:none;overflow:hidden;contain:strict;will-change:transform;" +
    "box-shadow:0 0 48px rgba(42,10,14,0.22);";
  const clone = el.cloneNode(true) as HTMLElement;
  clone.removeAttribute("id");
  clone.style.cssText += `;position:absolute;margin:0;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;transform:none;visibility:visible;opacity:1;`;
  // Canvases clone blank; copy their pixels. Media and frames would reload.
  const src = el.querySelectorAll("canvas");
  clone.querySelectorAll("canvas").forEach((c, i) => {
    try { c.getContext("2d")?.drawImage(src[i], 0, 0); } catch { /* webgl / tainted */ }
  });
  clone.querySelectorAll("iframe, script").forEach((n) => n.remove());
  clone.querySelectorAll("video").forEach((v) => { v.removeAttribute("autoplay"); v.pause?.(); });
  holder.appendChild(clone);
  document.body.appendChild(holder);
  return holder;
}

const xOf = (n: HTMLElement) => new DOMMatrixReadOnly(getComputedStyle(n).transform).m41;

type Pending = {
  href: string;
  d: 1 | -1;          // +1 = next tab (content leaves to the left)
  ghost: HTMLElement;
  dur: number;
  at: number;
  timer: number;
};

export default function SwipeTabs({
  tabs,
  className,
  media,
  children,
}: {
  tabs: SwipeTab[];
  className?: string;
  /** Only swipe while this media query matches, e.g. phones and tablets. */
  media?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const frameRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const pending = useRef<Pending | null>(null);
  const live = useRef({ tabs, pathname, media });
  useLayoutEffect(() => { live.current = { tabs, pathname, media }; });

  const here = tabs.findIndex((t) => t.href === pathname);

  // Warm up the neighbours so a swipe lands without waiting on the network.
  useEffect(() => {
    if (here < 0) return;
    [tabs[here - 1], tabs[here + 1]].forEach((t) => t && router.prefetch(t.href));
  }, [here, tabs, router]);

  // ── The new page arrives: slide it in glued to the departing ghost ──────
  useLayoutEffect(() => {
    const p = pending.current;
    const el = pageRef.current;
    if (!p || !el || pathname !== p.href) return;
    pending.current = null;
    window.clearTimeout(p.timer);

    const enter = () => {
      const W = window.innerWidth;
      const gx = xOf(p.ghost);
      const left = Math.max(p.dur - (performance.now() - p.at), 240);
      p.ghost.getAnimations().forEach((a) => a.cancel());
      p.ghost.style.transform = `translateX(${gx}px)`;
      p.ghost.animate([{ transform: `translateX(${gx}px)` }, { transform: `translateX(${-p.d * W}px)` }], { duration: left, easing: OUT, fill: "forwards" })
        .onfinish = () => p.ghost.remove();

      el.style.visibility = "";
      el.style.transform = "";
      // Glued to the ghost's trailing edge. If the route was slow and the
      // ghost is already (nearly) gone, still come in from a third of the way
      // out, fading up, so a late page never just pops into place.
      const glued = gx + p.d * W;
      const late = Math.abs(glued) < W * 0.32;
      const from = late ? p.d * W * 0.32 : glued;
      el.animate(
        [{ transform: `translateX(${from}px)`, opacity: late ? 0 : 1 }, { transform: "translateX(0)", opacity: 1 }],
        { duration: late ? 360 : left, easing: OUT },
      );
    };

    // The route's loading skeleton can commit before the page itself (a tab
    // that wasn't prefetched yet). Slide in the real page, not the skeleton.
    const loading = () => [...el.children].some((c) => c.getAttribute("aria-busy") === "true");
    if (!loading()) { enter(); return; }
    const mo = new MutationObserver(() => { if (!loading()) done(); });
    const cap = window.setTimeout(() => done(), 1200);
    let fired = false;
    function done() {
      if (fired) return;
      fired = true;
      mo.disconnect();
      window.clearTimeout(cap);
      enter();
    }
    mo.observe(el, { childList: true });
    return () => { if (!fired) done(); };
  }, [pathname]);

  // ── Gesture + taps ────────────────────────────────────────────────────────
  useEffect(() => {
    const frame = frameRef.current;
    const el = pageRef.current;
    if (!frame || !el) return;

    const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const allowed = () => {
      const { media: m } = live.current;
      return !m || window.matchMedia(m).matches;
    };
    const indexHere = () => live.current.tabs.findIndex((t) => t.href === live.current.pathname);

    /** Send the page off and the tab at `href` in, from wherever the ghost is now. */
    const go = (href: string, d: 1 | -1, ghost: HTMLElement, speed: number) => {
      const W = window.innerWidth;
      const gx = xOf(ghost);
      const remaining = Math.abs(-d * W - gx);
      const dur = Math.round(Math.min(Math.max(remaining / Math.max(speed, 1.1), 220), 420));
      ghost.getAnimations().forEach((a) => a.cancel());
      ghost.style.transform = `translateX(${gx}px)`;
      ghost.animate([{ transform: `translateX(${gx}px)` }, { transform: `translateX(${-d * W}px)` }], { duration: dur, easing: OUT, fill: "forwards" });
      el.style.visibility = "hidden";

      // If the route never arrives (offline, an error), bring the page back.
      const timer = window.setTimeout(() => {
        if (pending.current?.ghost !== ghost) return;
        pending.current = null;
        el.style.visibility = "";
        ghost.getAnimations().forEach((a) => a.cancel());
        ghost.remove();
      }, 5000);
      pending.current = { href, d, ghost, dur, at: performance.now(), timer };
      router.push(href);
    };

    // ── Drag ──
    let start: { x: number; y: number; target: Element | null } | null = null;
    let axis: "x" | "y" | null = null;
    let ghost: HTMLElement | null = null;
    let dx = 0;
    let samples: { x: number; t: number }[] = [];

    const resist = (x: number) => x / (1 + Math.abs(x) / 140) * 0.55;

    const onStart = (e: TouchEvent) => {
      start = null;
      if (pending.current || e.touches.length !== 1 || !allowed() || reduced()) return;
      if (indexHere() < 0) return;
      if (document.body.style.overflow === "hidden") return; // a sheet or modal is open
      const t = e.touches[0];
      if (t.clientX < EDGE || t.clientX > window.innerWidth - EDGE) return;
      const tgt = e.target as Element | null;
      if (tgt?.closest(SKIP)) return;
      start = { x: t.clientX, y: t.clientY, target: tgt };
      axis = null;
      dx = 0;
      samples = [{ x: t.clientX, t: e.timeStamp }];
    };

    const onMove = (e: TouchEvent) => {
      if (!start || e.touches.length !== 1) return;
      const t = e.touches[0];
      const mx = t.clientX - start.x;
      const my = t.clientY - start.y;
      if (!axis) {
        if (Math.abs(mx) < LOCK && Math.abs(my) < LOCK) return;
        if (Math.abs(mx) < Math.abs(my) * 1.25 || ownsSidewaysDrag(start.target, el, mx)) { axis = "y"; return; }
        axis = "x";
        ghost = makeGhost(el);
        el.style.visibility = "hidden";
      }
      if (axis !== "x" || !ghost) return;
      if (e.cancelable) e.preventDefault();
      dx = mx;
      samples.push({ x: t.clientX, t: e.timeStamp });
      if (samples.length > 6) samples.shift();
      const i = indexHere();
      const target = live.current.tabs[i + (dx < 0 ? 1 : -1)];
      ghost.style.transform = `translateX(${target ? dx : resist(dx)}px)`;
    };

    const onEnd = (e: TouchEvent) => {
      if (!start || axis !== "x" || !ghost) { start = null; return; }
      const g = ghost;
      ghost = null;
      start = null;

      // Velocity over the last few frames, px/ms, signed.
      const a = samples[0];
      const b = samples[samples.length - 1];
      const v = b && a && b.t > a.t ? (b.x - a.x) / (b.t - a.t) : 0;
      const recent = e.timeStamp - (b?.t ?? 0) < 90;

      const d: 1 | -1 = dx < 0 ? 1 : -1;
      const target = live.current.tabs[indexHere() + d];
      const W = window.innerWidth;
      const flick = recent && Math.abs(v) > 0.45 && Math.sign(v) === Math.sign(dx) && Math.abs(dx) > 30;
      if (target && (Math.abs(dx) > W * 0.28 || flick)) {
        go(target.href, d, g, Math.abs(v));
        return;
      }

      // Spring back, then hand the live page back untouched.
      const gx = xOf(g);
      g.animate([{ transform: `translateX(${gx}px)` }, { transform: "translateX(0)" }], { duration: 340, easing: "cubic-bezier(0.25, 1.2, 0.4, 1)" })
        .onfinish = () => { el.style.visibility = ""; g.remove(); };
      g.style.transform = "translateX(0)";
    };

    // ── Taps on any link to a neighbouring tab get the same slide ──
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (pending.current || !allowed() || reduced()) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank") return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.search || url.hash) return;
      const { tabs: ts, pathname: p } = live.current;
      const from = ts.findIndex((t) => t.href === p);
      const to = ts.findIndex((t) => t.href === url.pathname);
      if (from < 0 || to < 0 || from === to) return;
      e.preventDefault();
      go(ts[to].href, to > from ? 1 : -1, makeGhost(el), 1.6);
    };

    frame.addEventListener("touchstart", onStart, { passive: true });
    frame.addEventListener("touchmove", onMove, { passive: false });
    frame.addEventListener("touchend", onEnd, { passive: true });
    frame.addEventListener("touchcancel", onEnd, { passive: true });
    document.addEventListener("click", onClick, true);
    return () => {
      frame.removeEventListener("touchstart", onStart);
      frame.removeEventListener("touchmove", onMove);
      frame.removeEventListener("touchend", onEnd);
      frame.removeEventListener("touchcancel", onEnd);
      document.removeEventListener("click", onClick, true);
    };
  }, [router]);

  // Never leave a ghost behind if the wrapper unmounts mid-slide.
  useEffect(() => () => { pending.current?.ghost.remove(); }, []);

  return (
    <div ref={frameRef} style={{ overflowX: "clip" }}>
      <div ref={pageRef} className={className}>{children}</div>
    </div>
  );
}
