"use client";

// ─── The face ────────────────────────────────────────────────────────────────
//
// `faceUrl` is EMPTY in DEMO_DATA on purpose: the initial-circle fallback is the
// default path, not an error path, so it has to look deliberate. A broken image
// must never render — if the load fails we simply never hand the <img> back.
//
// Non-square photos are cover-cropped from the centre before clipping, so a
// portrait selfie is never squashed into the circle.

import { useEffect, useRef, useState } from "react";

export interface FaceState {
  /** Non-null only once the bitmap has actually decoded. */
  ref: React.MutableRefObject<HTMLImageElement | null>;
  loaded: boolean;
  failed: boolean;
}

export function useFaceImage(url: string): FaceState {
  const ref = useRef<HTMLImageElement | null>(null);
  // Keyed by url, so a change resolves synchronously on the next render rather
  // than through a reset-then-set pair of state updates.
  const [outcome, setOutcome] = useState<{ url: string; ok: boolean } | null>(null);

  useEffect(() => {
    ref.current = null;
    if (!url) return;
    let alive = true;
    const img = new Image();
    // Only for display on the game canvas — we never read pixels back from it,
    // so a tainted canvas is harmless here. The share card uses toDataUrl().
    img.decoding = "async";
    img.onload = () => {
      if (!alive) return;
      ref.current = img;
      setOutcome({ url, ok: true });
    };
    img.onerror = () => {
      if (!alive) return;
      ref.current = null;
      setOutcome({ url, ok: false });
    };
    img.src = url;
    return () => {
      alive = false;
      img.onload = null;
      img.onerror = null;
    };
  }, [url]);

  const settled = outcome !== null && outcome.url === url;
  return { ref, loaded: settled && outcome.ok, failed: !url || (settled && !outcome.ok) };
}

/**
 * Draw `img` cover-cropped from its centre into a `d x d` box whose top-left is
 * (dx, dy). Caller is responsible for the clip path. No allocation.
 */
export function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  d: number,
): void {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const scale = Math.max(d / iw, d / ih);
  const sw = d / scale;
  const sh = d / scale;
  ctx.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, dx, dy, d, d);
}
