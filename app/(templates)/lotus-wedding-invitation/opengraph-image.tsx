// The 1200x630 link preview for /lotus-wedding-invitation (WhatsApp, X, iMessage, Slack).
// Rendered once at build time by next/og. The art is the owner's (gold string
// lights, brass lamps, the couple before the faded gopuram, pink lotuses),
// pre-composed into public/wedding-v3/lotus/og-base.jpg because next/og
// cannot decode WebP; the words are drawn on top. Served from the repo, never
// the CDN. Keep this file ASCII-only (the webpack dev loader rejects others).
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Lotus Temple Wedding Invitation: a lotus blooming in a temple pond, brass lamps, gold string lights and the gopuram, with every function, RSVP and a blessings wall on one link";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ROSE = "#8C3550";
const SAGE = "#4E6E5D";

export default async function OpengraphImage() {
  const base = await readFile(path.join(process.cwd(), "public/wedding-v3/lotus/og-base.jpg"));
  const src = `data:image/jpeg;base64,${base.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", fontFamily: "serif", color: "#3A2C14" }}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img src={src} width={1200} height={630} style={{ position: "absolute", left: 0, top: 0 }} />
        <div style={{ position: "absolute", left: 70, top: 150, width: 610, display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 20, letterSpacing: 7, color: SAGE, fontWeight: 700, fontFamily: "sans-serif" }}>SHRI GANESHAY NAMAH</div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 56, lineHeight: 1.08, marginTop: 16, color: ROSE }}>
            <span>Lotus Temple</span>
            <span>Wedding Invitation</span>
          </div>
          <div style={{ fontSize: 23, lineHeight: 1.45, marginTop: 20, width: 540, color: "#5A5040", fontFamily: "sans-serif" }}>
            A lotus blooms, the brass lamps light up and your muhurtham, every function, RSVP and blessings follow. One link.
          </div>
          <div style={{ display: "flex", marginTop: 26 }}>
            <div style={{ display: "flex", padding: "10px 22px", borderRadius: 999, background: SAGE, color: "#FFFDF6", fontSize: 22, fontWeight: 700, fontFamily: "sans-serif" }}>subhsandesh.in</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
