// Ditto PDF of the on-screen certificate: we snapshot the actual modal DOM to a
// PNG (so fonts, emoji, heart watermark, seal & thumbprints render EXACTLY as seen)
// and embed it as a single full-page image. Dynamically imported on download click,
// so html-to-image + @react-pdf stay out of the main bundle.

import { toPng } from "html-to-image";
import { Document, Page, Image, pdf } from "@react-pdf/renderer";

export async function downloadAgreementPdf(node: HTMLElement, token: string): Promise<void> {
  // Use layout size (transform-independent) and full scroll height so nothing is
  // cut off. scrollWidth/Height cover the entire content even if the box scrolls.
  const width = Math.ceil(node.scrollWidth || node.offsetWidth || node.getBoundingClientRect().width);
  const height = Math.ceil(node.scrollHeight || node.offsetHeight || node.getBoundingClientRect().height);

  const dataUrl = await toPng(node, {
    pixelRatio: 2.5,
    cacheBust: true,
    backgroundColor: "#fbf7ec",
    width,
    height,
    // Neutralise framer-motion's residual transform (scale/rotate) on the cloned
    // node — otherwise html-to-image renders the content shifted / misaligned —
    // and force the box fully open so every line is captured in place.
    style: {
      transform: "none",
      transformOrigin: "top left",
      maxHeight: "none",
      height: `${height}px`,
      overflow: "visible",
      margin: "0",
    },
  });

  // page sized to the snapshot's aspect ratio (px → pt) → one full page, no blank space
  const wPt = (width * 72) / 96;
  const hPt = (height * 72) / 96;

  const doc = (
    <Document title="Certificate of Forgiveness">
      <Page size={[wPt, hPt]} style={{ padding: 0 }}>
        <Image src={dataUrl} style={{ width: "100%", height: "100%", objectFit: "fill" }} />
      </Page>
    </Document>
  );

  const blob = await pdf(doc).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `love-agreement-${token}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
