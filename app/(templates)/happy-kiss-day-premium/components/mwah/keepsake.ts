// The keepsake: her decorated Mwah Booth strip as a 1080×1920 story card.
// Drawn by hand on a canvas so the strip uses the page's exact geometry
// (Strip.GEO) and every sticker she pressed on lands in the same spot.
// Photos come through the same-origin image route, so the canvas never taints.

import { fileSlug } from "@/lib/exportPng";
import type { LovePhoto } from "../../../_valentine/types";
import { drawLipPrint } from "./LipPrint";
import { fmt, initialOf, stampDate, type Deco, type Mwah } from "./model";
import { GEO, STRIP_H } from "./Strip";
import { HEART_PATH } from "./ui";

const W = 1080;
const H = 1920;
const SPARKLE = "M12 1 C13 8 16 11 23 12 C16 13 13 16 12 23 C11 16 8 13 1 12 C8 11 11 8 12 1 Z";

const proxied = (src: string) => (src.startsWith("data:") || src.startsWith("/") ? src : `/_next/image?url=${encodeURIComponent(src)}&w=1080&q=75`);

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    const t = window.setTimeout(() => resolve(null), 12000);
    img.onload = () => (window.clearTimeout(t), resolve(img));
    img.onerror = () => (window.clearTimeout(t), resolve(null));
    img.src = proxied(src);
  });
}

function family(name: string, fallback: string) {
  const el = document.querySelector(".km-root");
  const v = el ? getComputedStyle(el).getPropertyValue(name).trim() : "";
  return v ? `${v}, ${fallback}` : fallback;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > max && line) {
      lines.push(line);
      line = w;
    } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

/** Cover-fit the photo (sender's crop) into a w×h frame. */
function cover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, ph: LovePhoto, x: number, y: number, w: number, h: number) {
  const s = Math.max(w / img.width, h / img.height) * (Math.max(100, Math.min(300, ph.scale ?? 100)) / 100);
  const dw = img.width * s;
  const dh = img.height * s;
  const fx = (ph.cropX ?? 50) / 100;
  const fy = (ph.cropY ?? 50) / 100;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, x + (w - dw) * fx, y + (h - dh) * fy, dw, dh);
  ctx.restore();
}

function heart(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, color: string, stroke = true, rot = 0) {
  const s = w / 100;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.scale(s, s);
  ctx.translate(-50, -45);
  const p = new Path2D(HEART_PATH);
  if (stroke) {
    ctx.lineWidth = 7;
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#fff";
    ctx.stroke(p);
  }
  ctx.fillStyle = color;
  ctx.fill(p);
  ctx.restore();
}

function sparkle(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, color: string, rot = 0) {
  const s = w / 24;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.scale(s, s);
  ctx.translate(-12, -12);
  const p = new Path2D(SPARKLE);
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#fff";
  ctx.lineJoin = "round";
  ctx.stroke(p);
  ctx.fillStyle = color;
  ctx.fill(p);
  ctx.restore();
}

