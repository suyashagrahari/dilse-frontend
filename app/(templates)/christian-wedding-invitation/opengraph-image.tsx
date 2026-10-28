// The 1200x630 link preview for /christian-wedding-invitation (WhatsApp, X, iMessage, Slack).
// Rendered once at build time by next/og over the template's own art plate
// (public/wedding-v3/faith-christian/og-base.jpg; JPEG because satori reads no WebP).
// Read from disk, never fetched: no network at build time.
// ASCII only in this file: the webpack dev loader rejects other characters here.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Holy Matrimony Wedding Invitation - a Christian church wedding invitation: a carved chapel arch crowned with white lilies, doves, the cross in gold, every event with RSVP on one link";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SCRIPT = "#4E5D49";
const GOLD = "#9A7434";
const INK = "#2F322C";

export default async function OpengraphImage() {
  const plate = await readFile(join(process.cwd(), "public/wedding-v3/faith-christian/og-base.jpg"));
  const src = `data:image/jpeg;base64,${plate.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", fontFamily: "serif", color: INK }}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img src={src} width={1200} height={630} style={{ position: "absolute", left: 0, top: 0, width: 1200, height: 630 }} />
        <div style={{ position: "absolute", left: 84, top: 128, width: 560, display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 20, letterSpacing: 7, color: GOLD, fontWeight: 700, fontFamily: "sans-serif" }}>BY THE GRACE OF GOD</div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 76, fontStyle: "italic", lineHeight: 1.02, marginTop: 18, color: SCRIPT }}>
            <span>Holy Matrimony</span>
          </div>
          <div style={{ fontSize: 40, lineHeight: 1.1, marginTop: 6, color: INK }}>Wedding Invitation</div>
          <div style={{ width: 120, height: 2, background: GOLD, marginTop: 26, opacity: 0.7 }} />
          <div style={{ fontSize: 25, lineHeight: 1.45, marginTop: 22, color: "#5E5648", fontFamily: "sans-serif" }}>
            A lily-crowned chapel arch, a verse in gold, every event with maps, RSVP and blessings. One link.
          </div>
          <div style={{ fontSize: 22, marginTop: 26, color: SCRIPT, fontWeight: 700, fontFamily: "sans-serif" }}>subhsandesh.in</div>
        </div>
      </div>
    ),
    size,
  );
}
