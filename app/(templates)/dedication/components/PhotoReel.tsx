"use client";

// ─── The photo reel — little cards drifting across the radio's window ────────
//
// However many photos the sender added (1 to 12), the reel is an endless,
// seamless loop: the list is repeated until it is comfortably wider than the
// window, then rendered twice and translated by exactly -50%. Speed scales with
// the number of cards so a long reel doesn't race and a short one doesn't crawl.
//
// Hover (desktop) or press-and-hold (phone) pauses it, so a card can be looked
// at. Tapping a card opens it big.

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { BODY_FACE, PALETTE, type Photo } from "./types";

const CARD_W = 74;
const GAP = 12;
/** Enough cards for one half of the loop to overfill a 480px window. */
const MIN_PER_HALF = 8;
const TILTS = [-4, 3, -2, 4.5, -3.5, 2, -1.5, 3.5];

export default function PhotoReel({
  photos,
  lit,
  reduced,
}: {
  photos: Photo[];
  /** Brighter once the station is tuned — the window "lights up". */
  lit: boolean;
  reduced: boolean;
}) {
  const [open, setOpen] = useState<number | null>(null);

  const half = useMemo(() => {
    if (!photos.length) return [];
    const reps = Math.max(1, Math.ceil(MIN_PER_HALF / photos.length));
    return Array.from({ length: reps }, () => photos).flat();
  }, [photos]);

  if (!photos.length) return null;

  // ~2.6s per card feels like a slow drift at any count.
  const duration = Math.max(18, half.length * 2.6);
  const current = open === null ? null : photos[open % photos.length];

  return (
    <>
      <div
        className="relative overflow-hidden"
        style={{
          borderRadius: 8,
          background: "linear-gradient(180deg,#140a05,#1f110a 50%,#140a05)",
          boxShadow: "inset 0 2px 8px rgba(0,0,0,.85), inset 0 -1px 0 rgba(255,255,255,.06), 0 1px 0 rgba(255,255,255,.12)",
          padding: "12px 0 10px",
        }}
        aria-label="Photographs"
      >
        {/* film sprockets, top and bottom */}
        {(["top", "bottom"] as const).map((edge) => (
          <span
            key={edge}
            aria-hidden
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              height: 5,
              [edge]: 3,
              backgroundImage: "repeating-linear-gradient(90deg, rgba(232,220,192,.18) 0 6px, transparent 6px 14px)",
            }}
          />
        ))}

        <div
          className="ded-reel overflow-hidden"
          style={{
            maskImage: "linear-gradient(90deg,transparent,#000 9%,#000 91%,transparent)",
            WebkitMaskImage: "linear-gradient(90deg,transparent,#000 9%,#000 91%,transparent)",
          }}
        >
          <div
            data-ded-motion
            className="ded-reel-track flex will-change-transform"
            style={{
              animation: reduced ? "none" : `dedReel ${duration}s linear infinite`,
            }}
          >
            {[0, 1].map((copy) =>
              half.map((p, i) => (
                <button
                  type="button"
                  key={`${copy}-${i}`}
                  onClick={() => setOpen(i % photos.length)}
                  aria-hidden={copy === 1}
                  tabIndex={copy === 1 ? -1 : 0}
                  aria-label={copy === 1 ? undefined : `Open photo${p.caption ? `: ${p.caption}` : ""}`}
                  className="ded-reel-card shrink-0 outline-none"
                  style={{
                    width: CARD_W,
                    padding: "4px 4px 0",
                    background: "#fbf6ec",
                    borderRadius: 3,
                    // Margin rather than flex gap: the loop translates by exactly
                    // -50%, which is only seamless if every card owns its gap.
                    marginRight: GAP,
                    rotate: `${TILTS[i % TILTS.length]}deg`,
                    boxShadow: "0 8px 14px -6px rgba(0,0,0,.8)",
                    filter: lit ? "none" : "brightness(.55) saturate(.6)",
                    transition: "filter 900ms ease, transform 300ms ease",
                  }}
                >
                  <span className="block overflow-hidden" style={{ aspectRatio: "4 / 5", borderRadius: 2, background: "#e9dfcf" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.url}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="w-full h-full object-cover"
                    />
                  </span>
                  <span
                    className="block truncate text-center"
                    style={{
                      fontFamily: "var(--font-dancing), cursive",
                      fontSize: 11,
                      lineHeight: "18px",
                      color: "#6d2c1f",
                    }}
                  >
                    {p.caption || "♥"}
                  </span>
                </button>
              )),
            )}
          </div>
        </div>

        {/* glass sheen over the window */}
        <span
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(115deg, rgba(255,255,255,.09) 0%, rgba(255,255,255,0) 32%, rgba(255,255,255,0) 70%, rgba(255,255,255,.05) 100%)",
          }}
        />
      </div>

      <AnimatePresence>
        {current && (
          <motion.div
            key="reel-viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-[150] grid place-items-center p-6"
            style={{ background: "rgba(8,3,1,.86)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
            role="dialog"
            aria-modal="true"
            aria-label="Photo"
          >
            <motion.figure
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.85, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, rotate: -1.5 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 240, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="relative"
              style={{
                width: "min(82vw, 380px)",
                padding: "12px 12px 0",
                background: "#fbf6ec",
                borderRadius: 6,
                boxShadow: "0 40px 80px -30px rgba(0,0,0,.95)",
              }}
            >
              <div className="overflow-hidden" style={{ aspectRatio: "4 / 5", borderRadius: 3 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={current.url} alt="" className="w-full h-full object-cover" />
              </div>
              <figcaption
                className="text-center py-3"
                style={{ fontFamily: "var(--font-dancing), cursive", fontSize: 24, color: "#6d2c1f" }}
              >
                {current.caption || "us ♥"}
              </figcaption>
              <button
                type="button"
                onClick={() => setOpen(null)}
                aria-label="Close"
                className="absolute rounded-full grid place-items-center"
                style={{ top: -12, right: -12, width: 40, height: 40, background: PALETTE.body, color: "#fff", boxShadow: "0 6px 14px rgba(0,0,0,.5)", fontFamily: BODY_FACE }}
              >
                <X size={18} />
              </button>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export const REEL_KEYFRAMES = `
.ded-reel-track { width: max-content; }
.ded-reel:hover .ded-reel-track, .ded-reel:active .ded-reel-track { animation-play-state: paused; }
.ded-reel-card:hover, .ded-reel-card:focus-visible { transform: scale(1.1) translateY(-2px); }
@keyframes dedReel { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes dedStatic { 0% { background-position: 0 0; } 100% { background-position: 100px 60px; } }
@keyframes dedKen { from { transform: scale(1.04) translate(0,0); } to { transform: scale(1.16) translate(-2%, -2%); } }
@keyframes dedPulse { 0%,100% { transform: scaleY(.35); } 50% { transform: scaleY(1); } }
@keyframes dedBlink { 0%,100% { opacity: 1; } 50% { opacity: .35; } }
`;
