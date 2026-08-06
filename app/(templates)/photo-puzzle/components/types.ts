// ─── Photo Puzzle — shared type contract + jigsaw geometry ───────────────────
//
// Single source of truth for the shape shared by the editor, the published
// viewer and the server payload. Field names here === server model field names
// === wire-format keys. Keep them in sync.
//
// CORE DESIGN PRINCIPLE, enforced by these types: there is no fail state and no
// time pressure. There is no `score`, no `mistakes`, no `elapsedLimit` and no
// `failed` anywhere in this file. A piece released in the wrong place is not
// wrong — it simply goes back to the tray, silently. If you find yourself
// wanting to add a counter, the design has gone wrong.
//
// The geometry below is the load-bearing part. Complementarity of adjacent
// edges is guaranteed BY CONSTRUCTION: an edge is never generated per-piece.
// Every interior edge is a SEAM, stored once, and the two pieces that share it
// both derive their outline from that one record. Two neighbours cannot
// disagree about a seam they are reading from the same object.

import { bodyFromKeys, clampNum, num, str, strList, strOr, type Raw } from "@/lib/wire";
import { rngFrom } from "@/lib/seededRandom";

export type EditMode = null | "manual" | "preview";

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
  shareUrl?: string;
}

export type FinalPieceMode = "auto" | "sender-release";

export interface PuzzleData {
  senderName: string;
  recipientName: string;
  /** The image being assembled. */
  imageUrl: string;
  /** Cross-dissolves in on completion. "" skips the reveal entirely. */
  revealImageUrl: string;
  cols: number;
  rows: number;
  /** One line revealed per placed piece, in order. */
  lines: string[];
  /** Semitone offsets from C4, one per piece. Wraps if shorter than the grid. */
  melody: number[];
  finalPieceMode: FinalPieceMode;
  /** Shown while waiting for the sender to release the last piece. */
  finalPieceMessage: string;
  closingLine: string;
}

// ─── Grid limits ─────────────────────────────────────────────────────────────

export const GRID = {
  defaultCols: 3,
  defaultRows: 4,
  minCols: 2,
  minRows: 2,
  /**
   * Hard ceiling of 16 pieces. A 24-piece jigsaw on a 380px screen is not a
   * gift, it is data entry — most people quit around 40%. If a later brief asks
   * for more pieces, the correct response is to push back, not to raise this.
   */
  maxPieces: 16,
  /**
   * A piece narrower than this cannot be picked up reliably with a thumb. The
   * board is sized so this always holds; if a grid would violate it, the grid
   * is reduced rather than the target.
   */
  minPieceShortSidePx: 70,
} as const;

/** Clamps any requested grid into something playable. */
export function normaliseGrid(cols: number, rows: number): { cols: number; rows: number } {
  let c = Math.max(GRID.minCols, Math.min(6, Math.round(cols) || GRID.defaultCols));
  let r = Math.max(GRID.minRows, Math.min(6, Math.round(rows) || GRID.defaultRows));
  // Shrink the longer axis until we are under the ceiling. Deterministic, and
  // it keeps the aspect roughly intact rather than collapsing to a strip.
  while (c * r > GRID.maxPieces) {
    if (c >= r) c -= 1;
    else r -= 1;
  }
  return { cols: c, rows: r };
}

// ─── Interaction tuning ──────────────────────────────────────────────────────

export const SNAP = {
  /**
   * A piece lands if its centre is within this fraction of a piece-width of its
   * home. Generous on purpose. Tune this UP if it ever feels fussy, never down —
   * a jigsaw that rejects a near-miss feels like it is arguing with you.
   */
  radiusFraction: 0.28,
  settleMs: 180,
  /** Slight overshoot on landing so the piece feels like it has weight. */
  overshootScale: 1.04,
  overshootMs: 140,
  glowMs: 300,
  /** Returning to the tray is silent and unhurried. It is not a rejection. */
  returnMs: 260,
} as const;

