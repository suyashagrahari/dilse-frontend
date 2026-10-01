"use client";

// ─── Swipe between admin sections ────────────────────────────────────────────
//
// On a phone or tablet, a sideways swipe on a section's page moves to the
// neighbouring navbar tab: drag left for the next one (Analytics → Users →
// Contacts …), drag right for the previous one. The page follows the finger,
// a pill at the edge names where you are headed, and letting go past the
// threshold slides the page out and the next one in from the same side.
// Short of the threshold it springs back. Tapping a tab plays the same
// directional slide, so both ways of moving feel like one strip of pages.
//
// The gesture stays out of the way of everything that owns a sideways drag:
// a table or chip row that can still scroll that way, form fields, iframes,
// open dialogs, the browser's own edge-swipe for back/forward, and detail
// pages (/admin/users/:id), which aren't a tab of their own.
//
// The transform is cleared the moment an animation ends. Any transform on
// this wrapper would make it the containing block for the pages' fixed
// footers and modals.

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAdminTabs, type AdminTab } from "./AdminNav";

const EDGE = 24;        // px left to the browser's own back/forward swipe
const LOCK = 12;        // px of travel before we decide the axis
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const SKIP = "input, textarea, select, [contenteditable='true'], iframe, [role='dialog'], [data-no-swipe]";

/** Index of the section a path belongs to, detail pages included. */
function sectionOf(tabs: AdminTab[], path: string) {
  return tabs.findIndex((t) => path === t.href || path.startsWith(t.href + "/"));
}

/** True when something under the finger can still scroll in this direction. */
function innerScrollerWants(from: Element | null, stop: Element, dx: number) {
  for (let el = from; el && el !== stop; el = el.parentElement) {
    if (el.scrollWidth <= el.clientWidth + 1) continue;
    const ox = getComputedStyle(el).overflowX;
    if (ox !== "auto" && ox !== "scroll") continue;
    // Finger moving left scrolls content right, and vice versa.
    if (dx < 0 && el.scrollLeft + el.clientWidth < el.scrollWidth - 1) return true;
    if (dx > 0 && el.scrollLeft > 1) return true;
  }
  return false;
}

