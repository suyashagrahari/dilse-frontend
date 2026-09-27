"use client";

// ─── Love kit — the memory hub ───────────────────────────────────────────────
//
// Instead of one long scroll (photos, then GIFs, then remedies, then the
// letter…), every love-kit template ends on ONE screen of tappable bento tiles.
// Each tile is a little live preview (a fanned photo stack, a sealed envelope,
// a playing GIF…) and opens its full content in a sheet: a bottom sheet on a
// phone, a centred card from 768px. Nothing is more than one tap away and the
// page never gets long.

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { cropStyle, photoCrop } from "../dedication/components/types";
import { GROTESK, ITALIC, ThemeScope } from "./LoveKit";
import { V } from "./theme";
import type { LovePhoto } from "./types";

export type TileSize = "one" | "wide" | "tall" | "big";
export type TileTone = "glass" | "paper" | "candy" | "chip";

export interface HubTile {
  id: string;
  emoji: string;
  title: string;
  /** Small line under the title: "6 photos · tap to open". */
  sub?: string;
  size?: TileSize;
  tone?: TileTone;
  /** The live preview drawn inside the tile. */
  art?: ReactNode;
  /** Sheet header; defaults to `title`. */
  sheetTitle?: string;
  /** What the sheet shows. A function so heavy content only renders when opened. */
  content: () => ReactNode;
  /** Wider sheet on desktop (galleries). */
  wide?: boolean;
}

const HUB_CSS = `
.lv-hub { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: 158px; grid-auto-flow: dense; gap: 12px; }
.lv-hub > .lv-s-wide { grid-column: span 2; }
.lv-hub > .lv-s-tall { grid-row: span 2; }
.lv-hub > .lv-s-big { grid-column: span 2; grid-row: span 2; }
@media (min-width: 768px) {
  .lv-hub { grid-template-columns: repeat(4, minmax(0, 1fr)); grid-auto-rows: 176px; gap: 16px; }
}
.lv-sheet-wrap { position: fixed; inset: 0; z-index: 170; display: flex; align-items: flex-end; justify-content: center; }
.lv-sheet-panel { position: relative; width: 100%; max-height: 94dvh; border-radius: 28px 28px 0 0; }
@media (min-width: 768px) {
  .lv-sheet-wrap { align-items: center; padding: 24px; }
  .lv-sheet-panel { width: min(760px, 92vw); max-height: 88dvh; border-radius: 28px; }
  .lv-sheet-panel.lv-sheet-wide { width: min(1040px, 94vw); }
}
`;

export default function MemoryHub({ tiles, reduceMotion }: { tiles: HubTile[]; reduceMotion: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  const tile = tiles.find((t) => t.id === open) ?? null;
  const lastFocus = useRef<HTMLElement | null>(null);

  const openTile = (id: string, el: HTMLElement) => {
    lastFocus.current = el;
    setOpen(id);
  };
  const close = () => {
    setOpen(null);
    lastFocus.current?.focus?.();
  };

  return (
    <>
      <style>{HUB_CSS}</style>
      <div className="lv-hub">
        {tiles.map((t, i) => (
          <button
            key={t.id}
            type="button"
            onClick={(e) => openTile(t.id, e.currentTarget)}
            aria-haspopup="dialog"
            aria-label={`${t.title}${t.sub ? ` — ${t.sub}` : ""}`}
            className={`lv-tile lv-s-${t.size ?? "one"} ${reduceMotion ? "" : "lv-pop"}`}
            style={{ ...tileSurface(t.tone ?? "glass"), animationDelay: `${i * 70}ms` }}
          >
            <span style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: "inherit" }}>{t.art}</span>
            <span
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                padding: "26px 14px 12px",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: 8,
                background: tileFade(t.tone ?? "glass"),
                textAlign: "left",
              }}
            >
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontFamily: GROTESK, fontWeight: 800, fontSize: 16, lineHeight: 1.1, letterSpacing: "-0.01em" }}>
                  <span aria-hidden style={{ marginRight: 6 }}>{t.emoji}</span>
                  {t.title}
                </span>
                {t.sub && <span style={{ display: "block", marginTop: 3, fontSize: 12, fontWeight: 600, opacity: 0.78, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.sub}</span>}
              </span>
              <span aria-hidden style={{ flexShrink: 0, width: 28, height: 28, borderRadius: "50%", display: "grid", placeItems: "center", background: "rgba(255,255,255,.9)", color: "#1a0d26", fontSize: 14, fontWeight: 800 }}>
                ↗
              </span>
            </span>
          </button>
        ))}
      </div>

      <LoveSheet open={!!tile} title={tile?.sheetTitle ?? tile?.title ?? ""} emoji={tile?.emoji ?? ""} wide={tile?.wide} onClose={close} reduceMotion={reduceMotion}>
        {tile?.content()}
      </LoveSheet>
    </>
  );
}

