// ─── Jigsaw outlines for the memory board ────────────────────────────────────
//
// After the sliding puzzle is solved, the sender's memory photos drop onto a
// second board as real interlocking jigsaw pieces. Complementarity of adjacent
// edges is guaranteed BY CONSTRUCTION: every interior edge is a SEAM stored
// once, and the two pieces that share it both derive their outline from that
// one record.

import { rngFrom } from "@/lib/seededRandom";

export type EdgeKind = "flat" | "tab" | "blank";

/**
 * One interior boundary between two pieces, stored exactly once.
 *
 * `tabOnFirst` is read from the perspective of the piece with the lower index
 * along the seam's axis — the LEFT piece of a vertical seam, the TOP piece of a
 * horizontal one. Its neighbour necessarily takes the complement, because the
 * neighbour reads this same record and inverts it. There is no code path in
 * which the two sides are generated independently.
 */
export interface Seam {
  tabOnFirst: boolean;
  /**
   * Where along the seam the tab sits, as a fraction. Jittered ±0.06 around the
   * midpoint so the pieces do not look machine-stamped. Both sides read this
   * one number, so both agree on where the bump is.
   */
  centre: number;
}

export interface EdgeMap {
  cols: number;
  rows: number;
  /** vertical[row][col] — the seam between (col,row) and (col+1,row). */
  vertical: Seam[][];
  /** horizontal[row][col] — the seam between (col,row) and (col,row+1). */
  horizontal: Seam[][];
}

/**
 * Builds the complete seam set for a grid. Deterministic in `seed`, so the same
 * puzzle cuts the same way on every device and after every refresh.
 */
export function buildEdgeMap(cols: number, rows: number, seed: string): EdgeMap {
  const rand = rngFrom(`puzzle:${seed}:${cols}x${rows}`);
  const seam = (): Seam => ({
    tabOnFirst: rand() < 0.5,
    centre: 0.5 + (rand() - 0.5) * 0.12, // ±0.06
  });

  const vertical: Seam[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: Seam[] = [];
    for (let c = 0; c < cols - 1; c++) row.push(seam());
    vertical.push(row);
  }

  const horizontal: Seam[][] = [];
  for (let r = 0; r < rows - 1; r++) {
    const row: Seam[] = [];
    for (let c = 0; c < cols; c++) row.push(seam());
    horizontal.push(row);
  }

  return { cols, rows, vertical, horizontal };
}

export interface PieceEdges {
  top: EdgeKind;
  right: EdgeKind;
  bottom: EdgeKind;
  left: EdgeKind;
  /** Centre fraction for each edge, already expressed in that edge's own
   *  traversal direction (see `piecePathD` — the piece is traced clockwise). */
  topCentre: number;
  rightCentre: number;
  bottomCentre: number;
  leftCentre: number;
}

/**
 * Resolves one piece's four edges out of the shared seam records.
 *
 * The two reversals below are the whole trick, and they are easy to get wrong:
 *
 *  - A piece is traced CLOCKWISE (top L→R, right T→B, bottom R→L, left B→T).
 *    Its bottom and left edges therefore run against the seam's own direction,
 *    so their centre fraction becomes `1 - centre`.
 *  - `tabOnFirst` describes the left/top piece. When we are the right/bottom
 *    piece we take the complement.
 *
 * Get both right and neighbouring outlines are the same curve traced in
 * opposite directions, which is exactly what "they fit" means.
 */
export function edgesForPiece(map: EdgeMap, col: number, row: number): PieceEdges {
  const { cols, rows, vertical, horizontal } = map;

  const leftSeam = col > 0 ? vertical[row][col - 1] : null;
  const rightSeam = col < cols - 1 ? vertical[row][col] : null;
  const topSeam = row > 0 ? horizontal[row - 1][col] : null;
  const bottomSeam = row < rows - 1 ? horizontal[row][col] : null;

  return {
    // We are BELOW the top seam → complement of tabOnFirst. Traced L→R, same
    // direction the seam was defined in.
    top: topSeam ? (topSeam.tabOnFirst ? "blank" : "tab") : "flat",
    topCentre: topSeam ? topSeam.centre : 0.5,

    // We are LEFT of the right seam → tabOnFirst as-is. Traced T→B, same
    // direction as the seam.
    right: rightSeam ? (rightSeam.tabOnFirst ? "tab" : "blank") : "flat",
    rightCentre: rightSeam ? rightSeam.centre : 0.5,

    // We are ABOVE the bottom seam → tabOnFirst as-is. Traced R→L, reversed.
    bottom: bottomSeam ? (bottomSeam.tabOnFirst ? "tab" : "blank") : "flat",
    bottomCentre: bottomSeam ? 1 - bottomSeam.centre : 0.5,

    // We are RIGHT of the left seam → complement. Traced B→T, reversed.
    left: leftSeam ? (leftSeam.tabOnFirst ? "blank" : "tab") : "flat",
    leftCentre: leftSeam ? 1 - leftSeam.centre : 0.5,
  };
}

