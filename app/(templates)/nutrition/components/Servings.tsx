"use client";

// ─── Servings of us ──────────────────────────────────────────────────────────
//
// The memories are SACHETS in a box: each photo is a single-serve pouch with a
// crimped heat-seal at both ends, a serving number, a tear line and the caption
// printed on it. Tap one and it opens as its own little Supplement Facts panel:
// the photo, framed exactly as the sender framed it, with their memory note
// printed where the "Amount per serving" would go. Swipe / arrows to move.

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { createPortal } from "react-dom";

import { DATE_FONT_VARS } from "../../date-invitation/components/fonts";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { cropStyle, photoCrop } from "../../dedication/components/types";
import { GROTESK, ITALIC } from "../../_love/LoveKit";
import { V } from "../../_love/theme";
import type { LovePhoto } from "../../_love/types";
import { P } from "./themes";

const HELV = 'Helvetica, "Helvetica Neue", Arial, sans-serif';
const noopSubscribe = () => () => {};
const pad2 = (n: number) => String(n).padStart(2, "0");

export default function Servings({ photos, name, reduceMotion, scopeStyle }: { photos: LovePhoto[]; name: string; reduceMotion: boolean; /** The theme variables, re-applied on the portalled sheet. */ scopeStyle: CSSProperties }) {
  const [open, setOpen] = useState<number | null>(null);
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const n = photos.length;
  if (!n) return null;

  return (
    <section aria-label="Servings of us" style={{ width: "100%", maxWidth: 980 }}>
      {/* The supplement panel header — same regulatory voice, bigger. */}
      <div className="nf-supp" style={{ margin: "0 auto", maxWidth: 420 }}>
        <div style={{ fontFamily: HELV, fontWeight: 800, fontSize: 34, lineHeight: 1, letterSpacing: "-1.2px" }}>Supplement Facts</div>
        <div style={{ borderTop: `1px solid ${V.paperInk}`, marginTop: 4, paddingTop: 3, fontFamily: HELV, fontSize: 12, display: "flex", justifyContent: "space-between", gap: 8 }}>
          <span>Serving size: 1 memory</span>
          <span style={{ fontWeight: 700 }}>
            Servings per box: {n}
          </span>
        </div>
        <div style={{ borderTop: `7px solid ${V.paperInk}`, marginTop: 4, paddingTop: 4, fontFamily: HELV, fontSize: 11.5, lineHeight: 1.35 }}>
          Ingredients sourced from: {name ? `${name.split(/\s+/)[0]} & me` : "the two of us"}, {n === 1 ? "one very good day" : `${n} very good days`}. <b>Tap a sachet to open it.</b>
        </div>
      </div>

      <div className="nf-sachets" role="list" style={{ marginTop: 26 }}>
        {photos.map((p, i) => (
          <button
            key={`${i}-${p.url.slice(-16)}`}
            type="button"
            role="listitem"
            onClick={() => setOpen(i)}
            aria-label={`Open serving ${i + 1}${p.caption ? `: ${p.caption}` : ""}`}
            className="nf-sachet lv-tile nf-rise"
            style={{ ["--tilt" as string]: `${i % 2 ? 1.6 : -1.6}deg`, animationDelay: `${Math.min(i, 6) * 60}ms` }}
          >
            <span aria-hidden className="nf-crimp" />
            <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px 5px", fontFamily: GROTESK, fontWeight: 800, fontSize: 10.5, letterSpacing: ".16em", textTransform: "uppercase", color: P.boardInk }}>
              <span>serving {pad2(i + 1)}</span>
              <span aria-hidden style={{ opacity: 0.7 }}>♥</span>
            </span>
            <span style={{ position: "relative", display: "block", margin: "0 8px", aspectRatio: "4 / 5", overflow: "hidden", borderRadius: 12, background: V.paper, border: `1.5px solid ${V.paperInk}` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" loading="lazy" draggable={false} style={cropStyle(photoCrop(p))} />
              <span aria-hidden className="nf-sheen" />
            </span>
            <span aria-hidden className="nf-tear">✂</span>
            <span style={{ display: "block", padding: "2px 10px 4px", fontFamily: ITALIC, fontStyle: "italic", fontSize: 17, lineHeight: 1.1, color: P.boardInk, textAlign: "left", minHeight: 38, overflowWrap: "anywhere" }}>
              {p.caption || "a very good day"}
            </span>
            <span style={{ display: "block", padding: "0 10px 12px", fontFamily: GROTESK, fontSize: 10.5, fontWeight: 700, color: P.boardInk, opacity: 0.7, textAlign: "left" }}>
              {p.note ? "memory inside →" : "open →"}
            </span>
            <span aria-hidden className="nf-crimp nf-crimp-b" />
          </button>
        ))}
      </div>

      {/* Portalled: the page's <main> is its own stacking context, and the sheet
          has to sit above the top bar and the theme dock. */}
      {hydrated
        ? createPortal(
            <div className={DATE_FONT_VARS} style={scopeStyle}>
              <AnimatePresence>
                {open !== null ? <ServingSheet key="sheet" photos={photos} start={open} onClose={() => setOpen(null)} reduceMotion={reduceMotion} /> : null}
              </AnimatePresence>
            </div>,
            document.body,
          )
        : null}
    </section>
  );
}

function ServingSheet({ photos, start, onClose, reduceMotion }: { photos: LovePhoto[]; start: number; onClose: () => void; reduceMotion: boolean }) {
  const n = photos.length;
  const [i, setI] = useState(start);
  const [dir, setDir] = useState(1);
  const go = useCallback(
    (d: number) => {
      if (n < 2) return;
      setDir(d);
      setI((x) => (x + d + n) % n);
    },
    [n],
  );
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [go, onClose]);

  const startX = useRef<number | null>(null);
  const p = photos[i];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Serving ${i + 1} of ${n}`}
      style={{ position: "fixed", inset: 0, zIndex: 170, background: "rgba(10,8,14,.62)", display: "flex", alignItems: "center", justifyContent: "center", padding: "max(14px, env(safe-area-inset-top, 0px)) 14px 14px" }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.94, rotate: -2 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        style={{ position: "relative", width: "min(100%, 440px)", maxHeight: "calc(100dvh - 28px)", overflowY: "auto", borderRadius: 26, background: P.board, border: `2px solid ${V.paperInk}`, boxShadow: "0 40px 80px -30px rgba(0,0,0,.7)" }}
      >
        <span aria-hidden className="nf-crimp" style={{ borderRadius: "24px 24px 0 0" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px 6px 16px" }}>
          <span style={{ fontFamily: GROTESK, fontWeight: 800, fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: P.boardInk }}>
            serving {pad2(i + 1)} of {pad2(n)}
          </span>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="lv-focus" style={{ width: 40, height: 40, borderRadius: 999, border: `1.5px solid ${V.paperInk}`, background: V.paper, color: V.paperInk, display: "grid", placeItems: "center", cursor: "pointer" }}>
            <X size={18} />
          </button>
        </div>

        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div
            key={i}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: dir * 36 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: dir * -36 }}
            transition={{ duration: 0.2 }}
            style={{ padding: "0 14px 14px" }}
          >
            <div
              onPointerDown={(e) => (startX.current = e.clientX)}
              onPointerUp={(e) => {
                if (startX.current === null) return;
                const dx = e.clientX - startX.current;
                startX.current = null;
                if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
              }}
              style={{ position: "relative", margin: "0 auto", width: "min(100%, calc((100dvh - 330px) * 0.8))", minWidth: 200, aspectRatio: "4 / 5", overflow: "hidden", borderRadius: 16, border: `2px solid ${V.paperInk}`, background: V.paper, touchAction: "pan-y" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={p.caption || `Serving ${i + 1}`} draggable={false} style={cropStyle(photoCrop(p))} />
            </div>

            {/* The memory, printed as the panel for this one serving. */}
            <div style={{ marginTop: 12, background: V.paper, color: V.paperInk, border: `1.5px solid ${V.paperInk}`, borderRadius: 6, padding: "8px 10px 10px", fontFamily: HELV }}>
              <div style={{ fontWeight: 800, fontSize: 20, lineHeight: 1.05, letterSpacing: "-0.4px", overflowWrap: "anywhere" }}>{p.caption || "A very good day"}</div>
              <div style={{ borderTop: `6px solid ${V.paperInk}`, marginTop: 5, paddingTop: 3, display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 700 }}>
                <span>Amount per serving</span>
                <span>% Daily Value</span>
              </div>
              <p style={{ margin: "4px 0 0", borderTop: `1px solid ${V.paperInk}`, paddingTop: 7, fontFamily: ITALIC, fontStyle: "italic", fontSize: 21, lineHeight: 1.3, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                {p.note || "No words needed for this one. Just look at us."}
              </p>
              <div style={{ borderTop: `4px solid ${V.paperInk}`, marginTop: 8, paddingTop: 3, display: "flex", justifyContent: "space-between", fontSize: 10.5 }}>
                <span>Memory, pure</span>
                <b>100%</b>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {n > 1 ? (
          <div style={{ display: "flex", gap: 10, padding: "0 14px 16px" }}>
            <button type="button" onClick={() => go(-1)} aria-label="Previous serving" className="lv-focus" style={navBtn(false)}>
              <ChevronLeft size={20} />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next serving" className="lv-focus lv-cta" style={navBtn(true)}>
              next serving <ChevronRight size={18} />
            </button>
          </div>
        ) : null}
      </motion.div>
    </motion.div>
  );
}

const navBtn = (wide: boolean): React.CSSProperties => ({
  flex: wide ? 1 : "0 0 auto",
  minWidth: 50,
  height: 50,
  borderRadius: 999,
  border: wide ? "none" : `1.5px solid ${V.paperInk}`,
  background: wide ? V.grad : V.paper,
  color: wide ? "#fff" : V.paperInk,
  fontFamily: GROTESK,
  fontWeight: 800,
  fontSize: 15,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  cursor: "pointer",
});
