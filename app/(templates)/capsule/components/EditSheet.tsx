"use client";

// ─── SCREEN 1 — writing (and the amend window) ───────────────────────────────
//
// Each partner writes alone. The other side of this sheet shows a COUNT and
// nothing else — "Arjun has written 4 predictions." — because the moment one
// person can read the other's guesses, the year-long wait is worth nothing.
//
// The draft lives in component state. Not localStorage, not sessionStorage:
// a capsule's contents must not sit somewhere another tab, another user of the
// same phone, or a stray extension can read them a year early.
//
// THREE MODES, and the third one is the product:
//
//   write  — nothing sealed yet. Everything editable.
//   amend  — sealed, and `canAmend` is still true. This seat's own predictions
//            and the shared stake are editable. They lock together, because a
//            stake quietly changed a year later defeats the seal exactly as
//            much as a prediction quietly changed does.
//   locked — `canAmend` is false. Predictions are not editable AND NOT SHOWN,
//            not even to their own author: "not by the partner, not by the
//            author". The stake stays visible because the waiting screen shows
//            it anyway, but it is read-only. Names stay editable forever —
//            fixing a typo in a name in 2027 is not an integrity question.

import { memo, useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X, Plus, Trash2, Shuffle, Lock } from "lucide-react";
import {
  CONFIDENCE_LABELS,
  COPY,
  LIMITS,
  MONO,
  PALETTE,
  SERIF,
  TAP_TARGET_PX,
  UI,
  canSeal,
  fmtSealDate,
  type Confidence,
  type Prediction,
} from "./types";
import {
  countFor,
  localDateToIso,
  newPrediction,
  other,
  promptTrio,
  seatName,
  setWildcard,
  writtenLine,
  type CapsuleDraft,
  type Seat,
} from "./capsuleData";
import { Mono, Rule, TapButton } from "./ui";
import { sfxKeyClick, sfxPaperSlide, unlockAudio } from "@/lib/webAudio";

/** Which of the three sheets this is. See the header comment. */
export type SheetMode = "write" | "amend" | "locked";

const INPUT: React.CSSProperties = {
  fontSize: 16, // anything smaller and iOS zooms the whole page on focus
  fontFamily: SERIF,
  color: PALETTE.ink,
  background: "rgba(255,255,255,.7)",
  border: `1px solid ${PALETTE.edge}`,
  borderRadius: 5,
  padding: "10px 12px",
  width: "100%",
  outline: "none",
};

const LABEL: React.CSSProperties = { fontFamily: MONO, fontSize: 10, letterSpacing: 1.4, color: PALETTE.inkSoft };

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <p style={LABEL}>{title.toUpperCase()}</p>
      {hint && (
        <p className="mt-1" style={{ fontFamily: UI, fontSize: 12, color: PALETTE.inkSoft, lineHeight: 1.5 }}>
          {hint}
        </p>
      )}
      <div className="mt-2">{children}</div>
    </section>
  );
}

/**
 * Five steps, labelled in WORDS. The writer never sees 1..5 — a number invites
 * arithmetic about the scoring, and the point is to make them commit to a
 * feeling. The weight is the label's business, not theirs.
 */
function ConfidencePicker({
  value,
  onChange,
  idBase,
}: {
  value: Confidence;
  onChange: (c: Confidence) => void;
  idBase: string;
}) {
  const steps: Confidence[] = [1, 2, 3, 4, 5];
  return (
    <div>
      <div className="flex items-stretch gap-1.5" role="radiogroup" aria-label="how sure are you">
        {steps.map((s) => {
          const on = s <= value;
          const active = s === value;
          return (
            <button
              key={`${idBase}-${s}`}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={CONFIDENCE_LABELS[s]}
              onClick={() => {
                unlockAudio();
                sfxKeyClick();
                onChange(s);
              }}
              className="flex-1 rounded-[4px]"
              style={{
                minHeight: TAP_TARGET_PX,
                touchAction: "manipulation",
                background: on ? PALETTE.wax : "rgba(255,255,255,.55)",
                opacity: on ? 0.35 + s * 0.13 : 1,
                border: `1px solid ${active ? PALETTE.waxDeep : PALETTE.edge}`,
                boxShadow: active ? `0 0 0 2px ${PALETTE.amberWash}` : undefined,
              }}
            />
          );
        })}
      </div>
      <p className="mt-1.5 text-center" style={{ fontFamily: MONO, fontSize: 12, color: PALETTE.wax, letterSpacing: 1 }}>
        {CONFIDENCE_LABELS[value]}
      </p>
    </div>
  );
}

