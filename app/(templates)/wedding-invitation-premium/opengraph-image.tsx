// The 1200×630 link preview for /wedding-invitation-premium (WhatsApp, X,
// iMessage, Slack). Rendered once at build time by next/og: blush paper, a
// rose-gold monogram ring and the five functions. Drawn in SVG + system
// serif (no emoji, no network fetch at render time).
import { ImageResponse } from "next/og";

export const alt = "Wedding Invitation ✦ Premium — a wedding website with your story, Haldi to Reception with maps and dress codes, a 20-photo gallery and RSVP for each function";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const FUNCTIONS = ["Haldi", "Mehendi", "Sangeet", "Wedding", "Reception"];

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
          background: "radial-gradient(120% 120% at 30% 0%, #FFFAF8 0%, #FBF0EE 50%, #F1D6D2 100%)",
          color: "#3E1F27",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 650 }}>
          <div style={{ fontSize: 22, letterSpacing: 9, color: "#8A5233", fontWeight: 700, fontFamily: "sans-serif" }}>PREMIUM · WEDDING WEBSITE</div>
          <div style={{ fontSize: 84, lineHeight: 1.02, marginTop: 18 }}>Every function,</div>
          <div style={{ fontSize: 84, lineHeight: 1.02, color: "#A94E63", fontStyle: "italic" }}>one beautiful link</div>
          <div style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap" }}>
            {FUNCTIONS.map((f) => (
              <div key={f} style={{ display: "flex", padding: "8px 18px", borderRadius: 99, border: "2px solid #C08A5C", fontSize: 24, color: "#8A5233", fontFamily: "sans-serif" }}>
                {f}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 26, lineHeight: 1.4, marginTop: 26, color: "#87636A", fontFamily: "sans-serif" }}>Your story · both families · 20 photos · RSVP per function</div>
          <div style={{ fontSize: 24, marginTop: 26, color: "#A94E63", fontWeight: 700, fontFamily: "sans-serif" }}>subhsandesh.in</div>
        </div>
        {/* satori draws no SVG <text>: the monogram letters sit over the ring as a div. */}
        <div style={{ display: "flex", position: "relative", width: 360, height: 360 }}>
        <svg width="360" height="360" viewBox="0 0 200 200">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#7A4F12" />
              <stop offset="0.35" stopColor="#DCB768" />
              <stop offset="0.5" stopColor="#F6E3B4" />
              <stop offset="0.65" stopColor="#C3953F" />
              <stop offset="1" stopColor="#7A4F12" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="94" fill="#FFFAF8" stroke="url(#g)" strokeWidth="5" />
          <circle cx="100" cy="100" r="82" fill="none" stroke="url(#g)" strokeWidth="1.5" strokeDasharray="2 5" />
          {Array.from({ length: 12 }, (_, k) => {
            const a = (k * Math.PI) / 6;
            return <circle key={k} cx={100 + Math.cos(a) * 88} cy={100 + Math.sin(a) * 88} r="3" fill="url(#g)" />;
          })}
          <path d="M60 140 Q100 156 140 140" stroke="url(#g)" strokeWidth="2" fill="none" />
        </svg>
          <div style={{ position: "absolute", left: 0, top: 0, width: 360, height: 360, display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: 14, fontSize: 97, fontStyle: "italic", color: "#B0873A" }}>
            A &amp; V
          </div>
        </div>
      </div>
    ),
    size,
  );
}
