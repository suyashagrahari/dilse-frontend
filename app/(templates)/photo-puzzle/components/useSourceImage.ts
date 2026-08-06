"use client";

// STUB — owned by AGENT 1 (canvas renderer).
//
// Loads `imageUrl`, downscales it to `MAX_SOURCE_EDGE_PX` on the long edge,
// cover-crops it to the board's aspect with `coverCrop` (never distort), and
// falls back to `drawProceduralImage` when the url is empty.
//
// An empty url is NOT an error — it is the demo. A url that fails to load IS an
// error, and the caller must show a message rather than a broken puzzle.

export type SourceStatus = "loading" | "ready" | "error";

export interface SourceImage {
  /** Cover-cropped, downscaled, ready to be scaled once to the board size. */
  canvas: HTMLCanvasElement;
  w: number;
  h: number;
  /** True when this came from `drawProceduralImage` rather than a real photo. */
  procedural: boolean;
}

export function useSourceImage(
  url: string,
  targetAspect: number,
  seed: string,
): { source: SourceImage | null; status: SourceStatus } {
  void url;
  void targetAspect;
  void seed;
  return { source: null, status: "loading" };
}
