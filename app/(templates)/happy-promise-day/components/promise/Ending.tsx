"use client";

// The ending: the signed Vachan Patra as a keepsake card (both signatures,
// the thumbprint, Cupid's seal), the end line, and the shared EndingActions
// whose keepsake is a 1080×1920 story-size render of that same contract.

import { motion } from "framer-motion";
import { getDay } from "../../../_valentine/days";
import { EndingActions, useReducedMotion, type KeepsakeItem, type KeepsakeLayout } from "../../../_valentine/kit";
import { FONTS, VW } from "../../../_valentine/theme";
import type { ValentineDayData } from "../../../_valentine/types";
import { CupidSeal, Rosette, ThumbprintArt, cupidSealSvg, svgUrl, thumbprintSvg } from "./art";
import { P } from "./ui";

const day = getDay("happy-promise-day");

export interface PatraFacts {
  sender: string;
  recipient: string;
  date: string;
  serial: string;
  seed: number;
  clauses: string[];
  bigPromise: string;
  signature: string | null;
}

const rosetteSvg = () => {
  let ell = "";
  for (let a = 0; a < 180; a += 10) ell += `<ellipse cx="50" cy="50" rx="40" ry="16" transform="rotate(${a} 50 50)"/>`;
  let ell2 = "";
  for (let a = 0; a < 180; a += 10) ell2 += `<ellipse cx="50" cy="50" rx="26" ry="9" transform="rotate(${a + 5} 50 50)"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="400" height="400"><circle cx="50" cy="50" r="48" fill="#FFF8E8" stroke="${P.gold}" stroke-width="1.5"/><g fill="none" stroke="${P.gold}" stroke-width=".55">${ell}</g><g fill="none" stroke="${P.rose}" stroke-width=".55">${ell2}</g><circle cx="50" cy="50" r="17" fill="#FFF8E8" stroke="${P.gold}" stroke-width="1.2"/><text x="50" y="56" text-anchor="middle" font-family="Georgia, serif" font-weight="700" font-size="16" fill="${P.berry}">₹∞</text></svg>`;
};

