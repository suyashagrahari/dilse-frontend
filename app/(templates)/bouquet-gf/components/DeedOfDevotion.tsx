"use client";

import { useRef, useState } from "react";
import { Download, Heart, Sparkles } from "lucide-react";

/** Stable pseudo-ref from the two names (no Math.random → SSR-safe). */
function refNo(a: string, b: string): string {
  const s = `${a}|${b}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return "LV-" + (Math.abs(h) % 1000000).toString(36).toUpperCase().padStart(4, "0");
}

const NAME = (v: string, fallback: string) => (v.trim() ? v.trim() : fallback);

/**
 * A playful mock-legal "Deed of Devotion" — Government of Love, non-judicial love
 * stamp — pledging the sender's clauses to the recipient. Styled in the bouquet's
 * Y2K pastel theme; recipients can save it as a PNG keepsake.
 */
export default function DeedOfDevotion({
  senderName,
  recipientName,
  clauses,
  downloadable = false,
}: {
  senderName: string;
  recipientName: string;
  clauses: string[];
  downloadable?: boolean;
}) {
  const deedRef = useRef<HTMLDivElement | null>(null);
  const [saving, setSaving] = useState(false);

  const devotee = NAME(senderName, "The Devotee");
  const beloved = NAME(recipientName, "The Beloved");
  const ref = refNo(devotee, beloved);
  const rows = (clauses.length ? clauses : ["Endless devotion, no fine print ✿"]).slice(0, 6);

  const handleSave = async () => {
    if (!deedRef.current) return;
    setSaving(true);
    try {
      const { toPng } = await import("html-to-image");
      const url = await toPng(deedRef.current, { pixelRatio: 2, cacheBust: true, backgroundColor: "#fffdf9" });
      const a = document.createElement("a");
      a.href = url;
      a.download = `deed-of-devotion-${ref}.png`;
      a.click();
    } catch {
      /* html-to-image unavailable or blocked — no-op */
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-[520px] mx-auto">
      <div
        ref={deedRef}
        className="bq-card"
        style={{ padding: "clamp(20px,5vw,34px)", background: "#fffdf9", borderColor: "#2b2440" }}
      >
        {/* header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="bq-display" style={{ fontSize: 11, letterSpacing: "0.18em", color: "#8b6fd4", fontWeight: 800 }}>
              GOVERNMENT OF LOVE
            </p>
            <p style={{ fontSize: 10, letterSpacing: "0.14em", color: "#7a7191", textTransform: "uppercase" }}>
              Non-Judicial Love Stamp
            </p>
          </div>
          <div
            style={{
              border: "2px solid #ff5f96",
              borderRadius: 12,
              padding: "6px 10px",
              textAlign: "center",
              transform: "rotate(6deg)",
              color: "#ff5f96",
              lineHeight: 1.15,
            }}
          >
            <div className="bq-display" style={{ fontSize: 9, letterSpacing: "0.1em", fontWeight: 800 }}>LOVE STAMP</div>
            <div className="bq-display" style={{ fontSize: 16, fontWeight: 800 }}>₹100</div>
            <div style={{ fontSize: 7.5, letterSpacing: "0.08em" }}>DEVOTION · ∞</div>
          </div>
        </div>

        {/* title */}
        <div className="text-center mb-4">
          <h3 className="bq-display bq-gt" style={{ fontSize: "clamp(26px,7vw,38px)", margin: 0 }}>Deed of Devotion</h3>
          <p className="bq-script" style={{ fontSize: 18, color: "#7a7191", marginTop: 2 }}>affection, pledged on loving terms</p>
        </div>

        <div style={{ height: 2, background: "repeating-linear-gradient(90deg,#ece3d4 0 8px,transparent 8px 14px)", margin: "6px 0 16px" }} />

        {/* body */}
        <p style={{ fontSize: 14, lineHeight: 1.7, color: "#2b2440" }}>
          <b style={{ color: "#8b6fd4" }}>{devotee}</b> <i style={{ color: "#7a7191" }}>(&ldquo;the Devotee&rdquo;)</i> hereby pledges
          heartfelt devotion to <b style={{ color: "#ff5f96" }}>{beloved}</b> <i style={{ color: "#7a7191" }}>(&ldquo;the Beloved&rdquo;)</i>,
          strictly on the <b>loving condition</b> that the Devotee faithfully fulfils each promise set out below:
        </p>

        <ol style={{ listStyle: "none", padding: 0, margin: "16px 0" }}>
          {rows.map((c, i) => (
            <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 11 }}>
              <span
                className="bq-display"
                style={{ flex: "0 0 auto", width: 24, height: 24, borderRadius: 8, display: "grid", placeItems: "center", background: "#ffe08a", border: "2px solid #2b2440", fontSize: 12, fontWeight: 800 }}
              >
                {i + 1}
              </span>
              <span style={{ fontSize: 14, lineHeight: 1.5, color: "#2b2440", paddingTop: 2 }}>
                <b style={{ letterSpacing: "0.04em" }}>CLAUSE</b> — {c}
              </span>
            </li>
          ))}
        </ol>

        <p style={{ fontSize: 12.5, lineHeight: 1.6, color: "#7a7191", fontStyle: "italic" }}>
          Upon these terms, said devotion is granted &mdash; effective immediately, valid for eternity ∞. Any breach is
          remediable by extra hugs. Ref No. {ref}
        </p>

        {/* signatures + seal */}
        <div className="mt-6 flex items-end justify-between gap-3">
          <div style={{ flex: 1, textAlign: "center" }}>
            <div className="bq-script" style={{ fontSize: 24, color: "#2b2440", lineHeight: 1 }}>{devotee}</div>
            <div style={{ height: 2, background: "#2b2440", margin: "4px 8px 0" }} />
            <div style={{ fontSize: 9.5, letterSpacing: "0.1em", color: "#7a7191", marginTop: 4, textTransform: "uppercase" }}>Devotee · pledges love</div>
          </div>

          <div
            className="bq-display"
            style={{
              flex: "0 0 auto",
              width: 66,
              height: 66,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              textAlign: "center",
              background: "radial-gradient(circle at 34% 30%, #ff8fb1, #ff5f96 62%, #d63e77)",
              border: "2px solid #2b2440",
              color: "#fff",
              boxShadow: "var(--bq-sticker)",
              fontSize: 7.5,
              lineHeight: 1.15,
              fontWeight: 800,
              letterSpacing: "0.06em",
            }}
          >
            <span>SEALED<br />WITH<br />LOVE ∞</span>
          </div>

          <div style={{ flex: 1, textAlign: "center" }}>
            <div className="bq-script" style={{ fontSize: 24, color: "#2b2440", lineHeight: 1 }}>{beloved}</div>
            <div style={{ height: 2, background: "#2b2440", margin: "4px 8px 0" }} />
            <div style={{ fontSize: 9.5, letterSpacing: "0.1em", color: "#7a7191", marginTop: 4, textTransform: "uppercase" }}>Beloved · receives love</div>
          </div>
        </div>
      </div>

      {downloadable && (
        <div className="flex justify-center mt-4">
          <button onClick={handleSave} disabled={saving} className="bq-btn-ghost inline-flex items-center gap-2 px-5 py-2.5 text-sm">
            {saving ? <Sparkles size={15} /> : <Download size={15} />}
            {saving ? "Saving…" : "Save the deed"}
            <Heart size={13} fill="#ff5f96" color="#ff5f96" />
          </button>
        </div>
      )}
    </div>
  );
}
