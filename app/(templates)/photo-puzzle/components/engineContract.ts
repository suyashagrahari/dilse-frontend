// ─── The boundary between the canvas and everything else ─────────────────────
//
// AUTHORED BY THE LEAD. This file is the seam between two sub-agents' work and
// is therefore FROZEN for the duration of the build, exactly like `types.ts`.
// Read it, implement against it, do not edit it. If it is wrong, say so.
//
// ARCHITECTURE, in one paragraph:
//
//   The BOARD is a `<canvas>`. It draws the ghost, every placed piece, the
//   settle/glow animations, the final-piece drop and the completion sequence.
//   One rAF loop, owned by `usePuzzleEngine`.
//
//   The TRAY and the piece currently under the finger are DOM. A tray piece is
//   an <img> of a pre-rendered sprite, CSS-rotated. Dragging moves ONE absolutely
//   positioned <img> with a `transform` — which the compositor handles, so the
//   drag stays at 60fps no matter what the canvas is doing.
//
//   The handoff is `place(index)`. The drag layer runs the settle animation in
//   DOM, calls `place(index)`, and clears its floater on the frame after. From
//   that moment the canvas owns the piece and it can never be picked up again.
//
// Why not draw the dragged piece on the canvas too? Because the tray is below
// the board, so the canvas would have to cover the viewport, and a horizontally
// scrollable strip of rotated, overlapping pieces in canvas is a week of work
// that CSS does for free.

import type { Piece } from "./types";

/** Measured board geometry, in CSS pixels. Recomputed on resize/rotation. */
export interface BoardLayout {
  boardW: number;
  boardH: number;
  pieceW: number;
  pieceH: number;
  cols: number;
  rows: number;
}

/**
 * One piece, pre-rendered once at init onto its own small offscreen canvas.
 *
 * The sprite is LARGER than the piece's cell: tabs stick out, so the bitmap
 * carries `overhangPx()` of margin on every side. `offX`/`offY` are that margin
 * as a negative offset — to draw the piece at its home you blit the sprite at
 * `(homeX + offX, homeY + offY)`.
 */
export interface PieceSprite {
  index: number;
  /** Backing store is `w * dpr` × `h * dpr`; CSS size is `w` × `h`. */
  canvas: HTMLCanvasElement;
  /** A data URL of the same bitmap, so the tray and drag layer can use <img>. */
  url: string;
  /** CSS-pixel size of the sprite. */
  w: number;
  h: number;
  /** Sprite top-left relative to the piece's CELL top-left. Both ≤ 0. */
  offX: number;
  offY: number;
}

/**
 * loading    → sprites are being built, or the image has not arrived
 * error      → `imageUrl` was given and failed; render a message, not a puzzle
 * playing    → the normal state
 * waiting-final → everything but the sender's piece is down, and we are waiting
 * dropping-final → the sender released it; it is falling in
 * sealing    → all pieces down; the seams are fading out
 * dissolving → the beat has passed; cross-dissolving to `revealImageUrl`
 * complete   → the photograph is whole
 *
 * `sealing` always finishes before `dissolving` starts. That ordering is the
 * whole point of acceptance criterion 9, and it lives in the engine so that no
 * caller can accidentally overlap them.
 */
export type PuzzlePhase =
  | "loading"
  | "error"
  | "playing"
  | "waiting-final"
  | "dropping-final"
  | "sealing"
  | "dissolving"
  | "complete";

export interface EngineCallbacks {
  /**
   * A piece just landed. `ordinal` is 0-based across the whole puzzle, so it
   * indexes straight into `lineSchedule(...)` and `melodyNoteAt(melody, ordinal)`.
   * Fired exactly once per piece, from inside `place()`.
   */
  onPlaced?: (index: number, ordinal: number) => void;
  /** Every phase transition, including the initial one. */
  onPhase?: (phase: PuzzlePhase) => void;
  /**
   * The seams have finished fading and the beat of silence has elapsed. This is
   * the cue for the completion melody. Fired once.
   */
  onSealed?: () => void;
  /** The photograph is whole (after the dissolve, or straight after the beat
   *  when `revealImageUrl` is empty). Fired once. */
  onComplete?: () => void;
}

export interface EngineOptions {
  cols: number;
  rows: number;
  imageUrl: string;
  revealImageUrl: string;
  /** Stable seed — same cut on every device and after every refresh. */
  seed: string;
  finalPieceMode: "auto" | "sender-release";
  /** No tray rotation, no glow, instant snap. The mechanic still works fully. */
  reducedMotion: boolean;
  callbacks: EngineCallbacks;
}

export interface PuzzleEngineApi {
  phase: PuzzlePhase;
  /** Human-readable, safe to show. Non-null only when `phase === "error"`. */
  errorMessage: string | null;

  layout: BoardLayout | null;
  pieces: Piece[];
  sprites: PieceSprite[];
  /** Index of the piece the sender is holding back. -1 when mode is "auto". */
  finalIndex: number;

  /** Placement order, append-only. `placedOrder.length` is the progress count. */
  placedOrder: number[];
  /** O(1) membership test. Backed by a Set that is rebuilt with `placedOrder`. */
  isPlaced: (index: number) => boolean;
  /** Indices still in the tray, in stable (index) order. Excludes `finalIndex`
   *  once the puzzle reaches `waiting-final`. */
  trayIndices: number[];

  /**
   * Attach to the board's positioning wrapper — the engine measures it.
   *
   * CALLBACK REFS, not `RefObject`s, and this is not a style preference:
   * handing a ref out of a hook taints the ENTIRE returned object for the
   * `react-hooks/refs` rule, which then refuses to let `phase`, `layout` or
   * anything else on this API be read during render. The repo hit this once
   * already — see the note in `proposal/components/useProposalAudio.ts`.
   *
   * (Amended after the contract was frozen. The original shape could not be
   * consumed without lint errors in every component that touched it.)
   */
  attachBoardWrap: (el: HTMLDivElement | null) => void;
  /** Attach to the `<canvas>`. */
  attachCanvas: (el: HTMLCanvasElement | null) => void;
  /** Live board rect in *viewport* coordinates. Read during a drag; never stale
   *  across a scroll because the engine refreshes it on scroll and resize. */
  getBoardRect: () => DOMRect | null;

  /**
   * Commit a piece. Idempotent. Runs the overshoot settle + glow on the canvas,
   * fires `onPlaced`, and advances the phase when appropriate.
   * A piece can only be placed at its own home, so there is no "wrong" argument
   * to guard against — but calling it for `finalIndex` while the sender still
   * holds it is a no-op.
   */
  place: (index: number) => void;

  /** Sender released the last piece → it falls in from above and lands itself. */
  releaseFinalPiece: () => void;

  /** Brief ring on an already-placed piece. Double-tap affordance. Nothing else. */
  highlight: (index: number) => void;

  /**
   * Ghost the home cell of a piece still in the tray, so she can see where it
   * goes. Pass -1 to clear. A hint, never a bypass.
   */
  setHintIndex: (index: number) => void;

  /** True while the tab is hidden and the loop is parked. */
  paused: boolean;

  /**
   * The board canvas as a data URL — used by the share card, which cannot hold
   * a cross-origin <img> without tainting the export.
   *
   * This is only safe because every remote image is fetched through
   * `toDataUrl()` from `@/lib/exportPng` BEFORE it is handed to an `Image`, so
   * the board canvas is never tainted. Returns null before the puzzle is whole.
   */
  getSnapshotDataUrl: () => string | null;
}