export function patraKeepsake(f: PatraFacts, data: ValentineDayData): KeepsakeLayout {
  const W = 1080;
  const between = `between ${f.sender} & ${f.recipient}`;
  const items: KeepsakeItem[] = [
    { type: "rect", x: 70, y: 120, w: 940, h: 1620, radius: 14, fill: "#FFFBF2" },
    { type: "rect", x: 96, y: 146, w: 888, h: 1568, radius: 6, stroke: P.gold, lineWidth: 6 },
    { type: "rect", x: 110, y: 160, w: 860, h: 1540, radius: 4, stroke: P.goldLight, lineWidth: 2 },
    { type: "rect", x: 110, y: 160, w: 860, h: 236, fill: "rgba(232,106,146,0.08)" },
    { type: "rect", x: 110, y: 394, w: 860, h: 4, fill: P.gold },
    { type: "image", src: svgUrl(rosetteSvg()), x: 140, y: 196, w: 164, h: 164 },
    { type: "text", text: "PYAAR NON-JUDICIAL", x: 332, y: 208, size: 50, face: "serif", weight: 800, color: P.berry, align: "left", maxWidth: 620, maxLines: 1 },
    { type: "text", text: "₹∞ PYAAR STAMP PAPER · NON-BREAKABLE", x: 334, y: 284, size: 24, face: "ui", weight: 700, color: "#A97A1C", align: "left", maxWidth: 620, maxLines: 1 },
    { type: "text", text: `No. ${f.serial} · ${f.date}`, x: 334, y: 326, size: 24, face: "ui", weight: 500, color: "#A2647C", align: "left", maxWidth: 620, maxLines: 1 },
    { type: "text", text: "VACHAN PATRA", x: W / 2, y: 440, size: 80, face: "serif", weight: 800, color: P.berry },
    { type: "text", text: "(an agreement of forever)", x: W / 2, y: 540, size: 34, face: "serif", italic: true, color: "#A2647C" },
    { type: "text", text: between, x: W / 2, y: 600, size: 40, face: "serif", weight: 600, color: P.berryDeep, maxWidth: 820, maxLines: 2 },
  ];
  let y = between.length > 34 ? 760 : 700;
  f.clauses.slice(0, 4).forEach((c, k) => {
    items.push({ type: "text", text: `Clause ${k + 1}.`, x: 160, y: y + 4, size: 24, face: "ui", weight: 700, color: "#A97A1C", align: "left" });
    items.push({ type: "text", text: c, x: 290, y, size: 32, face: "serif", color: P.berryDeep, align: "left", maxWidth: 640, maxLines: 2, lineHeight: 1.3 });
    y += 96;
  });
  if (f.bigPromise) {
    items.push({ type: "rect", x: 150, y: y + 6, w: 780, h: 196, radius: 14, fill: "#FFF4D6", stroke: P.gold, lineWidth: 3 });
    items.push({ type: "text", text: "THE MAIN CLAUSE · NON-NEGOTIABLE", x: W / 2, y: y + 30, size: 22, face: "ui", weight: 800, color: "#A97A1C" });
    items.push({ type: "text", text: f.bigPromise, x: W / 2, y: y + 70, size: 34, face: "serif", italic: true, color: P.berryDeep, maxWidth: 700, maxLines: 3, lineHeight: 1.3 });
    y += 230;
  }
  const sy = Math.max(y + 30, 1330);
  items.push({ type: "text", text: "PROMISER", x: 160, y: sy, size: 22, face: "ui", weight: 700, color: "#A2647C", align: "left" });
  items.push({ type: "text", text: f.sender, x: 160, y: sy + 40, size: 72, face: "script", weight: 700, color: P.berry, align: "left", maxWidth: 360, maxLines: 1 });
  items.push({ type: "rect", x: 160, y: sy + 140, w: 340, h: 3, fill: "rgba(142,31,74,0.35)" });
  items.push({ type: "text", text: "PROMISEE", x: 580, y: sy, size: 22, face: "ui", weight: 700, color: "#A2647C", align: "left" });
  if (f.signature) items.push({ type: "image", src: f.signature, x: 560, y: sy + 26, w: 380, h: 114 });
  else items.push({ type: "text", text: f.recipient, x: 580, y: sy + 40, size: 72, face: "script", weight: 700, color: P.berry, align: "left", maxWidth: 360, maxLines: 1 });
  items.push({ type: "rect", x: 580, y: sy + 140, w: 340, h: 3, fill: "rgba(142,31,74,0.35)" });
  const ty = sy + 170;
  items.push({ type: "image", src: svgUrl(thumbprintSvg(f.seed)), x: 180, y: ty, w: 150, h: 180 });
  items.push({ type: "text", text: "thumb impression", x: 255, y: ty + 186, size: 22, face: "ui", color: "#A2647C" });
  items.push({ type: "image", src: svgUrl(cupidSealSvg(P.berry, f.date)), x: 690, y: ty - 30, w: 250, h: 250, rotate: -14 });
  if (data.endLine) items.push({ type: "text", text: data.endLine, x: W / 2, y: 1772, size: 36, face: "script", weight: 700, color: P.berry, maxWidth: 940, maxLines: 1 });
  items.push({ type: "text", text: "made on subhsandesh.in", x: W / 2, y: 1846, size: 26, face: "ui", color: "#A2647C" });
  return { background: { stops: [[0, "#FFF4EE"], [1, "#F7DCE4"]] }, items };
}

