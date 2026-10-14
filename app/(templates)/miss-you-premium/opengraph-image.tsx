// The 1200×630 link preview for /miss-you-premium (WhatsApp, X, iMessage, Slack).
// Rendered once at build time by next/og, so it needs no CDN upload. The sun,
// the two dots and the route are SVG rather than emoji: next/og fetches emoji
// images at render time, and a build without network would ship a blank.
import { ImageResponse } from "next/og";

export const alt = "Miss You ✦ Premium — a long-distance day: a radio of voice notes, a picnic date, your initials in the stars and a sunrise where the distance runs down to 0";
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
          padding: "0 80px",
          background: "linear-gradient(170deg, #D7E8FF 0%, #FFE6F1 55%, #FFF1D9 100%)",
          color: "#47233F",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 620 }}>
          <div style={{ display: "flex", fontSize: 24, letterSpacing: 6, color: "#C23F79", fontWeight: 700 }}>✦ PREMIUM · AIR MAIL</div>
          <div style={{ fontSize: 74, fontWeight: 800, lineHeight: 1.05, marginTop: 18 }}>Two dots on a map. One of them is you.</div>
          <div style={{ fontSize: 28, lineHeight: 1.4, marginTop: 22, color: "#76506C" }}>
            Tune the radio, plan a picnic, join the stars, and watch the distance run down to 0 at sunrise.
          </div>
          <div style={{ fontSize: 24, marginTop: 30, color: "#EC5F9C", fontWeight: 700 }}>subhsandesh.in</div>
        </div>
        <svg width="420" height="420" viewBox="0 0 200 200">
          <circle cx="100" cy="118" r="54" fill="#FFE7A8" />
          <circle cx="100" cy="118" r="40" fill="#FFFDF2" />
          <path d="M0 160 Q 100 120 200 160 V200 H0 Z" fill="#F8C9DE" />
          <path d="M-10 178 Q 120 140 210 186 V200 H-10 Z" fill="#CFDDFB" />
          <path d="M28 70 Q 100 20 172 70" fill="none" stroke="#A3336A" strokeWidth="3" strokeDasharray="2 8" strokeLinecap="round" />
          <circle cx="28" cy="70" r="11" fill="#EC5F9C" stroke="#FFFFFF" strokeWidth="4" />
          <circle cx="172" cy="70" r="11" fill="#7FA8F5" stroke="#FFFFFF" strokeWidth="4" />
          <path d="M100 66 C90 58 84 52 86 46 C88 40 96 40 100 46 C104 40 112 40 114 46 C116 52 110 58 100 66 Z" fill="#EC5F9C" />
        </svg>
      </div>
    ),
    size,
  );
}
