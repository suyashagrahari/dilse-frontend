// The keepsake: the whole deed as a 1080×1920 story image — letterhead, the
// "Whereas…" lines, every clause, "And above all", both signatures (theirs
// exactly as they drew it), the wax seal and the notary's stamp. Drawn by
// hand on a canvas so the signature and the seal match the page.

import { fileSlug } from "@/lib/exportPng";
import { SP, stampDate, type Deed } from "./model";
import { PAD_ASPECT, drawInk } from "./signature";
import type { SignResult } from "./SignScene";

const W = 1080;
const H = 1920;

function family(name: string, fallback: string) {
  const el = document.querySelector(".sp-root");
  const v = el ? getComputedStyle(el).getPropertyValue(name).trim() : "";
  return v ? `${v}, ${fallback}` : fallback;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number) {
  const words = text.split(/\s+/).filter(Boolean);
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

function waxBlob(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, wax: Deed["W"], mono: string, serif: string) {
  ctx.save();
  ctx.shadowColor = "rgba(30,5,5,.55)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 12;
  const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.05, cx, cy, r * 1.05);
  g.addColorStop(0, wax.hi);
  g.addColorStop(0.46, wax.c);
  g.addColorStop(1, wax.lo);
  ctx.fillStyle = g;
  ctx.beginPath();
  const N = 64;
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    const rr = r * (1 + 0.05 * Math.sin(a * 5 + 1.3) + 0.035 * Math.sin(a * 11 + 0.4) + 0.02 * Math.sin(a * 17));
    const x = cx + Math.cos(a) * rr;
    const y = cy + Math.sin(a) * rr;
    if (i) ctx.lineTo(x, y);
    else ctx.moveTo(x, y);
  }
  ctx.fill();
  ctx.restore();
  // the pressed well + debossed monogram
  ctx.save();
  ctx.fillStyle = wax.c;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = wax.lo;
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,.22)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx + 2, cy + 2.5, r * 0.7, 0, Math.PI * 2);
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const fs = mono.length > 3 ? r * 0.34 : mono.length > 2 ? r * 0.42 : r * 0.54;
  ctx.font = `italic 500 ${fs}px ${serif}`;
  ctx.fillStyle = "rgba(255,255,255,.26)";
  ctx.fillText(mono, cx + 1.6, cy + 2);
  ctx.fillStyle = wax.lo;
  ctx.fillText(mono, cx - 1.4, cy - 1.8);
  ctx.fillStyle = wax.c;
  ctx.fillText(mono, cx, cy);
  ctx.restore();
}

