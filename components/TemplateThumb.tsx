"use client";

// ─── A template's cover as a small 3:4 thumbnail ─────────────────────────────
//
// Admin lists (early access, a user's access tab) used to stand a template in
// with its emoji. The owner asked for the real poster instead — the same image
// the gallery card shows — so a template is recognised at a glance rather than
// by a 🎂 that half the birthday templates share.
//
// Same source as `TemplateCard`: CDN covers load their pre-sized @360w/@540w/
// @720w variants straight from CloudFront (`coverSrcSet`); anything else goes
// through a plain <img>. A template with no cover, or a cover that fails to
// load, falls back to the old emoji/icon so the row never shows a broken image.

import { useState, type ReactNode } from "react";
import { coverSmall, coverSrcSet } from "@/lib/templateMedia";

export default function TemplateThumb({
  src,
  alt = "",
  width = 42,
  fallback,
  radius = 9,
  fallbackBg = "rgba(201,168,76,.13)",
  className,
}: {
  src?: string | null;
  alt?: string;
  /** Rendered width in CSS px; height follows the 3:4 poster ratio. */
  width?: number;
  /** Shown when there is no cover or it fails to load (emoji or icon). */
  fallback?: ReactNode;
  radius?: number;
  fallbackBg?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const height = Math.round((width * 4) / 3);
  const box = {
    width,
    height,
    flex: "none" as const,
    borderRadius: radius,
    overflow: "hidden" as const,
    position: "relative" as const,
    display: "grid",
    placeItems: "center",
  };

  if (!src || failed) {
    return (
      <span className={className} aria-hidden style={{ ...box, background: fallbackBg, fontSize: Math.round(width * 0.45) }}>
        {fallback}
      </span>
    );
  }

  const set = coverSrcSet(src);
  return (
    <span
      className={className}
      style={{ ...box, background: "#f3e9df", boxShadow: "0 1px 3px rgba(42,10,14,.14), inset 0 0 0 1px rgba(42,10,14,.06)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- CDN variants, see coverSrcSet */}
      <img
        src={set ? coverSmall(src) : src}
        srcSet={set}
        // The thumbnail is tiny; at 2–3× DPR the 360w variant is already sharp.
        sizes={set ? `${width}px` : undefined}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
    </span>
  );
}
