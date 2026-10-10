"use client";

// The ending — the Boo License. Their first photo in a costume frame, both
// names, the costume and why it suits them, "Official Boo · Halloween <year>",
// the sender's end line. Then the two loops: "Boo someone back" (the real
// You've-Been-Booed chain — a WhatsApp share of this template) and the reply
// to the sender, plus the keepsake PNG (1080×1920), replay and "make one".
//
// Two sheets, one screen each: the license (candy pill: "Keep it forever"),
// then the Happy Halloween card with the actions, where the candy pill itself
// is "Boo someone back".

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CroppedPhoto, EndingActions, haptic, useReducedMotion, type KeepsakeLayout, type KeepsakeItem } from "../../../_valentine/kit";
import { HALLOWEEN_COSTUMES, type HalloweenCostume } from "../../../_valentine/days/happy-halloween";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { FONTS, VW } from "../../../_valentine/theme";
import { CostumeFrame } from "./art";
import { HW_DISPLAY } from "./fonts";
import { HW_GIF, useNext } from "./stage";
import { HW, RoomTitle } from "./ui";

/** Halloween this year, or next year's once this one has passed (from 1 Nov). */
export function halloweenYear(now = new Date()): number {
  return now.getMonth() >= 10 ? now.getFullYear() + 1 : now.getFullYear();
}

