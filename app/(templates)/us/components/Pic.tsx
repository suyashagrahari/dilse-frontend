"use client";

// A framed photo: the sender's crop applied, a shimmer until it has loaded,
// and a soft fade-in — the loading moment of the real app.

import { useCallback, useState, type CSSProperties } from "react";
import { cropStyle } from "../../dedication/components/types";
import type { Crop } from "./types";

export function framing(crop?: Crop): CSSProperties {
  return cropStyle(crop ?? { x: 50, y: 50, scale: 100 });
}

export default function Pic({
  src,
  crop,
  alt = "",
  className = "",
  style,
  eager,
}: {
  src: string;
  crop?: Crop;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  eager?: boolean;
}) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  // A cached image can finish before hydration attaches onLoad.
  const attach = useCallback(
    (el: HTMLImageElement | null) => {
      if (el && el.complete && el.naturalWidth > 0) setLoadedSrc(src);
    },
    [src],
  );
  const loaded = loadedSrc === src || !src;
  return (
    <div className={`us-pic${loaded ? " is-in" : ""} ${className}`} style={style}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={attach}
          src={src}
          alt={alt}
          draggable={false}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoadedSrc(src)}
          onError={() => setLoadedSrc(src)}
          style={framing(crop)}
        />
      ) : null}
    </div>
  );
}

/** The story-ring avatar. `live` spins the ring slowly (an unseen story). */
export function RingAvatar({
  src,
  crop,
  size,
  seen,
  live,
  onClick,
  label = "Open story",
}: {
  src: string;
  crop?: Crop;
  size: number | string;
  seen?: boolean;
  live?: boolean;
  onClick?: () => void;
  label?: string;
}) {
  const inner = (
    <div className={`us-ring${seen ? " is-seen" : ""}${live && !seen ? " is-live" : ""}`} style={{ width: size, height: size }}>
      <div className="us-ring-gap" style={{ padding: typeof size === "number" && size < 60 ? 2 : 3 }}>
        <Pic src={src} crop={crop} eager />
      </div>
    </div>
  );
  if (!onClick) return inner;
  return (
    <button type="button" onClick={onClick} aria-label={label} style={{ borderRadius: "50%", display: "block", width: size, height: size }}>
      {inner}
    </button>
  );
}
