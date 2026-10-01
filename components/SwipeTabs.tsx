"use client";

// ─── Swipe between sibling tabs ──────────────────────────────────────────────
//
// Wraps the page area of a group of tabs (the bottom nav's Templates · Love
// Wall · Home · Manifesto, the admin navbar's sections) so a sideways swipe
// moves to the neighbouring tab, like flipping through a strip of cards.
// Drag left for the next tab, right for the previous one.
//
// How it stays smooth on a real page:
//  • The moment a drag is recognised, the visible page is copied into a fixed
//    "ghost" layer and the live page is hidden underneath. The finger moves
//    only the ghost: one composited layer, so no layout, no React re-render,
//    no work in the page itself during the drag.
//  • The copy is exact. Images keep the file they already decoded (no lazy
//    reload, no srcset re-pick), videos and canvases become a still of their
//    current frame, and CSS animations are frozen at the frame they were on,
//    so nothing blanks or replays when the copy appears.
//  • Attached to the ghost's edge is the incoming page's panel: the page
//    background with a soft skeleton. The finger reveals it instead of an
//    empty gap, and if the next page is still loading when the ghost is gone,
//    the panel is what you see, never a blank screen.
//  • On release past the threshold (or after a flick) the strip carries on at
//    the finger's speed and the route is pushed at once (neighbours are
//    prefetched). The real page is laid exactly under the panel, moving with
//    it, and the panel dissolves into it.
//  • Short of the threshold the ghost springs back and the live page returns
//    exactly where it was, scroll position included.
//  • Tapping one of these tabs in any nav plays the same slide.
//  • Past the last tab, `pastEnd` names a window event to hand the drag to
//    (the bottom nav uses it to pull the More drawer in under the finger).
//
// It keeps out of the way of anything that owns a sideways drag: a row or
// table that can still scroll that way, a carousel (touch-action: pan-y),
// form fields, iframes, open dialogs, the browser's edge swipe for
// back/forward, and any page that isn't one of the tabs.

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

export interface SwipeTab { href: string; label?: string }

/** Detail of the `pastEnd` event. `dx` is the finger's travel (negative), `v` px/ms. */
export type PastEndDetail =
  | { phase: "start" }
  | { phase: "move"; dx: number }
  | { phase: "end"; dx: number; v: number };

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

/** The page's own background, or the body's when the page is transparent. */
function pageBackground(el: HTMLElement) {
  for (const n of [el, document.body, document.documentElement]) {
    const cs = getComputedStyle(n);
    if (cs.backgroundImage !== "none" || !/rgba\(.*,\s*0\)|transparent/.test(cs.backgroundColor)) {
      return `${cs.backgroundImage !== "none" ? cs.backgroundImage + "," : ""}${cs.backgroundColor}`;
    }
  }
  return "#f5ede6";
}

/** Make the copy look exactly like the live page this frame. */
function freezeCopy(src: HTMLElement, copy: HTMLElement) {
  // Images: the file already on screen, decoded now, never lazily.
  const si = src.querySelectorAll("img");
  copy.querySelectorAll("img").forEach((img, i) => {
    const o = si[i];
    if (o?.currentSrc) img.src = o.currentSrc;
    img.removeAttribute("srcset");
    img.removeAttribute("sizes");
    img.loading = "eager";
    img.decoding = "sync";
  });
  // Swapped, never removed: freezeAnimations pairs elements by position.
  const stub = (n: Element, keepBox: boolean) => {
    const s = document.createElement(keepBox ? "div" : "i");
    if (keepBox) { s.className = (n as HTMLElement).className; s.style.cssText = (n as HTMLElement).style.cssText; }
    else s.style.display = "none";
    n.replaceWith(s);
  };
  copy.querySelectorAll("picture source, script").forEach((n) => stub(n, false));
  copy.querySelectorAll("iframe").forEach((n) => stub(n, true));

  // Videos and canvases: a still of the frame on screen.
  const sv = src.querySelectorAll("video");
  copy.querySelectorAll("video").forEach((v, i) => {
    const o = sv[i];
    const c = document.createElement("canvas");
    c.className = v.className;
    c.style.cssText = v.style.cssText;
    c.width = o?.videoWidth || o?.clientWidth || 1;
    c.height = o?.videoHeight || o?.clientHeight || 1;
    try { if (o) c.getContext("2d")?.drawImage(o, 0, 0, c.width, c.height); } catch { /* not ready */ }
    if (!o?.videoWidth && o?.poster) { c.style.backgroundImage = `url("${o.poster}")`; c.style.backgroundSize = "cover"; }
    v.replaceWith(c);
  });
  const sc = src.querySelectorAll("canvas");
  copy.querySelectorAll("canvas").forEach((c, i) => {
    try { c.getContext("2d")?.drawImage(sc[i], 0, 0); } catch { /* webgl / tainted */ }
  });
}