export default function AdminSwipe({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const tabs = useAdminTabs();
  const wrapRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const [hint, setHint] = useState<{ dir: 1 | -1; tab: AdminTab } | null>(null);

  // The latest values, readable from the native listeners without re-binding.
  const live = useRef({ tabs, pathname });
  useLayoutEffect(() => { live.current = { tabs, pathname }; });

  // Neighbours of the current tab, warmed up so a swipe lands instantly.
  const here = tabs.findIndex((t) => t.href === pathname);
  useEffect(() => {
    if (here < 0) return;
    [tabs[here - 1], tabs[here + 1]].forEach((t) => t && router.prefetch(t.href));
  }, [here, tabs, router]);

  // ── Slide the new page in from the side it came from ─────────────────────
  const prevPath = useRef(pathname);
  const swipedDir = useRef<1 | -1 | 0>(0);
  const busy = useRef(false);
  useLayoutEffect(() => {
    const from = prevPath.current;
    if (from === pathname) return;
    prevPath.current = pathname;
    busy.current = false;
    const el = wrapRef.current;
    if (!el) return;
    el.getAnimations().forEach((a) => a.cancel());
    el.style.transform = "";
    el.style.opacity = "";

    const a = sectionOf(tabs, from);
    const b = sectionOf(tabs, pathname);
    const dir = swipedDir.current || (a >= 0 && b >= 0 && a !== b ? Math.sign(b - a) : 0);
    swipedDir.current = 0;
    if (!dir || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const shift = Math.min(window.innerWidth * 0.35, 220) * dir;
    el.animate(
      [{ transform: `translateX(${shift}px)`, opacity: 0 }, { transform: "translateX(0)", opacity: 1 }],
      { duration: 420, easing: EASE },
    );
  }, [pathname, tabs]);

  // ── The gesture ───────────────────────────────────────────────────────────
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    let start: { x: number; y: number; t: number; target: Element | null } | null = null;
    let axis: "x" | "y" | null = null;
    let dx = 0;
    let target: AdminTab | null = null;
    let dir: 1 | -1 = 1;
    let lastHintKey = "";

    const width = () => el.clientWidth || window.innerWidth;
    const threshold = () => Math.max(72, width() * 0.24);

    const paint = () => {
      // With nowhere to go the page only gives a little, like a rubber band.
      const shown = target ? dx : dx * 0.22;
      el.style.transform = `translateX(${shown}px)`;
      el.style.opacity = String(1 - Math.min(Math.abs(shown) / width(), 1) * 0.35);
      const h = hintRef.current;
      if (h && target) {
        const p = Math.min(Math.abs(dx) / threshold(), 1);
        h.style.opacity = String(p);
        h.style.transform = `translateY(-50%) translateX(${(1 - p) * 24 * -dir}px) scale(${0.9 + p * 0.1})`;
        h.dataset.ready = p >= 1 ? "1" : "0";
      }
    };

    const reset = () => {
      start = null; axis = null; dx = 0; target = null;
      if (hintRef.current) hintRef.current.style.opacity = "0";
    };

    const springBack = () => {
      const from = el.style.transform;
      const op = el.style.opacity;
      el.style.transform = "";
      el.style.opacity = "";
      if (from) el.animate([{ transform: from, opacity: op || 1 }, { transform: "translateX(0)", opacity: 1 }], { duration: 320, easing: EASE });
      setHint(null);
      lastHintKey = "";
    };

    const onStart = (e: TouchEvent) => {
      if (busy.current || e.touches.length !== 1) return;
      const { tabs: ts, pathname: p } = live.current;
      if (ts.findIndex((t) => t.href === p) < 0) return; // detail page
      const t = e.touches[0];
      if (t.clientX < EDGE || t.clientX > window.innerWidth - EDGE) return;
      const tgt = e.target as Element | null;
      if (tgt?.closest(SKIP)) return;
      start = { x: t.clientX, y: t.clientY, t: performance.now(), target: tgt };
      axis = null;
      dx = 0;
    };

    const onMove = (e: TouchEvent) => {
      if (!start || e.touches.length !== 1) return;
      const t = e.touches[0];
      const mx = t.clientX - start.x;
      const my = t.clientY - start.y;
      if (!axis) {
        if (Math.abs(mx) < LOCK && Math.abs(my) < LOCK) return;
        if (Math.abs(mx) < Math.abs(my) * 1.3 || innerScrollerWants(start.target, el, mx)) {
          axis = "y";
          return;
        }
        axis = "x";
        el.getAnimations().forEach((a) => a.cancel());
      }
      if (axis !== "x") return;
      if (e.cancelable) e.preventDefault(); // keep the page from scrolling under the drag
      dx = mx;
      dir = dx < 0 ? 1 : -1;
      const { tabs: ts, pathname: p } = live.current;
      target = ts[ts.findIndex((x) => x.href === p) + dir] ?? null;
      const key = target ? `${dir}${target.href}` : "";
      if (key !== lastHintKey) {
        lastHintKey = key;
        setHint(target ? { dir, tab: target } : null);
      }
      paint();
    };

    const onEnd = () => {
      if (!start || axis !== "x") { reset(); return; }
      const speed = Math.abs(dx) / Math.max(performance.now() - start.t, 1);
      const go = target && (Math.abs(dx) >= threshold() || (speed > 0.55 && Math.abs(dx) > 40));
      if (!go || !target) { springBack(); reset(); return; }

      const next = target;
      const d = dir;
      busy.current = true;
      const out = el.animate(
        [
          { transform: el.style.transform, opacity: el.style.opacity || 1 },
          { transform: `translateX(${-d * width()}px)`, opacity: 0.2 },
        ],
        { duration: 200, easing: "cubic-bezier(0.4, 0, 1, 1)", fill: "forwards" },
      );
      el.style.transform = "";
      el.style.opacity = "";
      reset();
      out.onfinish = () => {
        swipedDir.current = d;
        router.push(next.href);
        // If the route never changes (offline, an error), don't leave a blank page.
        window.setTimeout(() => {
          if (live.current.pathname !== next.href) {
            busy.current = false;
            swipedDir.current = 0;
            out.cancel();
          }
          setHint(null);
          lastHintKey = "";
        }, 4000);
      };
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd, { passive: true });
    el.addEventListener("touchcancel", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, [router]);

  const HintIcon = hint?.tab.Icon;
  return (
    <>
      <style>{SWIPE_CSS}</style>
      <div ref={wrapRef} className="adm-main adm-swipe">{children}</div>
      <div ref={hintRef} className="adm-swipe-hint" data-side={hint?.dir === 1 ? "right" : "left"} aria-hidden>
        {hint && HintIcon && (
          <>
            {hint.dir === -1 && <ChevronLeft size={15} className="adm-swipe-chev" />}
            <HintIcon size={14} />
            <span>{hint.tab.label}</span>
            {hint.dir === 1 && <ChevronRight size={15} className="adm-swipe-chev" />}
          </>
        )}
      </div>
    </>
  );
}

const SWIPE_CSS = `
  .adm-swipe { overflow-x: clip; }
  .adm-swipe-hint { position: fixed; top: 50%; z-index: 60; display: flex; align-items: center; gap: 6px;
    height: 40px; padding: 0 14px; border-radius: 999px; pointer-events: none; opacity: 0;
    font-size: 12.5px; font-weight: 800; color: #3d0c11; white-space: nowrap;
    background: rgba(255, 250, 244, 0.94); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(201,168,76,0.45); box-shadow: 0 12px 28px -14px rgba(61,12,17,0.55);
    transform: translateY(-50%); transition: background .2s, color .2s, border-color .2s; }
  .adm-swipe-hint[data-side="right"] { right: 12px; }
  .adm-swipe-hint[data-side="left"] { left: 12px; }
  .adm-swipe-hint[data-ready="1"] { background: linear-gradient(135deg, #5a1520, #3d0c11); color: #fff6e6; border-color: #c9a84c; }
  .adm-swipe-chev { color: #c9a84c; }
`;
