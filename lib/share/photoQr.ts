// ─── Photo QR ────────────────────────────────────────────────────────────────
//
// A QR code made out of the sender's own photograph. The picture is visible
// across the whole symbol, the SubhSandesh mark sits on a white plate in the
// middle, and — the part that matters — a phone camera reads it.
//
// ── THE MISTAKE THIS FILE IS BUILT AROUND ────────────────────────────────────
//
// The previous version put a hard dot at each module's centre and left the rest
// of the module as untouched photograph, on the reasoning that a scanner samples
// near the module centre. That reasoning is true only at high resolution. A real
// scan is a blurry 300px camera frame of a code held at arm's length, where one
// module is three or four pixels wide and the lens has already averaged the dot
// together with everything around it. What the decoder actually thresholds is
// the module's AVERAGE.
//
// And the average was wrong. A dark module sitting over bright sky came out at
// roughly 0.67 luminance — lighter than mid-grey, so it binarised as a LIGHT
// module. The symbol was corrupt in exactly the places the photo was brightest.
// It decoded in tests because the test decoder sampled centres from a perfect
// 1440px bitmap. It did not decode on a phone. Test proxies that are kinder than
// reality are worse than no test: this one produced a confident green tick on a
// feature that did not work.
//
// ── WHAT REPLACES IT: COMPRESS, DO NOT CLAMP ─────────────────────────────────
//
// Every pixel is now guaranteed to be on the correct side of mid-grey, and the
// guarantee is structural rather than conditional:
//
//   • A pixel in a DARK module is multiplied by a factor below 0.5.
//   • A pixel in a LIGHT module has its complement multiplied by the same
//     factor, which is the same move towards white.
//
// So a dark module can never exceed `gutter` (0.42 at the default) and a light
// module can never fall below `1 - gutter` (0.58). Dark is always darker than
// light, everywhere in the image, whatever the photograph is doing. Any
// threshold near the middle works, and a local adaptive threshold — which is
// what real decoders use — works better still, because within any small patch
// the two populations stay cleanly separated.
//
// Crucially this COMPRESSES the photo's tonal range rather than clamping it.
// Clamping is what flattens a face: every tone above the ceiling collapses onto
// the ceiling and the mid-tones that carry a likeness disappear. A multiply
// keeps every distinction the photograph had, just at reduced contrast, and it
// keeps hue exactly because all three channels are scaled together.
//
// ── THE DOTS ARE NOW A MARGIN, NOT THE MECHANISM ─────────────────────────────
//
// Each module is darkened further towards its centre, using a smaller factor
// over a circle. Correctness no longer depends on this — the compression above
// already guarantees it — but it pushes the two module populations much further
// apart in the average, which is the margin that survives blur, poor light and
// a camera held at an angle. It also gives the code its texture.
//
// ── THE CENTRE IS THE MARK, NOT THE PHOTO ────────────────────────────────────
//
// A white plate carrying the SubhSandesh logo, paid for out of error correction
// exactly like any logo overlay. An earlier version showed a clear window of
// untouched photograph here instead; it looked good and it was the wrong call,
// because the centre is the one place a brand mark belongs and a photo does not
// need a special window when it is already visible across the whole symbol.
//
// ── WHAT IS NEVER TOUCHED ────────────────────────────────────────────────────
//
// The function patterns, and the quiet zone. See `QrMatrix.functionModules` for
// why the finders and timing lines are load-bearing in a way data modules are
// not. The quiet zone is pure light because a scanner uses it to find the
// symbol's edge; letting the photo bleed into it is the single most common way
// a decorated QR fails.
//
// ── ERROR CORRECTION IS PINNED TO "high" ─────────────────────────────────────
//
// Not a default — a requirement. Level "high" recovers 30% of the symbol, and
// this technique spends it: the logo plate erases modules outright, and the
// photograph eats into the contrast margin everywhere else.
//
// ── HOW THE NUMBERS WERE FIXED ───────────────────────────────────────────────
//
// Rendered against real photographs, then decoded back through a deliberately
// hostile pipeline: area-averaged down to camera-sized frames, blurred, and
// only then handed to an independent decoder. That is the test that would have
// caught the last version. Do not loosen a number here without re-running it.

import { encodeQr } from "./qr";

/** How much the photograph is allowed to eat into the contrast margin. */
export type PhotoStrength = "soft" | "balanced" | "sharp";

interface Recipe {
  /**
   * Multiplier for the bulk of a module. Must stay below 0.5 — this is the
   * number that guarantees a dark module never reads lighter than a light one.
   */
  gutter: number;
  /** Multiplier at the module's centre. Lower than `gutter`; buys margin. */
  dot: number;
  /** Dot diameter as a fraction of the module. */
  dotRatio: number;
}

const RECIPES: Record<PhotoStrength, Recipe> = {
  // Most photographic. Still structurally safe; the margin is just thinner.
  soft: { gutter: 0.46, dot: 0.2, dotRatio: 0.66 },
  // The default.
  balanced: { gutter: 0.42, dot: 0.15, dotRatio: 0.74 },
  // For busy photos, print, and bad light.
  sharp: { gutter: 0.3, dot: 0.09, dotRatio: 0.88 },
};

/** Modules of pure light around the symbol. The spec's minimum is 4. */
const QUIET_ZONE = 4;

/** White plate behind the mark, as a fraction of the symbol's edge. */
const PLATE_FRACTION = 0.26;

/** The mark itself, as a fraction of the symbol's edge. */
const LOGO_FRACTION = 0.185;

/** Saturation lift applied with the levels stretch. Small on purpose. */
const SATURATION = 1.12;

