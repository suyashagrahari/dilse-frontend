"use client";

// ─── TeddyLetter — the teddy waddles in carrying the envelope ────────────────
//
// deliver: the dressed teddy waddles in from the left holding a pink envelope
//          in its paws, hops, "For you! 💌" (GIF t3). Tap the envelope / the
//          teddy / the button.
// reading: the envelope flies up, the flap opens and the letter grows into a
//          sheet of lined notebook paper with a felt-stitch border. The teddy
//          retires to the bottom-right corner and peeks + waves while they
//          read. Greeting / sign-off in script, body in the rounded face.

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FONTS } from "../../_valentine/theme";
import { haptic } from "../../_valentine/kit";
import { T, Teddy, type Fur, type ItemId } from "./teddyArt";
import { primaryBtn } from "./TeddyWardrobe";

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

/** The envelope, in teddy coordinates (drawn between the body and the paws). */
export const EnvelopeArt = (
  <g>
    <rect x="60" y="146" width="80" height="54" rx="6" fill="#FFE3EE" stroke="#E7A3BE" strokeWidth="1.5" transform="rotate(-4 100 173)" />
    <path d="M60 150 L100 178 L140 150" fill="none" stroke="#E7A3BE" strokeWidth="1.5" transform="rotate(-4 100 173)" />
    <path d="M100 184 C93 178 89 175 89 170 C89 166.5 91.5 164 95 164 C97.5 164 99.3 165.3 100 167 C100.7 165.3 102.5 164 105 164 C108.5 164 111 166.5 111 170 C111 175 107 178 100 184 Z" fill="#E0457B" />
  </g>
);

