"use client";

// ─── The downloadable invite card (1080×1350 PNG) ────────────────────────────
// For elders and for forwarding as an image. Drawn on a canvas from the same
// repo art the page uses (same origin, so the canvas is never tainted), in the
// kit's own fonts once document.fonts is ready.

import { A, type ArtKey } from "./art";

export interface InviteCardInput {
  first: string;
  second: string;
  /** "Friday, 12 February 2027" */
  dateLine: string;
  month: string;
  day: string;
  year: string;
  time: string;
  venue: string;
  address: string;
  muhurat: string;
  together: string;
  inviteLine: string;
  guest: string;
  invocation: boolean;
  url: string;
}

const W = 1080;
const H = 1350;
const BADGE =
  "M0 0 H200 V112 C200 130 186 138 172 142 C160 146 156 154 156 164 V172 C156 188 140 196 124 202 C110 208 104 222 100 242 C96 222 90 208 76 202 C60 196 44 188 44 172 V164 C44 154 40 146 28 142 C14 138 0 130 0 112 Z";

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
  const root = document.querySelector(".lw-root") ?? document.documentElement;
  const v = getComputedStyle(root).getPropertyValue(name).trim();
  return v || fallback;
}

/** Shrink the font until the text fits `max` px. */
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
  // Canvas letterSpacing is not everywhere yet: draw letter by letter, centred.
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
  const [tile, lights, ganesh, cluster, pair, lamp] = await Promise.all((["tile", "lights", "shriGanesh", "lotusCluster", "lotusPair", "lamp"] as ArtKey[]).map(load));
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  if (!ctx) return null;

  const display = fontVar("--wk-font-display", "Georgia, serif");
  const script = fontVar("--wk-font-script", "cursive");
  const sans = fontVar("--wk-font-sans", "sans-serif");
  // Cinzel's figures are lining; Cormorant's are old-style ("11" would read "II"), so numbers use caps.
  const caps = fontVar("--wk-font-caps", "serif");

  // Paper + tile.
  ctx.fillStyle = "#FBF6EA";
  ctx.fillRect(0, 0, W, H);
  if (tile) {
    const p = ctx.createPattern(tile, "repeat");
    if (p) {
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = p;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
  }
  const glow = ctx.createRadialGradient(W / 2, 600, 60, W / 2, 600, 640);
  glow.addColorStop(0, "rgba(255,248,226,.95)");
  glow.addColorStop(1, "rgba(255,248,226,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Gold frame.
  ctx.strokeStyle = "#C9A24A";
  ctx.lineWidth = 3;
  ctx.strokeRect(34, 34, W - 68, H - 68);
  ctx.lineWidth = 1;
  ctx.strokeRect(48, 48, W - 96, H - 96);

  // The string lights: only their top band (the drops would run into the names).
  if (lights) {
    const sh = lights.height * 0.42;
    const dw = (W - 120) / 2;
    const dh = (dw * sh) / lights.width;
    ctx.drawImage(lights, 0, 0, lights.width, sh, 60, 52, dw, dh);
    ctx.save();
    ctx.translate(W - 60, 52);
    ctx.scale(-1, 1);
    ctx.drawImage(lights, 0, 0, lights.width, sh, 0, 0, dw, dh);
    ctx.restore();
  }
  if (lamp) {
    const lw = 58;
    const lh = (lw * lamp.height) / lamp.width;
    ctx.drawImage(lamp, 0, lamp.height * 0.3, lamp.width, lamp.height * 0.7, 74, 48, lw, lh * 0.7);
    ctx.drawImage(lamp, 0, lamp.height * 0.3, lamp.width, lamp.height * 0.7, W - 74 - lw, 48, lw, lh * 0.7);
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  let y = 236;
  if (o.invocation && ganesh) {
    const gw = 270;
    ctx.drawImage(ganesh, W / 2 - gw / 2, y - 36, gw, (gw * ganesh.height) / ganesh.width);
    y += 92;
  } else y += 30;

  if (o.guest) {
    ctx.fillStyle = "#A3405C";
    fit(ctx, `Dear ${o.guest},`, "italic 500", 38, display, 800);
    ctx.fillText(`Dear ${o.guest},`, W / 2, y);
    y += 50;
  }
  ctx.fillStyle = "#5A7A69";
  ctx.font = `600 22px ${sans}`;
  spaced(ctx, o.together.toUpperCase(), W / 2, y, 5);
  y += 104;

  ctx.fillStyle = "#8C3550";
  fit(ctx, o.first, "400", 112, script, 820);
  ctx.fillText(o.first, W / 2, y);
  y += 66;
  ctx.fillStyle = "#B8892E";
  ctx.font = `italic 400 48px ${display}`;
  ctx.fillText("&", W / 2, y);
  y += 94;
  ctx.fillStyle = "#8C3550";
  fit(ctx, o.second, "400", 112, script, 820);
  ctx.fillText(o.second, W / 2, y);
  y += 60;
  ctx.fillStyle = "#4C5E54";
  fit(ctx, o.inviteLine, "italic 500", 32, display, 820);
  ctx.fillText(o.inviteLine, W / 2, y);
  y += 30;

  // The sage badge with the date.
  if (o.day) {
    const sc = 0.82;
    ctx.save();
    ctx.translate(W / 2 - (200 * sc) / 2, y);
    ctx.scale(sc, sc);
    const g = ctx.createLinearGradient(0, 0, 200, 244);
    g.addColorStop(0, "#8DAA98");
    g.addColorStop(0.55, "#6F8F7D");
    g.addColorStop(1, "#5A7A69");
    ctx.fillStyle = g;
    ctx.fill(new Path2D(BADGE));
    ctx.fillStyle = "#F1D58A";
    ctx.font = `600 24px ${caps}`;
    spaced(ctx, o.month.toUpperCase(), 100, 44, 4);
    ctx.font = `600 60px ${caps}`;
    ctx.fillText(o.day, 100, 104);
    ctx.fillStyle = "#F4E6BE";
    ctx.font = `600 15px ${sans}`;
    spaced(ctx, o.year, 100, 130, 5);
    ctx.restore();
    y += 244 * sc + 44;
  }

  const when = [o.dateLine, o.time].filter(Boolean).join("  ·  ").toUpperCase();
  if (when) {
    ctx.fillStyle = "#3A2C14";
    fit(ctx, when, "600", 25, caps, 640);
    ctx.fillText(when, W / 2, y);
    y += 42;
  }
  if (o.muhurat) {
    ctx.fillStyle = "#A3405C";
    fit(ctx, o.muhurat, "italic 500", 27, display, 600);
    ctx.fillText(o.muhurat, W / 2, y);
    y += 40;
  }
  if (o.venue) {
    ctx.fillStyle = "#3A2C14";
    fit(ctx, o.venue, "600", 30, display, 600);
    ctx.fillText(o.venue, W / 2, y);
    y += 34;
  }
  if (o.address) {
    ctx.fillStyle = "#6E6450";
    fit(ctx, o.address, "400", 22, sans, 580);
    ctx.fillText(o.address, W / 2, y);
  }

  // Pink lotuses in the two lower corners, then a pond line.
  if (cluster) ctx.drawImage(cluster, -30, H - 300, 300, 300);
  if (pair) {
    ctx.save();
    ctx.translate(W + 30, H - 290);
    ctx.scale(-1, 1);
    ctx.drawImage(pair, 0, 0, 300, 284);
    ctx.restore();
  }

  const short = o.url.replace(/^https?:\/\//, "").replace(/\?.*$/, "");
  if (short) {
    const label = `RSVP  ·  ${short}`.slice(0, 60);
    ctx.font = `600 18px ${sans}`;
    const w = Math.min(560, ctx.measureText(label).width + 48);
    ctx.fillStyle = "rgba(255,253,246,.92)";
    ctx.beginPath();
    ctx.roundRect?.(W / 2 - w / 2, H - 108, w, 44, 22);
    ctx.fill();
    ctx.strokeStyle = "rgba(111,143,125,.45)";
    ctx.stroke();
    ctx.fillStyle = "#4E6E5D";
    ctx.fillText(label, W / 2, H - 80);
  }

  return new Promise((res) => c.toBlob((b) => res(b), "image/png"));
}
