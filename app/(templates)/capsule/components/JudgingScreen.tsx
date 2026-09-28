"use client";

// ─── SCREEN 5 — judging ──────────────────────────────────────────────────────
//
// One card at a time, authors alternating via `revealOrder`. Both people vote
// independently and NEITHER SEES THE OTHER'S TAP until both are in — otherwise
// the second vote is just agreement, and DISPUTED never happens.
//
// DISPUTED is the point. It is not an error state, not a tie to be broken, and
// not a thing to apologise for: it is the funniest and most honest result this
// template can produce, and it gets the warmest colour on the page.

import { useCallback, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  CONFIDENCE_LABELS,
  COPY,
  MONO,
  PALETTE,
  SERIF,
  TAP_TARGET_PX,
  UI,
  fmtSealDate,
  findTwins,
  resolve,
  revealOrder,
  type Capsule,
  type Prediction,
  type Resolution,
  type Side,
  type Verdict,
  TIMING,
} from "./types";
import { InkStamp, PaperTexture, paperFill, wornEdgeStyle } from "./paper";
import { Frame, Mono, Rule, TapButton } from "./ui";
import { useStepTimer } from "./useTick";
import { sfxStamp, sfxPaperSlide, unlockAudio } from "@/lib/webAudio";

/** A twin is one claim written twice, so it is judged once. */
type Step = { key: string; predictions: Prediction[]; twin: boolean };

/**
 * `revealOrder` decides the sequence; twins are then collapsed into a single
 * step at the position of whichever half came first. Nothing is padded and
 * nothing is dropped.
 */
export function buildSteps(predictions: Prediction[]): Step[] {
  const ordered = revealOrder(predictions);
  const twinOf = new Map<string, Prediction>();
  for (const t of findTwins(predictions)) {
    twinOf.set(t.a.id, t.b);
    twinOf.set(t.b.id, t.a);
  }
  const used = new Set<string>();
  const steps: Step[] = [];
  for (const p of ordered) {
    if (used.has(p.id)) continue;
    const mate = twinOf.get(p.id);
    if (mate && !used.has(mate.id)) {
      used.add(p.id);
      used.add(mate.id);
      steps.push({ key: `${p.id}+${mate.id}`, predictions: [p, mate], twin: true });
    } else {
      used.add(p.id);
      steps.push({ key: p.id, predictions: [p], twin: false });
    }
  }
  return steps;
}

const bothIn = (p: Prediction): boolean => Boolean(p.verdictA && p.verdictB);
const stepComplete = (s: Step): boolean => s.predictions.every(bothIn);

/** Where to resume. The first step that is not finished — never card one again. */
export function firstOpenStep(steps: Step[]): number {
  const i = steps.findIndex((s) => !stepComplete(s));
  return i === -1 ? Math.max(0, steps.length - 1) : i;
}

const STAMP_LABEL: Record<Resolution, string> = { right: "RIGHT", wrong: "WRONG", disputed: "DISPUTED" };

