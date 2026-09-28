"use client";

// One animated sticker. GIF / animated WebP go in an <img>; the machine's own
// .webm stickers need a muted, looping, inline <video>. Reduced motion shows the
// first frame (img) or a paused video.

import type { CSSProperties } from "react";

import { isVideoGif } from "./types";

export default function GifSticker({
  url,
  size = 96,
  tilt = 0,
  reducedMotion = false,
  style,
  fit = "cover",
}: {
  url: string;
  size?: number | string;
  tilt?: number;
  reducedMotion?: boolean;
  style?: CSSProperties;
  fit?: "cover" | "contain";
}) {
  const box: CSSProperties = {
    width: size,
    height: size,
    objectFit: fit,
    display: "block",
    borderRadius: 14,
    background: "#fff",
    transform: tilt ? `rotate(${tilt}deg)` : undefined,
    ...style,
  };
  if (isVideoGif(url)) {
    return (
      <video
        src={url}
        autoPlay={!reducedMotion}
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
        style={box}
      />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" aria-hidden="true" loading="lazy" decoding="async" style={box} />;
}
