"use client";

// ─── Personal links (?to=Name) and the downloadable invite card ──────────────
// useGuestName reads ?to= after mount (no SSR mismatch), trims it to 40
// characters and only ever renders it as text. inviteCardPng draws a
// 1080×1350 PNG on a canvas from same-origin art (so the canvas is never
// tainted), with the kit's own fonts once they are loaded, and a QR code of
// the invitation for elders who would rather scan than tap.

import { useEffect, useState } from "react";
import { encodeQr } from "@/lib/share/qr";
import { A } from "./assets";

const clean = (v: string) =>
  v
    .replace(/[\u0000-\u001f\u007f<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40);

/** The guest's name from `?to=` (empty when absent). */
export function useGuestName(): string {
  const [name, setName] = useState("");
  useEffect(() => {
    try {
      const v = new URLSearchParams(window.location.search).get("to") ?? "";
      // A deferred set: the first render matches the server (no ?to= there).
      const t = window.setTimeout(() => setName(clean(v)), 0);
      return () => window.clearTimeout(t);
    } catch {
      return undefined;
    }
  }, []);
  return name;
}

/** The page link without hash or ?to= (what a guest forwards). */
export function pageUrl(): string {
  if (typeof window === "undefined") return "";
  const u = new URL(window.location.href);
  u.hash = "";
  u.searchParams.delete("to");
  return u.toString();
}

/** The page link addressed to one guest. */
export function personalUrl(base: string, name: string): string {
  try {
    const u = new URL(base);
    const n = clean(name);
    if (n) u.searchParams.set("to", n);
    else u.searchParams.delete("to");
    return u.toString();
  } catch {
    return base;
  }
}

/**
 * Pre-fill the RSVP's name box with the guest's name, once, if it is still
 * empty. The kit's RSVPBlock is a controlled input with no default-name prop,
 * so this goes through the native value setter + an input event (React picks it up).
 */
export function prefillRsvpName(root: HTMLElement | null, name: string) {
  if (!root || !name) return;
  const input = root.querySelector<HTMLInputElement>('input[autocomplete="name"]');
  if (!input || input.value) return;
  const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  set?.call(input, name);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

// ── The invite card ──────────────────────────────────────────────────────────

export interface CardInput {
  first: string;
  second: string;
  together: string;
  getting: string;
  dateLine: string;
  time: string;
  venue: string;
  functions: { title: string; when: string }[];
  url: string;
  guest: string;
  dear: string;
  qrHint: string;
  /** The element carrying the kit's font variables (--wk-font-*). */
  fontRoot: HTMLElement | null;
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const i = new Image();
    i.decoding = "async";
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
}

function family(root: HTMLElement | null, v: string, fallback: string) {
  const f = root ? getComputedStyle(root).getPropertyValue(v).trim() : "";
  return f || fallback;
}

/** Wrap `text` to `max` px, at most `lines` lines (the last one ellipsised). */
function wrap(ctx: CanvasRenderingContext2D, text: string, max: number, lines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(t).width <= max) cur = t;
    else {
      if (cur) out.push(cur);
      cur = w;
    }
  }
  if (cur) out.push(cur);
  if (out.length > lines) {
    const kept = out.slice(0, lines);
    kept[lines - 1] = `${kept[lines - 1].replace(/\s+\S*$/, "")}…`;
    return kept;
  }
  return out;
}

