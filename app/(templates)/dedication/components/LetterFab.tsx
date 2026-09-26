"use client";

// ─── The letter, on phones — an envelope that waits in the corner ────────────
//
// On a desktop the letter sits beside the radio. On a phone there is no
// "beside", and parking it under the radio buried it below the fold where most
// recipients never scrolled. So on phones it lives in a floating envelope in
// the bottom-right corner — always one tap away, never covering the radio.
//
//   before tune-in   a sealed envelope, "tune in to open"
//   on tune-in       a little note slides out: "Arjun left you a letter"
//   tapped           full-screen: the flap lifts, the letter slides out of the
//                    envelope and unfolds into a scrollable page
//
// It steps aside while a dedication card is on screen (both live at the bottom).

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { BODY_FACE, PALETTE, type Photo } from "./types";
import { AirmailEdge, LetterBody, PAPER_STYLE } from "./LoveLetter";

const SCRIPT = "var(--font-dancing), cursive";

type Phase = "closed" | "envelope" | "opening" | "letter";

export default function LetterFab({
  letter,
  recipient,
  sender,
  photo,
  stationLine,
  tuned,
  hidden,
  reduced,
}: {
  letter: string;
  recipient: string;
  sender: string;
  photo?: Photo;
  stationLine: string;
  tuned: boolean;
  /** A dedication / error card owns the bottom of the screen right now. */
  hidden: boolean;
  reduced: boolean;
}) {
  const [phase, setPhase] = useState<Phase>("closed");
  const [peek, setPeek] = useState(false);
  const [read, setRead] = useState(false);
  const timers = useRef<number[]>([]);

  // The moment the station locks, the envelope announces itself once.
  useEffect(() => {
    if (!tuned) return;
    const a = window.setTimeout(() => setPeek(true), 1400);
    const b = window.setTimeout(() => setPeek(false), 7000);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [tuned]);

  // Page behind the letter must not scroll while it is open.
  const open = phase !== "closed";
  useEffect(() => {
    if (!open) return;
    const el = document.body;
    el.style.overflow = "hidden";
    return () => {
      el.style.overflow = "";
    };
  }, [open]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const text = letter.trim();
  if (!text) return null;

  const openLetter = () => {
    setPeek(false);
    setRead(true);
    if (reduced) {
      setPhase("letter");
      return;
    }
    setPhase("envelope");
    timers.current.push(window.setTimeout(() => setPhase("opening"), 450));
    timers.current.push(window.setTimeout(() => setPhase("letter"), 1350));
  };
  const close = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setPhase("closed");
  };

  return (
    <>
      {/* ── the floating envelope ─────────────────────────────────────── */}
      <AnimatePresence>
        {!hidden && !open && (
          <motion.div
            key="fab"
            className="ded-letter-fab fixed z-[70] flex items-center gap-2"
            style={{ right: 14, bottom: "calc(16px + env(safe-area-inset-bottom, 0px))" }}
            initial={{ opacity: 0, y: 30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
          >
            <AnimatePresence>
              {peek && (
                <motion.button
                  type="button"
                  onClick={openLetter}
                  key="peek"
                  initial={{ opacity: 0, x: 20, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 16, scale: 0.9 }}
                  className="rounded-2xl text-left px-3.5 py-2"
                  style={{
                    background: "linear-gradient(180deg,#fbf5e8,#efe2c6)",
                    boxShadow: "0 14px 30px -12px rgba(0,0,0,.8)",
                    maxWidth: 190,
                  }}
                >
                  <span
                    className="block text-[9px] font-bold uppercase"
                    style={{ fontFamily: BODY_FACE, letterSpacing: ".2em", color: PALETTE.body }}
                  >
                    you&apos;ve got mail
                  </span>
                  <span className="block leading-tight" style={{ fontFamily: SCRIPT, fontSize: 18, color: "#3a2418" }}>
                    {sender ? `${sender} left you a letter` : "a letter for you"}
                  </span>
                </motion.button>
              )}
            </AnimatePresence>

            <motion.button
              type="button"
              onClick={openLetter}
              aria-label={tuned ? "Open your letter" : "Open the sealed letter"}
              whileTap={{ scale: 0.92 }}
              animate={reduced || read ? undefined : { rotate: [0, -6, 6, -4, 0] }}
              transition={reduced || read ? undefined : { duration: 0.9, repeat: Infinity, repeatDelay: 3.2 }}
              className="relative shrink-0"
              style={{ width: 70, height: 50 }}
            >
              {/* envelope body */}
              <span
                className="absolute inset-0 overflow-hidden"
                style={{
                  borderRadius: 7,
                  background: "linear-gradient(160deg,#f6ecd6,#e3cfa8)",
                  boxShadow: "0 12px 26px -8px rgba(0,0,0,.85), 0 0 0 1px rgba(0,0,0,.08)",
                }}
              >
                <span style={{ position: "absolute", inset: 0, transform: "scale(.72)", transformOrigin: "center" }}>
                  <AirmailEdge />
                </span>
                <span
                  className="absolute inset-x-0 top-0"
                  style={{
                    height: "60%",
                    background: "linear-gradient(180deg,#ecdcbc,#d9c39a)",
                    clipPath: "polygon(0 0,100% 0,50% 100%)",
                  }}
                />
              </span>
              {/* wax seal */}
              <span
                className="absolute left-1/2 grid place-items-center rounded-full"
                style={{
                  top: "58%",
                  width: 22,
                  height: 22,
                  transform: "translate(-50%,-50%)",
                  background: `radial-gradient(circle at 35% 30%, #d9534a, ${PALETTE.bodyDeep} 70%)`,
                  color: "#f7d9c4",
                  fontSize: 10,
                  boxShadow: "0 2px 5px rgba(0,0,0,.4)",
                }}
              >
                ♥
              </span>
              {/* unread badge */}
              {!read && (
                <span
                  className="absolute grid place-items-center rounded-full text-[10px] font-bold text-white"
                  style={{
                    top: -7,
                    right: -7,
                    width: 20,
                    height: 20,
                    background: PALETTE.red,
                    boxShadow: `0 0 0 2px #1a0b06, 0 0 12px ${PALETTE.red}`,
                    fontFamily: BODY_FACE,
                  }}
                >
                  1
                </span>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── opened: envelope → letter ─────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="letter-modal"
            className="fixed inset-0 z-[160] flex items-end sm:items-center justify-center"
            style={{ background: "rgba(10,4,2,.84)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label="Your letter"
          >
            {phase !== "letter" ? (
              <div className="absolute inset-0 grid place-items-center" style={{ perspective: 1000 }}>
                <motion.div
                  initial={{ scale: 0.4, y: 160, rotate: -8, opacity: 0 }}
                  animate={{ scale: 1, y: 0, rotate: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="relative"
                  style={{ width: "min(84vw, 360px)", aspectRatio: "16 / 10" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* letter peeking out as the flap lifts */}
                  <motion.div
                    className="absolute"
                    style={{ ...PAPER_STYLE, padding: 0, left: "6%", right: "6%", top: "8%", height: "84%", zIndex: 1 }}
                    initial={{ y: 0 }}
                    animate={{ y: phase === "opening" ? "-55%" : 0 }}
                    transition={{ duration: 0.8, ease: [0.3, 0.7, 0.2, 1], delay: 0.25 }}
                  >
                    <p className="px-4 pt-3" style={{ fontFamily: SCRIPT, fontSize: 22, color: PALETTE.body }}>
                      Dear {recipient || "you"},
                    </p>
                  </motion.div>
                  {/* envelope front */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{
                      zIndex: 2,
                      borderRadius: 10,
                      background: "linear-gradient(160deg,#f3e7cf,#e6d4b1)",
                      clipPath: "polygon(0 0, 50% 55%, 100% 0, 100% 100%, 0 100%)",
                      boxShadow: "0 30px 60px -20px rgba(0,0,0,.9)",
                    }}
                  >
                    <AirmailEdge />
                    <span
                      className="absolute left-0 right-0 bottom-4 text-center"
                      style={{ fontFamily: SCRIPT, fontSize: 24, color: "#3a2418" }}
                    >
                      for {recipient || "you"}
                    </span>
                  </div>
                  {/* the flap */}
                  <motion.div
                    className="absolute inset-x-0 top-0"
                    style={{
                      height: "58%",
                      zIndex: phase === "opening" ? 0 : 3,
                      transformOrigin: "top",
                      background: "linear-gradient(180deg,#eadbbd,#d8c298)",
                      clipPath: "polygon(0 0,100% 0,50% 100%)",
                    }}
                    animate={{ rotateX: phase === "opening" ? 180 : 0 }}
                    transition={{ duration: 0.45, ease: "easeInOut" }}
                  />
                  {/* seal pops off */}
                  <motion.span
                    className="absolute left-1/2 grid place-items-center rounded-full"
                    style={{
                      zIndex: 4,
                      top: "58%",
                      width: 48,
                      height: 48,
                      x: "-50%",
                      y: "-50%",
                      background: `radial-gradient(circle at 35% 30%, #d9534a, ${PALETTE.bodyDeep} 70%)`,
                      color: "#f7d9c4",
                      fontSize: 20,
                      boxShadow: "0 4px 10px rgba(0,0,0,.4)",
                    }}
                    animate={phase === "opening" ? { scale: 0, opacity: 0, rotate: 90 } : { scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    ♥
                  </motion.span>
                </motion.div>
              </div>
            ) : (
              <motion.article
                key="paper"
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 80, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 60 }}
                transition={{ type: "spring", stiffness: 190, damping: 24 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full overflow-y-auto"
                style={{
                  ...PAPER_STYLE,
                  maxWidth: 480,
                  maxHeight: "88dvh",
                  borderRadius: "22px 22px 0 0",
                  paddingBottom: "calc(30px + env(safe-area-inset-bottom, 0px))",
                  overscrollBehavior: "contain",
                }}
              >
                <AirmailEdge />
                <LetterBody text={text} recipient={recipient} sender={sender} photo={photo} stationLine={stationLine} />
              </motion.article>
            )}

            <button
              type="button"
              onClick={close}
              aria-label="Close the letter"
              className="absolute grid place-items-center rounded-full"
              style={{
                top: "calc(14px + env(safe-area-inset-top, 0px))",
                right: 14,
                width: 42,
                height: 42,
                zIndex: 5,
                background: "rgba(255,255,255,.14)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,.25)",
              }}
            >
              <X size={19} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