/**
 * Curve control points in edge-local space: x runs 0→1 along the edge, `o` is
 * the outward offset as a fraction of the edge length (positive = away from the
 * piece body). Symmetric about the centre, so reversing traversal direction
 * mirrors the same shape rather than producing a different one.
 *
 * Neck narrower than the head is what makes it read as cardboard rather than as
 * a bump; the undercut is the whole visual signal.
 */
const NECK_HALF = 0.075;
const HEAD_HALF = 0.13;
const O = 0.62; // scales the raw offsets below to ≈0.19 of edge length at the apex

/** Deepest control-point excursion, as a fraction of the edge length. */
export const TAB_DEPTH_FRACTION = 0.34 * O;

/**
 * Emits the piece outline as an SVG path `d` string in piece-local coordinates,
 * where (0,0) is the top-left of the piece's CELL — tabs extend outside that box
 * and the coordinates go negative. Callers draw into an offscreen canvas
 * translated by `overhangPx()` so nothing is clipped.
 */
export function piecePathD(edges: PieceEdges, w: number, h: number): string {
  const parts: string[] = [`M 0 0`];

  // dx,dy = unit vector along the edge. nx,ny = unit outward normal.
  const run = (
    kind: EdgeKind,
    centre: number,
    x0: number, y0: number,
    dx: number, dy: number,
    nx: number, ny: number,
    len: number,
  ) => {
    if (kind === "flat") {
      parts.push(`L ${fmt(x0 + dx * len)} ${fmt(y0 + dy * len)}`);
      return;
    }
    const sign = kind === "tab" ? 1 : -1;
    const P = (x: number, o: number) => {
      const oo = o * O * sign * len;
      return `${fmt(x0 + dx * x * len + nx * oo)} ${fmt(y0 + dy * x * len + ny * oo)}`;
    };
    const c = centre;
    parts.push(`L ${P(c - NECK_HALF, 0)}`);
    // out of the neck and up the left flank of the head
    parts.push(`C ${P(c - NECK_HALF - 0.03, 0.04)} ${P(c - HEAD_HALF, 0.14)} ${P(c - HEAD_HALF, 0.22)}`);
    // over the top — the two 0.34 controls are what round the head off
    parts.push(`C ${P(c - HEAD_HALF, 0.34)} ${P(c + HEAD_HALF, 0.34)} ${P(c + HEAD_HALF, 0.22)}`);
    // down the right flank and back into the neck
    parts.push(`C ${P(c + HEAD_HALF, 0.14)} ${P(c + NECK_HALF + 0.03, 0.04)} ${P(c + NECK_HALF, 0)}`);
    parts.push(`L ${fmt(x0 + dx * len)} ${fmt(y0 + dy * len)}`);
  };

  run(edges.top,    edges.topCentre,    0, 0,  1,  0,  0, -1, w); // →, outward up
  run(edges.right,  edges.rightCentre,  w, 0,  0,  1,  1,  0, h); // ↓, outward right
  run(edges.bottom, edges.bottomCentre, w, h, -1,  0,  0,  1, w); // ←, outward down
  run(edges.left,   edges.leftCentre,   0, h,  0, -1, -1,  0, h); // ↑, outward left
  parts.push("Z");
  return parts.join(" ");
}

const fmt = (n: number): string => (Math.round(n * 100) / 100).toString();

/** Margin the offscreen canvas needs on every side so tabs are not cut off. */
export const overhangPx = (w: number, h: number): number =>
  Math.ceil(TAB_DEPTH_FRACTION * Math.max(w, h)) + 2; // +2 for the stroke and shadow

