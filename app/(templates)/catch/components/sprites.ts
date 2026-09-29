// ─── Catch — pre-rendered sprites ────────────────────────────────────────────
//
// Everything that falls is drawn ONCE into a small offscreen canvas and then
// blitted with drawImage every frame. Emoji text rendering and shadows are the
// two most expensive things a 2D canvas does; doing them per frame is what
// makes casual web games stutter on a mid-range phone.

import type { Crop } from "../../dedication/components/types";

export type Sprite = HTMLCanvasElement;

/** Canvas sprites are rendered at this multiple of their logical size. */
export const SPRITE_RES = 2.5;

let displayFamily = "";
/** The real (hashed) family name next/font gave Fredoka, for ctx.font. */
export function displayFont(): string {
  if (displayFamily) return displayFamily;
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue("--font-fredoka").trim();
    displayFamily = v ? `${v}, "Baloo 2", system-ui, sans-serif` : `system-ui, sans-serif`;
  } catch {
    displayFamily = "system-ui, sans-serif";
  }
  return displayFamily;
}

const EMOJI_FONT = `"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;

function make(w: number, h: number): [Sprite, CanvasRenderingContext2D] {
  const c = document.createElement("canvas");
  c.width = Math.ceil(w * SPRITE_RES);
  c.height = Math.ceil(h * SPRITE_RES);
  const ctx = c.getContext("2d")!;
  ctx.scale(SPRITE_RES, SPRITE_RES);
  return [c, ctx];
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export function heartPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  // A plump heart, `s` ≈ its width.
  const k = s / 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy + k * 0.85);
  ctx.bezierCurveTo(cx - k * 1.25, cy + k * 0.05, cx - k * 0.95, cy - k * 1.05, cx, cy - k * 0.42);
  ctx.bezierCurveTo(cx + k * 0.95, cy - k * 1.05, cx + k * 1.25, cy + k * 0.05, cx, cy + k * 0.85);
  ctx.closePath();
}

const cache = new Map<string, Sprite>();
const cached = (key: string, build: () => Sprite): Sprite => {
  let s = cache.get(key);
  if (!s) {
    s = build();
    cache.set(key, s);
  }
  return s;
};

/** A letter piece: a little sealed note card with the object's emoji. */
export function pieceSprite(emoji: string): Sprite {
  return cached(`p:${emoji}`, () => {
    const S = 62;
    const [c, ctx] = make(S, S);
    ctx.save();
    ctx.shadowColor = "rgba(90,30,90,.28)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;
    roundRect(ctx, 5, 5, 52, 50, 14);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.restore();
    // pink border + inner tint
    roundRect(ctx, 5, 5, 52, 50, 14);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#FF7EB6";
    ctx.stroke();
    roundRect(ctx, 9, 9, 44, 42, 10);
    ctx.fillStyle = "#FFF1F7";
    ctx.fill();
    ctx.font = `28px ${EMOJI_FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, 31, 32);
    // heart seal
    ctx.fillStyle = "#FF4F9A";
    heartPath(ctx, 51, 12, 15);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
    return c;
  });
}