export default function TeddyLetter({
  letter,
  senderName,
  teddyName,
  fur,
  worn,
  reduced,
  preview,
  sticker,
  onNext,
}: {
  letter: string;
  senderName: string;
  teddyName: string;
  fur: Fur;
  worn: ItemId[];
  reduced: boolean;
  preview: boolean;
  sticker: (id: string, size: number, style?: CSSProperties) => ReactNode;
  onNext: () => void;
}) {
  const [phase, setPhase] = useState<"deliver" | "reading">("deliver");
  const [arrived, setArrived] = useState(reduced);
  const { greeting, body, signoff } = useMemo(() => splitLetter(letter), [letter]);

  useEffect(() => {
    if (reduced) return;
    const t = window.setTimeout(() => setArrived(true), 1700);
    return () => window.clearTimeout(t);
  }, [reduced]);

  const open = () => {
    if (phase !== "deliver") return;
    haptic([10, 30, 10]);
    setPhase("reading");
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  return (
    <div style={{ width: "100%", minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", padding: `58px 16px ${preview ? 140 : 64}px`, textAlign: "center" }}>
      <AnimatePresence mode="wait">
        {phase === "deliver" ? (
          <motion.div key="deliver" exit={{ opacity: 0, y: -20 }} style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <p style={{ margin: "10px 0 0", font: `600 12.5px ${FONTS.ui}`, letterSpacing: ".2em", textTransform: "uppercase", color: "#9B7FB2" }}>Special delivery</p>
            <h2 style={{ margin: "4px 0 0", font: `700 clamp(28px, 8.4vw, 36px)/1.15 ${FONTS.serif}`, color: T.ink }}>{teddyName} brought you something</h2>
            <div style={{ position: "relative", width: "100%", height: 340, marginTop: 10 }}>
              {/* floor */}
              <div aria-hidden style={{ position: "absolute", left: -16, right: -16, bottom: 0, height: 70, background: "linear-gradient(180deg,#E9CDB0,#D9B48E)", borderTop: "4px solid #C99B6E" }} />
              <AnimatePresence>
                {arrived && (
                  <motion.div key="bubble" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 16 }} style={{ position: "absolute", left: "50%", top: 92, marginLeft: 40, padding: "8px 14px", borderRadius: 16, background: "#fff", boxShadow: "0 10px 20px -12px rgba(0,0,0,.4)", font: `700 15px ${FONTS.ui}`, color: "#D9628F", zIndex: 2 }}>
                    For you! 💌
                  </motion.div>
                )}
              </AnimatePresence>
              <div style={{ position: "absolute", left: 0, top: 6 }}>{arrived && sticker("t3-letter", 80)}</div>
              <motion.button
                type="button"
                onClick={open}
                aria-label="Take the envelope from the teddy"
                initial={reduced ? false : { x: -320 }}
                animate={{ x: 0, y: arrived && !reduced ? [0, -16, 0] : 0 }}
                transition={{ x: { duration: 1.6, ease: "linear" }, y: { duration: 0.5, delay: 0.05 } }}
                style={{ position: "absolute", left: "50%", bottom: 20, marginLeft: -100, width: 200, border: 0, padding: 0, background: "transparent", cursor: "pointer" }}
              >
                <div className={!arrived && !reduced ? "td-waddle" : undefined}>
                  <Teddy fur={fur} worn={worn} pose="carry" carry={EnvelopeArt} size={200} />
                </div>
              </motion.button>
            </div>
            <motion.button type="button" onClick={open} initial={{ opacity: 0 }} animate={{ opacity: arrived ? 1 : 0 }} style={{ ...primaryBtn, marginTop: 18 }}>
              Open the envelope 💌
            </motion.button>
          </motion.div>
        ) : (
          <motion.div key="reading" initial={reduced ? { opacity: 0 } : { opacity: 0, y: 120, scale: 0.4 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 140, damping: 18 }} style={{ width: "100%", maxWidth: 440, transformOrigin: "50% 60%" }}>
            <p style={{ margin: "6px 0 12px", font: `600 12.5px ${FONTS.ui}`, letterSpacing: ".2em", textTransform: "uppercase", color: "#9B7FB2" }}>From {senderName || "someone who loves you"}, via {teddyName}</p>
            <Notebook greeting={greeting} body={body} signoff={signoff} senderName={senderName} reduced={reduced} />
            <button type="button" onClick={onNext} style={{ ...primaryBtn, marginTop: 24 }}>
              Our cork board 📌
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* the teddy peeking from the corner while they read */}
      {phase === "reading" && (
        <motion.div aria-hidden initial={{ y: 160 }} animate={{ y: 0 }} transition={{ delay: 0.6, type: "spring", stiffness: 120, damping: 14 }} style={{ position: "fixed", right: 6, bottom: -18, width: 112, zIndex: 30, pointerEvents: "none" }}>
          <div className={reduced ? undefined : "td-peek"}>
            <Teddy fur={fur} worn={worn} pose="wave" size={112} />
          </div>
        </motion.div>
      )}
    </div>
  );
}

function Notebook({ greeting, body, signoff, senderName, reduced }: { greeting: string | null; body: string[]; signoff: string | null; senderName: string; reduced: boolean }) {
  const LH = 30;
  const P = (children: ReactNode, i: number) =>
    reduced ? (
      <div key={i}>{children}</div>
    ) : (
      <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "0px 0px -6% 0px" }} transition={{ duration: 0.6, delay: Math.min(0.15 * i, 0.6) }}>
        {children}
      </motion.div>
    );
  return (
    <article
      style={{
        position: "relative",
        padding: 10,
        borderRadius: 22,
        background: T.pink,
        boxShadow: "0 30px 50px -26px rgba(74,51,38,.6)",
        textAlign: "left",
      }}
    >
      <div
        style={{
          position: "relative",
          borderRadius: 14,
          outline: "2px dashed rgba(255,255,255,.9)",
          outlineOffset: 5,
          background: `linear-gradient(90deg, transparent 0 38px, rgba(255,111,163,.45) 38px 40px, transparent 40px), repeating-linear-gradient(180deg, transparent 0 ${LH - 1}px, #D6E6F6 ${LH - 1}px ${LH}px), #FFFDF8`,
          backgroundPosition: `0 0, 0 ${22}px, 0 0`,
          padding: `22px 18px 26px 52px`,
          color: T.ink,
          font: `400 16.5px/${LH}px ${FONTS.ui}`,
        }}
      >
        {/* binder holes */}
        {[0, 1, 2].map((k) => (
          <span key={k} aria-hidden style={{ position: "absolute", left: 12, top: `${18 + k * 32}%`, width: 14, height: 14, borderRadius: 14, background: T.pink, boxShadow: "inset 0 2px 3px rgba(0,0,0,.18)" }} />
        ))}
        {greeting && P(<p style={{ margin: `0 0 ${LH / 2}px`, font: `700 28px/${LH * 1.2}px ${FONTS.script}`, color: "#D9628F", overflowWrap: "break-word" }}>{greeting}</p>, 0)}
        {body.map((para, i) => P(<p style={{ margin: `0 0 ${LH}px`, whiteSpace: "pre-line", overflowWrap: "anywhere" }}>{para}</p>, i + 1))}
        {signoff
          ? P(<p style={{ margin: 0, textAlign: "right", font: `700 26px/${LH * 1.1}px ${FONTS.script}`, color: "#D9628F", whiteSpace: "pre-line", overflowWrap: "break-word" }}>{signoff}</p>, body.length + 1)
          : senderName && P(<p style={{ margin: 0, textAlign: "right", font: `700 26px ${FONTS.script}`, color: "#D9628F" }}>— {senderName}</p>, body.length + 1)}
        {greeting && (
        <svg aria-hidden viewBox="0 0 60 30" width="60" height="30" style={{ position: "absolute", right: 14, top: 10, opacity: 0.85 }}>
          <path d="M14 26 C6 20 2 16 2 11 C2 7 5 4 9 4 C11 4 13 5 14 7 C15 5 17 4 19 4 C23 4 26 7 26 11 C26 16 22 20 14 26 Z" fill="none" stroke="#FF8FB8" strokeWidth="2" />
          <path d="M42 22 C37 18 34 16 34 12 C34 9.5 36 8 38.5 8 C40 8 41.3 8.8 42 10 C42.7 8.8 44 8 45.5 8 C48 8 50 9.5 50 12 C50 16 47 18 42 22 Z" fill="#FFC8DD" />
        </svg>
        )}
      </div>
    </article>
  );
}
