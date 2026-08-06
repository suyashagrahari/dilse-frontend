"use client";

// ─── Us — the one way a photo is drawn ───────────────────────────────────────
//
// Every photo in this template goes through here, because the failure mode is
// the thing that matters. These are URLs someone typed into a form: a share of
// them will be dead by the time the page is opened, and one broken-image icon
// stops the grid reading as a real profile instantly.
//
// So there is no broken state. The grey cell with a small photo glyph is
// rendered ALWAYS, underneath, and the photo simply paints on top of it when it
// arrives. That ordering is deliberate, and it is the second version of this
// component — the first one rendered the fallback only after `onError` fired,
// which loses the whole class of images that fail *before* React hydrates. On a
// server-rendered page the browser starts fetching from the HTML, so a dead URL
// can error while React is still booting; the event has already come and gone
// by the time an `onError` prop exists to hear it. Under a throttled network
// with a dozen dead photos, almost none of them recovered.
//
// The fix needs no React state at all:
//   • the fallback is always there, so there is nothing to switch on;
//   • `onError` hides the <img> so the browser's own broken glyph never shows;
//   • the attach callback catches the ones that already failed, by asking the
//     element directly (`complete && naturalWidth === 0`) the moment React
//     gets hold of it. A DOM write from a ref callback — not a setter, so no
//     effect, no extra render, and nothing for the hooks rules to object to.
//   • `onLoad` clears the hidden flag, so reusing the element for a new URL
//     recovers correctly.
//
// `next/image` with `unoptimized` rather than a bare <img>: it keeps the lint
// clean without a suppression, and `unoptimized` skips the loader's hostname
// check, so an arbitrary user-supplied host renders instead of throwing. Cover
// fit is explicit — a non-square photo is centre-cropped, never squashed.

import Image from "next/image";
import { useCallback } from "react";
import { BrokenPhotoGlyph } from "./icons";

export interface PhotoProps {
  src: string;
  /** Empty string for decorative photos. */
  alt: string;
  sizes?: string;
  /** Edge of the fallback glyph. Scale it down inside small cells. */
  glyphSize?: number;
  /** Fallback fill. Matches the surrounding surface. */
  fallbackBg?: string;
  priority?: boolean;
}

/**
 * Fills its nearest positioned ancestor. Every caller supplies one with
 * `position: relative` and a real size — this component never sets its own
 * dimensions, so the same code serves an 86px avatar and a full-width photo.
 */
export default function Photo({
  src,
  alt,
  sizes = "420px",
  glyphSize = 24,
  fallbackBg = "#F5F5F5",
  priority = false,
}: PhotoProps) {
  const attach = useCallback((img: HTMLImageElement | null) => {
    // Finished before React arrived, and produced nothing. Hide it; the
    // fallback underneath is already in place.
    if (img && img.complete && img.naturalWidth === 0) img.style.visibility = "hidden";
  }, []);

  return (
    <>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: fallbackBg,
          display: "grid",
          placeItems: "center",
        }}
      >
        <BrokenPhotoGlyph size={glyphSize} color="#C7C7C7" />
      </div>

      {src ? (
        <Image
          ref={attach}
          src={src}
          alt={alt}
          fill
          unoptimized
          sizes={sizes}
          priority={priority}
          draggable={false}
          onError={(e) => {
            e.currentTarget.style.visibility = "hidden";
          }}
          onLoad={(e) => {
            e.currentTarget.style.visibility = "visible";
          }}
          style={{ objectFit: "cover", objectPosition: "center", userSelect: "none" }}
        />
      ) : null}
    </>
  );
}
