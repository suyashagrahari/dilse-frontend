// The 1200×630 link preview for /birthday-premium (WhatsApp, X, iMessage, Slack).
// Rendered once at build time by next/og, so it needs no CDN upload. The
// storybook is drawn in SVG rather than with emoji: next/og fetches emoji
// images at render time, and a build without network would ship a blank square.
import { ImageResponse } from "next/og";

export const alt = "Birthday Surprise ✦ Premium — a pop-up birthday storybook: an open book with a paper cake, balloons and bunting rising out of it";
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
          padding: "0 70px 0 90px",
          background: "linear-gradient(160deg, #FFF8E8 0%, #FFE8C4 55%, #FFD3DE 100%)",
          color: "#4E2632",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 620 }}>
          <div style={{ display: "flex", fontSize: 24, letterSpacing: 6, color: "#BE355D", fontWeight: 700 }}>✦ PREMIUM · PEEL IT OPEN</div>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, marginTop: 18 }}>Someone made you a birthday storybook</div>
          <div style={{ fontSize: 28, lineHeight: 1.4, marginTop: 24, color: "#7D5260" }}>
            Blow a dandelion of wishes, ride a balloon over your story, win reasons from a claw machine and scratch a golden ticket.
          </div>
          <div style={{ fontSize: 24, marginTop: 30, color: "#E5527A", fontWeight: 700 }}>subhsandesh.in</div>
        </div>
        <svg width="420" height="420" viewBox="0 0 300 300">
          <circle cx="150" cy="150" r="140" fill="#FFFFFF" opacity="0.55" />
          <path d="M150 250 L30 228 L30 120 L150 140 Z" fill="#FFFFFF" stroke="#F5D7A3" strokeWidth="3" />
          <path d="M150 250 L270 228 L270 120 L150 140 Z" fill="#FFF8E8" stroke="#F5D7A3" strokeWidth="3" />
          <path d="M30 228 L150 250 L270 228 L270 236 L150 258 L30 236 Z" fill="#E5527A" />
          <path d="M50 150 Q70 120 90 150 T130 150" stroke="#8FD6C2" strokeWidth="10" fill="none" opacity="0.7" />
          <rect x="105" y="150" width="90" height="40" rx="8" fill="#F7D9A8" />
          <rect x="115" y="122" width="70" height="32" rx="8" fill="#FFB7C9" />
          <rect x="128" y="98" width="44" height="28" rx="7" fill="#FFF4D9" />
          <path d="M105 160 Q117 172 129 160 Q141 172 153 160 Q165 172 177 160 Q189 172 195 160 L195 150 L105 150 Z" fill="#FFB7C9" />
          <rect x="146" y="76" width="8" height="22" rx="2" fill="#FFFFFF" stroke="#BE355D" strokeWidth="2" />
          <path d="M150 58 C156 66 157 72 150 76 C143 72 144 66 150 58 Z" fill="#FFB23E" />
          <path d="M40 60 L90 78 L140 66 L190 80 L260 58" stroke="#7D5260" strokeWidth="2" fill="none" />
          <path d="M58 66 L66 86 L76 70 Z" fill="#E5527A" />
          <path d="M104 74 L112 94 L122 72 Z" fill="#FFCF5C" />
          <path d="M170 75 L178 96 L188 78 Z" fill="#8FD6C2" />
          <path d="M222 68 L230 88 L240 64 Z" fill="#B9A6F2" />
          <ellipse cx="62" cy="120" rx="18" ry="22" fill="#FFCF5C" />
          <ellipse cx="244" cy="110" rx="18" ry="22" fill="#E5527A" />
          <path d="M62 142 C66 160 58 172 62 186" stroke="#7D5260" strokeWidth="2" fill="none" />
          <path d="M244 132 C240 150 248 162 244 176" stroke="#7D5260" strokeWidth="2" fill="none" />
        </svg>
      </div>
    ),
    size,
  );
}
