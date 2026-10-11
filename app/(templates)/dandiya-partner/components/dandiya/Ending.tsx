"use client";

// The ending — the Dandiya Pass. Their first photo in a mirror-work frame,
// "<them> × <you>", the pass title for who it's for, the night's date and
// venue, the colour they picked, a "barcode" of little mirrors and a PARTNER
// CONFIRMED stamp. Then the actions sheet: keepsake PNG (1080×1920), the
// reply to the sender, replay, and "Invite your own partner" (WhatsApp).
//
// Two sheets, one screen each: the pass (pill: "Keep my pass"), then the
// share card with the actions, where the pill itself is the invite-your-own.

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CroppedPhoto, EndingActions, haptic, useReducedMotion, type KeepsakeItem, type KeepsakeLayout } from "../../../_valentine/kit";
import { DANDIYA_COLORS, type DandiyaColor } from "../../../_valentine/days/dandiya-partner";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { FONTS, VW } from "../../../_valentine/theme";
import { CrossedSticks } from "./art";
import { DD_DISPLAY } from "./fonts";
import { DD_GIF, useDd, useNext } from "./stage";
import { BANDHANI, DD, MIRROR_ROW, RoomTitle, navratriYear, prettyDate } from "./ui";

export default function Ending({
  day,
  data,
  mode,
  recipient,
  sender,
  passTitle,
  picked,
  date,
  venue,
  replyText,
  onReplay,
}: {
  day: DayConfig;
  data: ValentineDayData;
  mode: "preview" | "live";
  recipient: string;
  sender: string;
  passTitle: string;
  picked: DandiyaColor | null;
  date: string;
  venue: string;
  replyText: string;
  onReplay: () => void;
}) {
  const reduced = useReducedMotion();
  const [sheet, setSheet] = useState<"pass" | "share">("pass");
  const year = useMemo(() => navratriYear(), []);
  const photo = data.photos.find((p) => p && p.url);
  const color = picked ? DANDIYA_COLORS[picked] : null;
  const when = prettyDate(date) || `Navratri ${year}`;
  const passNo = useMemo(() => {
    let h = 9;
    for (const ch of `${recipient}${sender}`) h = (h * 31 + ch.charCodeAt(0)) % 99991;
    return `DNDY-${String(h).padStart(5, "0")}`;
  }, [recipient, sender]);

  const invite = () => {
    haptic(12);
    const link = typeof window !== "undefined" ? `${window.location.origin}/dandiya-partner` : "https://subhsandesh.in/dandiya-partner";
    const text = `Someone just asked me to be their Dandiya partner with the cutest invitation 💛✨\nMake one for your own partner this Navratri:\n${link}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const keepsake = (): KeepsakeLayout => {
    const W = 1080;
    const items: KeepsakeItem[] = [
      { type: "emoji", char: "🪔", x: W / 2, y: 150, size: 100 },
      { type: "text", text: "DANDIYA PASS", x: W / 2, y: 250, size: 64, weight: 700, color: DD.gold, face: "ui" },
      { type: "text", text: `NAVRATRI ${year}`, x: W / 2, y: 320, size: 34, weight: 600, color: DD.mist, face: "ui" },
      { type: "rect", x: 90, y: 380, w: 900, h: 1300, radius: 44, fill: DD.cream },
      { type: "rect", x: 90, y: 380, w: 900, h: 100, radius: 44, fill: DD.kumkum },
      { type: "rect", x: 90, y: 440, w: 900, h: 40, fill: DD.kumkum },
      { type: "text", text: passTitle.toUpperCase(), x: W / 2, y: 432, size: 34, weight: 700, color: DD.gold, face: "ui", maxWidth: 840, maxLines: 1 },
    ];
    if (photo?.url) {
      items.push({ type: "image", src: photo.url, x: 315, y: 530, w: 450, h: 450, radius: 225, cropX: photo.cropX, cropY: photo.cropY });
      items.push({ type: "rect", x: 307, y: 522, w: 466, h: 466, radius: 233, stroke: DD.gold, lineWidth: 10 });
    } else {
      items.push({ type: "rect", x: 315, y: 530, w: 450, h: 450, radius: 225, fill: DD.royal });
      items.push({ type: "emoji", char: "💃", x: W / 2, y: 760, size: 220 });
    }
    items.push(
      { type: "text", text: `${recipient} × ${sender}`, x: W / 2, y: 1090, size: 84, face: "script", weight: 700, color: DD.maroon, maxWidth: 840, maxLines: 1 },
      { type: "text", text: when, x: W / 2, y: 1200, size: 40, weight: 700, color: DD.kumkumDeep, face: "ui", maxWidth: 820, maxLines: 1 },
    );
    if (venue) items.push({ type: "text", text: venue, x: W / 2, y: 1260, size: 34, color: "#6B3A2A", face: "ui", maxWidth: 820, maxLines: 1 });
    if (color) items.push({ type: "text", text: `Twirling in ${color.label}`, x: W / 2, y: 1330, size: 34, face: "serif", italic: true, color: color.deep, maxWidth: 820, maxLines: 1 });
    items.push(
      { type: "text", text: `${passNo}  ·  Admit two`, x: W / 2, y: 1490, size: 30, weight: 600, color: "#6B3A2A", face: "ui" },
      { type: "text", text: "PARTNER CONFIRMED ✓", x: W / 2, y: 1580, size: 40, weight: 700, color: DD.kumkum, face: "ui" },
    );
    if (data.endLine) items.push({ type: "text", text: data.endLine, x: W / 2, y: 1760, size: 40, face: "serif", italic: true, color: DD.ink, maxWidth: 940, maxLines: 2 });
    items.push({ type: "text", text: "My Dandiya invitation, on subhsandesh.in ✨", x: W / 2, y: 1860, size: 30, color: DD.mist, face: "ui" });
    return { background: { stops: [[0, DD.royal], [0.55, DD.indigo], [1, DD.night]] }, items };
  };

  const { go } = useDd();
  useNext(sheet === "pass" ? "Keep my pass" : "Pass it on", sheet === "pass" ? () => setSheet("share") : invite, sheet === "pass" ? "heart" : "sticks", sheet === "pass");

  if (sheet === "share")
    return (
      <>
        <style>{END_CSS}</style>
        <RoomTitle kicker={`Navratri ${year}`} title={<>Happy Navratri, {recipient}</>} />
        <div className="dd-fill">
          <motion.div initial={reduced ? false : { opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 180, damping: 16 }} className="dd-end-art">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={DD_GIF.dhamal} alt="Dandiya Dhamaal! Happy Navratri!" width={384} height={500} decoding="async" />
          </motion.div>
        </div>
        <p style={{ flex: "none", margin: 0, font: `500 clamp(13px, 2dvh, 15px) ${FONTS.ui}`, color: VW.inkSoft }}>Your pass is yours to keep. Save it, then tell {sender} 💛</p>
        <div className="dd-zoom" style={{ flex: "none", width: "100%", maxWidth: 420 }}>
          <EndingActions day={day} data={data} mode={mode} onReplay={() => go(onReplay)} keepsake={keepsake} replyText={replyText} replyLabel={`💬 Reply to ${sender}`} />
        </div>
      </>
    );

  return (
    <>
      <style>{END_CSS}</style>
      <RoomTitle kicker={`Navratri ${year}`} title="Your Dandiya Pass" />
      <div className="dd-fill">
        <motion.section
          aria-label="Dandiya Pass"
          className="dd-pass dd-zoom"
          initial={reduced ? false : { opacity: 0, rotate: -6, y: 30 }}
          animate={{ opacity: 1, rotate: -1.5, y: 0 }}
          transition={{ type: "spring", stiffness: 140, damping: 16 }}
        >
          <div className="dd-pass-head">{passTitle}</div>
          <div className="dd-pass-body">
            <div className="dd-pass-photo">
              <span className="dd-pass-photo-in">
                {photo ? <CroppedPhoto photo={photo} alt={`${recipient} and ${sender}`} /> : <span style={{ fontSize: 46 }} aria-hidden>💃</span>}
              </span>
            </div>
            <div style={{ display: "grid", gap: 4, minWidth: 0, textAlign: "left" }}>
              <p className="dd-pass-l">Partners</p>
              <p className="dd-pass-names">
                {recipient} <span style={{ color: DD.kumkum }}>×</span> {sender}
              </p>
              <p className="dd-pass-l">When</p>
              <p className="dd-pass-v">{when}</p>
              {venue && (
                <>
                  <p className="dd-pass-l">Where</p>
                  <p className="dd-pass-v">{venue}</p>
                </>
              )}
              {color && (
                <p className="dd-pass-v" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 14, height: 14, borderRadius: "50%", background: color.base, boxShadow: "0 0 0 2px #F6D27A", flex: "none" }} /> Twirling in {color.label}
                </p>
              )}
            </div>
          </div>
          <div className="dd-pass-foot">
            <span className="dd-pass-code" aria-hidden />
            <span>{passNo} · Admit two</span>
          </div>
          <motion.span
            aria-hidden
            className="dd-pass-stamp"
            initial={reduced ? false : { scale: 2.2, opacity: 0, rotate: -30 }}
            animate={{ scale: 1, opacity: 1, rotate: -12 }}
            transition={{ delay: reduced ? 0 : 0.6, type: "spring", stiffness: 300, damping: 15 }}
          >
            PARTNER
            <br />
            CONFIRMED
          </motion.span>
          <span className="dd-pass-sticks" aria-hidden>
            <CrossedSticks size="100%" />
          </span>
        </motion.section>
      </div>
      {(data.endLine || sender) && (
        <p style={{ flex: "none", margin: 0, maxWidth: 380, font: `italic 400 clamp(16px, 2.5dvh, 19px)/1.35 ${FONTS.serif}`, color: VW.ink, overflowWrap: "anywhere" }}>
          {data.endLine}
          {sender && <span style={{ display: "block", font: `700 clamp(20px, 3dvh, 24px) ${FONTS.script}`, color: DD.gold, fontStyle: "normal" }}>— {sender}</span>}
        </p>
      )}
    </>
  );
}

const END_CSS = `
.dd-end-art { width: min(100cqh * .77, 76cqw, 280px); aspect-ratio: 384 / 500; }
.dd-end-art img { display: block; width: 100%; height: 100%; object-fit: contain; animation: dd-end-bob 2.2s ease-in-out infinite alternate; filter: drop-shadow(0 12px 24px rgba(0,0,0,.5)); }
@keyframes dd-end-bob { from { transform: rotate(-3deg) translateY(2px) } to { transform: rotate(3deg) translateY(-6px) } }
.dd-pass { position: relative; width: min(calc(100cqw - 10px), 360px); border-radius: 20px; background: linear-gradient(180deg, #FFF9EC, #FFEBC2); color: ${DD.maroon};
  box-shadow: 0 0 0 3px #F6D27A, 0 0 0 6px rgba(142,16,34,.9), 0 30px 60px -24px rgba(0,0,0,.85); }
.dd-pass-head { border-radius: 20px 20px 0 0; padding: 10px 14px 16px; font: 700 11.5px ${FONTS.ui}; letter-spacing: .18em; text-transform: uppercase; color: ${DD.gold};
  background: ${MIRROR_ROW.replace("0 50% / 14px 14px repeat-x", "0 calc(100% - 2px) / 14px 14px repeat-x")}, ${BANDHANI}, linear-gradient(160deg, #E0324A, #8E1022); }
.dd-pass-body { display: grid; grid-template-columns: min(38%, calc((100cqh - 190px))) 1fr; gap: 14px; padding: clamp(14px, 2.4dvh, 22px) 16px 10px; align-items: center; }
.dd-pass-photo { position: relative; aspect-ratio: 1; padding: 6px; border-radius: 50%; background: conic-gradient(from 0deg, #F6D27A, #B8862E, #F6D27A, #B8862E, #F6D27A); }
.dd-pass-photo-in { position: relative; display: grid; place-items: center; width: 100%; height: 100%; border-radius: 50%; overflow: hidden; background: ${DD.royal}; }
.dd-pass-l { margin: 0; font: 700 10.5px ${FONTS.ui}; letter-spacing: .14em; text-transform: uppercase; color: #8A5A3A; }
.dd-pass-names { margin: -3px 0 2px; font: 700 clamp(21px, 3.4dvh, 25px)/1.1 ${FONTS.script}; overflow-wrap: anywhere; }
.dd-pass-v { margin: -3px 0 2px; font: 600 14.5px/1.25 ${FONTS.ui}; overflow-wrap: anywhere; }
.dd-pass-foot { display: grid; gap: 4px; padding: 10px 140px 14px 16px; border-top: 2px dashed rgba(142,16,34,.3); font: 600 11.5px ${FONTS.ui}; color: #8A5A3A; text-align: left; }
.dd-pass-code { display: block; height: 16px; background: repeating-linear-gradient(90deg, ${DD.maroon} 0 2px, transparent 2px 4px, ${DD.maroon} 4px 7px, transparent 7px 9px, ${DD.maroon} 9px 10px, transparent 10px 13px); opacity: .75; }
.dd-pass-stamp { position: absolute; right: 12px; bottom: 12px; padding: 5px 9px; border-radius: 10px; border: 3px solid ${DD.kumkum}; color: ${DD.kumkum};
  font: 400 14px/1.05 ${DD_DISPLAY}; text-align: center; background: rgba(255,244,222,.75); }
.dd-pass-sticks { position: absolute; right: -14px; top: -26px; width: 64px; height: 64px; transform: rotate(12deg); }
`;