function PredictionRow({
  p,
  index,
  canRemove,
  onText,
  onConfidence,
  onWildcard,
  onRemove,
}: {
  p: Prediction;
  index: number;
  canRemove: boolean;
  onText: (v: string) => void;
  onConfidence: (c: Confidence) => void;
  onWildcard: (on: boolean) => void;
  onRemove: () => void;
}) {
  const atCap = p.text.length >= LIMITS.predictionText;
  return (
    <div
      className="mb-3 p-3"
      style={{ background: "rgba(255,255,255,.42)", border: `1px solid ${PALETTE.edge}`, borderRadius: 6 }}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <Mono size={10}>{String(index + 1).padStart(2, "0")}</Mono>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`remove prediction ${index + 1}`}
            className="grid place-items-center"
            style={{ width: TAP_TARGET_PX, height: 36, color: PALETTE.inkSoft, touchAction: "manipulation" }}
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      <textarea
        value={p.text}
        onChange={(e) => onText(e.target.value.slice(0, LIMITS.predictionText))}
        rows={2}
        maxLength={LIMITS.predictionText}
        placeholder="what do you think happens?"
        aria-label={`prediction ${index + 1}`}
        style={{ ...INPUT, resize: "none", lineHeight: 1.45 }}
      />
      <div className="mt-1 flex items-center justify-end">
        <span style={{ fontFamily: MONO, fontSize: 10, color: atCap ? PALETTE.wax : PALETTE.inkSoft }}>
          {p.text.length}/{LIMITS.predictionText}
        </span>
      </div>

      <div className="mt-2">
        <ConfidencePicker value={p.confidence} onChange={onConfidence} idBase={p.id} />
      </div>

      <button
        type="button"
        onClick={() => onWildcard(!p.isWildcard)}
        aria-pressed={p.isWildcard}
        className="mt-2.5 w-full rounded-[4px]"
        style={{
          minHeight: 40,
          fontFamily: MONO,
          fontSize: 12,
          letterSpacing: 1,
          touchAction: "manipulation",
          color: p.isWildcard ? PALETTE.paper : PALETTE.inkSoft,
          background: p.isWildcard ? PALETTE.inkSoft : "transparent",
          border: `1px dashed ${p.isWildcard ? PALETTE.inkSoft : PALETTE.edge}`,
        }}
      >
        [ wildcard ]
      </button>
      {p.isWildcard && (
        <p className="mt-1.5 text-center" style={{ fontFamily: MONO, fontSize: 10, color: PALETTE.inkSoft }}>
          {COPY.wildcard}
        </p>
      )}
    </div>
  );
}

/**
 * What "locked" looks like. Deliberately composed, not a greyed-out form:
 * finality is the product, and a disabled input reads as something that broke.
 */
function LockedPanel({ mine, theirs, nameMine, nameTheirs }: { mine: number; theirs: number; nameMine: string; nameTheirs: string }) {
  return (
    <div
      className="px-4 py-6 text-center"
      style={{ border: `1px solid ${PALETTE.edge}`, borderRadius: 6, background: "rgba(255,255,255,.35)" }}
    >
      <Lock size={20} style={{ color: PALETTE.wax, margin: "0 auto" }} />
      <p className="mt-3" style={{ fontFamily: SERIF, fontSize: 19, color: PALETTE.ink }}>
        {COPY.amendClosed}
      </p>
      <p className="mt-3" style={{ fontFamily: MONO, fontSize: 11, color: PALETTE.inkSoft, lineHeight: 1.7 }}>
        {writtenLine(nameMine, mine)}
        <br />
        {writtenLine(nameTheirs, theirs)}
      </p>
    </div>
  );
}

export interface EditSheetProps {
  open: boolean;
  draft: CapsuleDraft;
  update: (patch: Partial<CapsuleDraft>) => void;
  seat: Seat;
  setSeat: (s: Seat) => void;
  onClose: () => void;
  onSeal: () => void;
  sealing: boolean;
  sheetMode: SheetMode;
  /** Remaining amend window, formatted. Shown only in "amend". */
  amendLeftLabel?: string;
}