/** Once the copy is in the document: CSS animations stop where the live ones are. */
function freezeAnimations(src: HTMLElement, copy: HTMLElement) {
  const a = [src, ...src.querySelectorAll<HTMLElement>("*")];
  const b = [copy, ...copy.querySelectorAll<HTMLElement>("*")];
  if (a.length !== b.length) return;
  const index = new Map<Element, number>();
  a.forEach((n, i) => index.set(n, i));
  const done = new Set<Animation>();
  for (const anim of src.getAnimations({ subtree: true })) {
    const target = (anim.effect as KeyframeEffect | null)?.target;
    const i = target ? index.get(target) : undefined;
    if (i === undefined || !("animationName" in anim)) continue;
    const twin = b[i].getAnimations().find((x) => "animationName" in x && !done.has(x)
      && (x as CSSAnimation).animationName === (anim as CSSAnimation).animationName);
    if (!twin) continue;
    done.add(twin);
    twin.currentTime = anim.currentTime;
    twin.pause();
  }
  // Anything left restarted from frame 0 in the copy (an entrance that already
  // ran on the live page): jump it to its end.
  for (const x of copy.getAnimations({ subtree: true })) {
    if (done.has(x)) continue;
    try { x.finish(); } catch { x.pause(); }
  }
}

/** A soft stand-in for the incoming page: its background and a few blocks. */
function makePanel(bg: string, topPad: number) {
  const ph = document.createElement("div");
  ph.style.cssText = `position:absolute;top:0;bottom:0;width:100%;background:${bg};transition:opacity .22s ease;`;
  const blocks = [
    "height:168px;border-radius:24px",
    "height:14px;width:42%;border-radius:7px;margin-top:22px",
    "height:22px;width:72%;border-radius:9px;margin-top:10px",
    "height:96px;border-radius:18px;margin-top:22px",
    "height:96px;border-radius:18px;margin-top:12px",
  ];
  ph.innerHTML = `<div style="max-width:1180px;margin:0 auto;padding:${topPad}px 18px 0">${blocks
    .map((s) => `<div class="swt-sk" style="${s}"></div>`)
    .join("")}</div>`;
  return ph;
}

const xOf = (n: HTMLElement) => new DOMMatrixReadOnly(getComputedStyle(n).transform).m41;

type Ghost = { holder: HTMLElement; panel: HTMLElement };

/** The page as a fixed picture the finger can move, with the incoming panel on its side. */
function makeGhost(el: HTMLElement, topPad: number): Ghost {
  const rect = el.getBoundingClientRect();
  const W = window.innerWidth;
  const holder = document.createElement("div");
  holder.setAttribute("aria-hidden", "true");
  holder.dataset.swipeGhost = "";
  holder.style.cssText = "position:fixed;inset:0;z-index:44;pointer-events:none;will-change:transform;contain:layout style;";

  const sheet = document.createElement("div");
  sheet.style.cssText = `position:absolute;inset:0;overflow:hidden;background:${pageBackground(el)};box-shadow:0 0 44px rgba(42,10,14,0.2);`;
  const copy = el.cloneNode(true) as HTMLElement;
  copy.removeAttribute("id");
  freezeCopy(el, copy);
  copy.style.cssText += `;position:absolute;margin:0;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;transform:none;visibility:visible;opacity:1;`;
  sheet.appendChild(copy);

  const panel = makePanel(pageBackground(el), topPad);
  panel.style.left = `${W}px`;
  panel.style.display = "none";

  holder.append(panel, sheet);
  document.body.appendChild(holder);
  freezeAnimations(el, copy);
  return { holder, panel };
}