function drawDeco(ctx: CanvasRenderingContext2D, d: Deco, x: number, y: number, size: number, m: Mwah, display: string) {
  switch (d.kind) {
    case "lips":
      drawLipPrint(ctx, x, y, size, m.S.c, m.lipstick, d.rot);
      break;
    case "heart":
      heart(ctx, x, y, size * 0.62, m.S.hi, true, d.rot);
      break;
    case "mwah": {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((d.rot * Math.PI) / 180);
      ctx.font = `400 ${Math.round(size * 0.3)}px ${display}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = size * 0.07;
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#fff";
      ctx.strokeText("mwah!", 0, 0);
      ctx.fillStyle = "#FF4F86";
      ctx.fillText("mwah!", 0, 0);
      ctx.restore();
      break;
    }
    default:
      sparkle(ctx, x, y, size * 0.48, "#FFC94D", d.rot);
  }
}

export async function renderStrip(m: Mwah, decos: Deco[], endLine: string): Promise<Blob | null> {
  const display = family("--font-km-display", "'Cherry Bomb One', system-ui, sans-serif");
  const hand = family("--font-km-hand", "'Shantell Sans', system-ui, sans-serif");
  try {
    await Promise.all([document.fonts.load(`400 96px ${display}`), document.fonts.load(`600 60px ${hand}`)]);
  } catch {
    /* draw with whatever is there */
  }
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  if (!ctx) return null;

  // Strawberry milk, two soft blobs and a dot grid.
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#FFF5F8");
  g.addColorStop(0.6, "#FFE3EC");
  g.addColorStop(1, "#FFD3E2");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  for (const [bx, by, br, col] of [
    [140, 260, 420, "rgba(255,209,223,.7)"],
    [960, 1640, 480, "rgba(255,226,122,.28)"],
  ] as const) {
    const rg = ctx.createRadialGradient(bx, by, 10, bx, by, br);
    rg.addColorStop(0, col);
    rg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.fillStyle = "rgba(214,63,114,.10)";
  for (let y = 18; y < H; y += 36) for (let x = 18; x < W; x += 36) ctx.fillRect(x, y, 3, 3);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#D63F72";
  ctx.font = `600 30px ${hand}`;
  ctx.fillText("Kiss Day · Mwah Booth 💋", W / 2, 130);
  ctx.font = `600 88px ${hand}`;
  const nl = wrap(ctx, `${m.recipient} & ${m.sender}`, 960).slice(0, 2);
  nl.forEach((l, i) => {
    ctx.lineWidth = 14;
    ctx.strokeStyle = "#fff";
    ctx.lineJoin = "round";
    ctx.strokeText(l, W / 2, 236 + i * 92);
    ctx.fillText(l, W / 2, 236 + i * 92);
  });

  // The strip.
  const top = 236 + nl.length * 92;
  const sw = Math.min(400, Math.floor((H - top - 420) / STRIP_H));
  const sh = sw * STRIP_H;
  const sx = (W - sw) / 2;
  const sy = top;
  ctx.save();
  ctx.translate(W / 2, sy + sh / 2);
  ctx.rotate((-3 * Math.PI) / 180);
  ctx.translate(-W / 2, -(sy + sh / 2));
  ctx.shadowColor = "rgba(214,63,114,.45)";
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 24;
  ctx.fillStyle = "#fff";
  ctx.fillRect(sx, sy, sw, sh);
  ctx.shadowColor = "transparent";
  ctx.fillStyle = "#FF4F86";
  ctx.font = `400 ${Math.round(sw * 0.11)}px ${display}`;
  ctx.textBaseline = "middle";
  ctx.fillText("Mwah Booth", W / 2, sy + (sw * GEO.head) / 2);
  const imgs = await Promise.all(m.strip.map((ph) => (ph ? loadImage(ph.url) : Promise.resolve(null))));
  m.strip.forEach((ph, i) => {
    const fx = sx + sw * GEO.pad;
    const fy = sy + sw * (GEO.head + i * (GEO.frameH + GEO.gap));
    const fw = sw * GEO.frameW;
    const fh = sw * GEO.frameH;
    const img = imgs[i];
    if (ph && img) cover(ctx, img, ph, fx, fy, fw, fh);
    else {
      ctx.fillStyle = "#FFE6EE";
      ctx.fillRect(fx, fy, fw, fh);
    }
  });
  const footY = sy + sh - (sw * GEO.foot) / 2;
  ctx.fillStyle = "#5B2333";
  ctx.font = `600 ${Math.round(sw * 0.075)}px ${hand}`;
  ctx.fillText(stampDate(), W / 2, footY - sw * 0.05);
  ctx.fillStyle = "#D63F72";
  ctx.font = `400 ${Math.round(sw * 0.085)}px ${display}`;
  ctx.fillText(`${initialOf(m.recipient)} ♥ ${initialOf(m.sender)}`, W / 2, footY + sw * 0.06);
  // Her stickers, where she put them (DOM deco size is ~0.427 × the strip width).
  for (const d of decos) drawDeco(ctx, d, sx + (d.x / 100) * sw, sy + (d.y / 100) * sh, sw * 0.427, m, display);
  ctx.restore();

  // A few kisses around the strip.
  drawLipPrint(ctx, sx - 150, sy + 220, 190, m.S.c, m.lipstick, -18);
  drawLipPrint(ctx, sx + sw + 150, sy + sh - 260, 170, m.S.hi, m.lipstick, 14);
  heart(ctx, sx + sw + 130, sy + 160, 110, "#FF9EBB", true, 12);
  heart(ctx, sx - 120, sy + sh - 120, 90, "#FF4F86", true, -10);
  sparkle(ctx, sx - 60, sy + 40, 54, "#FFC94D", 0);
  sparkle(ctx, sx + sw + 70, sy + sh * 0.5, 40, "#FFC94D", 20);

  // The last line, the days, the credit.
  ctx.textBaseline = "alphabetic";
  let y = sy + sh + 120;
  if (endLine) {
    ctx.fillStyle = "#D63F72";
    ctx.font = `600 52px ${hand}`;
    for (const l of wrap(ctx, endLine, 920).slice(0, 2)) {
      ctx.fillText(l, W / 2, y);
      y += 64;
    }
  }
  if (m.sinceDays) {
    ctx.fillStyle = "#8A4A5E";
    ctx.font = `600 34px ${hand}`;
    ctx.fillText(`${fmt(m.sinceDays)} days of us, and counting`, W / 2, y + 6);
  }
  ctx.fillStyle = "rgba(91,35,51,.55)";
  ctx.font = `600 24px ${hand}`;
  ctx.fillText("made on subhsandesh.in", W / 2, H - 60);

  try {
    return await new Promise<Blob | null>((resolve) => c.toBlob((bl) => resolve(bl), "image/png"));
  } catch {
    return null;
  }
}

/** Phones: the share sheet with the PNG (straight to her story). Desktop: a download. */
export async function saveStrip(m: Mwah, decos: Deco[], endLine: string): Promise<"shared" | "downloaded" | "failed"> {
  const blob = await renderStrip(m, decos, endLine);
  if (!blob) return "failed";
  const name = `${fileSlug(`mwah-booth-${m.recipient}`, "mwah-booth")}.png`;
  const file = new File([blob], name, { type: "image/png" });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  const touch = typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches;
  if (touch && nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], text: `${m.recipient} & ${m.sender} 💋` });
      return "shared";
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return "shared";
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
  return "downloaded";
}
