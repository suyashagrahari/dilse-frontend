// The 1200x630 link preview for /garden-wedding-invitation (WhatsApp, X, iMessage, Slack).
// Rendered once at build time by next/og over the template's own watercolour art
// (public/wedding-v3/template1/gw-og.jpg: sky, clouds, the gazebo with the couple,
// a peacock, lanterns and lotus, composed from the owner's assets and served from
// the repo, never the CDN). ASCII only: the webpack dev loader rejects other bytes here.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Mughal Garden Wedding Invitation \u2014 a pastel watercolour garden: the couple in a pink gazebo, a peacock, lanterns and lotus, with every function, RSVP and blessings on one link";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ROSE = "#A94E63";
const INK = "#4A2230";

export default async function OpengraphImage() {
  const art = await readFile(join(process.cwd(), "public/wedding-v3/template1/gw-og.jpg"));
  const src = `data:image/jpeg;base64,${art.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", fontFamily: "serif", color: INK }}>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img src={src} width={1200} height={630} style={{ position: "absolute", left: 0, top: 0, width: 1200, height: 630 }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 0 0 80px", width: 640, height: "100%" }}>
          <div style={{ fontSize: 22, letterSpacing: 7, color: ROSE, fontWeight: 700, fontFamily: "sans-serif" }}>{"SHUBH VIVAH \u00b7 IN THE GARDEN"}</div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 70, fontWeight: 700, lineHeight: 1.04, marginTop: 20 }}>
            <span>Mughal Garden</span>
            <span>Wedding Invitation</span>
          </div>
          <div style={{ fontSize: 27, lineHeight: 1.42, marginTop: 22, color: "#7E5F66", fontFamily: "sans-serif" }}>
            Clouds part over a pink gazebo, a peacock struts in, the fountain plays. Every function, RSVP and blessings, on one link.
          </div>
          <div style={{ fontSize: 24, marginTop: 28, color: ROSE, fontWeight: 700, fontFamily: "sans-serif" }}>subhsandesh.in</div>
        </div>
      </div>
    ),
    size,
  );
}