function PredictionCard({
  p,
  authorName,
  dateLabel,
  seed,
  showStamp,
}: {
  p: Prediction;
  authorName: string;
  dateLabel: string;
  seed: string;
  showStamp: boolean;
}) {
  const res = p.resolved ?? resolve(p);
  return (
    <div
      className="relative overflow-hidden px-4 py-5"
      style={{
        ...paperFill(seed),
        ...wornEdgeStyle(seed),
        border: `1px solid ${p.isWildcard ? PALETTE.inkSoft : PALETTE.edge}`,
        borderStyle: p.isWildcard ? "dashed" : "solid",
      }}
    >
      <PaperTexture seed={`${seed}-g`} opacity={0.06} />

      <div className="relative flex items-center justify-between">
        <Mono size={10}>{authorName.toUpperCase()}</Mono>
        <Mono size={10}>{dateLabel}</Mono>
      </div>

      {/* 90 chars has to fit without shrinking below 16px. 18px/1.45 in a 300px
          column holds it in four lines with room to spare. */}
      <p
        className="relative mt-3"
        style={{ fontFamily: SERIF, fontSize: 22, lineHeight: 1.32, color: PALETTE.ink, wordBreak: "break-word" }}
      >
        {p.text}
      </p>

      <div className="relative mt-3 flex items-center justify-between">
        <Mono size={11} colour={PALETTE.wax}>
          {CONFIDENCE_LABELS[p.confidence]}
        </Mono>
        {p.isWildcard && <Mono size={10}>WILDCARD</Mono>}
      </div>

      {p.isWildcard && (
        <p className="relative mt-2" style={{ fontFamily: MONO, fontSize: 10, color: PALETTE.inkSoft }}>
          {COPY.wildcard}
        </p>
      )}

      {showStamp && res && (
        <div className="relative mt-4 flex justify-center">
          <span className="capsule-stamp inline-block">
            <InkStamp label={STAMP_LABEL[res]} tone={p.isWildcard ? "wildcard" : res} seed={`${seed}-stamp`} />
          </span>
        </div>
      )}
    </div>
  );
}