/** A petty thing to dodge: a grey chat bubble with a red ring. */
export function badSprite(emoji: string, label: string, font: string): Sprite {
  const text = label.length > 16 ? `${label.slice(0, 15)}…` : label;
  return cached(`b:${emoji}:${text}`, () => {
    const probe = document.createElement("canvas").getContext("2d")!;
    probe.font = `600 13px ${font}`;
    const tw = text ? probe.measureText(text).width : 0;
    const w = Math.max(46, 38 + tw + (text ? 12 : 0));
    const h = 44;
    const [c, ctx] = make(w + 8, h + 12);
    ctx.save();
    ctx.shadowColor = "rgba(40,10,60,.3)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    roundRect(ctx, 4, 4, w, h - 6, 19);
    ctx.fillStyle = "#EDE7F5";
    ctx.fill();
    ctx.restore();
    // tail
    ctx.beginPath();
    ctx.moveTo(14, h - 6);
    ctx.lineTo(9, h + 3);
    ctx.lineTo(24, h - 6);
    ctx.fillStyle = "#EDE7F5";
    ctx.fill();
    roundRect(ctx, 4, 4, w, h - 6, 19);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#FF4D5E";
    ctx.stroke();
    ctx.font = `20px ${EMOJI_FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, 23, 23);
    if (text) {
      ctx.font = `600 13px ${font}`;
      ctx.textAlign = "left";
      ctx.fillStyle = "#3B2B4F";
      ctx.fillText(text, 38, 24);
    }
    return c;
  });
}

/** A plain collectible heart. */
export function heartSprite(): Sprite {
  return cached("h", () => {
    const S = 34;
    const [c, ctx] = make(S, S);
    ctx.save();
    ctx.shadowColor = "rgba(209,42,114,.45)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;
    const g = ctx.createLinearGradient(0, 4, 0, 30);
    g.addColorStop(0, "#FF8DC0");
    g.addColorStop(1, "#FF3D86");
    ctx.fillStyle = g;
    heartPath(ctx, 17, 17, 28);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = "rgba(255,255,255,.75)";
    ctx.beginPath();
    ctx.ellipse(11, 11, 4, 2.6, -0.6, 0, Math.PI * 2);
    ctx.fill();
    return c;
  });
}

const POWER_META = {
  magnet: { glyph: "🧲", a: "#A58BFF", b: "#6A48F0" },
  double: { glyph: "✨", a: "#FFE27A", b: "#FFB300" },
  shield: { glyph: "🛡️", a: "#7EF0CB", b: "#1FB889" },
} as const;
export type PowerKind = keyof typeof POWER_META;

export function powerSprite(kind: PowerKind): Sprite {
  return cached(`w:${kind}`, () => {
    const S = 54;
    const m = POWER_META[kind];
    const [c, ctx] = make(S, S);
    ctx.save();
    ctx.shadowColor = m.b;
    ctx.shadowBlur = 12;
    const g = ctx.createRadialGradient(22, 20, 4, 27, 27, 24);
    g.addColorStop(0, "#fff");
    g.addColorStop(0.35, m.a);
    g.addColorStop(1, m.b);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(27, 27, 21, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    ctx.arc(27, 27, 21, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = `22px ${EMOJI_FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (kind === "double") {
      ctx.font = `800 17px ${displayFont()}`;
      ctx.fillStyle = "#7A4A00";
      ctx.fillText("×2", 27, 28);
    } else ctx.fillText(m.glyph, 27, 28);
    return c;
  });
}

/**
 * Draw `img` into the frame (x, y, w, h) exactly the way `cropStyle()` renders
 * it in CSS: object-fit cover, object-position x% y%, then scale about that
 * same point. So a photo framed in the editor looks identical in the game.
 */
export function drawCropped(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number, crop: Crop) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const s = Math.max(w / iw, h / ih);
  const dw = iw * s;
  const dh = ih * s;
  const ox = (w - dw) * (crop.x / 100);
  const oy = (h - dh) * (crop.y / 100);
  const k = crop.scale / 100;
  const px = w * (crop.x / 100);
  const py = h * (crop.y / 100);
  ctx.drawImage(img, x + px + (ox - px) * k, y + py + (oy - py) * k, dw * k, dh * k);
}

/** A memory polaroid. Built per photo once its image has loaded. */
export function polaroidSprite(key: string, img: HTMLImageElement | null, crop: Crop): Sprite {
  return cached(`ph:${key}:${img ? "1" : "0"}`, () => {
    const W = 62;
    const H = 74;
    const [c, ctx] = make(W + 10, H + 12);
    ctx.save();
    ctx.shadowColor = "rgba(60,20,70,.32)";
    ctx.shadowBlur = 9;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = "#fff";
    roundRect(ctx, 5, 5, W, H, 5);
    ctx.fill();
    ctx.restore();
    ctx.save();
    roundRect(ctx, 10, 10, W - 10, W - 10, 3);
    ctx.clip();
    if (img) drawCropped(ctx, img, 10, 10, W - 10, W - 10, crop);
    else {
      const g = ctx.createLinearGradient(10, 10, W, W);
      g.addColorStop(0, "#FFC2E2");
      g.addColorStop(1, "#C8B8FF");
      ctx.fillStyle = g;
      ctx.fillRect(10, 10, W - 10, W - 10);
      ctx.font = `20px ${EMOJI_FONT}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("📸", 5 + W / 2, 5 + W / 2);
    }
    ctx.restore();
    // washi tape
    ctx.fillStyle = "rgba(255,216,77,.85)";
    ctx.save();
    ctx.translate(36, 6);
    ctx.rotate(-0.12);
    ctx.fillRect(-12, -4, 24, 9);
    ctx.restore();
    // little heart on the chin
    ctx.fillStyle = "#FF4F9A";
    heartPath(ctx, 5 + W / 2, 5 + H - 8, 10);
    ctx.fill();
    return c;
  });
}

/** A soft cartoon cloud for the parallax sky. */
export function cloudSprite(): Sprite {
  return cached("cloud", () => {
    const [c, ctx] = make(140, 64);
    ctx.fillStyle = "rgba(255,255,255,.85)";
    for (const [x, y, r] of [
      [36, 40, 22],
      [62, 28, 26],
      [92, 34, 22],
      [112, 44, 16],
      [22, 48, 14],
    ] as const) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    roundRect(ctx, 14, 40, 110, 20, 10);
    ctx.fill();
    return c;
  });
}

/** Loads an image; resolves null on failure so a dead link never breaks a run. */
export function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}
