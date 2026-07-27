"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { muMedia } from "./assets";

// The "do you miss me too?" question. ONE gif slot at the top:
//  • by default → the penguin asking
//  • No  → it swaps to a crying sticker (cycles through three) + a pleading line
//  • Yes → a full-screen takeover of the two penguins hugging, a line below, a
//          close ✕, and an auto-dismiss after ~4s.
const ASK_GIF = muMedia("miss-you-penguin.gif");
const CRY_GIFS = [
  muMedia("cry-bear.gif"),
  muMedia("cry-panda.gif"),
  muMedia("cry-cat.gif"),
];
const CRY_LINES = [
  "aww, don't say that 🥺",
  "you don't mean it… do you? 😢",
  "okay now i'm really sad 😭",
];

const BTN =
  "inline-flex min-w-[118px] items-center justify-center gap-1.5 rounded-full px-8 py-3.5 text-base font-semibold sm:min-w-[132px] sm:text-lg";

export default function EvasiveNo({ question }: { question: string }) {
  const [accepted, setAccepted] = useState(false);
  const [noCount, setNoCount] = useState(0);
  // Portal into .mu-root (not document.body) so scoped fonts/colours apply while
  // still escaping the transformed section wrappers.
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setPortalEl((document.querySelector(".mu-root") as HTMLElement) || document.body);
  }, []);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current); }, []);

  const sayNo = () => setNoCount((n) => n + 1);
  const sayYes = () => {
    setAccepted(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setAccepted(false), 4200);
  };
  const closeYes = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setAccepted(false);
  };

  const isCry = noCount > 0;
  const cryIdx = isCry ? (noCount - 1) % CRY_GIFS.length : 0;

  return (
    <div className="text-center">
      {/* one gif slot — penguin by default, swaps to the crying sticker on No */}
      <div className="mx-auto h-28 w-28 sm:h-32 sm:w-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={isCry ? `cry-${noCount}` : "ask"}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.28 }}
            className="h-full w-full"
          >
            <div className="grid h-full w-full place-items-center overflow-hidden rounded-2xl" style={{ background: "var(--mu-blush)", border: "3px solid #fff", boxShadow: "var(--mu-shadow-soft)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={isCry ? CRY_GIFS[cryIdx] : ASK_GIF}
                alt={isCry ? "a crying sticker" : "a little penguin asking if you miss it"}
                className={isCry ? "h-full w-full object-contain p-1" : "h-full w-full object-cover"}
                style={isCry ? undefined : { objectPosition: "center 40%" }}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* pleading line (reserved height so nothing jumps) */}
      <div className="mt-3 flex min-h-[2.25rem] items-center justify-center">
        <AnimatePresence mode="wait">
          {isCry && (
            <motion.p key={noCount} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="mu-script text-2xl mu-rose-deep">
              {CRY_LINES[cryIdx]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <p className="mu-serif mt-1 text-xl sm:text-2xl">{question}</p>

      <div className="mt-6 flex items-center justify-center gap-4 sm:gap-5">
        <button onClick={sayYes} className={`mu-btn ${BTN}`}>Yes ♥</button>
        <button onClick={sayNo} className={`mu-btn-ghost ${BTN}`}>No</button>
      </div>

      {/* Yes → full-screen two-penguin hug, portalled to .mu-root */}
      {portalEl &&
        createPortal(
          <AnimatePresence>
            {accepted && (
              <motion.div
                className="fixed inset-0 z-[999] flex flex-col items-center justify-center px-6 text-center"
                style={{ background: "radial-gradient(120% 100% at 50% 40%, #fdf3ea, #f4e6d7)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
                onClick={closeYes}
                role="dialog"
                aria-label="You said yes"
              >
                <button
                  onClick={(e) => { e.stopPropagation(); closeYes(); }}
                  aria-label="Close"
                  className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full"
                  style={{ background: "rgba(255,253,250,.92)", color: "var(--mu-rose-deep)", border: "1px solid var(--mu-paper-edge)", boxShadow: "var(--mu-shadow-soft)" }}
                >
                  <X size={20} />
                </button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <motion.img
                  src={muMedia("hug-after-yes.gif")}
                  alt="two penguins holding each other"
                  initial={{ scale: 0.6, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.85, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 18 }}
                  style={{ width: "min(78vw,420px)", maxHeight: "46vh", objectFit: "contain" }}
                />
                <motion.p
                  className="mu-script mt-3 text-3xl mu-rose-deep sm:text-5xl"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  i knew you missed me too 🤍
                </motion.p>
                <p className="mu-serif mt-2 text-base mu-muted sm:text-lg">us — always, no matter the distance.</p>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
