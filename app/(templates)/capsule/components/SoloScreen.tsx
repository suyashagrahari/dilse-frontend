"use client";

// ─── The quiet paths ─────────────────────────────────────────────────────────
//
// A capsule sealed a year ago may be opened by one person, or by people who are
// no longer together. Both of those are ordinary outcomes, not failure modes.
//
// SOLO deliberately omits: the scorecard, the score, the stake, "owed by",
// "right", "wrong", "disputed", the share card, and `sealAnother`. Every one of
// those is a two-player frame, and offering any of them to someone reading this
// alone would be the cruellest thing this product could do. What remains is the
// context snapshot and the predictions, quietly, in the order they were written.
//
// DECLINED closes it without deleting anything. There is no confirmation step
// asking them to reconsider.

import { useCallback, useState } from "react";
import {
  CONFIDENCE_LABELS,
  COPY,
  MONO,
  PALETTE,
  SERIF,
  fmtSealDate,
  revealOrder,
  type Capsule,
  type Side,
} from "./types";
import { PaperTexture, paperFill, wornEdgeStyle } from "./paper";
import { Frame, Mono, Rule, TapButton } from "./ui";

export function SoloScreen({
  capsule,
  onDecline,
  footer,
}: {
  capsule: Capsule;
  onDecline: () => void;
  footer?: React.ReactNode;
}) {
  const ordered = revealOrder(capsule.predictions);
  const dateLabel = fmtSealDate(capsule.sealedOn, capsule.timezone);
  const [shown, setShown] = useState(false);

  const reveal = useCallback(() => setShown(true), []);

  return (
    <Frame seed="solo">
      <div className="flex flex-col px-5 pb-12 pt-8">
        <Mono size={10}>WRITTEN {dateLabel.toUpperCase()}</Mono>

        {/* The context, first and unhurried — the same beat the two-person path
            gets, because it is the part that matters most on this one. */}
        <div className="mt-5 flex flex-col gap-5">
          {(["a", "b"] as Side[]).map((s) => {
            const ctx = capsule.context[s];
            if (!ctx.city && !ctx.oneLineAboutNow) return null;
            return (
              <div key={s}>
                <Mono size={10}>{(capsule.pair[s].name || "").toUpperCase()}</Mono>
                <p className="mt-1.5" style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.5, color: PALETTE.ink }}>
                  {COPY.contextLead(ctx.city || "—", ctx.oneLineAboutNow || "—")}
                </p>
              </div>
            );
          })}
        </div>

        <Rule style={{ margin: "26px 0 18px" }} />

        {!shown ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <p className="text-center" style={{ fontFamily: SERIF, fontSize: 17, color: PALETTE.inkSoft, lineHeight: 1.5 }}>
              the predictions are below whenever you want them.
            </p>
            <TapButton full tone="quiet" onClick={reveal}>
              read them
            </TapButton>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {ordered.map((p) => (
              <div
                key={p.id}
                className="relative overflow-hidden px-4 py-4"
                style={{
                  ...paperFill(`solo-${p.id}`),
                  ...wornEdgeStyle(`solo-${p.id}`),
                  border: `1px solid ${PALETTE.edge}`,
                }}
              >
                <PaperTexture seed={`solo-g-${p.id}`} opacity={0.05} />
                <div className="relative flex items-center justify-between">
                  <Mono size={10}>{(capsule.pair[p.author].name || "").toUpperCase()}</Mono>
                  <Mono size={10}>{CONFIDENCE_LABELS[p.confidence]}</Mono>
                </div>
                <p
                  className="relative mt-2.5"
                  style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.45, color: PALETTE.ink, wordBreak: "break-word" }}
                >
                  {p.text}
                </p>
                {p.isWildcard && (
                  <p className="relative mt-2" style={{ fontFamily: MONO, fontSize: 10, color: PALETTE.inkSoft }}>
                    {COPY.wildcard}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-9 flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={onDecline}
            style={{ minHeight: 48, fontFamily: MONO, fontSize: 12, color: PALETTE.inkSoft, touchAction: "manipulation" }}
          >
            close this
          </button>
        </div>

        {footer}
      </div>
    </Frame>
  );
}

export function DeclinedScreen({ footer }: { footer?: React.ReactNode }) {
  return (
    <Frame seed="declined">
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-8 text-center">
        <p style={{ fontFamily: SERIF, fontSize: 21, color: PALETTE.ink, lineHeight: 1.45 }}>{COPY.declined}</p>
        <p style={{ fontFamily: MONO, fontSize: 11, color: PALETTE.inkSoft, letterSpacing: 1 }}>kept, unopened</p>
        {footer}
      </div>
    </Frame>
  );
}
