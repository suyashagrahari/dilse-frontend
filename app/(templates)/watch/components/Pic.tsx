"use client";

// One framed photo, rendered with the crop the sender set in the editor —
// the same `cropStyle()` every surface uses, so the film frame, a thumbnail,
// an avatar and a Moments card all show exactly what was framed.

import { useState, type CSSProperties } from "react";
import { cropStyle, photoCrop } from "../../dedication/components/types";
import type { LovePhoto } from "./types";

export default function Pic({
  photo,
  alt = "",
  style,
  className,
  eager,
}: {
  photo: LovePhoto | null | undefined;
  alt?: string;
  style?: CSSProperties;
  className?: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState<string | null>(null);
  if (!photo?.url || failed === photo.url) {
    return <span className={className} aria-hidden="true" style={{ display: "block", width: "100%", height: "100%", background: "linear-gradient(135deg,#3a2230,#1b1b22)", ...style }} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photo.url}
      alt={alt}
      draggable={false}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={className}
      onError={() => setFailed(photo.url)}
      style={{ ...cropStyle(photoCrop(photo)), display: "block", ...style }}
    />
  );
}
