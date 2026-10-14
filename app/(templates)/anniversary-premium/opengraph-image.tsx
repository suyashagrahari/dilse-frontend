// The 1200×630 link preview for /anniversary-premium (WhatsApp, X, iMessage,
// Slack). Rendered once at build time by next/og, so it needs no CDN upload.
// The open book and the hearts are drawn in SVG rather than with emoji: next/og
// fetches emoji images at render time, and a build without network would ship
// a blank square.
import { ImageResponse } from "next/og";

export const alt = "Anniversary ✦ Premium — The Book of Us: an interactive anniversary storybook with a time machine through your years, your firsts on vinyl and a Certificate of Forever";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GOLD = "#C9A15A";

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
          padding: "0 80px",
          background: "linear-gradient(160deg, #FFFDF8 0%, #FBF6EE 45%, #F0E2CC 100%)",
          color: "#45372A",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 620 }}>
          <div style={{ fontSize: 24, letterSpacing: 8, color: "#8E6224", fontWeight: 700, fontFamily: "sans-serif" }}>✦ PREMIUM · HAPPY ANNIVERSARY</div>
          <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1, marginTop: 18 }}>The Book of Us</div>
          <div style={{ fontSize: 30, lineHeight: 1.4, marginTop: 24, color: "#6E5C48", fontFamily: "sans-serif" }}>
            Spin a time machine through every year, play your firsts on vinyl, light promise lanterns, then keep a Certificate of Forever.
          </div>
          <div style={{ fontSize: 24, marginTop: 34, color: "#B4813A", fontWeight: 700, fontFamily: "sans-serif" }}>subhsandesh.in</div>
        </div>
        <svg width="420" height="380" viewBox="0 0 210 190">
          <circle cx="105" cy="90" r="86" fill="#FFFFFF" opacity="0.55" />
          <path d="M18 60 C50 48 80 50 104 64 L104 168 C80 154 50 152 18 164 Z" fill="#FFFDF8" stroke={GOLD} strokeWidth="3" />
          <path d="M192 60 C160 48 130 50 106 64 L106 168 C130 154 160 152 192 164 Z" fill="#FFFDF8" stroke={GOLD} strokeWidth="3" />
          <path d="M34 82 C56 74 76 76 92 84 M34 98 C56 90 76 92 92 100 M34 114 C56 106 76 108 92 116 M34 130 C56 122 76 124 92 132" stroke="#E8D6B8" strokeWidth="3" fill="none" />
          <path d="M150 128 C138 119 130 112 132 104 C134 96 144 95 150 102 C156 95 166 96 168 104 C170 112 162 119 150 128 Z" fill="#E59A8F" />
          <path d="M104 46 C96 40 92 35 93 30 C94 25 100 24 104 29 C108 24 114 25 115 30 C116 35 112 40 104 46 Z" fill="#B4813A" />
          <circle cx="60" cy="30" r="3" fill={GOLD} />
          <circle cx="150" cy="24" r="2.4" fill={GOLD} />
          <circle cx="178" cy="44" r="2" fill={GOLD} />
        </svg>
      </div>
    ),
    size,
  );
}
