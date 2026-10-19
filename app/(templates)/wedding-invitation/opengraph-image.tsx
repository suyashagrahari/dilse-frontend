// The 1200×630 link preview for /wedding-invitation (WhatsApp, X, iMessage,
// Slack). Rendered once at build time by next/og — no CDN upload, no emoji
// (next/og fetches emoji images at render time). The envelope and its wax seal
// are drawn in SVG.
import { ImageResponse } from "next/og";

export const alt = "Wedding Invitation — an elegant wedding invitation website that opens like a wax-sealed envelope, with a countdown, venue maps and one-tap RSVP";
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
          padding: "0 80px 0 88px",
          background: "radial-gradient(circle at 30% 20%, #fffaf0 0%, #fbf3dc 45%, #f1e3bd 100%)",
          color: "#3a2c14",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 600 }}>
          <div style={{ fontSize: 24, letterSpacing: 8, color: "#8a6420", fontWeight: 700, fontFamily: "sans-serif" }}>CLASSIC · WEDDING INVITATION</div>
          <div style={{ fontSize: 88, fontWeight: 700, lineHeight: 1.02, marginTop: 18 }}>You&apos;re Invited</div>
          <div style={{ fontSize: 30, lineHeight: 1.4, marginTop: 24, color: "#6f5a36", fontFamily: "sans-serif" }}>
            A wax seal opens to your names, the date, a live countdown, venue maps, photos and one-tap RSVP.
          </div>
          <div style={{ fontSize: 24, marginTop: 34, color: "#9a7b2f", fontWeight: 700, fontFamily: "sans-serif" }}>subhsandesh.in</div>
        </div>
        <svg width="420" height="360" viewBox="0 0 300 260">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#8a6420" />
              <stop offset="0.4" stopColor="#fbeab0" />
              <stop offset="0.7" stopColor="#b98a2e" />
              <stop offset="1" stopColor="#7a5a14" />
            </linearGradient>
            <radialGradient id="w" cx="0.38" cy="0.32" r="0.7">
              <stop offset="0" stopColor="#b3333c" />
              <stop offset="1" stopColor="#6b1119" />
            </radialGradient>
          </defs>
          <rect x="62" y="20" width="176" height="150" rx="4" fill="#fffcf2" stroke="url(#g)" strokeWidth="3" />
          <path d="M100 70 H200 M112 92 H188 M122 112 H178" stroke="#c9a43f" strokeWidth="3" strokeLinecap="round" />
          <rect x="20" y="96" width="260" height="160" rx="6" fill="#efe0b8" />
          <path d="M20 96 L150 196 L20 256 Z" fill="#f1e3bd" />
          <path d="M280 96 L150 196 L280 256 Z" fill="#f1e3bd" />
          <path d="M20 256 L144 170 Q150 166 156 170 L280 256 Z" fill="#fcf5e2" stroke="url(#g)" strokeWidth="2.5" />
          <rect x="20" y="96" width="260" height="160" rx="6" fill="none" stroke="url(#g)" strokeWidth="3" />
          <circle cx="150" cy="186" r="30" fill="url(#w)" />
          <circle cx="150" cy="186" r="21" fill="none" stroke="#e8a3a3" strokeOpacity="0.5" strokeWidth="2" />
          <path d="M150 176 C142 166 128 172 136 184 L150 198 L164 184 C172 172 158 166 150 176 Z" fill="#f3c9c4" fillOpacity="0.75" />
        </svg>
      </div>
    ),
    size,
  );
}
