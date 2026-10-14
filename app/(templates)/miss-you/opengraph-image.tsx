// The 1200×630 link preview for /miss-you (WhatsApp, X, iMessage, Slack).
// Rendered once at build time by next/og, so it needs no CDN upload. The moon,
// the route and the paper plane are SVG rather than emoji: next/og fetches
// emoji images at render time, and a build without network would ship a blank.
import { ImageResponse } from "next/og";

export const alt = "I Miss You — a cute long-distance love page: a love call, two cities on a map, a countdown, open-when letters and a See-you-soon boarding pass";
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
          padding: "0 80px 0 90px",
          background: "linear-gradient(160deg, #3A3480 0%, #1A1F4B 55%, #2B1E57 100%)",
          color: "#FFF6FB",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 620 }}>
          <div style={{ fontSize: 26, letterSpacing: 6, color: "#FFD98A", fontWeight: 700 }}>INCOMING LOVE CALL</div>
          <div style={{ fontSize: 80, fontWeight: 800, lineHeight: 1.04, marginTop: 18 }}>Someone misses you a lot</div>
          <div style={{ fontSize: 28, lineHeight: 1.4, marginTop: 24, color: "#C5C2EE" }}>
            Two cities on a map, a countdown to the day you meet, open-when letters, a hug across the distance and a boarding pass.
          </div>
          <div style={{ fontSize: 24, marginTop: 34, color: "#FF7EAE", fontWeight: 700 }}>subhsandesh.in</div>
        </div>
        <svg width="400" height="420" viewBox="0 0 200 210">
          <circle cx="150" cy="40" r="26" fill="#FFD98A" />
          <circle cx="162" cy="32" r="24" fill="#20275C" />
          <circle cx="40" cy="30" r="2.2" fill="#FFFFFF" />
          <circle cx="90" cy="16" r="1.6" fill="#FFFFFF" />
          <circle cx="20" cy="90" r="1.8" fill="#FFFFFF" />
          <circle cx="186" cy="110" r="1.8" fill="#FFFFFF" />
          <path d="M30 180 Q 70 70 170 110" fill="none" stroke="#FF7EAE" strokeWidth="5" strokeLinecap="round" strokeDasharray="1 12" />
          <path d="M30 186 C 22 176, 18 170, 18 164 A 12 12 0 1 1 42 164 C 42 170, 38 176, 30 186 Z" fill="#FF7EAE" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="30" cy="164" r="5" fill="#FFFFFF" />
          <path d="M170 116 C 162 106, 158 100, 158 94 A 12 12 0 1 1 182 94 C 182 100, 178 106, 170 116 Z" fill="#FF7EAE" stroke="#FFFFFF" strokeWidth="2" />
          <path d="M170 98 C 165 95, 164 92, 166 90 C 168 88, 170 89, 170 91 C 170 89, 172 88, 174 90 C 176 92, 175 95, 170 98 Z" fill="#FFFFFF" />
          <g transform="translate(78 70) rotate(-18)">
            <path d="M2 22 L62 2 L36 46 L28 30 Z" fill="#FFFFFF" stroke="#5338B4" strokeWidth="2.4" strokeLinejoin="round" />
            <path d="M28 30 L62 2 L22 26 Z" fill="#E2D9FF" stroke="#5338B4" strokeWidth="2" strokeLinejoin="round" />
          </g>
        </svg>
      </div>
    ),
    size,
  );
}
