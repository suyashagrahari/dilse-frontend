"use client";

// ─── <Floral> — one watercolour cluster from the art pack ────────────────────
//
// Renders the theme's floral pose (./art) as a bounded <img>: either the whole
// cutout, or a % window of it (crop) with feathered edges, so a framed bouquet
// can be used without its gold frame lines. Width descriptors let a 640 px
// source serve a ~300 css px slot at 2× without fetching the @2x file.
// Position, rotation and motion belong to the caller (className / style).

import type { CSSProperties } from "react";
import { cutoutImg, type FloralSpec } from "./art";
import type { WeddingArtId } from "../../_wedding/art";

export interface FloralProps {
  spec: Pick<FloralSpec, "id" | "crop" | "feather">;
  className?: string;
  style?: CSSProperties;
  /** First-screen art: eager + high priority. Otherwise lazy. */
  priority?: boolean;
  /** `sizes` for the srcSet (how wide it renders). */
  sizes?: string;
}

export default function Floral({ spec, className, style, priority, sizes = "45vw" }: FloralProps) {
  const img = cutoutImg(spec.id as WeddingArtId);
  const [x, y, w, h] = spec.crop ?? [0, 0, 100, 100];
  const f = spec.feather ?? 0;
  const box: CSSProperties = {
    aspectRatio: `${(img.w * w) / 100} / ${(img.h * h) / 100}`,
    ...(f
      ? {
          WebkitMaskImage: `linear-gradient(90deg, transparent, #000 ${f}%, #000 ${100 - f}%, transparent)`,
          maskImage: `linear-gradient(90deg, transparent, #000 ${f}%, #000 ${100 - f}%, transparent)`,
        }
      : null),
  };
  return (
    <span className={`wi-fl${className ? ` ${className}` : ""}`} style={style} aria-hidden>
      <span className="wi-fl-box" style={box}>
        {/* eslint-disable-next-line @next/next/no-img-element -- pack art on the CDN, sized by srcSet */}
        <img
          src={img.src}
          srcSet={img.srcSet}
          sizes={sizes}
          width={img.w}
          height={img.h}
          alt=""
          draggable={false}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          style={{ width: `${10000 / w}%`, left: `${(-x * 100) / w}%`, top: `${(-y * 100) / h}%` }}
        />
      </span>
    </span>
  );
}

export const FLORAL_CSS = /* css */ `
.wi-fl { display: block; pointer-events: none; user-select: none; }
.wi-fl-box { position: relative; display: block; width: 100%; overflow: hidden; }
.wi-fl-box img { position: absolute; max-width: none; height: auto; display: block; }
`;
