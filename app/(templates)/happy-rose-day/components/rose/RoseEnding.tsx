"use client";

// Section 8: the ending. The rose(s) they grew stand in a glass bud vase
// (1, 3 or a bunch of 5 with a "×99" tag for the big counts), "Happy Rose
// Day, {pet name}", the sender's last line, and the actions — the keepsake
// is a story-sized rose wallpaper drawn from the same SVG petals.

import { useEffect, useId } from "react";
import { motion } from "framer-motion";
import { FONTS, VW } from "../../../_valentine/theme";
import { EndingActions, Sticker, burst, type KeepsakeLayout } from "../../../_valentine/kit";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { ROSE_COLORS, ROSE_COUNTS, type RoseExtras } from "../../../_valentine/days/happy-rose-day";
import { GradDefs, StemRose, accentVars, roseGrads, roseWallpaperDataUrl, shadesFor } from "./art";
import { kicker } from "./ui";

interface Props {
  day: DayConfig;
  data: ValentineDayData<RoseExtras>;
  mode: "preview" | "live";
  reduced: boolean;
  onReplay: () => void;
  onReached: () => void;
}

export function roseKeepsake(day: DayConfig, data: ValentineDayData<RoseExtras>): KeepsakeLayout {
  const x = data.extras;
  const color = ROSE_COLORS.find((c) => c.value === x.roseColor) ?? ROSE_COLORS[0];
  const count = ROSE_COUNTS.find((c) => c.value === x.roseCount) ?? ROSE_COUNTS[0];
  const W = 1080;
  const ink = "#5A1A2B";
  const items: KeepsakeLayout["items"] = [
    { type: "rect", x: 60, y: 60, w: 960, h: 1800, radius: 48, stroke: "rgba(200,16,46,.18)", lineWidth: 3 },
    { type: "text", text: "HAPPY ROSE DAY", x: W / 2, y: 150, size: 40, weight: 600, color: "#8A5563", face: "ui" },
    { type: "text", text: data.petName || data.recipientName || "You", x: W / 2, y: 220, size: 120, face: "script", weight: 700, color: ink, maxWidth: 900, maxLines: 1 },
    { type: "image", src: roseWallpaperDataUrl(x.roseColor, Number(x.roseCount) || 1), x: 190, y: 400, w: 700, h: 1050 },
    { type: "text", text: `A ${color.label.toLowerCase()} rose means`, x: W / 2, y: 1440, size: 36, color: "#8A5563", face: "ui" },
    { type: "text", text: `“${color.hint}”`, x: W / 2, y: 1494, size: 50, face: "serif", italic: true, color: ink, maxWidth: 880, maxLines: 2 },
    { type: "rect", x: W / 2 - 300, y: 1640, w: 600, h: 70, radius: 35, fill: accentVars(x.roseColor)["--vw-soft"] },
    { type: "text", text: `${count.value === "1" ? "1 rose" : `${count.value} roses`} · ${count.hint}`, x: W / 2, y: 1656, size: 34, weight: 600, color: ink, face: "ui", maxWidth: 560, maxLines: 1 },
    { type: "text", text: `— ${x.signOff || data.senderName || ""}`, x: W / 2, y: 1740, size: 50, face: "script", color: ink, maxWidth: 880, maxLines: 1 },
    { type: "text", text: "made on subhsandesh.in", x: W / 2, y: 1814, size: 26, color: "#8A5563", face: "ui" },
  ];
  return { background: { stops: [[0, "#FFF8F0"], [0.6, "#FDEDEF"], [1, "#F9D5DC"]] }, items };
}

