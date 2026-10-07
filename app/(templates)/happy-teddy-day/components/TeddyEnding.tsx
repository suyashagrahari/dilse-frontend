"use client";

// ─── TeddyEnding — "keep me close" + the adoption certificate ────────────────
//
// The teddy dozes on a pink pillow (zzz). Tap to squeeze: squash-and-stretch,
// it wakes up blushing, a heart puff and the next of the sender's squeeze
// lines pops up (a micro-interaction — Hug Day owns hugging). Below: the
// Teddy Adoption Certificate, which is also the 1080×1920 keepsake (the
// dressed teddy is serialised straight from its on-screen SVG).

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FONTS } from "../../_valentine/theme";
import { burst, EndingActions, haptic, type KeepsakeItem, type KeepsakeLayout } from "../../_valentine/kit";
import type { DayConfig, ValentineDayData } from "../../_valentine/types";
import { FURS, T, Teddy, labelOf, type Fur, type ItemId } from "./teddyArt";
import { tsfx } from "./teddySfx";

const DEFAULT_LINES = ["Squeezed! Ek jaadu ki jhappi delivered.", "Miss you more than this teddy is fluffy.", "Okay one more. And one more. And…"];

export default function TeddyEnding({
  day,
  data,
  mode,
  teddyName,
  fur,
  worn,
  squeezeLines,
  date,
  reduced,
  sound,
  sticker,
  onReplay,
}: {
  day: DayConfig;
  data: ValentineDayData;
  mode: "preview" | "live";
  teddyName: string;
  fur: Fur;
  worn: ItemId[];
  squeezeLines: string[];
  date: string;
  reduced: boolean;
  sound: boolean;
  sticker: (id: string, size: number, style?: CSSProperties) => ReactNode;
  onReplay: () => void;
}) {
  const lines = squeezeLines.length ? squeezeLines : DEFAULT_LINES;
  const [squeezes, setSqueezes] = useState(0);
  const teddyRef = useRef<HTMLButtonElement>(null);
  const certRef = useRef<SVGSVGElement>(null);
  const awake = squeezes > 0;

  const squeeze = () => {
    setSqueezes((n) => n + 1);
    haptic([12, 30, 12]);
    tsfx.squeak(sound);
    const r = teddyRef.current?.getBoundingClientRect();
    if (r) burst({ kind: "hearts", count: 14, spread: 0.22, origin: { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height * 0.35) / window.innerHeight } });
  };

  const keepsake = (): KeepsakeLayout => certificateKeepsake({ teddyName, fur, worn, recipient: data.recipientName, sender: data.senderName, date, squeezes, endLine: data.endLine, teddySvg: certRef.current });

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: `58px 16px ${mode === "preview" ? 130 : 48}px`, textAlign: "center" }}>
      <p style={{ margin: 0, font: `600 12.5px ${FONTS.ui}`, letterSpacing: ".2em", textTransform: "uppercase", color: T.lilac }}>Happy Teddy Day, {data.recipientName || "you"}</p>
      <h2 style={{ margin: "4px 0 2px", font: `700 clamp(36px, 11vw, 48px)/1.1 ${FONTS.script}`, color: T.cream }}>Keep me close</h2>
      <p style={{ margin: 0, font: `400 15.5px/1.45 ${FONTS.ui}`, color: "#DCCFEC" }}>When I&apos;m not there, squeeze this one.</p>

      {/* pillow + teddy */}
      <div style={{ position: "relative", width: 300, height: 290, marginTop: 6 }}>
        <div style={{ position: "absolute", right: -10, top: 120, zIndex: 3 }}>{sticker("t5-sleep", 70)}</div>
        <Pillow />
        <AnimatePresence mode="wait">
          {awake && (
            <motion.div
              key={squeezes}
              initial={{ opacity: 0, y: 10, scale: 0.7 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
              aria-live="polite"
              style={{ position: "absolute", left: "50%", top: -6, width: "min(80vw, 280px)", marginLeft: "calc(min(80vw, 280px) / -2)", zIndex: 3 }}
            >
              <div style={{ position: "relative", padding: "9px 14px", borderRadius: 18, background: T.cream, color: T.ink, font: `600 14.5px/1.4 ${FONTS.ui}`, boxShadow: "0 12px 24px -12px rgba(0,0,0,.6)", overflowWrap: "break-word" }}>
                {lines[(squeezes - 1) % lines.length]}
                <span aria-hidden style={{ position: "absolute", left: "50%", bottom: -7, width: 14, height: 14, marginLeft: -7, background: T.cream, transform: "rotate(45deg)", borderRadius: 3 }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {!awake && !reduced && (
          <span aria-hidden style={{ position: "absolute", left: "58%", top: 70, fontSize: 22, color: T.lilac, zIndex: 3 }}>
            {[0, 1, 2].map((k) => (
              <span key={k} className="td-zzz" style={{ position: "absolute", left: k * 8, font: `700 ${14 + k * 5}px ${FONTS.ui}`, animationDelay: `${k * 0.9}s` }}>
                z
              </span>
            ))}
          </span>
        )}
        <motion.button
          ref={teddyRef}
          type="button"
          onClick={squeeze}
          aria-label={`Squeeze ${teddyName}`}
          key={squeezes}
          initial={false}
          animate={squeezes && !reduced ? { scaleX: [1, 1.16, 0.94, 1.03, 1], scaleY: [1, 0.84, 1.07, 0.98, 1] } : {}}
          transition={{ duration: 0.55, ease: "easeOut" }}
          style={{ position: "absolute", left: "50%", bottom: 34, width: 190, marginLeft: -95, border: 0, padding: 0, background: "transparent", cursor: "pointer", transformOrigin: "50% 100%", zIndex: 2 }}
        >
          <div className={reduced ? undefined : "td-breathe"}>
            <Teddy fur={fur} worn={worn} pose="sit" mood={awake ? "happy" : "sleepy"} blush={awake} size={190} />
          </div>
        </motion.button>
      </div>
      <p style={{ margin: "2px 0 0", minHeight: 20, font: `600 13.5px ${FONTS.ui}`, color: T.pink }}>{squeezes ? `Squeezed ${squeezes}× 💗 ${squeezes >= 5 ? "(he loves it)" : ""}` : `Tap ${teddyName} to squeeze`}</p>

      {/* certificate */}
      <motion.div initial={reduced ? false : { opacity: 0, y: 30, rotate: -2 }} whileInView={{ opacity: 1, y: 0, rotate: -1 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 120, damping: 16 }} style={{ width: "min(100%, 370px)", marginTop: 24 }}>
        <Certificate teddyName={teddyName} fur={fur} worn={worn} recipient={data.recipientName} sender={data.senderName} date={date} squeezes={squeezes} svgRef={certRef} />
      </motion.div>
      {data.endLine && <p style={{ margin: "22px 0 0", maxWidth: 360, font: `italic 400 18px/1.5 ${FONTS.serif}`, color: T.cream, overflowWrap: "break-word" }}>{data.endLine}</p>}
      <p style={{ margin: "6px 0 0", font: `400 22px ${FONTS.script}`, color: "#DCCFEC" }}>— {data.senderName}</p>
      <EndingActions day={day} data={data} mode={mode} onReplay={onReplay} keepsake={keepsake} style={{ marginTop: 18 }} />
    </div>
  );
}

function Pillow() {
  return (
    <svg aria-hidden viewBox="0 0 300 120" width="300" height="120" style={{ position: "absolute", left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id="td-pillow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD3E4" />
          <stop offset="1" stopColor="#F49DC0" />
        </linearGradient>
      </defs>
      <ellipse cx="150" cy="112" rx="140" ry="8" fill="rgba(0,0,0,.25)" />
      <path d="M20 44 Q14 30 30 26 Q150 8 270 26 Q286 30 280 44 Q290 80 280 98 Q286 110 270 108 Q150 120 30 108 Q14 110 20 98 Q10 80 20 44 Z" fill="url(#td-pillow)" />
      <path d="M34 36 Q150 20 266 36 M34 98 Q150 110 266 98" stroke="#fff" strokeWidth="2" strokeDasharray="4 5" fill="none" opacity=".8" />
      {[
        [22, 30],
        [278, 30],
        [22, 104],
        [278, 104],
      ].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="6" fill="#FF8FB8" />
      ))}
      <path d="M140 64 C132 58 128 55 128 50 C128 46 131 44 134 44 C137 44 139 46 140 48 C141 46 143 44 146 44 C149 44 152 46 152 50 C152 55 148 58 140 64 Z" fill="#fff" opacity=".7" />
    </svg>
  );
}

function Certificate({ teddyName, fur, worn, recipient, sender, date, squeezes, svgRef }: { teddyName: string; fur: Fur; worn: ItemId[]; recipient: string; sender: string; date: string; squeezes: number; svgRef: React.Ref<SVGSVGElement> }) {
  const outfit = worn.length ? worn.map((w) => labelOf(w)).join(", ") : "just fur and love";
  return (
    <div style={{ position: "relative", padding: 10, borderRadius: 18, background: "repeating-linear-gradient(45deg, #FFC8DD 0 8px, #CDB4DB 8px 16px)", boxShadow: "0 30px 50px -24px rgba(0,0,0,.7)" }}>
      <div style={{ position: "relative", padding: "20px 18px 18px", borderRadius: 10, background: T.cream, color: T.ink, outline: "1.5px solid rgba(217,98,143,.45)", outlineOffset: -7 }}>
        <p style={{ margin: 0, font: `700 11px ${FONTS.ui}`, letterSpacing: ".3em", color: "#9B7FB2" }}>OFFICIAL · TEDDY CATCHER</p>
        <h3 style={{ margin: "4px 0 6px", font: `700 23px/1.15 ${FONTS.serif}` }}>Certificate of Adoption</h3>
        <div style={{ width: 118, height: 118, margin: "4px auto 2px", borderRadius: "50%", background: "radial-gradient(circle, #FFF1B5, #FFE3EE 70%)", display: "grid", placeItems: "center", boxShadow: "inset 0 0 0 3px #fff, 0 0 0 2px #FFC8DD" }}>
          <Teddy ref={svgRef} fur={fur} worn={worn} pose="cheer" mood="happy" blink={false} size={98} />
        </div>
        <p style={{ margin: "6px 0 0", font: `500 13px ${FONTS.ui}`, color: "#7A6070" }}>This certifies that</p>
        <p style={{ margin: 0, font: `700 34px/1.1 ${FONTS.script}`, color: "#D9628F", overflowWrap: "break-word" }}>{teddyName}</p>
        <p style={{ margin: "2px 0 0", font: `500 13px/1.45 ${FONTS.ui}`, color: "#7A6070" }}>a {FURS[fur].label} teddy of exceptional fluffiness, has been officially adopted by</p>
        <p style={{ margin: "2px 0 0", font: `700 30px/1.1 ${FONTS.script}`, color: T.ink, overflowWrap: "break-word" }}>{recipient || "you"}</p>
        <p style={{ margin: "4px 0 0", font: `500 12.5px/1.45 ${FONTS.ui}`, color: "#7A6070", overflowWrap: "break-word" }}>won fair and square from the claw machine · gifted by {sender || "someone sweet"}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 12, textAlign: "left", font: `500 12px/1.4 ${FONTS.ui}` }}>
          <Field k="Wearing" v={outfit} />
          <Field k="Date" v={date} />
          <Field k="Squeezes" v={squeezes ? String(squeezes) : "pending"} />
          <Field k="Returns" v="never" />
        </div>
        <div style={{ position: "absolute", right: 12, bottom: 62, width: 74, height: 74, borderRadius: 74, border: "2.5px solid rgba(217,98,143,.75)", display: "grid", placeItems: "center", transform: "rotate(-14deg)", font: `800 9px/1.2 ${FONTS.ui}`, letterSpacing: ".08em", color: "rgba(217,98,143,.9)", textAlign: "center", background: "rgba(255,200,221,.25)" }}>
          OFFICIALLY
          <br />
          SQUEEZED
          <br />♥
        </div>
      </div>
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ padding: "6px 8px", borderRadius: 8, background: "#FFF1F6", overflowWrap: "break-word" }}>
      <div style={{ font: `700 9.5px ${FONTS.ui}`, letterSpacing: ".14em", color: "#9B7FB2", textTransform: "uppercase" }}>{k}</div>
      {v}
    </div>
  );
}

