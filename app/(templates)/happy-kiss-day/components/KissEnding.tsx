"use client";

// ─── Ending: the photobooth strip keepsake ───────────────────────────────────
//
// A 4-up photobooth strip of their photos with the kisses they stamped on the
// Kiss-Cam (or one fresh kiss per frame), names + "13 · 02" at the foot. The
// same strip is drawn into the 1080×1920 keepsake PNG.

import { motion } from "framer-motion";
import { CroppedPhoto, EndingActions, useReducedMotion, type KeepsakeItem, type KeepsakeLayout } from "../../_valentine/kit";
import { FONTS, VW } from "../../_valentine/theme";
import type { DayConfig, LovePhoto, ValentineDayData } from "../../_valentine/types";
import { CuteCouple, KissStamp, kissStampDataUrl, type KissStyle, type ShadeId } from "./kissArt";
import type { PhotoKiss } from "./KissCam";

const DEFAULT_MARK: PhotoKiss = { x: 74, y: 70, r: -16, s: 1 };

/** Up to 4 frames: the photos (repeated if fewer), or [] when there are none. */
function stripFrames(photos: LovePhoto[]): { photo: LovePhoto; idx: number }[] {
  if (!photos.length) return [];
  return Array.from({ length: Math.min(4, Math.max(3, photos.length)) }, (_, k) => ({ photo: photos[k % photos.length], idx: k % photos.length }));
}

