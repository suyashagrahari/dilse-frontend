// ─── The downloadable invite card (1080 × 1350 PNG) ──────────────────────────
// For elders and for forwarding as an image: the handmade paper, a pampas
// cloud bank, pampas corners, the floral drape with the couple on the swing,
// gold swirls, the names in script, the date and venue, and a QR code of the
// page. Every image is same-origin (public/wedding-v3), so the canvas is never
// tainted; text waits for the kit fonts (document.fonts.load).

import { wkCaps, wkDeva, wkDisplay, wkScript } from "../../../_wedding";
import { encodeQr } from "@/lib/share/qr";
import { ART, type ArtRole } from "./art";

export interface CardInput {
  first: string;
  second: string;
  dateLine: string;
  time: string;
  venue: string;
  invocation: boolean;
  url: string;
  labels: { together: string; married: string; scan: string; mantra: string };
}

const W = 1080;
const H = 1350;
const INK = "#3d2a24";
const ROSE = "#8f4c55";
const GOLD = "#a5803a";

function load(role: ArtRole): Promise<HTMLImageElement | null> {
  return new Promise((res) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = ART[role].src;
  });
}

function fam(f: { style: { fontFamily: string } }) {
  return f.style.fontFamily;
}

/** Largest font size ≤ `max` at which `text` fits `width`. */
function fit(ctx: CanvasRenderingContext2D, text: string, font: (px: number) => string, max: number, width: number, min = 28): number {
  for (let px = max; px > min; px -= 2) {
    ctx.font = font(px);
    if (ctx.measureText(text).width <= width) return px;
  }
  return min;
}