// ── keepsake (1080×1920) ─────────────────────────────────────────────────────
function svgDataUrl(svg: SVGSVGElement | null): string | null {
  if (!svg || typeof XMLSerializer === "undefined") return null;
  try {
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", "600");
    clone.setAttribute("height", "698");
    clone.removeAttribute("style");
    clone.removeAttribute("class");
    clone.querySelectorAll("[class]").forEach((n) => n.removeAttribute("class"));
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(clone))}`;
  } catch {
    return null;
  }
}

/** Script names shrink to fit one line (~0.45 em per glyph, 740 px box). */
const fit = (t: string, max: number) => Math.min(max, Math.floor(740 / (Math.max(1, t.length) * 0.46)));

export function certificateKeepsake(o: { teddyName: string; fur: Fur; worn: ItemId[]; recipient: string; sender: string; date: string; squeezes: number; endLine: string; teddySvg: SVGSVGElement | null }): KeepsakeLayout {
  const W = 1080;
  const ink = "#4A3326";
  const soft = "#7A6070";
  const pinkDeep = "#D9628F";
  const items: KeepsakeItem[] = [
    { type: "text", text: "HAPPY TEDDY DAY", x: W / 2, y: 100, size: 38, weight: 700, color: "#FFC8DD" },
    // stripy border + paper
    { type: "rect", x: 90, y: 180, w: 900, h: 1500, radius: 44, fill: "#FFC8DD" },
    { type: "rect", x: 112, y: 202, w: 856, h: 1456, radius: 30, fill: "#CDB4DB" },
    { type: "rect", x: 128, y: 218, w: 824, h: 1424, radius: 24, fill: "#FFF8F0" },
    { type: "rect", x: 150, y: 240, w: 780, h: 1380, radius: 16, stroke: "rgba(217,98,143,.5)", lineWidth: 3 },
    { type: "text", text: "OFFICIAL · TEDDY CATCHER", x: W / 2, y: 290, size: 28, weight: 700, color: "#9B7FB2" },
    { type: "text", text: "Certificate of Adoption", x: W / 2, y: 340, size: 66, face: "serif", weight: 700, color: ink },
    { type: "rect", x: W / 2 - 170, y: 440, w: 340, h: 340, radius: 170, fill: "#FFF1B5" },
    { type: "rect", x: W / 2 - 158, y: 452, w: 316, h: 316, radius: 158, fill: "#FFE3EE" },
  ];
  const url = svgDataUrl(o.teddySvg);
  if (url) items.push({ type: "image", src: url, x: W / 2 - 132, y: 462, w: 264, h: 307 });
  else items.push({ type: "emoji", char: "🧸", x: W / 2, y: 610, size: 200 });
  // stamp
  items.push({ type: "rect", x: 760, y: 470, w: 150, h: 150, radius: 75, stroke: "rgba(217,98,143,.8)", lineWidth: 5, fill: "rgba(255,200,221,.3)" });
  items.push({ type: "text", text: "OFFICIALLY\nSQUEEZED\n♥", x: 835, y: 504, size: 20, weight: 800, color: pinkDeep, lineHeight: 1.3 });
  let y = 810;
  items.push({ type: "text", text: "This certifies that", x: W / 2, y, size: 34, color: soft });
  y += 48;
  items.push({ type: "text", text: o.teddyName, x: W / 2, y: y + (96 - fit(o.teddyName, 96)) / 2, size: fit(o.teddyName, 96), face: "script", weight: 700, color: pinkDeep, maxWidth: 740, maxLines: 1 });
  y += 124;
  items.push({ type: "text", text: `a ${FURS[o.fur].label} teddy of exceptional fluffiness,\nhas been officially adopted by`, x: W / 2, y, size: 32, color: soft, lineHeight: 1.4 });
  y += 100;
  items.push({ type: "text", text: o.recipient || "you", x: W / 2, y: y + (86 - fit(o.recipient || "you", 86)) / 2, size: fit(o.recipient || "you", 86), face: "script", weight: 700, color: ink, maxWidth: 740, maxLines: 1 });
  y += 116;
  items.push({ type: "text", text: `won fair and square · gifted by ${o.sender || "someone sweet"}`, x: W / 2, y, size: 30, color: soft, maxWidth: 740, maxLines: 2 });
  y += 90;
  const outfit = o.worn.length ? o.worn.map((w) => labelOf(w)).join(", ") : "just fur and love";
  const field = (x: number, yy: number, k: string, v: string, h = 100) => {
    items.push({ type: "rect", x, y: yy, w: 350, h, radius: 18, fill: "#FFF1F6" });
    items.push({ type: "text", text: k.toUpperCase(), x: x + 24, y: yy + 14, size: 22, weight: 700, color: "#9B7FB2", align: "left" });
    items.push({ type: "text", text: v, x: x + 24, y: yy + 46, size: 28, color: ink, align: "left", maxWidth: 310, maxLines: 2, lineHeight: 1.2 });
  };
  field(180, y, "Wearing", outfit, 120);
  field(550, y, "Date", o.date, 120);
  field(180, y + 134, "Squeezes", o.squeezes ? String(o.squeezes) : "pending");
  field(550, y + 134, "Returns", "never");
  y += 270;
  if (o.endLine) items.push({ type: "text", text: `“${o.endLine}”`, x: W / 2, y, size: 30, face: "serif", italic: true, color: ink, maxWidth: 720, maxLines: 2, lineHeight: 1.35 });
  items.push({ type: "text", text: "Keep me close 🧸", x: W / 2, y: 1730, size: 64, face: "script", weight: 700, color: "#FFF1B5" });
  items.push({ type: "text", text: "made on subhsandesh.in", x: W / 2, y: 1846, size: 28, color: "#DCCFEC" });
  return { background: { stops: [[0, "#2D2440"], [0.6, "#44365F"], [1, "#5A4677"]] }, items };
}
