"use client";

// ─── ChocoLetter — the melted heart sets into a slab; the wrapper unrolls ────
//
// The last reason is engraved into a glossy chocolate slab (the melted heart
// truffle). Below it the cream wrapper paper unrolls out of a gold-foil sleeve
// (clip-path + a paper roll riding the edge); paragraphs fade in as they
// scroll into view. A greeting/sign-off are detected and set in script, the
// first body paragraph gets a gold-foil drop cap. Long letters simply make a
// longer wrapper — the page scrolls, no cramped inner box.

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { motion } from "framer-motion";
import { FONTS } from "../../_valentine/theme";
import { C } from "./chocoArt";

export function splitLetter(letter: string) {
  const paras = letter
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  let greeting: string | null = null;
  let signoff: string | null = null;
  if (paras.length > 1 && paras[0].length <= 42 && !/[.!?]$/.test(paras[0]) && !paras[0].includes("\n")) greeting = paras.shift()!;
  const lastP = paras[paras.length - 1];
  if (paras.length > 1 && lastP && lastP.length <= 70 && (lastP.includes("\n") || /^(—|-|love|yours|forever|always|tumhara|tumhari|xo)/i.test(lastP))) signoff = paras.pop()!;
  return { greeting, body: paras, signoff };
}

export default function ChocoLetter({
  letter,
  recipientName,
  senderName,
  engraving,
  reduced,
  preview,
  sticker,
  onNext,
  nextLabel,
}: {
  letter: string;
  recipientName: string;
  senderName: string;
  engraving: string;
  reduced: boolean;
  preview: boolean;
  sticker: (slotId: string, size: number, style?: CSSProperties) => ReactNode;
  onNext: () => void;
  nextLabel: string;
}) {
  const { greeting, body, signoff } = useMemo(() => splitLetter(letter), [letter]);
  const [unrolled, setUnrolled] = useState(reduced);
  useEffect(() => {
    if (reduced) return;
    const t = window.setTimeout(() => setUnrolled(true), 2100);
    return () => window.clearTimeout(t);
  }, [reduced]);

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: `64px 18px ${preview ? 130 : 56}px` }}>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ margin: "0 0 14px", font: `600 12.5px ${FONTS.ui}`, letterSpacing: ".22em", textTransform: "uppercase", color: "#E9CDB6" }}>
        The last piece, melted ❤️
      </motion.p>

      {/* ── the slab ── */}
      <motion.div
        initial={reduced ? false : { scale: 1.08, opacity: 0, y: -10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 140, damping: 16, delay: 0.1 }}
        style={{ position: "relative", width: "min(100%, calc(420px * var(--vw-s, 1)))", zIndex: 2 }}
      >
        <Slab name={recipientName} engraving={engraving} />
      </motion.div>

      {/* ── foil sleeve + wrapper paper ── */}
      <div style={{ position: "relative", width: "min(94%, calc(396px * var(--vw-s, 1)))", marginTop: -16, zIndex: 1 }}>
        <div aria-hidden style={{ position: "relative", height: 26, zIndex: 3, background: "linear-gradient(180deg, #FFF0BF, #E6B85C 40%, #A67A2A)", clipPath: "polygon(0 30%, 4% 0, 8% 30%, 12% 0, 16% 30%, 20% 0, 24% 30%, 28% 0, 32% 30%, 36% 0, 40% 30%, 44% 0, 48% 30%, 52% 0, 56% 30%, 60% 0, 64% 30%, 68% 0, 72% 30%, 76% 0, 80% 30%, 84% 0, 88% 30%, 92% 0, 96% 30%, 100% 0, 100% 100%, 0 100%)", boxShadow: "0 6px 10px rgba(0,0,0,.3)" }} />
        <motion.article
          initial={reduced ? false : { clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          transition={{ duration: 1.8, delay: 0.5, ease: [0.4, 0.1, 0.2, 1] }}
          style={{
            position: "relative",
            padding: "30px 24px 30px",
            background: `repeating-linear-gradient(0deg, rgba(166,122,42,.05) 0 1px, transparent 1px 30px), linear-gradient(180deg, ${C.cream}, #FBEBD6)`,
            color: C.cocoa,
            textAlign: "left",
            boxShadow: "0 30px 50px -24px rgba(0,0,0,.65), inset 0 10px 14px -10px rgba(0,0,0,.25)",
            borderRadius: "0 0 10px 10px",
          }}
        >
          {/* side foil edges */}
          <span aria-hidden style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 5, background: "linear-gradient(180deg, #E6B85C, #FFF0BF, #E6B85C)", opacity: 0.75 }} />
          <span aria-hidden style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: 5, background: "linear-gradient(180deg, #E6B85C, #FFF0BF, #E6B85C)", opacity: 0.75 }} />

          {greeting && <Reveal settled={unrolled} reduced={reduced} delay={0.9}><p style={{ margin: "0 0 14px", font: `700 30px/1.15 ${FONTS.script}`, color: C.raspDeep, overflowWrap: "anywhere" }}>{greeting}</p></Reveal>}
          {body.map((para, i) => (
            <Reveal key={i} settled={unrolled} reduced={reduced} delay={0.8 + i * 0.22}>
              <p style={{ margin: "0 0 16px", font: `400 17.5px/1.72 ${FONTS.serif}`, whiteSpace: "pre-line", overflowWrap: "anywhere" }}>
                {i === 0 ? <DropCap text={para} /> : para}
              </p>
            </Reveal>
          ))}
          {signoff && (
            <Reveal settled={unrolled} reduced={reduced} delay={1.2 + body.length * 0.18}>
              <p style={{ margin: "6px 0 0", textAlign: "right", font: `700 26px/1.25 ${FONTS.script}`, color: C.raspDeep, whiteSpace: "pre-line", overflowWrap: "anywhere" }}>{signoff}</p>
            </Reveal>
          )}
          {!signoff && senderName && (
            <Reveal settled={unrolled} reduced={reduced} delay={1.2 + body.length * 0.18}>
              <p style={{ margin: "6px 0 0", textAlign: "right", font: `700 26px ${FONTS.script}`, color: C.raspDeep }}>— {senderName}</p>
            </Reveal>
          )}
          {/* a little chocolate stamp */}
          <div aria-hidden style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 8, font: `600 10.5px ${FONTS.ui}`, letterSpacing: ".2em", color: "#A0785E" }}>
            <span style={{ flex: 1, height: 1, background: "rgba(166,122,42,.35)" }} />
            MADE WITH 100% REAL FEELINGS
            <span style={{ flex: 1, height: 1, background: "rgba(166,122,42,.35)" }} />
          </div>
        </motion.article>
        {/* the paper roll riding down the unrolling edge */}
        {!reduced && !unrolled && (
          <motion.div
            aria-hidden
            initial={{ top: 26 }}
            animate={{ top: "100%" }}
            transition={{ duration: 1.8, delay: 0.5, ease: [0.4, 0.1, 0.2, 1] }}
            style={{ position: "absolute", left: -6, right: -6, height: 26, marginTop: -13, borderRadius: 13, background: `linear-gradient(180deg, #FBEBD6, ${C.cream} 35%, #E9D3B6 70%, #CDB08C)`, boxShadow: "0 8px 14px rgba(0,0,0,.35)", zIndex: 4 }}
          />
        )}
      </div>

      <Reveal settled={unrolled} reduced={reduced} delay={0.2}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: 26 }}>
          {sticker("c3-letter", 104)}
          <button
            type="button"
            onClick={onNext}
            style={{ minHeight: 54, padding: "14px 28px", borderRadius: 18, border: 0, background: C.rasp, color: "#fff", font: `700 17px ${FONTS.ui}`, boxShadow: `0 5px 0 ${C.raspDeep}, 0 16px 30px -14px rgba(0,0,0,.6)`, cursor: "pointer" }}
          >
            {nextLabel}
          </button>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })}
            style={{ minHeight: 44, padding: "8px 16px", border: 0, background: "transparent", color: "#E9CDB6", font: `500 14px ${FONTS.ui}`, cursor: "pointer" }}
          >
            ↑ Read it again
          </button>
        </div>
      </Reveal>
    </div>
  );
}

