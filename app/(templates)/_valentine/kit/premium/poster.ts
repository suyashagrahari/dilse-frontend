// ─── posterKeepsake() — the premium movie-poster keepsake ────────────────────
//
//   const layout = posterKeepsake(day, data, { title: "The Haunting of Us", tagline: "Some houses keep you.", format: "story" });
//   await saveOrSharePoster(layout, `${day.slug}-${data.recipientName}`);
//
// A preset layout for kit/keepsake.ts (offscreen canvas, fonts + proxied
// photos handled there): photo 1 full-bleed under a dark gradient, the title
// in display serif, "starring {recipient} · {sender}", the date, a ✦ seal and
// the credit line. format "story" = 1080×1920 (default), "feed" = 1080×1350.
// Push extra items onto `layout.items` for template-specific touches.

import type { DayConfig, ValentineDayData } from "../../types";
import { downloadKeepsake, renderKeepsake, type KeepsakeItem, type KeepsakeLayout } from "../keepsake";
import { fileSlug } from "@/lib/exportPng";

export interface PosterOptions {
  /** Big title (the film title). Default: "Happy {day.name}". */
  title?: string;
  /** One line under the title. */
  tagline?: string;
  /** "story" 1080×1920 (default) or "feed" 1080×1350. */
  format?: "story" | "feed";
  /** Which photo is the poster (default 0). */
  photoIndex?: number;
  /** Date line (default: "{date} {month}"). */
  dateLine?: string;
  /** Overrides for the palette. */
  ink?: string;
  accent?: string;
  /** Background behind/without the photo. */
  bg?: string;
}

export function posterKeepsake(day: DayConfig, data: ValentineDayData, o: PosterOptions = {}): KeepsakeLayout {
  const W = 1080;
  const H = o.format === "feed" ? 1350 : 1920;
  const t = day.theme;
  const ink = o.ink ?? "#FFF8EC";
  const gold = o.accent ?? "#E2B44A";
  const items: KeepsakeItem[] = [];
  const photo = data.photos[o.photoIndex ?? 0] ?? data.photos[0];
  if (photo?.url) {
    items.push({ type: "image", src: photo.url, x: 0, y: 0, w: W, h: Math.round(H * 0.72), cropX: photo.cropX, cropY: photo.cropY });
  } else {
    items.push({ type: "emoji", char: day.emoji, x: W / 2, y: Math.round(H * 0.32), size: 420 });
  }
  // A dark fade from the photo into the title block (stepped rects — the canvas layout has no gradients per item).
  const fadeTop = Math.round(H * 0.42);
  for (let k = 0; k < 12; k++) {
    items.push({ type: "rect", x: 0, y: fadeTop + k * Math.round(H * 0.025), w: W, h: Math.round(H * 0.026), fill: `rgba(10,6,12,${(0.08 + k * 0.075).toFixed(2)})` });
  }
  items.push({ type: "rect", x: 0, y: fadeTop + 12 * Math.round(H * 0.025), w: W, h: H, fill: "rgba(10,6,12,0.96)" });

  const yTitle = Math.round(H * (o.format === "feed" ? 0.66 : 0.7));
  items.push({ type: "text", text: (data.senderName ? `${data.senderName} presents` : "A SubhSandesh film").toUpperCase(), x: W / 2, y: yTitle - 120, size: 30, weight: 600, color: gold, face: "ui", maxWidth: 960, maxLines: 1 });
  items.push({ type: "text", text: o.title ?? `Happy ${day.name}`, x: W / 2, y: yTitle - 70, size: 96, weight: 700, face: "serif", color: ink, maxWidth: 960, maxLines: 2, lineHeight: 1.05 });
  let y = yTitle + 150;
  if (o.tagline) {
    items.push({ type: "text", text: o.tagline, x: W / 2, y, size: 40, face: "serif", italic: true, color: ink, maxWidth: 900, maxLines: 2 });
    y += 120;
  }
  items.push({ type: "text", text: `STARRING ${(data.petName || data.recipientName || "YOU").toUpperCase()}`, x: W / 2, y, size: 34, weight: 700, face: "ui", color: ink, maxWidth: 960, maxLines: 1 });
  y += 64;
  items.push({ type: "text", text: o.dateLine ?? `${day.date} ${day.month}`.toUpperCase(), x: W / 2, y, size: 28, weight: 600, face: "ui", color: gold });
  // The ✦ seal.
  items.push({ type: "rect", x: W / 2 - 46, y: H - 210, w: 92, h: 92, radius: 46, fill: "#9B2222", stroke: gold, lineWidth: 4 });
  items.push({ type: "text", text: "✦", x: W / 2, y: H - 196, size: 54, color: "#FFF1BF", face: "ui" });
  items.push({ type: "text", text: "made on subhsandesh.in ✦", x: W / 2, y: H - 92, size: 26, color: "rgba(255,248,236,0.7)", face: "ui" });
  return { width: W, height: H, background: o.bg ?? (t.dark ? t.base : "#120A10"), items };
}

/**
 * One tap: Web Share with the PNG where the browser can share files (phones),
 * otherwise a download. Returns "shared" | "downloaded" | "failed".
 */
export async function saveOrSharePoster(layout: KeepsakeLayout, name: string, shareText?: string): Promise<"shared" | "downloaded" | "failed"> {
  const blob = await renderKeepsake(layout);
  if (!blob) return "failed";
  const file = new File([blob], `${fileSlug(name, "poster")}.png`, { type: "image/png" });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], text: shareText });
      return "shared";
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return "shared";
    }
  }
  return (await downloadKeepsake(layout, name)) ? "downloaded" : "failed";
}
