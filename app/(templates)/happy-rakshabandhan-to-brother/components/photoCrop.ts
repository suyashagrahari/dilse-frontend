// ─── Square crop maths ───────────────────────────────────────────────────────
//
// Pure functions, deliberately separated from the component that draws them,
// because the preview and the file that actually gets uploaded MUST agree. The
// adjuster renders its preview by calling `sourceRect` and drawing that rect;
// the bake calls the same function with the same state and draws the same rect
// into a bigger canvas. There is no second implementation to drift.
//
// ── WHY THE CROP IS BAKED AND NOT STORED ────────────────────────────────────
//
// The alternative is to upload the original and save { url, zoom, posX, posY },
// rendering it with `object-position` + `transform: scale()` at every consumer.
// That was considered and rejected here:
//
//   • `photoUrl` is a 600-character STRING server-side. Storing a crop would
//     mean changing the Mongo schema and its validation — a second repo and a
//     second deploy for what is a client-side concern.
//   • The story card is exported to a 1080×1920 PNG by `html-to-image`, which
//     rasterises the DOM. Any crop expressed as CSS has to be reproduced there
//     exactly, and `transform` + `object-position` inside a scaled export node
//     is precisely where that goes wrong.
//   • Every consumer — cover, story card, polaroid grid — would need the crop
//     maths. Baked, they all just use `object-fit: cover` on an image that is
//     already square and already correct.
//
// The cost is that re-adjusting after a reload means picking the file again.
// Within a session the original bitmap is still held, so re-adjusting is free.
//
// ── EXIF ORIENTATION ────────────────────────────────────────────────────────
//
// Phone photographs carry a rotation flag rather than rotated pixels. Callers
// hand us an `ImageBitmap` decoded with `imageOrientation: "from-image"`, so
// the bitmap's own width/height are already the upright ones and nothing here
// needs to know about EXIF. Measuring from an `<img>` while drawing from a
// differently-oriented source is the classic way to ship a crop that is correct
// on desktop and rotated on an iPhone.

/** What the sender has done to the photo. The whole adjustable state. */
export interface CropState {
  /** 1 = the photo exactly fills the square. Above that it is zoomed in. */
  zoom: number;
  /**
   * Where the image sits, in VIEWPORT pixels, as the offset of the image's
   * top-left corner from the square's top-left corner. Always ≤ 0 once
   * clamped — a positive value would mean an uncovered edge.
   */
  offsetX: number;
  offsetY: number;
}

export const ZOOM_MIN = 1;
export const ZOOM_MAX = 4;

export const INITIAL_CROP: CropState = { zoom: 1, offsetX: 0, offsetY: 0 };

/**
 * The scale at which the image exactly covers a `viewport`-sized square.
 *
 * `max` of the two ratios, not `min`: `min` would fit the whole photo inside
 * the square and leave bars down two sides, which is `contain`. A square crop
 * of a rectangular photo is inherently lossy and the sender chooses what to
 * lose by panning — that is the entire point of the adjuster.
 */
export function coverScale(imageW: number, imageH: number, viewport: number): number {
  if (imageW <= 0 || imageH <= 0) return 1;
  return Math.max(viewport / imageW, viewport / imageH);
}

/**
 * Clamp an offset so the square is never allowed to show past the image edge.
 *
 * Without this a drag can be flung past the edge and the bake reads pixels
 * outside the source, which `drawImage` renders as transparent — a photo with a
 * blank strip down one side, and the sender's own drag put it there.
 */
export function clampOffset(
  state: CropState,
  imageW: number,
  imageH: number,
  viewport: number
): CropState {
  const total = coverScale(imageW, imageH, viewport) * state.zoom;
  const drawnW = imageW * total;
  const drawnH = imageH * total;

  // `Math.min(0, …)` guards the degenerate case where rounding leaves the drawn
  // size a hair under the viewport: the range collapses and the only legal
  // offset is 0 rather than a small positive number.
  const minX = Math.min(0, viewport - drawnW);
  const minY = Math.min(0, viewport - drawnH);

  return {
    zoom: Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, state.zoom)),
    offsetX: Math.min(0, Math.max(minX, state.offsetX)),
    offsetY: Math.min(0, Math.max(minY, state.offsetY)),
  };
}