export async function inviteCardPng(c: CardInput): Promise<Blob | null> {
  const W = 1080;
  const H = 1350;
  const script = family(c.fontRoot, "--wk-font-script", "cursive");
  const display = family(c.fontRoot, "--wk-font-display", "Georgia, serif");
  const caps = family(c.fontRoot, "--wk-font-caps", "Georgia, serif");
  const sans = family(c.fontRoot, "--wk-font-sans", "system-ui, sans-serif");
  try {
    await Promise.all([document.fonts.load(`120px ${script}`), document.fonts.load(`40px ${display}`), document.fonts.load(`30px ${caps}`), document.fonts.load(`28px ${sans}`)]);
    await document.fonts.ready;
  } catch {}
  const [lattice, gazebo, couple, treeL, treeR] = await Promise.all([loadImg(A.lattice.src), loadImg(A.gazebo.src), loadImg(A.couple.src), loadImg(A.treeL.src), loadImg(A.treeR.src)]);

  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext("2d");
  if (!ctx) return null;

  // Blush paper with an ivory heart.
  const bg = ctx.createRadialGradient(W / 2, H * 0.4, 60, W / 2, H * 0.5, H * 0.85);
  bg.addColorStop(0, "#FFFBF8");
  bg.addColorStop(0.55, "#FBEDE9");
  bg.addColorStop(1, "#F3D9D4");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Peony trees up the sides, the gold lattice crown across the top.
  const th = H * 0.78;
  ctx.drawImage(treeL, -36, H - th, (th * treeL.width) / treeL.height, th);
  const trw = (th * treeR.width) / treeR.height;
  ctx.drawImage(treeR, W - trw + 36, H - th, trw, th);
  ctx.drawImage(lattice, 0, 0, W, (W * lattice.height) / lattice.width);

  // Rose-gold hairline border.
  ctx.strokeStyle = "rgba(180,110,100,.6)";
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 30, W - 60, H - 60);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  let y = 214;
  if (c.guest) {
    ctx.fillStyle = "#9A4A5E";
    ctx.font = `italic 500 34px ${display}`;
    ctx.fillText(`${c.dear} ${c.guest},`, W / 2, y);
    y += 50;
  }
  ctx.fillStyle = "#9A5A62";
  ctx.font = `600 24px ${caps}`;
  ctx.fillText(c.together.toUpperCase(), W / 2, y);
  y += 120;

  // Names in rose-gold script, stacked.
  const gold = ctx.createLinearGradient(W * 0.25, 0, W * 0.75, 0);
  gold.addColorStop(0, "#8E4A3A");
  gold.addColorStop(0.45, "#C58A6A");
  gold.addColorStop(0.55, "#E7B79A");
  gold.addColorStop(1, "#8E4A3A");
  const fitScript = (t: string, start: number) => {
    let size = start;
    ctx.font = `${size}px ${script}`;
    while (ctx.measureText(t).width > W - 300 && size > 56) {
      size -= 4;
      ctx.font = `${size}px ${script}`;
    }
  };
  ctx.fillStyle = gold;
  fitScript(c.first, 124);
  ctx.fillText(c.first, W / 2, y);
  y += 70;
  ctx.fillStyle = "#B07A64";
  ctx.font = `500 44px ${caps}`;
  ctx.fillText("&", W / 2, y);
  y += 106;
  ctx.fillStyle = gold;
  fitScript(c.second, 124);
  ctx.fillText(c.second, W / 2, y);
  y += 60;
  ctx.fillStyle = "#7A4E56";
  ctx.font = `italic 400 34px ${display}`;
  ctx.fillText(c.getting, W / 2, y);
  y += 72;

  if (c.dateLine) {
    ctx.fillStyle = "#4A2630";
    ctx.font = `600 40px ${display}`;
    ctx.fillText(c.dateLine, W / 2, y);
    y += 46;
  }
  const sub = [c.time, c.venue].filter(Boolean).join(" · ");
  if (sub) {
    ctx.fillStyle = "#7A4E56";
    ctx.font = `400 28px ${sans}`;
    for (const line of wrap(ctx, sub, W - 360, 2)) {
      ctx.fillText(line, W / 2, y);
      y += 38;
    }
  }
  const fns = c.functions.slice(0, 5);
  if (fns.length) {
    y += 12;
    ctx.fillStyle = "#9A5A62";
    ctx.font = `600 24px ${caps}`;
    for (const line of wrap(ctx, fns.map((f) => `${f.title}${f.when ? ` ${f.when}` : ""}`).join("  ·  "), W - 360, 2)) {
      ctx.fillText(line, W / 2, y);
      y += 34;
    }
  }

  // The gazebo with the couple, at the foot.
  const gw = 430;
  const gh = (gw * gazebo.height) / gazebo.width;
  const gy = H - gh - 70;
  ctx.drawImage(gazebo, (W - gw) / 2, gy, gw, gh);
  const ch = gh * 0.92;
  const cw = (ch * couple.width) / couple.height;
  ctx.drawImage(couple, (W - cw) / 2, gy + gh - ch - 12, cw, ch);

  // QR code on its own white tile, bottom right.
  const qr = c.url ? encodeQr(c.url, "medium") : null;
  if (qr) {
    const tile = 150;
    const quiet = 2;
    const n = qr.size + quiet * 2;
    const m = tile / n;
    const tx = W - tile - 70;
    const ty = H - tile - 104;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(tx - 8, ty - 8, tile + 16, tile + 16);
    ctx.fillStyle = "#3E1F27";
    const ox = tx + quiet * m;
    const oy = ty + quiet * m;
    for (let r = 0; r < qr.size; r++) for (let col = 0; col < qr.size; col++) if (qr.modules[r][col]) ctx.fillRect(ox + col * m, oy + r * m, Math.ceil(m), Math.ceil(m));
    ctx.fillStyle = "#7A4E56";
    ctx.font = `600 18px ${sans}`;
    ctx.fillText(c.qrHint, tx + tile / 2, ty + tile + 30);
  }

  ctx.fillStyle = "#4A2630";
  ctx.font = `500 22px ${sans}`;
  const short = c.url.replace(/^https?:\/\//, "").replace(/\?.*$/, "");
  ctx.fillText(short.length > 50 ? `${short.slice(0, 49)}…` : short, W / 2, H - 46);

  return new Promise((res) => cv.toBlob((b) => res(b), "image/png"));
}
