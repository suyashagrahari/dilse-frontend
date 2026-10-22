// The 1200x630 link preview for /palace-door-wedding-invitation (WhatsApp, X, iMessage, Slack).
// Rendered once at build time by next/og from the template's own art in the
// repo (public/wedding-v3/palace-door/og-*: small PNG/JPEG copies of the door,
// the gold frame, the jhumkas and the banana leaves, because satori does not
// read webp). Read from disk, never fetched. ASCII only in this file: the
// webpack dev loader rejects other characters in opengraph-image modules.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Palace Door Wedding Invitation: a carved Rajasthani haveli door swings open onto an ivory palace courtyard, every function with its own illustrated couple, RSVP and a blessings wall, on one link";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GOLD = "#A8742E";

function dataUri(file: string, mime: string): string {
  try {
    return `data:${mime};base64,${readFileSync(join(process.cwd(), "public/wedding-v3/palace-door", file)).toString("base64")}`;
  } catch {
    return "";
  }
}

export default function OpengraphImage() {
  const door = dataUri("og-door.jpg", "image/jpeg");
  const frame = dataUri("og-frame.png", "image/png");
  const leaves = dataUri("og-leaves.png", "image/png");
  const jhumka = dataUri("og-jhumka.png", "image/png");
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          alignItems: "center",
          background: "radial-gradient(circle at 70% 40%, #FFF9EC 0%, #F4E6C6 58%, #E6D0A0 100%)",
          color: "#3A2414",
          fontFamily: "serif",
        }}
      >
        {door && (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img src={door} width={330} height={586} style={{ position: "absolute", left: 92, top: 22, borderRadius: 6, boxShadow: "0 30px 60px rgba(70,40,10,.35)" }} />
        )}
        {frame && (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img src={frame} width={170} height={175} style={{ position: "absolute", left: 172, top: 150 }} />
        )}
        <div style={{ position: "absolute", left: 172, top: 150, width: 170, height: 175, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 118, height: 118, borderRadius: 60, background: "#FFF8E8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, color: "#8A5A1C", fontStyle: "italic" }}>
            {"I & K"}
          </div>
        </div>
        {jhumka && (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img src={jhumka} width={100} height={200} style={{ position: "absolute", left: 16, top: -8 }} />
        )}
        {leaves && (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img src={leaves} width={240} height={222} style={{ position: "absolute", left: -40, bottom: -40 }} />
        )}
        <div style={{ display: "flex", flexDirection: "column", marginLeft: 500, maxWidth: 640 }}>
          <div style={{ fontSize: 22, letterSpacing: 8, color: GOLD, fontWeight: 700, fontFamily: "sans-serif" }}>{"SHUBH VIVAH - THE DOORS OPEN"}</div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 70, fontWeight: 700, lineHeight: 1.04, marginTop: 18 }}>
            <span>Palace Door</span>
            <span>Wedding Invitation</span>
          </div>
          <div style={{ fontSize: 27, lineHeight: 1.42, marginTop: 22, color: "#6A4A30", fontFamily: "sans-serif" }}>
            A carved haveli door swings open onto your courtyard: every function with its own couple, RSVP and blessings.
          </div>
          <div style={{ fontSize: 24, marginTop: 28, color: GOLD, fontWeight: 700, fontFamily: "sans-serif" }}>subhsandesh.in</div>
        </div>
      </div>
    ),
    size,
  );
}
