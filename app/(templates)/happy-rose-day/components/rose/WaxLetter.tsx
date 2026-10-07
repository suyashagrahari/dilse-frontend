"use client";

// Section 5: the letter. A blush envelope with a pressed rose tucked under
// the flap and a wax seal (rose-coloured, the sender's initial). Tap the
// seal → it cracks in two and falls → the flap swings open → the paper slides
// up → the letter writes itself in ink, word by word, paragraph by paragraph
// (the paper scrolls along). "Show it all" skips; reduced motion shows it all.
// The optional shayari sits in a pressed-paper cartouche above the signature.

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FONTS, VW } from "../../../_valentine/theme";
import { Sticker, haptic } from "../../../_valentine/kit";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import type { RoseExtras } from "../../../_valentine/days/happy-rose-day";
import { GradDefs, StemRose, roseGrads, shadesFor, type RoseShades } from "./art";
import { EASE, ghostBtn, kicker, primaryBtn } from "./ui";

interface Props {
  day: DayConfig;
  data: ValentineDayData<RoseExtras>;
  reduced: boolean;
  onNext: () => void;
}

type Phase = "sealed" | "cracking" | "opening" | "reading";

const EW = 340;
const EH = 226;

// A deckled (torn) top and bottom edge, deterministic.
const DECKLE = (() => {
  const pts: string[] = [];
  const n = 26;
  for (let i = 0; i <= n; i++) pts.push(`${((i / n) * 100).toFixed(2)}% ${(i % 2 ? 0.7 : 0) + ((i * 7) % 5) * 0.18}%`);
  for (let i = n; i >= 0; i--) pts.push(`${((i / n) * 100).toFixed(2)}% ${100 - ((i % 2 ? 0.6 : 0) + ((i * 11) % 5) * 0.16)}%`);
  return `polygon(${pts.join(",")})`;
})();

function WaxSeal({ sh, initial, size = 74, half }: { sh: RoseShades; initial: string; size?: number; half?: "l" | "r" }) {
  const id = useId().replace(/:/g, "");
  // A blobby, poured-wax outline.
  const blob = useMemo(() => {
    const n = 18;
    let d = "";
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = 46 + Math.sin(i * 2.7) * 3 + (i % 3 === 0 ? 2.5 : 0);
      d += `${i ? "L" : "M"}${(50 + Math.cos(a) * r).toFixed(1)} ${(50 + Math.sin(a) * r).toFixed(1)} `;
    }
    return `${d}Z`;
  }, []);
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: "block", overflow: "visible" }} aria-hidden>
      <defs>
        <radialGradient id={`${id}-w`} cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#fff" stopOpacity=".35" />
          <stop offset=".35" stopColor={sh.seal} />
          <stop offset="1" stopColor={sh.deep} />
        </radialGradient>
        <clipPath id={`${id}-c`}>
          {half === "l" ? <path d="M-10 -10 H52 L46 30 L54 55 L47 80 L50 110 H-10 Z" /> : half === "r" ? <path d="M52 -10 H110 V110 H50 L47 80 L54 55 L46 30 Z" /> : <rect x="-10" y="-10" width="120" height="120" />}
        </clipPath>
        <filter id={`${id}-s`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#3a0010" floodOpacity=".35" />
        </filter>
      </defs>
      <g clipPath={`url(#${id}-c)`} filter={`url(#${id}-s)`}>
        <path d={blob} fill={`url(#${id}-w)`} />
        <circle cx={50} cy={50} r={33} fill="none" stroke={sh.deep} strokeOpacity=".55" strokeWidth={2.2} />
        <circle cx={50} cy={50} r={33} fill="none" stroke="#fff" strokeOpacity=".25" strokeWidth={1} transform="translate(-.8 -.8)" />
        {/* tiny rose wreath dots */}
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <circle key={i} cx={50 + Math.cos(a) * 39} cy={50 + Math.sin(a) * 39} r={1.6} fill={sh.deep} opacity=".5" />;
        })}
        <text x={50} y={51} textAnchor="middle" dominantBaseline="central" style={{ font: `700 34px ${FONTS.serif}` }} fill={sh.deep} opacity=".85">
          {initial}
        </text>
        <text x={49.2} y={50.2} textAnchor="middle" dominantBaseline="central" style={{ font: `700 34px ${FONTS.serif}` }} fill="#fff" opacity=".22">
          {initial}
        </text>
      </g>
    </svg>
  );
}

