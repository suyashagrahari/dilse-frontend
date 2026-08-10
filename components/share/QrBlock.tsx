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
// The centre logo is drawn over live modules — see `qrPng.ts` for why 22% is the
// ceiling and why the error-correction level must stay "high" wherever it is used.

import { useMemo } from "react";
import { encodeQr, qrPath, qrExtent, type EcLevel } from "@/lib/share/qr";

const QUIET_ZONE = 4;
const LOGO_FRACTION = 0.22;

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
  const logoBox = matrix.size * LOGO_FRACTION;
  const logoPad = logoBox * 0.14;
  const logoLeft = (extent - logoBox) / 2;

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

      {logoSrc ? (
        <>
          <rect
            x={logoLeft - logoPad}
            y={logoLeft - logoPad}
            width={logoBox + logoPad * 2}
            height={logoBox + logoPad * 2}
            rx={logoBox * 0.24}
            fill={light}
          />
          <clipPath id="qr-logo-clip">
            <rect
              x={logoLeft}
              y={logoLeft}
              width={logoBox}
              height={logoBox}
              rx={logoBox * 0.2}
            />
          </clipPath>
          <image
            href={logoSrc}
            x={logoLeft}
            y={logoLeft}
            width={logoBox}
            height={logoBox}
            clipPath="url(#qr-logo-clip)"
            preserveAspectRatio="xMidYMid slice"
          />
        </>
      ) : null}
    </svg>
  );
}

export default QrBlock;
