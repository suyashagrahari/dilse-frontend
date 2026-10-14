// The 1200×630 link preview for /sorry-premium (WhatsApp, X, iMessage, Slack).
// Rendered once at build time by next/og, so it needs no CDN upload. The bear,
// the umbrella and the rainbow are SVG rather than emoji: next/og fetches emoji
// images at render time, and a build without network would ship a blank square.
import { ImageResponse } from "next/og";

export const alt = "I'm Sorry ✦ Premium — After the Rain: a little bear under an umbrella at your door, a wilted flower to water, and a sky that clears into a rainbow.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#5A3B33";
const BOW = ["#FFB3C1", "#FFD0A1", "#FFF0A6", "#C6EFC0", "#B8DEFF", "#D4C4FF"];

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
          background: "linear-gradient(180deg, #E4E2EE 0%, #FFE3EC 48%, #FFF6EE 100%)",
          color: "#4E2533",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute", left: 0, top: 0 }}>
          {BOW.map((c, k) => (
            <path key={c} d={`M${640 + k * 22} 640 A${300 - k * 22} ${300 - k * 22} 0 0 1 ${1240 - k * 22} 640`} fill="none" stroke={c} strokeWidth="22" opacity="0.85" />
          ))}
          <circle cx="1080" cy="110" r="52" fill="#FFDD6E" opacity="0.9" />
        </svg>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
          <div style={{ display: "flex", fontSize: 24, letterSpacing: 6, color: "#B5365A", fontWeight: 700 }}>✦ PREMIUM · KNOCK KNOCK</div>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.05, marginTop: 18 }}>Someone is sorry, and it&apos;s raining a little</div>
          <div style={{ fontSize: 28, lineHeight: 1.4, marginTop: 22, color: "#7A4B5B" }}>
            Water the wilted flower, mend a cracked heart, sail the letter across a puddle and watch the rain clear into a rainbow.
          </div>
          <div style={{ fontSize: 24, marginTop: 30, color: "#E0567B", fontWeight: 700 }}>subhsandesh.in</div>
        </div>
        <svg width="360" height="450" viewBox="0 0 200 250">
          <path d="M100 26 L100 132" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <path d="M14 92 C18 46 56 18 100 18 C144 18 182 46 186 92 C172 82 158 82 143 92 C130 82 114 82 100 92 C86 82 70 82 57 92 C42 82 28 82 14 92 Z" fill="#F08AA6" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <path d="M40 54 C52 36 70 28 86 26" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.55" />
          <circle cx="64" cy="128" r="15" fill="#FFF8EF" stroke={INK} strokeWidth="4" />
          <circle cx="136" cy="128" r="15" fill="#FFF8EF" stroke={INK} strokeWidth="4" />
          <ellipse cx="100" cy="212" rx="44" ry="30" fill="#FFF8EF" stroke={INK} strokeWidth="4" />
          <path d="M66 226 h22 v18 h-26 q-2 -8 4 -18 Z" fill="#FFD45E" stroke={INK} strokeWidth="3.5" />
          <path d="M112 226 h22 q6 10 4 18 h-26 Z" fill="#FFD45E" stroke={INK} strokeWidth="3.5" />
          <ellipse cx="100" cy="162" rx="50" ry="42" fill="#FFF8EF" stroke={INK} strokeWidth="4" />
          <ellipse cx="72" cy="176" rx="9" ry="6" fill="#F7B3C5" />
          <ellipse cx="128" cy="176" rx="9" ry="6" fill="#F7B3C5" />
          <circle cx="82" cy="160" r="6" fill={INK} />
          <circle cx="118" cy="160" r="6" fill={INK} />
          <circle cx="84" cy="158" r="2" fill="#FFFFFF" />
          <circle cx="120" cy="158" r="2" fill="#FFFFFF" />
          <ellipse cx="100" cy="172" rx="5" ry="3.6" fill={INK} />
          <path d="M94 182 q6 4 12 0" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <ellipse cx="104" cy="134" rx="10" ry="8" fill="#FFF8EF" stroke={INK} strokeWidth="3.5" />
        </svg>
      </div>
    ),
    size,
  );
}