function PressedRose({ sh }: { sh: RoseShades }) {
  const id = useId().replace(/:/g, "");
  // Dried: a touch darker and flatter than the live rose.
  const dried: RoseShades = { ...sh };
  return (
    <svg viewBox="-60 -110 120 230" width={78} height={150} style={{ display: "block", overflow: "visible", filter: "saturate(.75) drop-shadow(0 2px 2px rgba(60,10,20,.25))" }} aria-hidden>
      <GradDefs grads={roseGrads(id, dried)} />
      <StemRose id={id} open={1} x={0} y={-30} s={0.85} len={150} />
    </svg>
  );
}

export default function WaxLetter({ day, data, reduced, onNext }: Props) {
  const x = data.extras;
  const sh = shadesFor(x.roseColor);
  const [phase, setPhase] = useState<Phase>("sealed");
  const [shown, setShown] = useState(false);
  const [inkDone, setDone] = useState(false);
  const [replay, setReplay] = useState(0);
  const paperRef = useRef<HTMLDivElement>(null);
  const initial = (data.senderName.trim()[0] ?? "♥").toUpperCase();
  const slot = day.gifSlots[2];

  const crack = () => {
    if (phase !== "sealed") return;
    haptic(15);
    if (reduced) return setPhase("reading");
    setPhase("cracking");
    window.setTimeout(() => setPhase("opening"), 520);
    window.setTimeout(() => setPhase("reading"), 1900);
  };

  // Words with their ink delays, grouped by paragraph.
  const { paras, total } = useMemo(() => {
    const clock = { t: 250 };
    const out = (data.letter || "").split(/\n{2,}/).map((para) => {
      const start = clock.t;
      const lines = para.split("\n").map((line) =>
        line
          .split(/\s+/)
          .filter(Boolean)
          .map((w) => {
            const d = clock.t;
            clock.t += 58 + (/[.!?…]$/.test(w) ? 320 : /[,;:—]$/.test(w) ? 140 : 0);
            return { w, d };
          }),
      );
      clock.t += 420;
      return { start, lines };
    });
    return { paras: out, total: clock.t };
  }, [data.letter]);

  // Follow the ink down the paper; mark done when the last word has dried.
  useEffect(() => {
    if (phase !== "reading") return;
    if (reduced || shown) return;
    const timers: number[] = [];
    paras.forEach((p, i) => {
      if (i === 0) return;
      timers.push(
        window.setTimeout(() => {
          const el = paperRef.current?.querySelector<HTMLElement>(`[data-para="${i}"]`);
          const box = paperRef.current;
          if (el && box && el.offsetTop + 40 > box.scrollTop + box.clientHeight * 0.62) box.scrollTo({ top: Math.max(0, el.offsetTop - box.clientHeight * 0.3), behavior: "smooth" });
        }, p.start),
      );
    });
    timers.push(window.setTimeout(() => setDone(true), total + 600));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [phase, paras, total, reduced, shown, replay]);

  const showAll = () => {
    setShown(true);
    setDone(true);
  };

  const readAgain = () => {
    setShown(false);
    setDone(false);
    setReplay((r) => r + 1);
    paperRef.current?.scrollTo({ top: 0 });
  };

  const done = inkDone || reduced || shown;
  const inkWet = x.roseColor === "white" || x.roseColor === "yellow" ? "#8E0B20" : sh.dark;
  const open = phase === "opening" || phase === "reading";

  return (
    <>
      <header style={{ display: "grid", gap: 6, justifyItems: "center" }}>
        <p style={kicker}>{phase === "reading" ? "Written in ink, for you" : "Pressed between two pages"}</p>
        {phase !== "reading" && <h2 style={{ margin: 0, font: `700 28px/1.2 ${FONTS.serif}`, color: VW.ink }}>A letter, sealed with a rose</h2>}
      </header>

      <AnimatePresence mode="wait">
        {phase !== "reading" ? (
          <motion.div
            key="env"
            exit={reduced ? undefined : { opacity: 0, y: 60, scale: 0.9, transition: { duration: 0.45 } }}
            style={{ position: "relative", width: `min(88vw, calc(${EW}px * var(--vw-s, 1)))`, paddingTop: "min(40vw, 150px)", display: "flex", flexDirection: "column" }}
          >
            <div style={{ position: "relative", width: "100%", aspectRatio: `${EW} / ${EH}`, perspective: 900 }}>
              {/* back */}
              <div style={{ position: "absolute", inset: 0, borderRadius: 10, background: "linear-gradient(180deg,#EDB3C0,#F4C8D1)", boxShadow: "0 30px 50px -28px rgba(90,26,43,.6)" }} />
              {/* paper peeking */}
              <motion.div
                animate={{ y: open ? "-52%" : "0%" }}
                transition={{ duration: 0.8, ease: EASE, delay: open ? 0.45 : 0 }}
                style={{
                  position: "absolute",
                  left: "6%",
                  right: "6%",
                  top: "7%",
                  height: "86%",
                  background: "#FFFBF3",
                  borderRadius: 4,
                  boxShadow: "0 2px 8px rgba(90,26,43,.15)",
                  zIndex: 2,
                  padding: "14% 9% 0",
                  boxSizing: "border-box",
                  display: "grid",
                  gap: 7,
                  alignContent: "start",
                }}
              >
                <span style={{ font: `400 17px ${FONTS.script}`, color: VW.paperInk, textAlign: "left" }}>My dear {data.recipientName || "you"},</span>
                {[92, 78, 86, 60].map((w, i) => (
                  <span key={i} style={{ height: 2, width: `${w}%`, background: "rgba(90,26,43,.12)", borderRadius: 2 }} />
                ))}
              </motion.div>
              {/* front pocket */}
              <svg viewBox={`0 0 ${EW} ${EH}`} width="100%" height="100%" style={{ position: "absolute", inset: 0, zIndex: 3, overflow: "visible" }} aria-hidden>
                <defs>
                  <linearGradient id="rd-pocket" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#F9D5DC" />
                    <stop offset="1" stopColor="#F2BCC8" />
                  </linearGradient>
                </defs>
                <path d={`M0 10 L${EW / 2} ${EH * 0.6} L${EW} 10 L${EW} ${EH - 10} Q${EW} ${EH} ${EW - 10} ${EH} L10 ${EH} Q0 ${EH} 0 ${EH - 10} Z`} fill="url(#rd-pocket)" />
                <path d={`M0 ${EH} L${EW / 2} ${EH * 0.6} L${EW} ${EH}`} fill="none" stroke="rgba(168,60,90,.18)" strokeWidth={1.4} />
              </svg>
              {/* pressed rose, tucked */}
              <div style={{ position: "absolute", left: "6%", bottom: "-2%", zIndex: 4, transform: "rotate(-52deg)", transformOrigin: "center", filter: "sepia(.15)" }}>
                <PressedRose sh={sh} />
              </div>
              <span style={{ position: "absolute", right: "8%", bottom: "12%", zIndex: 4, font: `400 20px ${FONTS.script}`, color: "rgba(90,26,43,.7)", maxWidth: "50%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                for {data.petName || data.recipientName || "you"}
              </span>
              {/* the flap */}
              <motion.div
                initial={false}
                animate={{ rotateX: open ? 180 : 0 }}
                transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
                style={{ position: "absolute", left: 0, right: 0, top: 0, height: "64%", transformOrigin: "50% 0%", zIndex: open ? 1 : 5, transformStyle: "preserve-3d" }}
              >
                <svg viewBox={`0 0 ${EW} ${EH * 0.64}`} width="100%" height="100%" preserveAspectRatio="none" style={{ display: "block", overflow: "visible" }} aria-hidden>
                  <path d={`M0 6 Q0 0 8 0 L${EW - 8} 0 Q${EW} 0 ${EW} 6 L${EW / 2 + 14} ${EH * 0.62} Q${EW / 2} ${EH * 0.66} ${EW / 2 - 14} ${EH * 0.62} Z`} fill={open ? "#E9A9B8" : "#F6C9D3"} stroke="rgba(168,60,90,.18)" strokeWidth={1.2} />
                </svg>
              </motion.div>
              {/* seal */}
              {phase === "sealed" && (
                <button
                  type="button"
                  onClick={crack}
                  aria-label="Break the wax seal and open the letter"
                  style={{ position: "absolute", left: "50%", top: "61%", transform: "translate(-50%,-50%)", zIndex: 6, border: 0, padding: 0, background: "none", cursor: "pointer", borderRadius: "50%" }}
                >
                  <span className={reduced ? undefined : "rd-ping"} style={{ position: "absolute", inset: 4, borderRadius: "50%", border: `2px solid ${sh.seal}` }} />
                  <WaxSeal sh={sh} initial={initial} />
                </button>
              )}
              {phase === "cracking" &&
                (["l", "r"] as const).map((h) => (
                  <motion.div
                    key={h}
                    initial={{ x: "-50%", y: "-50%", rotate: 0, opacity: 1 }}
                    animate={{ x: h === "l" ? "-95%" : "-5%", y: "60%", rotate: h === "l" ? -28 : 28, opacity: 0 }}
                    transition={{ duration: 0.55, ease: "easeIn" }}
                    style={{ position: "absolute", left: "50%", top: "61%", zIndex: 6 }}
                  >
                    <WaxSeal sh={sh} initial={initial} half={h} />
                  </motion.div>
                ))}
              {phase !== "sealed" && slot && (
                <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 14 }} style={{ position: "absolute", right: -12, top: -70, zIndex: 7 }}>
                  <Sticker slug={day.slug} slot={slot} value={data.gifs[slot.id]} size={84} eager />
                </motion.div>
              )}
            </div>
            <p style={{ margin: "18px 0 0", font: `500 15px ${FONTS.ui}`, color: VW.inkSoft, textAlign: "center" }}>{phase === "sealed" ? "Tap the wax seal to break it" : "…"}</p>
          </motion.div>
        ) : (
          <motion.div
            key="paper"
            initial={reduced ? false : { opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: EASE }}
            style={{ position: "relative", width: "min(100%, calc(440px * var(--vw-s, 1)))", ["--rd-ink-wet" as string]: inkWet } as CSSProperties}
          >
            {slot && (
              <div style={{ position: "absolute", right: -4, top: -46, zIndex: 3 }}>
                <Sticker slug={day.slug} slot={slot} value={data.gifs[slot.id]} size={60} />
              </div>
            )}
            <div style={{ filter: "drop-shadow(0 18px 22px rgba(90,26,43,.22))" }}>
            <div
              style={{
                position: "relative",
                background: "linear-gradient(180deg,#FFFDF7,#FFF6EA)",
                clipPath: DECKLE,
              }}
            >
              <div
                ref={paperRef}
                className={shown ? "rd-shown" : undefined}
                key={replay}
                style={{
                  maxHeight: "min(60dvh, 560px)",
                  overflowY: "auto",
                  padding: "30px 24px 34px",
                  textAlign: "left",
                  color: VW.paperInk,
                  font: `400 21px/32px ${FONTS.script}`,
                  backgroundImage: "repeating-linear-gradient(180deg, transparent 0 31px, rgba(200,16,46,.07) 31px 32px)",
                  backgroundPositionY: 27,
                  WebkitMaskImage: done ? undefined : "linear-gradient(180deg,#000 82%,transparent)",
                  maskImage: done ? undefined : "linear-gradient(180deg,#000 82%,transparent)",
                  overscrollBehavior: "contain",
                }}
                aria-label="The letter"
              >
                <span className="vw-sr">{data.letter}</span>
                <div aria-hidden>
                  {paras.map((p, i) => (
                    <p key={i} data-para={i} style={{ margin: i ? "32px 0 0" : 0, overflowWrap: "anywhere" }}>
                      {p.lines.map((line, li) => (
                        <span key={li}>
                          {li > 0 && <br />}
                          {line.map((w, wi) => (
                            <span key={wi} className="rd-word" style={{ animationDelay: `${w.d}ms` }}>
                              {w.w}{" "}
                            </span>
                          ))}
                        </span>
                      ))}
                    </p>
                  ))}
                </div>
                <AnimatePresence>
                  {done && (
                    <motion.div initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ marginTop: 20, display: "grid", gap: 14 }}>
                      {x.shayari && (
                        <figure
                          style={{
                            margin: 0,
                            padding: "16px 18px",
                            borderRadius: 14,
                            background: "linear-gradient(180deg,#FBEFE4,#F6E6DA)",
                            border: "1px dashed rgba(142,11,32,.28)",
                            boxShadow: "inset 0 0 0 4px #FFF8F0",
                            textAlign: "center",
                            position: "relative",
                          }}
                        >
                          <span aria-hidden style={{ position: "absolute", left: 10, top: 6, font: `700 30px ${FONTS.serif}`, color: sh.petal === "#FFF6EE" ? "#C9A27A" : sh.petal, opacity: 0.5 }}>
                            “
                          </span>
                          <blockquote style={{ margin: 0, whiteSpace: "pre-line", font: `italic 500 16.5px/1.55 ${FONTS.serif}`, color: VW.paperInk, overflowWrap: "anywhere" }}>{x.shayari}</blockquote>
                        </figure>
                      )}
                      <p style={{ margin: 0, textAlign: "right", font: `700 24px ${FONTS.script}`, color: VW.paperInk, overflowWrap: "anywhere" }}>— {x.signOff || data.senderName}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "reading" && (
        <div style={{ display: "grid", gap: 10, justifyItems: "center", alignContent: "start", minHeight: 108 }}>
          {!done ? (
            <button type="button" onClick={showAll} style={ghostBtn}>
              Show it all ⏩
            </button>
          ) : (
            <>
              <button type="button" onClick={onNext} style={primaryBtn}>
                Your bouquet of memories 💐
              </button>
              {!reduced && (
                <button type="button" onClick={readAgain} style={{ ...ghostBtn, border: 0, background: "transparent", minHeight: 40 }}>
                  📖 read again
                </button>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
