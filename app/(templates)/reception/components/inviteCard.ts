"use client";

// ─── The downloadable invitation card (1080×1350 PNG) ────────────────────────
// For elders and for forwarding as an image. Drawn on a canvas from the same
// repo art the page uses (same origin, so the canvas is never tainted), in the
// kit's own fonts once document.fonts is ready.

import { A, type ArtKey } from "./art";

export interface InviteCardInput {
  first: string;
  second: string;
  /** "Saturday, 20 February 2027" */
  dateLine: string;
  time: string;
  venue: string;
  address: string;
  tagline: string;
  guest: string;
  url: string;
  theme: "champagne" | "blush" | "pearl";
}

const W = 1080;
const H = 1350;

const PALETTE = {
  champagne: { paper: "#FBF4E8", ink: "#3A2A1C", names: "#7A4A2E", accent: "#A9792C", soft: "#8A6A48", glow: "255,240,210" },
  blush: { paper: "#FCF1EF", ink: "#3D2328", names: "#8A3B4A", accent: "#B5727A", soft: "#8B5F63", glow: "255,226,226" },
  pearl: { paper: "#FBFAF6", ink: "#2F3A33", names: "#5C5136", accent: "#A88A45", soft: "#6E7A70", glow: "246,244,232" },
} as const;

function load(key: ArtKey): Promise<HTMLImageElement | null> {
  return new Promise((res) => {
    const i = new Image();
    i.decoding = "async";
    i.onload = () => res(i);
    i.onerror = () => res(null);
    i.src = A[key].src;
  });
}

function fontVar(name: string, fallback: string): string {
  const root = document.querySelector(".rc-root") ?? document.documentElement;
  const v = getComputedStyle(root).getPropertyValue(name).trim();
  return v || fallback;
}

/** Shrink the font until the text fits `max` px. */
function fit(ctx: CanvasRenderingContext2D, text: string, weight: string, size: number, family: string, max: number) {
  let s = size;
  ctx.font = `${weight} ${s}px ${family}`;
  while (s > 16 && ctx.measureText(text).width > max) {
    s -= 2;
    ctx.font = `${weight} ${s}px ${family}`;
  }
  return s;
}

function spaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number) {
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
  let cx = x - total / 2;
  ctx.textAlign = "left";
  chars.forEach((c, i) => {
    ctx.fillText(c, cx, y);
    cx += widths[i] + spacing;
  });
  ctx.textAlign = "center";
}

