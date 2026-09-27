"use client";

// ─── Evidence submitted to the universe ──────────────────────────────────────
//
// Taped polaroids, each framed exactly as the sender framed it in the editor.
// Tap one to open it with its little letter: full screen on a phone, photo and
// paper side by side from 768px. Arrows / swipe-free buttons / Esc all work.

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { cropStyle, photoCrop } from "../../dedication/components/types";
import { GROTESK, INK, INK_SOFT, ITALIC } from "../../date-invitation/components/dateTheme";
import type { KundliPhoto } from "./types";

const TILTS = [-3, 2.4, -1.6, 3, -2.2, 1.4, -2.8, 2];
const TAPES = ["#ffd27a", "#ffb3cc", "#b59bff", "#d8ff5c"];

const CSS = `
.km-wall { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px 14px; }
@media (min-width: 640px) { .km-wall { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 26px 20px; } }
@media (min-width: 1024px) { .km-wall { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.km-polaroid { transition: transform .3s cubic-bezier(.2,.9,.3,1.3), box-shadow .3s ease; }
.km-polaroid:hover { transform: rotate(0deg) scale(1.04) !important; box-shadow: 0 26px 50px -20px rgba(0,0,0,.9); z-index: 2; }
.km-viewer { display: flex; flex-direction: column; gap: 16px; width: 100%; max-width: 440px; }
@media (min-width: 768px) { .km-viewer { flex-direction: row; max-width: 920px; align-items: stretch; } .km-viewer > * { flex: 1 1 0; min-width: 0; } }
`;

export default function PhotoWall({ photos, reduceMotion }: { photos: KundliPhoto[]; reduceMotion: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  const n = photos.length;
  const go = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + n) % n)), [n]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, go]);

  if (!n) return null;
  const current = open !== null ? photos[open] : null;

  return (
    <>
      <style>{CSS}</style>
      <div className="km-wall">
        {photos.map((p, i) => (
          <button
            key={`${i}-${p.url.slice(-16)}`}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`Open photo ${i + 1}${p.caption ? `: ${p.caption}` : ""}`}
            className={`km-polaroid ${reduceMotion ? "" : "di-pop-in"}`}
            style={{
              position: "relative",
              background: "#fffdf7",
              padding: "10px 10px 12px",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              transform: `rotate(${TILTS[i % TILTS.length]}deg)`,
              boxShadow: "0 18px 36px -18px rgba(0,0,0,.85)",
              animationDelay: `${i * 80}ms`,
            }}
          >
            <span
              aria-hidden
              style={{
                position: "absolute",
                top: -9,
                left: "50%",
                width: 64,
                height: 20,
                marginLeft: -32,
                background: TAPES[i % TAPES.length],
                opacity: 0.85,
                transform: `rotate(${i % 2 ? 4 : -5}deg)`,
                borderRadius: 2,
              }}
            />
            <span style={{ position: "relative", display: "block", aspectRatio: "4 / 5", overflow: "hidden", borderRadius: 3, background: "#eee6dc" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" draggable={false} loading="lazy" style={cropStyle(photoCrop(p))} />
              {p.note && (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    right: 6,
                    bottom: 6,
                    fontSize: 13,
                    fontFamily: GROTESK,
                    fontWeight: 800,
                    color: "#1a0d26",
                    background: "#ffd27a",
                    borderRadius: 999,
                    padding: "3px 8px",
                  }}
                >
                  💌 note
                </span>
              )}
            </span>
            <span
              style={{
                display: "block",
                marginTop: 8,
                fontFamily: ITALIC,
                fontStyle: "italic",
                fontSize: 17,
                lineHeight: 1.15,
                color: INK,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {p.caption || "a moment ✨"}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {current && open !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Photo and its letter"
            onClick={() => setOpen(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 160,
              background: "rgba(10,5,22,.86)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              overflowY: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "72px 16px calc(96px + env(safe-area-inset-bottom, 0px))",
            }}
          >
            <motion.div
              key={open}
              initial={reduceMotion ? false : { y: 26, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="km-viewer"
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ background: "#fffdf7", padding: 12, borderRadius: 8, transform: "rotate(-1deg)", boxShadow: "0 30px 60px -20px rgba(0,0,0,.9)" }}>
                <div style={{ position: "relative", aspectRatio: "4 / 5", overflow: "hidden", borderRadius: 4, background: "#eee6dc" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={current.url} alt={current.caption || ""} draggable={false} style={cropStyle(photoCrop(current))} />
                </div>
                <p style={{ margin: "10px 2px 0", fontFamily: ITALIC, fontStyle: "italic", fontSize: 20, color: INK }}>{current.caption || "a moment ✨"}</p>
              </div>

              <div
                style={{
                  borderRadius: 18,
                  padding: "22px 20px",
                  background: "repeating-linear-gradient(#fffaf0 0 31px, #f1e3cc 31px 32px)",
                  color: INK,
                  boxShadow: "0 30px 60px -20px rgba(0,0,0,.9)",
                  maxHeight: "62dvh",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <p style={{ margin: 0, fontFamily: GROTESK, fontSize: 11, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "#d0245f" }}>
                  💌 a little letter · {open + 1}/{n}
                </p>
                <p style={{ margin: "12px 0 0", fontFamily: ITALIC, fontStyle: "italic", fontSize: 22, lineHeight: "32px", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                  {current.note || "No words needed for this one. Just look at us. 🥹"}
                </p>
                <p style={{ margin: "auto 0 0", paddingTop: 16, fontFamily: GROTESK, fontSize: 12, fontWeight: 600, color: INK_SOFT }}>
                  tap outside or press Esc to close
                </p>
              </div>
            </motion.div>

            {/* Controls float at the bottom where a thumb is. */}
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "fixed",
                left: 0,
                right: 0,
                bottom: "calc(18px + env(safe-area-inset-bottom, 0px))",
                display: "flex",
                justifyContent: "center",
                gap: 10,
              }}
            >
              {n > 1 && (
                <button type="button" onClick={() => go(-1)} aria-label="Previous photo" style={ctrl}>
                  <ChevronLeft size={20} />
                </button>
              )}
              <button type="button" onClick={() => setOpen(null)} aria-label="Close" style={{ ...ctrl, width: "auto", padding: "0 18px", gap: 6, fontFamily: GROTESK, fontWeight: 700 }}>
                <X size={18} /> close
              </button>
              {n > 1 && (
                <button type="button" onClick={() => go(1)} aria-label="Next photo" style={ctrl}>
                  <ChevronRight size={20} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const ctrl = {
  width: 48,
  height: 48,
  borderRadius: 999,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(255,255,255,.12)",
  border: "1px solid rgba(255,255,255,.2)",
  color: "#fff",
  cursor: "pointer",
  backdropFilter: "blur(10px)",
} as const;
