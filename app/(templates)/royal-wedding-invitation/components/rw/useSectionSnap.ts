"use client";

// ─── Section-by-section scrolling ────────────────────────────────────────────
// Once the guest stops scrolling, the page glides to fill the screen with one
// section: forward to the next section when it has come into view by the
// guest's scroll, back to the current one otherwise. A section taller than the
// screen (the story, the gallery, the RSVP) is read freely: nothing moves
// while the screen is fully inside it, and its end aligns with the bottom of
// the screen on the way back up. CSS scroll-snap was tried first: with
// sections taller than the screen it pulled a single mouse-wheel step back to
// where it started, so a guest could get stuck. Off for reduced motion.

import { useEffect } from "react";

const SETTLE_MS = 140;
/** How much of the next section must show before a release carries the guest to it. */
const PULL = 0.12;

export default function useSectionSnap(enabled: boolean, selector: string) {
  useEffect(() => {
    if (!enabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    let lastY = window.scrollY;
    let gliding = false;
    let glideTimer = 0;
    let target = -1;
    let touching = false;

    const sections = () =>
      Array.from(document.querySelectorAll<HTMLElement>(selector))
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { top: Math.round(r.top + window.scrollY), bottom: Math.round(r.bottom + window.scrollY) };
        })
        .filter((s) => s.bottom > s.top)
        .sort((a, b) => a.top - b.top);

    const glide = (to: number) => {
      const y = window.scrollY;
      if (Math.abs(to - y) < 3) return;
      gliding = true;
      target = to;
      window.scrollTo({ top: to, behavior: "smooth" });
      // A safety net in case no scroll event follows; normally onScroll ends the glide.
      window.clearTimeout(glideTimer);
      glideTimer = window.setTimeout(() => {
        gliding = false;
        lastY = window.scrollY;
      }, 1200);
    };

    const settle = () => {
      if (gliding || touching) return;
      const y = window.scrollY;
      const vh = window.innerHeight;
      const dir = Math.sign(y - lastY);
      lastY = y;
      const list = sections();
      const i = list.findIndex((s) => y >= s.top - 2 && y < s.bottom - 2);
      if (i < 0) return;
      const cur = list[i];
      const next = list[i + 1];
      const tall = cur.bottom - cur.top > vh + 4;
      // Reading inside a tall section: leave the guest where they are.
      if (tall && y >= cur.top && y + vh <= cur.bottom) return;
      if (!next) return glide(Math.max(cur.top, cur.bottom - vh));
      const shownNext = y + vh - next.top;
      const shownCur = cur.bottom - y;
      if (dir > 0) return glide(shownNext > vh * PULL ? next.top : tall ? cur.bottom - vh : cur.top);
      if (dir < 0) return glide(shownCur > vh * PULL ? (tall ? cur.bottom - vh : cur.top) : next.top);
      // No direction (a resize): go to whichever fills more of the screen.
      glide(shownNext > shownCur ? next.top : tall ? cur.bottom - vh : cur.top);
    };

    const onScroll = () => {
      // A glide ends when the page stops moving (on arrival, or if content shifted under it).
      if (gliding) {
        window.clearTimeout(glideTimer);
        glideTimer = window.setTimeout(() => {
          gliding = false;
          lastY = window.scrollY;
        }, Math.abs(window.scrollY - target) < 2 ? 40 : 120);
        return;
      }
      window.clearTimeout(timer);
      timer = window.setTimeout(settle, SETTLE_MS);
    };
    const onTouchStart = () => {
      touching = true;
    };
    const onTouchEnd = () => {
      touching = false;
      onScroll();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(glideTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [enabled, selector]);
}
