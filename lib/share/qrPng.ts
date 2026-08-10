// ─── QR → PNG ────────────────────────────────────────────────────────────────
//
// The QR download is drawn straight onto a canvas rather than captured from the
// DOM with `html-to-image`, for one reason: a QR code is the one image on this
// site where a half-pixel of resampling is a functional bug. Rasterising the
// matrix at an exact integer scale guarantees every module is a whole number of
// device pixels with hard edges, which is what a scanner's binarisation step
// wants. A DOM capture of the same SVG goes through the browser's compositor,
// lands on fractional boundaries, and produces the grey module edges that make a
// printed code fail at anything but a perfect angle.
//
// The printable card still goes through `html-to-image`, because it is a poster
// with type and gradients — but the QR inside it is drawn by this file first and
// dropped in as a bitmap, so the code itself never gets resampled either.

import { encodeQr, type EcLevel } from "./qr";

/** Modules of white margin around the symbol. The spec's minimum is 4. */
const QUIET_ZONE = 4;

/**
 * Fraction of the symbol's width the centre logo may cover.
 *
 * 0.22 is 4.8% of the area. Error correction "high" recovers 30%, so this is
 * comfortably inside tolerance even stacked on top of print damage. Do not
 * raise it — the failures it causes do not show up on a screen, only on paper.
 */
const LOGO_FRACTION = 0.22;

export interface QrPngOptions {
  /** Target width/height in pixels. Rounded down to a whole module multiple. */
  size?: number;
  ecLevel?: EcLevel;
  dark?: string;
  light?: string;
  /** Same-origin image drawn in the centre. Cross-origin would taint the canvas. */
  logoSrc?: string;
}

/** Load an image, or resolve null. Never rejects — a missing logo is not fatal. */
function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Render `text` as a QR bitmap and return it as a data URL, or null if the text
 * cannot be encoded or the canvas is unavailable.
 */
export async function qrToPngDataUrl(
  text: string,
  opts: QrPngOptions = {},
): Promise<string | null> {
  const matrix = encodeQr(text, opts.ecLevel ?? "high");
  if (!matrix) return null;

  try {
    const extent = matrix.size + QUIET_ZONE * 2;
    // Integer module size, so no module ever straddles a pixel boundary.
    const scale = Math.max(1, Math.floor((opts.size ?? 1024) / extent));
    const dim = extent * scale;

    const canvas = document.createElement("canvas");
    canvas.width = dim;
    canvas.height = dim;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = opts.light ?? "#FFFFFF";
    ctx.fillRect(0, 0, dim, dim);

    ctx.fillStyle = opts.dark ?? "#000000";
    for (let y = 0; y < matrix.size; y++) {
      for (let x = 0; x < matrix.size; x++) {
        if (matrix.modules[y][x]) {
          ctx.fillRect((x + QUIET_ZONE) * scale, (y + QUIET_ZONE) * scale, scale, scale);
        }
      }
    }

    if (opts.logoSrc) {
      const logo = await loadImage(opts.logoSrc);
      if (logo) {
        const box = Math.round(matrix.size * scale * LOGO_FRACTION);
        const pad = Math.round(box * 0.14);
        const left = Math.round((dim - box) / 2);

        // A light pad behind the logo. Without it the logo sits on live modules
        // and the scanner has to recover them AND read through the artwork.
        ctx.fillStyle = opts.light ?? "#FFFFFF";
        roundRect(ctx, left - pad, left - pad, box + pad * 2, box + pad * 2, Math.round(box * 0.24));
        ctx.fill();

        ctx.save();
        roundRect(ctx, left, left, box, box, Math.round(box * 0.2));
        ctx.clip();
        ctx.drawImage(logo, left, left, box, box);
        ctx.restore();
      }
    }

    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/** Trigger a browser download for a data URL. */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename.endsWith(".png") ? filename : `${filename}.png`;
  a.click();
}

/**
 * A data URL as a `File`, for `navigator.share({ files })`.
 *
 * Returns null rather than throwing so callers can fall back to sharing the
 * link, which every platform supports, instead of failing the share outright.
 */
export function dataUrlToFile(dataUrl: string, filename: string): File | null {
  try {
    const [header, body] = dataUrl.split(",");
    const mime = /:(.*?);/.exec(header)?.[1] ?? "image/png";
    const binary = atob(body);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new File([bytes], filename, { type: mime });
  } catch {
    return null;
  }
}
