"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Confetti from "./Confetti";

type Phase = "sealed" | "out" | "open";

// A wax-sealed envelope in three beats:
//  1) sealed  — tap the heart seal
//  2) out     — the flap lifts and the letter (lined paper) slides UP out of the
//               envelope, peeking above it, inviting a tap
//  3) open    — the letter expands to the full handwritten note on lined paper
// Colours are inlined (not scoped .mu-* vars) so the note is always legible.
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
  const greeting = petName?.trim() ? `${petName},` : "my love,";

  const openEnvelope = () => {
    if (phase !== "sealed") return;
    setPhase("out");
    setConfetti(true);
    setTimeout(() => setConfetti(false), 2200);
  };
  const readLetter = () => { if (phase === "out") setPhase("open"); };

  return (
    <div className="relative mx-auto w-full max-w-xl" style={{ perspective: 1600 }}>
      {confetti && <Confetti originX={50} originY={40} />}

      <AnimatePresence mode="wait">
        {phase !== "open" ? (
          <motion.div key="env" exit={{ opacity: 0, scale: 0.94, y: 10, transition: { duration: 0.3 } }} className="flex flex-col items-center">
            {/* aspect box; the letter is allowed to overflow above it while sliding out */}
            <div className="relative w-full" style={{ aspectRatio: "16 / 11", transformStyle: "preserve-3d" }}>
              {/* base body (inside/back) */}
              <div className="absolute inset-0 rounded-[24px]" style={{ background: "linear-gradient(160deg,#efdcc6,#e5caad)", border: "1px solid #d8bf9f", zIndex: 0 }} />

              {/* the letter — hidden inside when sealed; slides up & out when "out" */}
              <motion.button
                type="button"
                onClick={readLetter}
                disabled={phase !== "out"}
                aria-label="Open and read the letter"
                className="mu-lined absolute left-1/2 flex flex-col items-center px-6 pt-7"
                style={{ top: "12%", width: "82%", height: "80%", x: "-50%", zIndex: 2, textAlign: "center", cursor: phase === "out" ? "pointer" : "default" }}
                initial={false}
                animate={phase === "out" ? { y: reduce ? 0 : "-42%", opacity: 1 } : { y: "6%", opacity: 0 }}
                transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                whileHover={phase === "out" && !reduce ? { y: "-45%" } : undefined}
              >
                <span className="mu-script text-3xl" style={{ color: "#b23a5b" }}>{greeting}</span>
                <span className="mu-serif mt-1 text-sm" style={{ color: "#9a7457" }}>a little note is inside…</span>
                <span className="mu-btn mu-sans mt-3 px-4 py-1.5 text-xs" style={{ pointerEvents: "none" }}>tap to read →</span>
              </motion.button>

              {/* bottom pocket (front) — hides the lower half of the letter */}
              <div aria-hidden className="absolute inset-0 overflow-hidden rounded-[24px]" style={{ zIndex: 3 }}>
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#f6e7d4,#eddabf)", clipPath: "polygon(0% 100%, 100% 100%, 50% 46%)" }} />
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 45.4%, rgba(255,255,255,.5) 46%, transparent 46.6%)", clipPath: "polygon(0% 100%, 100% 100%, 50% 46%)" }} />
              </div>

              {/* top flap — hinged at the top, lifts open */}
              <motion.div
                aria-hidden
                className="absolute inset-x-0 top-0 origin-top"
                style={{ height: "52%", clipPath: "polygon(0 0, 100% 0, 50% 100%)", background: "linear-gradient(160deg,#ead4ba,#dec5a5)", filter: "drop-shadow(0 5px 5px rgba(90,60,30,.16))", zIndex: phase === "sealed" ? 4 : 1, backfaceVisibility: "hidden", borderRadius: "24px 24px 0 0" }}
                initial={false}
                animate={phase !== "sealed" ? { rotateX: reduce ? 0 : -172 } : { rotateX: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />

              {/* wax seal — tap to open */}
              <motion.button
                type="button"
                onClick={openEnvelope}
                disabled={phase !== "sealed"}
                aria-label="Tap the seal to open the letter"
                className="absolute left-1/2"
                style={{ top: "48%", x: "-50%", y: "-50%", zIndex: 5, cursor: phase === "sealed" ? "pointer" : "default" }}
                initial={false}
                animate={phase !== "sealed" ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                whileHover={phase === "sealed" ? { scale: 1.06 } : undefined}
              >
                <span className="mu-seal mu-anim-glow grid place-items-center rounded-full text-3xl sm:text-4xl" style={{ width: "clamp(60px,13vw,80px)", height: "clamp(60px,13vw,80px)", color: "#fff" }}>
                  ♥
                </span>
              </motion.button>
            </div>

            <p className="mu-script mt-5 text-center text-xl" style={{ color: "#9a7457" }}>
              {phase === "sealed" ? "tap the seal to open" : "tap the letter to read →"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="letter"
            className="mu-lined pl-12 pr-6 py-8 sm:pl-14 sm:pr-8 sm:py-10"
            initial={{ opacity: 0, y: reduce ? 0 : 30, scale: reduce ? 1 : 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mu-script text-3xl" style={{ color: "#b23a5b" }}>{greeting}</p>
            <div className="mu-lined-body">
              {paras.map((p, i) => (
                <motion.p
                  key={i}
                  className="mu-serif mt-3 text-lg"
                  style={{ color: "var(--mu-ink)" }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.1, duration: 0.5 }}
                >
                  {p}
                </motion.p>
              ))}
            </div>
            <p className="mu-script mt-6 text-right text-3xl" style={{ color: "#b23a5b" }}>{signature?.trim() || "yours, endlessly."}</p>
            {senderName?.trim() && <p className="mu-script text-right text-2xl" style={{ color: "#9a7457", marginTop: 2 }}>— {senderName}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