/** Put the incoming panel on the side the next page comes from (or hide it). */
function placePanel(g: Ghost, d: 1 | -1 | 0) {
  g.panel.style.display = d ? "" : "none";
  if (d) g.panel.style.left = `${d * window.innerWidth}px`;
}

type Pending = {
  href: string;
  d: 1 | -1;          // +1 = next tab (content leaves to the left)
  ghost: Ghost;
  dur: number;
  at: number;
  timer: number;
};

export default function SwipeTabs({
  tabs,
  className,
  media,
  pastEnd,
  children,
}: {
  tabs: SwipeTab[];
  className?: string;
  /** Only swipe while this media query matches, e.g. phones and tablets. */
  media?: string;
  /** Window event that takes over a drag past the last tab. */
  pastEnd?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const frameRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const pending = useRef<Pending | null>(null);
  const live = useRef({ tabs, pathname, media, pastEnd });
  useLayoutEffect(() => { live.current = { tabs, pathname, media, pastEnd }; });

  const here = tabs.findIndex((t) => t.href === pathname);

  // Warm up the neighbours so a swipe lands without waiting on the network.
  useEffect(() => {
    if (here < 0) return;
    [tabs[here - 1], tabs[here + 1]].forEach((t) => t && router.prefetch(t.href));
  }, [here, tabs, router]);

  // ── The new page arrives: lay it under the panel and dissolve into it ────
  useLayoutEffect(() => {
    const p = pending.current;
    const el = pageRef.current;
    if (!p || !el || pathname !== p.href) return;
    pending.current = null;
    window.clearTimeout(p.timer);

    const enter = () => {
      const W = window.innerWidth;
      const { holder, panel } = p.ghost;
      const gx = xOf(holder);
      const left = Math.max(p.dur - (performance.now() - p.at), 0);
      const from = gx + p.d * W; // where the panel is right now

      el.style.visibility = "";
      el.style.transform = "";
      if (left > 16 && Math.abs(from) > 1) {
        // Still travelling: page and strip finish the same move together.
        holder.getAnimations().forEach((a) => a.cancel());
        holder.style.transform = `translateX(${gx}px)`;
        holder.animate([{ transform: `translateX(${gx}px)` }, { transform: `translateX(${-p.d * W}px)` }], { duration: left, easing: OUT, fill: "forwards" });
        el.animate([{ transform: `translateX(${from}px)` }, { transform: "translateX(0)" }], { duration: left, easing: OUT });
      }
      // The panel dissolves into the real page underneath it.
      requestAnimationFrame(() => { panel.style.opacity = "0"; });
      window.setTimeout(() => holder.remove(), Math.max(left, 0) + 260);
    };

    // The route's loading skeleton can commit before the page itself (a tab
    // that wasn't prefetched yet). Dissolve into the real page, not that.
    const loading = () => [...el.children].some((c) => c.getAttribute("aria-busy") === "true");
    if (!loading()) { enter(); return; }
    const mo = new MutationObserver(() => { if (!loading()) done(); });
    const cap = window.setTimeout(() => done(), 1500);
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
    const topPad = () => {
      const pt = parseFloat(getComputedStyle(el).paddingTop) || 0;
      return Math.max(pt, 84) + 16;
    };
    const emit = (detail: PastEndDetail) => {
      const name = live.current.pastEnd;
      if (name) window.dispatchEvent(new CustomEvent(name, { detail }));
    };

    /** Send the page off and the tab at `href` in, from wherever the ghost is now. */
    const go = (href: string, d: 1 | -1, ghost: Ghost, speed: number) => {
      const W = window.innerWidth;
      const { holder } = ghost;
      placePanel(ghost, d);
      const gx = xOf(holder);
      const remaining = Math.abs(-d * W - gx);
      const dur = Math.round(Math.min(Math.max(remaining / Math.max(speed, 1.1), 240), 440));
      holder.getAnimations().forEach((a) => a.cancel());
      holder.style.transform = `translateX(${gx}px)`;
      holder.animate([{ transform: `translateX(${gx}px)` }, { transform: `translateX(${-d * W}px)` }], { duration: dur, easing: OUT, fill: "forwards" });
      el.style.visibility = "hidden";

      // If the route never arrives (offline, an error), bring the page back.
      const timer = window.setTimeout(() => {
        if (pending.current?.ghost !== ghost) return;
        pending.current = null;
        el.style.visibility = "";
        holder.remove();
      }, 6000);
      pending.current = { href, d, ghost, dur, at: performance.now(), timer };
      router.push(href);
    };

    // ── Drag ──
    let start: { x: number; y: number; target: Element | null } | null = null;
    let axis: "x" | "y" | null = null;
    let mode: "page" | "edge" = "page";
    let ghost: Ghost | null = null;
    let dx = 0;
    let samples: { x: number; t: number }[] = [];

    const resist = (x: number) => x / (1 + Math.abs(x) / 140) * 0.55;
    const velocity = (now: number) => {
      const a = samples[0];
      const b = samples[samples.length - 1];
      if (!a || !b || b.t <= a.t || now - b.t > 90) return 0;
      return (b.x - a.x) / (b.t - a.t);
    };

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
        const i = indexHere();
        if (mx < 0 && !live.current.tabs[i + 1] && live.current.pastEnd) {
          mode = "edge";
          emit({ phase: "start" });
        } else {
          mode = "page";
          ghost = makeGhost(el, topPad());
          el.style.visibility = "hidden";
        }
      }
      if (axis !== "x") return;
      if (e.cancelable) e.preventDefault();
      dx = mx;
      samples.push({ x: t.clientX, t: e.timeStamp });
      if (samples.length > 6) samples.shift();

      if (mode === "edge") { emit({ phase: "move", dx: Math.min(dx, 0) }); return; }
      if (!ghost) return;
      const d: 1 | -1 = dx < 0 ? 1 : -1;
      const target = live.current.tabs[indexHere() + d];
      placePanel(ghost, target ? d : 0);
      ghost.holder.style.transform = `translateX(${target ? dx : resist(dx)}px)`;
    };

    const onEnd = (e: TouchEvent) => {
      if (!start || axis !== "x") { start = null; return; }
      start = null;
      const v = velocity(e.timeStamp);

      if (mode === "edge") { emit({ phase: "end", dx: Math.min(dx, 0), v }); return; }
      if (!ghost) return;
      const g = ghost;
      ghost = null;

      const d: 1 | -1 = dx < 0 ? 1 : -1;
      const target = live.current.tabs[indexHere() + d];
      const W = window.innerWidth;
      const flick = Math.abs(v) > 0.45 && Math.sign(v) === Math.sign(dx) && Math.abs(dx) > 30;
      if (target && (Math.abs(dx) > W * 0.28 || flick)) {
        go(target.href, d, g, Math.abs(v));
        return;
      }

      // Spring back, then hand the live page back untouched.
      const gx = xOf(g.holder);
      g.holder.style.transform = "translateX(0)";
      g.holder.animate([{ transform: `translateX(${gx}px)` }, { transform: "translateX(0)" }], { duration: 360, easing: "cubic-bezier(0.25, 1.15, 0.4, 1)" })
        .onfinish = () => { el.style.visibility = ""; g.holder.remove(); };
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
      go(ts[to].href, to > from ? 1 : -1, makeGhost(el, topPad()), 1.5);
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
  useEffect(() => () => { pending.current?.ghost.holder.remove(); }, []);

  return (
    <div ref={frameRef} style={{ overflowX: "clip" }}>
      <style>{SWIPE_CSS}</style>
      <div ref={pageRef} className={className}>{children}</div>
    </div>
  );
}

const SWIPE_CSS = `
  .swt-sk { position: relative; overflow: hidden; background: rgba(61,12,17,0.06); }
  .swt-sk::after { content: ""; position: absolute; inset: 0; transform: translateX(-100%);
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent);
    animation: swtShimmer 1.2s ease-in-out infinite; }
  @keyframes swtShimmer { to { transform: translateX(100%); } }
`;
