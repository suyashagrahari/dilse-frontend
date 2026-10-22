// The 1200\u00d7630 link preview for /floral-wedding-invitation (WhatsApp, X, iMessage, Slack).
// Rendered once at build time by next/og: light ivory, drawn in SVG (no emoji,
// no network fonts, no remote images).
import { ImageResponse } from "next/og";

export const alt = "Pampas & Peony Wedding Invitation \u2014 pampas grass, blush peonies and floral drapes on handmade paper, the couple on a swing, every function with RSVP and a blessings wall, on one link";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GOLD = "#9E5A62";

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
          background: "radial-gradient(circle at 70% 45%, #FFFCF7 0%, #F5ECE0 60%, #EADBC8 100%)",
          color: "#4E3A33",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 660 }}>
          <div style={{ fontSize: 22, letterSpacing: 8, color: GOLD, fontWeight: 700, fontFamily: "sans-serif" }}>TOGETHER WITH THEIR FAMILIES</div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 70, fontWeight: 700, lineHeight: 1.04, marginTop: 20 }}>
            <span>Pampas & Peony</span>
            <span>Wedding Invitation</span>
          </div>
          <div style={{ fontSize: 28, lineHeight: 1.42, marginTop: 24, color: "#7A645A", fontFamily: "sans-serif" }}>
            Pampas grass, blush peonies and the couple on a swing, every function with maps and RSVP, and a blessings wall.
          </div>
          <div style={{ fontSize: 24, marginTop: 30, color: GOLD, fontWeight: 700, fontFamily: "sans-serif" }}>subhsandesh.in</div>
        </div>
        <svg width="340" height="460" viewBox="0 0 300 400">
          <path d="M40 390 V170 C40 100 95 52 150 44 C205 52 260 100 260 170 V390 Z" fill="none" stroke={GOLD} strokeWidth="7" />
          <path d="M62 390 V178 C62 118 106 78 150 70 C194 78 238 118 238 178 V390 Z" fill="#FFFFFF" fillOpacity="0.55" stroke={GOLD} strokeWidth="2" />
          <path d="M150 300 C120 270 112 238 150 196 C188 238 180 270 150 300 Z" fill={GOLD} fillOpacity="0.85" />
          <path d="M150 300 C112 292 92 266 98 236 C124 246 142 266 150 300 Z" fill={GOLD} fillOpacity="0.55" />
          <path d="M150 300 C188 292 208 266 202 236 C176 246 158 266 150 300 Z" fill={GOLD} fillOpacity="0.55" />
          <path d="M150 18 L160 40 L140 40 Z" fill={GOLD} />
          <path d="M20 392 H280" stroke={GOLD} strokeWidth="5" />
        </svg>
      </div>
    ),
    size,
  );
}
