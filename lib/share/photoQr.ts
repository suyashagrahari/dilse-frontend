// ─── Photo QR ────────────────────────────────────────────────────────────────
//
// A QR code made out of the sender's own photograph: you can see who is in the
// picture, and the symbol still scans.
//
// ── WHY THE OBVIOUS APPROACH FAILS ───────────────────────────────────────────
//
// The tempting implementation is to squash the whole photo into two luminance
// bands — everything in a dark module pushed dark, everything in a light module
// pushed light. It scans beautifully and it is useless, because a FACE IS MADE
// OF MID-TONES. The gradient across a cheek, the shadow under a brow, the step
// from skin to hair: that is the entire signal by which a person is recognised,
// and it lives precisely in the range that banding destroys. What comes out is
// tinted noise that is clearly *a* photo and identifiably *no one*.
//
// ── WHAT WORKS INSTEAD: SPEND MODULES, NOT PIXELS ────────────────────────────
//
// A scanner samples near the CENTRE of each module. It does not need the whole
// module, so most of the module is not contrast budget at all — it is free, and
// the earlier version was paying it for nothing. Three things follow:
//
//   1. DOTS. Each module carries its value as a hard-contrast dot at its
//      centre, sized `dotRatio`. That dot is the part the scanner reads.
//   2. GUTTERS. The rest of the module — the majority of it — is left as
//      photograph, blended only `gutterMix` of the way towards the dot's
//      value. Enough that the module's average still leans the right way for a
//      scanner that blurs; light enough that the mid-tones survive.
//   3. A CLEAR WINDOW. A rounded panel at the centre where the photo is
//      completely untouched — no dots, no tint — ringed in white so it reads as
//      a deliberate frame. This is the part that makes a face a face. It is
//      paid for out of error correction, exactly like a logo overlay.
//
// Within a dot or a gutter the colour is still MULTIPLIED towards its target
// rather than replaced, so hue survives and pixels already on the right side of
// the line are not touched at all.
//
// ── THE PHOTO IS LEVELLED FIRST ──────────────────────────────────────────────
//
// Phone photos of couples are routinely underexposed or hazy, and a picture
// whose luminance already sits in a narrow band has nothing left after the
// banding takes its cut. So the drawn image is stretched to its 2nd–98th
// percentile and given a small saturation lift before any module work. That is
// what carries an ordinary indoor snapshot.
//
// ── WHAT IS NEVER TOUCHED ────────────────────────────────────────────────────
//
// The function patterns, and the quiet zone. See `QrMatrix.functionModules` for
// why the finders and timing lines are load-bearing in a way data modules are
// not — they are rendered pure black and white even where they fall inside the
// clear window. The quiet zone is pure light because a scanner uses it to find
// the symbol's edge; letting the photo bleed into it is the single most common
// way a decorated QR fails.
//
// ── ERROR CORRECTION IS PINNED TO "high" ─────────────────────────────────────
//
// Not a default — a requirement, and more so now. Level "high" recovers 30% of
// the symbol, and this technique spends that budget deliberately: the clear
// window erases modules outright, and the gutters soften the rest.
//
// ── THE NUMBERS ARE VERIFIED, NOT GUESSED ────────────────────────────────────
//
// Every recipe below was rendered against real photographs and decoded back
// with an independent decoder, at full size and downscaled to a half and a
// quarter — because the real question is whether a phone camera across a room
// resolves it, not whether a perfect bitmap does. `soft` is as far as this can
// be pushed with every test image still round-tripping. Do not loosen a number
// here without re-running that check.

import { encodeQr } from "./qr";

/** How much the photograph is allowed to override contrast. */
export type PhotoStrength = "soft" | "balanced" | "sharp";

interface Recipe {
  /** Ceiling luminance (0–1) for a fully-committed pixel in a dark module. */
  darkMax: number;
  /** Floor luminance (0–1) for a fully-committed pixel in a light module. */
  lightMin: number;
  /** Dot diameter as a fraction of the module. The scanner reads this. */
  dotRatio: number;
  /** How far the rest of the module moves towards the dot. 0 = pure photo. */
  gutterMix: number;
  /** Clear centre panel, as a fraction of the symbol's edge. */
  window: number;
}

const RECIPES: Record<PhotoStrength, Recipe> = {
  // Most photographic: small dots, gutters almost untouched, biggest window.
  soft: { darkMax: 0.16, lightMin: 0.87, dotRatio: 0.58, gutterMix: 0.16, window: 0.32 },
  // The default. Recognisable across a room, still plainly a photograph.
  balanced: { darkMax: 0.13, lightMin: 0.89, dotRatio: 0.68, gutterMix: 0.34, window: 0.28 },
  // For busy photos, print, and bad light. Fat dots, firm gutters, small window.
  sharp: { darkMax: 0.09, lightMin: 0.93, dotRatio: 0.84, gutterMix: 0.6, window: 0.22 },
};

