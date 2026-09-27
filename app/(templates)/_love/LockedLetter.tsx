"use client";

// ─── Love kit — the locked letter ────────────────────────────────────────────
//
// The main letter is sealed with a padlock and a question the sender wrote
// ("Promise you'll read this with a smile?"). The answer button opens it; the
// "no" button runs away (and after a few tries gives up and becomes a second
// yes). Then: the lock pops with confetti and the sender's GIF reacts, the
// envelope's flap swings open, the letter rises out of it and unfolds to fill
// the screen, its lines fading in one after another.

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { GROTESK, HeartBurst, ITALIC } from "./LoveKit";
import { GifMoment } from "./Story";
import { V } from "./theme";

type Stage = "locked" | "unlocking" | "opening" | "open";

// Offsets stay inside a phone's width: the button sits centred under "yes".
const DODGES = [
  { x: -95, y: 18, label: "are you sure? 🥺" },
  { x: 95, y: -8, label: "really?? 😳" },
  { x: -80, y: 30, label: "think again 😤" },
  { x: 90, y: 22, label: "not an option 🙅" },
];

export default function LockedLetter({
  letter,
  from,
  to,
  question,
  answer,
  gif,
  gifCaption = "knew it 🥹",
  reduceMotion,
  onOpened,
}: {
  letter: string;
  from: string;
  to: string;
  question: string;
  answer: string;
  gif?: string;
  gifCaption?: string;
  reduceMotion: boolean;
  onOpened?: () => void;
}) {
  const [stage, setStage] = useState<Stage>("locked");
  const [dodge, setDodge] = useState(0);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const unlock = () => {
    if (stage !== "locked") return;
    if (reduceMotion) {
      setStage("open");
      onOpened?.();
      return;
    }
    setStage("unlocking");
    timers.current.push(window.setTimeout(() => setStage("opening"), gif ? 2000 : 1100));
    timers.current.push(
      window.setTimeout(() => {
        setStage("open");
        onOpened?.();
      }, gif ? 3700 : 2800),
    );
  };

  const gaveUp = dodge >= DODGES.length;
  const runAway = () => !gaveUp && setDodge((d) => d + 1);
  const pos = dodge > 0 && !gaveUp ? DODGES[(dodge - 1) % DODGES.length] : { x: 0, y: 0, label: "no" };

  if (!letter.trim()) return null;
  const lines = letter.split("\n");

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <AnimatePresence mode="wait" initial={false}>
        {stage === "locked" && (
          <motion.div key="locked" exit={{ opacity: 0, scale: 0.94 }} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <Envelope to={to} locked reduceMotion={reduceMotion} />
            <p style={{ margin: "26px 0 0", fontFamily: GROTESK, fontSize: 11, fontWeight: 800, letterSpacing: ".24em", textTransform: "uppercase", color: V.a1 }}>🔒 locked by {from}</p>
            <h3 style={{ margin: "8px 0 0", maxWidth: 520, fontFamily: GROTESK, fontWeight: 800, fontSize: "clamp(26px, 6.6vw, 40px)", lineHeight: 1.05, letterSpacing: "-0.03em", color: V.ink }}>{question}</h3>
            <div style={{ position: "relative", marginTop: 24, minHeight: 150, width: "min(100%, 420px)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <button type="button" onClick={unlock} className="lv-cta lv-focus lv-pulse" style={{ ...btn, background: V.grad, color: "#fff", border: "none" }}>
                {answer}
              </button>
              <motion.button
                type="button"
                onPointerEnter={(e) => e.pointerType === "mouse" && runAway()}
                onClick={gaveUp ? unlock : runAway}
                animate={{ x: pos.x, y: pos.y, scale: gaveUp ? 1 : 1 - dodge * 0.06 }}
                transition={{ type: "spring", stiffness: 420, damping: 18 }}
                className="lv-focus"
                style={{ ...btn, background: V.glass, color: V.ink, border: `1.5px solid ${V.edge}` }}
              >
                {gaveUp ? "ok fine, yes 💖" : pos.label}
              </motion.button>
            </div>
          </motion.div>
        )}

        {(stage === "unlocking" || stage === "opening") && (
          <motion.div key="anim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "relative", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", minHeight: 420, justifyContent: "center" }}>
            <HeartBurst />
            <Envelope to={to} locked={false} opening={stage === "opening"} reduceMotion={reduceMotion} />
            <div style={{ marginTop: 22, minHeight: 130 }}>
              <GifMoment src={gif} caption={gifCaption} show={stage === "unlocking"} />
            </div>
          </motion.div>
        )}

        {stage === "open" && (
          <motion.article
            key="open"
            initial={reduceMotion ? false : { opacity: 0, y: 120, scale: 0.7, rotate: -3 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 150, damping: 20 }}
            style={{
              position: "relative",
              width: "min(100%, 700px)",
              minHeight: "min(72dvh, 760px)",
              borderRadius: 24,
              padding: "clamp(26px, 6vw, 48px) clamp(20px, 5vw, 44px)",
              background: "repeating-linear-gradient(var(--lv-paper) 0 35px, color-mix(in srgb, var(--lv-paper-soft) 24%, var(--lv-paper)) 35px 36px)",
              color: V.paperInk,
              boxShadow: `0 40px 90px -34px ${V.shadow}`,
            }}
          >
            <span aria-hidden style={{ position: "absolute", right: 18, top: -22, width: 56, height: 56, borderRadius: "50%", background: V.grad, color: "#fff", display: "grid", placeItems: "center", fontSize: 24, boxShadow: "0 10px 20px rgba(0,0,0,.25)" }}>
              ♥
            </span>
            <p style={{ margin: 0, fontFamily: GROTESK, fontSize: 11, fontWeight: 800, letterSpacing: ".22em", textTransform: "uppercase", color: V.a1 }}>
              from {from} · to {to}
            </p>
            <div style={{ marginTop: 16, fontFamily: ITALIC, fontStyle: "italic", fontSize: "clamp(22px, 4.8vw, 27px)", lineHeight: "36px", overflowWrap: "anywhere" }}>
              {lines.map((l, i) => (
                <motion.p
                  key={i}
                  initial={reduceMotion ? false : { opacity: 0, y: 8, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: reduceMotion ? 0 : 0.35 + i * 0.12, duration: 0.5 }}
                  style={{ margin: 0, minHeight: 36 }}
                >
                  {l}
                </motion.p>
              ))}
            </div>
          </motion.article>
        )}
      </AnimatePresence>
    </div>
  );
}

