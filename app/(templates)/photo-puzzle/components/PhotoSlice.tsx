"use client";

// ─── Cutting one photo into pixel-exact tiles ────────────────────────────────
//
// Every tile renders the WHOLE framed photo at the board's full size (S×S) and
// offsets it by its own home cell, inside a box that clips to the cell. The
// board size is always a whole multiple of N, so every offset is an integer
// number of pixels and neighbouring tiles meet with no seam at any size. The
// framing (focal point + zoom) is the same `cropStyle` the editor previews.

import { useEffect, useState, type CSSProperties } from "react";

import { cropStyle } from "../../dedication/components/types";
import { V } from "../../_love/theme";

export interface PhotoCrop {
  x: number;
  y: number;
  scale: number;
}

/** Tracks whether `src` loads, so a dead link falls back to a drawn picture. */
export function useImageOk(src: string): boolean {
  const [state, setState] = useState<{ src: string; ok: boolean }>({ src, ok: true });
  useEffect(() => {
    if (!src) return;
    let alive = true;
    const img = new Image();
    img.onload = () => alive && setState({ src, ok: true });
    img.onerror = () => alive && setState({ src, ok: false });
    img.src = src;
    return () => {
      alive = false;
    };
  }, [src]);
  return state.src === src ? state.ok : true;
}

/** The whole framed photo at `size`×`size` px. */
export function PhotoLayer({ src, crop, size, ok = true, style }: { src: string; crop: PhotoCrop; size: number | string; ok?: boolean; style?: CSSProperties }) {
  return (
    <div style={{ position: "absolute", width: size, height: size, overflow: "hidden", ...style }}>
      {ok ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" draggable={false} style={{ ...cropStyle(crop), display: "block", pointerEvents: "none", userSelect: "none" }} />
      ) : (
        <div aria-hidden style={{ width: "100%", height: "100%", background: V.grad, display: "grid", placeItems: "center", color: "rgba(255,255,255,.9)", fontSize: "calc(1em * 6)" }}>
          ♥
        </div>
      )}
    </div>
  );
}

/**
 * One tile's view of the photo: the full photo shifted so cell `id` shows.
 * `inset` is the tile card's visual margin inside its cell — the photo shifts
 * by it too, so what shows is still exactly that cell's pixels.
 */
export function Slice({ src, crop, n, t, id, inset = 0, ok }: { src: string; crop: PhotoCrop; n: number; t: number; id: number; inset?: number; ok?: boolean }) {
  const r = Math.floor(id / n);
  const c = id % n;
  return (
    <PhotoLayer
      src={src}
      crop={crop}
      size={n * t}
      ok={ok}
      style={{ left: -(c * t + inset), top: -(r * t + inset), transition: "left .5s ease, top .5s ease" }}
    />
  );
}
