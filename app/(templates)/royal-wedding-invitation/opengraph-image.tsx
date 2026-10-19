// The 1200×630 link preview for /royal-wedding-invitation (WhatsApp, X,
// iMessage, Slack). Rendered once at build time by next/og: palace gates
// ajar under a jharokha arch, drawn in SVG (no emoji, no network fonts).
import { ImageResponse } from "next/og";

export const alt = "Royal Wedding Invitation — palace gates that open to shehnai, a gold-foil monogram, every function with RSVP and a blessings wall, on one link";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GOLD = "#E2BD6B";

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
          padding: "0 80px 0 90px",
          background: "radial-gradient(circle at 70% 45%, #6a1729 0%, #3a0913 62%, #24050b 100%)",
          color: "#FBECD4",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
          <div style={{ fontSize: 22, letterSpacing: 10, color: GOLD, fontWeight: 700, fontFamily: "sans-serif" }}>✦ ROYAL EDITION · SHUBH VIVAH</div>
          <div style={{ fontSize: 88, fontWeight: 700, lineHeight: 1.02, marginTop: 20, color: "#F3D98F" }}>Royal Wedding Invitation</div>
          <div style={{ fontSize: 29, lineHeight: 1.42, marginTop: 24, color: "#D6B99C", fontFamily: "sans-serif" }}>
            Palace gates open to shehnai. Every function with maps, RSVP and dress codes, 40 photos, Hindi and English, a blessings wall.
          </div>
          <div style={{ fontSize: 24, marginTop: 30, color: GOLD, fontWeight: 700, fontFamily: "sans-serif" }}>subhsandesh.in</div>
        </div>
        <svg width="360" height="480" viewBox="0 0 300 400">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#8a6a1f" />
              <stop offset="0.45" stopColor="#f3d98f" />
              <stop offset="0.6" stopColor="#c9a43f" />
              <stop offset="1" stopColor="#7a5a14" />
            </linearGradient>
            <radialGradient id="l" cx="0.5" cy="0.62" r="0.55">
              <stop offset="0" stopColor="#FFF6DD" />
              <stop offset="0.5" stopColor="#FFD58A" />
              <stop offset="1" stopColor="#7a2a1a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path d="M150 18 L160 40 L140 40 Z" fill="url(#g)" />
          <path d="M40 390 V170 C40 100 95 52 150 44 C205 52 260 100 260 170 V390 Z" fill="none" stroke="url(#g)" strokeWidth="8" />
          <path d="M60 390 V176 C60 116 104 76 150 68 C196 76 240 116 240 176 V390 Z" fill="url(#l)" />
          <path d="M60 390 V176 C60 128 92 94 120 82 L120 390 Z" fill="#4a1020" stroke={GOLD} strokeWidth="3" />
          <path d="M240 390 V176 C240 128 208 94 180 82 L180 390 Z" fill="#4a1020" stroke={GOLD} strokeWidth="3" />
          <circle cx="90" cy="250" r="12" fill="none" stroke={GOLD} strokeWidth="3" />
          <circle cx="210" cy="250" r="12" fill="none" stroke={GOLD} strokeWidth="3" />
          <rect x="74" y="300" width="32" height="60" rx="4" fill="none" stroke={GOLD} strokeWidth="2.5" />
          <rect x="194" y="300" width="32" height="60" rx="4" fill="none" stroke={GOLD} strokeWidth="2.5" />
          <path d="M20 392 H280" stroke="url(#g)" strokeWidth="6" />
        </svg>
      </div>
    ),
    size,
  );
}
