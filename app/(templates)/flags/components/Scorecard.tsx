"use client";

// ─── Screen 3 — the scorecard ────────────────────────────────────────────────
//
// Everything on it is computed from HER swipes by `computeScorecard`, not from
// the sender's truths. It is 9:16 and sized to be screenshotted.
//
// The looping clip lives OUTSIDE the captured node. A <video> serialises as a
// blank box in html-to-image, so anything animated has to sit next to the
// artifact rather than inside it (see the notes in lib/exportPng.ts).

import { useCallback, useEffect, useRef, useState } from "react";
import { arpeggio } from "@/lib/webAudio";
import { exportNodeToPng, fileSlug } from "@/lib/exportPng";
import { templateMedia } from "@/lib/templateMedia";

import { CHOICE_COLOR, type Scorecard as ScorecardData } from "./types";
import { HAIRLINE, INK, INK_FAINT, INK_SOFT, MONO, PAPER, SERIF, STENCIL } from "./flagsTheme";
import { useUpSwipe } from "./useSwipeGesture";

/** Logical size of the artifact, before any fit-to-viewport scale. */
const CARD_W = 360;
const CARD_H = 640;
const RING_R = 62;
const RING_C = 2 * Math.PI * RING_R;
const COUNT_MS = 1200;
/** Height reserved above the artifact for the looping clip. */
const CLIP_H = 116;

interface ScorecardScreenProps {
  score: ScorecardData;
  recipientName: string;
  senderName: string;
  reduced: boolean;
  onNext: () => void;
  onExport?: (ok: boolean, message: string) => void;
}