function Reveal({ children, reduced, delay = 0, settled }: { children: ReactNode; reduced: boolean; delay?: number; settled?: boolean }) {
  if (reduced) return <>{children}</>;
  // While the wrapper is still unrolling, paragraphs wait for the roll; once
  // it has settled, anything scrolled into view fades in almost at once.
  if (settled) delay = Math.min(delay, 0.1);
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "0px 0px -8% 0px" }} transition={{ duration: 0.7, delay: Math.min(delay, 1.6), ease: [0.2, 0.8, 0.2, 1] }}>
      {children}
    </motion.div>
  );
}

function DropCap({ text }: { text: string }) {
  const first = Array.from(text)[0] ?? "";
  if (!/[A-Za-zÀ-ɏऀ-ॿ]/.test(first)) return <>{text}</>;
  return (
    <>
      <span
        aria-hidden
        style={{
          float: "left",
          margin: "6px 8px 0 0",
          font: `700 54px/0.8 ${FONTS.serif}`,
          background: "linear-gradient(160deg, #FFF0BF, #E6B85C 40%, #A67A2A 70%, #E6B85C)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          filter: "drop-shadow(0 1px 0 rgba(59,33,23,.35))",
        }}
      >
        {first}
      </span>
      <span className="vw-sr">{first}</span>
      {text.slice(first.length)}
    </>
  );
}

