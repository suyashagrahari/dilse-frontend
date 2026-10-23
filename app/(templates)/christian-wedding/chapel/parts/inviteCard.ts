"use client";

// ─── The downloadable invite card (1080 × 1350 PNG) ─────────────────────────
//
// For elders who read pictures, not websites, and for forwarding on WhatsApp:
// ivory paper under the pink-and-white floral arch, the small stained-glass
// rose window, the names, the date, the church and a QR code of the
// invitation, with peonies and pampas at the foot. Drawn on the guest's phone:
// every image is same-origin (public/wedding-v3), so the canvas is never
// tainted; the kit's self-hosted faces are awaited before drawing.

import { encodeQr } from "@/lib/share/qr";
import { ART, type Art } from "../assets";

export interface InviteCardInput {
  first: string;
  second: string;
  /** "Saturday, 16 January 2027" */
  dateLine: string;
  /** "3:30 pm" */
  timeLine: string;
  church: string;
  address: string;
  verseRef: string;
  url: string;
  /** "Scan to open the invitation" */
  qrHint: string;
  /** Any element inside the WeddingRoot (its --font-wk-* variables name the faces). */
  root: Element | null;
}

const W = 1080;
const H = 1350;
const INK = "#3b342c";
const ROSE = "#a9646d";
const GOLD = "#8a6a36";
const SAGE = "#5f7c5f";

function family(root: Element | null, v: string, fb: string): string {
  if (!root) return fb;
  const f = getComputedStyle(root).getPropertyValue(v).trim();
  return f ? `${f}, ${fb}` : fb;
}

function load(a: Art): Promise<HTMLImageElement | null> {
  return new Promise((res) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = a.src;
  });
}

function fit(ctx: CanvasRenderingContext2D, text: string, font: (px: number) => string, start: number, max: number, min = 20): number {
  let px = start;
  for (; px > min; px -= 2) {
    ctx.font = font(px);
    if (ctx.measureText(text).width <= max) break;
  }
  ctx.font = font(px);
  return px;
}

