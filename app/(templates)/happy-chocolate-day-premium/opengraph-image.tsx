// 1200×630 link preview for /happy-chocolate-day-premium — "The Sweetheart Chocolate Factory": a bright Choco Latte +
// Strawberry Milk card (a box of kawaii truffles under a candy factory), not the shared dark premium preview.
import { ImageResponse } from "next/og";

export const alt = "Happy Chocolate Day — The Sweetheart Chocolate Factory: a cute chocolate factory made for her, with a golden ticket, a box of truffles, your photos dipped in chocolate and a chocolate fountain on your song.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PINK = "#FF6F9C";
const DEEP = "#D63F72";
const CHOC = "#5A3221";
const INK = "#4A2C1E";
const TRUFFLES = ["#A0673F", "#FF8FAB", "#D9954A", "#5A3221", "#E8A0B4", "#E6B85C"];

function Truffle({ color, x, y }: { color: string; x: number; y: number }) {
  const eye = color === "#5A3221" ? "#FFF3E6" : "#2B160D";
  return (
    <svg style={{ position: "absolute", left: x, top: y }} width="92" height="92" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="46" fill="#FF9EBB" />
      <circle cx="50" cy="50" r="38" fill="#FFF1F5" />
      <circle cx="50" cy="54" r="30" fill={color} />
      <ellipse cx="40" cy="42" rx="7" ry="4" fill="#fff" opacity=".3" />
      <ellipse cx="41" cy="56" rx="3" ry="4" fill={eye} />
      <ellipse cx="59" cy="56" rx="3" ry="4" fill={eye} />
      <ellipse cx="34" cy="63" rx="5" ry="3" fill="#FF7FA3" opacity=".7" />
      <ellipse cx="66" cy="63" rx="5" ry="3" fill="#FF7FA3" opacity=".7" />
      <path d="M45 63 Q50 69 55 63" fill="none" stroke={eye} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "linear-gradient(150deg, #FFF8F0 0%, #FFE3EC 55%, #F6E2CF 100%)", fontFamily: "sans-serif" }}>
        {/* factory skyline */}
        <svg style={{ position: "absolute", right: 40, top: 30 }} width="460" height="170" viewBox="0 0 460 170">
          <path d="M90 40 c -10 -12 -30 -2 -18 12 l 18 15 l 18 -15 c 12 -14 -8 -24 -18 -12 z" fill="#FFB3C6" />
          <path d="M330 30 c -10 -12 -30 -2 -18 12 l 18 15 l 18 -15 c 12 -14 -8 -24 -18 -12 z" fill="#FFB3C6" />
          <rect x="76" y="70" width="28" height="70" rx="5" fill="#C98A5B" />
          <rect x="70" y="64" width="40" height="12" rx="5" fill="#FF8FAB" />
          <rect x="316" y="62" width="28" height="78" rx="5" fill="#C98A5B" />
          <rect x="310" y="56" width="40" height="12" rx="5" fill="#FF8FAB" />
          <path d="M20 170 V120 L90 96 L160 120 L230 96 L300 120 L370 96 L440 120 V170 Z" fill="#E7BFA0" />
        </svg>
        {/* the box of truffles */}
        <div style={{ position: "absolute", right: 70, top: 200, width: 420, height: 330, borderRadius: 40, background: "linear-gradient(180deg, #FF9EBB, #FF8FAB)", boxShadow: `0 10px 0 ${DEEP}`, display: "flex" }}>
          <div style={{ position: "absolute", left: 16, top: 16, right: 16, bottom: 16, borderRadius: 28, background: "#FFF1F5", display: "flex" }} />
          {TRUFFLES.map((c, i) => (
            <Truffle key={i} color={c} x={44 + (i % 3) * 120} y={52 + Math.floor(i / 3) * 124} />
          ))}
          <div style={{ position: "absolute", left: 100, top: -26, padding: "10px 22px", borderRadius: 99, background: "#fff", color: DEEP, fontSize: 24, fontWeight: 800, boxShadow: "0 5px 0 #FFD1DF" }}>Six reasons. All you.</div>
        </div>
        <div style={{ position: "absolute", left: 80, top: 130, display: "flex", flexDirection: "column", maxWidth: 600 }}>
          <div style={{ display: "flex", alignSelf: "flex-start", padding: "8px 18px", borderRadius: 99, background: "#fff", color: "#7B4A2E", fontSize: 22, fontWeight: 800, letterSpacing: 3 }}>
            CHOCOLATE DAY · 9 FEBRUARY
          </div>
          <div style={{ display: "flex", marginTop: 22, fontSize: 74, fontWeight: 900, lineHeight: 1.02, color: PINK, letterSpacing: -1 }}>The Sweetheart</div>
          <div style={{ display: "flex", fontSize: 74, fontWeight: 900, lineHeight: 1.02, color: CHOC, letterSpacing: -1 }}>Chocolate Factory</div>
          <div style={{ display: "flex", marginTop: 22, fontSize: 29, lineHeight: 1.35, color: INK, fontWeight: 600 }}>
            A cute chocolate factory made just for her: truffles with reasons, your photos dipped in chocolate, and a fountain on the chorus of your song.
          </div>
          <div style={{ display: "flex", marginTop: 26, alignSelf: "flex-start", padding: "14px 30px", borderRadius: 99, background: "linear-gradient(135deg, #FFF3C4, #F2B544)", color: "#6B4210", fontSize: 28, fontWeight: 800, boxShadow: "0 6px 0 #D99A2B" }}>
            ✦ GOLDEN TICKET ✦
          </div>
        </div>
      </div>
    ),
    size,
  );
}
