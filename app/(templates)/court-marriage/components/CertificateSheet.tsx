"use client";

// ─── The official copy ───────────────────────────────────────────────────────
//
// The typewritten registry paper (./Certificate) is the keepsake: a fixed
// 432×576 document, scaled to its column and never reflowed, exported to a
// 1080×1440 PNG. The portrait is the sender's first photo (or, on pages made
// before photos existed, their single joint photograph).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Download, Loader2 } from "lucide-react";

import { CandyButton, GROTESK } from "../../_love/LoveKit";
import { V } from "../../_love/theme";
import Certificate, { DOC_H, DOC_W } from "./Certificate";
import { type CertificateData, fileSlug, portraitOf } from "./types";

/**
 * Cross-origin images are blanked by the canvas that `html-to-image` draws into.
 * Anything already inline (data:) or same-origin (/…) is fine; a remote URL is
 * pulled through fetch and re-encoded before the capture runs.
 */
async function toSafeSrc(src: string | null): Promise<string | null> {
  if (!src) return null;
  if (src.startsWith("data:") || src.startsWith("/")) return src;
  try {
    const res = await fetch(src, { mode: "cors" });
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result));
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });
  } catch {
    // Better a certificate with an empty photo frame than a half-broken export.
    return null;
  }
}

export default function CertificateSheet({ data }: { data: CertificateData }) {
  const paperData: CertificateData = useMemo(() => ({ ...data, photoUrl: portraitOf(data) }), [data]);
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.8);
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);
  const [exportData, setExportData] = useState<CertificateData | null>(null);

  // Fit the fixed-size document to the sheet's width (and a phone's height).
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => {
      const byW = el.clientWidth / DOC_W;
      const byH = (window.innerHeight * 0.62) / DOC_H;
      setScale(Math.max(0.5, Math.min(byW, byH, 1.25)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const download = useCallback(async () => {
    if (downloading) return;
    setDownloading(true);
    setFailed(false);
    try {
      const safePhoto = await toSafeSrc(paperData.photoUrl);
      setExportData({ ...paperData, photoUrl: safePhoto });
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      // Without this Tinos/Courier Prime may not have resolved when the DOM is
      // serialised and the PNG comes back in fallback faces.
      if (document.fonts?.ready) await document.fonts.ready;
      const node = document.getElementById("cm-export-node");
      if (!node) throw new Error("export node missing");
      const { toPng } = await import("html-to-image");
      const url = await toPng(node, { pixelRatio: 3, canvasWidth: 360, canvasHeight: 480, backgroundColor: "#faf6ed", cacheBust: true });
      const a = document.createElement("a");
      a.href = url;
      a.download = `court-marriage-${fileSlug(data.partyA.name)}-${fileSlug(data.partyB.name)}.png`;
      a.click();
      setDone(true);
      window.setTimeout(() => setDone(false), 2200);
    } catch {
      setFailed(true);
    } finally {
      setExportData(null);
      setDownloading(false);
    }
  }, [downloading, paperData, data.partyA.name, data.partyB.name]);

  return (
    <div>
      <div ref={boxRef} style={{ width: "100%", maxWidth: DOC_W * 1.25, margin: "0 auto" }}>
        <div style={{ width: DOC_W * scale, height: DOC_H * scale, margin: "0 auto", position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: DOC_W,
              height: DOC_H,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              boxShadow: "0 24px 50px -22px rgba(0,0,0,.55), 0 2px 6px rgba(0,0,0,.14)",
            }}
          >
            <Certificate data={paperData} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <CandyButton onClick={() => void download()} disabled={downloading} style={{ width: "auto", minWidth: 250 }}>
          {downloading ? (
            <>
              <Loader2 size={17} className="animate-spin" /> preparing PNG…
            </>
          ) : done ? (
            <>
              <Check size={17} /> saved to your phone
            </>
          ) : (
            <>
              <Download size={17} /> save the certificate
            </>
          )}
        </CandyButton>
        <p role="status" aria-live="polite" style={{ margin: 0, minHeight: 16, fontFamily: GROTESK, fontSize: 12.5, color: V.soft, textAlign: "center" }}>
          {failed ? "Couldn't make the picture — try again, or screenshot it 📸" : "Not valid for legal, tax or visa purposes. Valid for everything that matters."}
        </p>
      </div>

      {/* Off-screen capture copy: identical node, unscaled, photo made CORS-safe. */}
      {exportData && (
        <div style={{ position: "fixed", left: -100000, top: 0, pointerEvents: "none" }} aria-hidden>
          <div id="cm-export-node">
            <Certificate data={exportData} />
          </div>
        </div>
      )}
    </div>
  );
}
