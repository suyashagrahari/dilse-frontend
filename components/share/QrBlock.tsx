"use client";

// ─── QrBlock — the QR as it appears on screen ────────────────────────────────
//
// One SVG `<path>` for the whole symbol, not one `<rect>` per module. A version-6
// code is 41×41; the rect version puts ~850 nodes in the DOM and that is enough
// to make the sheet's spring animation drop frames on a mid-range phone.
//
// The symbol is drawn in module units and scaled by the viewBox, so it stays
// crisp at any rendered size and there is no `width`/`height` arithmetic to get
// wrong. `shapeRendering: crispEdges` keeps the browser from antialiasing module
// boundaries into grey, which is what makes a code fail at an angle.
//
// The centre logo is drawn over live modules — see `qrLogo.ts` for the area
// budget it gets, and `qrPng.ts` for why the error-correction level must stay
// "high" wherever it is used.
//
// The logo's aspect is MEASURED rather than assumed. This used to draw it into a
// square with `preserveAspectRatio="slice"`, which cropped a 1280×732 wordmark to
// its middle square and dropped both ends of it. Measuring costs one image load,
// cached process-wide for the whole session, and it means this preview and the
// downloaded PNG are finally the same picture.

import { useEffect, useId, useMemo, useState } from "react";
import { encodeQr, qrPath, qrExtent, type EcLevel } from "@/lib/share/qr";
import { loadLogoMetrics, qrLogoBox, type LogoMetrics } from "@/lib/share/qrLogo";

const QUIET_ZONE = 4;

/** Resolved metrics, so render can read them synchronously. */
const measured = new Map<string, LogoMetrics | null>();

/**
 * The logo's measured metrics, or null until they are known.
 *
 * Read straight out of the module cache during render rather than mirrored into
 * state. That means an already-measured logo is correct on the very first frame
 * with no effect at all, a changed `src` can never be shown at the previous
 * logo's proportions, and nothing calls setState synchronously in an effect.
 */
function useLogoMetrics(src: string | undefined): LogoMetrics | null {
  const [, bump] = useState(0);
  useEffect(() => {
    if (!src || measured.has(src)) return;
    let live = true;
    loadLogoMetrics(src).then((m) => {
      measured.set(src, m);
      if (live) bump((n) => n + 1);
    });
    return () => {
      live = false;
    };
  }, [src]);
  return src ? measured.get(src) ?? null : null;
}

export function QrBlock({
  value,
  size = 232,
  dark = "#111111",
  light = "#FFFFFF",
  ecLevel = "high",
  logoSrc,
  radius = 18,
}: {
  value: string;
  /** Rendered edge length in CSS pixels, quiet zone included. */
  size?: number;
  dark?: string;
  light?: string;
  ecLevel?: EcLevel;
  /** Same-origin only — a cross-origin logo would taint a canvas capture. */
  logoSrc?: string;
  radius?: number;
}) {
  const matrix = useMemo(() => encodeQr(value, ecLevel), [value, ecLevel]);
  const path = useMemo(() => (matrix ? qrPath(matrix, QUIET_ZONE) : ""), [matrix]);
  const metrics = useLogoMetrics(logoSrc);
  // Unique per instance: two QrBlocks on one page sharing a clip-path id would
  // have the second silently adopt the first one's geometry.
  const clipId = useId();

  if (!matrix) {
    return (
      <div
        role="img"
        aria-label="This link is too long to turn into a QR code"
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          background: light,
          color: "#8A8194",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          fontSize: 13,
          lineHeight: 1.4,
          padding: 24,
          boxSizing: "border-box",
        }}
      >
        This link is too long to turn into a QR code — use the link tab instead.
      </div>
    );
  }

  const extent = qrExtent(matrix, QUIET_ZONE);
  // Held back until the artwork is measured, so the plate is never drawn at one
  // shape and then snapped to another a frame later.
  const box = logoSrc && metrics ? qrLogoBox(matrix.size, extent, metrics.aspect) : null;

  // SVG `<image>` cannot crop, so the whole file is drawn oversized and the
  // clip-path shows only the artwork — the same trimmed result the canvas gets
  // from a source rect. The full size is derived from the box, so the two
  // renderers stay identical by construction rather than by coincidence.
  const art =
    box && metrics
      ? (() => {
          const { image, content } = metrics;
          const fullW = box.w * (image.naturalWidth / content.w);
          const fullH = box.h * (image.naturalHeight / content.h);
          return {
            x: box.x - (content.x / image.naturalWidth) * fullW,
            y: box.y - (content.y / image.naturalHeight) * fullH,
            w: fullW,
            h: fullH,
          };
        })()
      : null;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${extent} ${extent}`}
      role="img"
      aria-label="QR code for this page"
      style={{ display: "block", borderRadius: radius, background: light }}
    >
      <rect width={extent} height={extent} fill={light} />
      <path d={path} fill={dark} shapeRendering="crispEdges" />

      {logoSrc && box && art ? (
        <>
          <rect
            x={box.plate.x}
            y={box.plate.y}
            width={box.plate.w}
            height={box.plate.h}
            rx={box.plate.r}
            fill={light}
          />
          <clipPath id={clipId}>
            <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={box.r} />
          </clipPath>
          {/* "none" is exact, not lax: `art` is the file scaled by a single
              factor derived from the box, so its own aspect is already correct
              and there is nothing left for the browser to fit. */}
          <image
            href={logoSrc}
            x={art.x}
            y={art.y}
            width={art.w}
            height={art.h}
            clipPath={`url(#${clipId})`}
            preserveAspectRatio="none"
          />
        </>
      ) : null}
    </svg>
  );
}

export default QrBlock;
