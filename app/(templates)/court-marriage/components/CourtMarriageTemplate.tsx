"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Download, Loader2, Check } from "lucide-react";
import Certificate, { DOC_H, DOC_W } from "./Certificate";
import { type CertificateData, fileSlug } from "./types";
import { templateMediaBase } from "@/lib/templateMedia";

/** Animation set for this template — served from S3, never bundled. */
const ASSET = templateMediaBase("court-marriage");

/** Honour the OS setting — every looping asset on this template is decorative. */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/**
 * Fixed-size document, scaled — never reflowed. The certificate is always
 * 432×576 CSS px; only the transform changes between a 380px phone and a 1440px
 * desktop, so a screenshot is the same document at every viewport.
 */
function ScaledDocument({ children }: { children: React.ReactNode }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const calc = () => {
      const w = Math.min(window.innerWidth - 20, 640);
      const h = window.innerHeight - 132;
      setScale(Math.max(0.45, Math.min(w / DOC_W, h / DOC_H, 1.45)));
    };
    calc();
    window.addEventListener("resize", calc);
    window.addEventListener("orientationchange", calc);
    return () => {
      window.removeEventListener("resize", calc);
      window.removeEventListener("orientationchange", calc);
    };
  }, []);

  return (
    <div style={{ width: DOC_W * scale, height: DOC_H * scale, position: "relative" }}>
      <div
        style={{
          width: DOC_W,
          height: DOC_H,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          // A real scanned sheet sits on something.
          boxShadow: "0 18px 44px -18px rgba(46,38,20,.45), 0 2px 6px rgba(46,38,20,.14)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

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

export default function CourtMarriageTemplate({
  data,
  mode = "preview",
  shareId,
}: {
  data: CertificateData;
  mode?: "preview" | "live";
  shareId?: string;
}) {
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(false);
  const [exportData, setExportData] = useState<CertificateData | null>(null);
  const reduced = usePrefersReducedMotion();
  void shareId;

  const download = useCallback(async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      // 1. Make the photo capture-safe, and render that copy off-screen.
      const safePhoto = await toSafeSrc(data.photoUrl);
      const safeData: CertificateData = { ...data, photoUrl: safePhoto };
      setExportData(safeData);

      // let React paint the off-screen copy
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      // 2. THE line everyone forgets. Without it Tinos/Courier Prime have not
      //    resolved when the DOM is serialised and the PNG comes back in the
      //    fallback faces — which looks nothing like the screen.
      if (document.fonts?.ready) await document.fonts.ready;

      const node = document.getElementById("cm-export-node");
      if (!node) throw new Error("export node missing");

      const { toPng } = await import("html-to-image");
      const url = await toPng(node, {
        // 360 × 3 = 1080, 480 × 3 = 1440 — the document's own 3:4 exactly.
        pixelRatio: 3,
        canvasWidth: 360,
        canvasHeight: 480,
        backgroundColor: "#faf6ed",
        cacheBust: true,
      });

      const a = document.createElement("a");
      a.href = url;
      a.download = `court-marriage-${fileSlug(data.partyA.name)}-${fileSlug(data.partyB.name)}.png`;
      a.click();
      setDone(true);
      setTimeout(() => setDone(false), 2200);
    } catch {
      // no toast plumbing down here — the button simply returns to rest
    } finally {
      setExportData(null);
      setDownloading(false);
    }
  }, [data, downloading]);

  return (
    <div
      style={{
        minHeight: "100dvh",
        background:
          "radial-gradient(120% 90% at 50% -10%, #ece5d5 0%, #e2dac7 45%, #d6cdb8 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "68px 10px 78px",
        boxSizing: "border-box",
      }}
    >
      {/* Recipient's "create your own" path — top-right, per the flow contract. */}
      {mode === "live" && (
        <Link
          href="/templates"
          className="fixed top-3 right-3 z-[120] inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm"
          style={{ background: "rgba(255,255,255,.92)", color: "#5646C9", border: "1px solid #ECEAE3", backdropFilter: "blur(8px)" }}
        >
          <Image src="/logo.webp" alt="" width={18} height={18} style={{ borderRadius: 5 }} />
          SubhSandesh
        </Link>
      )}

      <ScaledDocument>
        <Certificate data={data} />
      </ScaledDocument>

      {/* Everything that moves stays OFF the paper. */}
      <div className="mt-5 flex flex-col items-center gap-2">
        <button
          onClick={download}
          disabled={downloading}
          className="inline-flex items-center gap-2 rounded-full px-5 text-sm font-bold shadow-md disabled:opacity-70"
          style={{ background: "#0E0E12", color: "#C6FF3D", minHeight: 42, fontFamily: "var(--font-inter), system-ui, sans-serif" }}
        >
          {downloading ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Preparing PNG…
            </>
          ) : done ? (
            <>
              <Check size={15} /> Saved
            </>
          ) : (
            <>
              <Download size={15} /> Download certificate
            </>
          )}
        </button>

        {mode === "live" && (
          <Link
            href="/templates"
            className="text-xs font-semibold underline underline-offset-2"
            style={{ color: "#5B5B66", fontFamily: "var(--font-inter), system-ui, sans-serif" }}
          >
            Make your own certificate →
          </Link>
        )}
      </div>

      {/* Waiting-for-witnesses state — surrounding UI only, never on the paper. */}
      {data.certificateState === "awaiting_witnesses" && (
        <div
          className="mt-4 flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4"
          style={{ background: "rgba(255,255,255,.72)", border: "1px solid #ECEAE3" }}
        >
          {reduced ? (
            <span className="grid h-7 w-7 place-items-center text-base" aria-hidden>
              🖋️
            </span>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`${ASSET}/waiting.webp`} alt="" width={28} height={28} style={{ borderRadius: 999 }} />
          )}
          <span className="text-xs font-semibold" style={{ color: "#5B5B66", fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
            Waiting on witness signatures
          </span>
        </div>
      )}

      {/* Off-screen capture copy: identical node, unscaled, photo made CORS-safe. */}
      {exportData && (
        <div style={{ position: "fixed", left: -100000, top: 0, pointerEvents: "none", opacity: 1 }} aria-hidden>
          <div id="cm-export-node">
            <Certificate data={exportData} />
          </div>
        </div>
      )}
    </div>
  );
}
