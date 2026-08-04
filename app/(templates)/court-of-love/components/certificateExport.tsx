// Certificate export: PNG (share + download) and PDF (certified copy).
//
// We snapshot the real certificate DOM rather than redrawing it, so the exported
// image matches what the winner saw — same parchment gradients, same wax seal,
// same handwritten signature. html-to-image and @react-pdf are heavy, so this
// whole module is dynamically imported on first click and stays out of the main
// bundle.

import { toPng } from "html-to-image";

const PAPER_BG = "#F6EFDF";

/** Measure the node at layout size and neutralise framer-motion transforms. */
async function snapshot(node: HTMLElement): Promise<{ dataUrl: string; width: number; height: number }> {
  const width = Math.ceil(node.scrollWidth || node.offsetWidth || node.getBoundingClientRect().width);
  const height = Math.ceil(node.scrollHeight || node.offsetHeight || node.getBoundingClientRect().height);

  const dataUrl = await toPng(node, {
    pixelRatio: 3, // crisp enough for an Instagram Story crop
    cacheBust: true,
    backgroundColor: PAPER_BG,
    width,
    height,
    // The certificate animates in with a scale/rotate; without this the clone
    // renders shifted and clipped.
    style: {
      transform: "none",
      transformOrigin: "top left",
      maxHeight: "none",
      height: `${height}px`,
      overflow: "visible",
      margin: "0",
    },
  });

  return { dataUrl, width, height };
}

function triggerDownload(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => (await fetch(dataUrl)).blob();

/** Download the certificate as a PNG. */
export async function downloadCertificatePng(node: HTMLElement, caseNo: string): Promise<void> {
  const { dataUrl } = await snapshot(node);
  triggerDownload(dataUrl, `court-of-love-${caseNo.replace(/\W+/g, "-")}.png`);
}

/** Download the certificate as a single-page PDF sized to the snapshot. */
export async function downloadCertificatePdf(node: HTMLElement, caseNo: string): Promise<void> {
  const { dataUrl, width, height } = await snapshot(node);
  const { Document, Page, Image, pdf } = await import("@react-pdf/renderer");

  // px → pt so the page is exactly the certificate's aspect ratio: no margins,
  // no second blank page.
  const wPt = (width * 72) / 96;
  const hPt = (height * 72) / 96;

  const doc = (
    <Document title={`Court of Love — ${caseNo}`}>
      <Page size={[wPt, hPt]} style={{ padding: 0 }}>
        {/* @react-pdf's Image, not next/image or an <img> — it takes no alt prop. */}
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={dataUrl} style={{ width: "100%", height: "100%", objectFit: "fill" }} />
      </Page>
    </Document>
  );

  const blob = await pdf(doc).toBlob();
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `court-of-love-${caseNo.replace(/\W+/g, "-")}.pdf`);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export type ShareResult = "shared" | "downloaded" | "cancelled";

/**
 * Share the certificate image through the OS share tray (Instagram Stories,
 * WhatsApp, ...). Falls back to a PNG download wherever file sharing isn't
 * available — notably desktop browsers and iOS Safari before 15.
 *
 * Returns what actually happened so the caller can show honest feedback rather
 * than claiming "Shared!" when the user dismissed the tray.
 */
export async function shareCertificatePng(
  node: HTMLElement,
  caseNo: string,
  shareUrl?: string | null,
): Promise<ShareResult> {
  const { dataUrl } = await snapshot(node);
  const filename = `court-of-love-${caseNo.replace(/\W+/g, "-")}.png`;

  try {
    const blob = await dataUrlToBlob(dataUrl);
    const file = new File([blob], filename, { type: "image/png" });

    // canShare({files}) is the only reliable capability check — plenty of
    // browsers expose navigator.share but reject file payloads.
    if (typeof navigator !== "undefined" && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "I won the case 💗",
        text: "The Court of Love has ruled in my favour ⚖️",
        ...(shareUrl ? { url: shareUrl } : {}),
      });
      return "shared";
    }
  } catch (err) {
    // AbortError means the user closed the tray on purpose — not a failure, and
    // it must not silently turn into a download they didn't ask for.
    if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
  }

  triggerDownload(dataUrl, filename);
  return "downloaded";
}
