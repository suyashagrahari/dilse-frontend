// ─── Masonry layout: shortest-column placement (pure, no DOM) ────────────────
//
// Pinterest's algorithm: walk the photos in order and drop each one into the
// column whose bottom is highest up (shortest), so reading order stays roughly
// left-to-right, top-to-bottom and the columns end level. A two-column span
// takes the adjacent PAIR whose taller bottom is highest (ties → leftmost),
// trading a small gap under the shorter of the two for order.
//
// Heights come from each photo's natural aspect (stored w/h, measured, or a
// 4:5 guess), clamped so a panorama or a screenshot cannot become a sliver or a
// tower, then ×1.5 for "tall" / "large".

import type { PhotoSpan } from "../types";

export interface MasonryInput {
  /** width / height of the photo itself. */
  aspect: number;
  span?: PhotoSpan;
}

export interface MasonryTile {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Columns this tile actually spans (1 or 2). */
  cols: number;
  /** The column it starts in. */
  col: number;
}

export interface MasonryLayout {
  tiles: MasonryTile[];
  height: number;
  columns: number;
  columnWidth: number;
}

export const MIN_ASPECT = 0.5; // 1:2 portrait at most
export const MAX_ASPECT = 2.2; // ~2.2:1 landscape at most
export const DEFAULT_ASPECT = 4 / 5;
export const TALL_FACTOR = 1.5;
export const MAX_WIDE_RATIO = 1.35;
export const MAX_SINGLE_RATIO = 2.1;

/** Container-width breakpoints (≈ the viewport on a full-width page): 2 · 3 · 4. */
export interface ColumnRule {
  /** Minimum container width for this column count. */
  min: number;
  columns: number;
}
export const DEFAULT_COLUMNS: readonly ColumnRule[] = [
  { min: 0, columns: 2 },
  { min: 600, columns: 3 },
  { min: 1024, columns: 4 },
];

export function columnsFor(width: number, rules: readonly ColumnRule[] = DEFAULT_COLUMNS): number {
  let c = rules[0]?.columns ?? 2;
  for (const r of rules) if (width >= r.min) c = r.columns;
  return Math.max(1, c);
}

export const clampAspect = (a: number): number =>
  Number.isFinite(a) && a > 0 ? Math.min(MAX_ASPECT, Math.max(MIN_ASPECT, a)) : DEFAULT_ASPECT;

export const spanCols = (span: PhotoSpan | undefined): number => (span === "wide" || span === "large" ? 2 : 1);
export const spanTall = (span: PhotoSpan | undefined): boolean => span === "tall" || span === "large";

export function layoutMasonry(items: readonly MasonryInput[], width: number, columns: number, gutter: number): MasonryLayout {
  const cols = Math.max(1, Math.floor(columns));
  const gap = Math.max(0, gutter);
  const colW = cols > 0 && width > 0 ? (width - gap * (cols - 1)) / cols : 0;
  const bottoms = new Array<number>(cols).fill(0);
  const tiles: MasonryTile[] = new Array(items.length);

  const size = (it: MasonryInput) => {
    const want = Math.min(spanCols(it.span), cols);
    const w = want * colW + (want - 1) * gap;
    // A span never becomes a tower: wide tiles stay ≤ 1.35× as tall as they are wide, single ones ≤ 2.1×.
    const h = Math.min((w / clampAspect(it.aspect)) * (spanTall(it.span) ? TALL_FACTOR : 1), w * (want > 1 ? MAX_WIDE_RATIO : MAX_SINGLE_RATIO));
    return { want, w, h };
  };
  /** Best start column for a span: the lowest resting point (ties → leftmost), and the gap it would leave. */
  const slot = (want: number) => {
    let col = 0;
    let y = Infinity;
    for (let c = 0; c + want <= cols; c++) {
      let top = 0;
      for (let k = c; k < c + want; k++) top = Math.max(top, bottoms[k]);
      if (top < y - 0.5) {
        y = top;
        col = c;
      }
    }
    let waste = 0;
    for (let k = col; k < col + want; k++) waste += y - bottoms[k];
    return { col, y: y === Infinity ? 0 : y, waste };
  };
  const place = (i: number) => {
    const { want, w, h } = size(items[i]);
    const { col, y } = slot(want);
    for (let k = col; k < col + want; k++) bottoms[k] = y + h + gap;
    tiles[i] = { x: col * (colW + gap), y, w, h, cols: want, col };
  };

  // Walk in order. When a two-column tile would leave a hole under its shorter
  // column, first drop up to two of the NEXT single photos into that hole —
  // reading order bends by at most two places, the wall stays tight.
  const done = new Array<boolean>(items.length).fill(false);
  for (let i = 0; i < items.length; i++) {
    if (done[i]) continue;
    const { want } = size(items[i]);
    if (want > 1) {
      for (let look = 0; look < 2; look++) {
        const { waste } = slot(want);
        if (waste <= colW * 0.3) break;
        const j = items.findIndex((it, k) => k > i && k <= i + 3 && !done[k] && size(it).want === 1);
        if (j < 0) break;
        place(j);
        done[j] = true;
      }
    }
    place(i);
    done[i] = true;
  }

  const height = items.length ? Math.max(...bottoms) - gap : 0;
  return { tiles, height: Math.max(0, height), columns: cols, columnWidth: colW };
}

/** The aspect to lay a photo out with: measured beats stored beats the guess. */
export function aspectOf(p: { w?: number; h?: number }, measured?: number): number {
  if (measured && Number.isFinite(measured) && measured > 0) return measured;
  if (p.w && p.h && p.w > 0 && p.h > 0) return p.w / p.h;
  return DEFAULT_ASPECT;
}
