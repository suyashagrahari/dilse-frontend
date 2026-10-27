
"use client";
// ─── <WeddingMasonry> — the guest-facing Pinterest-style gallery ─────────────
//
//   <WeddingMasonry photos={data.photos} mask="arch" frame="foil" />
//
// • JS shortest-column placement (layout.ts) — order stays left→right-ish and
//   wide/large spans work, unlike CSS columns.
// • Columns from the container's width: 2 (<600) · 3 (<1024) · 4.
// • Height reserved from each photo's stored w/h before any image loads, so no
//   layout shift; photos without w/h (older drafts) settle on load.
// • Focal point = object-position (cropX/cropY), optional zoom (scale).
// • Lazy images with a blur-up reveal over a themed placeholder wash.
// • Staggered entrance on scroll (IntersectionObserver, no React re-render);
//   prefers-reduced-motion shows everything at once.
// • Tap → <Lightbox> (swipe, keys, pinch/double-tap zoom, captions).

import { useCallback, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type MutableRefObject, type ReactNode } from "react";
import type { WeddingPhoto } from "../types";
import { cdn } from "../media";
import { DEFAULT_COLUMNS, aspectOf, columnsFor, layoutMasonry, type ColumnRule, type MasonryLayout, type MasonryTile } from "./layout";
import Lightbox from "./Lightbox";

export type MasonryMask = "rounded" | "soft" | "square" | "arch";
export type MasonryFrame = "none" | "foil" | "mat";

export interface WeddingMasonryProps {
  photos: readonly WeddingPhoto[];
  /** Gap between tiles in px. Default 10 under 600px wide, 16 above. */
  gutter?: number;
  /** Column breakpoints by container width. Default 2 / 3 / 4 at 0 / 600 / 1024. */
  columns?: readonly ColumnRule[];
  /** Tile shape. "arch" = a temple/jharokha arch on top. Default "rounded". */
  mask?: MasonryMask;
  /** Corner radius for rounded / the bottom of arches, px. Default 14. */
  radius?: number;
  /** "foil" = a hairline gold-foil border; "mat" = a paper mat around the photo. Default "none". */
  frame?: MasonryFrame;
  /** Open the lightbox on tap. Default true. */
  lightbox?: boolean;
  /** Show captions on the tiles (a soft gradient strip at the bottom). They always show in the lightbox. */
  tileCaptions?: boolean;
  /** Entrance animation on scroll. Default true (always off with reduced motion). */
  animate?: boolean;
  /** Extra content per tile (the editor's controls). Rendered above the photo. */
  renderOverlay?: (photo: WeddingPhoto, index: number, tile: MasonryTile) => ReactNode;
  /** Called instead of opening the lightbox (when given). */
  onTileClick?: (index: number) => void;
  /** Accessible name of the gallery. */
  label?: string;
  className?: string;
  style?: CSSProperties;
  /** Smoothly animate tiles to new positions when order/spans change (editor). Default false. */
  animateLayout?: boolean;
  /** Natural aspect callback (the editor stores w/h for photos that lack it). */
  onMeasured?: (index: number, w: number, h: number) => void;
  /** Receives the current layout (the editor hit-tests drags against it). */
  layoutRef?: MutableRefObject<MasonryLayout | null>;
  /** Editor drag: this tile is drawn at (x, y) in container px instead of its slot. */
  dragPos?: { index: number; x: number; y: number } | null;
  /** Editor: the selected tile gets an `is-selected` ring. */
  selectedIndex?: number | null;
}

const arch = (t: MasonryTile, r: number): CSSProperties => {
  const v = Math.min(t.w / 2, t.h / 2.4);
  return { borderRadius: `${t.w / 2}px ${t.w / 2}px ${r}px ${r}px / ${v}px ${v}px ${r}px ${r}px` };
};

export function photoImgStyle(p: WeddingPhoto): CSSProperties {
  const x = Number.isFinite(p.cropX) ? (p.cropX as number) : 50;
  const y = Number.isFinite(p.cropY) ? (p.cropY as number) : 50;
  const s = Number.isFinite(p.scale) && (p.scale as number) > 100 ? (p.scale as number) / 100 : 1;
  return {
    objectPosition: `${x}% ${y}%`,
    ...(s > 1 ? { transform: `scale(${s})`, transformOrigin: `${x}% ${y}%` } : {}),
  };
}