export function PhotoStrip({ photos, marks, kind, shade, names }: { photos: LovePhoto[]; marks: Record<number, PhotoKiss[]>; kind: KissStyle; shade: ShadeId; names: string }) {
  const reduced = useReducedMotion();
  const frames = stripFrames(photos);
  const n = frames.length || 3;
  return (
    <motion.div
      initial={reduced ? false : { y: 60, rotate: 8, opacity: 0 }}
      animate={{ y: 0, rotate: -3.5, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 16, delay: 0.2 }}
      style={{ position: "relative", width: "min(52vw, 196px)", padding: "10px 10px 0", background: "#fff", borderRadius: 4, boxShadow: "0 30px 50px -26px rgba(59,10,30,.6), 0 2px 6px rgba(0,0,0,.08)" }}
    >
      <span aria-hidden style={{ position: "absolute", top: -12, left: "50%", width: 70, height: 22, transform: "translateX(-50%) rotate(-4deg)", background: "rgba(255,214,224,.85)", boxShadow: "0 2px 4px rgba(0,0,0,.08)" }} />
      <div style={{ display: "grid", gap: 8 }}>
        {Array.from({ length: n }, (_, k) => {
          const f = frames[k];
          const ms = f ? (marks[f.idx]?.length ? marks[f.idx].slice(-3) : [DEFAULT_MARK]) : [DEFAULT_MARK];
          return (
            <div key={k} style={{ position: "relative", aspectRatio: "4 / 3", overflow: "hidden", background: "#FFE4EC" }}>
              {f ? <CroppedPhoto photo={f.photo} alt="" /> : <div style={{ position: "absolute", inset: "6% 4%" }}><CuteCouple /></div>}
              {ms.map((m, j) => (
                <span key={j} style={{ position: "absolute", left: `${m.x}%`, top: `${m.y}%`, transform: `translate(-50%,-50%) rotate(${m.r}deg) scale(${0.55 * m.s})` }}>
                  <KissStamp kind={kind} shade={shade} size={58} face={false} />
                </span>
              ))}
            </div>
          );
        })}
      </div>
      <div style={{ padding: "8px 2px 10px", textAlign: "center" }}>
        <div style={{ font: `700 20px/1.1 ${FONTS.script}`, color: "#3B0A1E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{names}</div>
        <div style={{ font: `600 10px ${FONTS.ui}`, letterSpacing: ".3em", color: "#9D174D", marginTop: 2 }}>13 · 02 · 💋</div>
      </div>
    </motion.div>
  );
}

/** Kit workaround: keepsake.ts asks /_next/image for q=80, which Next 16 rejects (default qualities [75]) →
 * every photo was skipped. A path starting with "/" passes through the kit untouched. */
export const keepsakeSrc = (u: string) => (u.startsWith("data:") || u.startsWith("/") ? u : `/_next/image?url=${encodeURIComponent(u)}&w=1080&q=75`);

export function kissKeepsake(day: DayConfig, data: ValentineDayData, opts: { kind: KissStyle; shade: ShadeId; marks: Record<number, PhotoKiss[]>; jar: number; camKisses: number }): KeepsakeLayout {
  const W = 1080;
  const t = day.theme;
  const stamp = kissStampDataUrl(opts.kind, opts.shade);
  const names = `${data.recipientName || "You"} ♥ ${data.senderName || "Me"}`;
  const items: KeepsakeItem[] = [
    { type: "text", text: "SEALED WITH A KISS", x: W / 2, y: 120, size: 36, weight: 700, color: t.accentDeep, face: "ui" },
    { type: "text", text: data.recipientName || "You", x: W / 2, y: 176, size: 112, weight: 700, color: t.ink, face: "script", maxWidth: 960, maxLines: 1 },
    { type: "text", text: `${opts.jar} kisses in the jar${opts.camKisses ? ` · ${opts.camKisses} on our photos` : ""}`, x: W / 2, y: 330, size: 38, color: t.inkSoft, face: "ui", maxWidth: 960, maxLines: 1 },
  ];
  // The strip.
  const sx = 300;
  const sw = 480;
  const fy = 440;
  const fh = 270;
  const gap = 18;
  items.push({ type: "rect", x: sx + 10, y: 418, w: sw, h: 1290, radius: 6, fill: "rgba(157,23,77,.12)" });
  items.push({ type: "rect", x: sx, y: 408, w: sw, h: 1290, radius: 6, fill: "#FFFFFF" });
  const frames = stripFrames(data.photos);
  for (let k = 0; k < 4; k++) {
    const y = fy + k * (fh + gap);
    const f = frames[k];
    if (f) items.push({ type: "image", src: keepsakeSrc(f.photo.url), x: sx + 20, y, w: sw - 40, h: fh, cropX: f.photo.cropX, cropY: f.photo.cropY });
    else items.push({ type: "rect", x: sx + 20, y, w: sw - 40, h: fh, fill: "#FFE4EC" });
    const ms = f && opts.marks[f.idx]?.length ? opts.marks[f.idx].slice(-3) : [DEFAULT_MARK];
    for (const m of ms) {
      const mw = 120 * m.s;
      const mh = mw * (opts.kind === "lipstick" ? 0.7 : 0.92);
      items.push({ type: "image", src: stamp, x: sx + 20 + ((sw - 40) * m.x) / 100 - mw / 2, y: y + (fh * m.y) / 100 - mh / 2, w: mw, h: mh, rotate: m.r });
    }
  }
  const foot = fy + 4 * (fh + gap);
  items.push({ type: "text", text: names, x: W / 2, y: foot + 6, size: 54, weight: 700, color: "#3B0A1E", face: "script", maxWidth: sw - 30, maxLines: 1 });
  items.push({ type: "text", text: "13 · 02", x: W / 2, y: foot + 86, size: 28, weight: 600, color: "#9D174D", face: "ui" });
  if (data.endLine) items.push({ type: "text", text: data.endLine, x: W / 2, y: 1740, size: 38, italic: true, color: t.ink, face: "serif", maxWidth: 940, maxLines: 2 });
  items.push({ type: "image", src: stamp, x: 760, y: 360, w: 170, h: opts.kind === "lipstick" ? 119 : 156, rotate: 14 });
  items.push({ type: "text", text: "made on subhsandesh.in", x: W / 2, y: 1856, size: 26, color: t.inkSoft, face: "ui" });
  return { background: { stops: [[0, "#FFE4EC"], [0.6, "#FFEFF3"], [1, "#FFF8F1"]] }, items };
}

export function KissEnding({
  day,
  data,
  mode,
  kind,
  shade,
  marks,
  jar,
  bottomPad,
  onReplay,
}: {
  day: DayConfig;
  data: ValentineDayData;
  mode: "preview" | "live";
  kind: KissStyle;
  shade: ShadeId;
  marks: Record<number, PhotoKiss[]>;
  jar: number;
  bottomPad: number;
  onReplay: () => void;
}) {
  const reduced = useReducedMotion();
  const camKisses = Object.values(marks).reduce((a, m) => a + m.length, 0);
  const names = `${data.recipientName || "You"} ♥ ${data.senderName || "Me"}`;
  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", padding: `64px 18px ${bottomPad}px`, gap: 14, textAlign: "center" }}>
      <p style={{ margin: 0, font: `600 12px ${FONTS.ui}`, letterSpacing: ".2em", textTransform: "uppercase", color: VW.inkSoft }}>Kiss received · kiss returned</p>
      <h2 style={{ margin: 0, font: `700 clamp(34px, 10vw, 50px)/1.08 ${FONTS.script}`, color: VW.ink, overflowWrap: "anywhere" }}>Happy Kiss Day, {data.recipientName || "you"}</h2>
      <PhotoStrip photos={data.photos} marks={marks} kind={kind} shade={shade} names={names} />
      <motion.p initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ margin: "6px 0 0", font: `700 17px ${FONTS.ui}`, color: VW.accent }}>
        {jar} kisses in the jar{camKisses ? ` · ${camKisses} on the photos` : ""} 💗
      </motion.p>
      {data.endLine && <p style={{ margin: 0, maxWidth: 360, font: `italic 400 19px/1.5 ${FONTS.serif}`, color: VW.ink, overflowWrap: "anywhere" }}>{data.endLine}</p>}
      <p style={{ margin: 0, font: `400 24px ${FONTS.script}`, color: VW.inkSoft, overflowWrap: "anywhere" }}>— {data.senderName}</p>
      <EndingActions day={day} data={data} mode={mode} onReplay={onReplay} keepsake={() => kissKeepsake(day, data, { kind, shade, marks, jar, camKisses })} style={{ marginTop: 4 }} />
    </div>
  );
}