export default function Ending({ facts, data, mode, sticker, onReplay }: { facts: PatraFacts; data: ValentineDayData; mode: "preview" | "live"; sticker: React.ReactNode; onReplay: () => void }) {
  const reduced = useReducedMotion();
  return (
    <>
      {sticker}
      <h2 style={{ margin: 0, font: `700 clamp(34px, 10vw, 50px)/1.1 ${FONTS.script}`, color: VW.ink, overflowWrap: "anywhere" }}>Happy Promise Day, {facts.recipient}</h2>
      <p style={{ margin: 0, font: `700 17px ${FONTS.ui}`, color: VW.accentDeep }}>Signed, thumb-printed, notarised. Vaada pakka 🤞</p>

      {/* the signed patra, small */}
      <motion.div
        initial={reduced ? false : { rotate: -6, y: 30, opacity: 0 }}
        animate={{ rotate: -1.5, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 140, damping: 16 }}
        style={{ position: "relative", width: "min(100%, 360px)", padding: "14px 16px 16px", background: P.paper, borderRadius: 4, boxShadow: "0 26px 50px -26px rgba(94,20,51,.6)", textAlign: "left" }}
      >
        <div aria-hidden style={{ position: "absolute", inset: 6, border: `2px solid ${P.gold}`, pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 8, borderBottom: `1.5px solid ${P.gold}` }}>
          <Rosette size={44} />
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, font: `800 14px ${FONTS.serif}`, letterSpacing: ".1em", color: P.berry }}>VACHAN PATRA</p>
            <p style={{ margin: 0, font: `600 10px ${FONTS.ui}`, letterSpacing: ".12em", color: "#A97A1C" }}>₹∞ PYAAR STAMP PAPER · {facts.date}</p>
          </div>
        </div>
        {facts.bigPromise && <p style={{ margin: "10px 0 0", font: `italic 400 14.5px/1.45 ${FONTS.serif}`, color: P.berryDeep, overflowWrap: "anywhere" }}>“{facts.bigPromise}”</p>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12, alignItems: "end" }}>
          <div style={{ minWidth: 0 }}>
            <span style={{ display: "block", font: `700 24px/1 ${FONTS.script}`, color: P.berry, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingBottom: 4, borderBottom: "1px solid rgba(142,31,74,.3)" }}>{facts.sender}</span>
            <span style={{ font: `600 9.5px ${FONTS.ui}`, letterSpacing: ".14em", color: "#A2647C" }}>PROMISER</span>
          </div>
          <div style={{ minWidth: 0 }}>
            <span style={{ display: "block", height: 40, borderBottom: "1px solid rgba(142,31,74,.3)", position: "relative" }}>
              {facts.signature ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={facts.signature} alt={`${facts.recipient}'s signature`} style={{ position: "absolute", inset: "-14px -6px -4px", width: "calc(100% + 12px)", height: 58, objectFit: "contain" }} />
              ) : (
                <span style={{ position: "absolute", bottom: 4, left: 0, font: `700 24px/1 ${FONTS.script}`, color: P.berry, whiteSpace: "nowrap" }}>{facts.recipient}</span>
              )}
            </span>
            <span style={{ font: `600 9.5px ${FONTS.ui}`, letterSpacing: ".14em", color: "#A2647C" }}>PROMISEE</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <ThumbprintArt seed={facts.seed} id="pd-end-thumb" size={46} />
          <div style={{ transform: "rotate(-14deg)", mixBlendMode: "multiply" }}>
            <CupidSeal size={84} date={facts.date} />
          </div>
        </div>
      </motion.div>

      {data.endLine && <p style={{ margin: "6px 0 0", maxWidth: 360, font: `italic 400 19px/1.5 ${FONTS.serif}`, color: VW.ink, overflowWrap: "anywhere" }}>{data.endLine}</p>}
      <p style={{ margin: 0, font: `400 22px ${FONTS.script}`, color: VW.inkSoft }}>— {facts.sender}</p>
      <EndingActions day={day} data={data} mode={mode} onReplay={onReplay} keepsake={() => patraKeepsake(facts, data)} style={{ marginTop: 4 }} />
    </>
  );
}
