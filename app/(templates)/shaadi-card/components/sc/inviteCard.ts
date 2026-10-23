"use client";

// ─── The downloadable invite card (1080 × 1350 PNG) ─────────────────────────
//
// For elders who read pictures, not websites, and for forwarding as an image:
// a haldi-yellow sunburst, the marigold toran across the top, "श्री गणेशाय
// नमः", the names, the date, the venue, the mandap with the couple between
// two umbrella guards, and a QR code of the invitation. Drawn on the guest's
// phone: every image is same-origin (public/wedding-v3), so the canvas is
// never tainted; the kit's self-hosted faces are awaited before drawing.
// (Pattern from garden-wedding-invitation/gw/inviteCard.)

import { encodeQr } from "@/lib/share/qr";
import { ART, type Art } from "../assets";

export interface InviteCardInput {
  first: string;
  second: string;
  dateLine: string;
  timeLine: string;
  venue: string;
  address: string;
  url: string;
  invocation: boolean;
  together: string;
  qrHint: string;
  root: Element | null;
}

const W = 1080;
const H = 1350;
const INK = "#3d1a0f";
const RANI = "#b3155a";
const MARIGOLD = "#b45f06";

function family(root: Element | null, v: string, fb: string): string {
  if (!root) return fb;
  const f = getComputedStyle(root).getPropertyValue(v).trim();
  return f ? `${f}, ${fb}` : fb;
}

function load(a: Art): Promise<HTMLImageElement | null> {
  return new Promise((res) => {
    const im = new Image();
    im.decoding = "async";
    im.onload = () => res(im);
    im.onerror = () => res(null);
    im.src = a.src;
  });
}

function fit(ctx: CanvasRenderingContext2D, text: string, font: (px: number) => string, start: number, max: number, min = 24): number {
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
  const c = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
  if (spacing && "letterSpacing" in ctx) c.letterSpacing = `${spacing}px`;
  ctx.fillText(text, W / 2, y);
  if (spacing && "letterSpacing" in ctx) c.letterSpacing = "0px";
}

