// 1200×630 link preview for /happy-hug-day-premium ("The Hug Passport"). Its own bright card (Peach Sorbet + mint,
// cocoa ink) instead of the shared dark premium preview, so the link looks like the cute page it opens: a coral
// passport with a hug emblem and three inked stamps around it.
import { ImageResponse } from "next/og";
import { PREMIUM_OG_SIZE } from "../_valentine/kit/premium/ogImage";

export const alt = "Happy Hug Day, The Hug Passport: they collect every kind of hug, each stamped into their own passport with your photos, your letter, your voice and your song.";
export const size = PREMIUM_OG_SIZE;
export const contentType = "image/png";

const dot = (x: number, y: number, r: number, c: string) => (
  <div key={`${x}-${y}`} style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, background: c, display: "flex" }} />
);
const stamp = (x: number, y: number, r: number, ink: string, label: string, rot: number, round = true) => (
  <div
    key={label}
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: r,
      height: round ? r : r * 0.74,
      borderRadius: round ? r : 16,
      border: `7px solid ${ink}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transform: `rotate(${rot}deg)`,
      color: ink,
      fontSize: 20,
      whiteSpace: "nowrap",
      fontWeight: 800,
      letterSpacing: 2,
      opacity: 0.9,
    }}
  >
    {label}
  </div>
);

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "linear-gradient(150deg, #FFF8F1 0%, #FFE4D2 100%)", fontFamily: "sans-serif" }}>
        {dot(80, 560, 160, "rgba(255,211,184,.6)")}
        {dot(1150, 70, 120, "rgba(159,229,200,.4)")}
        {dot(1080, 600, 90, "rgba(255,122,162,.18)")}
        <div style={{ position: "absolute", left: 800, top: 120, width: 270, height: 370, borderRadius: 24, border: "8px solid #fff", background: "linear-gradient(135deg, #FF9C7E, #E9674A)", transform: "rotate(-6deg)", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 30, boxShadow: "0 20px 40px rgba(224,96,63,.3)" }}>
          <div style={{ display: "flex", color: "#FFF4E6", fontSize: 16, letterSpacing: 4, fontWeight: 700 }}>REPUBLIC OF US</div>
          <div style={{ display: "flex", marginTop: 26, width: 130, height: 130, borderRadius: 65, background: "#FFF4E6", alignItems: "center", justifyContent: "center", fontSize: 70 }}>🤗</div>
          <div style={{ display: "flex", marginTop: 30, color: "#FFFDF9", fontSize: 26, letterSpacing: 2, fontWeight: 800, whiteSpace: "nowrap" }}>HUG PASSPORT</div>
        </div>
        {stamp(700, 70, 160, "#7A52E0", "BACK HUG", -12, false)}
        {stamp(1040, 420, 130, "#1F9A73", "TWIRL", 10)}
        {stamp(700, 440, 120, "#D63F72", "PAT-PAT", 8)}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 0 0 96px", width: 640 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", padding: "8px 18px", borderRadius: 999, background: "#FF8A6B", color: "#fff", fontSize: 22, fontWeight: 700, letterSpacing: 3 }}>PREMIUM</div>
            <div style={{ display: "flex", fontSize: 22, letterSpacing: 4, color: "#E0603F", fontWeight: 700 }}>12 FEBRUARY</div>
          </div>
          <div style={{ display: "flex", marginTop: 34, fontSize: 40, color: "#8A5A48" }}>Happy Hug Day</div>
          <div style={{ display: "flex", fontSize: 90, lineHeight: 1.02, fontWeight: 800, color: "#5E3226" }}>The Hug Passport</div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 32, lineHeight: 1.35, color: "#8A5A48" }}>Collect every kind of hug. The last stamp lands on your song.</div>
          <div style={{ display: "flex", marginTop: 34, fontSize: 24, color: "#E0603F", fontWeight: 700 }}>subhsandesh.in</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