function Envelope({ to, locked, opening, reduceMotion }: { to: string; locked: boolean; opening?: boolean; reduceMotion: boolean }) {
  return (
    <motion.div
      className={locked && !reduceMotion ? "lv-float" : ""}
      animate={opening ? { scale: 1.12, y: 30 } : { scale: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{ position: "relative", width: "min(76vw, 320px)", aspectRatio: "3 / 2", perspective: 900 }}
    >
      {/* The letter inside, rising out as it opens */}
      <motion.span
        initial={false}
        animate={opening ? { y: "-58%" } : { y: "0%" }}
        transition={{ delay: opening ? 0.55 : 0, duration: 0.9, ease: [0.3, 0.9, 0.3, 1] }}
        style={{ position: "absolute", left: "8%", right: "8%", top: "6%", height: "86%", borderRadius: 8, background: "repeating-linear-gradient(#fffdf6 0 14px, #efe3cf 14px 15px)", boxShadow: "0 6px 14px rgba(0,0,0,.12)", zIndex: 1 }}
      />
      {/* Body (front pocket) */}
      <span style={{ position: "absolute", inset: 0, borderRadius: 14, background: "linear-gradient(160deg, #fff4e6, #f3dcc0)", zIndex: 2, clipPath: "polygon(0 22%, 50% 62%, 100% 22%, 100% 100%, 0 100%)", boxShadow: "0 30px 60px -24px rgba(0,0,0,.6)" }} />
      <span style={{ position: "absolute", inset: 0, borderRadius: 14, background: "linear-gradient(160deg, #f6e4cc, #ecd2b0)", zIndex: 0 }} />
      {/* Flap */}
      <motion.span
        initial={false}
        animate={{ rotateX: opening ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ position: "absolute", left: 0, right: 0, top: 0, height: "62%", transformOrigin: "top", transformStyle: "preserve-3d", clipPath: "polygon(0 0, 100% 0, 50% 100%)", background: "linear-gradient(180deg, #efd6b6, #e4c49c)", borderRadius: "14px 14px 0 0", zIndex: opening ? 0 : 3 }}
      />
      {/* Seal / lock */}
      <AnimatePresence>
        {!opening && (
          <motion.span
            exit={{ scale: 1.8, opacity: 0, rotate: 30 }}
            transition={{ duration: 0.35 }}
            style={{ position: "absolute", left: "50%", top: "62%", width: 64, height: 64, marginLeft: -32, marginTop: -32, borderRadius: "50%", background: V.grad, display: "grid", placeItems: "center", fontSize: 28, zIndex: 4, boxShadow: "0 10px 20px -6px rgba(0,0,0,.45)" }}
          >
            {locked ? "🔒" : "💖"}
          </motion.span>
        )}
      </AnimatePresence>
      <span style={{ position: "absolute", left: 14, bottom: 10, zIndex: 4, fontFamily: ITALIC, fontStyle: "italic", fontSize: 18, color: "#7a4c36" }}>for {to}</span>
    </motion.div>
  );
}

const btn = {
  minWidth: 132,
  height: 54,
  padding: "0 22px",
  borderRadius: 999,
  fontFamily: GROTESK,
  fontWeight: 800,
  fontSize: 16,
  cursor: "pointer",
  whiteSpace: "nowrap",
} as const;
