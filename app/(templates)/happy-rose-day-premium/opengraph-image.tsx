// 1200×630 link preview for /happy-rose-day-premium ("The Rose Garden"). Its own bright card (Strawberry Milk pinks,
// maroon ink) instead of the shared dark premium preview, so the link looks like the cute page it opens.
import { ImageResponse } from "next/og";
import { PREMIUM_OG_SIZE } from "../_valentine/kit/premium/ogImage";

export const alt = "Happy Rose Day, The Rose Garden: a little rose garden that grows for them, with your photos, your letter, your voice and your song.";
export const size = PREMIUM_OG_SIZE;
export const contentType = "image/png";

const petal = (x: number, y: number, r: number, c: string) => (
  <div key={`${x}-${y}`} style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, background: c, display: "flex" }} />
);

export default function OpengraphImage() {
  // A flat cartoon rose: five petals around a darker heart, on a stem with two leaves.
  const cx = 930;
  const cy = 250;
  const rose = [
    petal(cx - 62, cy + 6, 62, "#FF8FB5"),
    petal(cx + 62, cy + 6, 62, "#FF8FB5"),
    petal(cx - 36, cy - 52, 60, "#FF6F9C"),
    petal(cx + 36, cy - 52, 60, "#FF6F9C"),
    petal(cx, cy + 30, 66, "#FF7FA8"),
    petal(cx, cy - 10, 44, "#D63F72"),
  ];
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "linear-gradient(150deg, #FFF5F8 0%, #FFE3EC 100%)", fontFamily: "sans-serif" }}>
        {petal(80, 560, 160, "rgba(255,209,223,.6)")}
        {petal(1150, 70, 120, "rgba(255,226,122,.35)")}
        {petal(1080, 600, 90, "rgba(123,196,127,.25)")}
        <div style={{ position: "absolute", left: cx - 5, top: cy + 60, width: 10, height: 250, background: "#6FAE63", borderRadius: 5, display: "flex" }} />
        <div style={{ position: "absolute", left: cx + 4, top: cy + 150, width: 90, height: 44, background: "#7BC47F", borderRadius: "0 44px 0 44px", display: "flex" }} />
        <div style={{ position: "absolute", left: cx - 94, top: cy + 210, width: 90, height: 44, background: "#7BC47F", borderRadius: "44px 0 44px 0", display: "flex" }} />
        {rose}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 0 0 96px", width: 760 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", padding: "8px 18px", borderRadius: 999, background: "#FF6F9C", color: "#fff", fontSize: 22, fontWeight: 700, letterSpacing: 3 }}>PREMIUM</div>
            <div style={{ display: "flex", fontSize: 22, letterSpacing: 4, color: "#D63F72", fontWeight: 700 }}>7 FEBRUARY</div>
          </div>
          <div style={{ display: "flex", marginTop: 34, fontSize: 40, color: "#8A4A5C" }}>Happy Rose Day</div>
          <div style={{ display: "flex", fontSize: 92, lineHeight: 1.02, fontWeight: 800, color: "#5B2333" }}>The Rose Garden</div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 32, lineHeight: 1.35, color: "#8A4A5C" }}>Water it, pick its colour, untie your note. Then roses bloom on your song.</div>
          <div style={{ display: "flex", marginTop: 34, fontSize: 24, color: "#D63F72", fontWeight: 700 }}>subhsandesh.in</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
