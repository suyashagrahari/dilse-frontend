"use client";

// ─── The letter: drag it up out of the envelope, read it on blush paper ──────
//
// The envelope slides back in with its seal broken; the letter peeks out of
// the pocket and follows the finger up (framer drag, spring). Past ~90 px it
// is pulled out and the reading view opens: ruled blush paper, the greeting in
// script, the rest typed out (skippable), signed "— {sender}" with the chosen
// kiss stamped beside it. Tap fallback: "Pull it out". Long letters scroll
// inside the paper.

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Typewriter, useReducedMotion, haptic } from "../../_valentine/kit";
import { FONTS, VW } from "../../_valentine/theme";
import { EnvelopeBack, EnvelopeFront, KissStamp, type KissStyle, type ShadeId } from "./kissArt";

function splitGreeting(letter: string): { greeting: string; body: string } {
  const text = letter.replace(/\r\n/g, "\n").trim();
  const nl = text.indexOf("\n");
  const first = nl === -1 ? text : text.slice(0, nl);
  if (nl !== -1 && first.length > 0 && first.length <= 56) return { greeting: first.trim(), body: text.slice(nl).replace(/^\n+/, "") };
  return { greeting: "", body: text };
}

/** "…\nAarav" at the very end becomes the script signature, so it isn't signed twice. */
function splitSignoff(body: string, sender: string): { body: string; signoff: string } {
  const first = sender.trim().split(/\s+/)[0]?.toLowerCase();
  const m = body.match(/\n([^\n]{1,40})\s*$/);
  if (first && m && m[1].toLowerCase().includes(first)) return { body: body.slice(0, m.index).replace(/\s+$/, ""), signoff: m[1].trim().replace(/^[-—–\s]+/, "") };
  return { body, signoff: "" };
}

