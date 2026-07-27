"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Confetti from "./Confetti";

type Phase = "sealed" | "opening" | "open";

// A clean, classic wax-sealed envelope. The top flap + bottom pocket meet at the
// centre, sealed by the wax heart. Tap the seal → the flap lifts from its top hinge,
// the letter rises out with a burst of hearts, then unfolds into the handwritten note.
export default function WaxSealLetter({
  petName,
  letterBody,
  signature,
  senderName,
}: {
  petName: string;
  letterBody: string;
  signature: string;
  senderName: string;
}) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("sealed");
  const [confetti, setConfetti] = useState(false);
  const paras = letterBody.split(/\n{2,}|\n/).map((p) => p.trim()).filter(Boolean);
  const opening = phase === "opening";

  const open = () => {
    if (phase !== "sealed") return;
    setPhase("opening");
    setConfetti(true);
    setTimeout(() => setConfetti(false), 2200);
    setTimeout(() => setPhase("open"), reduce ? 150 : 900);
  };

  return (
    <div className="relative mx-auto w-full max-w-xl" style={{ perspective: 1500 }}>
      {confetti && <Confetti originX={50} originY={44} />}

      <AnimatePresence mode="wait">
        {phase !== "open" ? (
          <motion.div key="env" exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.25 } }}>
            <motion.button
              onClick={open}
              aria-label="Tap the seal to open the letter"
              className="relative block w-full"
              style={{ aspectRatio: "16 / 10", transformStyle: "preserve-3d" }}
              whileHover={phase === "sealed" ? { scale: 1.015 } : undefined}
            >
              {/* base body (the inside/back you see behind the flaps) */}
              <div
                className="absolute inset-0 rounded-[24px]"
                style={{ background: "linear-gradient(160deg,#efdcc6,#e5caad)", border: "1px solid #d8bf9f", boxShadow: "var(--mu-shadow-paper)" }}
              />

              {/* bottom pocket (front), point at 48% */}
              <div aria-hidden className="absolute inset-0 overflow-hidden rounded-[24px]">
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#f6e7d4,#eddabf)", clipPath: "polygon(0% 100%, 100% 100%, 50% 48%)" }} />
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 47.4%, rgba(255,255,255,.55) 48%, transparent 48.7%)", clipPath: "polygon(0% 100%, 100% 100%, 50% 48%)" }} />
              </div>

              {/* the letter — hidden when sealed, rises out while opening */}
              <motion.div
                className="absolute left-1/2 rounded-lg bg-[#fffdf8]"
                style={{ top: "14%", width: "80%", height: "70%", x: "-50%", border: "1px solid var(--mu-paper-edge)", boxShadow: "0 10px 22px -12px rgba(90,48,56,.4)", zIndex: 1 }}
                initial={false}
                animate={opening ? { opacity: 1, y: reduce ? 0 : -56 } : { opacity: 0, y: 8 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="mu-script flex h-full items-start justify-center pt-5 text-lg mu-sepia">a little note…</div>
              </motion.div>

              {/* top flap — hinged at the very top, point at 56% */}
              <motion.div
                aria-hidden
                className="absolute inset-x-0 top-0 origin-top"
                style={{ height: "56%", clipPath: "polygon(0 0, 100% 0, 50% 100%)", background: "linear-gradient(160deg,#ead4ba,#dec5a5)", filter: "drop-shadow(0 5px 5px rgba(90,60,30,.16))", zIndex: 3, backfaceVisibility: "hidden", borderRadius: "24px 24px 0 0" }}
                initial={false}
                animate={opening ? { rotateX: reduce ? 0 : -172 } : { rotateX: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />

              {/* wax seal — centred exactly where the flap tip meets the pocket */}
              <motion.span
                className="absolute left-1/2 z-[4]"
                style={{ top: "52%", x: "-50%", y: "-50%" }}
                initial={false}
                animate={opening ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <span className="mu-seal mu-anim-glow mu-script grid place-items-center rounded-full text-3xl sm:text-4xl" style={{ width: "clamp(64px,14vw,84px)", height: "clamp(64px,14vw,84px)" }}>
                  ♥
                </span>
              </motion.span>
            </motion.button>

            {phase === "sealed" && <p className="mu-script mt-5 text-center text-xl mu-sepia">tap the seal to open</p>}
          </motion.div>
        ) : (
          <motion.div
            key="letter"
            className="mu-paper p-6 sm:p-10"
            initial={{ opacity: 0, y: reduce ? 0 : 30, scale: reduce ? 1 : 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mu-script text-3xl mu-sepia">{petName?.trim() ? `${petName},` : "my love,"}</p>
            {paras.map((p, i) => (
              <motion.p
                key={i}
                className="mu-serif mt-4 text-lg leading-relaxed sm:text-xl"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.12, duration: 0.5 }}
              >
                {p}
              </motion.p>
            ))}
            <p className="mu-script mt-6 text-right text-3xl mu-rose-deep">{signature?.trim() || "yours, endlessly."}</p>
            {senderName?.trim() && <p className="mu-script text-right text-2xl mu-sepia" style={{ marginTop: 2 }}>— {senderName}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
