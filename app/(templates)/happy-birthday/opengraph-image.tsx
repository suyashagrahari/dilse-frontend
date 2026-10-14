// The 1200×630 link preview for /happy-birthday (WhatsApp, X, iMessage, Slack).
// Rendered once at build time by next/og, so it needs no CDN upload. The cake
// is drawn in SVG rather than with emoji: next/og fetches emoji images at
// render time, and a build without network would ship a blank square.
import { ImageResponse } from "next/og";

export const alt = "Happy Birthday — a cute birthday surprise page: a frosted cake with candles to blow out, balloons to pop and a Birthday Queen crown";
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
          background: "linear-gradient(160deg, #FFF1F4 0%, #FFD6E0 60%, #FFC2D3 100%)",
          color: "#5B2236",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 620 }}>
          <div style={{ fontSize: 26, letterSpacing: 6, color: "#C93A63", fontWeight: 700 }}>PSST… UNTIE THE RIBBON</div>
          <div style={{ fontSize: 78, fontWeight: 800, lineHeight: 1.05, marginTop: 18 }}>Someone made you a birthday surprise</div>
          <div style={{ fontSize: 28, lineHeight: 1.4, marginTop: 24, color: "#8E5468" }}>
            Light the candles, make a wish, cut the cake, pop the balloons and claim your crown.
          </div>
          <div style={{ fontSize: 24, marginTop: 34, color: "#EE5583", fontWeight: 700 }}>subhsandesh.in</div>
        </div>
        <svg width="400" height="400" viewBox="0 0 300 300">
          <circle cx="150" cy="160" r="140" fill="#FFFFFF" opacity="0.5" />
          <ellipse cx="150" cy="262" rx="140" ry="22" fill="#FFFFFF" stroke="#FBC3D2" strokeWidth="3" />
          <path d="M40 150 L40 248 A110 19 0 0 0 260 248 L260 150 Z" fill="#FFB3C8" />
          <path d="M40 202 A110 19 0 0 0 260 202 L260 210 A110 19 0 0 1 40 210 Z" fill="#F6D7A9" />
          <ellipse cx="150" cy="150" rx="110" ry="22" fill="#FFFFFF" />
          <path d="M40 150 C40 160 44 176 50 176 C56 176 56 160 60 160 C64 160 64 186 72 186 C80 186 80 164 86 164 C92 164 92 172 98 172 C104 172 104 162 112 166 C120 170 118 192 128 192 C138 192 136 168 144 170 C152 172 150 182 158 182 C166 182 164 166 172 166 C180 166 180 196 190 196 C200 196 198 168 206 168 C214 168 212 180 220 180 C228 180 226 162 234 162 C242 162 242 184 250 182 C258 180 260 162 260 150 A110 22 0 0 0 40 150 Z" fill="#EE5583" />
          <ellipse cx="150" cy="147" rx="104" ry="18" fill="#EE5583" />
          <rect x="94" y="96" width="12" height="46" rx="3" fill="#FFFFFF" stroke="#C93A63" strokeWidth="2" />
          <rect x="144" y="84" width="12" height="54" rx="3" fill="#FFFFFF" stroke="#C93A63" strokeWidth="2" />
          <rect x="194" y="96" width="12" height="46" rx="3" fill="#FFFFFF" stroke="#C93A63" strokeWidth="2" />
          <path d="M100 70 C107 80 108 87 100 92 C92 87 93 80 100 70 Z" fill="#FFB23E" />
          <path d="M150 58 C157 68 158 75 150 80 C142 75 143 68 150 58 Z" fill="#FFB23E" />
          <path d="M200 70 C207 80 208 87 200 92 C192 87 193 80 200 70 Z" fill="#FFB23E" />
          <ellipse cx="44" cy="70" rx="24" ry="29" fill="#FFC94D" />
          <ellipse cx="262" cy="56" rx="22" ry="27" fill="#B79CF2" />
          <path d="M44 99 C50 130 40 150 46 170" stroke="#8E5468" strokeWidth="2" fill="none" />
          <path d="M262 83 C256 110 266 130 258 150" stroke="#8E5468" strokeWidth="2" fill="none" />
        </svg>
      </div>
    ),
    size,
  );
}