function VoteRow({
  name,
  voted,
  onVote,
}: {
  name: string;
  voted: boolean;
  onVote: (v: Verdict) => void;
}) {
  if (voted) {
    // Deliberately says nothing about WHICH way. The other person is standing
    // right there.
    return (
      <div
        className="flex items-center justify-between px-3"
        style={{ minHeight: TAP_TARGET_PX, border: `1px solid ${PALETTE.edge}`, borderRadius: 999, background: PALETTE.quiet }}
      >
        <Mono size={11}>{name.toUpperCase()}</Mono>
        <Mono size={11} colour={PALETTE.inkSoft}>
          recorded
        </Mono>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Mono size={11} style={{ width: 66, flexShrink: 0 }}>
        {name.toUpperCase()}
      </Mono>
      <button
        type="button"
        onClick={() => onVote("right")}
        aria-label={`${name}: right`}
        className="cp-press flex-1 rounded-full"
        style={{
          minHeight: TAP_TARGET_PX,
          fontFamily: UI,
          fontWeight: 800,
          fontSize: 15,
          touchAction: "manipulation",
          color: PALETTE.right,
          background: PALETTE.quiet,
          border: `1.5px solid ${PALETTE.right}`,
        }}
      >
        ✓ right
      </button>
      <button
        type="button"
        onClick={() => onVote("wrong")}
        aria-label={`${name}: wrong`}
        className="cp-press flex-1 rounded-full"
        style={{
          minHeight: TAP_TARGET_PX,
          fontFamily: UI,
          fontWeight: 800,
          fontSize: 15,
          touchAction: "manipulation",
          color: PALETTE.wax,
          background: PALETTE.quiet,
          border: `1.5px solid ${PALETTE.wax}`,
        }}
      >
        ✗ wrong
      </button>
    </div>
  );
}

export default function JudgingScreen({
  capsule,
  onVote,
  onDone,
}: {
  capsule: Capsule;
  /** Applies one side's verdict to every prediction in the step. */
  onVote: (ids: string[], side: Side, verdict: Verdict) => void;
  onDone: () => void;
}) {
  const reduce = useReducedMotion() ?? false;
  const steps = useMemo(() => buildSteps(capsule.predictions), [capsule.predictions]);

  // Resume where they left off. Lazy: computed once, then the user drives it.
  const [step, setStep] = useState(() => firstOpenStep(buildSteps(capsule.predictions)));
  const [beatDone, setBeatDone] = useState(false);

  const current = steps[Math.min(step, steps.length - 1)];
  const complete = current ? stepComplete(current) : false;

  // The 600ms beat. The "next" control does not exist until it has passed, so
  // the sequence cannot be speed-run by mashing the same spot on the screen.
  useStepTimer(complete && !beatDone ? `beat-${current?.key}` : null, reduce ? 120 : TIMING.betweenCardsMs, () =>
    setBeatDone(true),
  );

  const vote = useCallback(
    (side: Side, verdict: Verdict) => {
      if (!current) return;
      unlockAudio();
      sfxStamp();
      onVote(
        current.predictions.map((p) => p.id),
        side,
        verdict,
      );
    },
    [current, onVote],
  );

  const advance = useCallback(() => {
    unlockAudio();
    sfxPaperSlide();
    setBeatDone(false);
    if (step + 1 >= steps.length) {
      onDone();
      return;
    }
    setStep((s) => s + 1);
  }, [step, steps.length, onDone]);

  if (!current) {
    return (
      <Frame seed="judging-empty">
        <div className="flex min-h-[100dvh] items-center justify-center px-6">
          <p style={{ fontFamily: SERIF, fontSize: 18, color: PALETTE.inkSoft }}>nothing was written.</p>
        </div>
      </Frame>
    );
  }

  const dateLabel = fmtSealDate(capsule.sealedOn, capsule.timezone);
  const votedA = current.predictions.every((p) => Boolean(p.verdictA));
  const votedB = current.predictions.every((p) => Boolean(p.verdictB));
  const res = complete ? (current.predictions[0].resolved ?? resolve(current.predictions[0])) : undefined;

  return (
    <Frame seed="judging">
      <div className="flex min-h-[100dvh] flex-col px-5 pb-8 pt-6">
        <div className="flex items-center justify-between">
          <Mono size={10}>WRITTEN A YEAR AGO</Mono>
          <Mono size={10}>
            {String(step + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
          </Mono>
        </div>

        <div className="mt-5 flex-1">
          {current.twin && (
            <p className="mb-2.5 text-center capsule-card-in" style={{ fontFamily: SERIF, fontSize: 17, color: PALETTE.amber, fontStyle: "italic" }}>
              {COPY.bothSaid}
            </p>
          )}

          <div key={current.key} className="capsule-card-in flex flex-col gap-3">
            {current.predictions.map((p) => (
              <PredictionCard
                key={p.id}
                p={p}
                authorName={capsule.pair[p.author].name}
                dateLabel={dateLabel}
                seed={`card-${p.id}`}
                showStamp={complete}
              />
            ))}
          </div>

          {/* Disputed, treated as the result it is. Amber, warm, and funny — no
              "please agree", no re-vote, no tie-break. */}
          {complete && res === "disputed" && (
            <p
              className="capsule-card-in mt-4 px-4 py-3 text-center"
              style={{
                fontFamily: SERIF,
                fontSize: 17,
                color: PALETTE.amber,
                background: PALETTE.amberWash,
                border: `1px solid ${PALETTE.amber}`,
                borderRadius: 16,
              }}
            >
              {COPY.disputed}
            </p>
          )}
        </div>

        <div className="mt-6">
          <Rule style={{ marginBottom: 14 }} />
          {!complete ? (
            <div className="flex flex-col gap-2.5">
              <VoteRow name={capsule.pair.a.name} voted={votedA} onVote={(v) => vote("a", v)} />
              <VoteRow name={capsule.pair.b.name} voted={votedB} onVote={(v) => vote("b", v)} />
              <p className="mt-1 text-center" style={{ fontFamily: MONO, fontSize: 10, color: PALETTE.inkFaint }}>
                {votedA || votedB ? "waiting on the other verdict" : "one at a time — nobody sees the other's tap"}
              </p>
            </div>
          ) : beatDone ? (
            <TapButton full tone="wax" onClick={advance}>
              {step + 1 >= steps.length ? "the scorecard" : "next"}
            </TapButton>
          ) : (
            <p className="text-center" style={{ fontFamily: MONO, fontSize: 11, color: PALETTE.inkSoft, minHeight: TAP_TARGET_PX, lineHeight: `${TAP_TARGET_PX}px` }}>
              both verdicts in
            </p>
          )}
        </div>
      </div>
    </Frame>
  );
}