export async function drawInviteCard(input: CardInput): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const script = fam(wkScript);
  const display = fam(wkDisplay);
  const caps = fam(wkCaps);
  const deva = fam(wkDeva);
  try {
    await Promise.all([
      document.fonts.load(`80px ${script}`),
      document.fonts.load(`500 40px ${display}`),
      document.fonts.load(`italic 500 40px ${display}`),
      document.fonts.load(`500 24px ${caps}`),
      input.invocation ? document.fonts.load(`30px ${deva}`, input.labels.mantra) : Promise.resolve(),
    ]);
  } catch {}

  const [paper, clouds, corner, drape, swing, swirl, rocks] = await Promise.all([load("paper"), load("clouds"), load("pampasCorner"), load("drape"), load("swing"), load("swirlSm"), load("rocks")]);

  // Paper (cover).
  ctx.fillStyle = "#f6ecdf";
  ctx.fillRect(0, 0, W, H);
  if (paper) {
    const s = Math.max(W / paper.width, H / paper.height);
    ctx.drawImage(paper, (W - paper.width * s) / 2, (H - paper.height * s) / 2, paper.width * s, paper.height * s);
  }
  // Swirls, top corners.
  if (swirl) {
    const w = 420;
    const h = (swirl.height / swirl.width) * w;
    ctx.globalAlpha = 0.85;
    ctx.drawImage(swirl, -70, -60, w, h);
    ctx.save();
    ctx.translate(W + 70, -60);
    ctx.scale(-1, 1);
    ctx.drawImage(swirl, 0, 0, w, h);
    ctx.restore();
    ctx.globalAlpha = 1;
  }
  // Cloud bank, bottom (its painted edge sits on the bottom of the card).
  if (clouds) {
    const h = (clouds.height / clouds.width) * W;
    ctx.drawImage(clouds, 0, H - h * 0.62, W, h);
  }
  // The drape + swing, centred low.
  const archH = 780;
  if (drape) {
    const w = (drape.width / drape.height) * archH;
    const x = (W - w) / 2;
    const y = H - archH - 36;
    ctx.drawImage(drape, x, y, w, archH);
    if (swing) {
      const sw = w * 0.72;
      const sh = (swing.height / swing.width) * sw;
      ctx.drawImage(swing, (W - sw) / 2, y + archH - sh - 8, sw, sh);
    }
  }
  if (rocks) {
    const w = 300;
    const h = (rocks.height / rocks.width) * w;
    ctx.drawImage(rocks, W - w + 20, H - h - 30, w, h);
  }
  // Pampas corners: the art's cut edge belongs on the page's edge.
  if (corner) {
    const h = 520;
    const w = (corner.width / corner.height) * h;
    ctx.drawImage(corner, W - w, H - h, w, h);
    ctx.save();
    ctx.translate(w, H - h);
    ctx.scale(-1, 1);
    ctx.drawImage(corner, 0, 0, w, h);
    ctx.restore();
  }

  // Copy.
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  let y = 112;
  if (input.invocation) {
    ctx.fillStyle = GOLD;
    ctx.font = `30px ${deva}`;
    ctx.fillText(input.labels.mantra, W / 2, y);
    y += 58;
  } else y += 20;
  ctx.fillStyle = GOLD;
  ctx.font = `500 24px ${caps}`;
  if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "6px";
  ctx.fillText(input.labels.together.toUpperCase(), W / 2, y);
  if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";
  y += 112;
  const names = `${input.first} & ${input.second}`;
  const px = fit(ctx, names, (p) => `${p}px ${script}`, 118, W - 160);
  ctx.fillStyle = ROSE;
  ctx.font = `${px}px ${script}`;
  ctx.fillText(names, W / 2, y);
  y += 58;
  ctx.fillStyle = INK;
  ctx.font = `italic 500 34px ${display}`;
  ctx.fillText(input.labels.married, W / 2, y);
  y += 70;
  if (input.dateLine) {
    ctx.font = `500 30px ${caps}`;
    ctx.fillStyle = INK;
    const d = input.time ? `${input.dateLine}  ·  ${input.time}` : input.dateLine;
    const dpx = fit(ctx, d, (p) => `500 ${p}px ${caps}`, 30, W - 200, 20);
    ctx.font = `500 ${dpx}px ${caps}`;
    ctx.fillText(d, W / 2, y);
    y += 48;
  }
  if (input.venue) {
    const vpx = fit(ctx, input.venue, (p) => `500 ${p}px ${display}`, 34, W - 200, 22);
    ctx.font = `500 ${vpx}px ${display}`;
    ctx.fillStyle = "#6d564c";
    ctx.fillText(input.venue, W / 2, y);
  }

  // QR, bottom-left on an ivory tile.
  const qr = input.url ? encodeQr(input.url, "medium") : null;
  if (qr) {
    const box = 200;
    const pad = 14;
    const x0 = 56;
    const y0 = H - box - 66;
    ctx.fillStyle = "rgba(255,252,246,.94)";
    ctx.beginPath();
    ctx.roundRect?.(x0 - pad, y0 - pad, box + pad * 2, box + pad * 2 + 30, 18);
    if (!ctx.roundRect) ctx.rect(x0 - pad, y0 - pad, box + pad * 2, box + pad * 2 + 30);
    ctx.fill();
    const q = 2;
    const n = qr.size + q * 2;
    const m = box / n;
    ctx.fillStyle = INK;
    for (let yy = 0; yy < qr.size; yy++) for (let xx = 0; xx < qr.size; xx++) if (qr.modules[yy][xx]) ctx.fillRect(x0 + (xx + q) * m, y0 + (yy + q) * m, Math.ceil(m), Math.ceil(m));
    ctx.font = `500 17px ${caps}`;
    ctx.fillStyle = GOLD;
    ctx.fillText(input.labels.scan, x0 + box / 2, y0 + box + 22);
  }

  return new Promise((res) => canvas.toBlob((b) => res(b), "image/png"));
}

export async function downloadInviteCard(input: CardInput, fileName: string): Promise<boolean> {
  const blob = await drawInviteCard(input);
  if (!blob) return false;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName.replace(/[^\p{L}\p{N}-]+/gu, "-").replace(/^-+|-+$/g, "") || "invitation"}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
  return true;
}
