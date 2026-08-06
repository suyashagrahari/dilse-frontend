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
  fmtSealDate,
  scoreCapsule,
  type Capsule,
} from "./types";
import { DotRow, Frame, Mono, Rule, TapButton } from "./ui";
import ShareCard, { SHARE_H, SHARE_W } from "./ShareCard";
import { exportNodeToPng, fileSlug } from "@/lib/exportPng";
import { arpeggio, unlockAudio } from "@/lib/webAudio";

export default function ScorecardScreen({
  capsule,
  onSealAnother,
  footer,
}: {
  capsule: Capsule;
  onSealAnother: () => void;
  footer?: React.ReactNode;
}) {
  const score = scoreCapsule(capsule);

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
      backgroundColor: PALETTE.paper,
      filename: `capsule-${fileSlug(capsule.pair.a.name)}-${fileSlug(capsule.pair.b.name)}`,
    });
    setCapturing(false);
    setSaveMsg(result.message);
    if (result.ok) arpeggio([0, 4, 7], 392, 80);
  }, [cardNode, capsule.pair.a.name, capsule.pair.b.name]);

  const highlight = score.highlight;

  return (
    <Frame seed="scorecard">
      <div className="flex flex-col px-5 pb-10 pt-7">
        <div className="text-center">
          <Mono size={11}>THE SCORECARD</Mono>
          <p className="mt-1" style={{ fontFamily: MONO, fontSize: 11, color: PALETTE.inkSoft }}>
            sealed {fmtSealDate(capsule.sealedOn, capsule.timezone)} · opened{" "}
            {fmtSealDate(capsule.openedAt || capsule.opensOn, capsule.timezone)}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2.5">
          <DotRow label={capsule.pair.a.name.toLowerCase()} value={`${score.a} points`} emphasis />
          <DotRow label={capsule.pair.b.name.toLowerCase()} value={`${score.b} points`} emphasis />
          <Rule style={{ margin: "6px 0" }} />
          <DotRow label="disputed" value={String(score.disputed)} />
          <DotRow label="wildcards" value={String(score.wildcards)} />
          <Rule style={{ margin: "6px 0" }} />
          <DotRow label="stake" value={capsule.stake ? "" : "—"} />
          {capsule.stake && (
            <p className="-mt-1" style={{ fontFamily: SERIF, fontSize: 16, color: PALETTE.ink, lineHeight: 1.4 }}>
              {capsule.stake}
            </p>
          )}
          <DotRow label="owed by" value={score.owedBy ? score.owedBy.name : "—"} emphasis />
          {!score.owedBy && (
            <p style={{ fontFamily: MONO, fontSize: 11, color: PALETTE.inkSoft }}>nobody owes anything.</p>
          )}
        </div>

        {/* The callout. */}
        {highlight && (
          <div
            className="mt-7 px-4 py-4"
            style={{ background: PALETTE.amberWash, border: `1px solid ${PALETTE.amber}`, borderRadius: 6 }}
          >
            <Mono size={10} colour={PALETTE.amber}>
              MOST CONFIDENTLY WRONG
            </Mono>
            <p className="mt-2" style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.45, color: PALETTE.ink }}>
              {COPY.highlight(highlight.authorName, highlight.label, highlight.prediction.text)}
            </p>
          </div>
        )}

        <div className="mt-7 flex flex-col gap-2.5">
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
