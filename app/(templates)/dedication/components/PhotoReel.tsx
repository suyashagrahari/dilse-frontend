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

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Lock, X } from "lucide-react";
import { BODY_FACE, PALETTE, cropStyle, photoCrop, type Photo } from "./types";

const CARD_W = 74;
const GAP = 12;
/** Enough cards for one half of the loop to overfill a 480px window. */
const MIN_PER_HALF = 8;
const TILTS = [-4, 3, -2, 4.5, -3.5, 2, -1.5, 3.5];

export default function PhotoReel({
  photos,
  lit,
  locked,
  reduced,
}: {
  photos: Photo[];
  /** Brighter once the station is tuned — the window "lights up". */
  lit: boolean;
  /** Before tune-in the photos can be seen but not opened. */
  locked: boolean;
  reduced: boolean;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const [hint, setHint] = useState(false);
  const hintTimer = useRef<number | null>(null);
  // A tap opens a photo; a drag (scrolling the page, sliding the reel) never does.
  const down = useRef<{ x: number; y: number } | null>(null);
  const count = photos.length;

  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + count) % count)), [count]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, step]);

  useEffect(() => () => {
    if (hintTimer.current) window.clearTimeout(hintTimer.current);
  }, []);

  const tapCard = (i: number) => {
    if (locked) {
      setHint(true);
      if (hintTimer.current) window.clearTimeout(hintTimer.current);
      hintTimer.current = window.setTimeout(() => setHint(false), 2200);
      return;
    }
    setOpen(i % count);
  };

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
                  onPointerDown={(e) => {
                    down.current = { x: e.clientX, y: e.clientY };
                  }}
                  onClick={(e) => {
                    const d = down.current;
                    down.current = null;
                    if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 8) return;
                    tapCard(i);
                  }}
                  aria-hidden={copy === 1}
                  tabIndex={copy === 1 ? -1 : 0}
                  aria-label={
                    copy === 1 ? undefined : locked ? "Tune in to open the photos" : `Open photo${p.caption ? `: ${p.caption}` : ""}`
                  }
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
                      style={cropStyle(photoCrop(p))}
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
                    {!locked && p.note?.trim() ? " 💌" : ""}
                  </span>
                </button>
              )),
            )}
          </div>
        </div>

        {/* before tune-in: the photos are there, but sealed */}
        <AnimatePresence>
          {locked && hint && (
            <motion.div
              key="lock-hint"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 grid place-items-center pointer-events-none"
              style={{ background: "rgba(10,4,2,.55)", zIndex: 3 }}
            >
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold"
                style={{ fontFamily: BODY_FACE, background: "rgba(240,166,60,.16)", color: PALETTE.amber, border: "1px solid rgba(240,166,60,.4)" }}
              >
                <Lock size={12} /> tune in to open the photos
              </span>
            </motion.div>
          )}
        </AnimatePresence>

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
        {current && open !== null && (
          <motion.div
            key="reel-viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-[150] flex items-stretch md:items-center justify-center md:p-8"
            style={{ background: "rgba(8,3,1,.9)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
            role="dialog"
            aria-modal="true"
            aria-label="Photo and its letter"
          >
            <motion.div
              key={open}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="ded-viewer relative w-full overflow-y-auto flex flex-col"
              style={{ overscrollBehavior: "contain" }}
            >
              {/* the photo */}
              <div className="ded-viewer-photo flex items-center justify-center">
                <figure
                  style={{
                    width: "min(78vw, 360px)",
                    padding: "12px 12px 0",
                    background: "#fbf6ec",
                    borderRadius: 6,
                    rotate: "-1.5deg",
                    boxShadow: "0 40px 80px -30px rgba(0,0,0,.95)",
                  }}
                >
                  <div className="overflow-hidden" style={{ aspectRatio: "4 / 5", borderRadius: 3 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={current.url} alt="" draggable={false} style={cropStyle(photoCrop(current))} />
                  </div>
                  <figcaption
                    className="text-center py-3"
                    style={{ fontFamily: "var(--font-dancing), cursive", fontSize: 24, color: "#6d2c1f" }}
                  >
                    {current.caption || "us ♥"}
                  </figcaption>
                </figure>
              </div>

              {/* its letter */}
              <div className="ded-viewer-note">
                <div
                  className="ded-viewer-paper ded-letter-scroll relative"
                  style={{
                    background:
                      "repeating-linear-gradient(180deg, transparent 0 29px, rgba(140,59,42,.10) 29px 30px), #fbf5e8",
                    borderRadius: 10,
                    padding: "26px 22px 22px",
                    boxShadow: "0 30px 60px -30px rgba(0,0,0,.9)",
                  }}
                >
                  <p
                    className="text-[9px] font-bold uppercase"
                    style={{ fontFamily: BODY_FACE, letterSpacing: ".24em", color: "rgba(109,44,31,.6)" }}
                  >
                    moment {open + 1} of {photos.length}
                  </p>
                  <p
                    className="mt-3"
                    style={{
                      fontFamily: "var(--font-dancing), cursive",
                      fontSize: 23,
                      lineHeight: "30px",
                      color: "#3a2418",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {current.note?.trim() || "no words needed for this one ♥"}
                  </p>
                </div>

                {photos.length > 1 && (
                  <div className="mt-5 flex items-center justify-between">
                    <NavBtn label="Previous photo" onClick={() => step(-1)}>
                      <ChevronLeft size={19} />
                    </NavBtn>
                    <div className="flex gap-1.5">
                      {photos.map((_, i) => (
                        <span
                          key={i}
                          className="h-1.5 rounded-full"
                          style={{
                            width: i === open ? 18 : 6,
                            background: i === open ? PALETTE.amber : "rgba(232,220,192,.3)",
                            transition: "width 200ms ease",
                          }}
                        />
                      ))}
                    </div>
                    <NavBtn label="Next photo" onClick={() => step(1)}>
                      <ChevronRight size={19} />
                    </NavBtn>
                  </div>
                )}
              </div>
            </motion.div>

            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Close"
              className="absolute rounded-full grid place-items-center"
              style={{
                top: "calc(14px + env(safe-area-inset-top, 0px))",
                right: 14,
                width: 42,
                height: 42,
                zIndex: 2,
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

function NavBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="w-11 h-11 rounded-full grid place-items-center active:scale-90 transition-transform"
      style={{ background: "#fbf5e8", color: "#6d2c1f", boxShadow: "0 8px 18px -8px rgba(0,0,0,.8)" }}
    >
      {children}
    </button>
  );
}

export const REEL_KEYFRAMES = `
/* Photo viewer: stacked and full-frame on phones, side by side on desktop. */
.ded-viewer { max-height: 100dvh; padding: calc(64px + env(safe-area-inset-top, 0px)) 18px calc(28px + env(safe-area-inset-bottom, 0px)); gap: 22px; }
.ded-viewer-note { width: 100%; max-width: 420px; margin: 0 auto; }
@media (min-width: 768px) {
  .ded-viewer { flex-direction: row; align-items: center; max-width: 900px; max-height: 88dvh; padding: 24px; gap: 40px; }
  .ded-viewer-photo { flex: 0 0 auto; }
  .ded-viewer-note { flex: 1; margin: 0; }
  .ded-viewer-paper { max-height: 62dvh; overflow-y: auto; overscroll-behavior: contain; }
}
.ded-reel-track { width: max-content; }
.ded-reel:hover .ded-reel-track, .ded-reel:active .ded-reel-track { animation-play-state: paused; }
.ded-reel-card:hover, .ded-reel-card:focus-visible { transform: scale(1.1) translateY(-2px); }
@keyframes dedReel { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes dedStatic { 0% { background-position: 0 0; } 100% { background-position: 100px 60px; } }
@keyframes dedKen { from { transform: scale(1.04) translate(0,0); } to { transform: scale(1.16) translate(-2%, -2%); } }
@keyframes dedPulse { 0%,100% { transform: scaleY(.35); } 50% { transform: scaleY(1); } }
@keyframes dedBlink { 0%,100% { opacity: 1; } 50% { opacity: .35; } }
`;
