// The 1200×630 link preview for /happy-diwali (WhatsApp, X, iMessage, Slack).
// Rendered once at build time by next/og, so it needs no CDN upload. The diya
// is drawn in SVG rather than with an emoji: next/og fetches emoji images at
// render time, and a build without network would then ship a blank square.
import { ImageResponse } from "next/og";

export const alt = "Happy Diwali — an interactive card: light a diya, colour a rangoli, light crackers and open a liffafa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const STARS: [number, number, number][] = [
  [80, 70, 3], [210, 140, 2], [340, 60, 2], [520, 110, 3], [660, 50, 2], [760, 160, 2], [930, 80, 3], [1110, 130, 2], [1040, 40, 2], [450, 190, 2],
];

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
          position: "relative",
          background: "linear-gradient(165deg, #2A0507 0%, #6E0F12 50%, #8F1416 100%)",
          color: "#FFF6E3",
          fontFamily: "sans-serif",
        }}
      >
        {STARS.map(([x, y, r], i) => (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: r * 2, height: r * 2, borderRadius: r, background: "#FFE9B0", opacity: 0.8 }} />
        ))}
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
          <div style={{ fontSize: 26, letterSpacing: 6, color: "#FFD36E", fontWeight: 700 }}>HAPPY DIWALI</div>
          <div style={{ fontSize: 66, fontWeight: 800, lineHeight: 1.08, marginTop: 18 }}>Leave a diya at their door</div>
          <div style={{ fontSize: 28, lineHeight: 1.4, marginTop: 24, color: "#F3D9C4" }}>
            They light it, colour a rangoli, light a tray of crackers, open your liffafa and a box of mithai.
          </div>
          <div style={{ fontSize: 24, marginTop: 34, color: "#FFB23F", fontWeight: 700 }}>subhsandesh.in</div>
        </div>
        <svg width="380" height="380" viewBox="0 0 320 320">
          <defs>
            <radialGradient id="glow" cx="50%" cy="45%" r="55%">
              <stop offset="0" stopColor="#FFC85A" stopOpacity="0.75" />
              <stop offset="1" stopColor="#FFC85A" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="clay" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#E0742A" />
              <stop offset="1" stopColor="#8E3410" />
            </linearGradient>
          </defs>
          <circle cx="160" cy="150" r="150" fill="url(#glow)" />
          <path d="M160 40 C186 86 196 118 160 150 C124 118 134 86 160 40 Z" fill="#FFB23F" />
          <path d="M160 74 C174 102 178 122 160 142 C142 122 146 102 160 74 Z" fill="#FFF3C4" />
          <path d="M44 176 Q160 154 276 176 Q262 266 160 268 Q58 266 44 176 Z" fill="url(#clay)" />
          <path d="M44 176 Q160 198 276 176" fill="none" stroke="#FFD36E" strokeWidth="6" />
          <circle cx="110" cy="222" r="9" fill="#FFD36E" />
          <circle cx="160" cy="230" r="11" fill="#FF5FA2" />
          <circle cx="210" cy="222" r="9" fill="#2EC4B6" />
        </svg>
      </div>
    ),
    size,
  );
}