function spaced(ctx: CanvasRenderingContext2D, px: number) {
  if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${px}px`;
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
  try {
    await Promise.all([`120px ${script}`, `600 40px ${display}`, `italic 400 30px ${display}`, `600 26px ${caps}`].map((f) => document.fonts.load(f)));
    await document.fonts.ready;
  } catch {
    /* system fallbacks still draw */
  }

  const [paper, arch, rose, peonies, roses, pampasL, swirl] = await Promise.all(
    [ART.paper, ART.floralArch, ART.roseWindow, ART.peonyBouquet, ART.roseBouquet, ART.pampasCorner, ART.goldSwirl].map(load),
  );

  // Ivory paper with a soft vignette.
  ctx.fillStyle = "#fbf7ef";
  ctx.fillRect(0, 0, W, H);
  if (paper) {
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.drawImage(paper, -200, 0, (H * paper.naturalWidth) / paper.naturalHeight, H);
    ctx.restore();
  }
  const v = ctx.createRadialGradient(W / 2, H * 0.48, 200, W / 2, H * 0.5, 820);
  v.addColorStop(0, "rgba(255,253,248,0.55)");
  v.addColorStop(1, "rgba(236,224,204,0.35)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);

  // A hairline gold frame, rounded on all four corners.
  ctx.strokeStyle = "rgba(160,124,62,0.55)";
  ctx.lineWidth = 2;
  roundRect(ctx, 34, 34, W - 68, H - 68, 26);
  ctx.stroke();

  drawImg(ctx, swirl, 690, 560, 420, false, 0.16);
  drawImg(ctx, swirl, -40, 560, 420, true, 0.16);
  drawImg(ctx, arch, -10, -28, W + 20, false, 1);

  // The rose window medallion.
  if (rose) {
    const r = 64;
    ctx.save();
    ctx.shadowColor = "rgba(120,80,40,.25)";
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(W / 2, 330, r + 9, 0, Math.PI * 2);
    ctx.fillStyle = "#f4ead8";
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.arc(W / 2, 330, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(rose, W / 2 - r, 330 - r, r * 2, r * 2);
    ctx.restore();
    ctx.strokeStyle = "#b8975a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(W / 2, 330, r + 4, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  let y = 460;
  ctx.fillStyle = SAGE;
  spaced(ctx, 5);
  fit(ctx, "TOGETHER WITH THEIR FAMILIES", (px) => `600 ${px}px ${caps}`, 24, 820);
  ctx.fillText("TOGETHER WITH THEIR FAMILIES", W / 2, y);
  spaced(ctx, 0);
  y += 128;
  ctx.fillStyle = INK;
  fit(ctx, o.first, (px) => `${px}px ${script}`, 132, 800, 60);
  ctx.fillText(o.first, W / 2, y);
  y += 78;
  ctx.fillStyle = GOLD;
  ctx.font = `60px ${script}`;
  ctx.fillText("&", W / 2, y);
  y += 104;
  ctx.fillStyle = INK;
  fit(ctx, o.second, (px) => `${px}px ${script}`, 132, 800, 60);
  ctx.fillText(o.second, W / 2, y);
  y += 66;
  ctx.fillStyle = "#6f655a";
  fit(ctx, "request the honour of your presence at their Holy Matrimony", (px) => `italic 400 ${px}px ${display}`, 32, 820);
  ctx.fillText("request the honour of your presence at their Holy Matrimony", W / 2, y);
  y += 62;
  if (o.dateLine) {
    ctx.fillStyle = ROSE;
    spaced(ctx, 3);
    fit(ctx, o.dateLine.toUpperCase(), (px) => `600 ${px}px ${caps}`, 30, 860, 18);
    ctx.fillText(o.dateLine.toUpperCase(), W / 2, y);
    spaced(ctx, 0);
    y += 46;
  }
  ctx.fillStyle = INK;
  const where = [o.timeLine, o.church].filter(Boolean).join(" · ");
  if (where) {
    fit(ctx, where, (px) => `600 ${px}px ${display}`, 36, 840, 20);
    ctx.fillText(where, W / 2, y);
    y += 40;
  }
  if (o.address) {
    ctx.fillStyle = "#7a7064";
    fit(ctx, o.address, (px) => `italic 400 ${px}px ${display}`, 28, 820, 18);
    ctx.fillText(o.address, W / 2, y);
    y += 40;
  }
  if (o.verseRef) {
    ctx.fillStyle = GOLD;
    spaced(ctx, 2);
    ctx.font = `600 18px ${caps}`;
    ctx.fillText(`✝  ${o.verseRef.toUpperCase()}`, W / 2, y + 6);
    spaced(ctx, 0);
  }

  // Florals at the foot.
  drawImg(ctx, pampasL, -30, H - 430, 300);
  drawImg(ctx, peonies, 10, H - 330, 300);
  drawImg(ctx, roses, 160, H - 210, 240, true, 0.98);

  // The QR code on its own tile, bottom right.
  const qr = o.url ? encodeQr(o.url, "medium") : null;
  if (qr) {
    const tile = 186;
    const tx = W - tile - 70;
    const ty = H - tile - 104;
    ctx.save();
    ctx.shadowColor = "rgba(90,70,40,.2)";
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = "#fffdf8";
    roundRect(ctx, tx, ty, tile, tile + 40, 20);
    ctx.fill();
    ctx.restore();
    const quiet = 2;
    const n = qr.size + quiet * 2;
    const m = Math.floor((tile - 20) / n);
    const ox = tx + (tile - m * n) / 2 + quiet * m;
    const oy = ty + 10 + quiet * m;
    ctx.fillStyle = "#3b342c";
    for (let r = 0; r < qr.size; r++) for (let c = 0; c < qr.size; c++) if (qr.modules[r][c]) ctx.fillRect(ox + c * m, oy + r * m, m, m);
    ctx.fillStyle = ROSE;
    ctx.textAlign = "center";
    fit(ctx, o.qrHint, (px) => `600 ${px}px ${display}`, 19, tile - 18, 12);
    ctx.fillText(o.qrHint, tx + tile / 2, ty + tile + 26);
  }

  ctx.fillStyle = "rgba(59,52,44,.5)";
  ctx.font = `600 15px ${caps}`;
  ctx.textAlign = "center";
  ctx.fillText("SUBHSANDESH.IN", W / 2, H - 50);

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
