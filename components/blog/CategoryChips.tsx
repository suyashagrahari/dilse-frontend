"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Category } from "@/lib/strapi";

/**
 * The blog's category rail.
 *
 * Ten categories wrapped onto two or three centred rows read as a wall of
 * equal-weight buttons — nothing looks primary and the second row looks like an
 * afterthought. This is one row instead: a horizontally scrollable rail of
 * pills, ordered by how much is actually behind each one, with the article count
 * on the chip so a reader can see where the depth is before clicking.
 *
 * - **Phone**: swipeable, scroll-snapped, scrollbar hidden, bleeding to both
 *   screen edges so a half-visible chip signals "there is more this way".
 * - **Desktop**: same rail; arrow buttons appear only when the rail actually
 *   overflows, and the fades at each end disappear when you reach it.
 *
 * Every chip stays a real `<Link>` in the server-rendered HTML, so the internal
 * linking crawlers rely on is unchanged by the scrolling — nothing here is
 * rendered on demand.
 *
 * Categories holding zero articles are dropped, because a chip that lands on
 * "No posts in this category yet" costs a reader a click and a crawler a thin
 * page — three of the nine live categories were in that state. The active category is always shown even when empty, so
 * the rail never hides the page you are standing on. Counts are optional: when
 * `articleCount` is undefined the chip renders without a badge and is never
 * treated as empty.
 */
export default function CategoryChips({
  categories,
  active,
  total,
}: {
  categories: Category[];
  active?: string;
  /** Site-wide article count, shown on the "All" chip. */
  total?: number;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  // Starts `true` on purpose. The server cannot measure a rail, so anything it
  // guesses here has to be what the client's first render also produces —
  // otherwise React hydrates with a mismatched `class` on the scroller, keeps the
  // server's copy, and the rail ends up centred *and* overflowing, which clips
  // the leading chips with no way to scroll back to them. Assuming overflow is
  // the safe guess: it is what a ten-category rail does at every width, and the
  // effect below corrects it a frame later when the list really does fit.
  const [overflow, setOverflow] = useState(true);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const visible = categories
    .filter((c) => c.articleCount === undefined || c.articleCount > 0 || c.slug === active)
    // Deepest category first: the rail's leftmost chips are the ones worth a click.
    // Ties (and count-less lists) keep alphabetical order from the API.
    .sort((a, b) => (b.articleCount ?? 0) - (a.articleCount ?? 0));

  const measure = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    const slack = el.scrollWidth - el.clientWidth;
    setOverflow(slack > 4);
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= slack - 4);
  }, []);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    measure();
    // Bring the active chip into view, but only when it is actually off-rail —
    // centring one that already fits would scroll the leading chips out of sight
    // for no reason (on /blog the active chip is "All", the very first one).
    const current = el.querySelector<HTMLElement>('[data-active="true"]');
    if (current) {
      const left = current.offsetLeft;
      const right = left + current.offsetWidth;
      const offRail = left < el.scrollLeft || right > el.scrollLeft + el.clientWidth;
      if (offRail) {
        el.scrollLeft = Math.max(0, left - el.clientWidth / 2 + current.offsetWidth / 2);
      }
    }
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  if (!categories.length) return null;

  const nudge = (dir: -1 | 1) => {
    const el = railRef.current;
    if (el) el.scrollBy({ left: dir * Math.max(200, el.clientWidth * 0.7), behavior: "smooth" });
  };

  const chip = (
    label: string,
    href: string,
    isActive: boolean,
    count: number | undefined
  ) => (
    <Link
      key={href}
      href={href}
      data-active={isActive}
      aria-current={isActive ? "page" : undefined}
      className="flex flex-shrink-0 snap-start items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.11em] transition-all duration-200 md:text-xs"
      style={{
        background: isActive ? "#3d0c11" : "rgba(255,255,255,0.72)",
        color: isActive ? "#f5ede6" : "#3d0c11",
        border: `1px solid ${isActive ? "#3d0c11" : "rgba(61,12,17,0.14)"}`,
        boxShadow: isActive
          ? "0 6px 18px rgba(61,12,17,0.22), inset 0 0 0 1px rgba(201,168,76,0.45)"
          : "0 1px 3px rgba(61,12,17,0.05)",
      }}
    >
      {label}
      {count !== undefined && (
        <span
          className="rounded-full px-1.5 py-px text-[9px] font-bold tabular-nums md:text-[10px]"
          style={{
            background: isActive ? "rgba(201,168,76,0.28)" : "rgba(61,12,17,0.07)",
            color: isActive ? "#e8cf8d" : "rgba(61,12,17,0.6)",
            letterSpacing: "0.04em",
          }}
        >
          {count}
        </span>
      )}
    </Link>
  );

  const arrow = (dir: -1 | 1, disabled: boolean) => (
    <button
      type="button"
      onClick={() => nudge(dir)}
      disabled={disabled}
      aria-label={dir === -1 ? "Scroll categories left" : "Scroll categories right"}
      className="hidden h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-opacity md:flex"
      style={{
        background: "rgba(255,255,255,0.8)",
        border: "1px solid rgba(61,12,17,0.14)",
        color: "#3d0c11",
        opacity: disabled ? 0.25 : 1,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {dir === -1 ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
    </button>
  );

  return (
    <nav aria-label="Blog categories" className="flex items-center justify-center gap-2">
      {overflow && arrow(-1, atStart)}

      {/* Rail. The -mx-5 cancels the page's px-5 gutter so the rail reaches both
          screen edges on a phone; the rail's own px-5 keeps the first chip aligned
          with the text above it. Desktop keeps the gutter and centres instead. */}
      <div className="relative -mx-5 min-w-0 flex-1 md:mx-0">
        {/* The gutter and its matching scroll-padding (see .blog-cat-rail in
            globals.css) both matter: without the scroll-padding, snap lands a chip
            flush against the screen edge, where it reads as clipped. */}
        <div
          ref={railRef}
          onScroll={measure}
          className={`blog-cat-rail flex snap-x gap-2 overflow-x-auto scroll-smooth px-5 py-1 md:px-1 ${
            // Centre the row while it fits; once it overflows, start it flush left
            // so the first chip is never clipped by the scroll origin.
            overflow ? "" : "justify-center"
          }`}
        >
          {chip("All", "/blog", !active, total)}
          {visible.map((c) =>
            chip(c.name, `/blog/category/${c.slug}`, active === c.slug, c.articleCount)
          )}
        </div>

        {/* Edge fades — pure decoration, and only while there is more to scroll. */}
        {overflow && !atStart && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-10"
            style={{ background: "linear-gradient(to right, #f5ede6 20%, rgba(245,237,230,0))" }}
          />
        )}
        {overflow && !atEnd && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-10"
            style={{ background: "linear-gradient(to left, #f5ede6 20%, rgba(245,237,230,0))" }}
          />
        )}
      </div>

      {overflow && arrow(1, atEnd)}
    </nav>
  );
}
