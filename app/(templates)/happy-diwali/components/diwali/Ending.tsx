"use client";

// The ending — the Shubh Deepavali card. Warm paper with a gold border and a
// marigold corner, their first photo in a round frame, the sender's blessing
// set big, the end line and the sign-off. Then the share sheet: the sparkler
// penguin, the keepsake PNG (1080×1920), replay, "reply", and the pill itself
// passes the diya on ("Pass the light on": a WhatsApp share of this
// template).

import { useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { CroppedPhoto, EndingActions, haptic, useReducedMotion, type KeepsakeItem, type KeepsakeLayout } from "../../../_valentine/kit";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { FONTS, VW } from "../../../_valentine/theme";
import { DW_DISPLAY } from "./fonts";
import { DW_GIF, useNext } from "./stage";
import { DW, SceneTitle } from "./ui";

/** This year's Diwali, or next year's once early November has passed. */
export function diwaliYear(now = new Date()): number {
  return now.getMonth() >= 11 ? now.getFullYear() + 1 : now.getFullYear();
}

export default function Ending({
  day,
  data,
  mode,
  recipient,
  sender,
  blessing,
  signOff,
  replyText,
  sticker,
  onReplay,
}: {
  day: DayConfig;
  data: ValentineDayData;
  mode: "preview" | "live";
  recipient: string;
  sender: string;
  blessing: string;
  signOff: string;
  replyText: string;
  sticker: ReactNode;
  onReplay: () => void;
}) {
  const reduced = useReducedMotion();
  const [sheet, setSheet] = useState<"card" | "share">("card");
  const year = useMemo(() => diwaliYear(), []);
  const photo = data.photos.find((p) => p && p.url);

  const passOn = () => {
    haptic(12);
    const link = typeof window !== "undefined" ? `${window.location.origin}/happy-diwali` : "https://subhsandesh.in/happy-diwali";
    const text = `Someone left a diya at my door this Diwali 🪔✨ Light one for someone you love:\n${link}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const keepsake = (): KeepsakeLayout => {
    const W = 1080;
    const items: KeepsakeItem[] = [
      { type: "emoji", char: "🪔", x: W / 2, y: 170, size: 120 },
      { type: "text", text: "SHUBH DEEPAVALI", x: W / 2, y: 290, size: 62, weight: 700, color: DW.gold, face: "ui" },
      { type: "text", text: `DIWALI ${year}`, x: W / 2, y: 356, size: 32, weight: 600, color: DW.mist, face: "ui" },
      { type: "rect", x: 90, y: 420, w: 900, h: 1260, radius: 44, fill: DW.paper },
      { type: "rect", x: 110, y: 440, w: 860, h: 1220, radius: 32, fill: "#FFF1D6" },
    ];
    let y = 520;
    if (photo?.url) {
      items.push({ type: "image", src: photo.url, x: 390, y: 500, w: 300, h: 375, radius: 150, cropX: photo.cropX, cropY: photo.cropY, frame: { pad: 12, bottom: 12, color: "#E8B65A" } });
      y = 960;
    }
    items.push(
      { type: "text", text: `Dear ${recipient},`, x: W / 2, y, size: 70, face: "script", weight: 700, color: "#A8430C", maxWidth: 820, maxLines: 1 },
      { type: "text", text: blessing, x: W / 2, y: y + 120, size: 46, face: "serif", italic: true, color: DW.paperInk, maxWidth: 780, maxLines: 5 },
    );
    if (data.endLine) items.push({ type: "text", text: data.endLine, x: W / 2, y: 1470, size: 36, face: "ui", weight: 600, color: DW.marigoldDeep, maxWidth: 800, maxLines: 2 });
    items.push(
      { type: "text", text: `— ${sender}`, x: W / 2, y: 1590, size: 60, face: "script", weight: 700, color: "#A8430C", maxWidth: 800, maxLines: 1 },
      { type: "text", text: "A diya was left at my door on subhsandesh.in 🪔", x: W / 2, y: 1830, size: 30, color: DW.mist, face: "ui" },
    );
    return { background: { stops: [[0, DW.indigo], [0.55, DW.navy], [1, DW.night]] }, items };
  };

  useNext(sheet === "card" ? "Keep it forever" : "Pass it on", sheet === "card" ? () => setSheet("share") : passOn, sheet === "card" ? "heart" : "diya");

  if (sheet === "share")
    return (
      <>
        <SceneTitle kicker={`Diwali ${year}`} title={<>Happy Diwali, {recipient}</>} />
        <div className="dw-fill">
          <motion.div initial={reduced ? false : { opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 180, damping: 16 }} style={{ width: "min(100cqh, 76cqw, 300px)", aspectRatio: "1" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={DW_GIF.dudu} alt="A little penguin waving a sparkler" width={320} height={320} decoding="async" style={{ display: "block", width: "100%", height: "100%", objectFit: "contain" }} />
          </motion.div>
        </div>
        <p style={{ flex: "none", margin: 0, font: `500 clamp(13px, 2dvh, 15px) ${FONTS.ui}`, color: VW.inkSoft }}>Your card is yours to keep. Save it, then pass the light on 🪔</p>
        <div className="dw-zoom" style={{ flex: "none", width: "100%", maxWidth: 420 }}>
          <EndingActions day={day} data={data} mode={mode} onReplay={onReplay} keepsake={keepsake} replyText={replyText} replyLabel={`💬 Reply to ${sender}`} />
        </div>
      </>
    );

  return (
    <>
      <SceneTitle kicker={`Diwali ${year}`} title="Shubh Deepavali" />
      <div className="dw-fill">
        <motion.section
          aria-label="Your Diwali card"
          className="dw-zoom"
          initial={reduced ? false : { opacity: 0, rotate: -5, y: 30 }}
          animate={{ opacity: 1, rotate: -1, y: 0 }}
          transition={{ type: "spring", stiffness: 140, damping: 16 }}
          style={{
            position: "relative",
            width: "min(calc(100cqw - 10px), 380px)",
            maxHeight: "100cqh",
            boxSizing: "border-box",
            padding: "clamp(16px, 3dvh, 26px) clamp(16px, 5cqw, 26px) clamp(14px, 2.4dvh, 20px)",
            borderRadius: 22,
            background: "linear-gradient(180deg, #FFF9EC, #FFEBC8)",
            color: DW.paperInk,
            boxShadow: "0 0 0 2px #E8B65A, 0 0 0 8px rgba(255,211,110,.2), 0 0 70px 6px rgba(255,170,60,.3), 0 30px 60px -24px rgba(0,0,0,.85)",
            display: "grid",
            justifyItems: "center",
            gap: "clamp(6px, 1.4dvh, 12px)",
            textAlign: "center",
          }}
        >
          <span aria-hidden style={{ position: "absolute", inset: 8, borderRadius: 16, border: "1.5px dashed rgba(194,94,10,.35)", pointerEvents: "none" }} />
          <span aria-hidden style={{ position: "absolute", right: -26, top: -34, width: 86, height: 86, display: "grid", placeItems: "center" }}>
            {sticker}
          </span>
          {photo && (
            <div style={{ width: "clamp(64px, 13dvh, 104px)", aspectRatio: "1", borderRadius: "50%", overflow: "hidden", boxShadow: "0 0 0 4px #E8B65A, 0 0 0 7px #FFF6E3, 0 8px 18px -6px rgba(0,0,0,.4)" }}>
              <CroppedPhoto photo={photo} alt={recipient} />
            </div>
          )}
          <p style={{ margin: 0, font: `700 clamp(22px, 3.6dvh, 28px)/1.1 ${FONTS.script}`, color: "#A8430C", overflowWrap: "anywhere" }}>Dear {recipient},</p>
          <p style={{ margin: 0, font: `italic 400 clamp(16px, 2.6dvh, 20px)/1.45 ${FONTS.serif}`, overflowWrap: "anywhere", textWrap: "balance" }}>{blessing}</p>
          <svg viewBox="0 0 120 12" width="120" height="12" aria-hidden>
            <path d="M0 6 H48 M72 6 H120" stroke="#E8B65A" strokeWidth="1.5" />
            <circle cx="60" cy="6" r="4" fill="#FF8A1E" />
            <circle cx="52" cy="6" r="2" fill="#FF5FA2" />
            <circle cx="68" cy="6" r="2" fill="#2EC4B6" />
          </svg>
          {data.endLine && <p style={{ margin: 0, font: `600 clamp(13.5px, 2.1dvh, 16px)/1.35 ${FONTS.ui}`, color: DW.marigoldDeep, overflowWrap: "anywhere" }}>{data.endLine}</p>}
          <p style={{ margin: 0, font: `500 12px ${FONTS.ui}`, letterSpacing: ".12em", textTransform: "uppercase", color: "#8A5A3A" }}>{signOff}</p>
          <p style={{ margin: "-4px 0 0", font: `400 clamp(22px, 3.4dvh, 28px)/1.2 ${DW_DISPLAY}`, color: "#A8430C", overflowWrap: "anywhere" }}>{sender}</p>
        </motion.section>
      </div>
    </>
  );
}