/** Relative luminance, 0–1. The scanner's view of a pixel. */
const luminance = (r: number, g: number, b: number): number =>
  (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

const clamp255 = (v: number): number => (v < 0 ? 0 : v > 255 ? 255 : v);

/** Load an image, or resolve null. Never rejects — a missing logo is not fatal. */
function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
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

export interface PhotoQrOptions {
  strength?: PhotoStrength;
  /** Target edge length in pixels. Rounded down to a whole module multiple. */
  size?: number;
  /** Same-origin mark for the centre plate. Cross-origin would taint the canvas. */
  logoSrc?: string;
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

  const recipe = RECIPES[opts.strength ?? "balanced"];

  try {
    const image = await loadImage(imageSrc);
    if (!image || !image.width || !image.height) return null;

    const extent = matrix.size + QUIET_ZONE * 2;
    // Integer module size: no module may straddle a pixel boundary, or the
    // boundary pixels average the two bands together and blunt the edge the
    // scanner is looking for.
    const scale = Math.max(2, Math.floor((opts.size ?? 1440) / extent));
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

    // ── Levels, measured over the photo only ─────────────────────────────────
    //
    // Phone photos of couples are routinely underexposed or hazy, and a picture
    // whose tones already sit in a narrow band has very little left once the
    // compression below halves its range. The quiet zone is pure white and
    // would peg the top of every histogram, so it is excluded — without that
    // the stretch does nothing on a dark photo, which is the photo that needs
    // it most.
    const hist = new Uint32Array(256);
    for (let y = offset; y < offset + inner; y++) {
      for (let x = offset; x < offset + inner; x++) {
        const i = (y * dim + x) * 4;
        hist[Math.round(luminance(px[i], px[i + 1], px[i + 2]) * 255)]++;
      }
    }
    const total = inner * inner;
    let lo = 0;
    let hi = 255;
    for (let v = 0, seen = 0; v < 256; v++) {
      seen += hist[v];
      if (seen >= total * 0.02) {
        lo = v;
        break;
      }
    }
    for (let v = 255, seen = 0; v >= 0; v--) {
      seen += hist[v];
      if (seen >= total * 0.02) {
        hi = v;
        break;
      }
    }
    // A photo already spread across the range is left alone rather than
    // amplified into noise.
    const spread = hi - lo;
    const gain = spread >= 40 ? 255 / spread : 1;
    const bias = spread >= 40 ? lo : 0;

    const dotR = (recipe.dotRatio / 2) * scale;
    // Half a pixel either side of the dot edge, so it reads as a shape rather
    // than a staircase at small module sizes.
    const feather = 0.75;

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

        // Function patterns stay pure black and white. A scanner locates and
        // orients the symbol from these before it reads a single data module;
        // tinting them to keep the picture tidy costs it its bearings.
        if (matrix.functionModules[my][mx]) {
          const v = dark ? 0 : 255;
          px[i] = v;
          px[i + 1] = v;
          px[i + 2] = v;
          px[i + 3] = 255;
          continue;
        }

        // Levels and saturation first, so the compression sees a corrected photo.
        const r = clamp255((px[i] - bias) * gain);
        const g = clamp255((px[i + 1] - bias) * gain);
        const b = clamp255((px[i + 2] - bias) * gain);
        const grey = luminance(r, g, b) * 255;
        const sr = clamp255(grey + (r - grey) * SATURATION);
        const sg = clamp255(grey + (g - grey) * SATURATION);
        const sb = clamp255(grey + (b - grey) * SATURATION);

        // One factor per pixel, easing from `gutter` at the module's edge to
        // `dot` at its centre.
        const ux = (x % scale) + 0.5 - scale / 2;
        const uy = (y % scale) + 0.5 - scale / 2;
        const inDot = Math.min(
          Math.max((dotR - Math.hypot(ux, uy)) / (2 * feather) + 0.5, 0),
          1,
        );
        const f = recipe.gutter + (recipe.dot - recipe.gutter) * inDot;

        if (dark) {
          // Towards black. Hue survives because all three channels share `f`.
          px[i] = Math.round(sr * f);
          px[i + 1] = Math.round(sg * f);
          px[i + 2] = Math.round(sb * f);
        } else {
          // The complement towards zero — the same move, towards white.
          px[i] = Math.round(255 - (255 - sr) * f);
          px[i + 1] = Math.round(255 - (255 - sg) * f);
          px[i + 2] = Math.round(255 - (255 - sb) * f);
        }
        px[i + 3] = 255;
      }
    }

    ctx.putImageData(frame, 0, 0);

    // ── The mark ─────────────────────────────────────────────────────────────
    //
    // Drawn after the pixel pass rather than inside it, so the plate keeps the
    // canvas's own antialiasing on its corners instead of being carved out of
    // the module loop a pixel at a time.
    if (opts.logoSrc) {
      const logo = await loadImage(opts.logoSrc);
      if (logo) {
        const plate = Math.round(inner * PLATE_FRACTION);
        const box = Math.round(inner * LOGO_FRACTION);
        const plateLeft = Math.round((dim - plate) / 2);
        const boxLeft = Math.round((dim - box) / 2);

        ctx.fillStyle = "#FFFFFF";
        roundRect(ctx, plateLeft, plateLeft, plate, plate, Math.round(plate * 0.24));
        ctx.fill();

        ctx.save();
        roundRect(ctx, boxLeft, boxLeft, box, box, Math.round(box * 0.2));
        ctx.clip();
        ctx.drawImage(logo, boxLeft, boxLeft, box, box);
        ctx.restore();
      }
    }

    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

/**
 * Longest edge of a stored photo.
 *
 * The symbol is around 1400px and the photo is cover-fit across it, so more
 * than this buys no visible detail and costs memory on a phone.
 */
const MAX_PHOTO_EDGE = 1600;

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
