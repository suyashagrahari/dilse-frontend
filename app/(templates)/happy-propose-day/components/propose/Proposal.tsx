"use client";

// Sections 5–9 of Propose Day:
//   Speech   — the parchment scroll unrolls out of the lid; the letter is typed like a speech,
//              the shayari lands as a pull-quote; the kneeling sticker sits in the corner
//   Question — scratch the gold foil (gold dust while scratching) to reveal the question;
//              then the runaway / shrinking No (sender's lines) and a Yes that keeps growing
//   Finale   — night turns to blush, fireworks, "{Name} said YES", the proposal certificate
//              ("said YES after N dodges"), keepsake PNG + reply/replay/make one

import { useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FONTS } from "../../../_valentine/theme";
import { EndingActions, RunawayNo, ScratchCanvas, Sticker, Typewriter, type KeepsakeLayout } from "../../../_valentine/kit";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import type { ProposeExtras } from "../../../_valentine/days/happy-propose-day";
import { Ring, ringDataUrl } from "./RingArt";
import { GOLD, GOLD_SOFT, PEARL, PLUM, goldBtn, kicker } from "./ui";

interface Props {
  day: DayConfig;
  data: ValentineDayData<ProposeExtras>;
  reduced: boolean;
  onNext: () => void;
}

const DEFAULT_Q = "Will you be mine, forever? 💍";

// ─── Speech ──────────────────────────────────────────────────────────────────

function Roller() {
  return (
    <div aria-hidden style={{ position: "relative", height: 22, margin: "0 -14px", borderRadius: 11, background: "linear-gradient(180deg, #F3E2C2, #D9BC8A 45%, #A98552 80%, #C9A66C)", boxShadow: "0 6px 12px -6px rgba(0,0,0,.6)", zIndex: 2 }}>
      <span style={{ position: "absolute", left: -8, top: 3, width: 14, height: 16, borderRadius: 6, background: `linear-gradient(180deg, ${GOLD_SOFT}, ${GOLD} 60%, #8E6A2C)` }} />
      <span style={{ position: "absolute", right: -8, top: 3, width: 14, height: 16, borderRadius: 6, background: `linear-gradient(180deg, ${GOLD_SOFT}, ${GOLD} 60%, #8E6A2C)` }} />
    </div>
  );
}

export function Speech({ day, data, reduced, onNext }: Props) {
  const x = data.extras;
  const [unrolled, setUnrolled] = useState(reduced);
  const [done, setDone] = useState(false);
  const slot = day.gifSlots[2];
  return (
    <>
      <header style={{ display: "grid", gap: 6, justifyItems: "center" }}>
        <p style={kicker}>The speech</p>
        <h2 style={{ margin: 0, font: `italic 700 26px/1.2 ${FONTS.serif}`, color: PEARL }}>{data.senderName ? `${data.senderName} clears their throat…` : "Ahem…"}</h2>
      </header>
      <div style={{ position: "relative", width: "min(100%, calc(420px * var(--vw-s, 1)))" }}>
        <Roller />
        <motion.div
          initial={reduced ? false : { height: 0 }}
          animate={{ height: "auto" }}
          transition={{ duration: 1.3, ease: [0.45, 0, 0.2, 1] }}
          onAnimationComplete={() => setUnrolled(true)}
          style={{ overflow: "hidden", margin: "-10px 0", position: "relative", zIndex: 1 }}
        >
          <div
            style={{
              maxHeight: "min(52dvh, 480px)",
              overflowY: "auto",
              padding: "26px 22px 26px",
              background: "radial-gradient(120% 80% at 50% 0%, #FFF8EC, #F4E4C8 70%, #EAD3AC)",
              boxShadow: "inset 0 10px 16px -12px rgba(90,50,20,.5), inset 0 -10px 16px -12px rgba(90,50,20,.5)",
              color: PLUM,
              textAlign: "left",
              font: `400 17px/1.7 ${FONTS.serif}`,
              overscrollBehavior: "contain",
            }}
          >
            <Typewriter text={data.letter} speed={38} start={unrolled} onDone={() => setDone(true)} caretColor="#A8823A" />
            {done && x.shayari && (
              <motion.blockquote
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ margin: "18px 0 4px", padding: "12px 16px", borderLeft: `3px solid ${GOLD}`, background: "rgba(230,194,122,.16)", borderRadius: "0 10px 10px 0", whiteSpace: "pre-line", font: `italic 500 16px/1.55 ${FONTS.serif}`, color: "#5A2440", overflowWrap: "anywhere" }}
              >
                {x.shayari}
              </motion.blockquote>
            )}
          </div>
        </motion.div>
        <Roller />
        {slot && (
          <div style={{ position: "absolute", left: -18, bottom: -30, zIndex: 3 }}>
            <Sticker slug={day.slug} slot={slot} value={data.gifs[slot.id]} size={80} />
          </div>
        )}
      </div>
      <div style={{ minHeight: 64, display: "grid", alignContent: "start", justifyItems: "center", marginTop: 14 }}>
        {done ? (
          <motion.button initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} type="button" onClick={onNext} style={goldBtn}>
            I&apos;m ready for the question 💛
          </motion.button>
        ) : (
          <p style={{ margin: 0, font: `400 13.5px ${FONTS.ui}`, color: "#E8CFC9" }}>{unrolled ? "Tap the scroll to hear it all at once" : "unrolling…"}</p>
        )}
      </div>
    </>
  );
}

