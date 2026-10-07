"use client";

// ─── ChocoEnding — "One more piece?" → the box receipt keepsake ──────────────
//
// A last bonbon on a doily with the sender's final ask. "Yes, with you" rains
// mini chocolates; the "No" button can't stay a no (it turns into another yes
// the moment it's touched). Then the thermal "box receipt" — 9 reasons,
// 0 calories — which is also the 1080×1920 keepsake PNG.

import { useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FONTS } from "../../_valentine/theme";
import { burst, EndingActions, haptic, type KeepsakeItem, type KeepsakeLayout } from "../../_valentine/kit";
import type { DayConfig, ValentineDayData } from "../../_valentine/types";
import { C, CHOCOS, ChocoArt, CupArt } from "./chocoArt";

export interface ReceiptInfo {
  recipient: string;
  sender: string;
  pieces: number;
  eaten: number;
  endLine: string;
  date: string;
}

export function receiptRows(r: ReceiptInfo): [string, string][] {
  return [
    [`${r.pieces - 1} × sweet reasons`, "₹0"],
    ["1 × gooey centre", "priceless"],
    ["1 × heart truffle (melted)", "❤"],
    ["Calories", "0"],
    ["Added sugar", "only you"],
    ["Hugs owed", "∞"],
  ];
}

export default function ChocoEnding({
  day,
  data,
  mode,
  finalAsk,
  info,
  reduced,
  sticker,
  onReplay,
}: {
  day: DayConfig;
  data: ValentineDayData;
  mode: "preview" | "live";
  finalAsk: string;
  info: ReceiptInfo;
  reduced: boolean;
  sticker: (slotId: string, size: number, style?: CSSProperties) => ReactNode;
  onReplay: () => void;
}) {
  const [yes, setYes] = useState(false);
  const [noIsYes, setNoIsYes] = useState(false);

  const sayYes = () => {
    if (yes) return;
    setYes(true);
    haptic([20, 50, 30]);
    burst({ kind: "hearts", emojis: ["🍫", "🍬", "💗", "🍫", "✨"], count: 40, origin: { x: 0.5, y: 0.45 } });
    window.setTimeout(() => burst({ kind: "confetti", colors: day.theme.confetti, origin: { x: 0.5, y: 0.3 } }), 250);
  };

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: `64px 18px ${mode === "preview" ? 130 : 48}px`, textAlign: "center" }}>
      {/* the ask */}
      <motion.div layout={!reduced} style={{ width: "min(100%, calc(380px * var(--vw-s, 1)))", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <p style={{ margin: 0, font: `600 12.5px ${FONTS.ui}`, letterSpacing: ".22em", textTransform: "uppercase", color: "#E9CDB6" }}>The box is empty. Almost.</p>
        <h2 style={{ margin: "6px 0 4px", font: `700 clamp(34px, 10vw, 46px)/1.08 ${FONTS.serif}`, color: C.cream }}>One more piece?</h2>
        {finalAsk && <p style={{ margin: "0 0 6px", font: `700 23px/1.3 ${FONTS.script}`, color: C.gold, overflowWrap: "anywhere" }}>{finalAsk}</p>}
        <div style={{ position: "relative", width: 170, height: 170, margin: "6px 0 10px" }}>
          <Doily />
          <CupArt color="#E6B85C" edge="#8C6420" size={136} style={{ position: "absolute", left: 17, top: 17 }} />
          <motion.div animate={yes || reduced ? { y: 0 } : { y: [0, -6, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} style={{ position: "absolute", left: 33, top: 30, width: 104, height: 104 }}>
            <ChocoArt shape="heart" choco={CHOCOS[0]} bites={yes ? 1 : 0} size={104} />
          </motion.div>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          {!yes ? (
            <motion.div key="ask" exit={{ opacity: 0, scale: 0.9 }} style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button type="button" onClick={sayYes} style={{ minHeight: 54, padding: "14px 26px", borderRadius: 18, border: 0, background: C.rasp, color: "#fff", font: `700 17px ${FONTS.ui}`, boxShadow: `0 5px 0 ${C.raspDeep}, 0 16px 30px -14px rgba(0,0,0,.6)`, cursor: "pointer" }}>
                Yes, with you 💗
              </button>
              <button
                type="button"
                onPointerEnter={() => setNoIsYes(true)}
                onFocus={() => setNoIsYes(true)}
                onClick={() => (noIsYes ? sayYes() : setNoIsYes(true))}
                style={{ minHeight: 54, minWidth: 96, padding: "14px 20px", borderRadius: 18, border: `1.5px solid ${noIsYes ? C.rasp : "rgba(255,244,230,.25)"}`, background: noIsYes ? "rgba(224,69,123,.18)" : "transparent", color: C.cream, font: `600 16px ${FONTS.ui}`, cursor: "pointer", transition: "all .25s" }}
              >
                {noIsYes ? "Also yes 😌" : "No"}
              </button>
            </motion.div>
          ) : (
            <motion.div key="yes" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 16 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              {sticker("c5-yes", 120)}
              <p style={{ margin: 0, font: `700 clamp(30px, 9vw, 40px)/1.1 ${FONTS.script}`, color: C.cream }}>Happy Chocolate Day, {info.recipient || "you"}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* the receipt + actions */}
      <AnimatePresence>
        {yes && (
          <motion.div
            key="receipt"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -30, scaleY: 0.3 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1], delay: 0.35 }}
            style={{ transformOrigin: "50% 0%", width: "min(100%, calc(340px * var(--vw-s, 1)))", marginTop: 22, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}
          >
            <Receipt info={info} />
            <EndingActions day={day} data={data} mode={mode} onReplay={onReplay} keepsake={() => receiptKeepsake(info)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Doily() {
  const N = 36;
  const pts: string[] = [];
  for (let i = 0; i <= N * 2; i++) {
    const a = (i / (N * 2)) * Math.PI * 2;
    const r = i % 2 ? 76 : 84;
    pts.push(`${(85 + Math.cos(a) * r).toFixed(1)},${(85 + Math.sin(a) * r).toFixed(1)}`);
  }
  return (
    <svg viewBox="0 0 170 170" width="170" height="170" aria-hidden style={{ position: "absolute", inset: 0 }}>
      <polygon points={pts.join(" ")} fill="rgba(255,244,230,.92)" />
      {Array.from({ length: N }, (_, i) => {
        const a = (i / N) * Math.PI * 2;
        return <circle key={i} cx={85 + Math.cos(a) * 70} cy={85 + Math.sin(a) * 70} r="3" fill="rgba(59,33,23,.28)" />;
      })}
      <circle cx="85" cy="85" r="60" fill="none" stroke="rgba(59,33,23,.18)" strokeDasharray="2 4" />
    </svg>
  );
}

const zig = (n: number, top: boolean) => {
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) pts.push(`${(i / n) * 100}% ${top ? (i % 2 ? 0 : 8) : i % 2 ? 100 : 92}px`);
  return pts;
};

function Receipt({ info }: { info: ReceiptInfo }) {
  const rows = receiptRows(info);
  const n = 26;
  const top = zig(n, true);
  const bottom = zig(n, false)
    .map((p) => p.replace(/ (\d+)px$/, (_, v) => ` calc(100% - ${100 - Number(v)}px)`))
    .reverse();
  const clip = `polygon(${[...top, ...bottom].join(", ")})`;
  const dash = <div aria-hidden style={{ borderTop: "1.5px dashed rgba(59,33,23,.35)", margin: "10px 0" }} />;
  return (
    <div
      role="img"
      aria-label={`Box receipt: ${rows.map((r) => `${r[0]} ${r[1]}`).join(", ")}. Total: infinite love.`}
      style={{ width: "100%", padding: "26px 22px 28px", background: "linear-gradient(180deg, #FFFDF8, #F6EEDF)", color: C.cocoa, clipPath: clip, filter: "drop-shadow(0 18px 24px rgba(0,0,0,.45))", textAlign: "left", font: `500 13.5px/1.6 ${FONTS.ui}`, fontVariantNumeric: "tabular-nums" }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ font: `700 24px ${FONTS.script}`, color: C.raspDeep }}>Ek Dabba Pyaar</div>
        <div style={{ font: `600 10.5px ${FONTS.ui}`, letterSpacing: ".22em", color: "#8A6A55" }}>BOX RECEIPT · {info.date}</div>
      </div>
      {dash}
      <Row a="For" b={info.recipient || "you"} strong />
      <Row a="Packed by" b={info.sender || "someone sweet"} />
      {dash}
      {rows.map(([a, b]) => (
        <Row key={a} a={a} b={b} />
      ))}
      {dash}
      <Row a="TOTAL" b="∞ love" strong big />
      <Row a="Paid in" b="hugs (pending)" />
      {dash}
      {info.endLine && <p style={{ margin: "4px 0 8px", textAlign: "center", font: `italic 500 15px/1.45 ${FONTS.serif}`, overflowWrap: "anywhere" }}>“{info.endLine}”</p>}
      <Barcode />
      <p style={{ margin: "6px 0 0", textAlign: "center", font: `500 10.5px ${FONTS.ui}`, letterSpacing: ".1em", color: "#8A6A55" }}>NO REFUNDS · NO RETURNS · ONLY REFILLS</p>
    </div>
  );
}

function Row({ a, b, strong, big }: { a: string; b: string; strong?: boolean; big?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 6, fontWeight: strong ? 700 : 500, fontSize: big ? 16 : undefined }}>
      <span style={{ flex: "none", maxWidth: "62%", overflowWrap: "anywhere" }}>{a}</span>
      <span aria-hidden style={{ flex: 1, borderBottom: "1.5px dotted rgba(59,33,23,.35)", transform: "translateY(-4px)" }} />
      <span style={{ flex: "none", maxWidth: "50%", textAlign: "right", overflowWrap: "anywhere" }}>{b}</span>
    </div>
  );
}

function Barcode() {
  const bars = Array.from({ length: 46 }, (_, i) => 1 + ((i * 7 + 3) % 4));
  return (
    <div aria-hidden style={{ display: "flex", justifyContent: "center", gap: 2, height: 38, marginTop: 6 }}>
      {bars.map((w, i) => (
        <span key={i} style={{ width: w, background: i % 5 === 4 ? "transparent" : C.cocoa }} />
      ))}
    </div>
  );
}

// ── keepsake PNG (1080×1920) ─────────────────────────────────────────────────
export function receiptKeepsake(info: ReceiptInfo): KeepsakeLayout {
  const W = 1080;
  const L = 170;
  const R = W - 170;
  const ink = "#3B2117";
  const soft = "#8A6A55";
  // The receipt is laid out from y = 0, then centred between the header and
  // the tagline so a short receipt never leaves a hole at the bottom.
  const body: KeepsakeItem[] = [];
  let y = 60;
  body.push({ type: "text", text: "Ek Dabba Pyaar", x: W / 2, y, size: 78, face: "script", weight: 700, color: "#A82B58" });
  y += 110;
  body.push({ type: "text", text: `BOX RECEIPT · ${info.date}`, x: W / 2, y, size: 28, weight: 600, color: soft });
  y += 70;
  const dash = () => {
    for (let x = L; x < R; x += 26) body.push({ type: "rect", x, y, w: 14, h: 3, fill: "rgba(59,33,23,.3)" });
    y += 40;
  };
  const row = (a: string, b: string, size = 38, weight = 500, color = ink) => {
    const lines = b.length * size * 0.5 > 540 ? 2 : 1;
    body.push({ type: "text", text: a, x: L, y, size, weight, color, align: "left", maxWidth: 230, maxLines: 1 });
    body.push({ type: "text", text: b, x: R, y, size, weight, color, align: "right", maxWidth: 520, maxLines: 2 });
    y += size * 1.55 + (lines - 1) * size * 1.25;
  };
  const rowWide = (a: string, b: string, size = 38, weight = 500, color = ink) => {
    body.push({ type: "text", text: a, x: L, y, size, weight, color, align: "left", maxWidth: 560, maxLines: 1 });
    body.push({ type: "text", text: b, x: R, y, size, weight, color, align: "right", maxWidth: 300, maxLines: 1 });
    y += size * 1.55;
  };
  dash();
  row("For", info.recipient || "you", 44, 700);
  row("Packed by", info.sender || "someone sweet");
  dash();
  for (const [a, b] of receiptRows(info)) rowWide(a, b);
  dash();
  rowWide("TOTAL", "∞ love", 52, 700, "#A82B58");
  rowWide("Paid in", "hugs (pending)", 34);
  dash();
  if (info.endLine) {
    body.push({ type: "text", text: `“${info.endLine}”`, x: W / 2, y, size: 40, face: "serif", italic: true, color: ink, maxWidth: 700, maxLines: 3, lineHeight: 1.35 });
    y += Math.min(3, Math.ceil((info.endLine.length + 2) / 30)) * 54 + 34;
  }
  for (let i = 0, x = 300; i < 46 && x < 780; i++) {
    const w = 3 + ((i * 7 + 3) % 4) * 3;
    if (i % 5 !== 4) body.push({ type: "rect", x, y, w, h: 90, fill: ink });
    x += w + 5;
  }
  y += 116;
  body.push({ type: "text", text: "NO REFUNDS · NO RETURNS · ONLY REFILLS", x: W / 2, y, size: 24, weight: 600, color: soft });
  y += 70;

  const h = y;
  const top = Math.max(320, Math.round(320 + (1360 - h) / 2));
  const items: KeepsakeItem[] = [
    { type: "emoji", char: "🍫", x: W / 2, y: 150, size: 110 },
    { type: "text", text: "HAPPY CHOCOLATE DAY", x: W / 2, y: 230, size: 36, weight: 600, color: "#E9CDB6" },
    { type: "rect", x: 130, y: top, w: 820, h, radius: 6, fill: "#FFFCF5" },
  ];
  // scalloped receipt edges (background-coloured bites)
  for (let x = 130; x <= 950; x += 41) {
    items.push({ type: "rect", x: x - 14, y: top - 14, w: 28, h: 28, radius: 14, fill: "#3B2117" });
    items.push({ type: "rect", x: x - 14, y: top + h - 14, w: 28, h: 28, radius: 14, fill: "#45231A" });
  }
  for (const it of body) items.push(it.type === "emoji" || it.type === "text" || it.type === "rect" || it.type === "image" ? { ...it, y: it.y + top } : it);
  items.push({ type: "text", text: `${info.pieces} reasons, 0 calories`, x: W / 2, y: 1740, size: 60, face: "script", weight: 700, color: "#FFE7A8" });
  items.push({ type: "text", text: "made on subhsandesh.in", x: W / 2, y: 1846, size: 28, color: "#E9CDB6" });
  return { background: { stops: [[0, "#3B2117"], [0.6, "#3B2117"], [1, "#5A2A1C"]] }, items };
}
