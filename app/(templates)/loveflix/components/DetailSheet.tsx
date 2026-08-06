"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";

import PlaceholderArt from "./PlaceholderArt";
import {
  ACCENT,
  BG_CARD,
  BG_RAISED,
  CARD_RADIUS,
  FONT_BODY,
  FONT_DISPLAY,
  HAIRLINE,
  TAP,
  TEXT,
  TEXT_DIM,
  Z,
} from "./theme";
import type { RowItem } from "./types";

export interface DetailSheetProps {
  /** null closes the sheet. */
  item: RowItem | null;
  /** The rail it came from — shown as an eyebrow above the title. */
  rowTitle: string;
  onClose: () => void;
  reducedMotion: boolean;
}

/**
 * The card detail modal: a bottom sheet on a phone, a centred dialog once there
 * is room for one. It is a modal rather than an exported composition, so it is
 * allowed to reflow at a breakpoint.
 *
 * Three ways out, because a sheet with one is a trap: the backdrop, an explicit
 * close button, and Escape. Focus moves to the close button on open and returns
 * to whatever opened the sheet on close.
 *
 * A long caption scrolls inside the panel; nothing here can push the page.
 */

const CSS = `
.lfx-ds-wrap{
  position:fixed;inset:0;z-index:${Z.sheet};
  display:flex;align-items:flex-end;justify-content:center;
  background:rgba(0,0,0,0.72);
}
.lfx-ds-panel{
  position:relative;width:100%;max-height:88dvh;
  display:flex;flex-direction:column;overflow:hidden;
  border-radius:14px 14px 0 0;
  background:${BG_RAISED};
  box-shadow:0 -18px 48px rgba(0,0,0,0.55);
}
.lfx-ds-grip{display:block;}
@media (min-width:640px){
  .lfx-ds-wrap{align-items:center;padding:24px;}
  .lfx-ds-panel{max-width:520px;max-height:84dvh;border-radius:${CARD_RADIUS * 2}px;
    box-shadow:0 24px 64px rgba(0,0,0,0.6);}
  .lfx-ds-grip{display:none;}
}
.lfx-ds-close{
  position:absolute;top:8px;right:8px;z-index:2;
  width:${TAP}px;height:${TAP}px;display:inline-flex;align-items:center;justify-content:center;
  border-radius:999px;border:1px solid ${HAIRLINE};background:rgba(13,13,13,0.72);
  color:${TEXT};cursor:pointer;-webkit-tap-highlight-color:transparent;
  backdrop-filter:blur(6px);
}
.lfx-ds-close:focus-visible{outline:2px solid ${TEXT};outline-offset:2px;}
.lfx-ds-body{
  flex:1 1 auto;min-height:0;
  overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;
  padding:16px 18px calc(20px + env(safe-area-inset-bottom, 0px));
}
`;

export default function DetailSheet({ item, rowTitle, onClose, reducedMotion }: DetailSheetProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const open = item !== null;

  // Escape closes. Bound while open only, so it never competes with the player.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Focus in on open, back to the card that opened it on close.
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement;
    restoreRef.current = prev instanceof HTMLElement ? prev : null;
    closeRef.current?.focus();
    return () => {
      const el = restoreRef.current;
      restoreRef.current = null;
      if (el && document.contains(el)) el.focus();
    };
  }, [open]);

  if (!item) return null;

  const pct = Math.round(item.progress);
  const hasProgress = pct > 0;

  return (
    <div
      className="lfx-ds-wrap"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <style>{CSS}</style>

      <motion.div
        className="lfx-ds-panel"
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
        initial={reducedMotion ? false : { opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.26, ease: [0.22, 0.9, 0.3, 1] }}
      >
        <button
          ref={closeRef}
          type="button"
          className="lfx-ds-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={20} strokeWidth={2.2} aria-hidden />
        </button>

        <PlaceholderArt
          src={item.imageUrl}
          title={item.title}
          variant="card"
          seedSalt={`${rowTitle}|detail`}
          alt=""
          style={{ width: "100%", aspectRatio: "16 / 9", flexShrink: 0 }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(to top, ${BG_RAISED} 0%, rgba(22,22,22,0) 52%)`,
            }}
          />
        </PlaceholderArt>

        {/* Bottom-sheet grip; hidden once the panel becomes a centred dialog. */}
        <span
          aria-hidden
          className="lfx-ds-grip"
          style={{
            position: "absolute",
            top: 8,
            left: "50%",
            marginLeft: -18,
            width: 36,
            height: 4,
            borderRadius: 999,
            background: "rgba(255,255,255,0.32)",
          }}
        />

        <div className="lfx-ds-body">
          {rowTitle ? (
            <div
              style={{
                fontFamily: FONT_BODY,
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: TEXT_DIM,
              }}
            >
              {rowTitle}
            </div>
          ) : null}

          <h3
            style={{
              margin: "6px 0 0",
              fontFamily: FONT_DISPLAY,
              fontWeight: 600,
              fontSize: "clamp(22px, 6vw, 30px)",
              lineHeight: 1.08,
              letterSpacing: "-0.005em",
              color: TEXT,
            }}
          >
            {item.title}
          </h3>

          {item.runtime ? (
            <div
              style={{
                marginTop: 8,
                fontFamily: FONT_BODY,
                fontSize: 12,
                letterSpacing: "0.04em",
                color: TEXT_DIM,
              }}
            >
              {item.runtime}
            </div>
          ) : null}

          {hasProgress ? (
            <div style={{ marginTop: 14 }}>
              <div
                style={{
                  width: "100%",
                  height: 3,
                  borderRadius: 2,
                  background: BG_CARD,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, pct)}%`,
                    height: "100%",
                    background: ACCENT,
                  }}
                />
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontFamily: FONT_BODY,
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  color: TEXT_DIM,
                }}
              >
                {pct}% watched
              </div>
            </div>
          ) : null}

          {item.caption ? (
            <p
              style={{
                margin: "14px 0 0",
                fontFamily: FONT_BODY,
                fontSize: 14,
                lineHeight: 1.62,
                color: TEXT,
                opacity: 0.92,
              }}
            >
              {item.caption}
            </p>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