export const DRAG = {
  liftScale: 1.08,
  liftMs: 120,
  /** Tray pieces are scattered, not filed. Seeded so the layout is stable. */
  trayRotationDeg: 5,
} as const;

export const FINAL_PIECE = {
  /** Fall-in when the sender releases it. Accelerating — it drops, not floats. */
  dropMs: 600,
  dropFromPx: 260,
  pulseMs: 1600,
  /**
   * Nobody is left holding an incomplete gift because the sender fell asleep.
   * After this long the recipient gets a quiet self-serve link.
   */
  safetyValveMs: 10 * 60 * 1000,
  safetyValveCopy: "he's probably asleep — finish it yourself",
} as const;

export const COMPLETION = {
  seamFadeMs: 700,
  /** A beat of silence after the seams go, before the reveal. Earned pause. */
  beatMs: 320,
  crossDissolveMs: 1200,
} as const;

/** Source images are downscaled to this on the long edge before slicing. */
export const MAX_SOURCE_EDGE_PX = 1200;

// ─── Jigsaw geometry ─────────────────────────────────────────────────────────

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

export interface Piece {
  index: number;
  col: number;
  row: number;
  edges: PieceEdges;
  /** Home position of the piece's cell, in board coordinates. */
  homeX: number;
  homeY: number;
}

export function buildPieces(map: EdgeMap, boardW: number, boardH: number): Piece[] {
  const w = boardW / map.cols;
  const h = boardH / map.rows;
  const out: Piece[] = [];
  for (let row = 0; row < map.rows; row++) {
    for (let col = 0; col < map.cols; col++) {
      out.push({
        index: row * map.cols + col,
        col,
        row,
        edges: edgesForPiece(map, col, row),
        homeX: col * w,
        homeY: row * h,
      });
    }
  }
  return out;
}

/**
 * Which piece the sender holds back.
 *
 * An interior piece, so the hole sits in the middle of the photograph where it
 * is impossible to ignore — a missing corner just looks like a crop. Falls back
 * to the last piece on grids with no interior (2×2, 2×n).
 */
export function finalPieceIndex(map: EdgeMap, seed: string): number {
  const interior: number[] = [];
  for (let row = 1; row < map.rows - 1; row++) {
    for (let col = 1; col < map.cols - 1; col++) interior.push(row * map.cols + col);
  }
  const pool = interior.length ? interior : [map.cols * map.rows - 1];
  const rand = rngFrom(`final:${seed}`);
  return pool[Math.floor(rand() * pool.length) % pool.length];
}

// ─── Reward pacing ───────────────────────────────────────────────────────────

/**
 * Which letter line each placement reveals.
 *
 * Fewer lines than pieces is normal and must not error — the lines are spread
 * across the placements so the letter finishes exactly when the puzzle does,
 * rather than running out at piece six and leaving the rest unpaid.
 * Returns one entry per placement; -1 means "no new line this time".
 */
export function lineSchedule(lineCount: number, pieceCount: number): number[] {
  if (lineCount <= 0 || pieceCount <= 0) return new Array(Math.max(0, pieceCount)).fill(-1);
  const out: number[] = [];
  let next = 0;
  for (let i = 0; i < pieceCount; i++) {
    // Ideal number of lines that should have landed after i+1 placements.
    const target = Math.ceil(((i + 1) * lineCount) / pieceCount);
    out.push(next < target && next < lineCount ? next++ : -1);
  }
  // Anything left over (possible only through rounding) lands on the last piece.
  if (next < lineCount) out[out.length - 1] = lineCount - 1;
  return out;
}

/** C4-rooted. `melody` wraps, so a short melody simply repeats. */
export const noteFreq = (semitone: number): number => 261.63 * Math.pow(2, semitone / 12);

export const melodyNoteAt = (melody: number[], placement: number): number =>
  melody.length ? melody[placement % melody.length] : 0;

