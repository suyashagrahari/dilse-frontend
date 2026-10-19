// The 1200×630 link preview for /digital-bouquet (WhatsApp, X, iMessage,
// Slack). Rendered once at build time by next/og, so it needs no CDN upload.
// The bouquet is drawn in SVG rather than with emoji: next/og fetches emoji
// images at render time, and a build without network would ship a blank square.
import { ImageResponse } from "next/og";

export const alt = "Digital Bouquet ✦ — arrange a bouquet flower by flower, wrap it, write the card, and send a link that blooms open stem by stem";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const petals = (cx: number, cy: number, r: number, fill: string, deep: string) =>
  Array.from({ length: 6 }, (_, k) => {
    const a = (k * Math.PI) / 3;
    return <circle key={k} cx={cx + Math.cos(a) * r * 0.55} cy={cy + Math.sin(a) * r * 0.55} r={r * 0.55} fill={fill} stroke={deep} strokeWidth="2" />;
  });

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
          padding: "0 70px 0 84px",
          background: "linear-gradient(160deg, #FFF9F6 0%, #FFEFF3 50%, #FCDDE6 100%)",
          color: "#4A2231",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
          <div style={{ fontSize: 24, letterSpacing: 8, color: "#AE2F57", fontWeight: 700, fontFamily: "sans-serif" }}>PREMIUM · FLOWERS FOR YOU</div>
          <div style={{ fontSize: 96, fontWeight: 700, lineHeight: 1, marginTop: 18 }}>Digital Bouquet</div>
          <div style={{ fontSize: 30, lineHeight: 1.4, marginTop: 24, color: "#7D4E5F", fontFamily: "sans-serif" }}>
            Arrange it flower by flower, wrap it, tie the ribbon, write the card. They watch it bloom, stem by stem.
          </div>
          <div style={{ fontSize: 24, marginTop: 34, color: "#D94A75", fontWeight: 700, fontFamily: "sans-serif" }}>subhsandesh.in</div>
        </div>
        <svg width="400" height="520" viewBox="0 0 200 260">
          <circle cx="100" cy="92" r="92" fill="#FFFFFF" opacity="0.6" />
          <path d="M100 250 L18 70 Q60 40 100 58 Q140 40 182 70 Z" fill="#FFE0E9" stroke="#F3C9D5" strokeWidth="2" />
          <path d="M100 100 L100 220 M70 96 L96 220 M132 96 L104 220" stroke="#5C8A4C" strokeWidth="3" />
          {petals(100, 78, 28, "#F7B5C8", "#EC8FAC")}
          <circle cx="100" cy="78" r="9" fill="#FFE3A1" />
          {petals(58, 104, 22, "#D7263D", "#9E1530")}
          <circle cx="58" cy="104" r="7" fill="#7A0F22" />
          {petals(142, 104, 22, "#FFFFFF", "#EADCCB")}
          <circle cx="142" cy="104" r="7" fill="#F6C531" />
          {petals(80, 46, 16, "#FF7A9C", "#E04F75")}
          {petals(124, 48, 16, "#A98BDB", "#7E62B8")}
          <path d="M28 120 Q100 160 172 120 L100 250 Z" fill="#FCE1E8" stroke="#F3C9D5" strokeWidth="2" />
          <path d="M80 184 Q100 192 120 184 L121 196 Q100 204 79 196 Z" fill="#D94A75" />
          <path d="M100 190 C84 170 62 172 66 186 C70 198 90 196 100 190 Z M100 190 C116 170 138 172 134 186 C130 198 110 196 100 190 Z" fill="#D94A75" stroke="#AE2F57" strokeWidth="1.5" />
        </svg>
      </div>
    ),
    size,
  );
}
