// ─── Photo card ──────────────────────────────────────────────────────────────
//
// The sender's photograph, untouched and full size, above a plain black-and-
// white QR code. One image, sent as one file.
//
// ── WHY THIS EXISTS ──────────────────────────────────────────────────────────
//
// Because a photo QR cannot give you a clear photo, and no amount of work on it
// will. Inside a symbol, every module's mean brightness is dictated by the code,
// and the code is essentially random — so the picture survives only as
// modulation within the dark and the light groups. Measuring the freedom that
// is actually left (which of the eight masks to use, and the padding codewords
// the spec leaves free) puts the ceiling at a couple of percent. That is not a
// tuning problem, it is the format.
//
// The way out is to stop asking one square to be both things. Here the photo is
// a photograph — no dither, no compression, nothing done to it at all — and the
// code is an ordinary high-contrast QR that scans like any other. Both are
// perfect because neither is fighting the other.
//
// ── DRAWN ON A CANVAS, NOT CAPTURED FROM THE DOM ─────────────────────────────
//
// `html-to-image` has to inline every font and stylesheet the page has loaded,
// and it fails on cross-origin ones — the app's Google Fonts link already
// produces a console error during the printable-card export. A canvas has no
// such dependency: what is drawn is what is saved, on any device, every time.
// The type here is deliberately plain for the same reason.

import { encodeQr } from "./qr";

/** Modules of white margin around the symbol. The spec's minimum is 4. */
const QUIET_ZONE = 4;

/** Card geometry, in card pixels. Portrait, close to 4:5 — a good chat crop. */
const CARD_W = 1080;
const CARD_H = 1500;
const PAD = 56;

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

const toRgb = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(full, 16);
  return Number.isNaN(n) ? [194, 24, 91] : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const mix = (hex: string, towards: number, amount: number): string => {
  const [r, g, b] = toRgb(hex);
  const f = (c: number) => Math.round(c + (towards - c) * amount);
  return `rgb(${f(r)}, ${f(g)}, ${f(b)})`;
};

/** Black or white, whichever stays readable on `hex`. */
function readableInk(hex: string): string {
  const [r, g, b] = toRgb(hex);
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return lum > 0.62 ? "#1A1A1A" : "#FFFFFF";
}

/** Draw text clipped to `maxW`, with an ellipsis if it will not fit. */
function fitText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string {
  if (ctx.measureText(text).width <= maxW) return text;
  let cut = text;
  while (cut.length > 1 && ctx.measureText(`${cut}…`).width > maxW) cut = cut.slice(0, -1);
  return `${cut}…`;
}

export interface PhotoCardOptions {
  accent?: string;
  /** Same-origin mark. Cross-origin would taint the canvas and lose the export. */
  logoSrc?: string;
  senderName?: string;
  recipientName?: string;
  /** Headline above the photo. */
  title?: string;
}

/**
 * The photo above a plain QR, as a PNG data URL. Null if the text cannot be
 * encoded, the photo will not load, or there is no canvas.
 */
