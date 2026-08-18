// PNG export for the legal notice.
//
// Snapshots the real document DOM rather than redrawing it, so whatever the
// addressee did — ink ticks, strikethroughs, margin stamps, the FINAL NOTICE
// overprint — is in the file. html-to-image is heavy, so this module is
// dynamically imported on first click and stays out of the main bundle.

const PAPER = "#fdfcf8";

/**
 * Without this the three self-hosted faces (Tinos, Courier Prime) have not
 * necessarily been rasterised when the clone is measured, and the export silently
 * falls back to system serif/monospace — an image that looks nothing like the
 * screen. This one await is the difference.
 */
async function waitForFonts(): Promise<void> {
  try {
    if (typeof document !== "undefined" && "fonts" in document) {
      await document.fonts.ready;
    }
  } catch {
    /* Font Loading API unavailable — proceed rather than block the download. */
  }
}

export async function downloadNoticePng(node: HTMLElement, refNo: string): Promise<void> {
  await waitForFonts();
  const { toPng } = await import("html-to-image");

  const width = Math.ceil(node.scrollWidth || node.offsetWidth);
  const height = Math.ceil(node.scrollHeight || node.offsetHeight);

  const dataUrl = await toPng(node, {
    pixelRatio: 3,
    cacheBust: true,
    backgroundColor: PAPER,
    width,
    height,
    style: {
      // The node is rendered inside a `transform: scale()` wrapper; the clone
      // must be captured at its true layout size, unscaled and unclipped.
      transform: "none",
      transformOrigin: "top left",
      margin: "0",
      maxHeight: "none",
      height: `${height}px`,
      overflow: "visible",
    },
  });

  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `legal-notice-${(refNo || "notice").replace(/\W+/g, "-")}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
