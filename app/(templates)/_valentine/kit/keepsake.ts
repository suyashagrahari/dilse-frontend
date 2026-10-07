// ─── Keepsake — a 1080×1920 story-sized PNG from a layout description ────────
//
// Drawn on an offscreen canvas (no DOM capture, no html-to-image), so it is
// exact on every phone. Fonts: waits for document.fonts.ready and resolves the
// next/font families (see ./canvasFonts). Images: remote https photos are
// fetched through `/_next/image` (same origin → the canvas is never tainted);
// data: URLs are used directly; an image that fails is skipped, never fatal.
//
//   await downloadKeepsake(defaultKeepsake(day, data, { headline: "said YES after 4 dodges" }), "happy-rose-day-ananya");
//
// Coordinates are in keepsake pixels (1080 wide).

import { fileSlug } from "@/lib/exportPng";
import type { DayConfig, ValentineDayData } from "../types";
import { canvasFont, type CanvasFace } from "./canvasFonts";

export type KeepsakeItem =
  | {
      type: "text";
      text: string;
      x: number;
      y: number;
      size: number;
      face?: CanvasFace;
      weight?: number | string;
      italic?: boolean;
      color?: string;
      align?: CanvasTextAlign;
      /** Wraps to this width. */
      maxWidth?: number;
      /** Multiplier of size. Default 1.25. */
      lineHeight?: number;
      maxLines?: number;
    }
  | { type: "emoji"; char: string; x: number; y: number; size: number }
  | {
      type: "image";
      src: string;
      x: number;
      y: number;
      w: number;
      h: number;
      radius?: number;
      /** Focal point 0–100 (LovePhoto cropX/cropY). */
      cropX?: number;
      cropY?: number;
      /** Polaroid-style frame. */
      frame?: { pad: number; bottom: number; color: string };
      rotate?: number;
    }
  | { type: "rect"; x: number; y: number; w: number; h: number; radius?: number; fill?: string; stroke?: string; lineWidth?: number };

export interface KeepsakeLayout {
  width?: number;
  height?: number;
  /** A colour, or a vertical gradient as [offset 0–1, colour] stops. */
  background: string | { stops: readonly (readonly [number, string])[] };
  items: KeepsakeItem[];
}

const sameOrigin = (src: string, w: number) =>
  src.startsWith("data:") || src.startsWith("/") ? src : `/_next/image?url=${encodeURIComponent(src)}&w=${w <= 640 ? 640 : 1080}&q=75`;

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const out: string[] = [];
  for (const para of text.split("\n")) {
    const words = para.split(/\s+/);
    let line = "";
    for (const w of words) {
      const next = line ? `${line} ${w}` : w;
      if (ctx.measureText(next).width > maxWidth && line) {
        out.push(line);
        line = w;
      } else line = next;
    }
    out.push(line);
  }
  return out;
}

