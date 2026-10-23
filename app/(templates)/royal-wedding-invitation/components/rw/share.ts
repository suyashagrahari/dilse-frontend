"use client";

// ─── Personal links (?to=Name) and the downloadable invite card ──────────────
// useGuestName reads ?to= after mount (no SSR mismatch), trims it to 40
// characters and only ever renders it as text. inviteCardPng draws a
// 1080×1350 PNG on a canvas from same-origin art (so the canvas is never
// tainted), with the kit's own fonts once they are loaded.

import { useEffect, useState } from "react";
import { A } from "../assets";

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
  const [toran, chhatri, rail, eleL, eleR] = await Promise.all([loadImg(A.toran.src), loadImg(A.chhatri.src), loadImg(A.balustrade.src), loadImg(A.elephantL.src), loadImg(A.elephantR.src)]);

  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext("2d");
  if (!ctx) return null;

  // Ivory sandstone with a warm centre.
  const bg = ctx.createRadialGradient(W / 2, H * 0.42, 80, W / 2, H * 0.5, H * 0.8);
  bg.addColorStop(0, "#FFFCF4");
  bg.addColorStop(0.6, "#F8EDDA");
  bg.addColorStop(1, "#EFDDBC");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  // A pietra-dura border: gold hairlines with a soft maroon dot band between.
  ctx.strokeStyle = "rgba(176,128,52,.85)";
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, W - 60, H - 60);
  ctx.lineWidth = 1.2;
  ctx.strokeRect(58, 58, W - 116, H - 116);
  ctx.fillStyle = "rgba(142,42,60,.55)";
  for (let x = 74; x < W - 60; x += 26) {
    ctx.beginPath();
    ctx.arc(x, 44, 3.2, 0, Math.PI * 2);
    ctx.arc(x, H - 44, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let y = 74; y < H - 60; y += 26) {
    ctx.beginPath();
    ctx.arc(44, y, 3.2, 0, Math.PI * 2);
    ctx.arc(W - 44, y, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // The brass toran across the top, a pink chhatri in each corner.
  const tw = W - 160;
  ctx.drawImage(toran, 80, 62, tw, (tw * toran.height) / toran.width);
  const ch = 230;
  const cw = (ch * chhatri.width) / chhatri.height;
  ctx.drawImage(chhatri, 64, 150, cw, ch);
  ctx.save();
  ctx.translate(W - 64, 150);
  ctx.scale(-1, 1);
  ctx.drawImage(chhatri, 0, 0, cw, ch);
  ctx.restore();

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  let y = 330;
  if (c.guest) {
    ctx.fillStyle = "#7A4A22";
    ctx.font = `italic 500 34px ${display}`;
    ctx.fillText(`${c.dear} ${c.guest},`, W / 2, y);
    y += 44;
  }

  // A gold medallion with the initials.
  const fs = 210;
  const cx = W / 2;
  const cy = y + 20 + fs / 2;
  const ring = ctx.createLinearGradient(cx - fs / 2, 0, cx + fs / 2, 0);
  ring.addColorStop(0, "#9A6B22");
  ring.addColorStop(0.5, "#E6C677");
  ring.addColorStop(1, "#9A6B22");
  ctx.fillStyle = "#FFF9EC";
  ctx.beginPath();
  ctx.arc(cx, cy, fs / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = ring;
  ctx.lineWidth = 7;
  ctx.stroke();
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, fs / 2 - 14, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#8E2A3C";
  ctx.font = `86px ${script}`;
  const ini = `${[...c.first][0] ?? ""}${[...c.second][0] ?? ""}`;
  ctx.fillText(ini.split("").join(" "), cx, cy + 30);
  y = cy + fs / 2 + 70;

  ctx.fillStyle = "#9A6B2F";
  ctx.font = `600 26px ${caps}`;
  ctx.fillText(c.together.toUpperCase(), W / 2, y);
  y += 104;

  // Names in script, gold.
  const gold = ctx.createLinearGradient(W * 0.2, 0, W * 0.8, 0);
  gold.addColorStop(0, "#8A5A14");
  gold.addColorStop(0.45, "#C79A3E");
  gold.addColorStop(0.55, "#E6C677");
  gold.addColorStop(1, "#8A5A14");
  ctx.fillStyle = gold;
  let size = 112;
  const names = `${c.first} & ${c.second}`;
  ctx.font = `${size}px ${script}`;
  while (ctx.measureText(names).width > W - 200 && size > 60) {
    size -= 4;
    ctx.font = `${size}px ${script}`;
  }
  ctx.fillText(names, W / 2, y);
  y += 58;
  ctx.fillStyle = "#6A4A30";
  ctx.font = `italic 400 34px ${display}`;
  ctx.fillText(c.getting, W / 2, y);
  y += 72;

  // The date.
  if (c.dateLine) {
    ctx.fillStyle = "#3A2414";
    ctx.font = `600 44px ${display}`;
    ctx.fillText(c.dateLine, W / 2, y);
    y += 50;
  }
  const sub = [c.time, c.venue].filter(Boolean).join(" · ");
  if (sub) {
    ctx.fillStyle = "#6A4A30";
    ctx.font = `400 30px ${sans}`;
    for (const line of wrap(ctx, sub, W - 240, 2)) {
      ctx.fillText(line, W / 2, y);
      y += 40;
    }
  }

  // The functions, two columns of "Haldi · 10 Feb".
  const fns = c.functions.slice(0, 6);
  if (fns.length) {
    y += 22;
    ctx.strokeStyle = "rgba(168,116,46,.6)";
    ctx.beginPath();
    ctx.moveTo(W / 2 - 160, y);
    ctx.lineTo(W / 2 + 160, y);
    ctx.stroke();
    y += 50;
    ctx.font = `500 28px ${sans}`;
    const cols = fns.length > 3 ? 2 : 1;
    const per = Math.ceil(fns.length / cols);
    fns.forEach((f, i) => {
      const col = Math.floor(i / per);
      const row = i % per;
      const x = cols === 1 ? W / 2 : col === 0 ? W * 0.31 : W * 0.69;
      ctx.fillStyle = "#8E2A3C";
      ctx.font = `600 28px ${display}`;
      ctx.fillText(`${f.title}${f.when ? `  ·  ${f.when}` : ""}`, x, y + row * 42);
    });
    y += per * 42;
  }

  // The balustrade and the two bowing elephants at the foot.
  const rw = W - 140;
  const rh = (rw * rail.height) / rail.width;
  ctx.globalAlpha = 0.85;
  ctx.drawImage(rail, 70, H - rh - 110, rw, rh);
  ctx.globalAlpha = 1;
  const ew = 250;
  const eh = (ew * eleL.height) / eleL.width;
  ctx.drawImage(eleL, 40, H - eh - 70, ew, eh);
  ctx.drawImage(eleR, W - 40 - ew, H - eh - 70, ew, eh);

  // The link.
  ctx.fillStyle = "#3A2414";
  ctx.font = `500 25px ${sans}`;
  const short = c.url.replace(/^https?:\/\//, "").replace(/\?.*$/, "");
  ctx.fillText(short.length > 56 ? `${short.slice(0, 55)}…` : short, W / 2, H - 62);

  return new Promise((res) => cv.toBlob((b) => res(b), "image/png"));
}
