"use client";

// A circular face for the DOM screens (intro, result, share card).
// Never renders a broken image: if the photo fails, or there is no photo, the
// initial disc takes over. Non-square photos are cover-cropped, not squashed.

import { useState } from "react";
import { faceFill, initialOf } from "./catchTheme";

export interface FaceCircleProps {
  url: string;
  name: string;
  size: number;
  ring?: boolean;
  className?: string;
}

export default function FaceCircle({ url, name, size, ring = true, className }: FaceCircleProps) {
  const [broken, setBroken] = useState(false);
  const show = !!url && !broken;
  const fill = faceFill(name);

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        background: fill,
        boxShadow: ring ? "0 0 0 3px rgba(255,253,247,0.95), 0 8px 22px rgba(44,42,38,0.16)" : undefined,
      }}
    >
      {show ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          onError={() => setBroken(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
        />
      ) : (
        <span
          aria-hidden
          className="absolute inset-0 flex items-center justify-center font-semibold"
          style={{
            color: "rgba(255,253,247,0.95)",
            fontSize: Math.round(size * 0.42),
            fontFamily: "var(--font-outfit), system-ui, sans-serif",
          }}
        >
          {initialOf(name)}
        </span>
      )}
    </div>
  );
}
