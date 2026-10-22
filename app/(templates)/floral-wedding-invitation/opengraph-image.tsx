// The 1200x630 link preview for /floral-wedding-invitation (WhatsApp, X, iMessage, Slack).
// Rendered once at build time by next/og over the template's own art plate
// (public/wedding-v3/template3/og-floral-base.jpg: handmade paper, pampas, the
// floral drape and the couple on the swing; JPEG because satori reads no
// WebP). Read from disk, never fetched: no network at build time.
// ASCII only in this file: the webpack dev loader rejects other characters here.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Pampas & Peony Wedding Invitation - a boho floral invitation on handmade paper: a wax-sealed envelope, pampas grass, peonies and the couple on a swing, with every function, RSVP and a blessings wall on one link";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const WINE = "#8C4A52";
const GOLD = "#9A7434";
const INK = "#3D2A24";

export default async function OpengraphImage() {
  const plate = await readFile(join(process.cwd(), "public/wedding-v3/template3/og-floral-base.jpg"));
  const src = `data:image/jpeg;base64,${plate.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", fontFamily: "serif", color: INK }}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img src={src} width={1200} height={630} style={{ position: "absolute", left: 0, top: 0, width: 1200, height: 630 }} />
        <div style={{ position: "absolute", left: 92, top: 120, width: 560, display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 20, letterSpacing: 7, color: GOLD, fontWeight: 700, fontFamily: "sans-serif" }}>TOGETHER WITH THEIR FAMILIES</div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 76, fontStyle: "italic", lineHeight: 1.02, marginTop: 18, color: WINE }}>
            <span>Pampas &amp; Peony</span>
          </div>
          <div style={{ fontSize: 40, lineHeight: 1.1, marginTop: 6, color: INK }}>Wedding Invitation</div>
          <div style={{ width: 120, height: 2, background: GOLD, marginTop: 26, opacity: 0.7 }} />
          <div style={{ fontSize: 25, lineHeight: 1.45, marginTop: 22, color: "#6D564C", fontFamily: "sans-serif" }}>
            A wax-sealed envelope, pampas in the breeze, every function with maps, RSVP and blessings. One link.
          </div>
          <div style={{ fontSize: 22, marginTop: 26, color: WINE, fontWeight: 700, fontFamily: "sans-serif" }}>subhsandesh.in</div>
        </div>
      </div>
    ),
    size,
  );
}
