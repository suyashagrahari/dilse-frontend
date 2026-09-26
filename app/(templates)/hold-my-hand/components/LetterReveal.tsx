"use client";

/**
 * The payoff, after the hold.
 *
 * The letter is NOT shown straight away. They get a sealed envelope first and
 * open it themselves — a minute of holding on deserves one more small moment of
 * anticipation, and tapping the seal is the first thing they do with their hand
 * free. Then: the letter on paper, the photographs (each one opens into its own
 * little letter), and the card they can post.
 */

import { useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import MemoryCards from "./MemoryCards";
import ResultCard, { type ResultStats } from "./ResultCard";
import SectionTitle from "./SectionTitle";
import { HMH, LOVE, cropStyle, mainCrop, type HoldData } from "./types";

export default function LetterReveal({
  data,
  stats,
  reduced,
  mode,
  brandBadge,
}: {
  data: HoldData;
  stats: ResultStats | null;
  reduced: boolean;
  mode: "preview" | "live";
  brandBadge: ReactNode;
}) {
  const [phase, setPhase] = useState<"sealed" | "opening" | "open">("sealed");
  const [step, setStep] = useState(0);

  const lines = useMemo(
    () => data.letter.split("\n").map((l) => l.trim()).filter(Boolean),
    [data.letter],
  );

  // Paragraph by paragraph, once the paper is out.
  useEffect(() => {
    if (phase !== "open" || step >= lines.length) return;
    const t = setTimeout(() => setStep((s) => s + 1), reduced ? 80 : 650);
    return () => clearTimeout(t);
  }, [phase, step, lines.length, reduced]);

  /**
   * On a phone the finger is still on the glass when the hold ends, and the
   * envelope appears right under it — so lifting that finger lands a "tap" on
   * the envelope and it opened by itself. It now opens only for a press that
   * STARTED on it (or a keyboard activation, which has `detail === 0`).
   */
  const pressedRef = useRef(false);
  const arm = () => { pressedRef.current = true; };

  const open = (e?: MouseEvent) => {
    if (phase !== "sealed") return;
    if (e && e.detail !== 0 && !pressedRef.current) return;
    if (reduced) { setPhase("open"); return; }
    setPhase("opening");
    setTimeout(() => setPhase("open"), 1100);
  };

  const done = phase === "open" && step >= lines.length;
  const greeting = data.recipientName ? `my dearest ${data.recipientName},` : "hey you,";

  return (
    <main
      className="relative w-full"
      // `clip`, not `hidden`: hidden turns this element into its own scroll
      // container, and on iPhone Safari a vertical swipe that starts inside a
      // nested scroller can get stuck there instead of scrolling the page.
      style={{ minHeight: "100dvh", background: LOVE.bg, fontFamily: HMH.body, color: "#fff", overflowX: "clip" }}
    >
      {brandBadge}

      {/* Soft glow, in its own clipped box so it can never widen the page */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden" style={{ height: 520 }}>
        <span className="absolute left-1/2 -translate-x-1/2" style={{ top: -120, width: 520, height: 520, borderRadius: "50%", background: LOVE.rose, opacity: 0.22, filter: "blur(90px)" }} />
      </div>

      <div className="relative mx-auto w-full max-w-[560px] lg:max-w-[640px] px-5 sm:px-8 pt-24 sm:pt-28 pb-16 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {phase !== "open" ? (
            <motion.div
              key="envelope"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30, scale: 0.94 }}
              transition={{ duration: 0.5 }}
              className="w-full flex flex-col items-center"
              style={{ minHeight: "calc(100dvh - 180px)", justifyContent: "center" }}
            >
              <p className="text-center" style={{ fontFamily: HMH.script, fontSize: 34, color: LOVE.blush, lineHeight: 1.1 }}>
                you held on.
              </p>
              <p className="mt-2 text-center" style={{ fontSize: 14, color: "rgba(255,255,255,.65)" }}>
                {data.senderName ? `${data.senderName} left you something.` : "someone left you something."}
              </p>

              <Envelope
                opening={phase === "opening"}
                onOpen={open}
                onArm={arm}
                to={data.recipientName}
                reduced={reduced}
              />

              <motion.button
                onPointerDown={arm}
                onClick={open}
                whileTap={{ scale: 0.96 }}
                className="mt-2 rounded-full px-6 py-3 text-sm font-bold"
                style={{
                  background: `linear-gradient(135deg, ${LOVE.rose}, ${LOVE.roseDeep})`,
                  color: "#fff",
                  fontFamily: HMH.display,
                  boxShadow: "0 14px 30px -10px rgba(224,69,123,.7)",
                  opacity: phase === "opening" ? 0 : 1,
                  transition: "opacity .3s",
                }}
              >
                tap to open 💌
              </motion.button>
            </motion.div>
          ) : (
            <motion.article
              key="letter"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 140, damping: 20 }}
              className="relative w-full rounded-[22px] px-6 py-8 sm:px-10 sm:py-11"
              style={{
                background: `repeating-linear-gradient(180deg, transparent 0 33px, rgba(184,35,90,.07) 33px 34px), ${LOVE.paper}`,
                color: LOVE.ink,
                boxShadow: "0 40px 80px -30px rgba(0,0,0,.75), inset 0 0 0 1px rgba(0,0,0,.04)",
              }}
            >
              {/* The main photo, as a stamp in the corner */}
              {data.photoUrl && (
                <div
                  className="absolute -top-5 right-5 sm:right-8"
                  style={{
                    width: 76, height: 90, padding: 5, background: "#fff", transform: "rotate(6deg)",
                    boxShadow: "0 10px 22px -8px rgba(0,0,0,.45)",
                    outline: `2px dashed ${LOVE.paperEdge}`, outlineOffset: -4,
                  }}
                >
                  <span className="block w-full h-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={data.photoUrl} alt="" style={cropStyle(mainCrop(data))} />
                  </span>
                </div>
              )}

              <p style={{ fontFamily: HMH.script, fontSize: 30, color: LOVE.roseDeep, lineHeight: 1.15, paddingRight: 84 }}>
                {greeting}
              </p>

              <div className="mt-6 space-y-4">
                {lines.map((line, i) => (
                  <p
                    key={i}
                    className="transition-all duration-700"
                    style={{
                      fontSize: 16,
                      lineHeight: 1.85,
                      color: LOVE.ink,
                      opacity: i < step ? 1 : 0,
                      transform: i < step ? "translateY(0)" : "translateY(10px)",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {line}
                  </p>
                ))}
              </div>

              <div
                className="mt-8 flex flex-col items-end transition-opacity duration-700"
                style={{ opacity: done ? 1 : 0 }}
              >
                <span style={{ fontSize: 13, color: LOVE.inkSoft }}>forever holding your hand,</span>
                {data.senderName && (
                  <span style={{ fontFamily: HMH.script, fontSize: 32, color: LOVE.roseDeep, lineHeight: 1.2 }}>
                    {data.senderName}
                  </span>
                )}
              </div>
            </motion.article>
          )}
        </AnimatePresence>

        {phase === "open" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: done ? 1 : 0 }}
            transition={{ duration: 0.8 }}
            className="w-full flex flex-col items-center"
          >
            <MemoryCards memories={data.memories} reduced={reduced} />

            {stats && (
              <section className="w-full mt-16 flex flex-col items-center" aria-label="Your result card">
                <SectionTitle>your hold, in one picture</SectionTitle>
                <p className="mt-1 mb-6 text-center" style={{ fontSize: 13, color: "rgba(255,255,255,.6)" }}>
                  save it, post it on your story, make them blush.
                </p>
                <ResultCard
                  stats={stats}
                  recipientName={data.recipientName}
                  senderName={data.senderName}
                  photoUrl={data.photoUrl}
                  photoCrop={mainCrop(data)}
                  letter={data.letter}
                  durationMs={data.durationMs}
                />
              </section>
            )}

            {mode === "live" && (
              <Link
                href="/templates"
                className="mt-12 rounded-full px-5 py-2.5 text-xs font-semibold no-underline"
                style={{ color: "#fff", background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.18)", fontFamily: HMH.display, letterSpacing: ".04em" }}
              >
                make one for someone →
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </main>
  );
}

/** A CSS envelope: the flap swings open, the paper slides up. */
function Envelope({
  opening,
  onOpen,
  onArm,
  to,
  reduced,
}: {
  opening: boolean;
  onOpen: (e: MouseEvent) => void;
  onArm: () => void;
  to: string;
  reduced: boolean;
}) {
  return (
    <motion.button
      type="button"
      onPointerDown={onArm}
      onClick={onOpen}
      aria-label="Open the letter"
      // Still, on purpose — a bobbing letter reads as unsteady. It lifts a
      // touch on hover/tap instead, so it still feels like it wants opening.
      whileHover={opening || reduced ? undefined : { y: -4 }}
      whileTap={opening ? undefined : { scale: 0.98 }}
      className="relative my-10"
      style={{ width: "min(84vw, 380px)", aspectRatio: "1.5 / 1", perspective: 900 }}
    >
      {/* back */}
      <span className="absolute inset-0 rounded-[14px]" style={{ background: "linear-gradient(160deg, #EBA3BA, #D9789A)" }} />

      {/* paper inside */}
      <motion.span
        className="absolute rounded-[10px] flex items-start justify-center pt-4"
        style={{ left: "7%", right: "7%", top: "8%", height: "84%", background: LOVE.paper, boxShadow: "0 4px 12px rgba(0,0,0,.12)", zIndex: 2 }}
        // Hidden while sealed: the gaps between flap and pocket should read as
        // the envelope's side folds, not as strips of paper.
        initial={{ opacity: 0 }}
        animate={opening ? { y: "-58%", opacity: 1 } : { y: 0, opacity: 0 }}
        transition={{ delay: 0.45, duration: 0.6, ease: [0.2, 0.8, 0.3, 1], opacity: { delay: 0.2, duration: 0.2 } }}
      >
        <span style={{ fontFamily: HMH.script, fontSize: 20, color: LOVE.roseDeep }}>
          {to ? `for ${to} 🤍` : "for you 🤍"}
        </span>
      </motion.span>

      {/* front pocket */}
      <span
        className="absolute inset-0 rounded-[14px]"
        style={{
          background: "linear-gradient(170deg, #F7C6D5 0%, #EE9DB8 100%)",
          clipPath: "polygon(0 34%, 50% 70%, 100% 34%, 100% 100%, 0 100%)",
          zIndex: 3,
        }}
      />
      <span
        className="absolute inset-0 rounded-[14px] pointer-events-none"
        style={{ boxShadow: "0 30px 60px -24px rgba(0,0,0,.65)" }}
      />

      {/* flap */}
      <motion.span
        className="absolute left-0 right-0 top-0"
        style={{
          height: "62%",
          transformOrigin: "top center",
          background: "linear-gradient(180deg, #F9D3DF, #EFA7BF)",
          clipPath: "polygon(0 0, 100% 0, 50% 100%)",
          borderRadius: "14px 14px 0 0",
          // Folded back it goes behind the paper; closed it covers it.
          zIndex: opening ? 1 : 4,
        }}
        animate={opening ? { rotateX: 180 } : { rotateX: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />

      {/* wax seal */}
      <motion.span
        className="absolute left-1/2 grid place-items-center"
        style={{
          top: "62%", width: 54, height: 54, marginLeft: -27, marginTop: -27, borderRadius: "50%", zIndex: 5,
          background: `radial-gradient(circle at 35% 30%, #F0648F, ${LOVE.roseDeep} 70%)`,
          boxShadow: "0 6px 14px rgba(120,10,50,.45), inset 0 -3px 6px rgba(0,0,0,.2)",
          color: "#FFE3EC", fontSize: 22,
        }}
        animate={opening ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        ♥
      </motion.span>
    </motion.button>
  );
}