/** How far the image can travel on each axis at the current zoom, in px. */
export function offsetRange(
  state: CropState,
  imageW: number,
  imageH: number,
  viewport: number
): { x: number; y: number } {
  const total = coverScale(imageW, imageH, viewport) * state.zoom;
  return {
    x: Math.max(0, imageW * total - viewport),
    y: Math.max(0, imageH * total - viewport),
  };
}

/**
 * The rectangle of SOURCE pixels the square is currently showing.
 *
 * This is the one function that defines the crop. Both the preview and the
 * bake draw exactly this rect, which is why they cannot disagree.
 */
export function sourceRect(
  state: CropState,
  imageW: number,
  imageH: number,
  viewport: number
): { sx: number; sy: number; size: number } {
  const total = coverScale(imageW, imageH, viewport) * state.zoom;
  const size = viewport / total;
  return {
    sx: -state.offsetX / total,
    sy: -state.offsetY / total,
    size,
  };
}

/**
 * Re-centre a zoom on the middle of the square rather than the image's corner.
 *
 * Zooming by scaling around the top-left makes the subject shoot off toward the
 * bottom-right, so every zoom control routes through here: the point currently
 * at the centre of the square stays at the centre.
 */
export function zoomAround(
  state: CropState,
  nextZoom: number,
  viewport: number,
  focus: { x: number; y: number } = { x: viewport / 2, y: viewport / 2 }
): CropState {
  const clamped = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, nextZoom));
  const ratio = clamped / state.zoom;
  return {
    zoom: clamped,
    // The image point under `focus` before the zoom must stay under it after.
    offsetX: focus.x - (focus.x - state.offsetX) * ratio,
    offsetY: focus.y - (focus.y - state.offsetY) * ratio,
  };
}

/**
 * The chosen square, as a file ready to upload.
 *
 * `out` is the edge of the output square in pixels. 1080 for the hero photo
 * (it is also the story-card image, which exports at 1080 wide) and 720 for a
 * polaroid in the memories grid, which is never shown larger than ~300.
 *
 * WebP with a JPEG fallback: WebP is ~30% smaller at the same quality and is
 * what the server re-encodes to anyway, but `toBlob` silently hands back a PNG
 * when a browser does not support the requested type, and a 1080² PNG of a
 * photograph is several megabytes. So the result type is checked rather than
 * assumed.
 */
export async function bakeSquare(
  bitmap: ImageBitmap,
  state: CropState,
  viewport: number,
  out: number
): Promise<File> {
  const canvas = document.createElement("canvas");
  canvas.width = out;
  canvas.height = out;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");

  // Upscaling a small crop is inevitable when someone zooms into a low-res
  // photo; smoothing at least keeps it soft rather than blocky.
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const { sx, sy, size } = sourceRect(state, bitmap.width, bitmap.height, viewport);
  ctx.drawImage(bitmap, sx, sy, size, size, 0, 0, out, out);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/webp", 0.86);
  });

  if (blob && blob.type === "image/webp") {
    return new File([blob], "photo.webp", { type: "image/webp" });
  }

  const jpeg = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9);
  });
  if (!jpeg) throw new Error("could not encode the crop");
  return new File([jpeg], "photo.jpg", { type: "image/jpeg" });
}

/**
 * Decode a picked file into an upright bitmap.
 *
 * Returns null for anything that is not a decodable image — a `.heic` Safari
 * will not decode, a renamed text file, a truncated download. The caller turns
 * that into a sentence; nothing here throws.
 */
export async function decodeUpright(file: File): Promise<ImageBitmap | null> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return null;
  }
}
