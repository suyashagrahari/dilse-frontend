"use client";

// ─── Screen 4 — the artifact ─────────────────────────────────────────────────
//
// A filled-out radio request slip: the paper form you handed the RJ at the
// station gate. Printed rules, a date stamp, and a PLAYED ✓ rubber stamp
// landed slightly crooked.
//
// EXPORT NOTES (all four of these have cost somebody a wrong PNG before):
//   • `exportNodeToPng` awaits `document.fonts.ready` internally — the slip is
//     set in Outfit and Courier Prime and would otherwise capture in Times.
//   • Every animation on the capture subtree is finished or paused first, and
//     a freeze class removes the rest. A card mid-transition exports mid-
//     transition.
//   • Captured at its true layout size, never at the fit-to-viewport scale.
//   • 360 x 520 at pixelRatio 3 gives a 1080 x 1560 file.

import { useCallback, useRef, useState } from "react";
import { Download } from "lucide-react";
import { exportNodeToPng, fileSlug } from "@/lib/exportPng";
import { BODY_FACE, DISPLAY_FACE, PALETTE, TAP_TARGET_PX, BRAND_PLATE, type RadioShow } from "./types";
import { FREEZE_CLASS } from "./radioStyles";
import { headlineDedication, headlineSong } from "./showData";

export const CARD_W = 360;
export const CARD_H = 520;
export const CARD_PIXEL_RATIO = 3;

const PAPER = "#f2e9d2";
const PAPER_EDGE = "#e2d5b6";
const PRINT = "#241a10";
const PRINT_SOFT = "#6b5a45";

/** DD.MM.YYYY, the way a printed form does it. */
const stampDate = (): string => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2" style={{ minHeight: 26 }}>
      <span
        className="shrink-0 text-[8px] font-bold uppercase"
        style={{ fontFamily: BODY_FACE, color: PRINT_SOFT, letterSpacing: "0.14em", width: 84 }}
      >
        {label}
      </span>
      <span
        className="flex-1 text-[12px] leading-snug"
        style={{
          fontFamily: DISPLAY_FACE,
          color: PRINT,
          borderBottom: `1px dotted ${PRINT_SOFT}88`,
          paddingBottom: 3,
          wordBreak: "break-word",
        }}
      >
        {value || " "}
      </span>
    </div>
  );
}

export interface RequestSlipProps {
  show: RadioShow;
  /** Applied immediately before capture. Also the reduced-motion state. */
  still: boolean;
}

