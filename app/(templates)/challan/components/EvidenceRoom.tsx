"use client";

// ─── The CCTV control room ───────────────────────────────────────────────────
//
// The sender's photos, recovered as "camera footage" from the scene of the
// crime. A dark monitor wall of feeds — REC dot, camera number, burned-in
// timestamp, the photo's caption as the location tag, an EXHIBIT sticker — and
// tapping a feed opens its evidence file: the frame "enhanced" to full colour,
// the capture details, and the memory note printed as the officer's
// observation. Every feed goes from grey to colour once it has been reviewed,
// so the wall itself becomes the progress bar.
//
// The timestamps are derived from the challan (issue date + a hash of the
// number), never from Date.now(), so the server, the browser and every revisit
// print the same footage.

import { useCallback, useContext, useEffect, useMemo, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

import { photoCrop, cropStyle } from "../../dedication/components/types";
import { Eyebrow, GROTESK, ITALIC, LoveThemeContext, ThemeScope } from "../../_love/LoveKit";
import { V } from "../../_love/theme";
import type { LovePhoto } from "../../_love/types";
import { NextStep, type NextAction } from "./flowKit";
import { CH, chHash } from "./theme";
import { challanVars } from "./themes";
import type { ChallanData } from "./types";

const pad = (n: number) => String(n).padStart(2, "0");

/** "06/08/2026 23:41:07" for every frame, walking back in time from the issue date. */
function useFrameStamps(issuedAt: string, seed: string, n: number): string[] {
  return useMemo(() => {
    const base = Date.parse(issuedAt);
    let t = Number.isFinite(base) ? base : Date.UTC(2026, 0, 1, 18, 0, 0);
    const out: string[] = new Array(n);
    for (let i = n - 1; i >= 0; i -= 1) {
      const h = chHash(`${seed}#frame${i}`);
      t -= (3 + (h % 40)) * 86400000 + (h % 50000) * 1000;
      const d = new Date(t);
      out[i] = `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
    }
    return out;
  }, [issuedAt, seed, n]);
}

const exhibit = (i: number) => String.fromCharCode(65 + (i % 26));
const cam = (i: number) => `CAM ${pad(i + 1)}`;

/** Column spans for a 2-col (phone) and 3-col (desktop) wall with no orphan holes. */
function spans(i: number, n: number): { ms: number; ds: number } {
  let ms = 1;
  if (i === 0) ms = 2;
  else if ((n - 1) % 2 === 1 && i === n - 1) ms = 2;
  let ds = 1;
  if (i === 0) ds = n === 1 ? 3 : 2;
  else if (i >= 2) {
    const left = (n - 2) % 3;
    if (left === 1 && i === n - 1) ds = 3;
    if (left === 2 && i === n - 2) ds = 2;
  }
  return { ms, ds };
}

/* ── The wall ─────────────────────────────────────────────────────────────── */

function Corners({ color = "rgba(255,255,255,.85)", inset = 8, arm = 14 }: { color?: string; inset?: number; arm?: number }) {
  const b = `2px solid ${color}`;
  const base: CSSProperties = { position: "absolute", width: arm, height: arm, pointerEvents: "none" };
  return (
    <>
      <span aria-hidden style={{ ...base, left: inset, top: inset, borderLeft: b, borderTop: b }} />
      <span aria-hidden style={{ ...base, right: inset, top: inset, borderRight: b, borderTop: b }} />
      <span aria-hidden style={{ ...base, left: inset, bottom: inset, borderLeft: b, borderBottom: b }} />
      <span aria-hidden style={{ ...base, right: inset, bottom: inset, borderRight: b, borderBottom: b }} />
    </>
  );
}

function FeedTile({ p, i, n, stamp, seen, onOpen }: { p: LovePhoto; i: number; n: number; stamp: string; seen: boolean; onOpen: () => void }) {
  const { ms, ds } = spans(i, n);
  const wide = ms === 2;
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open evidence file, exhibit ${exhibit(i)}${p.caption ? `: ${p.caption}` : ""}`}
      className="ch-tile lv-tile"
      style={
        {
          "--ms": ms,
          "--ds": ds,
          position: "relative",
          overflow: "hidden",
          borderRadius: 14,
          border: "none",
          padding: 0,
          cursor: "pointer",
          background: "#1a1c26",
          "--ma": wide ? "16 / 10" : "4 / 5",
          "--da": ds === 3 ? "21 / 9" : ds === 2 ? "16 / 9" : "4 / 5",
          minWidth: 0,
          WebkitTapHighlightColor: "transparent",
        } as CSSProperties
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={p.url}
        alt=""
        draggable={false}
        loading={i < 3 ? "eager" : "lazy"}
        className="ch-feed-img"
        style={{ ...cropStyle(photoCrop(p)), position: "absolute", inset: 0, filter: seen ? "none" : "grayscale(.7) contrast(1.15) brightness(.9)" }}
      />
      <span aria-hidden className="ch-scan" style={{ position: "absolute", inset: 0 }} />
      <span aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%)" }} />
      <Corners inset={9} arm={wide ? 18 : 13} />

      <span style={{ position: "absolute", left: 10, top: 10, display: "inline-flex", alignItems: "center", gap: 6, fontFamily: CH.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: ".08em", color: "#fff", textShadow: "0 1px 2px rgba(0,0,0,.9)" }}>
        <span className="ch-rec" aria-hidden /> {wide ? `REC · ${cam(i)}` : pad(i + 1)}
      </span>
      <span
        style={{ position: "absolute", right: 10, top: 9, padding: wide ? "3px 8px" : "2px 6px", borderRadius: 6, background: V.chip, color: V.chipInk, fontFamily: GROTESK, fontSize: wide ? 10.5 : 9.5, fontWeight: 800, letterSpacing: ".1em", transform: "rotate(3deg)", boxShadow: "0 4px 10px -4px rgba(0,0,0,.6)" }}
      >
        EXHIBIT {exhibit(i)}
      </span>

      <span style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: seen ? "26px 40px 9px 10px" : "26px 10px 9px", background: "linear-gradient(0deg, rgba(0,0,0,.78), rgba(0,0,0,0))", textAlign: "left" }}>
        {p.caption ? (
          <span style={{ display: "block", fontFamily: GROTESK, fontSize: wide ? 15 : 12.5, fontWeight: 800, color: "#fff", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            📍 {p.caption}
          </span>
        ) : null}
        <span style={{ display: "block", marginTop: 3, fontFamily: CH.mono, fontSize: 10, color: "rgba(255,255,255,.78)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{stamp}</span>
      </span>

      {seen ? (
        <span aria-label="reviewed" style={{ position: "absolute", right: 10, bottom: 11, width: 24, height: 24, borderRadius: "50%", display: "grid", placeItems: "center", background: "var(--ch-green)", color: "#fff", fontSize: 13, fontWeight: 800, boxShadow: "0 0 0 2px rgba(255,255,255,.85)" }}>✓</span>
      ) : null}
    </button>
  );
}

/* ── The evidence file ────────────────────────────────────────────────────── */

function EvidenceFile({
  photos,
  index,
  stamps,
  data,
  onIndex,
  onClose,
  reduceMotion,
}: {
  photos: LovePhoto[];
  index: number;
  stamps: string[];
  data: ChallanData;
  onIndex: (i: number) => void;
  onClose: () => void;
  reduceMotion: boolean;
}) {
  const theme = useContext(LoveThemeContext);
  const n = photos.length;
  const p = photos[index];
  const [dir, setDir] = useState(1);
  const go = useCallback(
    (d: number) => {
      setDir(d);
      onIndex((index + d + n) % n);
    },
    [index, n, onIndex],
  );

  useEffect(() => {
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

  const circle: CSSProperties = {
    width: 48,
    height: 48,
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,.28)",
    background: "rgba(255,255,255,.12)",
    color: "#fff",
    fontSize: 20,
    fontWeight: 800,
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
  };

  return createPortal(
    <ThemeScope style={theme ? challanVars(theme) : undefined}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Evidence file, exhibit ${exhibit(index)}`}
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px 14px", background: "rgba(6,6,14,.8)", fontFamily: GROTESK }}
      >
        <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 440, maxHeight: "calc(100dvh - 32px)", overflowY: "auto", overflowX: "hidden", position: "relative", paddingBottom: 4 }}>
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.div
              key={index}
              custom={dir}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: dir * 60, rotate: dir * 2 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: dir * -60, rotate: dir * -2 }}
              transition={{ duration: 0.28, ease: [0.2, 0.9, 0.3, 1] }}
            >
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                <span style={{ display: "inline-block", padding: "8px 16px 7px", borderRadius: "14px 14px 0 0", background: V.chip, color: V.chipInk, fontFamily: CH.mono, fontSize: 11.5, fontWeight: 700, letterSpacing: ".12em" }}>
                  EVIDENCE FILE · EXHIBIT {exhibit(index)}
                </span>
                <button type="button" onClick={onClose} aria-label="Close evidence file" className="lv-focus" style={{ ...circle, width: 40, height: 40, fontSize: 16, marginBottom: 6 }}>
                  ✕
                </button>
              </div>
              <div style={{ position: "relative", background: V.paper, color: V.paperInk, borderRadius: "0 22px 22px 22px", padding: 12, boxShadow: "0 40px 80px -30px rgba(0,0,0,.8)" }}>
                <motion.div
                  drag={n > 1 && !reduceMotion ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.5}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -60) go(1);
                    else if (info.offset.x > 60) go(-1);
                  }}
                  style={{ position: "relative", height: "min(50dvh, 520px)", borderRadius: 14, overflow: "hidden", background: "#111", touchAction: "pan-y" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={p.caption || `Exhibit ${exhibit(index)}`} draggable={false} style={{ ...cropStyle(photoCrop(p)), position: "absolute", inset: 0 }} />
                  <span aria-hidden className="ch-scan ch-scan-soft" style={{ position: "absolute", inset: 0 }} />
                  <Corners inset={12} arm={20} />
                  <span style={{ position: "absolute", left: 14, top: 14, display: "inline-flex", alignItems: "center", gap: 6, fontFamily: CH.mono, fontSize: 11, fontWeight: 700, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,.9)" }}>
                    <span className="ch-rec" aria-hidden /> {cam(index)}
                  </span>
                  <span style={{ position: "absolute", right: 14, top: 13, padding: "3px 9px", borderRadius: 999, background: "rgba(0,0,0,.55)", color: "#fff", fontFamily: GROTESK, fontSize: 11, fontWeight: 800 }}>✨ enhanced</span>
                  <span style={{ position: "absolute", right: 14, bottom: 12, fontFamily: CH.mono, fontSize: 11, color: "rgba(255,255,255,.9)", textShadow: "0 1px 3px rgba(0,0,0,.95)" }}>{stamps[index]}</span>
                </motion.div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px", marginTop: 12, fontFamily: CH.mono, fontSize: 11 }}>
                  <Meta k="Location" v={p.caption || data.location || "undisclosed"} wide />
                  <Meta k="Captured" v={stamps[index]} />
                  <Meta k="Camera" v={`${cam(index)} · Heart Traffic`} />
                </div>

                <div style={{ borderTop: `1.5px dashed color-mix(in srgb, var(--lv-paper-ink) 22%, transparent)`, margin: "12px 0 10px" }} />

                <div style={{ position: "relative", padding: "0 2px 6px" }}>
                  <p style={{ margin: 0, fontFamily: GROTESK, fontSize: 11, fontWeight: 800, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ch-red)" }}>Officer&apos;s observation</p>
                  <p style={{ margin: "8px 0 0", fontFamily: ITALIC, fontSize: 22, lineHeight: 1.3, color: V.paperInk, overflowWrap: "anywhere", whiteSpace: "pre-line", paddingRight: 4 }}>
                    {p.note?.trim() || "No remarks. The footage speaks for itself."}
                  </p>
                  <p style={{ margin: "10px 0 0", fontFamily: CH.mono, fontSize: 11, color: V.paperSoft }}>
                    — {data.officer.name || "the officer"}, badge #{data.officer.id || "0000"}
                  </p>
                  <span
                    aria-hidden
                    className={reduceMotion ? "" : "lv-slap"}
                    style={{ position: "absolute", right: 0, bottom: 0, padding: "4px 9px", border: "2.5px solid var(--ch-red)", borderRadius: 8, color: "var(--ch-red)", fontFamily: GROTESK, fontSize: 11, fontWeight: 800, letterSpacing: ".12em", opacity: 0.85, animationDelay: "250ms" }}
                  >
                    VERIFIED CUTE ✓
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {n > 1 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, marginTop: 14 }}>
              <button type="button" onClick={() => go(-1)} aria-label="Previous exhibit" className="lv-focus" style={circle}>
                ‹
              </button>
              <span style={{ fontFamily: CH.mono, fontSize: 13, color: "rgba(255,255,255,.85)", minWidth: 64, textAlign: "center" }}>
                {index + 1} / {n}
              </span>
              <button type="button" onClick={() => go(1)} aria-label="Next exhibit" className="lv-focus" style={circle}>
                ›
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </ThemeScope>,
    document.body,
  );
}

function Meta({ k, v, wide }: { k: string; v: string; wide?: boolean }) {
  return (
    <div style={{ gridColumn: wide ? "1 / -1" : undefined, minWidth: 0 }}>
      <div style={{ fontSize: 9.5, letterSpacing: ".16em", textTransform: "uppercase", color: V.paperSoft }}>{k}</div>
      <div style={{ marginTop: 2, fontWeight: 700, color: V.paperInk, overflowWrap: "anywhere" }}>{v}</div>
    </div>
  );
}

/* ── The room ─────────────────────────────────────────────────────────────── */

export default function EvidenceRoom({
  data,
  gif,
  next,
  reduceMotion,
}: {
  data: ChallanData;
  gif?: string;
  next: NextAction | null;
  reduceMotion: boolean;
}) {
  const photos = data.photos;
  const n = photos.length;
  const stamps = useFrameStamps(data.issuedAt, data.challanNo, n);
  const [open, setOpen] = useState<number | null>(null);
  const [seen, setSeen] = useState<Set<number>>(() => new Set());

  const view = useCallback((i: number) => {
    setOpen(i);
    setSeen((s) => (s.has(i) ? s : new Set(s).add(i)));
  }, []);

  const all = n > 0 && seen.size >= n;
  const tail = data.challanNo.replace(/[^\w]/g, "").slice(-4) || "0447";

  return (
    <div className="ch-wrap" style={{ maxWidth: 980 }}>
      <header className="lv-pop" style={{ textAlign: "center", marginBottom: 18 }}>
        <Eyebrow color={V.a1}>cctv control room · case {data.challanNo}</Eyebrow>
        <h2 style={{ margin: "8px 0 0", fontFamily: GROTESK, fontWeight: 800, fontSize: "clamp(32px, 8vw, 54px)", lineHeight: 0.98, letterSpacing: "-0.045em", color: V.ink }}>
          The evidence 📹
        </h2>
        <p style={{ margin: "10px auto 0", maxWidth: 440, fontFamily: ITALIC, fontStyle: "italic", fontSize: 19, lineHeight: 1.3, color: V.soft }}>
          {n} frame{n === 1 ? "" : "s"} recovered from the scene. Tap a feed to open its evidence file.
        </p>
      </header>

      <div style={{ background: "#0b0d14", borderRadius: 26, padding: 10, border: "1px solid rgba(255,255,255,.08)", boxShadow: `0 40px 80px -40px ${V.shadow}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "2px 6px 10px", fontFamily: CH.mono, fontSize: 10.5, letterSpacing: ".1em", color: "#9aa3c7" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, whiteSpace: "nowrap" }}>
            <span className="ch-rec" aria-hidden /> LIVE · HT-CCTV-{tail}
          </span>
          <span style={{ whiteSpace: "nowrap" }}>
            {n} FEED{n === 1 ? "" : "S"}
          </span>
        </div>
        <div className="ch-wall">
          {photos.map((p, i) => (
            <FeedTile key={`${i}-${p.url.slice(-16)}`} p={p} i={i} n={n} stamp={stamps[i]} seen={seen.has(i)} onOpen={() => view(i)} />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 6px 4px", fontFamily: CH.mono, fontSize: 10.5, letterSpacing: ".1em", color: "#9aa3c7" }}>
          <span style={{ whiteSpace: "nowrap" }}>
            REVIEWED {seen.size}/{n}
          </span>
          <span style={{ flex: 1, height: 5, borderRadius: 99, background: "rgba(255,255,255,.1)", overflow: "hidden" }}>
            <span style={{ display: "block", height: "100%", width: `${n ? (seen.size / n) * 100 : 0}%`, background: V.grad, borderRadius: 99, transition: "width .5s ease" }} />
          </span>
          <span style={{ whiteSpace: "nowrap", color: all ? "#7dffb0" : "#9aa3c7" }}>{all ? "CASE: AIRTIGHT" : "PENDING"}</span>
        </div>
      </div>

      <NextStep gif={all ? gif : undefined} gifCaption="evidence: overwhelming 🔨" next={next} />

      {open !== null && photos[open] ? (
        <EvidenceFile photos={photos} index={open} stamps={stamps} data={data} onIndex={view} onClose={() => setOpen(null)} reduceMotion={reduceMotion} />
      ) : null}
    </div>
  );
}