/** Modules of pure light around the symbol. The spec's minimum is 4. */
const QUIET_ZONE = 4;

/** White ring around the clear window, in modules. Separates panel from code. */
const WINDOW_RING = 1;

/** Corner rounding of the clear window, as a fraction of its half-edge. */
const WINDOW_RADIUS = 0.3;

/** Saturation lift applied with the levels stretch. Small on purpose. */
const SATURATION = 1.12;

/** Relative luminance, 0–1. The scanner's view of a pixel. */
const luminance = (r: number, g: number, b: number): number =>
  (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

const clamp255 = (v: number): number => (v < 0 ? 0 : v > 255 ? 255 : v);

/**
 * Signed distance to a rounded square centred on the origin — negative inside.
 *
 * Used to carve the clear window and its ring in one pass, with a sub-pixel
 * edge, rather than testing two nested rectangles and getting stair-stepping
 * on the corners.
 */
function roundedSquareSdf(dx: number, dy: number, half: number, radius: number): number {
  const qx = Math.abs(dx) - half + radius;
  const qy = Math.abs(dy) - half + radius;
  return (
    Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - radius
  );
}

// ─── Aiming the clear window at the subject ──────────────────────────────────
//
// A square crop taken from the middle of a photo is very often the wrong square.
// People do not stand in the centre of their own pictures: in a landscape shot
// they are off to one side, and in a portrait the interesting third is the
// upper one. Centre-cropping a couple under a tree gives you a window full of
// sky, which is the one outcome this whole feature exists to avoid.
//
// So the photo is PANNED under a fixed window rather than the window being
// moved over the photo. Keeping the window centred matters: it stays clear of
// the three finder patterns at the corners, and a centred panel is the only one
// that looks deliberate rather than like a mistake.
//
// The subject is found by edge energy — the sum of gradient magnitude, which is
// high on faces, hair and clothing edges and near zero on sky, walls and bokeh.
// It is not face detection and does not pretend to be; it is the cheap,
// dependency-free proxy that gets the common cases right.
//
// Two corrections, both learned from watching it get things wrong:
//
//   • Edge energy alone chases TEXTURE. A cherry tree in blossom outscores the
//     couple standing under it, and the window ends up full of branches. So
//     energy is weighted towards skin, in YCbCr rather than RGB — chrominance
//     bounds are far more stable across skin tones than an RGB rule, which
//     mostly encodes how brightly lit someone is. Flat skin gets a small
//     additive pull of its own, because a cheek is the least textured part of a
//     face and the most diagnostic.
//   • Scoring the whole window pushes the subject to its EDGE, where the frame
//     cuts through it — a head sliced by the border is worse than no head. So
//     the score is taken over a concentric inner rectangle, which pulls the
//     subject towards the middle of the window instead.
//
// When this misjudges, it misjudges softly: the window still shows part of the
// photo, and the crop is never worse than the centred one by much.

/** Long edge of the grid the subject search runs on. Detail past this is noise. */
const SALIENCY_GRID = 128;

/** Fraction of the window the score is taken over, to centre the subject in it. */
const SCORE_INSET = 0.62;

/** How strongly skin outweighs plain texture. */
const SKIN_GAIN = 2.5;

/** Pull given to flat, untextured skin, which has almost no edge energy. */
const SKIN_FLOOR = 0.14;

/** True for chrominance in the usual skin range, across a wide span of tones. */
function isSkin(r: number, g: number, b: number): boolean {
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  if (y < 40) return false; // Too dark to judge; this is shadow, not a tone.
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  return cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173;
}

interface Energy {
  /** Summed-area table, (w+1)×(h+1), so any rectangle costs four lookups. */
  table: Float64Array;
  w: number;
  h: number;
}

function edgeEnergy(image: HTMLImageElement): Energy | null {
  const k = SALIENCY_GRID / Math.max(image.width, image.height);
  const w = Math.max(8, Math.round(image.width * k));
  const h = Math.max(8, Math.round(image.height * k));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(image, 0, 0, w, h);

  const data = ctx.getImageData(0, 0, w, h).data;
  const grey = new Float64Array(w * h);
  const skin = new Float64Array(w * h);
  for (let p = 0; p < w * h; p++) {
    const i = p * 4;
    grey[p] = luminance(data[i], data[i + 1], data[i + 2]);
    skin[p] = isSkin(data[i], data[i + 1], data[i + 2]) ? 1 : 0;
  }

  const table = new Float64Array((w + 1) * (h + 1));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      let e = 0;
      if (x > 0 && x < w - 1 && y > 0 && y < h - 1) {
        e = Math.hypot(grey[p + 1] - grey[p - 1], grey[p + w] - grey[p - w]);
      }
      const v = e * (1 + SKIN_GAIN * skin[p]) + SKIN_FLOOR * skin[p];
      table[(y + 1) * (w + 1) + x + 1] =
        v + table[y * (w + 1) + x + 1] + table[(y + 1) * (w + 1) + x] - table[y * (w + 1) + x];
    }
  }
  return { table, w, h };
}