/** The card itself. Pure — no state, no timers, nothing that moves. */
export function RequestSlip({ show, still }: RequestSlipProps) {
  const song = headlineSong(show.segments);
  const message = headlineDedication(show.segments);
  const to = [show.recipient.name, show.recipient.city].filter(Boolean).join(", ");
  const from = [show.sender.name, show.sender.city].filter(Boolean).join(", ");

  return (
    <div
      data-ded-slip
      className="relative overflow-hidden"
      style={{
        width: CARD_W,
        height: CARD_H,
        background: PAPER,
        // Paper: faint horizontal fibre plus a warm vignette. No image asset.
        backgroundImage: [
          "repeating-linear-gradient(0deg, rgba(0,0,0,.028) 0 1px, rgba(0,0,0,0) 1px 4px)",
          "radial-gradient(120% 90% at 50% 0%, rgba(255,255,255,.7), rgba(0,0,0,0) 60%)",
        ].join(","),
        boxShadow: "0 18px 40px -18px rgba(0,0,0,.7)",
        animation: still ? undefined : "dedSlipIn 520ms cubic-bezier(.16,1,.3,1) both",
      }}
    >
      {/* Perforated top edge — the stub torn off the pad. */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0"
        style={{
          height: 7,
          background: `radial-gradient(circle at 5px 0, transparent 0 4px, ${PAPER_EDGE} 4.5px) 0 0 / 10px 7px repeat-x`,
        }}
      />

      <div className="relative flex flex-col h-full" style={{ padding: "22px 22px 18px" }}>
        {/* ── Masthead ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className="text-[15px] font-black uppercase leading-none truncate"
              style={{ fontFamily: BODY_FACE, color: PRINT, letterSpacing: "0.06em" }}
            >
              {show.station.name}
            </p>
            <p
              className="text-[9px] uppercase mt-1"
              style={{ fontFamily: BODY_FACE, color: PRINT_SOFT, letterSpacing: "0.28em" }}
            >
              Listener request
            </p>
          </div>
          <div
            className="shrink-0 text-right px-2 py-1"
            style={{ border: `1.5px solid ${PRINT}`, borderRadius: 3 }}
          >
            <p
              className="text-[8px] font-bold uppercase leading-none"
              style={{ fontFamily: BODY_FACE, color: PRINT, letterSpacing: "0.16em" }}
            >
              Request
            </p>
            <p
              className="text-[8px] font-bold uppercase leading-none mt-0.5"
              style={{ fontFamily: BODY_FACE, color: PRINT, letterSpacing: "0.16em" }}
            >
              Slip
            </p>
          </div>
        </div>

        <div style={{ height: 2, background: PRINT, margin: "13px 0 4px" }} />
        <div style={{ height: 1, background: PRINT, opacity: 0.45, marginBottom: 14 }} />

        {/* ── The form ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-2.5">
          <Row label="Station" value={show.station.name} />
          <Row label="Frequency" value={`${show.station.frequency} MHz`} />
          <Row label="Dedicated to" value={to} />
          <Row label="From" value={from} />
          <Row label="Song" value={song ? [song.title, song.artist].filter(Boolean).join(" — ") : ""} />
        </div>

        <div className="mt-3">
          <span
            className="block text-[8px] font-bold uppercase mb-1.5"
            style={{ fontFamily: BODY_FACE, color: PRINT_SOFT, letterSpacing: "0.14em" }}
          >
            Message
          </span>
          <div
            className="text-[12px] leading-[1.65]"
            style={{
              fontFamily: DISPLAY_FACE,
              color: PRINT,
              minHeight: 76,
              // Ruled lines to write between, like the real form.
              backgroundImage: `repeating-linear-gradient(180deg, rgba(0,0,0,0) 0 19px, ${PRINT_SOFT}55 19px 20px)`,
              paddingBottom: 2,
            }}
          >
            {message}
          </div>
        </div>

        <div className="flex-1" />

        {/* ── Footer: date stamp, brand plate, PLAYED stamp ────────────── */}
        <div className="relative">
          <div style={{ height: 1, background: PRINT, opacity: 0.45, marginBottom: 10 }} />
          <div className="flex items-end justify-between gap-2">
            <div>
              <p
                className="text-[8px] font-bold uppercase"
                style={{ fontFamily: BODY_FACE, color: PRINT_SOFT, letterSpacing: "0.16em" }}
              >
                Date
              </p>
              <p className="text-[12px] tabular-nums" style={{ fontFamily: DISPLAY_FACE, color: PRINT }}>
                {stampDate()}
              </p>
              <p
                className="text-[7px] uppercase mt-2"
                style={{ fontFamily: BODY_FACE, color: PRINT_SOFT, letterSpacing: "0.2em" }}
              >
                {BRAND_PLATE}
              </p>
            </div>

            {/* The rubber stamp. -5deg, because a stamp lands crooked. */}
            <div
              aria-label="Played"
              style={{
                transform: "rotate(-5deg)",
                border: `2.5px solid ${PALETTE.red}`,
                borderRadius: 5,
                padding: "5px 11px",
                opacity: 0.86,
                marginBottom: 4,
              }}
            >
              <span
                className="text-[15px] font-black uppercase"
                style={{ fontFamily: BODY_FACE, color: PALETTE.red, letterSpacing: "0.13em" }}
              >
                Played ✓
              </span>
            </div>
          </div>
          <p
            className="text-[7px] uppercase mt-2.5 text-center"
            style={{ fontFamily: BODY_FACE, color: PRINT_SOFT, letterSpacing: "0.26em" }}
          >
            SubhSandesh
          </p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   The download
   ══════════════════════════════════════════════════════════════════════════ */

function nextPaint(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

export interface SlipExportProps {
  show: RadioShow;
  reduced: boolean;
}

export function ExportableSlip({ show, reduced }: SlipExportProps) {
  // A mutable holder, NOT the node in state. React 19's
  // `react-hooks/immutability` rule forbids mutating a DOM node that lives in
  // useState, and the capture has to add a class to it.
  const heldRef = useRef<{ node: HTMLDivElement | null }>({ node: null });
  const attachCard = useCallback(
    (el: HTMLDivElement | null) => {
      heldRef.current.node = el;
    },
    [],
  );
  const [frozen, setFrozen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [scale, setScale] = useState(1);

  /**
   * The wrapper is measured to fit the slip into narrow viewports. The SLIP is
   * captured at its true 360x520; the scale lives on the wrapper only, so it
   * never reaches the canvas.
   */
  const attachWrap = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    const fit = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setScale(Math.min(1, w / CARD_W));
    };
    fit();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(fit) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, []);

  const save = useCallback(async () => {
    const node = heldRef.current.node;
    if (saving || !node) return;
    setSaving(true);
    setStatus("");
    setFrozen(true);
    await nextPaint();

    if (typeof node.getAnimations === "function") {
      for (const a of node.getAnimations({ subtree: true })) {
        try {
          a.finish();
        } catch {
          try {
            a.pause();
          } catch {
            /* the freeze class still covers it */
          }
        }
      }
    }
    node.classList.add(FREEZE_CLASS);

    try {
      const result = await exportNodeToPng(node, {
        width: CARD_W,
        height: CARD_H,
        filename: `dedication-${fileSlug(show.recipient.name || show.station.name)}`,
        backgroundColor: PAPER,
        pixelRatio: CARD_PIXEL_RATIO,
      });
      setStatus(result.message);
    } finally {
      node.classList.remove(FREEZE_CLASS);
      setFrozen(false);
      setSaving(false);
    }
  }, [saving, show.recipient.name, show.station.name]);

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div ref={attachWrap} className="w-full flex justify-center" style={{ height: CARD_H * scale }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}>
          <div ref={attachCard}>
            <RequestSlip show={show} still={frozen || reduced} />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => void save()}
        disabled={saving}
        className="inline-flex items-center justify-center gap-2 rounded-xl font-bold text-[13px] px-5 disabled:opacity-60"
        style={{ minHeight: TAP_TARGET_PX, background: PALETTE.amber, color: PALETTE.ink, fontFamily: BODY_FACE }}
      >
        <Download size={16} />
        {saving ? "saving…" : "save the slip"}
      </button>

      {status && (
        <p className="text-[11px]" style={{ fontFamily: BODY_FACE, color: "rgba(232,220,192,.7)" }} role="status">
          {status}
        </p>
      )}
    </div>
  );
}
