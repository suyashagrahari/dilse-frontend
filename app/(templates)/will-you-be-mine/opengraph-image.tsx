// The 1200×630 link preview for /will-you-be-mine (WhatsApp, X, iMessage,
// Slack). Rendered once at build time by next/og, so it needs no CDN upload.
// The ring box is drawn in SVG rather than with emoji: next/og fetches emoji
// images at render time, and a build without network would ship a blank square.
import { ImageResponse } from "next/og";

export const alt = "Will You Be Mine? — a cute proposal page: a velvet ring box, your story, a heart constellation of reasons and the big question";
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
          background: "linear-gradient(160deg, #FFF3F0 0%, #FBDCD6 55%, #F3BFC4 100%)",
          color: "#4E2530",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
          <div style={{ fontSize: 26, letterSpacing: 6, color: "#B8435F", fontWeight: 700, fontFamily: "sans-serif" }}>PSST… I HAVE A QUESTION</div>
          <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1.02, marginTop: 18, fontStyle: "italic" }}>Will you be mine?</div>
          <div style={{ fontSize: 28, lineHeight: 1.4, marginTop: 24, color: "#86566A", fontFamily: "sans-serif" }}>
            Open a velvet ring box, walk our story, connect the stars into a heart, then answer the big question.
          </div>
          <div style={{ fontSize: 24, marginTop: 34, color: "#E0637F", fontWeight: 700, fontFamily: "sans-serif" }}>subhsandesh.in</div>
        </div>
        <svg width="400" height="400" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="96" fill="#FFFFFF" opacity="0.55" />
          <path d="M40 104 L46 40 Q48 32 56 32 L144 32 Q152 32 154 40 L160 104 Z" fill="#B8435F" />
          <path d="M50 100 L54 46 Q55 40 61 40 L139 40 Q145 40 146 46 L150 100 Z" fill="#FBDCD6" />
          <rect x="30" y="104" width="140" height="76" rx="16" fill="#B8435F" />
          <rect x="30" y="104" width="140" height="10" rx="5" fill="#FFFFFF" opacity="0.18" />
          <ellipse cx="100" cy="110" rx="62" ry="12" fill="#6E2439" />
          <ellipse cx="100" cy="108" rx="56" ry="9" fill="#FBDCD6" />
          <ellipse cx="100" cy="92" rx="22" ry="20" fill="none" stroke="#E9B95A" strokeWidth="7" />
          <path d="M86 70 L92 62 L108 62 L114 70 L100 84 Z" fill="#DDF2FF" stroke="#7FB6E6" strokeWidth="1.5" />
          <path d="M118 50 L121 59 L130 62 L121 65 L118 74 L115 65 L106 62 L115 59 Z" fill="#FFFFFF" />
          <path d="M156 20 C150 14 142 16 142 23 C142 30 156 38 156 38 C156 38 170 30 170 23 C170 16 162 14 156 20 Z" fill="#E0637F" />
          <path d="M40 150 C36 146 30 148 30 153 C30 158 40 164 40 164 C40 164 50 158 50 153 C50 148 44 146 40 150 Z" fill="#FFFFFF" opacity="0.5" />
        </svg>
      </div>
    ),
    size,
  );
}
