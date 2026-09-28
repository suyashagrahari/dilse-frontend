"use client";

// ─── Directions for use ──────────────────────────────────────────────────────
//
// The emotional payoff. The main letter is folded inside a foil wrapper with a
// perforated "tear here" strip and the sender's question printed on it. The
// answer button tears the strip off (confetti, the sender's GIF reacts), the
// note slides up out of the wrapper and unfolds, and its paragraphs fade in one
// after another. The "not yet" button runs away, then gives up and becomes a
// second yes.
//
// This is the tonal break the template is built on: everything above is 8px
// regulatory Helvetica; this is a person writing, in a big italic serif.

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { GROTESK, HeartBurst, ITALIC } from "../../_love/LoveKit";
import { V } from "../../_love/theme";
import { P } from "./themes";

type Stage = "sealed" | "tearing" | "open";

const DODGES = [
  { x: -90, y: 14, label: "are you sure? 🥺" },
  { x: 92, y: -6, label: "read the label again 😤" },
  { x: -70, y: 26, label: "not an option 🙅" },
];

export default function WrapperLetter({
  letter,
  from,
  to,
  question,
  answer,
  gif,
  reduceMotion,
}: {
  letter: string;
  from: string;
  to: string;
  question: string;
  answer: string;
  gif?: string;
  reduceMotion: boolean;
}) {
  const [stage, setStage] = useState<Stage>("sealed");
  const [dodge, setDodge] = useState(0);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const tear = () => {
    if (stage !== "sealed") return;
    if (reduceMotion) {
      setStage("open");
      return;
    }
    setStage("tearing");
    timers.current.push(window.setTimeout(() => setStage("open"), gif ? 1900 : 1100));
  };

  const gaveUp = dodge >= DODGES.length;
  const pos = dodge > 0 && !gaveUp ? DODGES[(dodge - 1) % DODGES.length] : { x: 0, y: 0, label: "not yet" };
  const runAway = () => !gaveUp && setDodge((d) => d + 1);

  if (!letter.trim()) return null;
  const paragraphs = letter.split(/\n/);

  return (
    <section aria-label="Directions for use" style={{ width: "100%", maxWidth: 720, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <p style={{ margin: 0, fontFamily: GROTESK, fontSize: 11, fontWeight: 800, letterSpacing: ".24em", textTransform: "uppercase", color: V.a1 }}>directions for use</p>
      <h2 style={{ margin: "8px 0 0", textAlign: "center", fontFamily: GROTESK, fontWeight: 800, fontSize: "clamp(28px, 7vw, 44px)", lineHeight: 1, letterSpacing: "-0.04em", color: V.ink }}>
        There&rsquo;s a note inside the wrapper.
      </h2>

      <div style={{ position: "relative", width: "100%", marginTop: 26, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <AnimatePresence mode="wait" initial={false}>
          {stage !== "open" ? (
            <motion.div key="pack" exit={{ opacity: 0, y: 40, scale: 0.92 }} transition={{ duration: 0.35 }} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div className="nf-pack" style={{ position: "relative" }}>
                {stage === "tearing" ? <HeartBurst glyphs={["💗", "✨", "🍬", "💖", "⭐"]} /> : null}
                {/* The tear strip. On "tearing" it rips off to the top-left. */}
                <motion.div
                  animate={stage === "tearing" ? { x: -70, y: -60, rotate: -16, opacity: 0 } : { x: 0, y: 0, rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.6, ease: [0.3, 0.8, 0.3, 1] }}
                  className="nf-strip"
                >
                  <span className="nf-crimp" style={{ position: "absolute", inset: "0 0 auto 0" }} />
                  <span style={{ position: "relative", fontFamily: GROTESK, fontWeight: 800, fontSize: 10.5, letterSpacing: ".22em", textTransform: "uppercase", color: P.boardInk }}>✂ tear here</span>
                </motion.div>
                <div className="nf-perf" aria-hidden />
                <div style={{ position: "relative", padding: "22px 20px 26px", textAlign: "center" }}>
                  <p style={{ margin: 0, fontFamily: GROTESK, fontSize: 10.5, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: P.boardInk, opacity: 0.8 }}>
                    for {to} · from {from}
                  </p>
                  <p style={{ margin: "10px auto 0", maxWidth: 360, fontFamily: GROTESK, fontWeight: 800, fontSize: "clamp(22px, 6vw, 30px)", lineHeight: 1.05, letterSpacing: "-0.03em", color: P.boardInk }}>{question}</p>
                  <p style={{ margin: "10px 0 0", fontFamily: ITALIC, fontStyle: "italic", fontSize: 17, color: P.boardInk, opacity: 0.8 }}>1 note inside · do not microwave</p>
                </div>
              </div>

              {stage === "sealed" ? (
                <div style={{ position: "relative", marginTop: 22, minHeight: 130, width: "min(100%, 380px)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                  <button type="button" onClick={tear} className="lv-cta lv-focus lv-pulse" style={{ ...btn, background: V.grad, color: "#fff", border: "none" }}>
                    {answer}
                  </button>
                  <motion.button
                    type="button"
                    onPointerEnter={(e) => e.pointerType === "mouse" && runAway()}
                    onClick={gaveUp ? tear : runAway}
                    animate={{ x: pos.x, y: pos.y, scale: gaveUp ? 1 : 1 - dodge * 0.06 }}
                    transition={{ type: "spring", stiffness: 420, damping: 18 }}
                    className="lv-focus"
                    style={{ ...btn, width: "auto", padding: "10px 22px", minHeight: 46, fontSize: 14, background: V.glass, color: V.ink, border: `1.5px solid ${V.edge}` }}
                  >
                    {gaveUp ? "ok fine, open it 💖" : pos.label}
                  </motion.button>
                </div>
              ) : (
                <div style={{ marginTop: 22, minHeight: 130, display: "grid", placeItems: "center" }}>
                  {gif ? (
                    <motion.span initial={{ opacity: 0, scale: 0.6, rotate: -8 }} animate={{ opacity: 1, scale: 1, rotate: -3 }} transition={{ type: "spring", stiffness: 300, damping: 16 }} style={{ display: "block", width: 120, height: 120, borderRadius: 20, overflow: "hidden", border: "5px solid #fff", background: "#fff", boxShadow: `0 20px 40px -18px ${V.shadow}` }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={gif} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </motion.span>
                  ) : null}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.article
              key="note"
              initial={reduceMotion ? false : { opacity: 0, y: 120, scaleY: 0.4, rotate: -2 }}
              animate={{ opacity: 1, y: 0, scaleY: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 140, damping: 20 }}
              style={{
                position: "relative",
                width: "min(100%, 680px)",
                transformOrigin: "top center",
                borderRadius: 18,
                padding: "clamp(24px, 6vw, 44px) clamp(20px, 5vw, 42px) clamp(26px, 6vw, 40px)",
                background: `radial-gradient(120% 80% at 0% 0%, color-mix(in srgb, var(--lv-paper-soft) 10%, var(--lv-paper)) 0%, var(--lv-paper) 60%)`,
                color: V.paperInk,
                border: `1.5px solid color-mix(in srgb, var(--lv-paper-ink) 18%, transparent)`,
                boxShadow: `0 40px 90px -34px ${V.shadow}`,
              }}
            >
              {/* Fold creases, the note has been in a wrapper. */}
              <span aria-hidden style={{ position: "absolute", left: 0, right: 0, top: "33%", height: 1, background: "linear-gradient(90deg, transparent, rgba(0,0,0,.12), transparent)" }} />
              <span aria-hidden style={{ position: "absolute", left: 0, right: 0, top: "66%", height: 1, background: "linear-gradient(90deg, transparent, rgba(0,0,0,.1), transparent)" }} />
              <span aria-hidden style={{ position: "absolute", right: 16, top: -20, width: 54, height: 54, borderRadius: "50%", background: V.grad, color: "#fff", display: "grid", placeItems: "center", fontSize: 22, boxShadow: "0 10px 20px rgba(0,0,0,.25)" }}>
                ♥
              </span>
              <p style={{ margin: 0, fontFamily: GROTESK, fontSize: 10.5, fontWeight: 800, letterSpacing: ".22em", textTransform: "uppercase", color: V.a1 }}>directions for use</p>
              <p style={{ margin: "4px 0 0", fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 10.5, color: V.paperSoft }}>1. read slowly &nbsp;2. smile &nbsp;3. repeat daily</p>
              <div style={{ marginTop: 16, fontFamily: ITALIC, fontStyle: "italic", fontSize: "clamp(21px, 4.8vw, 26px)", lineHeight: "36px", overflowWrap: "anywhere" }}>
                {paragraphs.map((l, i) => (
                  <motion.p
                    key={i}
                    initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduceMotion ? 0 : 0.35 + Math.min(i, 14) * 0.12, duration: 0.45 }}
                    style={{ margin: 0, minHeight: l.trim() ? undefined : 16 }}
                  >
                    {l}
                  </motion.p>
                ))}
              </div>
              <p style={{ margin: "22px 0 0", fontFamily: 'Helvetica, Arial, sans-serif', fontSize: 9.5, letterSpacing: ".04em", color: V.paperSoft, textAlign: "center" }}>
                BEST BEFORE: NEVER · KEEP IN A WARM PLACE · DO NOT SHARE (SERIOUSLY)
              </p>
            </motion.article>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

const btn: React.CSSProperties = {
  width: "100%",
  minHeight: 56,
  padding: "12px 20px",
  borderRadius: 999,
  fontFamily: GROTESK,
  fontWeight: 800,
  fontSize: 17,
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
};
