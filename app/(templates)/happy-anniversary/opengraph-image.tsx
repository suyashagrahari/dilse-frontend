// The 1200×630 link preview for /happy-anniversary (WhatsApp, X, iMessage,
// Slack). Rendered once at build time by next/og, so it needs no CDN upload.
// The frame, the ticket and the heart are drawn in SVG rather than with emoji:
// next/og fetches emoji images at render time, and a build without network
// would ship a blank square.
import { ImageResponse } from "next/og";

export const alt = "Happy Anniversary — Our Little Love Museum: tear the ticket, see your time together, your framed photos, a snow globe and a Masterpiece of the Year award";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 90px",
          background: "linear-gradient(180deg, #FFF7F8 0%, #FFF3F5 62%, #F6D0DA 62%, #FBDDE4 100%)",
          color: "#4B2331",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 620 }}>
          <div style={{ fontSize: 24, letterSpacing: 7, color: "#AE3558", fontWeight: 700, fontFamily: "sans-serif" }}>NOW OPEN · ADMIT ONE</div>
          <div style={{ fontSize: 78, fontWeight: 800, lineHeight: 1.04, marginTop: 18 }}>Our Little Love Museum</div>
          <div style={{ fontSize: 28, lineHeight: 1.4, marginTop: 22, color: "#76495A", fontFamily: "sans-serif" }}>
            A tiny museum about the two of you, for your anniversary. Tear the ticket and walk in.
          </div>
          <div style={{ fontSize: 24, marginTop: 30, color: "#D9577A", fontWeight: 700, fontFamily: "sans-serif" }}>subhsandesh.in</div>
        </div>
        <svg width="360" height="440" viewBox="0 0 180 220">
          <rect x="4" y="4" width="172" height="212" rx="6" fill="#C9974A" />
          <rect x="12" y="12" width="156" height="196" rx="4" fill="#F3D9A4" />
          <rect x="22" y="22" width="136" height="176" fill="#FFE6EC" />
          <circle cx="90" cy="70" r="26" fill="#FFFFFF" opacity="0.8" />
          <path d="M90 150 C62 130 48 112 52 96 C56 80 78 78 90 94 C102 78 124 80 128 96 C132 112 118 130 90 150 Z" fill="#D9577A" />
          <path d="M22 168 Q60 150 90 166 Q120 182 158 162 L158 198 L22 198 Z" fill="#F6D0DA" />
          <rect x="58" y="206" width="64" height="12" rx="3" fill="#FFFDFB" stroke="#C9974A" strokeWidth="2" />
        </svg>
      </div>
    ),
    size,
  );
}
