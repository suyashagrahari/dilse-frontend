// ─── Centre-logo geometry, shared by both QR renderers ───────────────────────
//
// The logo in the middle of a QR is drawn twice from two different technologies:
// `QrBlock.tsx` places it in an SVG for the screen, and `qrPng.ts` draws it on a
// canvas for the download and the printed card. They must agree, and until now
// they did not — each was wrong in its own direction:
//
//   canvas  drawImage(logo, x, y, box, box) with a square box, which SQUASHED a
//           1280×732 logo to 57% of its width. That is the "too tall and too
//           narrow" the sender sees on a saved PNG and a printed card.
//   svg     preserveAspectRatio="xMidYMid slice", which CROPPED the same logo to
//           its middle square and threw away both ends of the wordmark.
//
// So neither surface showed the mark correctly and the two did not even match
// each other, which meant the on-screen preview was not evidence about the file
// that came out. This module is the single answer both of them now ask.
//
// ── THE BUDGET IS AREA, NOT WIDTH ────────────────────────────────────────────
//
// What a scanner cares about is how many modules are covered, and that is an
// AREA. The old square was 0.22 of the symbol on each side — 4.84% of it — and
// error correction "high" recovers 30%, which is the headroom that lets the code
// survive a crease or a bad angle on top of the occlusion.
//
// So the fix is not "make the box wider". It is: hold that 4.84% fixed and spend
// it at the logo's own proportions. A wide mark gets a wide, shorter plate
// covering exactly as many modules as the square did. Nothing about the error
// budget changes, and a square logo comes out at 0.22 × 0.22 — identical to the
// old behaviour, which is the property that makes this safe to swap in.
//
// `MAX_WIDTH` is the one guard: an extremely wide mark would otherwise stretch
// toward the timing patterns. Hitting the clamp REDUCES the covered area, so the
// clamp can only ever be safer than the budget, never worse.
//
// ── THE ASPECT IS THE ARTWORK'S, NOT THE FILE'S ──────────────────────────────
//
// `logo.webp` is a 1280×732 file holding 718×571 of actual mark — 44% of its
// width and 22% of its height is empty margin baked into the asset. Sizing the
// plate to the FILE therefore spends the whole occlusion budget on whitespace
// and draws a mark barely half as wide as it could be, which is the other half
// of "the logo is too small and too narrow" — fixing the squash alone does not
// answer it.
//
// So the file is measured once and trimmed to its ink. Everything downstream
// works in terms of the trimmed box: the plate takes the artwork's proportions
// and the mark fills it edge to edge, roughly 1.8× larger in exactly the same
// covered area. Nothing about the error-correction budget moves.
//
// The trim is measured, never hardcoded, so replacing the asset with one cropped
// differently needs no change here. A fully blank or unreadable image falls back
// to the whole frame, which is the old behaviour.

/**
 * Share of the symbol's area the logo may occlude.
 *
 * 0.22² — the exact area of the square box this replaces. Do not raise it: the
 * failures it buys do not show up on a screen, only on paper.
 */
const LOGO_AREA = 0.22 * 0.22;

/** Hard ceiling on width, as a fraction of the symbol. Clamping only ever helps. */
const MAX_WIDTH = 0.32;

/** Padding around the logo, as a share of its shorter side. */
const PAD_RATIO = 0.14;

/**
 * A pixel is "ink" if any channel is below this, or it is meaningfully opaque
 * over a light ground. Deliberately generous: over-trimming would clip the mark,
 * while under-trimming only costs a little size.
 */
const INK_LEVEL = 235;

export interface LogoMetrics {
  image: HTMLImageElement;
  /** The artwork's box within the file, in source pixels. */
  content: { x: number; y: number; w: number; h: number };
  /** The artwork's aspect — content width ÷ content height. */
  aspect: number;
}

const metricsCache = new Map<string, Promise<LogoMetrics | null>>();

/**
 * Load a logo and find its artwork inside the file. Cached per src, so the scan
 * happens once per session however many codes are drawn.
 *
 * Never rejects: a logo that will not load or cannot be inspected is not a
 * reason to fail a QR code.
 */
export function loadLogoMetrics(src: string): Promise<LogoMetrics | null> {
  const hit = metricsCache.get(src);
  if (hit) return hit;

  const pending = new Promise<LogoMetrics | null>((resolve) => {
    const img = new Image();
    img.onerror = () => resolve(null);
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      if (!w || !h) {
        resolve(null);
        return;
      }
      const whole = { x: 0, y: 0, w, h };
      try {
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          resolve({ image: img, content: whole, aspect: w / h });
          return;
        }
        // On white, so a transparent margin and a white margin trim alike.
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0);
        const { data } = ctx.getImageData(0, 0, w, h);

        let x0 = w;
        let y0 = h;
        let x1 = -1;
        let y1 = -1;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            if (data[i] < INK_LEVEL || data[i + 1] < INK_LEVEL || data[i + 2] < INK_LEVEL) {
              if (x < x0) x0 = x;
              if (x > x1) x1 = x;
              if (y < y0) y0 = y;
              if (y > y1) y1 = y;
            }
          }
        }
        // A blank image finds nothing. Use the frame rather than an empty box.
        const content = x1 < x0 || y1 < y0 ? whole : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
        resolve({ image: img, content, aspect: content.w / content.h });
      } catch {
        // A tainted canvas — only reachable if someone points this at a
        // cross-origin logo, which the callers are documented not to do.
        resolve({ image: img, content: whole, aspect: w / h });
      }
    };
    img.src = src;
  });

  metricsCache.set(src, pending);
  return pending;
}

export interface QrLogoBox {
  /** Logo width in module units. */
  w: number;
  /** Logo height in module units. */
  h: number;
  /** Logo left edge in module units, quiet zone included. */
  x: number;
  /** Logo top edge in module units, quiet zone included. */
  y: number;
  /** The white plate behind it, already padded. */
  plate: { x: number; y: number; w: number; h: number; r: number };
  /** Corner radius for the logo itself. */
  r: number;
}

/**
 * Where the centre logo goes, in module units.
 *
 * @param modules  the symbol's side in modules, excluding the quiet zone
 * @param extent   the full drawing's side in modules, quiet zone included
 * @param aspect   the logo's natural width ÷ height
 */
export function qrLogoBox(modules: number, extent: number, aspect: number): QrLogoBox {
  // A zero, negative or non-finite aspect means the image never reported a size.
  // Fall back to a square, which is the shape this code used to assume anyway.
  const a = Number.isFinite(aspect) && aspect > 0 ? aspect : 1;

  let h = Math.sqrt(LOGO_AREA / a) * modules;
  let w = h * a;

  const maxW = MAX_WIDTH * modules;
  if (w > maxW) {
    w = maxW;
    h = w / a;
  }

  const pad = Math.min(w, h) * PAD_RATIO;
  const x = (extent - w) / 2;
  const y = (extent - h) / 2;

  return {
    w,
    h,
    x,
    y,
    plate: {
      x: x - pad,
      y: y - pad,
      w: w + pad * 2,
      h: h + pad * 2,
      r: Math.min(w, h) * 0.24,
    },
    r: Math.min(w, h) * 0.2,
  };
}
