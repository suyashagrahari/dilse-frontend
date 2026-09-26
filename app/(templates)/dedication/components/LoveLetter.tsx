"use client";

// ─── The love letter that came with the dedication ───────────────────────────
//
// An airmail letter under the radio (beside it on a desktop). Sealed while the
// dial is still being searched — "tune in to open it" — and it unfolds by
// itself the moment the station locks, or earlier with a tap. The first photo
// from the reel is the stamp; the station is the postmark.

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BODY_FACE, DISPLAY_FACE, PALETTE, type Photo } from "./types";

const PAPER = "#fbf5e8";
const INK = "#3a2418";
const SCRIPT = "var(--font-dancing), cursive";

export default function LoveLetter({
  letter,
  recipient,
  sender,
  photo,
  stationLine,
  tuned,
  reduced,
}: {
  letter: string;
  recipient: string;
  sender: string;
  photo?: Photo;
  /** "RADIO MEERA · 98.3 MHz" — printed in the postmark. */
  stationLine: string;
  tuned: boolean;
  reduced: boolean;
}) {
  const [forced, setForced] = useState(false);
  const open = tuned || forced;
  const text = letter.trim();
  if (!text) return null;

  return (
    <section className="w-full" aria-label="Love letter">
      <p
        className="text-center text-[10px] font-bold uppercase mb-3"
        style={{ fontFamily: BODY_FACE, letterSpacing: ".32em", color: "rgba(240,166,60,.75)" }}
      >
        ✉ a letter came with this dedication
      </p>

      <AnimatePresence mode="wait" initial={false}>
        {!open ? (
          <motion.button
            key="sealed"
            type="button"
            onClick={() => setForced(true)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, rotateX: 70, y: -10 }}
            transition={{ duration: 0.45 }}
            whileHover={reduced ? undefined : { y: -3 }}
            whileTap={{ scale: 0.98 }}
            className="relative w-full overflow-hidden text-left"
            style={{
              borderRadius: 10,
              aspectRatio: "16 / 9",
              background: `linear-gradient(160deg, #f3e7cf, #e6d4b1)`,
              boxShadow: "0 24px 50px -24px rgba(0,0,0,.9)",
            }}
            aria-label="Open the letter"
          >
            <AirmailEdge />
            {/* envelope flap */}
            <span
              aria-hidden
              className="absolute inset-x-0 top-0"
              style={{
                height: "58%",
                background: "linear-gradient(180deg,#eadbbd,#dcc79f)",
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                filter: "drop-shadow(0 3px 3px rgba(0,0,0,.18))",
              }}
            />
            {/* wax seal */}
            <span
              aria-hidden
              className="absolute left-1/2 grid place-items-center rounded-full"
              style={{
                top: "58%",
                width: 54,
                height: 54,
                transform: "translate(-50%,-50%)",
                background: `radial-gradient(circle at 35% 30%, #d9534a, ${PALETTE.bodyDeep} 70%)`,
                boxShadow: "0 4px 10px rgba(0,0,0,.4), inset 0 -3px 6px rgba(0,0,0,.35)",
                color: "#f7d9c4",
                fontSize: 22,
              }}
            >
              ♥
            </span>
            <span
              className="absolute left-0 right-0 bottom-4 text-center"
              style={{ fontFamily: SCRIPT, fontSize: 22, color: INK }}
            >
              for {recipient || "you"}
            </span>
            <span
              className="absolute left-0 right-0 bottom-1.5 text-center text-[9px] uppercase"
              style={{ fontFamily: BODY_FACE, letterSpacing: ".24em", color: "rgba(58,36,24,.55)" }}
            >
              tune in — or tap — to open
            </span>
          </motion.button>
        ) : (
          <motion.article
            key="open"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, rotateX: -55, transformOrigin: "top" }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            className="relative overflow-hidden"
            style={{
              borderRadius: 6,
              background: `repeating-linear-gradient(180deg, transparent 0 29px, rgba(140,59,42,.10) 29px 30px), ${PAPER}`,
              boxShadow: "0 30px 60px -28px rgba(0,0,0,.95), 0 0 0 1px rgba(0,0,0,.04)",
              padding: "34px 22px 26px",
              perspective: 900,
            }}
          >
            <AirmailEdge />

            {/* stamp + postmark */}
            <div className="absolute top-5 right-4 flex items-start gap-1" aria-hidden>
              <span
                className="block rounded-full grid place-items-center text-center"
                style={{
                  width: 58,
                  height: 58,
                  marginTop: 8,
                  marginRight: -14,
                  border: "1.5px solid rgba(140,59,42,.45)",
                  color: "rgba(140,59,42,.6)",
                  fontFamily: DISPLAY_FACE,
                  fontSize: 7,
                  lineHeight: 1.25,
                  letterSpacing: ".08em",
                  transform: "rotate(-14deg)",
                  zIndex: 1,
                }}
              >
                {stationLine}
              </span>
              {photo && (
                <span
                  className="block"
                  style={{
                    width: 50,
                    height: 60,
                    padding: 3,
                    background: "#fff",
                    transform: "rotate(4deg)",
                    boxShadow: "0 3px 8px rgba(0,0,0,.25)",
                    // perforated edge
                    maskImage:
                      "radial-gradient(circle at 3px 3px, transparent 1.6px, #000 1.8px) -3px -3px / 6px 6px",
                    WebkitMaskImage:
                      "radial-gradient(circle at 3px 3px, transparent 1.6px, #000 1.8px) -3px -3px / 6px 6px",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt="" className="w-full h-full object-cover" />
                </span>
              )}
            </div>

            <p style={{ fontFamily: SCRIPT, fontSize: 30, color: PALETTE.body, lineHeight: 1.1, paddingRight: 96 }}>
              Dear {recipient || "you"},
            </p>
            <div
              className="mt-4"
              style={{
                fontFamily: SCRIPT,
                fontSize: 21,
                lineHeight: "30px",
                color: INK,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {stripSalutation(text, recipient)}
            </div>
            {sender && !endsWithSignature(text, sender) && (
              <p className="mt-5 text-right" style={{ fontFamily: SCRIPT, fontSize: 24, color: PALETTE.body }}>
                forever on your frequency,
                <br />
                {sender}
              </p>
            )}
          </motion.article>
        )}
      </AnimatePresence>
    </section>
  );
}

/** The red-and-blue par avion border. */
function AirmailEdge() {
  return (
    <span
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{
        border: "7px solid transparent",
        borderImage:
          "repeating-linear-gradient(135deg, #c8352b 0 12px, transparent 12px 20px, #1f4e8c 20px 32px, transparent 32px 40px) 7",
        opacity: 0.85,
      }}
    />
  );
}

/** A letter that already opens with "Meera," shouldn't get "Dear Meera," twice. */
function stripSalutation(text: string, recipient: string): string {
  const first = text.split("\n")[0]?.trim().toLowerCase() ?? "";
  const r = recipient.trim().toLowerCase();
  if (r && first.length < 40 && first.replace(/^(dear|my|hey|hi)\s+/, "").replace(/[,!.]+$/, "") === r) {
    return text.split("\n").slice(1).join("\n").replace(/^\s+/, "");
  }
  return text;
}

function endsWithSignature(text: string, sender: string): boolean {
  const last = text.trim().split("\n").pop()?.toLowerCase() ?? "";
  return Boolean(sender.trim()) && last.includes(sender.trim().toLowerCase());
}