// ─── Question ────────────────────────────────────────────────────────────────

function goldDust(host: HTMLElement, x: number, y: number) {
  const r = host.getBoundingClientRect();
  for (let i = 0; i < 3; i++) {
    const el = document.createElement("span");
    const s = 2 + Math.random() * 3;
    el.style.cssText = `position:absolute;left:${x - r.left}px;top:${y - r.top}px;width:${s}px;height:${s}px;border-radius:50%;background:${i % 2 ? GOLD : GOLD_SOFT};box-shadow:0 0 6px ${GOLD};pointer-events:none;z-index:5`;
    host.appendChild(el);
    const a = el.animate(
      [
        { transform: "translate(0,0)", opacity: 1 },
        { transform: `translate(${(Math.random() - 0.5) * 50}px, ${30 + Math.random() * 50}px)`, opacity: 0 },
      ],
      { duration: 700 + Math.random() * 400, easing: "cubic-bezier(.2,.7,.3,1)" },
    );
    a.onfinish = () => el.remove();
  }
}

export function Question({ day, data, reduced, onYes }: Omit<Props, "onNext"> & { onYes: (dodges: number) => void }) {
  const x = data.extras;
  const q = x.question?.trim() || DEFAULT_Q;
  const [revealed, setRevealed] = useState(false);
  const [dodges, setDodges] = useState(0);
  const hostRef = useRef<HTMLDivElement>(null);
  const down = useRef(false);
  const lastDust = useRef(0);
  const please = day.gifSlots[3];
  const marry = /marry/i.test(q);

  return (
    <>
      <header style={{ display: "grid", gap: 6, justifyItems: "center" }}>
        <p style={kicker}>One question</p>
        <h2 style={{ margin: 0, font: `italic 700 26px/1.2 ${FONTS.serif}`, color: PEARL }}>{revealed ? "So…?" : "Scratch the gold, gently"}</h2>
      </header>
      <div
        ref={hostRef}
        onPointerDown={() => (down.current = true)}
        onPointerUp={() => (down.current = false)}
        onPointerLeave={() => (down.current = false)}
        onPointerMove={(e) => {
          if (!down.current || revealed || reduced || !hostRef.current) return;
          const t = performance.now();
          if (t - lastDust.current < 45) return;
          lastDust.current = t;
          goldDust(hostRef.current, e.clientX, e.clientY);
        }}
        style={{ position: "relative", width: "min(100%, calc(380px * var(--vw-s, 1)))" }}
      >
        <ScratchCanvas
          height={176}
          cover={["#C99B4E", "#F6E3B4"]}
          label="Scratch gently 💛"
          labelColor="rgba(60,30,10,.7)"
          brush={24}
          onReveal={() => setRevealed(true)}
          radius={22}
          style={{ width: "100%", background: `linear-gradient(170deg, ${PEARL}, #F8E9D6)`, boxShadow: revealed ? `0 0 0 2px ${GOLD}, 0 0 50px rgba(230,194,122,.55)` : "0 20px 40px -20px rgba(0,0,0,.8)", transition: "box-shadow .8s" }}
        >
          <div style={{ height: "100%", display: "grid", placeItems: "center", padding: "14px 18px", boxSizing: "border-box" }}>
            <p
              style={{
                margin: 0,
                font: `700 ${q.length > 40 ? 23 : 27}px/1.25 ${FONTS.serif}`,
                color: PLUM,
                overflowWrap: "anywhere",
                ...(marry ? { color: "#C8102E", textShadow: "0 0 10px rgba(255,120,150,.6), 0 0 2px #fff" } : null),
              }}
            >
              {q}
            </p>
          </div>
        </ScratchCanvas>
      </div>

      <div style={{ width: "100%", maxWidth: 400, minHeight: 300, display: "grid", alignContent: "start", justifyItems: "center", gap: 8 }}>
        {revealed && (
          <motion.div initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ width: "100%", display: "grid", justifyItems: "center" }}>
            <div style={{ height: 70, display: "grid", placeItems: "center" }}>
              {dodges >= 3 && please ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 14 }} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Sticker slug={day.slug} slot={please} value={data.gifs[please.id]} size={64} eager />
                  <span style={{ font: `600 15px ${FONTS.ui}`, color: GOLD_SOFT }}>pretty please? 🥺</span>
                </motion.div>
              ) : (
                <span style={{ font: `400 14px ${FONTS.ui}`, color: "#E8CFC9" }}>{dodges ? `Nice try. (${dodges})` : "Take your time. (Not too much.)"}</span>
              )}
            </div>
            <RunawayNo
              yesLabel="Yes 💍"
              noLines={x.noLines}
              mode={x.noMode}
              height={230}
              onDodge={setDodges}
              surrenderLabel="Okay fine, YES 💍"
              onYes={onYes}
              yesStyle={{ background: `linear-gradient(180deg, ${GOLD_SOFT}, ${GOLD} 55%, #C99B4E)`, color: PLUM, boxShadow: "0 5px 0 #8E6A2C, 0 0 30px rgba(230,194,122,.5)", fontSize: 18 }}
              noStyle={{ background: "rgba(255,246,236,.92)", color: "#5A2440" }}
            />
          </motion.div>
        )}
      </div>
    </>
  );
}

