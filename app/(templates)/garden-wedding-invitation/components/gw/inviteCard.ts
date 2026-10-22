"use client";

// ─── The downloadable invite card (1080 × 1350 PNG) ─────────────────────────
//
// For elders who read images, not websites, and for forwarding as a picture:
// the garden (sky, clouds, the lattice crown, lanterns, the gazebo with the
// couple, banana plants, lotus, a peacock) with the names, the date, the venue
// and a QR code of the invitation. Drawn on a canvas on the guest's phone:
// every image is same-origin (public/wedding-v3), so the canvas is never
// tainted and toBlob works; the kit's self-hosted faces are resolved from the
// page's CSS variables and awaited before drawing.
//
// Lift note: research P0 #8 asks for the drawing to live in `_wedding/` once;
// builders may not edit the kit, so this one is the garden's own.

import { encodeQr } from "@/lib/share/qr";
import { GW, type WeddingAsset } from "../assets";

export interface InviteCardInput {
  first: string;
  second: string;
  /** "Saturday, 20 February 2027" */
  dateLine: string;
  /** "6:30 pm · Shubh muhurat 8:40 pm" */
  timeLine: string;
  venue: string;
  address: string;
  url: string;
  invocation: boolean;
  together: string;
  /** "Scan to open the invitation" */
  qrHint: string;
  /** Any element inside the WeddingRoot (its --font-wk-* variables name the faces). */
  root: Element | null;
}

const W = 1080;
const H = 1350;
const INK = "#4a2230";
const ROSE = "#a94e63";
const GOLD = "#9a6a3c";

function family(root: Element | null, v: string, fb: string): string {
  if (!root) return fb;
  const f = getComputedStyle(root).getPropertyValue(v).trim();
  return f ? `${f}, ${fb}` : fb;
}

function load(a: WeddingAsset): Promise<HTMLImageElement | null> {
  return new Promise((res) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = a.src;
  });
}

function fit(ctx: CanvasRenderingContext2D, text: string, font: (px: number) => string, start: number, max: number, min = 28): number {
  let px = start;
  for (; px > min; px -= 4) {
    ctx.font = font(px);
    if (ctx.measureText(text).width <= max) break;
  }
  ctx.font = font(px);
  return px;
}

