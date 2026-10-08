// The 1200×630 link preview for /happy-halloween (WhatsApp, X, iMessage, Slack).
// Rendered once at build time by next/og, so it needs no CDN upload and is
// always the right size. The glowing jack-o'-lantern is drawn in SVG rather
// than with an emoji: next/og fetches emoji images at render time, and a
// build without network would then ship a blank square.
import { ImageResponse } from "next/og";

export const alt = "Happy Halloween — an interactive card: carve a pumpkin, read a letter by flashlight, answer 'Will you be my boo?'";
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
          background: "linear-gradient(160deg, #0B0718 0%, #17122B 45%, #3A2257 100%)",
          color: "#F7F3FF",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 620 }}>
          <div style={{ fontSize: 26, letterSpacing: 6, color: "#FFD27A", fontWeight: 700 }}>HAPPY HALLOWEEN</div>
          <div style={{ fontSize: 66, fontWeight: 800, lineHeight: 1.08, marginTop: 18 }}>Build them a little haunted house</div>
          <div style={{ fontSize: 28, lineHeight: 1.4, marginTop: 24, color: "#CFC6E8" }}>
            Carve a pumpkin, read a letter by flashlight, brew a potion, then answer “Will you be my boo?”
          </div>
          <div style={{ fontSize: 24, marginTop: 34, color: "#FF8A3D", fontWeight: 700 }}>subhsandesh.in</div>
        </div>
        <svg width="390" height="390" viewBox="-10 0 320 320">
          <defs>
            <radialGradient id="g" cx="50%" cy="55%" r="60%">
              <stop offset="0" stopColor="#FFD27A" stopOpacity="0.55" />
              <stop offset="1" stopColor="#FFD27A" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="150" cy="168" r="148" fill="url(#g)" />
          <path d="M150 62 C146 44 150 32 162 24" stroke="#4E8F62" strokeWidth="12" strokeLinecap="round" fill="none" />
          <ellipse cx="96" cy="174" rx="66" ry="108" fill="#D9621F" />
          <ellipse cx="204" cy="174" rx="66" ry="108" fill="#D9621F" />
          <ellipse cx="150" cy="174" rx="122" ry="110" fill="#FF8A3D" />
          <ellipse cx="112" cy="174" rx="58" ry="106" fill="none" stroke="rgba(150,60,10,.35)" strokeWidth="3" />
          <ellipse cx="188" cy="174" rx="58" ry="106" fill="none" stroke="rgba(150,60,10,.35)" strokeWidth="3" />
          <path d="M88 142 L124 104 L138 152 Z" fill="#FFE9A8" />
          <path d="M212 142 L176 104 L162 152 Z" fill="#FFE9A8" />
          <path d="M150 160 L164 186 L136 186 Z" fill="#FFE9A8" />
          <path d="M82 202 Q150 266 218 202 L204 205 L193 222 L178 212 L165 228 L150 216 L135 228 L122 212 L107 222 L96 205 Z" fill="#FFE9A8" />
        </svg>
      </div>
    ),
    size,
  );
}
