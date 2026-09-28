"use client";

// ─── SCREEN 6 — the scorecard ────────────────────────────────────────────────
//
// A monospace dot-leader table, because a scorecard should look tallied rather
// than designed. A draw owes nothing — there is no "you both lose" joke here,
// the stake simply does not change hands.
//
// The highlight callout is the single most confidently-wrong prediction, and it
// is the funniest line the data can produce. It gets its own block.
//
// This screen is NEVER reached from the solo path. See `SoloScreen`.

import { useCallback, useState } from "react";
import { Download, RefreshCcw } from "lucide-react";
import {
  COPY,
  MONO,
  PALETTE,
  SERIF,
  UI,
  fmtSealDate,
  scoreCapsule,
  type Capsule,
} from "./types";
import { DotRow, Frame, Kicker, Mono, Rule, TapButton } from "./ui";
import { PaperTexture, paperFill, wornEdgeStyle } from "./paper";
import { useCapsuleTheme } from "./themes";
import ShareCard, { SHARE_H, SHARE_W } from "./ShareCard";
import { exportNodeToPng, fileSlug } from "@/lib/exportPng";
import { arpeggio, unlockAudio } from "@/lib/webAudio";

export default function ScorecardScreen({
  capsule,
  onSealAnother,
  onKeepsakes,
  footer,
}: {
  capsule: Capsule;
  onSealAnother: () => void;
  /** Present when there are keepsakes / a letter under the predictions. */
  onKeepsakes?: () => void;
  footer?: React.ReactNode;
}) {
  const score = scoreCapsule(capsule);
  const theme = useCapsuleTheme();

  // A callback ref into state, not a `RefObject`. `react-hooks/refs` forbids
  // reading a ref during render, and the export needs the node in a handler.
  const [cardNode, setCardNode] = useState<HTMLDivElement | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const save = useCallback(async () => {
    unlockAudio();
    // Freeze every animation under the capture subtree first: html-to-image
    // clones computed style, and a clone caught mid-keyframe exports a
    // half-landed stamp.
    setCapturing(true);
    // One frame for the class to apply before the clone is taken.
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    const result = await exportNodeToPng(cardNode, {
      width: SHARE_W,
      height: SHARE_H,
      pixelRatio: 3,
      // A real colour: the canvas cannot resolve a CSS custom property.
      backgroundColor: theme.cp.paper,
      filename: `capsule-${fileSlug(capsule.pair.a.name)}-${fileSlug(capsule.pair.b.name)}`,
    });
    setCapturing(false);
    setSaveMsg(result.message);
    if (result.ok) arpeggio([0, 4, 7], 392, 80);
  }, [cardNode, capsule.pair.a.name, capsule.pair.b.name, theme.cp.paper]);

  const highlight = score.highlight;
  const peek = capsule.photos.slice(0, 3);

  return (
    <Frame seed="scorecard">
      <div className="flex flex-col px-5 pb-10 pt-16">
        <div className="text-center">
          <Kicker colour="var(--lv-a1)">the scorecard</Kicker>
          <h1 style={{ margin: "8px 0 0", fontFamily: UI, fontWeight: 800, fontSize: 38, lineHeight: 1, letterSpacing: "-0.04em", color: PALETTE.ink }}>
            {score.owedBy ? (
              <>
                {score.owedBy.name} <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400 }}>owes</span> the stake.
              </>
            ) : (
              <>
                nobody <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400 }}>owes</span> anything.
              </>
            )}
          </h1>
          <p className="mt-2" style={{ fontFamily: MONO, fontSize: 11, color: PALETTE.inkSoft }}>
            sealed {fmtSealDate(capsule.sealedOn, capsule.timezone)} · opened{" "}
            {fmtSealDate(capsule.openedAt || capsule.opensOn, capsule.timezone)}
          </p>
        </div>

        {/* The two numbers, big. */}
        <div className="mt-7 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          {(["a", "b"] as const).map((side, i) => (
            <div
              key={side}
              className="rounded-[22px] px-3 py-4 text-center"
              style={{
                order: i === 0 ? 0 : 2,
                background: PALETTE.quiet,
                border: `1px solid ${PALETTE.edge}`,
                boxShadow: score.owedBy && score.owedBy.side !== side ? "0 0 0 2px var(--lv-a3)" : undefined,
              }}
            >
              <p style={{ margin: 0, fontFamily: UI, fontWeight: 700, fontSize: 13, color: PALETTE.inkSoft, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {capsule.pair[side].name}
              </p>
              <p style={{ margin: "2px 0 0", fontFamily: UI, fontWeight: 800, fontSize: 44, lineHeight: 1, letterSpacing: "-0.04em", color: PALETTE.ink, fontVariantNumeric: "tabular-nums" }}>
                {score[side]}
              </p>
              <p style={{ margin: "2px 0 0", fontFamily: MONO, fontSize: 10, color: PALETTE.inkSoft }}>points</p>
            </div>
          ))}
          <span style={{ order: 1, fontFamily: SERIF, fontStyle: "italic", fontSize: 22, color: PALETTE.inkSoft }}>vs</span>
        </div>

        {/* The receipt. */}
        <div className="relative mt-5 overflow-hidden px-4 py-4" style={{ ...paperFill("receipt"), ...wornEdgeStyle("receipt"), border: `1px solid ${PALETTE.edge}` }}>
          <PaperTexture seed="receipt-g" opacity={0.06} />
          <div className="relative flex flex-col gap-2.5">
            <DotRow label="disputed" value={String(score.disputed)} />
            <DotRow label="wildcards" value={String(score.wildcards)} />
            <Rule style={{ margin: "4px 0" }} />
            <DotRow label="stake" value={capsule.stake ? "" : "—"} />
            {capsule.stake && (
              <p className="-mt-1" style={{ fontFamily: SERIF, fontSize: 19, color: PALETTE.ink, lineHeight: 1.35 }}>
                {capsule.stake}
              </p>
            )}
            <DotRow label="owed by" value={score.owedBy ? score.owedBy.name : "—"} emphasis />
          </div>
        </div>

        {/* The callout. */}
        {highlight && (
          <div className="mt-5 rounded-[18px] px-4 py-4" style={{ background: PALETTE.amberWash, border: `1px solid ${PALETTE.amber}` }}>
            <Mono size={10} colour={PALETTE.amber}>
              MOST CONFIDENTLY WRONG
            </Mono>
            <p className="mt-2" style={{ fontFamily: SERIF, fontSize: 20, lineHeight: 1.35, color: PALETTE.ink }}>
              {COPY.highlight(highlight.authorName, highlight.label, highlight.prediction.text)}
            </p>
          </div>
        )}

        {/* There is more in the capsule than the predictions. */}
        {onKeepsakes && (
          <button
            type="button"
            onClick={onKeepsakes}
            className="cp-press cp-focus relative mt-7 flex items-center gap-4 overflow-hidden rounded-[24px] px-4 py-4 text-left"
            style={{ background: `linear-gradient(120deg, ${PALETTE.metalLo}, color-mix(in srgb, ${PALETTE.metalLo} 70%, #000))`, color: "#fff", boxShadow: "0 24px 44px -26px rgba(0,0,0,.8)" }}
          >
            <span aria-hidden className="relative block shrink-0" style={{ width: 78, height: 70 }}>
              {peek.map((p, i) => (
                <span
                  key={p.url + i}
                  className="absolute block overflow-hidden"
                  style={{ left: i * 14, top: i % 2 ? 8 : 0, width: 46, height: 54, background: "#fdfcf7", padding: "3px 3px 10px", borderRadius: 2, transform: `rotate(${[-9, 4, 12][i]}deg)`, boxShadow: "0 6px 12px -6px rgba(0,0,0,.6)" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </span>
              ))}
              {peek.length === 0 && <span style={{ fontSize: 40 }}>💌</span>}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block" style={{ fontFamily: UI, fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>there&apos;s more inside</span>
              <span className="block" style={{ fontFamily: MONO, fontSize: 11, opacity: 0.8, marginTop: 2 }}>
                {[capsule.photos.length ? `${capsule.photos.length} keepsakes` : "", capsule.letter.trim() ? "a letter, read last" : ""].filter(Boolean).join(" · ") || "keep digging"}
              </span>
            </span>
            <span aria-hidden style={{ fontSize: 22 }}>↓</span>
          </button>
        )}

        <div className="mt-6 flex flex-col gap-2.5">
          <TapButton full tone="quiet" onClick={save}>
            <Download size={15} /> save the card
          </TapButton>
          {saveMsg && (
            <p className="text-center" style={{ fontFamily: MONO, fontSize: 11, color: PALETTE.inkSoft }}>
              {saveMsg}
            </p>
          )}

          {/* The retention loop. Carries the stake forward. */}
          <TapButton full tone="wax" onClick={onSealAnother}>
            <RefreshCcw size={15} /> {COPY.sealAnother}
          </TapButton>
        </div>

        {footer}
      </div>

      {/* Offscreen but laid out — html-to-image needs real geometry. */}
      <div aria-hidden style={{ position: "fixed", left: -9999, top: 0, pointerEvents: "none" }}>
        <ShareCard capsule={capsule} score={score} attachNode={setCardNode} capturing={capturing} />
      </div>
    </Frame>
  );
}