function centre(ctx: CanvasRenderingContext2D, text: string, y: number, spacing = 0) {
  if (!text) return;
  if (spacing && "letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${spacing}px`;
  ctx.fillText(text, W / 2, y);
  if (spacing && "letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";
}

function drawImg(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, x: number, y: number, w: number, flip = false, alpha = 1) {
  if (!img) return 0;
  const h = (w * img.naturalHeight) / img.naturalWidth;
  ctx.save();
  ctx.globalAlpha = alpha;
  if (flip) {
    ctx.translate(x + w, y);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0, w, h);
  } else ctx.drawImage(img, x, y, w, h);
  ctx.restore();
  return h;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function drawInviteCard(o: InviteCardInput): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const script = family(o.root, "--font-wk-script", "'Great Vibes', cursive");
  const display = family(o.root, "--font-wk-display", "'Cormorant Garamond', Georgia, serif");
  const caps = family(o.root, "--font-wk-caps", "Cinzel, Georgia, serif");
  const deva = family(o.root, "--font-wk-deva", "'Tiro Devanagari Hindi', serif");
  try {
    await Promise.all([`120px ${script}`, `600 40px ${display}`, `600 26px ${caps}`, `30px ${deva}`].map((f) => document.fonts.load(f)));
    await document.fonts.ready;
  } catch {
    /* system fallbacks still draw */
  }

  const [sky, cloudA, cloudB, lattice, lanterns, lantern, gazebo, couple, bananaL, bananaR, lotus, peacock, blossom] = await Promise.all(
    [GW.sky, GW.cloudA, GW.cloudB, GW.lattice, GW.lanterns, GW.lantern, GW.gazebo2x, GW.couple, GW.bananaL, GW.bananaR, GW.lotus, GW.peacock, GW.blossom].map(load),
  );

  // Ivory → blush paper, the sky washed over the top two thirds.
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#fdf8f4");
  g.addColorStop(0.6, "#fbeef0");
  g.addColorStop(1, "#f3dde2");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  if (sky) {
    ctx.save();
    ctx.globalAlpha = 0.75;
    const sh = (W * sky.naturalHeight) / sky.naturalWidth;
    ctx.drawImage(sky, -80, 0, W + 160, sh * 1.3);
    ctx.restore();
    const fade = ctx.createLinearGradient(0, sh * 0.6, 0, sh * 1.3);
    fade.addColorStop(0, "rgba(253,248,244,0)");
    fade.addColorStop(1, "rgba(251,238,240,1)");
    ctx.fillStyle = fade;
    ctx.fillRect(0, sh * 0.6, W, sh * 0.72);
  }
  drawImg(ctx, cloudA, -120, 120, 520, false, 0.9);
  drawImg(ctx, cloudB, 700, 210, 480, false, 0.85);
  drawImg(ctx, lattice, 0, 0, W, false, 0.95);
  drawImg(ctx, blossom, -40, 70, 330, false, 1);
  drawImg(ctx, lantern, 70, 120, 120);
  drawImg(ctx, lanterns, 860, 60, 180);

  // ── The words ──
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  let y = 250;
  if (o.invocation) {
    ctx.fillStyle = GOLD;
    ctx.font = `30px ${deva}`;
    centre(ctx, "॥ श्री गणेशाय नमः ॥", y);
    y += 58;
  }
  ctx.fillStyle = ROSE;
  ctx.font = `600 24px ${caps}`;
  centre(ctx, o.together.toUpperCase(), y, 5);
  y += 128;
  ctx.fillStyle = INK;
  fit(ctx, o.first, (px) => `${px}px ${script}`, 132, 820, 60);
  centre(ctx, o.first, y);
  y += 78;
  ctx.fillStyle = GOLD;
  ctx.font = `64px ${script}`;
  centre(ctx, "&", y);
  y += 100;
  ctx.fillStyle = INK;
  fit(ctx, o.second, (px) => `${px}px ${script}`, 132, 820, 60);
  centre(ctx, o.second, y);
  y += 74;
  ctx.fillStyle = ROSE;
  fit(ctx, o.dateLine.toUpperCase(), (px) => `600 ${px}px ${caps}`, 30, 860, 18);
  centre(ctx, o.dateLine.toUpperCase(), y, 3);
  y += 46;
  ctx.fillStyle = INK;
  if (o.timeLine) {
    fit(ctx, o.timeLine, (px) => `500 ${px}px ${display}`, 32, 880, 20);
    centre(ctx, o.timeLine, y);
    y += 42;
  }
  if (o.venue) {
    fit(ctx, o.venue, (px) => `600 ${px}px ${display}`, 34, 880, 20);
    centre(ctx, o.venue, y);
    y += 38;
  }
  if (o.address) {
    ctx.fillStyle = "#7e5f66";
    fit(ctx, o.address, (px) => `italic 400 ${px}px ${display}`, 26, 880, 18);
    centre(ctx, o.address, y);
  }

  // ── The garden ──
  const gzW = 640;
  const gzH = gazebo ? (gzW * gazebo.naturalHeight) / gazebo.naturalWidth : 0;
  const gzY = H - gzH + 6;
  drawImg(ctx, bananaL, -60, H - 640, 380);
  drawImg(ctx, bananaR, 800, H - 600, 330);
  drawImg(ctx, gazebo, (W - gzW) / 2, gzY, gzW);
  if (couple && gazebo) {
    const ch = gzH * 0.5;
    const cw = (ch * couple.naturalWidth) / couple.naturalHeight;
    ctx.drawImage(couple, W / 2 - cw / 2, gzY + gzH * 0.86 - ch, cw, ch);
  }
  drawImg(ctx, peacock, 40, H - 330, 150);
  drawImg(ctx, lotus, -30, H - 190, 250);

  // ── The QR code, on its own white tile, bottom right ──
  const qr = o.url ? encodeQr(o.url, "medium") : null;
  if (qr) {
    const tile = 196;
    const tx = W - tile - 34;
    const ty = H - tile - 70;
    ctx.save();
    ctx.shadowColor = "rgba(110,40,58,.22)";
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = "#fffdfb";
    roundRect(ctx, tx, ty, tile, tile + 40, 22);
    ctx.fill();
    ctx.restore();
    const quiet = 2;
    const n = qr.size + quiet * 2;
    const m = Math.floor((tile - 20) / n);
    const ox = tx + (tile - m * n) / 2 + quiet * m;
    const oy = ty + 10 + quiet * m;
    ctx.fillStyle = "#3e1f27";
    for (let r = 0; r < qr.size; r++) for (let c = 0; c < qr.size; c++) if (qr.modules[r][c]) ctx.fillRect(ox + c * m, oy + r * m, m, m);
    ctx.fillStyle = ROSE;
    ctx.font = `600 15px ${caps}`;
    ctx.textAlign = "center";
    fit(ctx, o.qrHint, (px) => `600 ${px}px ${display}`, 19, tile - 18, 12);
    ctx.fillText(o.qrHint, tx + tile / 2, ty + tile + 24);
  }

  ctx.fillStyle = "rgba(62,31,39,.55)";
  ctx.font = `600 15px ${caps}`;
  ctx.textAlign = "center";
  ctx.fillText("SUBHSANDESH.IN", W - 34 - 98, H - 16);

  return new Promise((res) => canvas.toBlob((b) => res(b), "image/png"));
}

/** Share the PNG where the OS can (phones), else download it. */
export async function deliverCard(blob: Blob, fileName: string): Promise<"shared" | "downloaded"> {
  const file = new File([blob], fileName, { type: "image/png" });
  const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
  if (nav.share && nav.canShare?.({ files: [file] }) && matchMedia("(pointer: coarse)").matches) {
    try {
      await nav.share({ files: [file] });
      return "shared";
    } catch {
      /* cancelled: fall through to a plain download */
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
  return "downloaded";
}
