// The 1200×630 link preview for /dandiya-partner (WhatsApp, X, iMessage, Slack).
// Rendered once at build time by next/og, so it needs no CDN upload and is
// always the right size. The crossed dandiya sticks and the diya are drawn in
// SVG rather than with emoji: next/og fetches emoji images at render time, and
// a build without network would then ship a blank square.
import { ImageResponse } from "next/og";

export const alt = "Be My Dandiya Partner — an interactive Navratri invitation: light nine diyas, clash the sticks on the dhol beat, answer 'Will you be my Dandiya partner?'";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function stick(rot: number, a: string, b: string) {
  return (
    <g transform={`rotate(${rot} 160 160)`}>
      <rect x="20" y="148" width="280" height="24" rx="12" fill={a} />
      <rect x="70" y="148" width="28" height="24" fill={b} />
      <rect x="130" y="148" width="28" height="24" fill="#F6D27A" />
      <rect x="190" y="148" width="28" height="24" fill={b} />
      <rect x="250" y="148" width="20" height="24" fill="#F6D27A" />
      <circle cx="292" cy="160" r="10" fill="#F6D27A" />
    </g>
  );
}

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
          background: "linear-gradient(160deg, #3E0609 0%, #7A0F12 50%, #B3121B 100%)",
          color: "#FFF7E8",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
          <div style={{ fontSize: 26, letterSpacing: 6, color: "#F6D27A", fontWeight: 700 }}>HAPPY NAVRATRI</div>
          <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.08, marginTop: 18 }}>Will you be my Dandiya partner?</div>
          <div style={{ fontSize: 28, lineHeight: 1.4, marginTop: 24, color: "#FFD9C2" }}>
            Light nine diyas, clash the sticks on the dhol beat, twirl in your colour, then answer the big question.
          </div>
          <div style={{ fontSize: 24, marginTop: 34, color: "#FFB627", fontWeight: 700 }}>subhsandesh.in</div>
        </div>
        <svg width="380" height="380" viewBox="0 0 320 320">
          <defs>
            <radialGradient id="g" cx="50%" cy="55%" r="60%">
              <stop offset="0" stopColor="#FFB627" stopOpacity="0.5" />
              <stop offset="1" stopColor="#FFB627" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="160" cy="160" r="150" fill="url(#g)" />
          {stick(-38, "#D7263D", "#1590B8")}
          {stick(38, "#E5489B", "#14A673")}
          <path d="M100 250 Q104 288 160 290 Q214 290 224 256 L240 246 Q226 250 214 250 Q160 258 100 250 Z" fill="#B2501F" />
          <path d="M214 248 Q220 238 224 234" stroke="#3B1B0A" strokeWidth="3" fill="none" />
          <path d="M226 186 Q210 210 214 224 Q218 236 226 236 Q234 236 238 224 Q242 210 226 186 Z" fill="#FFB627" />
          <path d="M226 206 Q220 216 222 224 Q226 230 230 224 Q232 216 226 206 Z" fill="#FFFDF0" />
        </svg>
      </div>
    ),
    size,
  );
}
