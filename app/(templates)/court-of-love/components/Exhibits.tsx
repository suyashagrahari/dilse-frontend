"use client";

// ─── The Exhibits ────────────────────────────────────────────────────────────
//
// After the verdict the Court opens the case file: a manila folder with every
// photo the sender added clipped in as evidence — a polaroid with a hanging
// "EXHIBIT A" tag and the caption in handwriting. Tapping one opens it in the
// evidence viewer: the photo big, framed exactly as the sender cropped it,
// ADMITTED stamped across the corner, and their memory note beside it as sworn
// testimony. Swipe / arrow keys walk the exhibits.

import { useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { LoveThemeContext } from "../../_love/LoveKit";
import { V, themeVars } from "../../_love/theme";
import type { LovePhoto } from "../../_love/types";
import { cropStyle, photoCrop } from "../../dedication/components/types";
import { COURT_FONT_VARS } from "./fonts";
import { GavelButton, HAND, MANILA, MONO, PAPER_RULE, PaperClip, Paper, Polaroid, SANS, SERIF, STAMP_INK, Stamp, Typed } from "./courtKit";
import { exhibitLetter } from "./types";

const TILTS = [-3, 2.2, -1.4, 3, -2.4, 1.6, -3.2, 2.6, -1.8, 2];

/** One polaroid in the folder. */
function ExhibitCard({ photo, index, reviewed, onOpen }: { photo: LovePhoto; index: number; reviewed: boolean; onOpen: () => void }) {
  const tilt = TILTS[index % TILTS.length];
  const letter = exhibitLetter(index);
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open Exhibit ${letter}${photo.caption ? `: ${photo.caption}` : ""}`}
      className="lv-tile lv-focus"
      style={{
        position: "relative",
        display: "block",
        width: "100%",
        padding: "9px 9px 0",
        background: V.paper,
        border: `1px solid ${PAPER_RULE}`,
        borderRadius: 5,
        transform: `rotate(${tilt}deg)`,
        boxShadow: `0 20px 36px -22px ${V.shadow}`,
        cursor: "pointer",
        textAlign: "center",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <PaperClip style={{ top: -16, left: 16, transform: "rotate(-8deg)" }} />
      {/* The evidence tag, hanging off the corner on its string. */}
      <span
        className="col-swing"
        style={
          {
            "--r": `${index % 2 ? -9 : 9}deg`,
            position: "absolute",
            top: -12,
            right: 8,
            zIndex: 3,
            padding: "7px 8px 5px 14px",
            background: MANILA,
            color: V.paperInk,
            border: `1px solid ${PAPER_RULE}`,
            borderRadius: "3px 3px 3px 3px",
            clipPath: "polygon(10px 0, 100% 0, 100% 100%, 10px 100%, 0 50%)",
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: 10,
            letterSpacing: "0.12em",
            lineHeight: 1,
            boxShadow: "0 4px 8px rgba(0,0,0,.12)",
          } as React.CSSProperties
        }
      >
        EXHIBIT {letter}
      </span>
      <span style={{ display: "block", position: "relative", aspectRatio: "4 / 5", overflow: "hidden", borderRadius: 2, background: "#e9e4dc" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.url} alt={photo.caption || `Exhibit ${letter}`} loading="lazy" draggable={false} style={cropStyle(photoCrop(photo))} />
        {reviewed && (
          <span style={{ position: "absolute", left: 6, bottom: 8 }}>
            <Stamp r={-10} size={10} color="#fff" style={{ background: "rgba(0,0,0,.28)", borderWidth: 2 }}>
              ✓ reviewed
            </Stamp>
          </span>
        )}
      </span>
      <span style={{ display: "block", minHeight: 36, padding: "5px 2px 8px", fontFamily: HAND, fontSize: 18, lineHeight: 1.05, color: V.paperInk, overflowWrap: "anywhere" }}>
        {photo.caption || `exhibit ${letter.toLowerCase()}`}
      </span>
    </button>
  );
}

export function EvidenceFolder({
  photos,
  plaintiff,
  accused,
  gif,
  onDone,
  doneLabel,
}: {
  photos: LovePhoto[];
  plaintiff: string;
  accused: string;
  gif?: string;
  onDone: () => void;
  doneLabel: React.ReactNode;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const [reviewed, setReviewed] = useState<Set<number>>(() => new Set());
  const markOpen = useCallback((i: number) => {
    setOpen(i);
    setReviewed((s) => (s.has(i) ? s : new Set(s).add(i)));
  }, []);
  const last = exhibitLetter(photos.length - 1);
  const allSeen = reviewed.size >= photos.length;

  return (
    <div style={{ width: "100%" }}>
      <header style={{ textAlign: "center", marginBottom: 26 }}>
        <Typed color={V.a1}>{photos.length === 1 ? "Exhibit A" : `Exhibits A–${last}`} · for the prosecution</Typed>
        <h2 style={{ margin: "10px 0 6px", fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: "clamp(34px, 9vw, 52px)", lineHeight: 0.98, letterSpacing: "-0.02em", color: V.ink }}>
          The evidence is… overwhelming.
        </h2>
        <p style={{ margin: 0, fontFamily: SANS, fontSize: 14.5, color: V.soft }}>Tap an exhibit to hear the testimony.</p>
      </header>

      {/* The case folder: a tab, a manila body, CONFIDENTIAL faintly stamped. */}
      <div style={{ position: "relative", paddingTop: 30 }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 18,
            maxWidth: "calc(100% - 36px)",
            height: 34,
            padding: "8px 16px 0",
            background: MANILA,
            borderRadius: "12px 12px 0 0",
            border: `1px solid ${PAPER_RULE}`,
            borderBottom: "none",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          <Typed size={10.5} color={V.paperInk}>
            Case file · {plaintiff} v. {accused}
          </Typed>
        </div>
        <div
          style={{
            position: "relative",
            background: MANILA,
            border: `1px solid ${PAPER_RULE}`,
            borderRadius: "4px 18px 18px 18px",
            padding: "34px 16px 30px",
            boxShadow: `0 40px 70px -40px ${V.shadow}`,
          }}
        >
          <div className={`col-grid${photos.length >= 4 ? " col-grid-4" : ""}`}>
            {photos.map((p, i) => (
              <ExhibitCard key={`${i}-${p.url.slice(-16)}`} photo={p} index={i} reviewed={reviewed.has(i)} onOpen={() => markOpen(i)} />
            ))}
          </div>
          {/* Folder foot: the confidential stamp, and the sender's GIF as the court sketch. */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginTop: 22 }}>
            <div style={{ paddingBottom: 10, minWidth: 0 }}>
              <Stamp r={-6} size={12} animate={false} style={{ opacity: 0.55 }}>
                confidential
              </Stamp>
              <p style={{ margin: "10px 0 0 4px", fontFamily: HAND, fontSize: 18, color: V.paperSoft }}>filed under: us 🫶</p>
            </div>
            {gif && (
              <div style={{ width: 124, flexShrink: 0 }}>
                <Polaroid tilt={4} caption="court sketch ✏️">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={gif} alt="" loading="lazy" style={{ width: "100%", height: "auto", display: "block" }} />
                </Polaroid>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 28, textAlign: "center" }}>
        <p style={{ margin: "0 0 12px", fontFamily: MONO, fontSize: 12, letterSpacing: "0.08em", color: V.soft }}>
          {allSeen ? "all evidence reviewed ✓" : `${reviewed.size} of ${photos.length} reviewed`}
        </p>
        <div style={{ maxWidth: 440, margin: "0 auto" }}>
          <GavelButton onClick={onDone} glow={allSeen}>
            {doneLabel}
          </GavelButton>
        </div>
      </div>

      {open !== null && (
        <EvidenceViewer photos={photos} index={open} plaintiff={plaintiff} onIndex={markOpen} onClose={() => setOpen(null)} />
      )}
    </div>
  );
}

const noopSubscribe = () => () => {};

/** Full-screen evidence viewer, portalled so no transformed ancestor traps it. */
function EvidenceViewer({
  photos,
  index,
  plaintiff,
  onIndex,
  onClose,
}: {
  photos: LovePhoto[];
  index: number;
  plaintiff: string;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const theme = useContext(LoveThemeContext);
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touch = useRef<number | null>(null);
  const n = photos.length;
  const go = useCallback((d: number) => onIndex((index + d + n) % n), [index, n, onIndex]);
  const p = photos[index];
  const letter = exhibitLetter(index);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  if (!hydrated || !p) return null;

  const navBtn = (d: number, label: string) => (
    <button
      type="button"
      onClick={() => go(d)}
      aria-label={label}
      className="lv-focus"
      style={{ width: 46, height: 46, borderRadius: "50%", display: "grid", placeItems: "center", background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.28)", color: "#fff", cursor: "pointer", flexShrink: 0 }}
    >
      {d < 0 ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
    </button>
  );

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Exhibit ${letter}`}
      className={`${COURT_FONT_VARS} lv-root`}
      onClick={onClose}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        touch.current = null;
        if (Math.abs(dx) > 50 && n > 1) go(dx < 0 ? 1 : -1);
      }}
      style={{
        ...(theme ? themeVars(theme) : null),
        position: "fixed",
        inset: 0,
        zIndex: 400,
        background: "rgba(8,4,10,.82)",
        overflowY: "auto",
        overscrollBehavior: "contain",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "calc(env(safe-area-inset-top, 0px) + 64px) 16px calc(env(safe-area-inset-bottom, 0px) + 24px)",
        fontFamily: SANS,
      }}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close exhibit"
        className="lv-focus"
        style={{ position: "fixed", top: "calc(env(safe-area-inset-top, 0px) + 14px)", right: 14, zIndex: 2, width: 42, height: 42, borderRadius: "50%", display: "grid", placeItems: "center", background: "rgba(255,255,255,.16)", border: "1px solid rgba(255,255,255,.3)", color: "#fff", cursor: "pointer" }}
      >
        <X size={20} />
      </button>
      <div style={{ position: "fixed", top: "calc(env(safe-area-inset-top, 0px) + 22px)", left: 18, zIndex: 2 }}>
        <Typed color="rgba(255,255,255,.8)" size={11.5}>
          Exhibit {letter} · {index + 1}/{n}
        </Typed>
      </div>

      <div key={index} className="col-ev col-rise" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 900, margin: "auto 0" }}>
        {/* The photo, framed exactly as the sender cropped it. */}
        <div style={{ position: "relative", width: "min(100%, 400px, 42dvh)", margin: "0 auto" }}>
          <div style={{ padding: "12px 12px 44px", background: V.paper, borderRadius: 6, transform: "rotate(-1.5deg)", boxShadow: "0 40px 80px -30px rgba(0,0,0,.7)" }}>
            <div style={{ position: "relative", aspectRatio: "4 / 5", overflow: "hidden", borderRadius: 3, background: "#e9e4dc" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={p.caption || `Exhibit ${letter}`} draggable={false} style={cropStyle(photoCrop(p))} />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 8, textAlign: "center", fontFamily: HAND, fontSize: 22, color: V.paperInk, padding: "0 12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {p.caption || `exhibit ${letter.toLowerCase()}`}
            </div>
          </div>
          <span style={{ position: "absolute", right: -4, top: 22 }}>
            <Stamp r={12} size={17} style={{ background: "color-mix(in srgb, var(--lv-paper) 82%, transparent)" }}>
              admitted ✓
            </Stamp>
          </span>
          <span style={{ position: "absolute", left: -6, top: -10, padding: "8px 10px 6px 16px", background: MANILA, color: V.paperInk, clipPath: "polygon(10px 0, 100% 0, 100% 100%, 10px 100%, 0 50%)", fontFamily: MONO, fontWeight: 700, fontSize: 12, letterSpacing: "0.12em", transform: "rotate(-6deg)", boxShadow: "0 6px 12px rgba(0,0,0,.2)" }}>
            EXHIBIT {letter}
          </span>
        </div>

        {/* The testimony. */}
        <Paper lined style={{ width: "100%", maxWidth: 440, margin: "0 auto", padding: "22px 20px 18px", borderRadius: 14 }}>
          <Typed color={STAMP_INK} size={10.5}>
            Testimony of {plaintiff} · under oath
          </Typed>
          <h3 style={{ margin: "8px 0 8px", fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: 30, lineHeight: 1.02, color: V.paperInk, overflowWrap: "anywhere" }}>
            {p.caption || `Exhibit ${letter}`}
          </h3>
          <p dir="auto" style={{ margin: 0, fontFamily: SANS, fontSize: 16.5, lineHeight: "30px", color: V.paperInk, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
            {p.note?.trim() || "No further comment, your honour. The photo speaks for itself."}
          </p>
          <p style={{ margin: "10px 0 0", textAlign: "right", fontFamily: HAND, fontSize: 22, color: STAMP_INK }}>— {plaintiff}</p>
        </Paper>
      </div>

      {n > 1 && (
        <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 20 }}>
          {navBtn(-1, "Previous exhibit")}
          <div style={{ display: "flex", gap: 6 }}>
            {photos.map((_, i) => (
              <span key={i} style={{ width: i === index ? 18 : 7, height: 7, borderRadius: 99, background: i === index ? V.chip : "rgba(255,255,255,.35)", transition: "width .2s ease" }} />
            ))}
          </div>
          {navBtn(1, "Next exhibit")}
        </div>
      )}
    </div>,
    document.body,
  );
}
