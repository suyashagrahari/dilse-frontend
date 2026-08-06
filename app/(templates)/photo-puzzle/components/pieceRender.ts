// STUB — owned by AGENT 1 (canvas renderer).
//
// Pure rendering primitives: no React, no state. Everything here is called
// either once at init (sprite building) or from inside the single rAF loop.

import type { BoardLayout, PieceSprite } from "./engineContract";
import type { Piece } from "./types";

/**
 * Pre-render every piece ONCE onto its own small offscreen canvas:
 * `save()` → `clip(new Path2D(piecePathD(...)))` → `drawImage(source, …)` →
 * `restore()`, then the cardboard edge (1px inner light stroke, dark outer
 * stroke) and a soft drop shadow. Never re-clip per frame.
 *
 * `source` must ALREADY be scaled to `layout.boardW × layout.boardH`.
 */
export function buildSprites(
  source: CanvasImageSource,
  pieces: Piece[],
  layout: BoardLayout,
  dpr: number,
): PieceSprite[] {
  void source;
  void layout;
  void dpr;
  return pieces.map((p) => ({
    index: p.index,
    canvas: null as unknown as HTMLCanvasElement,
    url: "",
    w: 0,
    h: 0,
    offX: 0,
    offY: 0,
  }));
}
