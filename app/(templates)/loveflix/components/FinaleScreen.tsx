"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { exportNodeToPng, fileSlug } from "@/lib/exportPng";
import Particles from "./Particles";
import PathRecapCard, { RECAP_H, RECAP_W } from "./PathRecapCard";
import { sfxFinale, sfxUiTap } from "./loveflixAudio";
import { ACCENT, BG, FONT_BODY, FONT_DISPLAY, HAIRLINE, TAP, TEXT, TEXT_DIM, Z } from "./theme";
import { PLAYER, type LoveflixData, type PathEntry } from "./types";

// ─── Screen 5 — the finale ───────────────────────────────────────────────────
//
// The emotional payload of the whole template, and the restraint is the design.
// The text arrives paragraph by paragraph on a slow fade and NOTHING else on
// the screen moves while it does. No drift, no shimmer, no counter, no card
// sliding in underneath. Everything that competes with the message waits until
// the message has landed.
//
// The recap the recipient sees IS `PathRecapCard` — the same subtree that gets
// captured as the .png, at the same fixed 540px, differing only by the uniform
// scale on its wrapper. There is deliberately no second on-screen rendering of
// the list to drift out of sync with the exported one.

export interface FinaleScreenProps {
  data: LoveflixData;
  /** The choices actually taken. This list IS the share card. */
  path: PathEntry[];
  onCredits: () => void;
  reducedMotion: boolean;
}

/**
 * Slower than the narration reveal in the player, on purpose — this is the one
 * screen allowed to take its time. Derived from the frozen constant rather than
 * invented, so retuning `PLAYER` retunes this too.
 */
const PARA_STAGGER_MS = Math.round(PLAYER.lineRevealMs * 1.6);
const PARA_FADE_MS = 1400;

const KEYFRAMES = `
@keyframes lfxFinaleRise {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: none; }
}
@keyframes lfxFinaleSoft {
  from { opacity: 0; }
  to   { opacity: 1; }
}
`;