// ─── Finale ──────────────────────────────────────────────────────────────────

const BLUSH_INK = "#4A1424";

export function stamp(at: Date) {
  const date = at.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const time = at.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase();
  return { date, time };
}

export function dodgeLine(n: number) {
  return n > 0 ? `said YES after ${n} ${n === 1 ? "dodge" : "dodges"} 💍` : "said YES — first try 💍";
}

export function certificateKeepsake(data: ValentineDayData<ProposeExtras>, dodges: number, at: Date): KeepsakeLayout {
  const W = 1080;
  const { date, time } = stamp(at);
  const r = data.recipientName || "You";
  const s = data.senderName || "me";
  return {
    background: { stops: [[0, "#FFF1F3"], [0.55, "#FFE4EA"], [1, "#F9CFD8"]] },
    items: [
      { type: "rect", x: 70, y: 110, w: 940, h: 1700, radius: 30, fill: "#FFFBF5", stroke: "#C99B4E", lineWidth: 6 },
      { type: "rect", x: 96, y: 136, w: 888, h: 1648, radius: 22, stroke: "rgba(201,155,78,.55)", lineWidth: 2 },
      { type: "text", text: "CERTIFICATE OF PROPOSAL", x: W / 2, y: 230, size: 40, weight: 700, color: "#A8823A", face: "ui" },
      { type: "text", text: "This is to certify that", x: W / 2, y: 330, size: 40, face: "serif", italic: true, color: "#8A5563" },
      { type: "text", text: r, x: W / 2, y: 400, size: 130, face: "script", weight: 700, color: BLUSH_INK, maxWidth: 860, maxLines: 1 },
      { type: "text", text: `said YES to ${s}`, x: W / 2, y: 580, size: 56, face: "serif", weight: 700, color: BLUSH_INK, maxWidth: 860, maxLines: 2 },
      { type: "image", src: ringDataUrl(data.extras.ringStyle, data.extras.stoneColor), x: W / 2 - 170, y: 700, w: 340, h: 368 },
      { type: "text", text: `“${data.extras.question?.trim() || DEFAULT_Q}”`, x: W / 2, y: 1120, size: 46, face: "serif", italic: true, color: BLUSH_INK, maxWidth: 840, maxLines: 2 },
      { type: "text", text: `on ${date}, at ${time}`, x: W / 2, y: 1290, size: 38, face: "ui", color: "#8A5563" },
      { type: "rect", x: W / 2 - 330, y: 1370, w: 660, h: 84, radius: 42, fill: "#FFE4EA" },
      { type: "text", text: dodges > 0 ? `after dodging “No” ${dodges} ${dodges === 1 ? "time" : "times"}` : "without dodging “No” even once", x: W / 2, y: 1392, size: 36, weight: 700, color: "#C8102E", face: "ui" },
      { type: "text", text: "Witnessed by: one very nervous heart", x: W / 2, y: 1530, size: 34, face: "serif", italic: true, color: "#8A5563" },
      { type: "text", text: `— ${s}`, x: W / 2, y: 1620, size: 60, face: "script", color: BLUSH_INK, maxWidth: 860, maxLines: 1 },
      { type: "text", text: "made on subhsandesh.in", x: W / 2, y: 1730, size: 26, color: "#A07080", face: "ui" },
    ],
  };
}

