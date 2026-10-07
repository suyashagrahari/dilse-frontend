"use client";

// A LovePhoto drawn the way the sender framed it in the editor (focal point
// cropX/cropY 0–100, zoom scale 100–300). Fills its box (object-fit: cover), so
// give the parent a size/aspect-ratio — nothing shifts while it loads.
//
//   <div style={{ aspectRatio: "4 / 5" }}><CroppedPhoto photo={p} /></div>

import type { CSSProperties } from "react";
import type { LovePhoto } from "../types";

export default function CroppedPhoto({ photo, alt, eager, style, className }: { photo: LovePhoto; alt?: string; eager?: boolean; style?: CSSProperties; className?: string }) {
  const x = photo.cropX ?? 50;
  const y = photo.cropY ?? 50;
  const s = Math.max(100, Math.min(300, photo.scale ?? 100)) / 100;
  return (
    <span className={className} style={{ position: "relative", display: "block", width: "100%", height: "100%", overflow: "hidden", background: "rgba(0,0,0,.06)", ...style }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.url}
        alt={alt ?? photo.caption ?? ""}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: `${x}% ${y}%`,
          transform: s !== 1 ? `scale(${s})` : undefined,
          transformOrigin: `${x}% ${y}%`,
          userSelect: "none",
        }}
      />
    </span>
  );
}
