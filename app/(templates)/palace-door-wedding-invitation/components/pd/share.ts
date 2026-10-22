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
  const [arch, frame, rail, banana, jhumka] = await Promise.all([loadImg(A.arch.src), loadImg(A.frame.src), loadImg(A.balustrade.src), loadImg(A.banana.src), loadImg(A.jhumka.src)]);

  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext("2d");
  if (!ctx) return null;

  // Ivory paper with a warm centre.
  const bg = ctx.createRadialGradient(W / 2, H * 0.42, 80, W / 2, H * 0.5, H * 0.8);
  bg.addColorStop(0, "#FFFBF2");
  bg.addColorStop(0.6, "#F8ECD6");
  bg.addColorStop(1, "#EED9B4");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  // Gold hairline border.
  ctx.strokeStyle = "rgba(168,116,46,.75)";
  ctx.lineWidth = 3;
  ctx.strokeRect(34, 34, W - 68, H - 68);
  ctx.lineWidth = 1;
  ctx.strokeRect(48, 48, W - 96, H - 96);

  // Floral arch across the top, jhumkas in the corners.
  const aw = W * 1.02;
  ctx.drawImage(arch, (W - aw) / 2, -40, aw, (aw * arch.height) / arch.width);
  const jh = 230;
  ctx.drawImage(jhumka, 70, 40, (jh * jhumka.width) / jhumka.height, jh);
  ctx.save();
  ctx.translate(W - 70, 40);
  ctx.scale(-1, 1);
  ctx.drawImage(jhumka, 0, 0, (jh * jhumka.width) / jhumka.height, jh);
  ctx.restore();

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  let y = 250;
  if (c.guest) {
    ctx.fillStyle = "#7A4A22";
    ctx.font = `italic 500 34px ${display}`;
    ctx.fillText(`${c.dear} ${c.guest},`, W / 2, y);
    y += 44;
  }

  // The gold frame with the initials.
  const fs = 250;
  const fy = y + 10;
  ctx.drawImage(frame, (W - fs) / 2, fy, fs, (fs * frame.height) / frame.width);
  ctx.fillStyle = "#8A5A1C";
  ctx.font = `92px ${script}`;
  const ini = `${[...c.first][0] ?? ""}${[...c.second][0] ?? ""}`;
  ctx.fillText(ini.split("").join(" "), W / 2, fy + fs * 0.62);
  y = fy + fs + 70;

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
      ctx.fillStyle = "#8A5A1C";
      ctx.font = `600 28px ${display}`;
      ctx.fillText(`${f.title}${f.when ? `  ·  ${f.when}` : ""}`, x, y + row * 42);
    });
    y += per * 42;
  }

  // Balustrade + banana leaves at the foot.
  const rw = W - 140;
  const rh = (rw * rail.height) / rail.width;
  ctx.globalAlpha = 0.9;
  ctx.drawImage(rail, 70, H - rh - 92, rw, rh);
  ctx.globalAlpha = 1;
  const bw = 250;
  const bh = (bw * banana.height) / banana.width;
  ctx.drawImage(banana, -40, H - bh + 20, bw, bh);
  ctx.save();
  ctx.translate(W + 40, H - bh + 20);
  ctx.scale(-1, 1);
  ctx.drawImage(banana, 0, 0, bw, bh);
  ctx.restore();

  // The link.
  ctx.fillStyle = "#3A2414";
  ctx.font = `500 25px ${sans}`;
  const short = c.url.replace(/^https?:\/\//, "").replace(/\?.*$/, "");
  ctx.fillText(short.length > 56 ? `${short.slice(0, 55)}…` : short, W / 2, H - 62);

  return new Promise((res) => cv.toBlob((b) => res(b), "image/png"));
}
