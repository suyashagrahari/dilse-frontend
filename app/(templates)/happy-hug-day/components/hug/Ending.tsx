"use client";

// Ending: the Jhappi Passport — a booklet page with the hugging pair as the
// emblem, the holder's name, and one ink stamp per hug they performed — plus
// the end line, EndingActions and a 1080×1920 keepsake of the same passport.
// The keepsake's emblem is the live emblem SVG, serialised (exact match).

import { useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { getDay } from "../../../_valentine/days";
import { EndingActions, useReducedMotion, type KeepsakeItem, type KeepsakeLayout } from "../../../_valentine/kit";
import { FONTS, VW } from "../../../_valentine/theme";
import type { ValentineDayData } from "../../../_valentine/types";
import { Pair, type Species } from "./Characters";
import { GESTURE_ICON, StampMark, assignGestures, type MenuItem } from "./HugMenu";
import { H } from "./ui";

const day = getDay("happy-hug-day");
const INKS = [H.cheek, "#7E5BC2", "#2F8F6B", "#D9822B", "#3D6FB6", H.cocoa];
const COVER = "#7A2E42";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
const svgUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

function stampSvg(label: string, color: string): string {
  const t = esc(`${label.toUpperCase()} ✦ JHAPPI CAFÉ ✦ `);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="400" height="400"><defs><path id="c" d="M50,50 m-35,0 a35,35 0 1,1 70,0 a35,35 0 1,1 -70,0"/></defs><g opacity=".9"><circle cx="50" cy="50" r="46" fill="none" stroke="${color}" stroke-width="4"/><circle cx="50" cy="50" r="25" fill="none" stroke="${color}" stroke-width="2"/><text font-family="Arial Rounded MT Bold, Arial, sans-serif" font-weight="700" font-size="9.5" letter-spacing="1" fill="${color}"><textPath href="#c" textLength="214" lengthAdjust="spacingAndGlyphs">${t}</textPath></text></g></svg>`;
}

export default function Ending({
  data,
  mode,
  menu,
  stamped,
  species,
  tagMe,
  tagYou,
  recipient,
  sender,
  sticker,
  onReplay,
}: {
  data: ValentineDayData;
  mode: "preview" | "live";
  menu: MenuItem[];
  stamped: number[];
  species: [Species, Species];
  tagMe: string;
  tagYou: string;
  recipient: string;
  sender: string;
  sticker: React.ReactNode;
  onReplay: () => void;
}) {
  const reduced = useReducedMotion();
  const emblemRef = useRef<SVGSVGElement>(null);
  const gestures = useMemo(() => assignGestures(menu), [menu]);
  const date = useMemo(() => new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }), []);
  const count = stamped.length;

  const keepsake = (): KeepsakeLayout => {
    const W = 1080;
    let emblem = "";
    try {
      if (emblemRef.current) emblem = new XMLSerializer().serializeToString(emblemRef.current);
    } catch {
      emblem = "";
    }
    const items: KeepsakeItem[] = [
      { type: "rect", x: 90, y: 110, w: 900, h: 1680, radius: 40, fill: COVER },
      { type: "rect", x: 120, y: 140, w: 840, h: 1620, radius: 26, fill: "#FFF8EE" },
      { type: "rect", x: 120, y: 140, w: 840, h: 520, radius: 26, fill: "#FFE3D3" },
      { type: "rect", x: 120, y: 400, w: 840, h: 260, fill: "#FFE3D3" },
      { type: "rect", x: 150, y: 170, w: 780, h: 1560, radius: 18, stroke: H.peach, lineWidth: 4 },
      { type: "text", text: "JHAPPI PASSPORT", x: W / 2, y: 200, size: 46, face: "ui", weight: 800, color: COVER },
      { type: "text", text: "JAADU KI JHAPPI CAFÉ · VALID FOREVER", x: W / 2, y: 262, size: 24, face: "ui", weight: 700, color: "#B5705A" },
    ];
    if (emblem) items.push({ type: "image", src: svgUrl(emblem), x: 290, y: 300, w: 500, h: 340 });
    items.push(
      { type: "text", text: "HOLDER", x: 200, y: 700, size: 24, face: "ui", weight: 700, color: "#B5705A", align: "left" },
      { type: "text", text: recipient, x: 200, y: 736, size: 78, face: "script", weight: 700, color: H.cocoaDeep, align: "left", maxWidth: 680, maxLines: 1 },
      { type: "text", text: `ISSUED BY ${sender.toUpperCase()} · ${date.toUpperCase()}`, x: 200, y: 850, size: 24, face: "ui", weight: 700, color: "#B5705A", align: "left", maxWidth: 680, maxLines: 1 },
      { type: "rect", x: 200, y: 900, w: 680, h: 3, fill: "#F2DDCF" },
      { type: "text", text: `${count} of ${menu.length} jhappis stamped`, x: W / 2, y: 930, size: 36, face: "ui", weight: 700, color: H.cheek },
    );
    const cols = 3;
    const size = 220;
    const gapX = (680 - cols * size) / (cols - 1);
    menu.forEach((m, k) => {
      const cx = 200 + (k % cols) * (size + gapX);
      const cy = 1010 + Math.floor(k / cols) * 300;
      if (stamped.includes(k)) {
        items.push({ type: "image", src: svgUrl(stampSvg(m.name, INKS[k % INKS.length])), x: cx, y: cy, w: size, h: size, rotate: (k % 3) * 9 - 9 });
        items.push({ type: "emoji", char: GESTURE_ICON[gestures[k]], x: cx + size / 2, y: cy + size / 2, size: 64 });
      } else {
        items.push({ type: "rect", x: cx + 10, y: cy + 10, w: size - 20, h: size - 20, radius: (size - 20) / 2, stroke: "#E9D3C4", lineWidth: 3 });
      }
      items.push({ type: "text", text: m.name, x: cx + size / 2, y: cy + size + 14, size: 26, face: "ui", weight: 600, color: H.cocoa, maxWidth: size + 40, maxLines: 1 });
    });
    if (data.endLine) items.push({ type: "text", text: data.endLine, x: W / 2, y: 1640, size: 40, face: "script", weight: 700, color: COVER, maxWidth: 760, maxLines: 2 });
    items.push({ type: "text", text: "made on subhsandesh.in", x: W / 2, y: 1846, size: 26, face: "ui", color: "#B5705A" });
    return { background: { stops: [[0, "#FFF1E0"], [1, "#FFDCE3"]] }, items };
  };

  return (
    <>
      {sticker}
      <h2 style={{ margin: 0, font: `700 clamp(34px, 10vw, 50px)/1.1 ${FONTS.script}`, color: VW.ink, overflowWrap: "anywhere" }}>Happy Hug Day, {recipient}</h2>

      <motion.div
        initial={reduced ? false : { rotateX: 60, y: 30, opacity: 0 }}
        animate={{ rotateX: 0, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 16 }}
        style={{ width: "min(100%, 360px)", padding: 10, borderRadius: 22, background: `linear-gradient(135deg, #8E3B4E, ${COVER})`, boxShadow: "0 30px 50px -28px rgba(74,44,32,.9)", transformPerspective: 900 }}
      >
        <div style={{ borderRadius: 14, background: "#FFF8EE", overflow: "hidden", textAlign: "left" }}>
          <div style={{ background: "#FFE3D3", padding: "12px 14px 4px", textAlign: "center" }}>
            <p style={{ margin: 0, font: `800 14px ${FONTS.ui}`, letterSpacing: ".22em", color: COVER }}>JHAPPI PASSPORT</p>
            <svg ref={emblemRef} viewBox="70 40 220 150" width="100%" style={{ display: "block", maxHeight: 150 }} aria-hidden>
              <Pair species={species} lx={146} rx={214} ground={180} left={{ hugging: true, reach: 58, happy: true }} right={{ hugging: true, reach: 58, happy: true }} leftRot={4} rightRot={4} />
            </svg>
          </div>
          <div style={{ padding: "10px 16px 14px" }}>
            <p style={{ margin: 0, font: `700 10px ${FONTS.ui}`, letterSpacing: ".18em", color: "#B5705A" }}>HOLDER</p>
            <p style={{ margin: "0 0 4px", font: `700 28px/1.1 ${FONTS.script}`, color: H.cocoaDeep, overflowWrap: "anywhere" }}>{recipient}</p>
            <p style={{ margin: 0, font: `600 10.5px ${FONTS.ui}`, letterSpacing: ".1em", color: "#B5705A", overflowWrap: "anywhere" }}>
              ISSUED BY {sender.toUpperCase()} · {tagMe} ♡ {tagYou} · {date}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 12 }}>
              {menu.map((m, k) => (
                <div key={k} style={{ display: "grid", justifyItems: "center", gap: 2 }}>
                  {stamped.includes(k) ? (
                    <div style={{ transform: `rotate(${(k % 3) * 9 - 9}deg)` }}>
                      <StampMark label={m.name} icon={GESTURE_ICON[gestures[k]]} color={INKS[k % INKS.length]} size={66} />
                    </div>
                  ) : (
                    <div style={{ width: 62, height: 62, margin: 2, borderRadius: 31, border: "2px dashed #E9D3C4", display: "grid", placeItems: "center", font: `600 10px ${FONTS.ui}`, color: "#C9A796" }}>pending</div>
                  )}
                  <span style={{ font: `600 11px ${FONTS.ui}`, color: H.cocoa, maxWidth: 96, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</span>
                </div>
              ))}
            </div>
            <p style={{ margin: "10px 0 0", textAlign: "center", font: `700 14px ${FONTS.ui}`, color: H.cheek }}>
              {count >= menu.length ? "Passport complete ✓ bonus jhappi unlocked" : `${count} of ${menu.length} jhappis stamped — the rest are owed in person`}
            </p>
          </div>
        </div>
      </motion.div>

      {data.endLine && <p style={{ margin: "4px 0 0", maxWidth: 360, font: `italic 400 19px/1.5 ${FONTS.serif}`, color: VW.ink, overflowWrap: "anywhere" }}>{data.endLine}</p>}
      <p style={{ margin: 0, font: `400 22px ${FONTS.script}`, color: VW.inkSoft }}>— {sender}</p>
      <EndingActions day={day} data={data} mode={mode} onReplay={onReplay} keepsake={keepsake} style={{ marginTop: 4 }} />
    </>
  );
}