// ─── Cover crop ──────────────────────────────────────────────────────────────

/**
 * Source rectangle for a centred cover-crop to the grid's aspect. Never
 * distorts — an extreme panorama loses its edges rather than being squashed.
 */
export function coverCrop(
  srcW: number, srcH: number, targetAspect: number,
): { sx: number; sy: number; sw: number; sh: number } {
  const srcAspect = srcW / srcH;
  if (srcAspect > targetAspect) {
    const sw = srcH * targetAspect;
    return { sx: (srcW - sw) / 2, sy: 0, sw, sh: srcH };
  }
  const sh = srcW / targetAspect;
  return { sx: 0, sy: (srcH - sh) / 2, sw: srcW, sh };
}

// ─── Component contract ──────────────────────────────────────────────────────

export interface PhotoPuzzleTemplateProps {
  data: PuzzleData;
  mode: "demo" | "live";
  shareId?: string;
  hasPassword?: boolean;
}

// ─── Demo data ───────────────────────────────────────────────────────────────

export const DEMO_DATA: PuzzleData = {
  senderName: "Rohan",
  recipientName: "Ananya",
  imageUrl: "",
  revealImageUrl: "",
  cols: 3,
  rows: 4,
  lines: [
    "I have been trying to write this for about a week.",
    "Every version started with a joke, because that's easier.",
    "So here is the version without one.",
    "You are the first person I want to tell things to.",
    "Good things, bad things, the extremely boring middle ones.",
    "You laugh at my jokes about half a second before the punchline.",
    "You have never once made me feel like I was too much.",
    "I notice. I notice all of it.",
    "I know I'm not good at saying this out loud.",
    "That's why it took twelve pieces.",
    "I'm keeping the last one.",
    "Ask me for it.",
  ],
  // A gentle rising phrase — C D E G A C' B G, then a resolve.
  melody: [0, 2, 4, 7, 9, 12, 11, 7, 9, 12, 14, 12],
  finalPieceMode: "sender-release",
  finalPieceMessage: "I have the last piece. Ask me for it.",
  closingLine: "There. That's the whole thing.",
};

// ─── Wire format ─────────────────────────────────────────────────────────────

export const PUZZLE_CONTENT_KEYS: (keyof PuzzleData)[] = [
  "senderName", "recipientName", "imageUrl", "revealImageUrl", "cols", "rows",
  "lines", "melody", "finalPieceMode", "finalPieceMessage", "closingLine",
];

export function puzzleDataToBody(data: PuzzleData, password?: string): Record<string, unknown> {
  return bodyFromKeys(data, PUZZLE_CONTENT_KEYS, password);
}

export function dbToPuzzleData(db: Raw | null | undefined): PuzzleData {
  const src = db ?? {};
  const grid = normaliseGrid(
    num(src.cols, DEMO_DATA.cols),
    num(src.rows, DEMO_DATA.rows),
  );
  const rawMelody = Array.isArray(src.melody) ? src.melody : DEMO_DATA.melody;
  return {
    senderName: str(src.senderName, DEMO_DATA.senderName),
    recipientName: str(src.recipientName, DEMO_DATA.recipientName),
    imageUrl: strOr(src.imageUrl, ""),
    revealImageUrl: strOr(src.revealImageUrl, ""),
    cols: grid.cols,
    rows: grid.rows,
    lines: strList(src.lines, DEMO_DATA.lines).slice(0, GRID.maxPieces),
    melody: rawMelody
      .slice(0, GRID.maxPieces)
      .map((v) => clampNum(v, 0, -24, 24)),
    finalPieceMode: src.finalPieceMode === "auto" ? "auto" : "sender-release",
    finalPieceMessage: str(src.finalPieceMessage, DEMO_DATA.finalPieceMessage),
    closingLine: str(src.closingLine, DEMO_DATA.closingLine),
  };
}
