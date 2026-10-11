// 1200×630 link preview for /happy-valentines-day-premium — "Be My Valentine Carnival": a bright pastel card
// (Cherry Soda + lavender), not the shared dark premium preview.
import { ImageResponse } from "next/og";

export const alt = "Happy Valentine's Day — Be My Valentine Carnival: a pastel funfair made for her, with balloons, a love meter, a Ferris wheel of your photos and the big question.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PINK = "#FF4D6D";
const DEEP = "#C9184A";
const INK = "#590D22";

function Balloon({ x, y, color, s = 1 }: { x: number; y: number; color: string; s?: number }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={70 * s} height={104 * s} viewBox="0 0 60 92">
        <path d="M30 56 C 6 40, 0 26, 0 17 A 15 15 0 0 1 30 12 A 15 15 0 0 1 60 17 C 60 26, 54 40, 30 56 Z" fill={color} />
        <path d="M12 10 Q 8 18 11 26" stroke="#fff" strokeOpacity=".7" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M30 58 C 24 70, 36 76, 30 92" stroke={DEEP} strokeOpacity=".4" strokeWidth="1.6" fill="none" />
      </svg>
    </div>
  );
}

export default function OpengraphImage() {
  const flags = ["#FF4D6D", "#FFD166", "#B9A7FF", "#FFB3C6", "#7FD8BE", "#FF9E6B"];
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "linear-gradient(150deg, #FFF0F3 0%, #FFD6E0 55%, #EDE3FF 100%)", fontFamily: "sans-serif" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", justifyContent: "space-around" }}>
          {Array.from({ length: 16 }, (_, i) => (
            <div key={i} style={{ width: 0, height: 0, borderLeft: "26px solid transparent", borderRight: "26px solid transparent", borderTop: `48px solid ${flags[i % flags.length]}` }} />
          ))}
        </div>
        {/* Ferris wheel */}
        <svg style={{ position: "absolute", right: 70, top: 110 }} width="400" height="440" viewBox="0 0 200 220">
          <circle cx="100" cy="100" r="80" fill="none" stroke={PINK} strokeWidth="5" />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return <line key={i} x1="100" y1="100" x2={100 + 80 * Math.cos(a)} y2={100 + 80 * Math.sin(a)} stroke="#FF8FAB" strokeWidth="3" />;
          })}
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return <rect key={`c${i}`} x={100 + 80 * Math.cos(a) - 13} y={100 + 80 * Math.sin(a) - 4} width="26" height="24" rx="8" fill={flags[i % flags.length]} />;
          })}
          <path d="M100 100 L58 214 M100 100 L142 214" stroke={DEEP} strokeWidth="7" strokeLinecap="round" />
          <circle cx="100" cy="100" r="14" fill={PINK} />
        </svg>
        <Balloon x={70} y={60} color="#FF4D6D" />
        <Balloon x={140} y={40} color="#B9A7FF" s={0.85} />
        <Balloon x={530} y={70} color="#FFD166" s={0.8} />
        <div style={{ position: "absolute", left: 80, top: 190, display: "flex", flexDirection: "column", maxWidth: 640 }}>
          <div style={{ display: "flex", alignSelf: "flex-start", padding: "8px 18px", borderRadius: 99, background: "#fff", color: DEEP, fontSize: 22, fontWeight: 800, letterSpacing: 3 }}>
            VALENTINE&apos;S DAY · 14 FEBRUARY
          </div>
          <div style={{ display: "flex", marginTop: 22, fontSize: 78, fontWeight: 900, lineHeight: 1.02, color: PINK, letterSpacing: -1 }}>Be My Valentine</div>
          <div style={{ display: "flex", fontSize: 78, fontWeight: 900, lineHeight: 1.02, color: DEEP, letterSpacing: -1 }}>Carnival</div>
          <div style={{ display: "flex", marginTop: 22, fontSize: 30, lineHeight: 1.35, color: INK, fontWeight: 600 }}>
            A pastel funfair made just for her: balloons, a love meter, your photos on a Ferris wheel and one big question.
          </div>
          <div style={{ display: "flex", marginTop: 26, alignSelf: "flex-start", padding: "14px 30px", borderRadius: 99, background: PINK, color: "#fff", fontSize: 28, fontWeight: 800, boxShadow: `0 6px 0 ${DEEP}` }}>
            ADMIT ONE
          </div>
        </div>
      </div>
    ),
    size,
  );
}