// ── the slab ─────────────────────────────────────────────────────────────────
function Slab({ name, engraving }: { name: string; engraving: string }) {
  const engraved: CSSProperties = {
    color: "#5A3322",
    textShadow: "0 1px 0 rgba(255,214,170,.28), 0 -1px 0 rgba(0,0,0,.55)",
  };
  return (
    <div
      style={{
        position: "relative",
        padding: "22px 22px 34px",
        borderRadius: 18,
        background: "linear-gradient(160deg, #8A5536 0%, #6A3D27 35%, #4E2B1B 100%)",
        boxShadow: "0 26px 40px -20px rgba(0,0,0,.8), inset 0 2px 0 rgba(255,214,170,.35), inset 0 -4px 0 rgba(0,0,0,.35), inset 0 0 0 8px rgba(0,0,0,.08)",
        textAlign: "center",
        overflow: "hidden",
      }}
    >
      {/* bevelled inner panel */}
      <div style={{ position: "absolute", inset: 10, borderRadius: 12, boxShadow: "inset 2px 2px 0 rgba(0,0,0,.35), inset -2px -2px 0 rgba(255,214,170,.18)", pointerEvents: "none" }} />
      {/* gloss sweep */}
      <div className="ck-shimmer" style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 18, pointerEvents: "none" }} />
      <div aria-hidden style={{ position: "absolute", left: "8%", top: 8, width: "45%", height: 18, borderRadius: 99, background: "linear-gradient(90deg, rgba(255,255,255,.18), transparent)", filter: "blur(2px)" }} />
      <div style={{ position: "relative", font: `700 13px ${FONTS.ui}`, letterSpacing: ".3em", ...engraved }}>FOR</div>
      <div style={{ position: "relative", margin: "0 0 6px", font: `700 clamp(40px, 12vw, 54px)/1.05 ${FONTS.script}`, overflowWrap: "anywhere", ...engraved }}>{name || "you"}</div>
      {engraving && (
        <div style={{ position: "relative", font: `italic 600 17px/1.45 ${FONTS.serif}`, overflowWrap: "anywhere", color: "#E9C27A", textShadow: "0 1px 0 rgba(0,0,0,.55), 0 0 12px rgba(230,184,92,.25)" }}>“{engraving}”</div>
      )}
    </div>
  );
}