export default function Ending({
  day,
  data,
  mode,
  recipient,
  sender,
  costume,
  costumeWhy,
  licenseTitle,
  replyText,
  onReplay,
}: {
  day: DayConfig;
  data: ValentineDayData;
  mode: "preview" | "live";
  recipient: string;
  sender: string;
  costume: HalloweenCostume;
  costumeWhy: string;
  licenseTitle: string;
  replyText: string;
  onReplay: () => void;
}) {
  const reduced = useReducedMotion();
  const [sheet, setSheet] = useState<"license" | "share">("license");
  const year = useMemo(() => halloweenYear(), []);
  const photo = data.photos.find((p) => p && p.url);
  const c = HALLOWEEN_COSTUMES[costume] ?? HALLOWEEN_COSTUMES.ghost;
  const licenseNo = useMemo(() => {
    let h = 7;
    for (const ch of `${recipient}${sender}`) h = (h * 31 + ch.charCodeAt(0)) % 99991;
    return `BOO-${String(h).padStart(5, "0")}`;
  }, [recipient, sender]);

  const booBack = () => {
    haptic(12);
    const link = typeof window !== "undefined" ? `${window.location.origin}/happy-halloween` : "https://subhsandesh.in/happy-halloween";
    const text = `You've been BOOED 👻🎃\nSomeone built me a tiny haunted house for Halloween, and now it's my turn. Boo two people you love back:\n${link}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const keepsake = (): KeepsakeLayout => {
    const W = 1080;
    const items: KeepsakeItem[] = [
      { type: "emoji", char: "🎃", x: W / 2, y: 150, size: 110 },
      { type: "text", text: "BOO LICENSE", x: W / 2, y: 250, size: 64, weight: 700, color: HW.candle, face: "ui" },
      { type: "text", text: `HALLOWEEN ${year}`, x: W / 2, y: 320, size: 34, weight: 600, color: HW.mist, face: "ui" },
      { type: "rect", x: 90, y: 380, w: 900, h: 1300, radius: 44, fill: HW.paper },
      { type: "rect", x: 90, y: 380, w: 900, h: 90, radius: 44, fill: HW.plum },
      { type: "rect", x: 90, y: 430, w: 900, h: 40, fill: HW.plum },
      { type: "text", text: licenseTitle.toUpperCase(), x: W / 2, y: 428, size: 34, weight: 700, color: HW.candle, face: "ui", maxWidth: 840, maxLines: 1 },
    ];
    if (photo?.url) {
      items.push({ type: "image", src: photo.url, x: 290, y: 520, w: 500, h: 625, radius: 18, cropX: photo.cropX, cropY: photo.cropY, frame: { pad: 16, bottom: 16, color: "#C9954E" } });
      items.push({ type: "emoji", char: c.emoji, x: 800, y: 540, size: 130 });
    } else {
      items.push({ type: "rect", x: 290, y: 520, w: 500, h: 625, radius: 18, fill: HW.plum });
      items.push({ type: "emoji", char: c.emoji, x: W / 2, y: 830, size: 300 });
    }
    items.push(
      { type: "text", text: recipient, x: W / 2, y: 1200, size: 96, face: "script", weight: 700, color: HW.paperInk, maxWidth: 820, maxLines: 1 },
      { type: "text", text: `Costume: ${c.label}`, x: W / 2, y: 1330, size: 38, weight: 700, color: HW.pumpkinDeep, face: "ui" },
    );
    if (costumeWhy) items.push({ type: "text", text: `“${costumeWhy}”`, x: W / 2, y: 1390, size: 36, face: "serif", italic: true, color: "#4A3A5E", maxWidth: 800, maxLines: 2 });
    items.push(
      { type: "text", text: `Issued by ${sender}  ·  ${licenseNo}`, x: W / 2, y: 1520, size: 30, weight: 600, color: "#4A3A5E", face: "ui", maxWidth: 820, maxLines: 1 },
      { type: "text", text: "Valid every 31 October, forever", x: W / 2, y: 1570, size: 28, color: "#6B5F86", face: "ui" },
    );
    if (data.endLine) items.push({ type: "text", text: data.endLine, x: W / 2, y: 1740, size: 40, face: "serif", italic: true, color: HW.ghost, maxWidth: 940, maxLines: 2 });
    items.push({ type: "text", text: "I got booed on subhsandesh.in 👻", x: W / 2, y: 1860, size: 30, color: HW.mist, face: "ui" });
    return { background: { stops: [[0, HW.plum], [0.55, HW.indigo], [1, HW.night]] }, items };
  };

  useNext(sheet === "license" ? "Keep it forever" : "Boo someone back", sheet === "license" ? () => setSheet("share") : booBack, sheet === "license" ? "heart" : "ghost");

  if (sheet === "share")
    return (
      <>
        <RoomTitle kicker={`Halloween ${year}`} title={<>Happy Halloween, {recipient}</>} />
        <div className="hw-fill">
          <motion.div initial={reduced ? false : { opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 180, damping: 16 }} style={{ width: "min(100cqh, 76cqw, 300px)", aspectRatio: "1" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={HW_GIF.title} alt="Happy Halloween" width={320} height={320} decoding="async" style={{ display: "block", width: "100%", height: "100%", objectFit: "contain" }} />
          </motion.div>
        </div>
        <p style={{ flex: "none", margin: 0, font: `500 clamp(13px, 2dvh, 15px) ${FONTS.ui}`, color: VW.inkSoft }}>
          Your Boo License is yours forever. Save it, then boo someone back 👻
        </p>
        <EndingActions day={day} data={data} mode={mode} onReplay={onReplay} keepsake={keepsake} replyText={replyText} replyLabel={`💬 Reply to ${sender}`} style={{ flex: "none" }} />
      </>
    );

  return (
    <>
      <RoomTitle kicker={`Halloween ${year}`} title="Your Boo License" />

      <div className="hw-fill">
      <motion.section
        aria-label="Boo License"
        initial={reduced ? false : { opacity: 0, rotate: -6, y: 30 }}
        animate={{ opacity: 1, rotate: -1.5, y: 0 }}
        transition={{ type: "spring", stiffness: 140, damping: 16 }}
        style={{
          position: "relative",
          width: "min(calc(100cqw - 10px), calc(360px * var(--vw-s, 1)))",
          borderRadius: 20,
          overflow: "visible",
          background: VW.paper,
          color: HW.paperInk,
          boxShadow: "0 30px 60px -24px rgba(0,0,0,.85), 0 0 0 3px rgba(255,210,122,.4)",
          textAlign: "center",
        }}
      >
        <div style={{ borderRadius: "20px 20px 0 0", background: HW.plum, color: HW.candle, padding: "9px 14px", font: `700 11.5px ${FONTS.ui}`, letterSpacing: ".16em", textTransform: "uppercase" }}>
          {licenseTitle}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "min(42%, calc((100cqh - 170px) * .8)) 1fr", gap: 14, padding: "clamp(16px, 2.6dvh, 24px) 16px 12px", alignItems: "center", textAlign: "left" }}>
          <div style={{ position: "relative", width: "100%", aspectRatio: "4 / 5", padding: 5, borderRadius: 8, background: "linear-gradient(135deg, #D9A75A, #8A5A2B)", boxSizing: "border-box" }}>
            <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 4, overflow: "hidden", background: HW.plum, display: "grid", placeItems: "center" }}>
              {photo ? <CroppedPhoto photo={photo} alt={`${recipient} in costume`} /> : <span style={{ fontSize: 54 }} aria-hidden>{c.emoji}</span>}
            </div>
            <CostumeFrame costume={costume} />
          </div>
          <div style={{ display: "grid", gap: 5, minWidth: 0 }}>
            <p style={{ margin: 0, font: `700 10.5px ${FONTS.ui}`, letterSpacing: ".14em", textTransform: "uppercase", color: "#6B5F86" }}>Name</p>
            <p style={{ margin: "-4px 0 0", font: `700 clamp(24px, 3.8dvh, 28px)/1.05 ${FONTS.script}`, overflowWrap: "anywhere" }}>{recipient}</p>
            {data.petName && <p style={{ margin: "-2px 0 0", font: `italic 400 14px ${FONTS.serif}`, color: "#4A3A5E" }}>aka “{data.petName}”</p>}
            <p style={{ margin: "4px 0 0", font: `700 10.5px ${FONTS.ui}`, letterSpacing: ".14em", textTransform: "uppercase", color: "#6B5F86" }}>Costume</p>
            <p style={{ margin: "-4px 0 0", font: `600 15px ${FONTS.ui}`, color: HW.pumpkinDeep }}>
              {c.emoji} {c.label}
            </p>
            <p style={{ margin: "4px 0 0", font: `700 10.5px ${FONTS.ui}`, letterSpacing: ".14em", textTransform: "uppercase", color: "#6B5F86" }}>Issued by</p>
            <p style={{ margin: "-4px 0 0", font: `600 15px ${FONTS.ui}`, overflowWrap: "anywhere" }}>{sender}</p>
          </div>
        </div>
        {costumeWhy && <p style={{ margin: "0 18px 8px", font: `italic 400 clamp(13.5px, 2.1dvh, 15px)/1.4 ${FONTS.serif}`, color: "#4A3A5E", overflowWrap: "anywhere" }}>“{costumeWhy}”</p>}
        <div style={{ display: "grid", gap: 2, padding: "9px 150px 12px 16px", borderTop: "1.5px dashed rgba(43,30,63,.2)", font: `600 11.5px ${FONTS.ui}`, color: "#6B5F86", textAlign: "left" }}>
          <span>{licenseNo}</span>
          <span>Valid every 31 Oct, forever</span>
        </div>
        <motion.span
          aria-hidden
          initial={reduced ? false : { scale: 2.2, opacity: 0, rotate: -30 }}
          animate={{ scale: 1, opacity: 1, rotate: -14 }}
          transition={{ delay: reduced ? 0 : 0.6, type: "spring", stiffness: 300, damping: 15 }}
          style={{ position: "absolute", right: 12, bottom: 12, padding: "6px 10px", borderRadius: 10, border: `3px solid ${HW.pumpkinDeep}`, color: HW.pumpkinDeep, font: `400 16px/1 ${HW_DISPLAY}`, letterSpacing: ".04em", background: "rgba(255,246,230,.7)" }}
        >
          OFFICIAL BOO 👻
        </motion.span>
      </motion.section>
      </div>

      {(data.endLine || sender) && (
        <p style={{ flex: "none", margin: 0, maxWidth: 380, font: `italic 400 clamp(16px, 2.5dvh, 19px)/1.35 ${FONTS.serif}`, color: VW.ink, overflowWrap: "anywhere" }}>
          {data.endLine}
          {sender && <span style={{ display: "block", font: `700 clamp(20px, 3dvh, 24px) ${FONTS.script}`, color: HW.candle, fontStyle: "normal" }}>— {sender}</span>}
        </p>
      )}
    </>
  );
}
