"use client";

// ─── "More pieces of us" — the memory board ──────────────────────────────────
//
// After the photo is whole, the sender's memory photos tumble onto a second
// board as real interlocking jigsaw pieces (outlines from ./jigsaw — every seam
// is stored once, so neighbours always fit) and snap together one by one. Tap
// a piece → it opens big with its memory note. The final piece on the board is
// the letter's envelope: the actual last piece of the gift.

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { cropStyle, photoCrop } from "../../dedication/components/types";
import { GROTESK, ITALIC, ThemeScope } from "../../_love/LoveKit";
import { V } from "../../_love/theme";
import type { LovePhoto } from "../../_love/types";
import { buildEdgeMap, edgesForPiece, piecePathD, TAB_DEPTH_FRACTION, type PieceEdges } from "./jigsaw";

/** Offsets every coordinate pair in an M/L/C path by (dx, dy). */
function shiftPath(d: string, dx: number, dy: number): string {
  let k = 0;
  return d
    .split(" ")
    .map((tok) => {
      if (!/^-?\d/.test(tok)) return tok;
      const v = Number(tok) + (k++ % 2 === 0 ? dx : dy);
      return String(Math.round(v * 100) / 100);
    })
    .join(" ");
}

const noopSubscribe = () => () => {};

export default function MemoryJigsaw({
  photos,
  reduceMotion,
  onAllSeen,
  onLetter,
  hasLetter,
  seed,
}: {
  photos: LovePhoto[];
  reduceMotion: boolean;
  onAllSeen: () => void;
  onLetter?: () => void;
  hasLetter: boolean;
  seed: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const [seen, setSeen] = useState<Set<number>>(() => new Set());

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const count = photos.length + (hasLetter ? 1 : 0);
  const cols = width >= 720 ? Math.min(4, count) : width >= 520 ? Math.min(3, count) : Math.min(2, count);
  const rows = Math.max(1, Math.ceil(count / Math.max(1, cols)));
  // Cell size so the grid plus the tab overhang on both sides fits the width.
  const k = TAB_DEPTH_FRACTION + 0.02;
  const c = Math.max(60, Math.floor(Math.min(width / (cols + 2 * k), width >= 720 ? 230 : 260)));
  const oh = Math.ceil(TAB_DEPTH_FRACTION * c) + 2;
  const map = buildEdgeMap(cols, rows, `memories:${seed}`);

  const edgesAt = (i: number): PieceEdges => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const e = edgesForPiece(map, col, row);
    // A neighbour that does not exist (short last row) means a flat edge.
    if (col === cols - 1 || i + 1 >= count) e.right = "flat";
    if (i + cols >= count) e.bottom = "flat";
    // The letter piece only ever pushes tabs OUT, so no neighbour's tab can
    // cover its label.
    if (hasLetter) {
      const L = photos.length;
      if (i === L) {
        if (e.left === "blank") e.left = "tab";
        if (e.top === "blank") e.top = "tab";
      }
      if (i + 1 === L && col < cols - 1 && e.right === "tab") e.right = "blank";
      if (i + cols === L && e.bottom === "tab") e.bottom = "blank";
    }
    return e;
  };

  const markSeen = (i: number) => setSeen((s) => (s.has(i) ? s : new Set(s).add(i)));

  useEffect(() => {
    if (seen.size >= photos.length) onAllSeen();
  }, [seen, photos.length, onAllSeen]);

  const openAt = (i: number) => {
    setOpen(i);
    markSeen(i);
  };

  return (
    <div ref={wrapRef} style={{ width: "100%", maxWidth: 960, margin: "0 auto" }}>
      {width > 0 && (
        <div style={{ position: "relative", width: cols * c + oh * 2, height: rows * c + oh * 2, margin: "0 auto" }}>
          {Array.from({ length: count }, (_, i) => {
            const isLetter = i === photos.length;
            const col = i % cols;
            const row = Math.floor(i / cols);
            // Each outline shrinks a little toward its own centre, so the pieces
            // sit on the board with a hairline gap and read as separate pieces.
            const inner = c * 0.94;
            const d = shiftPath(piecePathD(edgesAt(i), inner, inner), oh + (c - inner) / 2, oh + (c - inner) / 2);
            const p = photos[i];
            const rnd = Math.sin((i + 1) * 91.7) * 10000;
            const f = rnd - Math.floor(rnd);
            const style = {
              position: "absolute",
              left: col * c,
              top: row * c,
              width: c + oh * 2,
              height: c + oh * 2,
              filter: `drop-shadow(0 8px 10px color-mix(in srgb, var(--lv-shadow) 70%, transparent))`,
              "--dx": `${Math.round((f - 0.5) * 240)}px`,
              "--dy": `${Math.round(-120 - f * 160)}px`,
              "--rot": `${Math.round((f - 0.5) * 70)}deg`,
              animation: reduceMotion ? "none" : `lp-snap .8s cubic-bezier(.2,.9,.3,1.15) ${180 + i * 120}ms both`,
              pointerEvents: "none",
            } as CSSProperties;
            const label = isLetter ? "The last piece: open my letter" : `Memory ${i + 1}${p.caption ? `: ${p.caption}` : ""}`;
            return (
              <div key={i} className="lp-piece" style={style}>
                <button
                  type="button"
                  onClick={() => (isLetter ? onLetter?.() : openAt(i))}
                  aria-label={label}
                  className="lp-piece-btn"
                  style={{
                    position: "absolute",
                    inset: 0,
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    clipPath: `path("${d}")`,
                    background: isLetter ? V.grad : V.paper,
                    pointerEvents: "auto",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  {isLetter ? (
                    <span style={{ position: "absolute", left: oh, top: oh, width: c, height: c, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, color: "#fff", textAlign: "center", fontFamily: GROTESK }}>
                      <span aria-hidden className="lv-float" style={{ fontSize: Math.round(c * 0.3), lineHeight: 1 }}>💌</span>
                      <span style={{ fontWeight: 800, fontSize: Math.max(11, Math.round(c * 0.085)), letterSpacing: ".14em", textTransform: "uppercase", opacity: 0.9 }}>the last piece</span>
                      <span style={{ fontFamily: ITALIC, fontStyle: "italic", fontSize: Math.max(15, Math.round(c * 0.13)), lineHeight: 1 }}>my letter</span>
                    </span>
                  ) : (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.url} alt="" draggable={false} loading="lazy" style={{ ...cropStyle(photoCrop(p)), position: "absolute", inset: 0 }} />
                      <span
                        aria-hidden
                        style={{ position: "absolute", left: oh + c * 0.03 + 8, top: oh + c * 0.03 + 8, minWidth: 26, height: 26, padding: "0 7px", borderRadius: 999, display: "grid", placeItems: "center", fontFamily: GROTESK, fontWeight: 800, fontSize: 12, background: seen.has(i) ? V.chip : "rgba(255,255,255,.92)", color: seen.has(i) ? V.chipInk : "#222" }}
                      >
                        {seen.has(i) ? "♥" : i + 1}
                      </span>
                    </>
                  )}
                </button>
                <svg aria-hidden width={c + oh * 2} height={c + oh * 2} style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}>
                  <path d={d} fill="none" stroke="rgba(255,255,255,.9)" strokeWidth={3} strokeLinejoin="round" />
                </svg>
              </div>
            );
          })}
        </div>
      )}

      <p style={{ margin: "14px 0 0", textAlign: "center", fontFamily: GROTESK, fontWeight: 700, fontSize: 13, color: V.soft }}>
        {photos.length ? `${seen.size}/${photos.length} memories opened` : ""}
      </p>

      <MemorySheet photos={photos} index={open} onIndex={(i) => (i === null ? setOpen(null) : openAt(i))} reduceMotion={reduceMotion} />
      <style>{JIGSAW_CSS}</style>
    </div>
  );
}

