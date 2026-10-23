"use client";

// ─── The downloadable invite card (1080×1350 PNG) ────────────────────────────
// For elders and for forwarding as an image. Drawn on a canvas from the same
// repo art the page uses (same origin, so the canvas is never tainted), in the
// kit's own fonts once document.fonts is ready: the powder-blue sky, the
// flamingo border on top, a gold double frame, the names, the date and venue,
// and the lake + balustrade along the bottom.

import { A, type ArtKey } from "./art";

export interface InviteCardInput {
  first: string;
  second: string;
  /** "Saturday, 13 February 2027" */
  dateLine: string;
  time: string;
  venue: string;
  address: string;
  muhurat: string;
  together: string;
  inviteLine: string;
  guest: string;
  url: string;
}

const W = 1080;
const H = 1350;

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
  const root = document.querySelector(".wp-root") ?? document.documentElement;
  const v = getComputedStyle(root).getPropertyValue(name).trim();
  return v || fallback;
}

function fit(ctx: CanvasRenderingContext2D, text: string, weight: string, size: number, family: string, max: number) {
  let s = size;
  ctx.font = `${weight} ${s}px ${family}`;
  while (s > 18 && ctx.measureText(text).width > max) {
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
  const [sky, flamingo, lake, balustrade] = await Promise.all((["sky", "flamingo", "lake", "balustrade"] as ArtKey[]).map(load));
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  if (!ctx) return null;

  const display = fontVar("--wk-font-display", "Georgia, serif");
  const script = fontVar("--wk-font-script", "cursive");
  const sans = fontVar("--wk-font-sans", "sans-serif");
  const caps = fontVar("--wk-font-caps", "serif");

  // Sky wash, then ivory paper glow in the middle.
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#DCEBF6");
  g.addColorStop(0.5, "#F7FAFC");
  g.addColorStop(1, "#FBF6EA");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  if (sky) {
    ctx.globalAlpha = 0.8;
    ctx.drawImage(sky, 0, 0, W, (W * sky.height) / sky.width);
    ctx.globalAlpha = 1;
  }
  const glow = ctx.createRadialGradient(W / 2, 640, 80, W / 2, 640, 620);
  glow.addColorStop(0, "rgba(255,254,250,.96)");
  glow.addColorStop(1, "rgba(255,254,250,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Lake + balustrade along the bottom.
  if (lake) {
    const lh = (W * lake.height) / lake.width;
    ctx.drawImage(lake, 0, H - lh - 40, W, lh);
  }
  if (balustrade) {
    const bw = W / 2;
    const bh = (bw * balustrade.height) / balustrade.width;
    ctx.drawImage(balustrade, 0, H - bh, bw, bh);
    ctx.drawImage(balustrade, bw, H - bh, bw, bh);
  }
  // Flamingos across the top.
  if (flamingo) ctx.drawImage(flamingo, 0, -10, W, (W * flamingo.height) / flamingo.width);

  // Gold double frame.
  ctx.strokeStyle = "#C9A24A";
  ctx.lineWidth = 3;
  ctx.strokeRect(34, 34, W - 68, H - 68);
  ctx.lineWidth = 1;
  ctx.strokeRect(48, 48, W - 96, H - 96);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  let y = 470;
  if (o.guest) {
    ctx.fillStyle = "#9C4A63";
    fit(ctx, `Dear ${o.guest},`, "italic 500", 38, display, 800);
    ctx.fillText(`Dear ${o.guest},`, W / 2, y - 60);
  }
  ctx.fillStyle = "#3E6A8A";
  ctx.font = `600 22px ${sans}`;
  spaced(ctx, o.together.toUpperCase(), W / 2, y, 5);
  y += 116;
  ctx.fillStyle = "#284D69";
  fit(ctx, o.first, "400", 118, script, 820);
  ctx.fillText(o.first, W / 2, y);
  y += 70;
  ctx.fillStyle = "#B8913E";
  ctx.font = `italic 400 50px ${display}`;
  ctx.fillText("&", W / 2, y);
  y += 100;
  ctx.fillStyle = "#284D69";
  fit(ctx, o.second, "400", 118, script, 820);
  ctx.fillText(o.second, W / 2, y);
  y += 64;
  ctx.fillStyle = "#4A5D6E";
  fit(ctx, o.inviteLine, "italic 500", 32, display, 820);
  ctx.fillText(o.inviteLine, W / 2, y);
  y += 60;
  ctx.strokeStyle = "#C9A24A";
  ctx.beginPath();
  ctx.moveTo(W / 2 - 140, y);
  ctx.lineTo(W / 2 + 140, y);
  ctx.stroke();
  y += 56;
  const when = [o.dateLine, o.time].filter(Boolean).join("  ·  ").toUpperCase();
  if (when) {
    ctx.fillStyle = "#1F3346";
    fit(ctx, when, "600", 26, caps, 760);
    ctx.fillText(when, W / 2, y);
    y += 44;
  }
  if (o.muhurat) {
    ctx.fillStyle = "#9C4A63";
    fit(ctx, o.muhurat, "italic 500", 28, display, 640);
    ctx.fillText(o.muhurat, W / 2, y);
    y += 42;
  }
  if (o.venue) {
    ctx.fillStyle = "#1F3346";
    fit(ctx, o.venue, "600", 32, display, 700);
    ctx.fillText(o.venue, W / 2, y);
    y += 36;
  }
  if (o.address) {
    ctx.fillStyle = "#5B6E80";
    fit(ctx, o.address, "400", 22, sans, 680);
    ctx.fillText(o.address, W / 2, y);
  }

  const short = o.url.replace(/^https?:\/\//, "").replace(/\?.*$/, "");
  if (short) {
    const label = `RSVP  ·  ${short}`.slice(0, 60);
    ctx.font = `600 18px ${sans}`;
    const w = Math.min(560, ctx.measureText(label).width + 48);
    ctx.fillStyle = "rgba(255,254,250,.94)";
    ctx.beginPath();
    ctx.roundRect?.(W / 2 - w / 2, H - 112, w, 44, 22);
    ctx.fill();
    ctx.strokeStyle = "rgba(201,162,74,.6)";
    ctx.stroke();
    ctx.fillStyle = "#284D69";
    ctx.fillText(label, W / 2, H - 84);
  }

  return new Promise((res) => c.toBlob((b) => res(b), "image/png"));
}
