// ─── Photo QR ────────────────────────────────────────────────────────────────
//
// A QR code coloured from the sender's own photograph: the picture shows
// through the symbol, and the symbol still scans.
//
// ── HOW IT KEEPS SCANNING ────────────────────────────────────────────────────
//
// A scanner does not read colour. It thresholds the image into light and dark
// and reads the pattern, so the only thing that has to survive is a reliable
// LUMINANCE gap between the two kinds of module. Everything else — hue,
// saturation, the detail inside a module — is free.
//
// So each pixel is pushed only as far as it has to go, and no further:
//
//   • A pixel inside a DARK module is multiplied towards black until its
//     luminance is at most `darkMax`. A pixel already darker than that is left
//     completely alone.
//   • A pixel inside a LIGHT module is multiplied towards white until its
//     luminance is at least `lightMin`. A pixel already brighter is untouched.
//
// Multiplying rather than replacing is what keeps the photograph visible: hue
// is preserved, relative detail inside each band is preserved, and large parts
// of a well-exposed picture are not touched at all. Flat-filling each module
// with its average colour — the obvious implementation — throws all of that
// away and produces a 41×41 pixel mosaic instead of a photograph.
//
// ── WHAT IS NEVER TINTED ─────────────────────────────────────────────────────
//
// The function patterns, and the quiet zone. See `QrMatrix.functionModules` for
// why the finders and timing lines are load-bearing in a way data modules are
// not. The quiet zone is pure light because a scanner uses it to find the
// symbol's edge; letting the photo bleed into it is the single most common way
// a decorated QR fails.
//
// ── ERROR CORRECTION IS PINNED TO "high" ─────────────────────────────────────
//
// Not a default — a requirement. The whole technique spends contrast budget to
// buy appearance, and level "high" recovers 30% of the symbol, which is what
// pays for a busy photograph, a phone camera at an angle, and print.
//
// ── THE STRENGTHS ARE VERIFIED, NOT GUESSED ──────────────────────────────────
//
// The three bands below are not taste. Each one was rendered against real
// photographs and decoded back with an independent decoder; `soft` is as far
// as the contrast can be relaxed while every test image still round-trips.
// Do not widen it without re-running that check.

import { encodeQr } from "./qr";

/** How much the photograph is allowed to override contrast. */
export type PhotoStrength = "soft" | "balanced" | "sharp";

interface Band {
  /** Ceiling luminance (0–1) for a pixel inside a dark module. */
  darkMax: number;
  /** Floor luminance (0–1) for a pixel inside a light module. */
  lightMin: number;
}

const BANDS: Record<PhotoStrength, Band> = {
  // Most photographic. Contrast ratio ≈ 2.6:1.
  soft: { darkMax: 0.28, lightMin: 0.78 },
  // The default. ≈ 3.2:1 — comfortably inside what phone cameras handle.
  balanced: { darkMax: 0.22, lightMin: 0.8 },
  // Nearly a plain QR with a wash of colour. ≈ 5.6:1. For busy photos and print.
  sharp: { darkMax: 0.12, lightMin: 0.9 },
};

/** Modules of pure light around the symbol. The spec's minimum is 4. */
const QUIET_ZONE = 4;