const JIGSAW_CSS = `
@keyframes lp-snap { 0% { transform: translate(var(--dx), var(--dy)) rotate(var(--rot)) scale(.85); opacity: 0 } 65% { transform: translate(0,0) rotate(0) scale(1.04); opacity: 1 } 100% { transform: none; opacity: 1 } }
.lp-piece-btn { transition: transform .22s cubic-bezier(.2,.9,.3,1.3), filter .2s ease !important; transform-origin: 50% 50%; }
@media (hover: hover) { .lp-piece-btn:hover { transform: scale(1.035); filter: brightness(1.05); } }
.lp-piece-btn:active { transform: scale(.97); }
.lp-piece-btn:focus-visible { outline: none; filter: brightness(1.12) drop-shadow(0 0 0 var(--lv-a2)); }
@media (prefers-reduced-motion: reduce) { .lp-piece { animation: none !important; } }
`;

function MemorySheet({ photos, index, onIndex, reduceMotion }: { photos: LovePhoto[]; index: number | null; onIndex: (i: number | null) => void; reduceMotion: boolean }) {
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const onIndexRef = useRef(onIndex);
  useEffect(() => {
    onIndexRef.current = onIndex;
  });
  const open = index !== null;
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onIndexRef.current(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!hydrated) return null;
  const p = index !== null ? photos[index] : null;
  const go = (d: number) => index !== null && onIndex((index + d + photos.length) % photos.length);
  const nav: CSSProperties = { width: 46, height: 46, borderRadius: "50%", border: `1px solid ${V.edge}`, background: V.glass, color: V.ink, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 };

  return createPortal(
    <ThemeScope>
      <AnimatePresence>
        {p && index !== null && (
          <motion.div
            key="lp-sheet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onIndex(null)}
            style={{ position: "fixed", inset: 0, zIndex: 180, background: "rgba(10,5,20,.66)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={p.caption || `Memory ${index + 1}`}
              key={index}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 40, rotate: -3, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              style={{ position: "relative", width: "min(440px, 100%)", maxHeight: "92dvh", overflowY: "auto", borderRadius: 26, background: V.paper, color: V.paperInk, boxShadow: "0 40px 90px -30px rgba(0,0,0,.8)", fontFamily: GROTESK }}
            >
              <div style={{ padding: 12, paddingBottom: 0 }}>
                <div style={{ position: "relative", width: "100%", aspectRatio: "4 / 5", borderRadius: 18, overflow: "hidden", background: "#eee" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={p.caption || ""} draggable={false} style={cropStyle(photoCrop(p))} />
                  <span style={{ position: "absolute", left: 12, top: 12, padding: "5px 11px", borderRadius: 999, background: "rgba(255,255,255,.92)", color: "#222", fontWeight: 800, fontSize: 12, letterSpacing: ".08em" }}>
                    🧩 piece {index + 1} of {photos.length}
                  </span>
                  <button type="button" onClick={() => onIndex(null)} aria-label="Close" className="lv-focus" style={{ position: "absolute", right: 10, top: 10, width: 42, height: 42, borderRadius: "50%", border: "none", background: "rgba(0,0,0,.5)", color: "#fff", display: "grid", placeItems: "center", cursor: "pointer" }}>
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div style={{ padding: "16px 20px 18px" }}>
                {p.caption && <h3 style={{ margin: 0, fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em", color: V.paperInk }}>{p.caption}</h3>}
                <p style={{ margin: p.caption ? "8px 0 0" : 0, fontFamily: ITALIC, fontStyle: "italic", fontSize: 21, lineHeight: 1.4, whiteSpace: "pre-wrap", overflowWrap: "anywhere", color: V.paperInk }}>
                  {p.note?.trim() || "no words needed for this one 💗"}
                </p>
                {photos.length > 1 && (
                  <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
                    <button type="button" onClick={() => go(-1)} aria-label="Previous memory" className="lv-focus" style={nav}>
                      <ChevronLeft size={20} />
                    </button>
                    <div style={{ flex: 1, display: "flex", justifyContent: "center", gap: 5 }}>
                      {photos.map((_, i) => (
                        <span key={i} style={{ width: i === index ? 18 : 7, height: 7, borderRadius: 99, background: i === index ? V.a1 : V.paperSoft, opacity: i === index ? 1 : 0.4, transition: "width .25s ease" }} />
                      ))}
                    </div>
                    <button type="button" onClick={() => go(1)} aria-label="Next memory" className="lv-focus" style={nav}>
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ThemeScope>,
    document.body,
  );
}