export default function FinaleScreen({ data, path, onCredits, reducedMotion }: FinaleScreenProps) {
  const paragraphs = useMemo(
    () =>
      data.finaleText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
    [data.finaleText],
  );

  const hasQuestion = data.finaleQuestion.trim().length > 0;

  // Everything after the message waits for the message. With motion off there
  // is nothing to wait for, so it is all present from the first paint — derived
  // rather than set, so no effect has to race the first render.
  const [textSettled, setTextSettled] = useState(false);
  const settled = reducedMotion || textSettled;
  const [answered, setAnswered] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (reducedMotion) return;
    const lastDelay = Math.max(0, paragraphs.length - 1) * PARA_STAGGER_MS;
    const t = window.setTimeout(() => setTextSettled(true), lastDelay + PARA_FADE_MS + PLAYER.choiceBeatMs);
    return () => window.clearTimeout(t);
  }, [paragraphs.length, reducedMotion]);

  const burstSeed = useMemo(
    () => `${data.showTitle}|${data.recipientName}|${path.map((p) => `${p.sceneId}:${p.label}`).join("|")}`,
    [data.showTitle, data.recipientName, path],
  );

  const handleAnswer = useCallback(() => {
    if (answered) return;
    setAnswered(true);
    sfxFinale();
  }, [answered]);

  const handleSave = useCallback(async () => {
    if (saving) return;
    sfxUiTap();
    setSaving(true);
    setSaveMsg("");
    const name = fileSlug(`${data.showTitle} ${data.recipientName} path`, "loveflix-path");
    const result = await exportNodeToPng(cardRef.current, {
      width: RECAP_W,
      height: RECAP_H,
      filename: name,
      backgroundColor: BG,
      // 540×960 at 2× → a 1080×1920 file, which is the size every feed wants.
      pixelRatio: 2,
    });
    setSaveMsg(result.message);
    setSaving(false);
  }, [data.recipientName, data.showTitle, saving]);

  const handleCredits = useCallback(() => {
    sfxUiTap();
    onCredits();
  }, [onCredits]);

  const anim = (name: string, ms: number, delay = 0): React.CSSProperties =>
    reducedMotion ? {} : { animation: `${name} ${ms}ms cubic-bezier(.22,.61,.24,1) ${delay}ms both` };

  return (
    <section
      style={{
        position: "relative",
        minHeight: "100dvh",
        background: BG,
        color: TEXT,
        fontFamily: FONT_BODY,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "clamp(48px, 12vh, 110px) 20px calc(52px + env(safe-area-inset-bottom, 0px))",
        boxSizing: "border-box",
      }}
    >
      <style>{KEYFRAMES}</style>

      {/* ── The message. Nothing else moves while this is arriving. ── */}
      <div style={{ width: "100%", maxWidth: 660 }}>
        {paragraphs.map((para, i) => (
          <p
            key={i}
            style={{
              margin: i === 0 ? 0 : "1.5em 0 0",
              fontFamily: FONT_BODY,
              fontSize: "clamp(19px, 4.4vw, 26px)",
              lineHeight: 1.72,
              letterSpacing: "-0.005em",
              color: TEXT,
              ...anim("lfxFinaleRise", PARA_FADE_MS, i * PARA_STAGGER_MS),
            }}
          >
            {para}
          </p>
        ))}
      </div>

      {/* ── The question. One button, and only once the text has settled. ── */}
      {hasQuestion && settled && (
        <div style={{ width: "100%", maxWidth: 660, marginTop: 46, ...anim("lfxFinaleSoft", 900) }}>
          {!answered ? (
            <button
              type="button"
              onClick={handleAnswer}
              style={{
                minHeight: TAP + 8,
                padding: "14px 30px",
                borderRadius: 4,
                border: `1px solid ${ACCENT}`,
                background: "transparent",
                color: ACCENT,
                fontFamily: FONT_DISPLAY,
                fontWeight: 600,
                fontSize: 20,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {data.finaleQuestion}
            </button>
          ) : (
            <div style={anim("lfxFinaleRise", 700)}>
              <div
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 700,
                  fontSize: "clamp(34px, 9vw, 52px)",
                  lineHeight: 1,
                  letterSpacing: "-0.01em",
                  color: ACCENT,
                  textTransform: "uppercase",
                }}
              >
                yes.
              </div>
              <div style={{ marginTop: 12, fontSize: 16, color: TEXT_DIM, lineHeight: 1.6 }}>
                — {data.senderName}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── The recap. This is the share card, shown at full fidelity. ── */}
      {settled && (
        <div style={{ width: "100%", maxWidth: 660, marginTop: 56, ...anim("lfxFinaleSoft", 900, 260) }}>
          <div style={{ height: 1, background: HAIRLINE, marginBottom: 30 }} />

          <PathRecapCard data={data} path={path} innerRef={cardRef} />

          <p
            style={{
              margin: "20px auto 0",
              maxWidth: 420,
              textAlign: "center",
              fontSize: 13.5,
              lineHeight: 1.6,
              color: TEXT_DIM,
            }}
          >
            Your path, as an image. Nobody else gets this exact one.
          </p>

          {/* ── Controls ── */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 12,
              marginTop: 26,
            }}
          >
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{
                minHeight: TAP + 6,
                padding: "13px 26px",
                borderRadius: 4,
                border: "none",
                background: ACCENT,
                color: BG,
                fontFamily: FONT_DISPLAY,
                fontWeight: 700,
                fontSize: 16,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: saving ? "progress" : "pointer",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "Saving…" : "Save as image"}
            </button>

            <button
              type="button"
              onClick={handleCredits}
              style={{
                minHeight: TAP + 6,
                padding: "13px 26px",
                borderRadius: 4,
                border: `1px solid rgba(255,255,255,0.24)`,
                background: "transparent",
                color: TEXT,
                fontFamily: FONT_DISPLAY,
                fontWeight: 600,
                fontSize: 16,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Roll credits
            </button>
          </div>

          <p
            role="status"
            aria-live="polite"
            style={{
              margin: "14px 0 0",
              minHeight: 18,
              textAlign: "center",
              fontSize: 13,
              color: TEXT_DIM,
            }}
          >
            {saveMsg}
          </p>
        </div>
      )}

      {/* ── Celebration. Decoration only; absent entirely with motion off. ── */}
      {!reducedMotion && (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: Z.interrupt }}>
          <Particles fire={answered} seed={burstSeed} reducedMotion={reducedMotion} />
        </div>
      )}
    </section>
  );
}
