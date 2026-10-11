"use client";

// ─── Sticker — one GIF slot ──────────────────────────────────────────────────
//
// Resolution order for a slot:
//   1. the sender's own link (`data.gifs[slot.id]` is an https URL)
//   2. our CDN default:   templateMedia(slug, slot.file)  e.g. templates/happy-rose-day/r1-arrival.gif
//   3. the slot's animated emoji (always works — used until the CDN file exists)
// `data.gifs[slot.id] === "none"` renders nothing at all.
//
// The box is always exactly `size`×`size` (no layout shift while loading or on
// fallback), the image is lazy, and a URL that failed once is remembered for
// the session so a missing CDN file costs one request, not one per mount.

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { templateMedia } from "@/lib/templateMedia";
import type { DaySlug, GifSlot } from "../types";
import { ensureKitCss } from "./kitCss";

const failed = new Set<string>();

export interface StickerProps {
  slug: DaySlug;
  slot: GifSlot;
  /** `data.gifs[slot.id]` — "" (default) | "none" | https URL. */
  value?: string;
  /** Square box size in px. Default 120. */
  size?: number;
  className?: string;
  style?: CSSProperties;
  /** Accessible label; defaults to the slot label. Decorative stickers can pass "". */
  alt?: string;
  /** Load eagerly (above the fold). Default lazy. */
  eager?: boolean;
}

export function stickerSources(slug: DaySlug, slot: GifSlot, value?: string): string[] {
  const v = (value ?? "").trim();
  const out: string[] = [];
  if (/^https:\/\//i.test(v)) out.push(v);
  out.push(templateMedia(slug, slot.file));
  return out.filter((u) => !failed.has(u));
}

export default function Sticker({ slug, slot, value, size = 120, className, style, alt, eager }: StickerProps) {
  useEffect(ensureKitCss, []);
  const sources = useMemo(() => stickerSources(slug, slot, value), [slug, slot, value]);
  // A new value (the sender pasted a link) starts the chain again.
  const chain = sources.join("|");
  const [pos, setPos] = useState({ chain, idx: 0 });
  const idx = pos.chain === chain ? pos.idx : 0;

  if (value === "none") return null;

  const src = sources[idx];
  const box: CSSProperties = {
    width: size,
    height: size,
    flex: "none",
    display: "inline-grid",
    placeItems: "center",
    position: "relative",
    ...style,
  };
  const label = alt ?? slot.label;

  return (
    <span className={className} style={box} role={label ? "img" : undefined} aria-label={label || undefined} aria-hidden={label ? undefined : true}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          width={size}
          height={size}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          onError={() => {
            failed.add(src);
            setPos({ chain, idx: idx + 1 });
          }}
          style={{ width: size, height: size, objectFit: "contain", userSelect: "none", pointerEvents: "none" }}
        />
      ) : (
        <span
          className={`vw-anim-${slot.anim ?? "bounce"}`}
          style={{ fontSize: Math.round(size * 0.62), lineHeight: 1, display: "inline-block", filter: "drop-shadow(0 6px 10px rgba(0,0,0,.15))" }}
        >
          {slot.emoji}
        </span>
      )}
    </span>
  );
}
