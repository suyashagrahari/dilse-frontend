"use client";

// ─── Getting one usable bitmap out of whatever the sender gave us ────────────
//
// Loads `imageUrl`, downscales it to `MAX_SOURCE_EDGE_PX` on the long edge,
// cover-crops it to the board's aspect with `coverCrop` (never distort), and
// falls back to `drawProceduralImage` when the url is empty.
//
// An empty url is NOT an error — it is the demo. A url that fails to load IS an
// error, and the caller shows a message rather than a broken puzzle.
//
// Remote images go through `toDataUrl()` FIRST. That is not a convenience: an
// `<img>` from another origin taints the canvas it is drawn into, and a tainted
// board canvas makes `getSnapshotDataUrl()` throw, which would take the share
// card down with it. Inlining first is what keeps the export working.

import { useEffect, useState } from "react";
import { toDataUrl } from "@/lib/exportPng";
import { MAX_SOURCE_EDGE_PX, coverCrop } from "./types";
import { drawProceduralImage } from "./proceduralImage";

export type SourceStatus = "loading" | "ready" | "error";

export interface SourceImage {
  /** Cover-cropped, downscaled, ready to be scaled once to the board size. */
  canvas: HTMLCanvasElement;
  w: number;
  h: number;
  /** True when this came from `drawProceduralImage` rather than a real photo. */
  procedural: boolean;
}

/** Longest edge capped, aspect preserved. A 5MB phone photo will stutter mobile
 *  if it is sliced at full size. */
function fitWithin(w: number, h: number, max: number): { w: number; h: number } {
  const longest = Math.max(w, h);
  if (longest <= max) return { w, h };
  const k = max / longest;
  return { w: Math.round(w * k), h: Math.round(h * k) };
}

function loadImage(src: string, signal: { cancelled: boolean }): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Harmless on same-origin, and required for the S3 origin to be readable.
    img.crossOrigin = "anonymous";
    img.onload = () => (signal.cancelled ? reject(new Error("cancelled")) : resolve(img));
    img.onerror = () => reject(new Error("image failed to load"));
    img.src = src;
  });
}

export function useSourceImage(
  url: string,
  targetAspect: number,
  seed: string,
): { source: SourceImage | null; status: SourceStatus } {
  const [state, setState] = useState<{ source: SourceImage | null; status: SourceStatus }>({
    source: null,
    status: "loading",
  });

  useEffect(() => {
    const signal = { cancelled: false };
    // A zero or non-finite aspect would produce a zero-area crop; wait it out.
    if (!Number.isFinite(targetAspect) || targetAspect <= 0) return;

    const paint = (
      draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
      w: number,
      h: number,
      procedural: boolean,
    ) => {
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setState({ source: null, status: "error" });
        return;
      }
      draw(ctx, w, h);
      setState({ source: { canvas, w, h, procedural }, status: "ready" });
    };

    // The demo path. Painted at the board's own aspect, so there is nothing to
    // crop and nothing can be cut off.
    if (!url) {
      const w = Math.min(MAX_SOURCE_EDGE_PX, 900);
      const h = Math.round(w / targetAspect);
      paint((ctx, cw, ch) => drawProceduralImage(ctx, cw, ch, seed), w, h, true);
      return () => {
        signal.cancelled = true;
      };
    }

    setState((s) => (s.status === "loading" ? s : { source: null, status: "loading" }));

    (async () => {
      try {
        // Inline before decoding, so the canvas is never tainted.
        const inlined = url.startsWith("data:") ? url : await toDataUrl(url);
        if (signal.cancelled) return;
        const img = await loadImage(inlined || url, signal);
        if (signal.cancelled) return;

        const natural = { w: img.naturalWidth || img.width, h: img.naturalHeight || img.height };
        if (!natural.w || !natural.h) throw new Error("image has no dimensions");

        // Crop from the ORIGINAL, then scale the crop down — cropping after a
        // downscale throws away resolution we are about to want back.
        const crop = coverCrop(natural.w, natural.h, targetAspect);
        const out = fitWithin(crop.sw, crop.sh, MAX_SOURCE_EDGE_PX);

        paint(
          (ctx, cw, ch) => {
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, cw, ch);
          },
          out.w,
          out.h,
          false,
        );
      } catch {
        if (!signal.cancelled) setState({ source: null, status: "error" });
      }
    })();

    return () => {
      signal.cancelled = true;
    };
  }, [url, targetAspect, seed]);

  return state;
}