function tileSurface(tone: TileTone): CSSProperties {
  const base: CSSProperties = {
    position: "relative",
    overflow: "hidden",
    borderRadius: 26,
    padding: 0,
    cursor: "pointer",
    textAlign: "left",
    WebkitTapHighlightColor: "transparent",
    boxShadow: `0 22px 44px -26px ${V.shadow}`,
    fontFamily: GROTESK,
  };
  if (tone === "paper") return { ...base, background: V.paper, color: V.paperInk, border: "none" };
  if (tone === "candy") return { ...base, background: V.grad, color: "#fff", border: "none" };
  if (tone === "chip") return { ...base, background: V.chip, color: V.chipInk, border: "none" };
  return { ...base, background: V.glass, color: V.ink, border: `1px solid ${V.edge}`, backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" };
}

function tileFade(tone: TileTone): string {
  if (tone === "paper") return "linear-gradient(to top, var(--lv-paper) 55%, transparent)";
  if (tone === "candy") return "linear-gradient(to top, rgba(0,0,0,.28), transparent)";
  if (tone === "chip") return "linear-gradient(to top, var(--lv-chip) 55%, transparent)";
  return "linear-gradient(to top, color-mix(in srgb, var(--lv-base) 88%, transparent) 50%, transparent)";
}

const noopSubscribe = () => () => {};

// ─── The sheet ───────────────────────────────────────────────────────────────

export function LoveSheet({
  open,
  title,
  emoji,
  wide,
  onClose,
  reduceMotion,
  children,
}: {
  open: boolean;
  title: string;
  emoji?: string;
  wide?: boolean;
  onClose: () => void;
  reduceMotion: boolean;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  // No portal on the server (or on the first client render), so hydration matches.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  // Held in a ref so a parent re-render never re-runs the open/close effect.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCloseRef.current();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => panelRef.current?.focus(), 40);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open]);

  // Portalled to <body>: the template root isolates its stacking context, so
  // inside it the sheet could never rise above the page's own top bar.
  if (!hydrated) return null;
  return createPortal(
    <ThemeScope>
    <AnimatePresence>
      {open && (
        <motion.div
          key="lv-sheet"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="lv-sheet-wrap"
          style={{ background: "rgba(8,4,18,.62)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
        >
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`lv-sheet-panel ${wide ? "lv-sheet-wide" : ""}`}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 60, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 60, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              outline: "none",
              background: V.base,
              color: V.ink,
              border: `1px solid ${V.edge}`,
              boxShadow: "0 40px 90px -30px rgba(0,0,0,.8)",
              fontFamily: GROTESK,
            }}
          >
            <div aria-hidden style={{ position: "absolute", inset: 0, background: V.bg, opacity: 0.9, pointerEvents: "none" }} />
            <header style={{ position: "relative", display: "flex", alignItems: "center", gap: 10, padding: "14px 14px 12px 18px", borderBottom: `1px solid ${V.edge}` }}>
              <span aria-hidden style={{ width: 36, height: 36, borderRadius: 12, display: "grid", placeItems: "center", background: V.grad, fontSize: 18, flexShrink: 0 }}>
                {emoji}
              </span>
              <h3 style={{ margin: 0, flex: 1, minWidth: 0, fontWeight: 800, fontSize: 19, letterSpacing: "-0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="lv-focus"
                style={{ width: 44, height: 44, borderRadius: "50%", border: `1px solid ${V.edge}`, background: V.glass, color: V.ink, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}
              >
                <X size={20} />
              </button>
            </header>
            <div style={{ position: "relative", flex: 1, minHeight: 0, overflowY: "auto", overscrollBehavior: "contain", padding: "18px 16px calc(24px + env(safe-area-inset-bottom, 0px))" }}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </ThemeScope>,
    document.body,
  );
}

// ─── Tile arts ───────────────────────────────────────────────────────────────

/** A fanned stack of up to three polaroids. */
export function PhotoStackArt({ photos }: { photos: LovePhoto[] }) {
  const shown = photos.slice(0, 3);
  const tilts = [-9, 6, -2];
  const offs = ["-26%", "22%", "0%"];
  return (
    <span aria-hidden style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", paddingBottom: 40 }}>
      {shown.map((p, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            width: "min(46%, 170px)",
            aspectRatio: "4 / 5",
            background: "#fffdf7",
            padding: "6px 6px 16px",
            borderRadius: 6,
            boxShadow: "0 14px 28px -14px rgba(0,0,0,.7)",
            transform: `translateX(${offs[i]}) rotate(${tilts[i]}deg)`,
            top: "9%",
          }}
        >
          <span style={{ position: "relative", display: "block", width: "100%", height: "100%", overflow: "hidden", borderRadius: 3, background: "#eee6dc" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt="" draggable={false} loading="lazy" style={cropStyle(photoCrop(p))} />
          </span>
        </span>
      ))}
    </span>
  );
}

/** A sealed envelope with a wax heart. */
export function EnvelopeArt({ to }: { to?: string }) {
  return (
    <span aria-hidden style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", paddingBottom: 46 }}>
      <span className="lv-float" style={{ position: "relative", width: "min(72%, 190px)", aspectRatio: "3 / 2", borderRadius: 10, background: "linear-gradient(160deg, #fff7ec, #f6e6cf)", boxShadow: "0 18px 30px -16px rgba(0,0,0,.6)" }}>
        <span style={{ position: "absolute", inset: 0, clipPath: "polygon(0 0, 100% 0, 50% 58%)", background: "linear-gradient(180deg, #f1dcc0, #ead2b2)", borderRadius: "10px 10px 0 0" }} />
        <span style={{ position: "absolute", left: "50%", top: "58%", width: 34, height: 34, marginLeft: -17, marginTop: -17, borderRadius: "50%", background: V.grad, display: "grid", placeItems: "center", color: "#fff", fontSize: 15, boxShadow: "0 4px 10px rgba(0,0,0,.3)" }}>♥</span>
        {to && (
          <span style={{ position: "absolute", left: 10, bottom: 6, fontFamily: ITALIC, fontStyle: "italic", fontSize: 15, color: "#6b4a3a" }}>for {to}</span>
        )}
      </span>
    </span>
  );
}

/** The first GIF, playing, as a tilted sticker. */
export function GifArt({ gifs }: { gifs: string[] }) {
  return (
    <span aria-hidden style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", paddingBottom: 44 }}>
      {gifs.slice(0, 2).map((g, i) => (
        <span
          key={g}
          style={{
            position: "absolute",
            width: i ? "38%" : "50%",
            maxWidth: i ? 110 : 140,
            aspectRatio: "1 / 1",
            borderRadius: 18,
            overflow: "hidden",
            background: "#fff",
            border: "4px solid #fff",
            boxShadow: "0 14px 26px -14px rgba(0,0,0,.7)",
            transform: i ? "translate(62%, -18%) rotate(9deg)" : "translate(-14%, 4%) rotate(-5deg)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={g} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </span>
      ))}
    </span>
  );
}

/** A big emoji medallion — for template-specific tiles without imagery. */
export function EmojiArt({ emoji, label }: { emoji: string; label?: string }) {
  return (
    <span aria-hidden style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", paddingBottom: 44 }}>
      <span style={{ display: "grid", placeItems: "center", textAlign: "center" }}>
        <span className="lv-wiggle" style={{ fontSize: 54, lineHeight: 1, filter: "drop-shadow(0 10px 14px rgba(0,0,0,.25))" }}>
          {emoji}
        </span>
        {label && <span style={{ marginTop: 6, fontWeight: 800, fontSize: 26, letterSpacing: "-0.03em" }}>{label}</span>}
      </span>
    </span>
  );
}