function drawW(ctx: CanvasRenderingContext2D, im: HTMLImageElement | null, x: number, y: number, w: number, flip = false) {
  if (!im) return 0;
  const h = (w * im.naturalHeight) / im.naturalWidth;
  ctx.save();
  if (flip) {
    ctx.translate(x + w, y);
    ctx.scale(-1, 1);
    ctx.drawImage(im, 0, 0, w, h);
  } else ctx.drawImage(im, x, y, w, h);
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
  try {
    await Promise.all([`120px ${script}`, `600 40px ${display}`, `600 26px ${caps}`].map((f) => document.fonts.load(f)));
    await document.fonts.ready;
  } catch {
    /* system fallbacks still draw */
  }

  const [toran, ganesh, mandap, couple, guard, pots, peacock] = await Promise.all([ART.toran, ART.ganeshText, ART.mandapSm, ART.couple, ART.guard, ART.pots, ART.peacock].map(load));

  // Ivory → haldi, with a soft sunburst behind the words.
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#fffaf0");
  g.addColorStop(0.55, "#fff1c9");
  g.addColorStop(1, "#ffe08a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.translate(W / 2, 420);
  for (let i = 0; i < 36; i++) {
    ctx.rotate((Math.PI * 2) / 36);
    ctx.fillStyle = i % 2 ? "rgba(255,214,102,.16)" : "rgba(255,255,255,.18)";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-40, -900);
    ctx.lineTo(40, -900);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Rani-pink hairline frame.
  ctx.strokeStyle = "rgba(179,21,90,.45)";
  ctx.lineWidth = 3;
  roundRect(ctx, 26, 26, W - 52, H - 52, 30);
  ctx.stroke();

  // The toran across the top.
  if (toran) drawW(ctx, toran, -40, -10, W + 80);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  let y = 250;
  if (o.invocation && ganesh) {
    drawW(ctx, ganesh, W / 2 - 150, y - 70, 300);
    y += 50;
  }
  ctx.fillStyle = RANI;
  ctx.font = `600 24px ${caps}`;
  centre(ctx, o.together.toUpperCase(), y, 5);
  y += 118;
  ctx.fillStyle = INK;
  fit(ctx, o.first, (px) => `${px}px ${script}`, 128, 820, 60);
  centre(ctx, o.first, y);
  y += 74;
  ctx.fillStyle = MARIGOLD;
  ctx.font = `62px ${script}`;
  centre(ctx, "&", y);
  y += 96;
  ctx.fillStyle = INK;
  fit(ctx, o.second, (px) => `${px}px ${script}`, 128, 820, 60);
  centre(ctx, o.second, y);
  y += 70;
  ctx.fillStyle = RANI;
  fit(ctx, o.dateLine.toUpperCase(), (px) => `600 ${px}px ${caps}`, 30, 860, 18);
  centre(ctx, o.dateLine.toUpperCase(), y, 3);
  y += 44;
  ctx.fillStyle = INK;
  if (o.timeLine) {
    fit(ctx, o.timeLine, (px) => `500 ${px}px ${display}`, 32, 860, 20);
    centre(ctx, o.timeLine, y);
    y += 40;
  }
  if (o.venue) {
    fit(ctx, o.venue, (px) => `600 ${px}px ${display}`, 34, 860, 20);
    centre(ctx, o.venue, y);
    y += 36;
  }
  if (o.address) {
    ctx.fillStyle = "#7a5a43";
    fit(ctx, o.address, (px) => `italic 400 ${px}px ${display}`, 26, 860, 18);
    centre(ctx, o.address, y);
  }

  // The mandap with the couple, between two umbrella guards.
  const mW = 470;
  if (mandap) {
    const mh = (mW * mandap.naturalHeight) / mandap.naturalWidth;
    const crop = 0.2; // skip the plain sky above the canopy
    const sy = mandap.naturalHeight * crop;
    const sh = mandap.naturalHeight * (1 - crop) * 0.8;
    const dh = mh * (1 - crop) * 0.8;
    const dy = H - dh - 34;
    ctx.save();
    roundRect(ctx, (W - mW) / 2, dy, mW, dh, 28);
    ctx.clip();
    ctx.drawImage(mandap, 0, sy, mandap.naturalWidth, sh, (W - mW) / 2, dy, mW, dh);
    if (couple) {
      const ch = dh * 0.62;
      const cw = (ch * couple.naturalWidth) / couple.naturalHeight;
      ctx.drawImage(couple, W / 2 - cw / 2, dy + dh * 0.86 - ch, cw, ch);
    }
    ctx.restore();
  }
  if (guard) {
    drawW(ctx, guard, 60, H - 470, 170, true);
  }
  if (pots) drawW(ctx, pots, -10, H - 320, 150);
  if (peacock) drawW(ctx, peacock, W - 300, H - 330, 200, true);

  // The QR code, on its own tile, top-right of the guard on the right.
  const qr = o.url ? encodeQr(o.url, "medium") : null;
  if (qr) {
    const tile = 180;
    const tx = W - tile - 52;
    const ty = H - 560;
    ctx.save();
    ctx.shadowColor = "rgba(61,26,15,.22)";
    ctx.shadowBlur = 22;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = "#fffdf6";
    roundRect(ctx, tx, ty, tile, tile + 40, 20);
    ctx.fill();
    ctx.restore();
    const quiet = 2;
    const n = qr.size + quiet * 2;
    const m = Math.floor((tile - 18) / n);
    const ox = tx + (tile - m * n) / 2 + quiet * m;
    const oy = ty + 9 + quiet * m;
    ctx.fillStyle = INK;
    for (let r = 0; r < qr.size; r++) for (let c = 0; c < qr.size; c++) if (qr.modules[r][c]) ctx.fillRect(ox + c * m, oy + r * m, m, m);
    ctx.fillStyle = RANI;
    ctx.textAlign = "center";
    fit(ctx, o.qrHint, (px) => `600 ${px}px ${display}`, 18, tile - 16, 11);
    ctx.fillText(o.qrHint, tx + tile / 2, ty + tile + 24);
  }

  ctx.fillStyle = "rgba(61,26,15,.55)";
  ctx.font = `600 15px ${caps}`;
  ctx.textAlign = "center";
  ctx.fillText("SUBHSANDESH.IN", W / 2, H - 10);

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
      /* cancelled: a plain download instead */
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