export default memo(function EditSheet({
  open,
  draft,
  update,
  seat,
  setSeat,
  onClose,
  onSeal,
  sealing,
  sheetMode,
  amendLeftLabel,
}: EditSheetProps) {
  const reduce = useReducedMotion();
  const [promptTurn, setPromptTurn] = useState(0);

  const writing = sheetMode === "write";
  const locked = sheetMode === "locked";
  /** The single gate. Predictions and the stake move together behind it. */
  const contentEditable = !locked;

  const mine = useMemo(() => draft.predictions.filter((p) => p.author === seat), [draft.predictions, seat]);
  const theirs = countFor(draft.predictions, other(seat));
  const prompts = useMemo(() => promptTrio(promptTurn), [promptTurn]);

  const patchPrediction = useCallback(
    (id: string, patch: Partial<Prediction>) => {
      update({ predictions: draft.predictions.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
    },
    [draft.predictions, update],
  );

  const addRow = useCallback(() => {
    if (mine.length >= LIMITS.maxPredictions) return;
    unlockAudio();
    sfxPaperSlide();
    update({ predictions: [...draft.predictions, newPrediction(seat)] });
  }, [mine.length, draft.predictions, seat, update]);

  const removeRow = useCallback(
    (id: string) => {
      update({ predictions: draft.predictions.filter((p) => p.id !== id) });
    },
    [draft.predictions, update],
  );

  const toggleWild = useCallback(
    (id: string, on: boolean) => {
      update({ predictions: setWildcard(draft.predictions, id, on) });
    },
    [draft.predictions, update],
  );

  // The seal gate. `canSeal` is the contract's, and the reason it returns is
  // the copy shown — a nudge, never an error.
  const written = draft.predictions.filter((p) => p.text.trim().length > 0);
  const gate = canSeal(written, draft.stake);
  const agreed = draft.agreedA && draft.agreedB;
  const hasNames = draft.nameA.trim().length > 0 && draft.nameB.trim().length > 0;
  const hasDate = Boolean(localDateToIso(draft.opensOnDate, draft.timezone));
  const ready = gate.ok && agreed && hasNames && hasDate;

  const blocker = !hasNames
    ? "both names first."
    : !hasDate
      ? "pick the date it opens."
      : !gate.ok
        ? gate.reason
        : !agreed
          ? "both of you have to agree on the stake."
          : "";

  const myCount = mine.filter((p) => p.text.trim()).length;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={reduce ? false : { y: "100%" }}
          animate={{ y: 0 }}
          exit={reduce ? undefined : { y: "100%" }}
          transition={{ type: "tween", duration: reduce ? 0 : 0.28, ease: [0.2, 0.8, 0.25, 1] }}
          className="fixed inset-x-0 bottom-0 z-[220] mx-auto flex flex-col"
          style={{
            maxWidth: 380,
            height: "92dvh",
            background: PALETTE.paper,
            borderTop: `1px solid ${PALETTE.edge}`,
            borderTopLeftRadius: 14,
            borderTopRightRadius: 14,
            boxShadow: "0 -18px 40px -24px rgba(34,29,24,.6)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-3 pt-4" style={{ borderBottom: `1px solid ${PALETTE.edge}` }}>
            <div>
              <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: 2, color: PALETTE.ink }}>
                {writing ? "WRITE IT DOWN" : locked ? "SEALED" : "CHANGE YOURS"}
              </p>
              <p style={{ fontFamily: UI, fontSize: 11, color: locked ? PALETTE.wax : PALETTE.inkSoft }}>
                {writing
                  ? "sealed predictions, opened in a year"
                  : locked
                    ? COPY.amendClosed
                    : `${COPY.amendOpen}${amendLeftLabel ? ` ${amendLeftLabel} left.` : ""}`}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="close"
              className="grid place-items-center rounded-full"
              style={{ width: TAP_TARGET_PX, height: TAP_TARGET_PX, color: PALETTE.inkSoft, touchAction: "manipulation" }}
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-6 pt-4" style={{ WebkitOverflowScrolling: "touch" }}>
            {/* Seat switch. Switching does not reveal anything — the other tab
                shows that person's own rows, which is the point of handing the
                phone over rather than reading over a shoulder. */}
            <Section title="who is writing">
              <div className="flex gap-2">
                {(["a", "b"] as Seat[]).map((s) => {
                  const on = seat === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSeat(s)}
                      aria-pressed={on}
                      className="flex-1 rounded-[5px]"
                      style={{
                        minHeight: TAP_TARGET_PX,
                        fontFamily: MONO,
                        fontSize: 12,
                        letterSpacing: 1,
                        touchAction: "manipulation",
                        background: on ? PALETTE.ink : "transparent",
                        color: on ? PALETTE.paper : PALETTE.inkSoft,
                        border: `1px solid ${on ? PALETTE.ink : PALETTE.edge}`,
                      }}
                    >
                      {seatName(draft, s).toUpperCase()}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2" style={{ fontFamily: MONO, fontSize: 11, color: PALETTE.inkSoft }}>
                {writtenLine(seatName(draft, other(seat)), theirs)}
              </p>
            </Section>

            {/* Names never lock. Someone should be able to fix a typo in 2027
                without it being an integrity question. */}
            <Section title="names">
              <div className="flex gap-2">
                <input
                  value={draft.nameA}
                  onChange={(e) => update({ nameA: e.target.value.slice(0, LIMITS.name) })}
                  placeholder="one of you"
                  aria-label="first name"
                  style={INPUT}
                />
                <input
                  value={draft.nameB}
                  onChange={(e) => update({ nameB: e.target.value.slice(0, LIMITS.name) })}
                  placeholder="the other"
                  aria-label="second name"
                  style={INPUT}
                />
              </div>
            </Section>

            {writing ? (
              <Section title="opens on" hint="one timezone for the pair. the date is compared in UTC.">
                <input
                  type="date"
                  value={draft.opensOnDate}
                  onChange={(e) => update({ opensOnDate: e.target.value })}
                  aria-label="opens on"
                  style={{ ...INPUT, fontFamily: MONO, minHeight: TAP_TARGET_PX }}
                />
                <p className="mt-1.5" style={{ fontFamily: MONO, fontSize: 11, color: PALETTE.inkSoft }}>
                  {draft.timezone}
                  {hasDate && ` · ${fmtSealDate(localDateToIso(draft.opensOnDate, draft.timezone), draft.timezone)}`}
                </p>
              </Section>
            ) : (
              <Section title="opens on">
                <p style={{ fontFamily: MONO, fontSize: 13, color: PALETTE.ink }}>
                  {fmtSealDate(localDateToIso(draft.opensOnDate, draft.timezone), draft.timezone)} · {draft.timezone}
                </p>
              </Section>
            )}

            <Rule style={{ margin: "18px 0" }} />

            {contentEditable ? (
              <>
                <Section
                  title="your predictions"
                  hint={`${LIMITS.minPredictions}–${LIMITS.maxPredictions} each. ${seatName(draft, other(seat))} cannot see these.`}
                >
                  {mine.map((p, i) => (
                    <PredictionRow
                      key={p.id}
                      p={p}
                      index={i}
                      canRemove={mine.length > LIMITS.minPredictions}
                      onText={(v) => patchPrediction(p.id, { text: v })}
                      onConfidence={(c) => patchPrediction(p.id, { confidence: c })}
                      onWildcard={(on) => toggleWild(p.id, on)}
                      onRemove={() => removeRow(p.id)}
                    />
                  ))}

                  {mine.length < LIMITS.maxPredictions && (
                    <TapButton onClick={addRow} tone="quiet" full>
                      <Plus size={15} /> add a prediction
                    </TapButton>
                  )}

                  <p
                    className="mt-2"
                    style={{
                      fontFamily: MONO,
                      fontSize: 11,
                      color: myCount >= LIMITS.minPredictions ? PALETTE.right : PALETTE.inkSoft,
                    }}
                  >
                    {myCount} of {LIMITS.minPredictions} written
                  </p>
                </Section>

                <Section title="need a nudge?">
                  <div className="flex flex-col gap-1.5">
                    {prompts.map((q) => (
                      <p key={q} style={{ fontFamily: SERIF, fontSize: 15, color: PALETTE.inkSoft, fontStyle: "italic" }}>
                        · {q}
                      </p>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPromptTurn((t) => t + 1)}
                    className="mt-2 inline-flex items-center gap-1.5"
                    style={{ minHeight: 40, fontFamily: MONO, fontSize: 11, color: PALETTE.wax, touchAction: "manipulation" }}
                  >
                    <Shuffle size={13} /> new prompts
                  </button>
                </Section>
              </>
            ) : (
              <Section title="your predictions">
                <LockedPanel
                  mine={mine.length}
                  theirs={theirs}
                  nameMine={seatName(draft, seat)}
                  nameTheirs={seatName(draft, other(seat))}
                />
              </Section>
            )}

            <Rule style={{ margin: "18px 0" }} />

            {/* The stake. One shared field, visible to both — the only written
                thing that is not private. It locks WITH the predictions: a stake
                quietly rewritten a year later, with the scorecard about to be
                computed, defeats the seal just as thoroughly. */}
            <Section
              title="the stake"
              hint={contentEditable ? "both of you have to agree on this before it seals." : undefined}
            >
              {contentEditable ? (
                <>
                  <textarea
                    value={draft.stake}
                    onChange={(e) => update({ stake: e.target.value.slice(0, LIMITS.stake) })}
                    rows={2}
                    maxLength={LIMITS.stake}
                    placeholder="what does the loser owe?"
                    aria-label="the stake"
                    style={{ ...INPUT, resize: "none" }}
                  />
                  <div className="mt-1 flex justify-end">
                    <span style={{ fontFamily: MONO, fontSize: 10, color: PALETTE.inkSoft }}>
                      {draft.stake.length}/{LIMITS.stake}
                    </span>
                  </div>
                </>
              ) : (
                <div
                  className="px-3.5 py-3"
                  style={{ border: `1px solid ${PALETTE.edge}`, borderRadius: 6, background: "rgba(255,255,255,.35)" }}
                >
                  <p style={{ fontFamily: SERIF, fontSize: 16, color: PALETTE.ink }}>{draft.stake || "—"}</p>
                  <p className="mt-2 inline-flex items-center gap-1.5" style={{ fontFamily: MONO, fontSize: 10, color: PALETTE.wax }}>
                    <Lock size={11} /> {COPY.amendClosed}
                  </p>
                </div>
              )}

              {writing && (
                <div className="mt-2 flex gap-2">
                  {(["a", "b"] as Seat[]).map((s) => {
                    const on = s === "a" ? draft.agreedA : draft.agreedB;
                    return (
                      <button
                        key={s}
                        type="button"
                        aria-pressed={on}
                        onClick={() => update(s === "a" ? { agreedA: !on } : { agreedB: !on })}
                        className="flex-1 rounded-[5px]"
                        style={{
                          minHeight: TAP_TARGET_PX,
                          fontFamily: MONO,
                          fontSize: 11,
                          letterSpacing: 0.6,
                          touchAction: "manipulation",
                          background: on ? PALETTE.right : "transparent",
                          color: on ? PALETTE.paper : PALETTE.inkSoft,
                          border: `1px solid ${on ? PALETTE.right : PALETTE.edge}`,
                        }}
                      >
                        {seatName(draft, s)}: I agree to this
                      </button>
                    );
                  })}
                </div>
              )}
            </Section>

            {/* The context snapshot. This is what makes the opening land — the
                gap between the city they were in and the one they are in. */}
            {contentEditable && (
              <Section title="where you are right now" hint="read back a year from now, before a single prediction.">
                <input
                  value={seat === "a" ? draft.cityA : draft.cityB}
                  onChange={(e) =>
                    update(
                      seat === "a"
                        ? { cityA: e.target.value.slice(0, LIMITS.city) }
                        : { cityB: e.target.value.slice(0, LIMITS.city) },
                    )
                  }
                  placeholder="city"
                  aria-label="city"
                  style={INPUT}
                />
                <textarea
                  value={seat === "a" ? draft.lineA : draft.lineB}
                  onChange={(e) =>
                    update(
                      seat === "a"
                        ? { lineA: e.target.value.slice(0, LIMITS.oneLine) }
                        : { lineB: e.target.value.slice(0, LIMITS.oneLine) },
                    )
                  }
                  rows={2}
                  maxLength={LIMITS.oneLine}
                  placeholder="one line about right now"
                  aria-label="one line about right now"
                  className="mt-2"
                  style={{ ...INPUT, resize: "none" }}
                />
              </Section>
            )}
          </div>

          {/* Seal / save */}
          <div className="px-5 pb-5 pt-3" style={{ borderTop: `1px solid ${PALETTE.edge}`, background: PALETTE.paperDeep }}>
            {locked ? (
              // The only save left. Names and photos are cosmetic identity and
              // never lock; the predictions and the stake behind them do.
              <TapButton onClick={onSeal} tone="quiet" full>
                save names
              </TapButton>
            ) : writing ? (
              <>
                <TapButton onClick={onSeal} tone="wax" full disabled={!ready || sealing}>
                  <Lock size={15} /> {sealing ? "sealing…" : "seal it"}
                </TapButton>
                {!ready && blocker && (
                  <p className="mt-2 text-center" style={{ fontFamily: MONO, fontSize: 11, color: PALETTE.inkSoft }}>
                    {blocker}
                  </p>
                )}
              </>
            ) : (
              <TapButton onClick={onSeal} tone="wax" full disabled={sealing}>
                <Lock size={15} /> save changes
              </TapButton>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