export async function photoCardToPngDataUrl(
  text: string,
  imageSrc: string,
  opts: PhotoCardOptions = {},
): Promise<string | null> {
  const matrix = encodeQr(text, "medium");
  if (!matrix || !imageSrc) return null;

  const accent = opts.accent || "#C2185B";

  try {
    const photo = await loadImage(imageSrc);
    if (!photo || !photo.width || !photo.height) return null;

    const canvas = document.createElement("canvas");
    canvas.width = CARD_W;
    canvas.height = CARD_H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // ── Ground ───────────────────────────────────────────────────────────────
    const bg = ctx.createLinearGradient(0, 0, 0, CARD_H);
    bg.addColorStop(0, mix(accent, 255, 0.86));
    bg.addColorStop(0.55, "#FFFFFF");
    bg.addColorStop(1, mix(accent, 255, 0.9));
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CARD_W, CARD_H);

    ctx.strokeStyle = mix(accent, 255, 0.62);
    ctx.lineWidth = 3;
    roundRect(ctx, 18, 18, CARD_W - 36, CARD_H - 36, 40);
    ctx.stroke();

    const innerW = CARD_W - PAD * 2;
    let y = PAD + 12;

    // ── Header ───────────────────────────────────────────────────────────────
    ctx.textBaseline = "top";
    ctx.fillStyle = mix(accent, 0, 0.25);
    ctx.font = "700 30px 'Trebuchet MS', system-ui, sans-serif";
    const kicker = (opts.title || "A gift for you").toUpperCase();
    ctx.fillText(fitText(ctx, kicker, innerW - 300), PAD, y + 12);

    if (opts.logoSrc) {
      const logo = await loadImage(opts.logoSrc);
      if (logo) {
        const chipH = 68;
        const chipW = 250;
        const chipX = CARD_W - PAD - chipW;
        ctx.fillStyle = "#FFFFFF";
        ctx.strokeStyle = mix(accent, 255, 0.6);
        ctx.lineWidth = 2;
        roundRect(ctx, chipX, y, chipW, chipH, chipH / 2);
        ctx.fill();
        ctx.stroke();
        ctx.drawImage(logo, chipX + 14, y + 10, 48, 48);
        ctx.fillStyle = mix(accent, 0, 0.3);
        ctx.font = "700 26px 'Trebuchet MS', system-ui, sans-serif";
        ctx.fillText("SubhSandesh", chipX + 74, y + 21);
      }
    }
    y += 96;

    if (opts.recipientName) {
      ctx.fillStyle = mix(accent, 0, 0.12);
      ctx.font = "700 56px Georgia, 'Times New Roman', serif";
      ctx.fillText(fitText(ctx, `For ${opts.recipientName}`, innerW), PAD, y);
      y += 76;
    }

    // ── The photograph. Cover-fit, and NOTHING done to it. ───────────────────
    const photoH = 720;
    const cover = Math.max(innerW / photo.width, photoH / photo.height);
    ctx.save();
    roundRect(ctx, PAD, y, innerW, photoH, 32);
    ctx.clip();
    ctx.drawImage(
      photo,
      PAD + (innerW - photo.width * cover) / 2,
      y + (photoH - photo.height * cover) / 2,
      photo.width * cover,
      photo.height * cover,
    );
    ctx.restore();
    ctx.strokeStyle = mix(accent, 255, 0.55);
    ctx.lineWidth = 3;
    roundRect(ctx, PAD, y, innerW, photoH, 32);
    ctx.stroke();
    y += photoH + 44;

    // ── The code. Plain, black on white, integer module scale. ───────────────
    const extent = matrix.size + QUIET_ZONE * 2;
    const target = 330;
    const scale = Math.max(1, Math.floor(target / extent));
    const qrDim = extent * scale;
    const qrX = PAD + 8;
    const qrY = y;

    ctx.fillStyle = "#FFFFFF";
    roundRect(ctx, qrX - 14, qrY - 14, qrDim + 28, qrDim + 28, 22);
    ctx.fill();
    ctx.fillStyle = "#000000";
    for (let my = 0; my < matrix.size; my++) {
      for (let mx = 0; mx < matrix.size; mx++) {
        if (matrix.modules[my][mx]) {
          ctx.fillRect(
            qrX + (mx + QUIET_ZONE) * scale,
            qrY + (my + QUIET_ZONE) * scale,
            scale,
            scale,
          );
        }
      }
    }

    // ── Words beside the code ────────────────────────────────────────────────
    const textX = qrX + qrDim + 46;
    const textW = CARD_W - PAD - textX;
    let ty = qrY + 6;

    ctx.fillStyle = mix(accent, 0, 0.12);
    ctx.font = "700 44px Georgia, 'Times New Roman', serif";
    ctx.fillText(fitText(ctx, "Scan to open", textW), textX, ty);
    ty += 62;

    ctx.fillStyle = mix(accent, 255, 0.28);
    ctx.font = "400 26px 'Trebuchet MS', system-ui, sans-serif";
    for (const line of ["Point your phone camera", "at the code. No app needed."]) {
      ctx.fillText(fitText(ctx, line, textW), textX, ty);
      ty += 34;
    }

    if (opts.senderName) {
      ty += 18;
      ctx.fillStyle = accent;
      ctx.font = "700 30px 'Trebuchet MS', system-ui, sans-serif";
      ctx.fillText(fitText(ctx, `From ${opts.senderName}`, textW), textX, ty);
    }

    // ── Footer ───────────────────────────────────────────────────────────────
    ctx.fillStyle = accent;
    roundRect(ctx, PAD, CARD_H - PAD - 56, innerW, 56, 28);
    ctx.fill();
    ctx.fillStyle = readableInk(accent);
    ctx.font = "700 26px 'Trebuchet MS', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("made with subhsandesh.in", CARD_W / 2, CARD_H - PAD - 39);
    ctx.textAlign = "left";

    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}
