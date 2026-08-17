"use client";

import Image from "next/image";
import { memo } from "react";
import type { Asset } from "../assets";

// ─── Uncroppable asset rendering ─────────────────────────────────────────────
//
// Every ritual GIF goes through here, and the reason is a bug this replaced.
//
// The first build put all ten assets into a fixed 1:1 box with
// `object-fit: cover`. Six of the ten are not square — gift-demand is 200×142 —
// so `cover` scaled them to fill the square and threw away 29% of the height.
// The characters were cut off at the forehead and chin, and because `cover`
// always produces a full, tidy-looking box, nothing about it read as broken.
//
// The fix is to make the box a function of the artwork instead of a constant.
// The caller gives a max width; the height is derived from the asset's true
// ratio. `object-fit: contain` is then belt-and-braces: with the box already at
// the right shape there is nothing to letterbox, but if a replaced asset ever
// has different proportions than the numbers in assets.ts, it will letterbox
// rather than silently crop.
//
// `unoptimized` is REQUIRED on the GIFs. Without it Next's optimiser re-encodes
// them to static WebP and each one becomes a single frozen frame — the ritual
// still "works", it just stops moving, and nothing errors.
//
// A GIF starts playing the instant it decodes; there is no `paused` attribute
// and no way to hold frame 1 from CSS. That is why the ritual does not show its
// GIFs on the step at all — they play full screen on the tap, in
// `RitualTakeover`, where "starts immediately" is exactly what is wanted.

export const AssetImage = memo(function AssetImage({
  asset,
  alt,
  maxWidth,
  maxHeight,
  priority = false,
  animated = true,
  className,
}: {
  asset: Asset;
  alt: string;
  maxWidth: number;
  /** Optional cap for tall assets, so a portrait one cannot push the CTA away. */
  maxHeight?: number;
  priority?: boolean;
  /** GIF/animated WebP → must bypass the optimiser or it freezes. */
  animated?: boolean;
  className?: string;
}) {
  // Fit inside the box the caller allows, preserving the true ratio.
  let w = maxWidth;
  let h = Math.round(maxWidth / asset.ratio);
  if (maxHeight && h > maxHeight) {
    h = maxHeight;
    w = Math.round(maxHeight * asset.ratio);
  }

  return (
    <Image
      src={asset.src}
      alt={alt}
      width={w}
      height={h}
      priority={priority}
      unoptimized={animated}
      sizes={`${w}px`}
      className={className}
      style={{
        width: w,
        height: h,
        objectFit: "contain",
        display: "block",
      }}
    />
  );
});

/**
 * The dimensions `AssetImage` would use. Callers need these to size the frame
 * around the artwork, so the frame hugs the GIF instead of the GIF being
 * squeezed into the frame.
 */
export function fitAsset(
  asset: Asset,
  maxWidth: number,
  maxHeight?: number
): { width: number; height: number } {
  let w = maxWidth;
  let h = Math.round(maxWidth / asset.ratio);
  if (maxHeight && h > maxHeight) {
    h = maxHeight;
    w = Math.round(maxHeight * asset.ratio);
  }
  return { width: w, height: h };
}
