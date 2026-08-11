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
import { loadLogoMetrics, qrLogoBox } from "./qrLogo";

/** Modules of white margin around the symbol. The spec's minimum is 4. */
const QUIET_ZONE = 4;

export interface QrPngOptions {
  /** Target width/height in pixels. Rounded down to a whole module multiple. */
  size?: number;
  ecLevel?: EcLevel;
  dark?: string;
  light?: string;
  /** Same-origin image drawn in the centre. Cross-origin would taint the canvas. */
  logoSrc?: string;
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
      const metrics = await loadLogoMetrics(opts.logoSrc);
      if (metrics) {
        // The ARTWORK's proportions, measured rather than assumed, and its
        // margins trimmed off. Forcing the raw file into a square box was
        // squeezing it to 57% of its width, which is what made the mark on a
        // saved PNG and a printed card look tall and thin. See `qrLogo.ts`.
        const { image: logo, content } = metrics;
        const box = qrLogoBox(matrix.size, extent, metrics.aspect);
        const px = (v: number) => Math.round(v * scale);

        // A light plate behind the logo. Without it the logo sits on live
        // modules and the scanner has to recover them AND read through artwork.
        ctx.fillStyle = opts.light ?? "#FFFFFF";
        roundRect(
          ctx,
          px(box.plate.x),
          px(box.plate.y),
          px(box.plate.w),
          px(box.plate.h),
          px(box.plate.r),
        );
        ctx.fill();

        ctx.save();
        roundRect(ctx, px(box.x), px(box.y), px(box.w), px(box.h), px(box.r));
        ctx.clip();
        // Source rect = the artwork only, so the file's empty margin is not
        // paid for out of the occlusion budget.
        ctx.drawImage(
          logo,
          content.x,
          content.y,
          content.w,
          content.h,
          px(box.x),
          px(box.y),
          px(box.w),
          px(box.h),
        );
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
