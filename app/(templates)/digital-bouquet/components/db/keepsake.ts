// The bouquet as a picture: draws the SAME arrangement as <Bouquet> (same
// placement maths from ./assets.ts, the same art) onto a canvas, so the
// keepsake card they download is exactly the bouquet they were sent. Art is
// read through Next's same-origin image route so the canvas never taints.

import { FLOWER_BY_ID, type DbCharm } from "../../../_valentine/days/digital-bouquet";
import { CHARM_ART, FRAME, GREEN_ART, RIBBON_ART, RIBBON_FILE, STEM_ART, greensFor, headOf, media, placeStem, type StemArt } from "./assets";
import { wrapSrc } from "./wraps";
import type { BouquetLook } from "./Bouquet";
import { paintOrder } from "./model";

const viaNext = (src: string, w: number) => `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`;

function load(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}
/** The @2x file through the same-origin optimiser (falls back to the 1×). */
async function art(file: string): Promise<HTMLImageElement | null> {
  return (await load(viaNext(media(`${file}@2x.webp`), 1080))) ?? (await load(viaNext(media(`${file}.webp`), 640)));
}

/** Renders the bouquet to a PNG data URL, `scale` × the 600×760 frame. */
export async function renderBouquetPng(look: BouquetLook, scale = 1.6): Promise<string | null> {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(FRAME.w * scale);
  canvas.height = Math.round(FRAME.h * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.scale(scale, scale);

  const rib = RIBBON_FILE[look.ribbon] ?? RIBBON_FILE.rose;
  const greens = greensFor(look.greenery);
  const order = paintOrder(look.stems);
  const charms = look.charms as DbCharm[];

  const [back, front, ribbon, greenImgs, stemImgs, charmImgs] = await Promise.all([
    load(wrapSrc(look.wrap, "back", scale)),
    load(wrapSrc(look.wrap, "front", scale)),
    art(rib.file),
    Promise.all(greens.map((g) => art(GREEN_ART[g.id].file))),
    Promise.all(order.map((i) => art(STEM_ART[look.stems[i].flower].file))),
    Promise.all(charms.map((c) => art(CHARM_ART[c].file))),
  ]);

  const drawStem = (img: HTMLImageElement | null, a: StemArt, hx: number, hy: number, s: number, tilt: number) => {
    if (!img) return;
    const p = placeStem(a, hx, hy, s, tilt);
    ctx.save();
    ctx.translate(p.ax, p.ay);
    ctx.rotate((p.deg * Math.PI) / 180);
    ctx.drawImage(img, -a.anchor.x * p.w, -a.anchor.y * p.h, p.w, p.h);
    ctx.restore();
  };

  if (back) ctx.drawImage(back, 0, 0, FRAME.w, FRAME.h);
  greens.forEach((g, k) => drawStem(greenImgs[k], GREEN_ART[g.id], g.x, g.y, g.scale, 0));
  order.forEach((i, k) => {
    const s = look.stems[i];
    const h = headOf(s);
    drawStem(stemImgs[k], STEM_ART[s.flower], h.x, h.y, s.scale / 100, s.rot);
  });
  if (front) ctx.drawImage(front, 0, 0, FRAME.w, FRAME.h);
  if (ribbon) {
    if (rib.filter) ctx.filter = rib.filter;
    ctx.drawImage(ribbon, FRAME.knot.x - RIBBON_ART.anchor.x * RIBBON_ART.w, FRAME.knot.y - RIBBON_ART.anchor.y * RIBBON_ART.h, RIBBON_ART.w, RIBBON_ART.h);
    ctx.filter = "none";
  }
  const at: Record<DbCharm, { x: number; y: number }> = { heart: FRAME.charm, teddy: { x: 266, y: 606 }, butterfly: { x: 356, y: 600 } };
  charms.forEach((c, k) => {
    const img = charmImgs[k];
    if (!img) return;
    const a = CHARM_ART[c];
    ctx.drawImage(img, at[c].x - (a.w * a.scale) / 2, at[c].y, a.w * a.scale, a.h * a.scale);
  });

  try {
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

/** Distinct flower names in the bouquet, for the keepsake's caption. */
export const flowerNames = (look: BouquetLook) => [...new Set(look.stems.map((s) => FLOWER_BY_ID[s.flower].name))];
