// The 1200×630 link preview for /sorry (WhatsApp, X, iMessage, Slack).
// Rendered once at build time by next/og, so it needs no CDN upload. The bear
// and the heart are drawn in SVG rather than with emoji: next/og fetches emoji
// images at render time, and a build without network would ship a blank square.
import { ImageResponse } from "next/og";

export const alt = "I'm Sorry — a cute forgive-me page: a sad little bear, guilt bubbles to pop, a pinky promise and 'Will you forgive me?'";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#5B3A30";

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
          background: "linear-gradient(160deg, #FFF0F5 0%, #FFD9E8 55%, #FFC2D6 100%)",
          color: "#5A2A3C",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
          <div style={{ fontSize: 26, letterSpacing: 6, color: "#D9466E", fontWeight: 700 }}>PSST… OPEN THIS</div>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, marginTop: 18 }}>Someone is very, very sorry</div>
          <div style={{ fontSize: 28, lineHeight: 1.4, marginTop: 24, color: "#8C5A6E" }}>
            Pop the guilt bubbles, seal a pinky promise, claim a make-it-up coupon, then answer “Will you forgive me?”
          </div>
          <div style={{ fontSize: 24, marginTop: 34, color: "#FF6F91", fontWeight: 700 }}>subhsandesh.in</div>
        </div>
        <svg width="380" height="400" viewBox="0 0 200 210">
          <circle cx="100" cy="100" r="96" fill="#FFFFFF" opacity="0.5" />
          <ellipse cx="100" cy="170" rx="56" ry="36" fill="#FFFDF8" stroke={INK} strokeWidth="4" />
          <circle cx="48" cy="44" r="21" fill="#FFFDF8" stroke={INK} strokeWidth="4" />
          <circle cx="152" cy="44" r="21" fill="#FFFDF8" stroke={INK} strokeWidth="4" />
          <circle cx="48" cy="44" r="11" fill="#FFD3E2" />
          <circle cx="152" cy="44" r="11" fill="#FFD3E2" />
          <ellipse cx="100" cy="92" rx="70" ry="62" fill="#FFFDF8" stroke={INK} strokeWidth="4" />
          <ellipse cx="58" cy="112" rx="15" ry="9" fill="#FFB3C7" />
          <ellipse cx="142" cy="112" rx="15" ry="9" fill="#FFB3C7" />
          <path d="M54 70 q12 -10 24 -4" stroke={INK} strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M146 70 q-12 -10 -24 -4" stroke={INK} strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <circle cx="68" cy="88" r="11" fill={INK} />
          <circle cx="132" cy="88" r="11" fill={INK} />
          <circle cx="72" cy="84" r="4.2" fill="#FFFFFF" />
          <circle cx="136" cy="84" r="4.2" fill="#FFFFFF" />
          <path d="M66 100 q-6 10 0 14 q6 -4 0 -14 z" fill="#8FD3FF" stroke={INK} strokeWidth="2" />
          <ellipse cx="100" cy="104" rx="7" ry="5" fill={INK} />
          <path d="M88 124 q12 -10 24 0" stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M100 196 C80 182 70 170 74 160 C78 150 92 150 100 160 C108 150 122 150 126 160 C130 170 120 182 100 196 Z" fill="#FF6F91" stroke={INK} strokeWidth="3.5" />
          <ellipse cx="54" cy="160" rx="13" ry="18" transform="rotate(30 54 160)" fill="#FFFDF8" stroke={INK} strokeWidth="4" />
          <ellipse cx="146" cy="160" rx="13" ry="18" transform="rotate(-30 146 160)" fill="#FFFDF8" stroke={INK} strokeWidth="4" />
        </svg>
      </div>
    ),
    size,
  );
}