export default function RoseEnding({ day, data, mode, reduced, onReplay, onReached }: Props) {
  const x = data.extras;
  const sh = shadesFor(x.roseColor);
  const id = useId().replace(/:/g, "");
  const n = Number(x.roseCount) || 1;
  const shown = n >= 7 ? 5 : n >= 3 ? 3 : 1;
  const count = ROSE_COUNTS.find((c) => c.value === x.roseCount) ?? ROSE_COUNTS[0];
  const slot = day.gifSlots[4];

  useEffect(() => {
    onReached();
    burst({ kind: "petals", origin: { x: 0.5, y: 0.3 }, count: 30 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const roses =
    shown === 1
      ? [{ x: 100, y: 70, r: 0, len: 150 }]
      : shown === 3
        ? [{ x: 72, y: 92, r: -16, len: 132 }, { x: 128, y: 92, r: 16, len: 132 }, { x: 100, y: 62, r: 0, len: 160 }]
        : [{ x: 52, y: 112, r: -26, len: 116 }, { x: 148, y: 112, r: 26, len: 116 }, { x: 74, y: 80, r: -12, len: 144 }, { x: 126, y: 80, r: 12, len: 144 }, { x: 100, y: 58, r: 0, len: 166 }];

  return (
    <>
      <p style={kicker}>Happy Rose Day</p>
      <h2 style={{ margin: 0, font: `700 ${(data.petName || data.recipientName).length > 14 ? 36 : 48}px/1.08 ${FONTS.script}`, color: VW.ink, overflowWrap: "anywhere", maxWidth: "100%" }}>
        {data.petName || data.recipientName || "you"}
      </h2>

      <div style={{ position: "relative", width: "min(62vw, 230px)", aspectRatio: "200 / 300" }}>
        <motion.svg
          viewBox="0 0 200 300"
          width="100%"
          height="100%"
          style={{ display: "block", overflow: "visible" }}
          aria-label={`${n} ${n === 1 ? "rose" : "roses"} in a vase`}
          initial={reduced ? false : { y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <GradDefs grads={roseGrads(id, sh)} />
          <defs>
            <linearGradient id={`${id}-glass`} x1="0" x2="1">
              <stop offset="0" stopColor="#fff" stopOpacity=".55" />
              <stop offset=".3" stopColor="#E9F3F5" stopOpacity=".25" />
              <stop offset=".8" stopColor="#fff" stopOpacity=".15" />
              <stop offset="1" stopColor="#fff" stopOpacity=".5" />
            </linearGradient>
            <radialGradient id={`${id}-halo`} cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor={sh.light} stopOpacity=".6" />
              <stop offset="1" stopColor={sh.light} stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx={100} cy={80} r={95} fill={`url(#${id}-halo)`} />
          <g className="rd-sway" style={{ transformOrigin: "100px 270px" }}>
            {roses.map((r, i) => (
              <StemRose key={i} id={id} open={1} x={r.x} y={r.y} s={shown === 1 ? 1 : 0.8} len={r.len / (shown === 1 ? 1 : 0.8)} rotate={r.r} leaves={i % 2 === 0} />
            ))}
          </g>
          {/* bud vase */}
          <ellipse cx={100} cy={290} rx={44} ry={6} fill="rgba(90,26,43,.14)" />
          <path d="M86 196 L114 196 L114 214 C 140 230 144 270 128 288 L72 288 C 56 270 60 230 86 214 Z" fill="rgba(220,236,240,.45)" stroke="rgba(150,180,190,.7)" strokeWidth={1.4} />
          <path d="M66 252 C 66 238 74 228 86 222 L114 222 C 126 228 134 238 134 252 C 134 268 130 280 126 288 L74 288 C 70 280 66 268 66 252 Z" fill="rgba(170,210,225,.35)" />
          <path d="M86 196 L114 196 L114 214 C 140 230 144 270 128 288 L72 288 C 56 270 60 230 86 214 Z" fill={`url(#${id}-glass)`} />
          <path d="M78 228 C 70 240 70 262 76 278" stroke="#fff" strokeOpacity=".7" strokeWidth={3} strokeLinecap="round" fill="none" />
          <rect x={84} y={192} width={32} height={6} rx={3} fill="rgba(200,225,232,.8)" />
          {n > shown && (
            <g transform="translate(150 214) rotate(10)">
              <rect x={-24} y={-14} width={48} height={28} rx={8} fill="#FFFBF3" stroke="#E2CDB4" />
              <text x={0} y={1} textAnchor="middle" dominantBaseline="middle" style={{ font: `700 15px ${FONTS.ui}` }} fill="#5A1A2B">
                ×{n}
              </text>
            </g>
          )}
        </motion.svg>
        {slot && (
          <div style={{ position: "absolute", left: -46, bottom: 0 }}>
            <Sticker slug={day.slug} slot={slot} value={data.gifs[slot.id]} size={92} />
          </div>
        )}
      </div>

      <p style={{ margin: 0, padding: "5px 14px", borderRadius: 99, background: VW.soft, font: `600 13px ${FONTS.ui}`, color: VW.ink }}>
        {n === 1 ? "1 rose" : `${n} roses`} · {count.hint}
      </p>
      {data.endLine && <p style={{ margin: 0, maxWidth: 340, font: `italic 500 19px/1.45 ${FONTS.serif}`, color: VW.ink, overflowWrap: "anywhere" }}>{data.endLine}</p>}
      <p style={{ margin: 0, font: `400 24px ${FONTS.script}`, color: VW.inkSoft, overflowWrap: "anywhere" }}>— {x.signOff || data.senderName}</p>
      <EndingActions day={day} data={data} mode={mode} onReplay={onReplay} keepsake={() => roseKeepsake(day, data)} style={{ marginTop: 4 }} />
    </>
  );
}
