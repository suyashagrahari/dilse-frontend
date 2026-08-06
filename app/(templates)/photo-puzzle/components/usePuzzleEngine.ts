"use client";

// STUB — owned by AGENT 1 (canvas renderer).
//
// The single owner of: board measurement, sprite building, the ONE rAF loop,
// placed state, the settle/overshoot/glow animations, the final-piece drop and
// the completion timeline (seam fade → beat → cross-dissolve).
//
// Implement `PuzzleEngineApi` from `./engineContract` exactly. Other agents are
// already coding against it.

import { useRef } from "react";
import type { EngineOptions, PuzzleEngineApi } from "./engineContract";

const NO_PIECES: never[] = [];

export function usePuzzleEngine(opts: EngineOptions): PuzzleEngineApi {
  void opts;
  const boardWrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  return {
    phase: "loading",
    errorMessage: null,
    layout: null,
    pieces: NO_PIECES,
    sprites: NO_PIECES,
    finalIndex: -1,
    placedOrder: NO_PIECES,
    isPlaced: () => false,
    trayIndices: NO_PIECES,
    boardWrapRef,
    canvasRef,
    getBoardRect: () => null,
    place: () => {},
    releaseFinalPiece: () => {},
    highlight: () => {},
    setHintIndex: () => {},
    paused: false,
    getSnapshotDataUrl: () => null,
  };
}