export async function drawInviteCard(o: InviteCardInput): Promise<Blob | null> {
  try {
    await document.fonts?.ready;
  } catch {}
  const [tile, lights, couple, roses, swirl] = await Promise.all((["tile", "lights", "couple", "roses", "swirl"] as ArtKey[]).map(load));
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  const P = PALETTE[o.theme] ?? PALETTE.champagne;

  const display = fontVar("--wk-font-display", "Georgia, serif");
  const script = fontVar("--wk-font-script", "cursive");
  const sans = fontVar("--wk-font-sans", "sans-serif");
  const caps = fontVar("--wk-font-caps", "serif");

  // Paper, tile, warm chandelier glow.
  ctx.fillStyle = P.paper;
  ctx.fillRect(0, 0, W, H);
  if (tile) {
    const p = ctx.createPattern(tile, "repeat");
    if (p) {
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = p;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
  }
  const glow = ctx.createRadialGradient(W / 2, 420, 40, W / 2, 420, 620);
  glow.addColorStop(0, `rgba(${P.glow},.95)`);
  glow.addColorStop(1, `rgba(${P.glow},0)`);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Double gold frame with rounded corners.
  ctx.strokeStyle = P.accent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect?.(34, 34, W - 68, H - 68, 28);
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect?.(50, 50, W - 100, H - 100, 20);
  ctx.stroke();

  // String lights: only their top band.
  if (lights) {
    const sh = lights.height * 0.46;
    const dw = (W - 120) / 2;
    const dh = (dw * sh) / lights.width;
    ctx.drawImage(lights, 0, 0, lights.width, sh, 60, 54, dw, dh);
    ctx.save();
    ctx.translate(W - 60, 54);
    ctx.scale(-1, 1);
    ctx.drawImage(lights, 0, 0, lights.width, sh, 0, 0, dw, dh);
    ctx.restore();
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  let y = 250;
  if (o.guest) {
    ctx.fillStyle = P.names;
    fit(ctx, `Dear ${o.guest},`, "italic 500", 38, display, 800);
    ctx.fillText(`Dear ${o.guest},`, W / 2, y);
    y += 52;
  }
  ctx.fillStyle = P.soft;
  ctx.font = `600 22px ${sans}`;
  spaced(ctx, "THE WEDDING RECEPTION OF", W / 2, y, 5);
  y += 112;

  ctx.fillStyle = P.names;
  fit(ctx, o.first, "400", 118, script, 820);
  ctx.fillText(o.first, W / 2, y);
  y += 70;
  ctx.fillStyle = P.accent;
  ctx.font = `italic 400 50px ${display}`;
  ctx.fillText("&", W / 2, y);
  y += 100;
  ctx.fillStyle = P.names;
  fit(ctx, o.second, "400", 118, script, 820);
  ctx.fillText(o.second, W / 2, y);
  y += 62;

  if (o.tagline) {
    ctx.fillStyle = P.ink;
    fit(ctx, o.tagline, "italic 500", 31, display, 820);
    ctx.fillText(o.tagline, W / 2, y);
    y += 30;
  }
  if (swirl) {
    const sw = 150;
    ctx.globalAlpha = 0.85;
    ctx.drawImage(swirl, W / 2 - sw / 2, y, sw, (sw * swirl.height) / swirl.width);
    ctx.globalAlpha = 1;
    y += (sw * swirl.height) / swirl.width + 34;
  } else y += 40;

  const when = [o.dateLine, o.time].filter(Boolean).join("  ·  ").toUpperCase();
  if (when) {
    ctx.fillStyle = P.ink;
    fit(ctx, when, "600", 26, caps, 760);
    ctx.fillText(when, W / 2, y);
    y += 44;
  }
  if (o.venue) {
    ctx.fillStyle = P.ink;
    fit(ctx, o.venue, "600", 31, display, 760);
    ctx.fillText(o.venue, W / 2, y);
    y += 36;
  }
  if (o.address) {
    ctx.fillStyle = P.soft;
    fit(ctx, o.address, "400", 22, sans, 700);
    ctx.fillText(o.address, W / 2, y);
  }

  // Roses in the lower corners, the couple between them.
  if (roses) {
    const rw = 300;
    const rh = (rw * roses.height) / roses.width;
    ctx.drawImage(roses, -40, H - rh + 10, rw, rh);
    ctx.save();
    ctx.translate(W + 40, H - rh + 10);
    ctx.scale(-1, 1);
    ctx.drawImage(roses, 0, 0, rw, rh);
    ctx.restore();
  }
  if (couple) {
    const ch = 270;
    const cw = (ch * couple.width) / couple.height;
    ctx.drawImage(couple, W / 2 - cw / 2, H - 64 - ch, cw, ch);
  }

  const short = o.url.replace(/^https?:\/\//, "").replace(/\?.*$/, "");
  if (short) {
    const label = `RSVP  ·  ${short}`.slice(0, 60);
    ctx.font = `600 18px ${sans}`;
    const w = Math.min(560, ctx.measureText(label).width + 48);
    ctx.fillStyle = "rgba(255,253,248,.95)";
    ctx.beginPath();
    ctx.roundRect?.(W / 2 - w / 2, H - 96, w, 42, 21);
    ctx.fill();
    ctx.strokeStyle = P.accent;
    ctx.stroke();
    ctx.fillStyle = P.ink;
    ctx.fillText(label, W / 2, H - 69);
  }

  return new Promise((res) => c.toBlob((b) => res(b), "image/png"));
}