function Rosette({ id }: { id: string }) {
  return (
    <svg viewBox="-40 -40 80 80" width={72} height={72} aria-hidden style={{ display: "block" }}>
      <defs>
        <radialGradient id={`${id}-ro`} cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor={GOLD_SOFT} />
          <stop offset=".7" stopColor={GOLD} />
          <stop offset="1" stopColor="#8E6A2C" />
        </radialGradient>
      </defs>
      <path d="M-14 22 L-22 40 L-12 36 L-6 44 L0 26 Z M14 22 L22 40 L12 36 L6 44 L0 26 Z" fill="#C8102E" />
      {Array.from({ length: 16 }, (_, i) => (
        <circle key={i} cx={Math.cos((i / 16) * Math.PI * 2) * 24} cy={Math.sin((i / 16) * Math.PI * 2) * 24} r={7} fill={`url(#${id}-ro)`} />
      ))}
      <circle r={24} fill={`url(#${id}-ro)`} stroke="#8E6A2C" strokeWidth={1} />
      <circle r={18} fill="none" stroke="#fff" strokeOpacity=".5" strokeDasharray="2 3" />
      <text y={2} textAnchor="middle" dominantBaseline="middle" style={{ font: `700 9px ${FONTS.ui}`, letterSpacing: ".1em" }} fill="#5A3A10">
        YES
      </text>
    </svg>
  );
}

export function Finale({ day, data, mode, reduced, dodges, at, onReplay, onReached }: Omit<Props, "onNext"> & { mode: "preview" | "live"; dodges: number; at: Date; onReplay: () => void; onReached: () => void }) {
  const x = data.extras;
  const id = useId().replace(/:/g, "");
  const { date, time } = stamp(at);
  const slot = day.gifSlots[4];
  const r = data.recipientName || "You";
  useEffect(() => {
    onReached();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      {slot && <Sticker slug={day.slug} slot={slot} value={data.gifs[slot.id]} size={120} eager />}
      <p style={{ ...kicker, color: "#A8823A" }}>Propose Day · {date}</p>
      <h1 style={{ margin: 0, font: `700 ${r.length > 14 ? 40 : 52}px/1.05 ${FONTS.script}`, color: BLUSH_INK, overflowWrap: "anywhere", maxWidth: "100%" }}>{r} said YES!</h1>
      <p style={{ margin: 0, maxWidth: 360, font: `italic 500 19px/1.45 ${FONTS.serif}`, color: BLUSH_INK, overflowWrap: "anywhere" }}>{x.afterYes?.trim() || "You just made me the happiest person alive."}</p>

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 30, rotate: -2, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, rotate: -1, scale: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 120, damping: 16 }}
        style={{
          position: "relative",
          width: "min(100%, calc(360px * var(--vw-s, 1)))",
          padding: "22px 20px 20px",
          background: "#FFFBF5",
          borderRadius: 16,
          border: "3px double #C99B4E",
          boxShadow: "0 30px 50px -26px rgba(122,10,30,.55), inset 0 0 0 6px #FFFBF5, inset 0 0 0 7px rgba(201,155,78,.45)",
          display: "grid",
          gap: 6,
          justifyItems: "center",
          color: BLUSH_INK,
        }}
      >
        <span style={{ font: `700 12px ${FONTS.ui}`, letterSpacing: ".24em", color: "#A8823A" }}>CERTIFICATE OF PROPOSAL</span>
        <span style={{ font: `italic 400 15px ${FONTS.serif}`, color: "#8A5563" }}>This is to certify that</span>
        <span style={{ font: `700 34px/1.1 ${FONTS.script}`, overflowWrap: "anywhere" }}>{r}</span>
        <span style={{ font: `700 18px ${FONTS.serif}`, overflowWrap: "anywhere" }}>said YES to {data.senderName || "me"}</span>
        <Ring style={x.ringStyle} stone={x.stoneColor} id={id} size={70} sparkle={!reduced} />
        <span style={{ font: `400 13px ${FONTS.ui}`, color: "#8A5563" }}>
          on {date}, at {time}
        </span>
        <span style={{ padding: "6px 14px", borderRadius: 99, background: "#FFE4EA", font: `700 14px ${FONTS.ui}`, color: "#C8102E" }}>
          {dodges > 0 ? `after dodging “No” ${dodges} ${dodges === 1 ? "time" : "times"}` : "without dodging “No” even once"}
        </span>
        <span style={{ font: `italic 400 13px ${FONTS.serif}`, color: "#8A5563" }}>Witnessed by: one very nervous heart</span>
        <div style={{ position: "absolute", right: -14, bottom: -18, transform: "rotate(12deg)" }}>
          <Rosette id={id} />
        </div>
      </motion.div>

      {data.endLine && <p style={{ margin: "8px 0 0", maxWidth: 340, font: `italic 500 17px/1.45 ${FONTS.serif}`, color: BLUSH_INK, overflowWrap: "anywhere" }}>{data.endLine}</p>}
      <p style={{ margin: 0, font: `400 24px ${FONTS.script}`, color: "#8A5563" }}>— {data.senderName}</p>
      <EndingActions day={day} data={data} mode={mode} onReplay={onReplay} keepsake={() => certificateKeepsake(data, dodges, at)} style={{ marginTop: 4 }} />
    </>
  );
}
