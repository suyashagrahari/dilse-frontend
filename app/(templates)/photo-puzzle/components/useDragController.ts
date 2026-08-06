"use client";

// STUB — owned by AGENT 2 (drag / snap / tray).
//
// Pointer Events only. One pointer at a time. The dragged piece is a single
// absolutely-positioned element portalled to <body>, moved with `transform`, so
// the drag never touches the canvas and never triggers layout.
//
// Snap: centre within `SNAP.radiusFraction` of a piece-width of home → settle
// with `SNAP.overshootScale` over `SNAP.settleMs`, then `engine.place(index)`.
// Anywhere else → glide back to the tray over `SNAP.returnMs`, in SILENCE.

import type { PuzzleEngineApi } from "./engineContract";

export interface DragState {
  /** Index under the finger, or -1. */
  index: number;
  /** Viewport-space top-left of the floating sprite. */
  x: number;
  y: number;
  scale: number;
  /** "returning" and "settling" are post-release animations. */
  mode: "idle" | "lifting" | "dragging" | "settling" | "returning";
}

export interface DragControllerApi {
  state: DragState;
  beginDrag: (e: React.PointerEvent, index: number) => void;
  /** Index whose home cell should be ghosted as a hint, or -1. */
  hintIndex: number;
}

export function useDragController(
  engine: PuzzleEngineApi,
  opts: { reducedMotion: boolean; onLift?: (index: number) => void; onGesture?: () => void },
): DragControllerApi {
  void engine;
  void opts;
  return {
    state: { index: -1, x: 0, y: 0, scale: 1, mode: "idle" },
    beginDrag: () => {},
    hintIndex: -1,
  };
}