/** Relative luminance, 0–1. The scanner's view of a pixel. */
const luminance = (r: number, g: number, b: number): number =>
  (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export interface PhotoQrOptions {
  strength?: PhotoStrength;
  /** Target edge length in pixels. Rounded down to a whole module multiple. */
  size?: number;
}

/**
 * Render `text` as a QR coloured by `imageSrc`, as a PNG data URL.
 *
 * Returns null on any failure — an unencodable string, an image that will not
 * load, no canvas. Callers fall back to the plain code rather than showing an
 * error, because the plain code is always the more useful of the two.
 */
export async function photoQrToPngDataUrl(
  text: string,
  imageSrc: string,
  opts: PhotoQrOptions = {},
): Promise<string | null> {
  const matrix = encodeQr(text, "high");
  if (!matrix || !imageSrc) return null;

  const band = BANDS[opts.strength ?? "balanced"];

  try {
    const image = await loadImage(imageSrc);
    if (!image || !image.width || !image.height) return null;

    const extent = matrix.size + QUIET_ZONE * 2;
    // Integer module size: no module may straddle a pixel boundary, or the
    // boundary pixels average the two bands together and erase the gap.
    const scale = Math.max(2, Math.floor((opts.size ?? 1024) / extent));
    const dim = extent * scale;

    const canvas = document.createElement("canvas");
    canvas.width = dim;
    canvas.height = dim;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, dim, dim);

    // Cover-fit the photo across the symbol only, never the quiet zone.
    const inner = matrix.size * scale;
    const offset = QUIET_ZONE * scale;
    const cover = Math.max(inner / image.width, inner / image.height);
    const drawW = image.width * cover;
    const drawH = image.height * cover;
    ctx.drawImage(
      image,
      offset + (inner - drawW) / 2,
      offset + (inner - drawH) / 2,
      drawW,
      drawH,
    );

    const frame = ctx.getImageData(0, 0, dim, dim);
    const px = frame.data;

    for (let y = 0; y < dim; y++) {
      const my = Math.floor(y / scale) - QUIET_ZONE;
      const insideRow = my >= 0 && my < matrix.size;

      for (let x = 0; x < dim; x++) {
        const i = (y * dim + x) * 4;
        const mx = Math.floor(x / scale) - QUIET_ZONE;

        if (!insideRow || mx < 0 || mx >= matrix.size) {
          // Quiet zone. Pure light, always.
          px[i] = 255;
          px[i + 1] = 255;
          px[i + 2] = 255;
          px[i + 3] = 255;
          continue;
        }

        const dark = matrix.modules[my][mx];

        if (matrix.functionModules[my][mx]) {
          const v = dark ? 0 : 255;
          px[i] = v;
          px[i + 1] = v;
          px[i + 2] = v;
          px[i + 3] = 255;
          continue;
        }

        const r = px[i];
        const g = px[i + 1];
        const b = px[i + 2];
        const lum = luminance(r, g, b);

        if (dark) {
          // Multiply towards black, and only as far as necessary.
          if (lum > band.darkMax) {
            const k = band.darkMax / Math.max(lum, 1e-4);
            px[i] = Math.round(r * k);
            px[i + 1] = Math.round(g * k);
            px[i + 2] = Math.round(b * k);
          }
        } else if (lum < band.lightMin) {
          // Multiply the COMPLEMENT towards zero — the same move, towards white.
          const k = (1 - band.lightMin) / Math.max(1 - lum, 1e-4);
          px[i] = Math.round(255 - (255 - r) * k);
          px[i + 1] = Math.round(255 - (255 - g) * k);
          px[i + 2] = Math.round(255 - (255 - b) * k);
        }
        px[i + 3] = 255;
      }
    }

    ctx.putImageData(frame, 0, 0);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

/** Longest edge of a stored photo. Bigger buys no visible detail at 41 modules. */
const MAX_PHOTO_EDGE = 1400;

/**
 * A picked `File` as a downscaled data URL.
 *
 * Downscaling on the way in rather than at render time keeps one bounded copy
 * in state instead of a full 12-megapixel bitmap, and means changing the
 * strength re-renders from something small. Returns null if the file is not an
 * image or cannot be decoded.
 */
export async function fileToScaledDataUrl(file: File): Promise<string | null> {
  if (!file.type.startsWith("image/")) return null;

  try {
    const raw = await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
    if (!raw) return null;

    const image = await loadImage(raw);
    if (!image || !image.width || !image.height) return null;

    const longest = Math.max(image.width, image.height);
    if (longest <= MAX_PHOTO_EDGE) return raw;

    const k = MAX_PHOTO_EDGE / longest;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * k);
    canvas.height = Math.round(image.height * k);
    const ctx = canvas.getContext("2d");
    if (!ctx) return raw;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.92);
  } catch {
    return null;
  }
}