export default function KissLetter({
  letter,
  recipientName,
  senderName,
  kind,
  shade,
  sticker,
  bottomPad,
  onNext,
}: {
  letter: string;
  recipientName: string;
  senderName: string;
  kind: KissStyle;
  shade: ShadeId;
  sticker: React.ReactNode;
  bottomPad: number;
  onNext: () => void;
}) {
  const reduced = useReducedMotion();
  const [out, setOut] = useState(false);
  const [done, setDone] = useState(false);
  const { greeting, body: rawBody } = splitGreeting(letter || "");
  const { body, signoff } = splitSignoff(rawBody, senderName);
  const signed = signoff || senderName.trim();

  const pull = () => {
    if (out) return;
    haptic([10, 30, 10]);
    setOut(true);
  };

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: out ? "flex-start" : "center", padding: `64px 18px ${bottomPad}px`, gap: 14 }}>
      <AnimatePresence mode="wait">
        {!out ? (
          <motion.div
            key="env"
            initial={reduced ? false : { y: 260, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { y: 220, opacity: 0, transition: { duration: 0.45 } }}
            transition={{ type: "spring", stiffness: 160, damping: 20 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, width: "100%" }}
          >
            <p style={{ margin: 0, font: `600 12px ${FONTS.ui}`, letterSpacing: ".2em", textTransform: "uppercase", color: VW.inkSoft }}>Sealed with a kiss</p>
            <h2 style={{ margin: 0, font: `700 clamp(26px, 7.4vw, 34px)/1.15 ${FONTS.serif}`, color: VW.ink, textAlign: "center" }}>There&apos;s a letter inside</h2>

            <div style={{ position: "relative", width: "min(84vw, 340px)", aspectRatio: "300 / 200", marginTop: 110 }}>
              <div style={{ position: "absolute", inset: 0 }}>
                <EnvelopeBack open />
              </div>
              <motion.div
                animate={reduced ? undefined : { y: [0, -10, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                style={{ position: "absolute", left: "9%", right: "9%", top: "-34%", bottom: "4%" }}
              >
              <motion.div
                drag={reduced ? false : "y"}
                dragConstraints={{ top: -240, bottom: 0 }}
                dragElastic={0.18}
                dragSnapToOrigin
                onDragEnd={(_, info) => {
                  if (info.offset.y < -80 || info.velocity.y < -500) pull();
                }}
                onTap={pull}
                role="button"
                tabIndex={0}
                aria-label="Pull the letter out"
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && pull()}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 10,
                  background: "repeating-linear-gradient(180deg, transparent 0 21px, rgba(224,36,94,.12) 21px 22px), #FFF8F1",
                  boxShadow: "0 -6px 20px -10px rgba(59,10,30,.35)",
                  padding: "14px 16px",
                  cursor: "grab",
                  touchAction: "none",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span style={{ width: 38, height: 5, borderRadius: 9, background: "rgba(157,23,77,.25)" }} />
                <span style={{ font: `700 22px/1.1 ${FONTS.script}`, color: VW.paperInk, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>For {recipientName || "you"}</span>
                <KissStamp kind={kind} shade={shade} size={40} style={{ transform: "rotate(-12deg)" }} />
              </motion.div>
              </motion.div>
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                <EnvelopeFront />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, font: `600 14px ${FONTS.ui}`, color: VW.inkSoft }}>
              <motion.span aria-hidden animate={reduced ? undefined : { y: [0, -6, 0] }} transition={{ duration: 1.1, repeat: Infinity }} style={{ display: "inline-block", fontSize: 18 }}>
                ↑
              </motion.span>
              Drag the letter up
            </div>
            <button type="button" onClick={pull} style={{ minHeight: 48, padding: "12px 24px", borderRadius: 999, border: `1.5px solid ${VW.edge}`, background: "rgba(255,255,255,.75)", color: VW.ink, font: `600 15px ${FONTS.ui}`, cursor: "pointer" }}>
              Pull it out 💌
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="read"
            initial={reduced ? false : { y: 120, opacity: 0, scale: 0.92 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 150, damping: 20 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: "100%" }}
          >
            <div style={{ width: 84, height: 84, marginBottom: -26, position: "relative", zIndex: 2 }}>{sticker}</div>
            <article
              style={{
                position: "relative",
                width: "min(100%, 440px)",
                maxHeight: "64dvh",
                overflowY: "auto",
                padding: "30px 22px 24px 30px",
                borderRadius: 18,
                background: "linear-gradient(90deg, transparent 0 18px, rgba(224,36,94,.22) 18px 19.5px, transparent 19.5px), #FFF8F1",
                color: VW.paperInk,
                textAlign: "left",
                boxShadow: "0 30px 60px -30px rgba(59,10,30,.55), 0 2px 0 rgba(255,255,255,.6) inset",
                border: "1px solid #F6D2DE",
                font: `400 17px/29px ${FONTS.serif}`,
                overscrollBehavior: "contain",
              }}
            >
              {greeting && <p style={{ margin: "0 0 4px", font: `700 30px/36px ${FONTS.script}`, color: "#9D174D", overflowWrap: "anywhere" }}>{greeting}</p>}
              <div style={{ backgroundImage: "repeating-linear-gradient(180deg, transparent 0 27px, rgba(224,36,94,.13) 27px 28px, transparent 28px 29px)" }}>
                <Typewriter text={body} speed={28} onDone={() => setDone(true)} caretColor="#E0245E" style={{ overflowWrap: "anywhere" }} />
              </div>
              <AnimatePresence>
                {done && (
                  <motion.div
                    initial={reduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, marginTop: 12 }}
                  >
                    {signed && <span style={{ font: `700 26px ${FONTS.script}`, color: VW.paperInk, overflowWrap: "anywhere" }}>— {signed}</span>}
                    <motion.span
                      initial={reduced ? false : { scale: 2.4, opacity: 0, rotate: -30 }}
                      animate={{ scale: 1, opacity: 1, rotate: -14 }}
                      transition={{ type: "spring", stiffness: 380, damping: 14, delay: 0.25 }}
                      style={{ display: "inline-block" }}
                    >
                      <KissStamp kind={kind} shade={shade} size={58} face={false} />
                    </motion.span>
                  </motion.div>
                )}
              </AnimatePresence>
            </article>
            <button
              type="button"
              onClick={onNext}
              style={{ minHeight: 54, padding: "14px 28px", borderRadius: 18, border: 0, background: VW.accent, color: VW.accentInk, font: `700 17px ${FONTS.ui}`, boxShadow: `0 5px 0 ${VW.accentDeep}, 0 16px 30px -14px rgba(0,0,0,.4)`, cursor: "pointer", opacity: done ? 1 : 0.7 }}
            >
              {done ? "On to the Kiss-Cam 📸" : "Skip to the Kiss-Cam →"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