function TallyRow({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
      <span
        style={{
          fontFamily: STENCIL,
          fontWeight: 500,
          fontSize: 12.5,
          letterSpacing: "0.16em",
          color: INK,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <span
        aria-hidden="true"
        style={{ flex: 1, borderBottom: `1px dotted ${INK_FAINT}`, transform: "translateY(-3px)" }}
      />
      <span style={{ fontFamily: MONO, fontSize: 15, color: INK, fontWeight: 700 }}>{value}</span>
    </div>
  );
}

export default function ScorecardScreen({
  score,
  recipientName,
  senderName,
  reduced,
  onNext,
  onExport,
}: ScorecardScreenProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<HTMLDivElement>(null);
  const [counted, setCounted] = useState(0);
  const [scale, setScale] = useState(1);
  // Reduced motion gets the final number immediately rather than a count-up.
  const shown = reduced ? score.compatibility : counted;
  const [saving, setSaving] = useState(false);
  const nextHandlers = useUpSwipe(onNext);

  // Ring and number move together — a ring that fills faster than the count
  // reads as two unrelated animations.
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / COUNT_MS);
      const eased = 1 - Math.pow(1 - p, 4); // hard deceleration
      setCounted(score.compatibility * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score.compatibility, reduced]);

  useEffect(() => {
    arpeggio([0, 4, 7, 11], 392, 96);
  }, []);

  // Scale, never reflow — the artifact is pixel-identical at every viewport.
  useEffect(() => {
    const fit = () => {
      const el = fitRef.current?.parentElement;
      if (!el) return;
      const availW = el.clientWidth - 24;
      const availH = el.clientHeight - 12;
      const total = CARD_H + (reduced ? 0 : CLIP_H);
      setScale(Math.min(1, availW / CARD_W, availH / total));
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (fitRef.current?.parentElement) ro.observe(fitRef.current.parentElement);
    return () => ro.disconnect();
  }, [reduced]);

  const save = useCallback(async () => {
    setSaving(true);
    const res = await exportNodeToPng(cardRef.current, {
      width: CARD_W,
      height: CARD_H,
      filename: `${fileSlug(recipientName, "verdict")}-verdict`,
      backgroundColor: PAPER,
    });
    setSaving(false);
    onExport?.(res.ok, res.message);
  }, [recipientName, onExport]);

  const offset = RING_C * (1 - Math.min(shown, 100) / 100);
  const totalH = CARD_H + (reduced ? 0 : CLIP_H);

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ flex: 1, minHeight: 0, width: "100%", display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: 6 }}>
        {/* Outer box carries the SCALED size so the controls below stay in flow;
            the inner box stays at true layout size for the PNG capture. */}
        <div
          ref={fitRef}
          style={{ width: CARD_W * scale, height: totalH * scale, position: "relative", flex: "0 0 auto" }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: CARD_W,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
          {/* OUTSIDE the captured node, on purpose */}
          {!reduced && (
            <div style={{ height: CLIP_H, display: "flex", justifyContent: "center", alignItems: "flex-end" }}>
              <video
                src={templateMedia("flags", "verdict.webm")}
                autoPlay
                loop
                muted
                playsInline
                aria-hidden="true"
                style={{ height: CLIP_H - 6, width: "auto", objectFit: "contain", pointerEvents: "none" }}
              />
            </div>
          )}

          {/* ── the artifact ─────────────────────────────────────────── */}
          <div
            ref={cardRef}
            style={{
              width: CARD_W,
              height: CARD_H,
              background: PAPER,
              border: `1px solid ${INK}`,
              borderRadius: 2,
              padding: "30px 28px 24px",
              display: "flex",
              flexDirection: "column",
              boxSizing: "border-box",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  margin: 0,
                  fontFamily: STENCIL,
                  fontWeight: 600,
                  fontSize: 13,
                  letterSpacing: "0.32em",
                  color: INK,
                }}
              >
                THE VERDICT
              </p>
              <p
                style={{
                  margin: "6px 0 0",
                  fontFamily: MONO,
                  fontSize: 10.5,
                  letterSpacing: "0.14em",
                  color: INK_SOFT,
                }}
              >
                {recipientName.toLowerCase()} on {senderName.toLowerCase()}
              </p>
            </div>

            <div style={{ height: 1, background: HAIRLINE, margin: "18px 0 6px" }} />

            {/* compatibility ring */}
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
              <div style={{ position: "relative", width: RING_R * 2 + 20, height: RING_R * 2 + 20 }}>
                <svg width={RING_R * 2 + 20} height={RING_R * 2 + 20} style={{ display: "block" }}>
                  <circle
                    cx={RING_R + 10}
                    cy={RING_R + 10}
                    r={RING_R}
                    fill="none"
                    stroke={INK_FAINT}
                    strokeWidth={2}
                  />
                  <circle
                    cx={RING_R + 10}
                    cy={RING_R + 10}
                    r={RING_R}
                    fill="none"
                    stroke={CHOICE_COLOR.green}
                    strokeWidth={5}
                    strokeLinecap="butt"
                    strokeDasharray={RING_C}
                    strokeDashoffset={offset}
                    transform={`rotate(-90 ${RING_R + 10} ${RING_R + 10})`}
                  />
                </svg>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontFamily: MONO, fontSize: 28, fontWeight: 700, color: INK, letterSpacing: "-0.02em" }}>
                    {shown.toFixed(1)}%
                  </span>
                  <span
                    style={{
                      fontFamily: STENCIL,
                      fontSize: 9.5,
                      letterSpacing: "0.22em",
                      color: INK_SOFT,
                      marginTop: 2,
                    }}
                  >
                    COMPATIBLE
                  </span>
                </div>
              </div>
            </div>

            {/* tally */}
            <div style={{ display: "flex", flexDirection: "column", gap: 11, padding: "14px 2px 0" }}>
              <TallyRow label="RED FLAGS CALLED" value={score.redCalled} />
              <TallyRow label="GREEN FLAGS CALLED" value={score.greenCalled} />
              <TallyRow label="COMPLICATED" value={score.complicatedCalled} />
            </div>

            <div style={{ height: 1, background: HAIRLINE, margin: "20px 0 0" }} />

            {/* verdict, verbatim */}
            <p
              style={{
                margin: "18px 0 0",
                fontFamily: SERIF,
                fontSize: 19,
                lineHeight: 1.4,
                color: INK,
              }}
            >
              {score.verdict}
            </p>

            {/* the callout, or the number when she agreed with everything */}
            <div
              style={{
                marginTop: 16,
                border: `1px solid ${HAIRLINE}`,
                borderLeft: `3px solid ${score.callout ? CHOICE_COLOR.complicated : CHOICE_COLOR.green}`,
                padding: "12px 13px",
              }}
            >
              {score.callout ? (
                <p style={{ margin: 0, fontFamily: SERIF, fontStyle: "italic", fontSize: 15, lineHeight: 1.42, color: INK }}>
                  {score.callout}
                </p>
              ) : (
                <p style={{ margin: 0, fontFamily: SERIF, fontStyle: "italic", fontSize: 15, lineHeight: 1.42, color: INK }}>
                  you agreed with every single one. {score.compatibility.toFixed(1)}% and no notes.
                </p>
              )}
            </div>

            <div style={{ flex: 1 }} />

            <p
              style={{
                margin: 0,
                textAlign: "center",
                fontFamily: MONO,
                fontSize: 9,
                letterSpacing: "0.18em",
                color: INK_SOFT,
                textTransform: "uppercase",
              }}
            >
              issued by the registrar of hearts
            </p>
          </div>
          </div>
        </div>
      </div>

      {/* controls, outside the artifact */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          padding: "10px 12px calc(env(safe-area-inset-bottom, 0px) + 10px)",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={save}
          disabled={saving}
          style={{
            minHeight: 44,
            padding: "0 18px",
            background: INK,
            color: PAPER,
            border: `1px solid ${INK}`,
            borderRadius: 2,
            fontFamily: STENCIL,
            fontWeight: 500,
            fontSize: 12,
            letterSpacing: "0.2em",
            cursor: saving ? "default" : "pointer",
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? "SAVING…" : "SAVE THE VERDICT"}
        </button>
        <button
          type="button"
          {...nextHandlers}
          style={{
            minHeight: 44,
            padding: "0 16px",
            background: "transparent",
            color: INK_SOFT,
            border: `1px solid ${HAIRLINE}`,
            borderRadius: 2,
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          swipe up for one more
        </button>
      </div>
    </div>
  );
}
