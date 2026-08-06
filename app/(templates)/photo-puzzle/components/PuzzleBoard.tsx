"use client";

// STUB — owned by AGENT 1 (canvas renderer).
//
// The board: a positioned wrapper (measured by the engine) containing the
// single `<canvas>`, plus whatever `overlay` the orchestrator hands in
// (the final-piece waiting message, the completion copy).
//
// `touch-action: none` on the wrapper. Double-tap on a placed piece →
// `engine.highlight(index)` and nothing else. There is no remove-piece feature.

import type { ReactNode } from "react";
import type { PuzzleEngineApi } from "./engineContract";

export interface PuzzleBoardProps {
  engine: PuzzleEngineApi;
  reducedMotion: boolean;
  /** Absolutely positioned over the board, inside the same wrapper. */
  overlay?: ReactNode;
  className?: string;
}

export default function PuzzleBoard({ engine, overlay, className }: PuzzleBoardProps) {
  return (
    <div ref={engine.boardWrapRef} className={className} style={{ position: "relative" }}>
      <canvas ref={engine.canvasRef} style={{ display: "block", width: "100%" }} />
      {overlay}
    </div>
  );
}