function notary(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, mono: string) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((-14 * Math.PI) / 180);
  ctx.globalAlpha = 0.85;
  ctx.strokeStyle = SP.notary;
  ctx.fillStyle = SP.notary;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.58, 0, Math.PI * 2);
  ctx.stroke();
  const ring = "SIGNED · SEALED · PROMISED · SIGNED · SEALED · ";
  ctx.font = `700 ${r * 0.17}px ${mono}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const step = (Math.PI * 2) / ring.length;
  for (let i = 0; i < ring.length; i++) {
    ctx.save();
    ctx.rotate(-Math.PI / 2 + i * step);
    ctx.translate(0, -r * 0.74);
    ctx.fillText(ring[i], 0, 0);
    ctx.restore();
  }
  ctx.font = `700 ${r * 0.16}px ${mono}`;
  ctx.fillText("PROMISED", 0, -r * 0.12);
  ctx.fillText(stampDate(), 0, r * 0.16);
  // ink-starved texture: knock out specks
  ctx.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 700; i++) {
    const a = Math.random() * Math.PI * 2;
    const d = Math.random() * r * 1.05;
    ctx.globalAlpha = Math.random() * 0.7;
    ctx.fillRect(Math.cos(a) * d, Math.sin(a) * d, 2 + Math.random() * 3, 2 + Math.random() * 2);
  }
  ctx.restore();
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function renderDeed(d: Deed, sig: SignResult | null, endLine: string): Promise<Blob | null> {
  const serif = family("--font-sp-serif", "Georgia, serif");
  const mono = family("--font-sp-type", "'Courier New', monospace");
  try {
    await Promise.all([document.fonts.load(`italic 500 60px ${serif}`), document.fonts.load(`500 60px ${serif}`), document.fonts.load(`700 30px ${mono}`), document.fonts.load(`400 30px ${mono}`)]);
  } catch {
    /* draw with whatever is there */
  }
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  if (!ctx) return null;

  // The desk under the lamp.
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#2a1a11");
  g.addColorStop(0.55, "#1a100a");
  g.addColorStop(1, "#0b0604");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const lamp = ctx.createRadialGradient(W * 0.35, 380, 40, W * 0.35, 380, 1200);
  lamp.addColorStop(0, "rgba(255,200,130,.32)");
  lamp.addColorStop(1, "rgba(255,200,130,0)");
  ctx.fillStyle = lamp;
  ctx.fillRect(0, 0, W, H);

  // The paper.
  const px = 92;
  const py = 120;
  const pw = W - px * 2;
  const ph = 1460;
  ctx.save();
  ctx.translate(W / 2, py + ph / 2);
  ctx.rotate((-1.1 * Math.PI) / 180);
  ctx.translate(-W / 2, -(py + ph / 2));
  ctx.shadowColor = "rgba(0,0,0,.75)";
  ctx.shadowBlur = 70;
  ctx.shadowOffsetY = 34;
  const pg = ctx.createLinearGradient(px, py, px + pw, py + ph);
  pg.addColorStop(0, "#FBF6EA");
  pg.addColorStop(1, "#ECE2CC");
  ctx.fillStyle = pg;
  ctx.fillRect(px, py, pw, ph);
  ctx.shadowColor = "transparent";
  for (let i = 0; i < 14000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(120,90,50,.05)" : "rgba(255,255,255,.12)";
    ctx.fillRect(px + Math.random() * pw, py + Math.random() * ph, 1.6, 1.6);
  }

  const cx = W / 2;
  const tw = pw - 150;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "rgba(28,37,65,.55)";
  ctx.font = `700 20px ${mono}`;
  ctx.letterSpacing = "7px";
  ctx.fillText("NO. 0211 · ✦ · BY HAND", cx, py + 92);
  ctx.fillStyle = SP.navy;
  ctx.font = `500 58px ${serif}`;
  ctx.letterSpacing = "10px";
  ctx.fillText("DEED OF PROMISE", cx, py + 168);
  ctx.letterSpacing = "0px";
  ctx.strokeStyle = SP.gold;
  ctx.lineWidth = 2;
  for (const dy of [190, 197]) {
    ctx.beginPath();
    ctx.moveTo(cx - 230, py + dy);
    ctx.lineTo(cx + 230, py + dy);
    ctx.stroke();
  }
  ctx.font = `italic 400 30px ${serif}`;
  ctx.fillStyle = "rgba(28,37,65,.8)";
  let y = py + 250;
  for (const l of wrap(ctx, `between ${d.sender}, the Promisor, and ${d.recipient}, the Promisee`, tw).slice(0, 2)) {
    ctx.fillText(l, cx, y);
    y += 40;
  }
  y += 26;
  ctx.fillStyle = SP.navy;
  ctx.font = `italic 400 32px ${serif}`;
  for (const l of wrap(ctx, d.whereas.filter(Boolean).join(" "), tw).slice(0, 4)) {
    ctx.fillText(l, cx, y);
    y += 44;
  }
  y += 30;

  // The clauses, typed. Shrink the type until they all fit above the signatures.
  const sigTop = py + ph - 400;
  const above = d.bigPromise ? 190 : 40;
  let fs = 34;
  let lines: { no: string; ls: string[] }[] = [];
  for (; fs >= 20; fs -= 1) {
    ctx.font = `400 ${fs}px ${mono}`;
    lines = d.promises.map((p, i) => ({ no: `§ ${["I", "II", "III", "IV", "V", "VI", "VII"][i]}.`, ls: wrap(ctx, p, tw - 110) }));
    const h = lines.reduce((s, l) => s + l.ls.length * fs * 1.35 + fs * 0.5, 0);
    if (y + h + above < sigTop) break;
  }
  ctx.textAlign = "left";
  const lx = px + 75;
  for (const l of lines) {
    ctx.fillStyle = SP.oxblood;
    ctx.font = `600 ${fs}px ${serif}`;
    ctx.fillText(l.no, lx, y);
    ctx.fillStyle = SP.navy;
    ctx.font = `400 ${fs}px ${mono}`;
    for (const s of l.ls) {
      ctx.fillText(s, lx + 100, y);
      y += fs * 1.35;
    }
    y += fs * 0.5;
  }
  ctx.textAlign = "center";
  if (d.bigPromise) {
    y = Math.max(y + 20, sigTop - 170);
    ctx.fillStyle = SP.oxblood;
    ctx.font = `600 22px ${serif}`;
    ctx.letterSpacing = "6px";
    ctx.fillText("AND ABOVE ALL", cx, y);
    ctx.letterSpacing = "0px";
    ctx.fillStyle = SP.navy;
    ctx.font = `italic 400 34px ${serif}`;
    y += 46;
    for (const l of wrap(ctx, d.bigPromise, tw - 300).slice(0, 3)) {
      ctx.fillText(l, cx, y);
      y += 44;
    }
  }

  // Both signatures, side by side.
  const sw = (tw - 60) / 2;
  const sh = sw / PAD_ASPECT;
  const sy = py + ph - 300;
  const left = px + 75;
  const right = left + sw + 60;
  ctx.fillStyle = SP.navy;
  let sfs = 92;
  ctx.font = `italic 500 ${sfs}px ${serif}`;
  while (ctx.measureText(d.sender).width > sw * 0.92 && sfs > 36) {
    sfs -= 4;
    ctx.font = `italic 500 ${sfs}px ${serif}`;
  }
  ctx.fillText(d.sender, left + sw / 2, sy + sh * 0.7);
  if (sig && !sig.typed && sig.strokes.length) drawInk(ctx, sig.strokes, right, sy, sw, sh, SP.navy, sw * 0.011);
  else if (sig?.png) {
    const img = await loadImage(sig.png);
    if (img) ctx.drawImage(img, right, sy, sw, sh);
  }
  ctx.strokeStyle = "rgba(28,37,65,.55)";
  ctx.lineWidth = 2;
  for (const x0 of [left, right]) {
    ctx.beginPath();
    ctx.moveTo(x0, sy + sh + 6);
    ctx.lineTo(x0 + sw, sy + sh + 6);
    ctx.stroke();
  }
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(28,37,65,.62)";
  ctx.font = `700 19px ${mono}`;
  ctx.letterSpacing = "3px";
  ctx.fillText(`${d.sender.toUpperCase()} · PROMISOR`.slice(0, 30), left, sy + sh + 40);
  ctx.fillText(`${d.recipient.toUpperCase()} · PROMISEE`.slice(0, 30), right, sy + sh + 40);
  ctx.letterSpacing = "0px";
  ctx.textAlign = "center";

  notary(ctx, px + pw - 140, sigTop - 30, 80, mono);
  ctx.restore();

  // The wax, half on the paper's edge.
  waxBlob(ctx, cx, py + ph + 6, 104, d.W, d.monogram, serif);

  // The last line + witness.
  y = py + ph + 186;
  ctx.textAlign = "center";
  if (endLine) {
    ctx.fillStyle = "#F5EFE2";
    ctx.font = `italic 400 50px ${serif}`;
    for (const l of wrap(ctx, endLine, 900).slice(0, 2)) {
      ctx.fillText(l, W / 2, y);
      y += 58;
    }
  }
  if (d.witness) {
    ctx.fillStyle = "rgba(245,239,226,.62)";
    ctx.font = `italic 400 28px ${serif}`;
    ctx.fillText(wrap(ctx, `Witnessed by ${d.witness}`, 920)[0] ?? "", W / 2, y - 4);
  }
  ctx.fillStyle = "rgba(245,239,226,.45)";
  ctx.font = `400 20px ${mono}`;
  ctx.letterSpacing = "5px";
  ctx.fillText("MADE ON SUBHSANDESH.IN", W / 2, H - 34);
  ctx.letterSpacing = "0px";

  // Film grain.
  for (let i = 0; i < 7000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,.03)" : "rgba(0,0,0,.045)";
    ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2);
  }
  try {
    return await new Promise<Blob | null>((resolve) => c.toBlob((bl) => resolve(bl), "image/png"));
  } catch {
    return null;
  }
}

/** Web Share with the PNG where phones can share files, else a download. */
export async function saveDeed(d: Deed, sig: SignResult | null, endLine: string): Promise<"shared" | "downloaded" | "failed"> {
  const blob = await renderDeed(d, sig, endLine);
  if (!blob) return "failed";
  const name = `${fileSlug(`deed-of-promise-${d.recipient}`, "deed-of-promise")}.png`;
  const file = new File([blob], name, { type: "image/png" });
  const nav = navigator as Navigator & { canShare?: (x: ShareData) => boolean };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], text: `${d.recipient} & ${d.sender} · signed, sealed, promised ✍️` });
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