export async function renderKeepsake(layout: KeepsakeLayout): Promise<Blob | null> {
  if (typeof document === "undefined") return null;
  const W = layout.width ?? 1080;
  const H = layout.height ?? 1920;
  try {
    await document.fonts?.ready;
  } catch {
    /* fine */
  }
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  if (typeof layout.background === "string") ctx.fillStyle = layout.background;
  else {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    for (const [o, c] of layout.background.stops) g.addColorStop(o, c);
    ctx.fillStyle = g;
  }
  ctx.fillRect(0, 0, W, H);

  // Load every image up front, in parallel.
  const imgs = await Promise.all(
    layout.items.map((it) => (it.type === "image" && it.src ? loadImage(sameOrigin(it.src, it.w)) : Promise.resolve(null))),
  );

  layout.items.forEach((it, i) => {
    ctx.save();
    if (it.type === "rect") {
      roundRect(ctx, it.x, it.y, it.w, it.h, it.radius ?? 0);
      if (it.fill) {
        ctx.fillStyle = it.fill;
        ctx.fill();
      }
      if (it.stroke) {
        ctx.strokeStyle = it.stroke;
        ctx.lineWidth = it.lineWidth ?? 2;
        ctx.stroke();
      }
    } else if (it.type === "emoji") {
      ctx.font = `${it.size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(it.char, it.x, it.y);
    } else if (it.type === "text") {
      ctx.font = canvasFont(it.face ?? "ui", it.size, it.weight ?? 400, it.italic);
      ctx.fillStyle = it.color ?? "#222";
      ctx.textAlign = it.align ?? "center";
      ctx.textBaseline = "top";
      const lines = it.maxWidth ? wrap(ctx, it.text, it.maxWidth) : it.text.split("\n");
      const lh = it.size * (it.lineHeight ?? 1.25);
      const shown = it.maxLines ? lines.slice(0, it.maxLines) : lines;
      if (it.maxLines && lines.length > it.maxLines) shown[shown.length - 1] = `${shown[shown.length - 1].replace(/\s+\S*$/, "")}…`;
      shown.forEach((l, k) => ctx.fillText(l, it.x, it.y + k * lh));
    } else if (it.type === "image") {
      const img = imgs[i];
      ctx.translate(it.x + it.w / 2, it.y + it.h / 2);
      if (it.rotate) ctx.rotate((it.rotate * Math.PI) / 180);
      ctx.translate(-it.w / 2, -it.h / 2);
      let ix = 0;
      let iy = 0;
      let iw = it.w;
      let ih = it.h;
      if (it.frame) {
        ctx.shadowColor = "rgba(0,0,0,.25)";
        ctx.shadowBlur = 30;
        ctx.shadowOffsetY = 12;
        ctx.fillStyle = it.frame.color;
        ctx.fillRect(0, 0, it.w, it.h);
        ctx.shadowColor = "transparent";
        ix = it.frame.pad;
        iy = it.frame.pad;
        iw = it.w - it.frame.pad * 2;
        ih = it.h - it.frame.pad - it.frame.bottom;
      }
      if (img) {
        ctx.save();
        roundRect(ctx, ix, iy, iw, ih, it.radius ?? 0);
        ctx.clip();
        // object-fit: cover around the focal point.
        const s = Math.max(iw / img.width, ih / img.height);
        const dw = img.width * s;
        const dh = img.height * s;
        const fx = (it.cropX ?? 50) / 100;
        const fy = (it.cropY ?? 50) / 100;
        ctx.drawImage(img, ix - (dw - iw) * fx, iy - (dh - ih) * fy, dw, dh);
        ctx.restore();
      } else {
        ctx.fillStyle = "rgba(0,0,0,.06)";
        ctx.fillRect(ix, iy, iw, ih);
      }
    }
    ctx.restore();
  });

  try {
    return await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
  } catch {
    // A tainted canvas (an image that slipped past the same-origin route).
    return null;
  }
}

/** Renders and downloads. Returns false if the browser could not produce the PNG. */
export async function downloadKeepsake(layout: KeepsakeLayout, name: string): Promise<boolean> {
  const blob = await renderKeepsake(layout);
  if (!blob) return false;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileSlug(name, "keepsake")}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
  return true;
}

/**
 * A pretty default keepsake for any day: names, the day, the first photo as a
 * polaroid, the end line and up to three extra lines. Day builders can start
 * from this and push their own items.
 */
export function defaultKeepsake(day: DayConfig, data: ValentineDayData, opts: { headline?: string; lines?: string[] } = {}): KeepsakeLayout {
  const t = day.theme;
  const W = 1080;
  const items: KeepsakeItem[] = [
    { type: "emoji", char: day.emoji, x: W / 2, y: 190, size: 120 },
    { type: "text", text: `Happy ${day.name}`.toUpperCase(), x: W / 2, y: 290, size: 40, weight: 600, color: t.inkSoft, face: "ui" },
    { type: "text", text: data.recipientName || "You", x: W / 2, y: 360, size: 120, face: "script", weight: 700, color: t.ink, maxWidth: 940, maxLines: 1 },
  ];
  if (data.petName) items.push({ type: "text", text: `“${data.petName}”`, x: W / 2, y: 510, size: 44, face: "serif", italic: true, color: t.inkSoft, maxWidth: 900, maxLines: 1 });
  const photo = data.photos[0];
  if (photo?.url) {
    items.push({ type: "image", src: photo.url, x: 190, y: 620, w: 700, h: 820, cropX: photo.cropX, cropY: photo.cropY, rotate: -3, frame: { pad: 28, bottom: 130, color: "#FFFFFF" } });
    if (photo.caption) items.push({ type: "text", text: photo.caption, x: W / 2 - 40, y: 1340, size: 50, face: "script", color: "#4a3a3a", maxWidth: 620, maxLines: 1 });
  } else {
    items.push({ type: "emoji", char: day.emoji, x: W / 2, y: 1020, size: 380 });
  }
  let y = 1520;
  if (opts.headline) {
    items.push({ type: "text", text: opts.headline, x: W / 2, y, size: 54, weight: 700, color: t.accent, maxWidth: 940, maxLines: 2 });
    y += 140;
  }
  for (const l of [data.endLine, ...(opts.lines ?? [])].filter(Boolean).slice(0, 3)) {
    items.push({ type: "text", text: l, x: W / 2, y, size: 42, face: "serif", italic: true, color: t.ink, maxWidth: 900, maxLines: 2 });
    y += 110;
  }
  items.push({ type: "text", text: `— ${data.senderName || ""}`, x: W / 2, y: Math.max(y, 1700), size: 52, face: "script", color: t.ink });
  items.push({ type: "text", text: "made on subhsandesh.in", x: W / 2, y: 1846, size: 28, color: t.inkSoft, face: "ui" });
  // The bg token can be a CSS gradient string; the canvas wants plain stops.
  return { background: { stops: t.dark ? [[0, t.base], [0.65, t.base], [1, t.accentDeep]] : [[0, t.base], [1, t.soft]] }, items };
}
