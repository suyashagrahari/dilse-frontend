"use client";

// ─── The downloadable invite card (1080×1350 PNG) ────────────────────────────
// For elders and for forwarding as an image. Drawn on a canvas from the same
// repo art the page uses (same origin: the canvas is never tainted), in the
// kit's fonts once document.fonts is ready.

import { A, type ArtKey } from "./art";

export interface InviteCardInput {
  first: string;
  second: string;
  /** "Saturday, 16 January 2027" */
  dateLine: string;
  time: string;
  venue: string;
  address: string;
  verse: string;
  verseRef: string;
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
  const root = document.querySelector(".c2-root") ?? document.documentElement;
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

/** Word-wrap centred lines; returns the y after the last line. */
function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, lh: number, maxLines = 4): number {
  const words = text.split(/\s+/);
  let line = "";
  let n = 0;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > max && line) {
      ctx.fillText(line, x, y);
      y += lh;
      line = w;
      if (++n >= maxLines - 1) break;
    } else line = test;
  }
  if (line) {
    ctx.fillText(line, x, y);
    y += lh;
  }
  return y;
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
  const [sky, branch, lanterns, rail, fountain] = await Promise.all((["sky", "branch", "lanterns", "balustrade", "fountain"] as ArtKey[]).map(load));
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  if (!ctx) return null;

  const display = fontVar("--wk-font-display", "Georgia, serif");
  const script = fontVar("--wk-font-script", "cursive");
  const sans = fontVar("--wk-font-sans", "sans-serif");
  const caps = fontVar("--wk-font-caps", "serif");

  ctx.fillStyle = "#FBF6F2";
  ctx.fillRect(0, 0, W, H);
  if (sky) {
    ctx.globalAlpha = 0.7;
    ctx.drawImage(sky, 0, 0, W, (W * sky.height) / sky.width);
    ctx.globalAlpha = 1;
    const fade = ctx.createLinearGradient(0, 300, 0, 620);
    fade.addColorStop(0, "rgba(251,246,242,0)");
    fade.addColorStop(1, "rgba(251,246,242,1)");
    ctx.fillStyle = fade;
    ctx.fillRect(0, 300, W, 330);
  }
  // Frame: sage hairlines with rounded corners.
  ctx.strokeStyle = "rgba(76,104,82,.55)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect?.(34, 34, W - 68, H - 68, 28);
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(194,161,101,.7)";
  ctx.beginPath();
  ctx.roundRect?.(48, 48, W - 96, H - 96, 20);
  ctx.stroke();

  if (lanterns) {
    const lw = 120;
    const lh = (lw * lanterns.height) / lanterns.width;
    ctx.drawImage(lanterns, 70, 40, lw, lh);
    ctx.save();
    ctx.translate(W - 70, 40);
    ctx.scale(-1, 1);
    ctx.drawImage(lanterns, 0, 0, lw, lh);
    ctx.restore();
  }
  if (branch) {
    ctx.save();
    ctx.translate(W - 40, H - 330);
    ctx.rotate(Math.PI * 0.94);
    ctx.drawImage(branch, -20, -150, 380, 240);
    ctx.restore();
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  let y = 250;
  if (o.guest) {
    ctx.fillStyle = "#B4677A";
    fit(ctx, `Dear ${o.guest},`, "italic 500", 40, display, 760);
    ctx.fillText(`Dear ${o.guest},`, W / 2, y);
    y += 56;
  }
  ctx.fillStyle = "#4C6852";
  ctx.font = `600 22px ${caps}`;
  spaced(ctx, "TOGETHER WITH THEIR FAMILIES", W / 2, y, 5);
  y += 116;
  ctx.fillStyle = "#4C6852";
  fit(ctx, o.first, "400", 124, script, 820);
  ctx.fillText(o.first, W / 2, y);
  y += 70;
  ctx.fillStyle = "#C2A165";
  ctx.font = `400 64px ${script}`;
  ctx.fillText("&", W / 2, y);
  y += 104;
  ctx.fillStyle = "#4C6852";
  fit(ctx, o.second, "400", 124, script, 820);
  ctx.fillText(o.second, W / 2, y);
  y += 66;
  ctx.fillStyle = "#2F3A32";
  fit(ctx, "request the honour of your presence at their Holy Matrimony", "italic 500", 34, display, 820);
  ctx.fillText("request the honour of your presence at their Holy Matrimony", W / 2, y);
  y += 78;

  const when = [o.dateLine, o.time].filter(Boolean).join("  ·  ").toUpperCase();
  if (when) {
    ctx.fillStyle = "#2F3A32";
    fit(ctx, when, "600", 28, caps, 760);
    ctx.fillText(when, W / 2, y);
    y += 50;
  }
  if (o.venue) {
    ctx.fillStyle = "#2F3A32";
    fit(ctx, o.venue, "600", 36, display, 760);
    ctx.fillText(o.venue, W / 2, y);
    y += 40;
  }
  if (o.address) {
    ctx.fillStyle = "#66726A";
    fit(ctx, o.address, "400", 24, sans, 720);
    ctx.fillText(o.address, W / 2, y);
    y += 36;
  }
  if (o.verse) {
    y += 22;
    ctx.fillStyle = "#86672C";
    ctx.font = `italic 500 28px ${display}`;
    y = wrap(ctx, `“${o.verse}”`, W / 2, y, 720, 36, 3);
    if (o.verseRef) {
      ctx.font = `600 18px ${caps}`;
      spaced(ctx, o.verseRef.toUpperCase(), W / 2, y + 4, 3);
    }
  }

  if (rail) ctx.drawImage(rail, 60, H - 230, W - 120, ((W - 120) * rail.height) / rail.width);
  if (fountain) ctx.drawImage(fountain, W / 2 - 90, H - 300, 180, (180 * fountain.height) / fountain.width);

  const short = o.url.replace(/^https?:\/\//, "").replace(/\?.*$/, "");
  if (short) {
    const label = `RSVP  ·  ${short}`.slice(0, 60);
    ctx.font = `600 19px ${sans}`;
    const w = Math.min(600, ctx.measureText(label).width + 48);
    ctx.fillStyle = "rgba(255,253,249,.95)";
    ctx.beginPath();
    ctx.roundRect?.(W / 2 - w / 2, H - 110, w, 46, 23);
    ctx.fill();
    ctx.strokeStyle = "rgba(127,154,131,.5)";
    ctx.stroke();
    ctx.fillStyle = "#4C6852";
    ctx.fillText(label, W / 2, H - 81);
  }
  return new Promise((res) => c.toBlob((b) => res(b), "image/png"));
}
