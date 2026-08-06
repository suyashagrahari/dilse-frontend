// ─── PNG export ──────────────────────────────────────────────────────────────
//
// One implementation of the download, because every template needs it and each
// of the failure modes below has already cost us a silently-wrong export once.
//
// The four traps, all handled here:
//
// 1. FONTS. `html-to-image` snapshots whatever is painted. If a webfont has not
//    finished loading, the clone renders in the fallback face and the PNG looks
//    nothing like the screen. `await document.fonts.ready` first, always. (This
//    is also why the document faces are registered with `display:"swap"` and
//    not `"optional"` — "optional" is allowed to decline the face outright.)
//
// 2. SCALE. Our documents render at a fixed pixel width inside a wrapper
//    carrying `transform: scale()` to fit the viewport. html-to-image copies
//    computed style, so the clone keeps that scale and you get a shrunken
//    artifact in the corner of a correctly-sized canvas. Neutralising the
//    transform during capture is what `width`/`height` + `style.transform`
//    below are for.
//
// 3. CORS. A cross-origin <img> taints the canvas and the whole export throws.
//    Anything inside the captured node must be same-origin — route remote
//    images through next/image (`/_next/image` is same-origin) or inline them
//    as a data URL. See `toDataUrl` at the bottom.
//
// 4. VIDEO. A <video> inside the captured node serialises as a blank box.
//    Keep animated media OUTSIDE the node you pass here.

export interface ExportPngOptions {
  /** Logical CSS pixel size of the artifact, BEFORE any fit-to-viewport scale. */
  width: number;
  height: number;
  /** Download filename, with or without the .png suffix. */
  filename: string;
  /** Painted behind the artifact. Needed for anything with transparency. */
  backgroundColor?: string;
  /** Device-pixel multiplier. 3 gives a crisp result on phone screens. */
  pixelRatio?: number;
}

export interface ExportPngResult {
  ok: boolean;
  /** Human-readable, safe to show in a toast. */
  message: string;
}

/**
 * Capture `node` and trigger a download. Never throws — returns a result you
 * can surface directly, because a failed export should degrade to "take a
 * screenshot instead", not to a broken page.
 */
export async function exportNodeToPng(
  node: HTMLElement | null,
  opts: ExportPngOptions,
): Promise<ExportPngResult> {
  if (!node) return { ok: false, message: "Nothing to save yet" };

  try {
    // Trap 1 — never capture before the faces are in.
    await document.fonts.ready;

    const { toPng } = await import("html-to-image");
    const url = await toPng(node, {
      pixelRatio: opts.pixelRatio ?? 3,
      cacheBust: true,
      backgroundColor: opts.backgroundColor,
      width: opts.width,
      height: opts.height,
      style: {
        // Trap 2 — capture at true layout size; the on-screen scale is
        // presentation only and must not reach the canvas.
        transform: "none",
        transformOrigin: "top left",
      },
    });

    const a = document.createElement("a");
    a.href = url;
    a.download = opts.filename.endsWith(".png") ? opts.filename : `${opts.filename}.png`;
    a.click();
    return { ok: true, message: "Saved to your downloads" };
  } catch {
    return { ok: false, message: "Couldn't save — try a screenshot instead" };
  }
}

/** Filename-safe slug. `"Ananya Iyer"` → `"ananya-iyer"`. */
export const fileSlug = (s: string, fallback = "subhsandesh"): string =>
  (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || fallback;

/**
 * Fetch a remote image and return it as a data URL, so it can live inside an
 * exported node without tainting the canvas (Trap 3).
 *
 * Returns null on any failure — callers should fall back to a placeholder
 * rather than rendering a broken image.
 */
export async function toDataUrl(src: string): Promise<string | null> {
  if (!src) return null;
  if (src.startsWith("data:")) return src;
  try {
    const res = await fetch(src, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}
