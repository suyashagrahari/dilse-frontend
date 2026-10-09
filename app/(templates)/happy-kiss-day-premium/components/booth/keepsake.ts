// The keepsake: their strip, with both kisses on it, as a 1080×1920 story
// image. Drawn by hand on a canvas (not the kit's layout renderer) so the
// frames can print in true black and white and the lip prints match the page.
// Photos come through the same-origin image route, so the canvas never taints.

import { fileSlug } from "@/lib/exportPng";
import type { LovePhoto } from "../../../_valentine/types";
import { drawLipPrint } from "./LipPrint";
import { initialOf, stampDate, type Booth } from "./model";

const W = 1080;
const H = 1920;

const proxied = (src: string) => (src.startsWith("data:") || src.startsWith("/") ? src : `/_next/image?url=${encodeURIComponent(src)}&w=1080&q=75`);

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = proxied(src);
  });
}

function family(name: string, fallback: string) {
  const el = document.querySelector(".pb-root");
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

/** Cover-fit the photo (sender's crop) into a w×h frame, in black and white when asked. */
function frame(img: HTMLImageElement, ph: LovePhoto, w: number, h: number, mono: boolean) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const x = c.getContext("2d");
  if (!x) return c;
  const s = Math.max(w / img.width, h / img.height) * (Math.max(100, Math.min(300, ph.scale ?? 100)) / 100);
  const dw = img.width * s;
  const dh = img.height * s;
  const fx = (ph.cropX ?? 50) / 100;
  const fy = (ph.cropY ?? 50) / 100;
  x.drawImage(img, (w - dw) * fx, (h - dh) * fy, dw, dh);
  const d = x.getImageData(0, 0, w, h);
  const p = d.data;
  for (let i = 0; i < p.length; i += 4) {
    let r = p[i], g = p[i + 1], b = p[i + 2];
    if (mono) {
      let l = 0.299 * r + 0.587 * g + 0.114 * b;
      l = Math.max(0, Math.min(255, (l - 128) * 1.14 + 128 + 6));
      r = g = b = l;
    } else {
      r = Math.min(255, r * 1.02 + 6);
      b = b * 0.93;
    }
    p[i] = r;
    p[i + 1] = g;
    p[i + 2] = b;
  }
  x.putImageData(d, 0, 0);
  return c;
}

export async function renderStrip(b: Booth, endLine: string, kissed: boolean): Promise<Blob | null> {
  const display = family("--font-pb-display", "Georgia, serif");
  const mono = family("--font-pb-mono", "ui-monospace, monospace");
  try {
    await Promise.all([document.fonts.load(`400 96px ${display}`), document.fonts.load(`700 30px ${mono}`)]);
  } catch {
    /* draw with whatever is there */
  }
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  if (!ctx) return null;

  // Lacquer to black, with a warm key light from the top.
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#3a0a10");
  g.addColorStop(0.45, "#160607");
  g.addColorStop(1, "#0b0607");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const key = ctx.createRadialGradient(W / 2, 260, 40, W / 2, 260, 900);
  key.addColorStop(0, "rgba(193,18,31,.45)");
  key.addColorStop(1, "rgba(193,18,31,0)");
  ctx.fillStyle = key;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "rgba(244,237,225,.62)";
  ctx.font = `700 26px ${mono}`;
  ctx.letterSpacing = "8px";
  ctx.fillText("PHOTO BOOTH · KISS DAY", W / 2, 150);
  ctx.letterSpacing = "0px";
  ctx.fillStyle = "#F4EDE1";
  ctx.font = `400 92px ${display}`;
  const names = `${b.recipient} & ${b.sender}`;
  const nl = wrap(ctx, names, 960).slice(0, 2);
  nl.forEach((l, i) => ctx.fillText(l, W / 2, 262 + i * 96));

  // The strip.
  // Fit the strip between the names and room for the last line + credit.
  const sy = 262 + nl.length * 96 + 20;
  const room = H - sy - 300;
  const sw = Math.min(500, Math.floor(room / 3.42));
  const pad = Math.round(sw * 0.06);
  const fw = sw - pad * 2;
  const fh = Math.round((fw * 3) / 4);
  const gap = Math.round(sw * 0.034);
  const foot = Math.round(sw * 0.4);
  const sh = pad + 4 * fh + 3 * gap + foot;
  const sx = (W - sw) / 2;
  ctx.save();
  ctx.translate(W / 2, sy + sh / 2);
  ctx.rotate((-2.2 * Math.PI) / 180);
  ctx.translate(-W / 2, -(sy + sh / 2));
  ctx.shadowColor = "rgba(0,0,0,.7)";
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 30;
  ctx.fillStyle = "#F7F2E8";
  ctx.fillRect(sx, sy, sw, sh);
  ctx.shadowColor = "transparent";
  const imgs = await Promise.all(b.frames.map((ph) => (ph ? loadImage(ph.url) : Promise.resolve(null))));
  b.frames.forEach((ph, i) => {
    const y = sy + pad + i * (fh + gap);
    const img = imgs[i];
    if (ph && img) ctx.drawImage(frame(img, ph, fw, fh, b.mono), sx + pad, y);
    else {
      ctx.fillStyle = "#1d1a1a";
      ctx.fillRect(sx + pad, y, fw, fh);
    }
  });
  const fy = sy + pad + 4 * fh + 3 * gap;
  drawLipPrint(ctx, W / 2 - sw * 0.16, fy + foot * 0.4, sw * 0.3, b.S.c, b.lipstick, -8);
  if (kissed) drawLipPrint(ctx, W / 2 + sw * 0.16, fy + foot * 0.42, sw * 0.3, b.S.c, b.lipstick, 10);
  ctx.fillStyle = "rgba(138,21,32,.8)";
  ctx.font = `400 ${Math.round(sw * 0.05)}px ${mono}`;
  ctx.letterSpacing = "5px";
  ctx.fillText(`${stampDate()} · ${initialOf(b.recipient)}+${initialOf(b.sender)}`, W / 2, fy + foot * 0.82);
  ctx.letterSpacing = "0px";
  ctx.restore();

  // The last line.
  let y = sy + sh + 110;
  if (endLine) {
    ctx.fillStyle = "#F4EDE1";
    ctx.font = `400 50px ${display}`;
    for (const l of wrap(ctx, endLine, 900).slice(0, 2)) {
      ctx.fillText(l, W / 2, y);
      y += 62;
    }
  }
  ctx.fillStyle = "rgba(244,237,225,.5)";
  ctx.font = `400 22px ${mono}`;
  ctx.letterSpacing = "5px";
  ctx.fillText("MADE ON SUBHSANDESH.IN", W / 2, H - 70);
  ctx.letterSpacing = "0px";

  // Film grain.
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,.035)" : "rgba(0,0,0,.05)";
    ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2);
  }
  try {
    return await new Promise<Blob | null>((resolve) => c.toBlob((bl) => resolve(bl), "image/png"));
  } catch {
    return null;
  }
}

/** Web Share with the PNG where phones can share files, else a download. */
export async function saveStrip(b: Booth, endLine: string, kissed: boolean): Promise<"shared" | "downloaded" | "failed"> {
  const blob = await renderStrip(b, endLine, kissed);
  if (!blob) return "failed";
  const name = `${fileSlug(`photo-booth-${b.recipient}`, "photo-booth")}.png`;
  const file = new File([blob], name, { type: "image/png" });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], text: `${b.recipient} & ${b.sender} 💋` });
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
