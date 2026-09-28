"use client";

// ─── Screen 3 — the scorecard ────────────────────────────────────────────────
//
// Everything on it is computed from HER swipes by `computeScorecard`, not from
// the sender's truths. It is 9:16 and sized to be screenshotted (and saved as a
// PNG — the GIF sits OUTSIDE the captured node, since an animated image or a
// <video> serialises badly in html-to-image; see lib/exportPng.ts).

import { useCallback, useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { arpeggio } from "@/lib/webAudio";
import { exportNodeToPng, fileSlug } from "@/lib/exportPng";
import { templateMedia } from "@/lib/templateMedia";

import { V } from "../../_love/theme";
import { CHOICE_EMOJI, FLAG_VAR, type Scorecard as ScorecardData, type SwipeChoice } from "./types";
import { FlagSticker } from "./bits";
import { GROTESK, ITALIC, MONO } from "./flagsTheme";

/** Logical size of the artifact, before any fit-to-viewport scale. */
const CARD_W = 360;
const CARD_H = 548;
const RING_R = 64;
const RING_C = 2 * Math.PI * RING_R;
const COUNT_MS = 1300;
/** Height reserved above the artifact for the GIF. */
const CLIP_H = 92;

interface ScorecardScreenProps {
  score: ScorecardData;
  recipientName: string;
  senderName: string;
  reduced: boolean;
  /** The first GIF the sender picked; falls back to the template's own clip. */
  gif?: string;
  /** Background colour for the PNG (the theme's solid base). */
  paperColor: string;
  onNext: () => void;
  onExport?: (ok: boolean, message: string) => void;
}

function Tally({ choice, label, value }: { choice: SwipeChoice; label: string; value: number }) {
  return (
    <div style={{ flex: 1, borderRadius: 18, padding: "10px 6px 9px", textAlign: "center", background: `color-mix(in srgb, ${FLAG_VAR[choice]} 14%, transparent)`, border: `1.5px solid color-mix(in srgb, ${FLAG_VAR[choice]} 55%, transparent)` }}>
      <div style={{ fontSize: 18, lineHeight: 1 }} aria-hidden>
        {CHOICE_EMOJI[choice]}
      </div>
      <div style={{ fontFamily: GROTESK, fontWeight: 800, fontSize: 24, lineHeight: 1.1, color: V.paperInk, marginTop: 4 }}>{value}</div>
      <div style={{ fontFamily: GROTESK, fontWeight: 800, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: V.paperSoft }}>{label}</div>
    </div>
  );
}

export default function ScorecardScreen({ score, recipientName, senderName, reduced, gif, paperColor, onNext, onExport }: ScorecardScreenProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const fitRef = useRef<HTMLDivElement>(null);
  const [counted, setCounted] = useState(0);
  const [scale, setScale] = useState(1);
  const shown = reduced ? score.compatibility : counted;
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / COUNT_MS);
      const eased = 1 - Math.pow(1 - p, 4);
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
      const availW = el.clientWidth - 8;
      const availH = window.innerHeight - 60 - 136;
      setScale(Math.max(0.8, Math.min(1, availW / CARD_W, availH / (CARD_H + CLIP_H))));
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (fitRef.current?.parentElement) ro.observe(fitRef.current.parentElement);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    const res = await exportNodeToPng(cardRef.current, {
      width: CARD_W,
      height: CARD_H,
      filename: `${fileSlug(recipientName, "verdict")}-verdict`,
      backgroundColor: paperColor,
    });
    setSaving(false);
    onExport?.(res.ok, res.message);
  }, [recipientName, paperColor, onExport]);

  const offset = RING_C * (1 - Math.min(shown, 100) / 100);
  const S = RING_R * 2 + 24;

  return (
    <div style={{ position: "relative", zIndex: 1, flex: 1, width: "100%", minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", padding: "calc(env(safe-area-inset-top, 0px) + 64px) 16px calc(env(safe-area-inset-bottom, 0px) + 20px)" }}>
      <div style={{ width: "100%", maxWidth: CARD_W, display: "flex", justifyContent: "center" }}>
        <div ref={fitRef} style={{ width: CARD_W * scale, height: (CARD_H + CLIP_H) * scale, position: "relative", flex: "0 0 auto" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: CARD_W, transform: `scale(${scale})`, transformOrigin: "top left" }}>
            {/* OUTSIDE the captured node, on purpose */}
            <div style={{ height: CLIP_H, display: "flex", justifyContent: "center", alignItems: "flex-end", position: "relative", zIndex: 2 }}>
              {gif ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={gif} alt="" style={{ height: CLIP_H + 6, width: CLIP_H + 6, objectFit: "cover", borderRadius: 24, transform: "rotate(-5deg) translateY(26px)", border: `4px solid ${V.paper}`, boxShadow: `0 14px 30px -12px ${V.shadow}` }} />
              ) : (
                !reduced && (
                  <video src={templateMedia("flags", "verdict.webm")} autoPlay loop muted playsInline aria-hidden="true" style={{ height: CLIP_H - 4, width: "auto", objectFit: "contain", pointerEvents: "none" }} />
                )
              )}
            </div>

            {/* ── the artifact ─────────────────────────────────────── */}
            <div
              ref={cardRef}
              style={{
                width: CARD_W,
                height: CARD_H,
                background: V.paper,
                color: V.paperInk,
                borderRadius: 32,
                padding: "34px 24px 20px",
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
                position: "relative",
                overflow: "hidden",
                boxShadow: `0 30px 70px -30px ${V.shadow}, 0 0 0 1px ${V.edge}`,
              }}
            >
              <div aria-hidden style={{ position: "absolute", inset: 0, background: `radial-gradient(70% 40% at 50% 0%, color-mix(in srgb, ${V.a2} 18%, transparent), transparent 70%)`, pointerEvents: "none" }} />

              <div style={{ position: "relative", textAlign: "center" }}>
                <p style={{ margin: 0, fontFamily: GROTESK, fontWeight: 800, fontSize: 12, letterSpacing: "0.26em", textTransform: "uppercase", color: V.a1 }}>the verdict is in</p>
                <p style={{ margin: "6px 0 0", fontFamily: ITALIC, fontStyle: "italic", fontSize: 26, lineHeight: 1.05 }}>
                  {recipientName.toLowerCase()} on {senderName.toLowerCase()}
                </p>
              </div>

              {/* ring */}
              <div style={{ position: "relative", display: "flex", justifyContent: "center", padding: "16px 0 6px" }}>
                <div style={{ position: "relative", width: S, height: S }}>
                  <svg width={S} height={S} style={{ display: "block" }} aria-hidden>
                    <defs>
                      <linearGradient id="fl-ring" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" style={{ stopColor: "var(--fl-red)" }} />
                        <stop offset="50%" style={{ stopColor: "var(--fl-beige)" }} />
                        <stop offset="100%" style={{ stopColor: "var(--fl-green)" }} />
                      </linearGradient>
                    </defs>
                    <circle cx={S / 2} cy={S / 2} r={RING_R} fill="none" style={{ stroke: V.edge }} strokeWidth={10} />
                    <circle cx={S / 2} cy={S / 2} r={RING_R} fill="none" stroke="url(#fl-ring)" strokeWidth={10} strokeLinecap="round" strokeDasharray={RING_C} strokeDashoffset={offset} transform={`rotate(-90 ${S / 2} ${S / 2})`} />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: GROTESK, fontSize: 36, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}>{shown.toFixed(1)}%</span>
                    <span style={{ fontFamily: GROTESK, fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", color: V.paperSoft, marginTop: 4 }}>COMPATIBLE</span>
                  </div>
                  <FlagSticker color="var(--fl-green)" rotate={12} size={11} style={{ position: "absolute", right: -30, top: 10 }}>
                    it&apos;s giving 💚
                  </FlagSticker>
                </div>
              </div>

              <div style={{ position: "relative", display: "flex", gap: 8, marginTop: 8 }}>
                <Tally choice="red" label="red" value={score.redCalled} />
                <Tally choice="complicated" label="beige" value={score.complicatedCalled} />
                <Tally choice="green" label="green" value={score.greenCalled} />
              </div>

              <p style={{ position: "relative", margin: "18px 2px 0", fontFamily: GROTESK, fontWeight: 800, fontSize: 20, lineHeight: 1.3, letterSpacing: "-0.01em" }}>{score.verdict}</p>

              <div style={{ position: "relative", marginTop: 12, borderRadius: 16, padding: "11px 14px", background: `color-mix(in srgb, ${V.a1} 10%, transparent)`, border: `1px dashed color-mix(in srgb, ${V.a1} 50%, transparent)` }}>
                <p style={{ margin: 0, fontFamily: ITALIC, fontStyle: "italic", fontSize: 18, lineHeight: 1.22 }}>
                  {score.callout ?? `you agreed with every single one. ${score.compatibility.toFixed(1)}% and no notes.`}
                </p>
              </div>

              <div style={{ flex: 1 }} />

              <p style={{ position: "relative", margin: 0, textAlign: "center", fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.16em", color: V.paperSoft, textTransform: "uppercase" }}>
                issued by the ministry of red flags · subhsandesh
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* controls, outside the artifact */}
      <div style={{ width: "100%", maxWidth: CARD_W, display: "grid", gap: 10, marginTop: 18 }}>
        <button
          type="button"
          onClick={onNext}
          className="lv-cta lv-focus"
          style={{ width: "100%", minHeight: 58, borderRadius: 999, border: "none", background: V.grad, color: "#fff", fontFamily: GROTESK, fontWeight: 800, fontSize: 17, cursor: "pointer", boxShadow: `0 16px 34px -14px color-mix(in srgb, ${V.a1} 80%, transparent)` }}
        >
          did we match? 💚
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="lv-ghost lv-focus"
          style={{ width: "100%", minHeight: 48, borderRadius: 999, border: `1.5px solid ${V.edge}`, background: "transparent", color: V.ink, fontFamily: GROTESK, fontWeight: 700, fontSize: 15, cursor: saving ? "default" : "pointer", opacity: saving ? 0.6 : 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <Download size={16} /> {saving ? "saving…" : "save the verdict"}
        </button>
      </div>
    </div>
  );
}