function rectEnergy(e: Energy, x0: number, y0: number, x1: number, y1: number): number {
  const ax = Math.min(Math.max(Math.floor(x0), 0), e.w);
  const ay = Math.min(Math.max(Math.floor(y0), 0), e.h);
  const bx = Math.min(Math.max(Math.ceil(x1), 0), e.w);
  const by = Math.min(Math.max(Math.ceil(y1), 0), e.h);
  if (bx <= ax || by <= ay) return 0;
  const s = e.table;
  const stride = e.w + 1;
  return (
    s[by * stride + bx] - s[ay * stride + bx] - s[by * stride + ax] + s[ay * stride + ax]
  );
}

/** How many offsets to try along an axis. Finer than a module, coarse enough to be free. */
const PAN_STEPS = 48;

/**
 * Pick the cover-fit offset that puts the busiest part of the photo in the
 * window, along one axis.
 *
 * `free` is how much the drawn image overflows the symbol on this axis; the
 * returned value is the top/left offset within the symbol, so it always lies in
 * [-free, 0]. A mild pull towards the centre breaks ties and stops a marginally
 * better score from producing a lopsided crop.
 */
function bestOffset(
  energy: Energy,
  free: number,
  inner: number,
  half: number,
  /** Canvas px → saliency-grid px. */
  toGrid: number,
  /** Fixed grid-space span of the window on the OTHER axis. */
  other: [number, number],
  axisIsX: boolean,
): number {
  if (free < 1) return -free / 2;

  let bestScore = -1;
  let best = -free / 2;

  for (let s = 0; s <= PAN_STEPS; s++) {
    const dx = -free * (s / PAN_STEPS);
    const lo = (inner / 2 - half - dx) * toGrid;
    const hi = (inner / 2 + half - dx) * toGrid;

    const score = axisIsX
      ? rectEnergy(energy, lo, other[0], hi, other[1])
      : rectEnergy(energy, other[0], lo, other[1], hi);

    // Up to a 12% penalty at the extremes of the pan.
    const bias = 1 - 0.12 * Math.abs(dx + free / 2) / (free / 2);
    const weighted = score * bias;

    if (weighted > bestScore) {
      bestScore = weighted;
      best = dx;
    }
  }
  return best;
}

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

  const recipe = RECIPES[opts.strength ?? "balanced"];

  try {
    const image = await loadImage(imageSrc);
    if (!image || !image.width || !image.height) return null;

    const extent = matrix.size + QUIET_ZONE * 2;
    // Integer module size: no module may straddle a pixel boundary, or the
    // boundary pixels average the two bands together and erase the gap.
    // Bigger than the plain code on purpose: the dots and the clear window are
    // photographic detail, and at scale 20 a dot is 13px across with visibly
    // hard edges. This buys the resolution that makes a face read.
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
    const windowHalf = (inner * recipe.window) / 2;

    // A plain cover-fit leaves the constraining axis with zero travel — a
    // square photo has no slack at all, and the subject search would be a no-op
    // on exactly the pictures people crop square before sending. So the image
    // is scaled slightly past cover: just enough that every axis can travel a
    // window's half-width, and no more, because every extra percent of zoom is
    // a percent of the photograph thrown off the edge.
    const zoom = 1 + recipe.window / 2;
    const cover = Math.max(inner / image.width, inner / image.height) * zoom;
    const drawW = image.width * cover;
    const drawH = image.height * cover;

    // Pan so the subject lands in the clear window, falling back to a centred
    // crop if the saliency pass cannot run.
    let panX = (inner - drawW) / 2;
    let panY = (inner - drawH) / 2;

    const energy = edgeEnergy(image);
    if (energy) {
      const scoreHalf = windowHalf * SCORE_INSET;
      const toGridX = energy.w / drawW;
      const toGridY = energy.h / drawH;

      const spanY: [number, number] = [
        (inner / 2 - scoreHalf - panY) * toGridY,
        (inner / 2 + scoreHalf - panY) * toGridY,
      ];
      panX = bestOffset(energy, drawW - inner, inner, scoreHalf, toGridX, spanY, true);

      const spanX: [number, number] = [
        (inner / 2 - scoreHalf - panX) * toGridX,
        (inner / 2 + scoreHalf - panX) * toGridX,
      ];
      panY = bestOffset(energy, drawH - inner, inner, scoreHalf, toGridY, spanX, false);
    }

    ctx.drawImage(image, offset + panX, offset + panY, drawW, drawH);

    const frame = ctx.getImageData(0, 0, dim, dim);
    const px = frame.data;

    // ── Levels, measured over the photo only ─────────────────────────────────
    //
    // The quiet zone is pure white and would drag the top of the histogram to
    // 255 on every image, so it is excluded. Without this the stretch does
    // nothing on a dark photo — which is exactly the photo that needs it.
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
    // A photo that is already flat across the range gets left alone rather than
    // amplified into noise.
    const spread = hi - lo;
    const gain = spread >= 40 ? 255 / spread : 1;
    const bias = spread >= 40 ? lo : 0;

    // ── Geometry of the clear window ─────────────────────────────────────────
    const centre = offset + inner / 2;
    const half = windowHalf;
    const ring = WINDOW_RING * scale;
    const radius = half * WINDOW_RADIUS;
    const dotR = (recipe.dotRatio / 2) * scale;
    // Half a pixel either side of every edge, so dots and the window frame read
    // as shapes rather than as staircases at small module sizes.
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

        // Function patterns stay pure even inside the window. On some versions
        // an alignment pattern lands in the middle of the symbol; rendering it
        // as a small marker over the photo is correct, and softening it to keep
        // the picture tidy would cost the scanner its bearings.
        if (matrix.functionModules[my][mx]) {
          const v = dark ? 0 : 255;
          px[i] = v;
          px[i + 1] = v;
          px[i + 2] = v;
          px[i + 3] = 255;
          continue;
        }

        // Levels first, so every later decision sees the corrected photo.
        const r = clamp255((px[i] - bias) * gain);
        const g = clamp255((px[i + 1] - bias) * gain);
        const b = clamp255((px[i + 2] - bias) * gain);
        const lum = luminance(r, g, b);
        const grey = lum * 255;
        const sr = clamp255(grey + (r - grey) * SATURATION);
        const sg = clamp255(grey + (g - grey) * SATURATION);
        const sb = clamp255(grey + (b - grey) * SATURATION);

        // How much of the module's value this pixel has to carry. 1 inside the
        // dot, `gutterMix` outside it, 0 anywhere in the clear window.
        const d = roundedSquareSdf(x + 0.5 - centre, y + 0.5 - centre, half, radius);

        if (d < ring) {
          // Inside the window, or on its ring.
          const inRing = Math.min(Math.max((d + feather) / (2 * feather), 0), 1);
          if (inRing > 0) {
            // Ring: white, fading in from the window edge so there is no seam.
            px[i] = Math.round(sr + (255 - sr) * inRing);
            px[i + 1] = Math.round(sg + (255 - sg) * inRing);
            px[i + 2] = Math.round(sb + (255 - sb) * inRing);
          } else {
            px[i] = Math.round(sr);
            px[i + 1] = Math.round(sg);
            px[i + 2] = Math.round(sb);
          }
          px[i + 3] = 255;
          continue;
        }

        const ux = (x % scale) + 0.5 - scale / 2;
        const uy = (y % scale) + 0.5 - scale / 2;
        const inDot = Math.min(
          Math.max((dotR - Math.hypot(ux, uy)) / (2 * feather) + 0.5, 0),
          1,
        );
        const mix = recipe.gutterMix + (1 - recipe.gutterMix) * inDot;

        // The banded value: multiplied towards its target, never replaced, and
        // never moved at all if the pixel is already on the right side.
        let br = sr;
        let bg = sg;
        let bb = sb;
        if (dark) {
          if (lum > recipe.darkMax) {
            const k = recipe.darkMax / Math.max(lum, 1e-4);
            br = sr * k;
            bg = sg * k;
            bb = sb * k;
          }
        } else if (lum < recipe.lightMin) {
          // Multiply the COMPLEMENT towards zero — the same move, towards white.
          const k = (1 - recipe.lightMin) / Math.max(1 - lum, 1e-4);
          br = 255 - (255 - sr) * k;
          bg = 255 - (255 - sg) * k;
          bb = 255 - (255 - sb) * k;
        }

        px[i] = Math.round(sr + (br - sr) * mix);
        px[i + 1] = Math.round(sg + (bg - sg) * mix);
        px[i + 2] = Math.round(sb + (bb - sb) * mix);
        px[i + 3] = 255;
      }
    }

    ctx.putImageData(frame, 0, 0);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

/**
 * Longest edge of a stored photo.
 *
 * Sized against the clear window rather than the symbol: the window is under a
 * third of the edge, so it crops a correspondingly small piece of the source,
 * and that piece is the part someone actually looks at to recognise a face.
 */
const MAX_PHOTO_EDGE = 2000;

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