export default function WeddingMasonry({
  photos,
  gutter,
  columns = DEFAULT_COLUMNS,
  mask = "rounded",
  radius = 14,
  frame = "none",
  lightbox = true,
  tileCaptions = false,
  animate = true,
  renderOverlay,
  onTileClick,
  label = "Photo gallery",
  className,
  style,
  animateLayout = false,
  onMeasured,
  layoutRef,
  dragPos = null,
  selectedIndex = null,
}: WeddingMasonryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [measured, setMeasured] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState<Record<string, true>>({});
  const [open, setOpen] = useState<number | null>(null);

  // Width: measured before first paint, then followed by a ResizeObserver.
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    // The layout needs the real width before paint (no CLS).
    setWidth(el.clientWidth);
    const ro = new ResizeObserver((entries) => {
      const w = Math.round(entries[0]?.contentRect.width ?? el.clientWidth);
      setWidth((prev) => (Math.abs(prev - w) >= 1 ? w : prev));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const gap = gutter ?? (width < 600 ? 10 : 16);
  const cols = columnsFor(width, columns);
  const layout = useMemo(
    () =>
      layoutMasonry(
        photos.map((p) => ({ aspect: aspectOf(p, measured[p.url]), span: p.span })),
        width,
        cols,
        gap,
      ),
    [photos, measured, width, cols, gap],
  );

  useLayoutEffect(() => {
    if (layoutRef) layoutRef.current = layout;
  }, [layout, layoutRef]);

  // Entrance: tiles get `is-in` as they scroll into view, staggered per batch.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const tiles = Array.from(root.querySelectorAll<HTMLElement>("[data-wk-tile]:not(.is-in)"));
    const reduce = !animate || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") {
      tiles.forEach((t) => t.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        const shown = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);
        shown.forEach((e, k) => {
          const el = e.target as HTMLElement;
          el.style.setProperty("--wk-delay", `${Math.min(k, 7) * 70}ms`);
          el.classList.add("is-in");
          io.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
    );
    tiles.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [animate, photos.length, width]);

  const onLoad = useCallback(
    (i: number, url: string, img: HTMLImageElement) => {
      setLoaded((m) => (m[url] ? m : { ...m, [url]: true }));
      const p = photos[i];
      if (img.naturalWidth > 0 && img.naturalHeight > 0 && !(p?.w && p?.h)) {
        const a = img.naturalWidth / img.naturalHeight;
        setMeasured((m) => (m[url] && Math.abs(m[url] - a) < 0.001 ? m : { ...m, [url]: a }));
        onMeasured?.(i, img.naturalWidth, img.naturalHeight);
      }
    },
    [photos, onMeasured],
  );

  // Stable keys across reorders (url + occurrence), so tiles glide instead of remounting.
  const keys = useMemo(() => {
    const seen = new Map<string, number>();
    return photos.map((p) => {
      const n = seen.get(p.url) ?? 0;
      seen.set(p.url, n + 1);
      return `${p.url.length > 120 ? `${p.url.slice(0, 40)}…${p.url.slice(-60)}#${p.url.length}` : p.url}#${n}`;
    });
  }, [photos]);

  const click = (i: number) => {
    if (onTileClick) onTileClick(i);
    else if (lightbox) setOpen(i);
  };

  return (
    <div
      ref={rootRef}
      className={`wk-masonry${animateLayout ? " is-fluid" : ""}${className ? ` ${className}` : ""}`}
      style={{ height: layout.height, ...style }}
      role="list"
      aria-label={label}
    >
      {width > 0 &&
        photos.map((p, i) => {
          const t = layout.tiles[i];
          if (!t) return null;
          const shape: CSSProperties = mask === "arch" ? arch(t, radius) : { borderRadius: mask === "square" ? 2 : mask === "soft" ? radius * 1.8 : radius };
          const isLoaded = !!loaded[p.url];
          const interactive = !!onTileClick || lightbox;
          const dragging = dragPos?.index === i;
          const x = dragging ? dragPos.x : t.x;
          const y = dragging ? dragPos.y : t.y;
          const inner = (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- CDN photos of any shape; next/image cannot know their size */}
              <img
                src={cdn(p.url)}
                alt={p.caption || `Photo ${i + 1}`}
                loading={i < cols * 2 ? "eager" : "lazy"}
                decoding="async"
                draggable={false}
                className={`wk-m-img${isLoaded ? " is-loaded" : ""}`}
                style={photoImgStyle(p)}
                ref={(el) => {
                  if (el && el.complete && el.naturalWidth && !isLoaded) onLoad(i, p.url, el);
                }}
                onLoad={(e) => onLoad(i, p.url, e.currentTarget)}
              />
              {tileCaptions && p.caption ? <span className="wk-m-cap">{p.caption}</span> : null}
            </>
          );
          return (
            <div
              key={keys[i]}
              data-wk-tile=""
              role="listitem"
              data-index={i}
              className={`wk-m-tile wk-m-frame-${frame}${dragging ? " is-dragging" : ""}${selectedIndex === i ? " is-selected" : ""}`}
              style={{ width: t.w, height: t.h, transform: `translate3d(${x}px, ${y}px, 0)` }}
            >
              <div className="wk-m-inner" style={shape}>
                {interactive ? (
                  <button type="button" className="wk-m-hit" style={shape} onClick={() => click(i)} aria-label={`Open photo ${i + 1}${p.caption ? `: ${p.caption}` : ""}`}>
                    {inner}
                  </button>
                ) : (
                  <div className="wk-m-hit" style={shape}>
                    {inner}
                  </div>
                )}
              </div>
              {renderOverlay ? renderOverlay(p, i, t) : null}
            </div>
          );
        })}
      {lightbox && open !== null && <Lightbox photos={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </div>
  );
}
