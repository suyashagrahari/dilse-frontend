"use client";

// STUB — owned by AGENT 2 (drag / snap / tray).
//
// A horizontally scrollable strip of unplaced pieces, rotated ±DRAG.trayRotationDeg
// and overlapping — pieces scattered on a table, not filed in a drawer. Rotation
// comes from `seededSpread`, never `Math.random()`.
//
// Renders the drag floater itself (portalled to <body>).

import type { PuzzleEngineApi } from "./engineContract";

export interface PieceTrayProps {
  engine: PuzzleEngineApi;
  reducedMotion: boolean;
  /** Stable seed for the scatter. */
  seed: string;
  /** Fires on every pointerdown in the tray — the orchestrator unlocks audio. */
  onGesture: () => void;
  className?: string;
}

export default function PieceTray({ className }: PieceTrayProps) {
  return <div className={className} />;
}
