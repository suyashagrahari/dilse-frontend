// The 1200×630 link preview for /proposal-premium (WhatsApp, X, iMessage,
// Slack). Rendered once at build time by next/og, so it needs no CDN upload.
// The invitation and its wax seal are drawn in SVG rather than with emoji:
// next/og fetches emoji images at render time, and a build without network
// would ship a blank square.
import { ImageResponse } from "next/og";

export const alt = "The Proposal ✦ Premium — a fairytale proposal page: a wax-sealed invitation, string lights, a story carousel, a ring box and the big question";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BULBS = [80, 190, 300, 410, 520, 630, 740, 850, 960, 1070];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 90px",
          background: "linear-gradient(180deg, #FFFFFF 0%, #FFF4F1 40%, #FAD9D3 80%, #FFD3A6 100%)",
          color: "#4A2430",
          fontFamily: "serif",
        }}
      >
        <svg width="1200" height="120" viewBox="0 0 1200 120" style={{ position: "absolute", left: 0, top: 0 }}>
          <path d="M0 20 Q600 120 1200 20" stroke="#8E2F4B" strokeOpacity="0.5" strokeWidth="3" fill="none" />
          {BULBS.map((x) => {
            const t = x / 1200;
            const y = 20 + 4 * t * (1 - t) * 50;
            return (
              <g key={x}>
                <circle cx={x} cy={y + 22} r="22" fill="#FFD3A6" opacity="0.5" />
                <rect x={x - 6} y={y} width="12" height="9" rx="2" fill="#E3A891" />
                <ellipse cx={x} cy={y + 22} rx="10" ry="14" fill="#FFF6D8" stroke="#E3A891" strokeWidth="2" />
              </g>
            );
          })}
        </svg>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
          <div style={{ fontSize: 26, letterSpacing: 6, color: "#A63D58", fontWeight: 700, fontFamily: "sans-serif" }}>✦ PREMIUM · YOU’RE INVITED</div>
          <div style={{ fontSize: 96, fontWeight: 700, lineHeight: 1.02, marginTop: 18, fontStyle: "italic" }}>The Proposal</div>
          <div style={{ fontSize: 28, lineHeight: 1.4, marginTop: 24, color: "#7A4858", fontFamily: "sans-serif" }}>
            A pastel garden at golden hour: break the wax seal, light the string lights, spin your story carousel, then answer the big question.
          </div>
          <div style={{ fontSize: 24, marginTop: 34, color: "#D45E78", fontWeight: 700, fontFamily: "sans-serif" }}>subhsandesh.in</div>
        </div>
        <svg width="360" height="420" viewBox="0 0 180 210">
          <rect x="10" y="10" width="160" height="190" rx="16" fill="#FFFFFF" stroke="#E3A891" strokeWidth="4" />
          <rect x="20" y="20" width="140" height="170" rx="10" fill="none" stroke="#F1C6BB" strokeWidth="2" strokeDasharray="6 5" />
          <path d="M90 20 L90 190" stroke="#E3A891" strokeWidth="2" />
          <path d="M90 74 C104 74 120 86 120 104 C120 124 104 134 90 134 C76 134 60 124 60 104 C60 86 76 74 90 74 Z" fill="#D45E78" />
          <circle cx="90" cy="104" r="20" fill="#A63D58" opacity="0.5" />
          <path d="M90 94 C87 89 79 89 79 96 C79 102 90 110 90 110 C90 110 101 102 101 96 C101 89 93 89 90 94 Z" fill="#FFFFFF" />
          <path d="M60 162 L64 154 L72 154 L76 162 L68 172 Z" fill="#E3F4FF" stroke="#8DBCE0" strokeWidth="1.5" />
          <ellipse cx="68" cy="178" rx="10" ry="7" fill="none" stroke="#E9B95A" strokeWidth="4" />
          <path d="M138 40 L141 49 L150 52 L141 55 L138 64 L135 55 L126 52 L135 49 Z" fill="#E3A891" />
        </svg>
      </div>
    ),
    size,
  );
}
