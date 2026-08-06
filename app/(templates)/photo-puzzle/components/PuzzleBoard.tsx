"use client";

// ─── The board ───────────────────────────────────────────────────────────────
//
// A positioned wrapper (measured by the engine) containing the single
// `<canvas>`, plus whatever `overlay` the orchestrator hands in.
//
// Double-tap on a placed piece → `engine.highlight(index)` and nothing else.
// There is deliberately no remove-piece feature: it would only ever be used by
// accident, and undoing a placement would mean taking back a line of the letter.

import { useCallback, useRef, type ReactNode } from "react";
import type { PuzzleEngineApi } from "./engineContract";
import { INK_SOFT, PAPER_EDGE, RADIUS_LG } from "./puzzleTheme";

export interface PuzzleBoardProps {
  engine: PuzzleEngineApi;
  reducedMotion: boolean;
  /** Absolutely positioned over the board, inside the same wrapper. */
  overlay?: ReactNode;
  className?: string;
}

const DOUBLE_TAP_MS = 320;
const DOUBLE_TAP_SLOP = 24;

export default function PuzzleBoard({ engine, overlay, className }: PuzzleBoardProps) {
  const lastTap = useRef<{ t: number; x: number; y: number } | null>(null);

  // Destructured rather than used as `engine.attachBoardWrap` inline: a member
  // expression in a `ref=` prop reads to `react-hooks/refs` as a ref access
  // during render, which then taints `engine` for every other property read in
  // this component. Plain locals are unambiguous.
  const { attachBoardWrap, attachCanvas, phase } = engine;

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const layout = engine.layout;
      const rect = engine.getBoardRect();
      if (!layout || !rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const now = performance.now();
      const prev = lastTap.current;
      lastTap.current = { t: now, x, y };

      if (
        !prev ||
        now - prev.t > DOUBLE_TAP_MS ||
        Math.hypot(x - prev.x, y - prev.y) > DOUBLE_TAP_SLOP
      ) {
        return;
      }
      lastTap.current = null;

      const col = Math.floor(x / layout.pieceW);
      const row = Math.floor(y / layout.pieceH);
      if (col < 0 || row < 0 || col >= layout.cols || row >= layout.rows) return;
      engine.highlight(row * layout.cols + col);
    },
    [engine],
  );

  return (
    <div
      ref={attachBoardWrap}
      className={className}
      onPointerDown={onPointerDown}
      style={{
        position: "relative",
        // The drag layer needs the pointer stream uninterrupted, and without
        // this every drag over the board fights the browser's scroll gesture.
        touchAction: "none",
        borderRadius: RADIUS_LG,
        overflow: "hidden",
        background: "rgba(255,255,255,0.55)",
        border: `1px solid ${PAPER_EDGE}`,
        boxShadow: "inset 0 2px 14px rgba(30,27,51,0.06)",
      }}
    >
      <canvas
        ref={attachCanvas}
        style={{ display: "block", width: "100%", touchAction: "none" }}
      />

      {phase === "loading" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            color: INK_SOFT,
            fontSize: 13,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          cutting the pieces…
        </div>
      )}

      {overlay}
    </div>
  );
}
