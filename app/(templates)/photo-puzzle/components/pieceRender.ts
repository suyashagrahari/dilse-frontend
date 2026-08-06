// ─── Pure rendering primitives ───────────────────────────────────────────────
//
// No React, no state. Everything here is called either once at init (sprite
// building) or from inside the single rAF loop.
//
// THE ONE RULE: clip once, never per frame. Clipping is expensive and the whole
// reason a twelve-piece jigsaw can hold 60fps on a mid-range phone is that each
// piece is clipped exactly once, into its own small bitmap, and everything
// afterwards is a blit.

import { overhangPx, piecePathD, type Piece } from "./types";
import type { BoardLayout, PieceSprite } from "./engineContract";

/** Sits inside the cut so the piece reads as cut card rather than a decal. */
const EDGE_LIGHT = "rgba(255,255,255,0.55)";
const EDGE_DARK = "rgba(24,20,44,0.42)";

/**
 * Pre-render every piece ONCE onto its own small offscreen canvas.
 *
 * `source` must ALREADY be scaled to `layout.boardW × layout.boardH` — the
 * sprite is cut straight out of it by translating the board-space path into
 * sprite space, which is why the source cannot be at some other resolution.
 */
export function buildSprites(
  source: CanvasImageSource,
  pieces: Piece[],
  layout: BoardLayout,
  dpr: number,
): PieceSprite[] {
  const { pieceW, pieceH } = layout;
  const pad = overhangPx(pieceW, pieceH);
  const w = pieceW + pad * 2;
  const h = pieceH + pad * 2;

  return pieces.map((piece) => {
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(w * dpr);
    canvas.height = Math.ceil(h * dpr);
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.scale(dpr, dpr);
      // Sprite space: (pad, pad) is the piece's CELL origin, so tabs that run
      // to negative cell coordinates still land inside the bitmap.
      ctx.translate(pad, pad);

      const path = new Path2D(piecePathD(piece.edges, pieceW, pieceH));

      // The photograph, clipped to the cut. Drawn offset by the piece's home so
      // each sprite carries its own region of the board.
      ctx.save();
      ctx.clip(path);
      ctx.drawImage(source, -piece.homeX, -piece.homeY, layout.boardW, layout.boardH);
      ctx.restore();

      // Cardboard. A dark outer line for the cut and a light inner line for the
      // paper core, both hugging the same path.
      ctx.save();
      ctx.lineJoin = "round";
      ctx.strokeStyle = EDGE_DARK;
      ctx.lineWidth = 1.4;
      ctx.stroke(path);

      // Clipping the light stroke keeps its outer half from spilling past the
      // cut, which would show as a halo against the neighbouring piece.
      ctx.clip(path);
      ctx.strokeStyle = EDGE_LIGHT;
      ctx.lineWidth = 1.6;
      ctx.stroke(path);
      ctx.restore();
    }

    return {
      index: piece.index,
      canvas,
      // Used by the tray and the drag floater, which are DOM.
      url: canvas.toDataURL("image/png"),
      w,
      h,
      offX: -pad,
      offY: -pad,
    };
  });
}

/** Where a sprite's top-left goes, in board space, for a piece at its home. */
export const spriteHome = (piece: Piece, sprite: PieceSprite): { x: number; y: number } => ({
  x: piece.homeX + sprite.offX,
  y: piece.homeY + sprite.offY,
});

/**
 * The faint whole-image ghost under the board, so she can see what she is
 * building without it competing with the pieces already down.
 */
export function drawGhost(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  layout: BoardLayout,
  alpha = 0.08,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(source, 0, 0, layout.boardW, layout.boardH);
  ctx.restore();
}

/** Dotted outline of one cell. The hint, and the hole the sender's piece left. */
export function strokeCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  colour: string,
  dash: number[] = [5, 5],
  lineWidth = 2,
): void {
  ctx.save();
  ctx.setLineDash(dash);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = colour;
  ctx.strokeRect(x + lineWidth / 2, y + lineWidth / 2, w - lineWidth, h - lineWidth);
  ctx.restore();
}

/**
 * Blit one sprite, optionally scaled about the piece's centre (the settle
 * overshoot) and optionally with a warm glow (the just-placed pulse).
 *
 * Scaling about the CENTRE rather than the sprite origin matters: scaling about
 * the origin makes a settling piece appear to slide down-right as it shrinks.
 */
export function drawSprite(
  ctx: CanvasRenderingContext2D,
  sprite: PieceSprite,
  piece: Piece,
  layout: BoardLayout,
  opts: { scale?: number; glow?: number; alpha?: number } = {},
): void {
  const { scale = 1, glow = 0, alpha = 1 } = opts;
  const cx = piece.homeX + layout.pieceW / 2;
  const cy = piece.homeY + layout.pieceH / 2;

  ctx.save();
  if (alpha !== 1) ctx.globalAlpha = alpha;
  if (scale !== 1) {
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.translate(-cx, -cy);
  }
  if (glow > 0) {
    ctx.shadowColor = `rgba(255,214,140,${0.9 * glow})`;
    ctx.shadowBlur = 26 * glow;
  }
  ctx.drawImage(sprite.canvas, piece.homeX + sprite.offX, piece.homeY + sprite.offY, sprite.w, sprite.h);
  ctx.restore();
}
