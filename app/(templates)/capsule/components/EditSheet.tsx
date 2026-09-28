"use client";

// ─── SCREEN 1 — writing (and the amend window) ───────────────────────────────
//
// Four steps, because a capsule has four layers:
//
//   1. the outside   — the colour of the capsule, the two names, the day it
//                      opens, and the stake both of them sign
//   2. predictions   — each partner writes alone; the other side of this sheet
//                      shows a COUNT and nothing else
//   3. keepsakes     — photos (each framed, with a memory for the back) + GIFs
//   4. the letter    — sealed at the very bottom, read last
//
// The draft lives in component state. Not localStorage, not sessionStorage:
// a capsule's contents must not sit somewhere another tab, another user of the
// same phone, or a stray extension can read them a year early.
//
// THREE MODES, and the third one is the product:
//
//   write  — nothing sealed yet. Everything editable.
//   amend  — sealed, and `canAmend` is still true. This seat's own predictions,
//            the shared stake, the keepsakes and the letter are editable. They
//            lock together.
//   locked — `canAmend` is false. Everything inside is not editable AND NOT
//            SHOWN, not even to its own author: "not by the partner, not by the
//            author". Names and the theme — the outside of the capsule — stay
//            editable forever.

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X, Plus, Trash2, Shuffle, Lock, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { FormSection } from "../../_love/editor/LoveKitSections";
import ThemePicker from "../../_love/editor/ThemePicker";
import PhotosEditor from "../../_love/editor/PhotosEditor";
import GifPicker from "../../_love/editor/GifPicker";
import { MAX_LETTER_LEN, MAX_LOCK_ANSWER_LEN, MAX_LOCK_QUESTION_LEN, MAX_PHOTOS } from "../../_love/types";
import {
  CONFIDENCE_LABELS,
  COPY,
  HAND,
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
  CAPSULE_GIF_TAGS,
  countFor,
  isoToLocalYmd,
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
import { CAPSULE_THEMES, capsuleTheme, capsuleThemeVars, sheetTheme } from "./themes";
import { WaxSeal } from "./paper";
import { TapButton } from "./ui";
import { sfxKeyClick, sfxPaperSlide, unlockAudio } from "@/lib/webAudio";

/** Which of the three sheets this is. See the header comment. */
export type SheetMode = "write" | "amend" | "locked";

type StepId = "outside" | "predictions" | "keepsakes" | "letter";
const STEPS: { id: StepId; emoji: string; label: string }[] = [
  { id: "outside", emoji: "🏷️", label: "the outside" },
  { id: "predictions", emoji: "✍️", label: "predictions" },
  { id: "keepsakes", emoji: "📸", label: "keepsakes" },
  { id: "letter", emoji: "💌", label: "the letter" },
];

const INPUT: React.CSSProperties = {
  fontSize: 16, // anything smaller and iOS zooms the whole page on focus
  fontFamily: UI,
  color: PALETTE.ink,
  background: "#fff",
  border: `1.5px solid ${PALETTE.edge}`,
  borderRadius: 14,
  padding: "12px 14px",
  width: "100%",
  outline: "none",
};

function Label({ children, hint, count }: { children: React.ReactNode; hint?: React.ReactNode; count?: string }) {
  return (
    <div className="mb-2">
      <div className="flex items-baseline justify-between gap-2">
        <p style={{ margin: 0, fontFamily: UI, fontWeight: 800, fontSize: 14.5, color: PALETTE.ink }}>{children}</p>
        {count && <span style={{ fontFamily: MONO, fontSize: 10.5, color: PALETTE.inkSoft, fontVariantNumeric: "tabular-nums" }}>{count}</span>}
      </div>
      {hint && <p style={{ margin: "2px 0 0", fontFamily: UI, fontSize: 12.5, color: PALETTE.inkSoft, lineHeight: 1.45 }}>{hint}</p>}
    </div>
  );
}

function Block({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="mb-4 rounded-[20px] p-4" style={{ background: PALETTE.quiet, border: `1px solid ${PALETTE.edge}`, ...style }}>
      {children}
    </div>
  );
}

/**
 * Five steps, labelled in WORDS. The writer never sees 1..5 — a number invites
 * arithmetic about the scoring, and the point is to make them commit to a
 * feeling. The weight is the label's business, not theirs.
 */
function ConfidencePicker({ value, onChange, idBase }: { value: Confidence; onChange: (c: Confidence) => void; idBase: string }) {
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
              className="cp-press flex-1 rounded-full"
              style={{
                minHeight: 34,
                touchAction: "manipulation",
                background: on ? PALETTE.wax : "#fff",
                opacity: on ? 0.4 + s * 0.12 : 1,
                border: `1.5px solid ${active ? PALETTE.waxDeep : PALETTE.edge}`,
              }}
            />
          );
        })}
      </div>
      <p className="mt-1.5 text-center" style={{ margin: "6px 0 0", fontFamily: HAND, fontWeight: 700, fontSize: 19, color: PALETTE.wax }}>
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
    <div className="mb-3 rounded-[20px] p-3.5" style={{ background: "#fff", border: `1.5px solid ${p.text.trim() ? PALETTE.edge : PALETTE.edge}`, boxShadow: "0 8px 20px -16px rgba(0,0,0,.4)" }}>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="grid place-items-center rounded-full" style={{ width: 26, height: 26, background: PALETTE.paperDeep, fontFamily: MONO, fontSize: 11, color: PALETTE.inkSoft }}>
          {index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`remove prediction ${index + 1}`}
            className="grid place-items-center rounded-full"
            style={{ width: 40, height: 36, color: PALETTE.inkSoft, touchAction: "manipulation" }}
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
        style={{ ...INPUT, fontFamily: SERIF, fontSize: 19, resize: "none", lineHeight: 1.35, border: "none", padding: "4px 2px", background: "transparent" }}
      />
      <div className="flex items-center justify-end">
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
        className="cp-press mt-2 w-full rounded-full"
        style={{
          minHeight: 38,
          fontFamily: UI,
          fontWeight: 700,
          fontSize: 13,
          touchAction: "manipulation",
          color: p.isWildcard ? "#fff" : PALETTE.inkSoft,
          background: p.isWildcard ? PALETTE.inkSoft : "transparent",
          border: `1.5px dashed ${p.isWildcard ? PALETTE.inkSoft : PALETTE.edge}`,
        }}
      >
        🃏 {p.isWildcard ? "wildcard — on" : "make it the wildcard"}
      </button>
      {p.isWildcard && (
        <p className="mt-1.5 text-center" style={{ margin: "6px 0 0", fontFamily: MONO, fontSize: 10, color: PALETTE.inkSoft }}>
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
function LockedPanel({ lines }: { lines: string[] }) {
  return (
    <div className="rounded-[20px] px-4 py-6 text-center" style={{ border: `1px solid ${PALETTE.edge}`, background: PALETTE.quiet }}>
      <Lock size={20} style={{ color: PALETTE.wax, margin: "0 auto" }} />
      <p className="mt-3" style={{ fontFamily: SERIF, fontSize: 22, color: PALETTE.ink }}>
        {COPY.amendClosed}
      </p>
      <p className="mt-3" style={{ fontFamily: MONO, fontSize: 11, color: PALETTE.inkSoft, lineHeight: 1.7 }}>
        {lines.map((l) => (
          <span key={l} className="block">
            {l}
          </span>
        ))}
      </p>
    </div>
  );
}

const LETTER_NUDGES = [
  "what's true right now that you'll forget",
  "the thing you hope is still the same",
  "a small, specific detail of this week",
  "what you'd tell them if this were the last page",
];

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
  /** What is sealed inside, for the locked sheet (the draft's copy is redacted). */
  lockedCounts?: { photos: number; gifs: number; letter: boolean };
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
  lockedCounts,
}: EditSheetProps) {
  const reduce = useReducedMotion();
  const [promptTurn, setPromptTurn] = useState(0);
  const [step, setStep] = useState<StepId>("outside");
  const [showMissing, setShowMissing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const writing = sheetMode === "write";
  const locked = sheetMode === "locked";
  /** The single gate. Everything inside moves together behind it. */
  const contentEditable = !locked;

  const theme = capsuleTheme(draft.theme);
  const paper = sheetTheme(theme);

  const mine = useMemo(() => draft.predictions.filter((p) => p.author === seat), [draft.predictions, seat]);
  const theirs = countFor(draft.predictions, other(seat));
  const prompts = useMemo(() => promptTrio(promptTurn), [promptTurn]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [step]);

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

  const removeRow = useCallback((id: string) => update({ predictions: draft.predictions.filter((p) => p.id !== id) }), [draft.predictions, update]);

  const toggleWild = useCallback((id: string, on: boolean) => update({ predictions: setWildcard(draft.predictions, id, on) }), [draft.predictions, update]);

  // ── The seal gate ─────────────────────────────────────────────────────────
  // `canSeal` is the contract's; the checklist below is the same gate spelt
  // out, each line a way to the step that fixes it. A nudge, never an error.
  const written = draft.predictions.filter((p) => p.text.trim().length > 0);
  const gate = canSeal(written, draft.stake);
  const agreed = draft.agreedA && draft.agreedB;
  const hasNames = draft.nameA.trim().length > 0 && draft.nameB.trim().length > 0;
  const opensIso = localDateToIso(draft.opensOnDate, draft.timezone);
  const todayYmd = useMemo(() => (open ? isoToLocalYmd(new Date().toISOString(), draft.timezone) : ""), [open, draft.timezone]);
  const dateOk = Boolean(opensIso) && (!writing || !todayYmd || draft.opensOnDate >= todayYmd);
  const countA = countFor(written, "a");
  const countB = countFor(written, "b");

  const checklist: { ok: boolean; text: string; step: StepId }[] = [
    { ok: hasNames, text: "both names", step: "outside" },
    { ok: dateOk, text: dateOk ? "the day it opens" : "a day it opens (today or later)", step: "outside" },
    { ok: draft.stake.trim().length > 0, text: "a stake", step: "outside" },
    { ok: agreed, text: "both of you agree to the stake", step: "outside" },
    { ok: countA >= LIMITS.minPredictions, text: `${seatName(draft, "a")}: ${Math.min(countA, LIMITS.minPredictions)}/${LIMITS.minPredictions} predictions`, step: "predictions" },
    { ok: countB >= LIMITS.minPredictions, text: `${seatName(draft, "b")}: ${Math.min(countB, LIMITS.minPredictions)}/${LIMITS.minPredictions} predictions`, step: "predictions" },
  ];
  const ready = gate.ok && agreed && hasNames && dateOk;
  const missing = checklist.filter((c) => !c.ok);

  const stepDone: Record<StepId, boolean> = {
    outside: hasNames && dateOk && draft.stake.trim().length > 0 && agreed,
    predictions: countA >= LIMITS.minPredictions && countB >= LIMITS.minPredictions,
    keepsakes: draft.photos.length > 0 || draft.gifs.length > 0,
    letter: draft.letter.trim().length > 0,
  };

  const idx = STEPS.findIndex((s) => s.id === step);
  const last = idx === STEPS.length - 1;
  const go = (d: number) => setStep(STEPS[Math.min(STEPS.length - 1, Math.max(0, idx + d))].id);

  const trySeal = () => {
    if (writing && !ready) {
      setShowMissing(true);
      return;
    }
    onSeal();
  };

  const myCount = mine.filter((p) => p.text.trim()).length;
  const lockedLines = [
    writtenLine(seatName(draft, "a"), countFor(draft.predictions, "a")),
    writtenLine(seatName(draft, "b"), countFor(draft.predictions, "b")),
    ...(lockedCounts && lockedCounts.photos ? [`${lockedCounts.photos} keepsake${lockedCounts.photos === 1 ? "" : "s"} inside.`] : []),
    ...(lockedCounts && lockedCounts.letter ? ["a letter, to be read last."] : []),
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={reduce ? false : { y: "100%" }}
          animate={{ y: 0 }}
          exit={reduce ? undefined : { y: "100%" }}
          transition={{ type: "tween", duration: reduce ? 0 : 0.3, ease: [0.2, 0.8, 0.25, 1] }}
          className="fixed inset-x-0 bottom-0 z-[220] mx-auto flex flex-col overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Write the capsule"
          style={{
            ...capsuleThemeVars(paper),
            maxWidth: 560,
            height: "94dvh",
            background: `linear-gradient(180deg, ${PALETTE.paper} 0%, ${PALETTE.paperDeep} 100%)`,
            color: PALETTE.ink,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            boxShadow: "0 -24px 60px -24px rgba(20,12,8,.55)",
          }}
        >
          {/* Header */}
          <div className="px-5 pb-3 pt-3">
            <div aria-hidden className="mx-auto mb-2 h-1.5 w-11 rounded-full" style={{ background: PALETTE.edge }} />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p style={{ margin: 0, fontFamily: UI, fontWeight: 800, fontSize: 22, letterSpacing: "-0.03em", color: PALETTE.ink }}>
                  {writing ? (
                    <>
                      pack the <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400 }}>capsule</span>
                    </>
                  ) : locked ? (
                    "sealed"
                  ) : (
                    "change yours"
                  )}
                </p>
                <p style={{ margin: "1px 0 0", fontFamily: UI, fontSize: 12.5, color: locked ? PALETTE.wax : PALETTE.inkSoft }}>
                  {writing
                    ? "write it down. don't look again until it's time."
                    : locked
                      ? "the outside can still change. the inside can't."
                      : `${COPY.amendOpen}${amendLeftLabel ? ` ${amendLeftLabel} left.` : ""}`}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="close"
                className="cp-press grid shrink-0 place-items-center rounded-full"
                style={{ width: 44, height: 44, color: PALETTE.inkSoft, background: PALETTE.quiet, border: `1px solid ${PALETTE.edge}`, touchAction: "manipulation" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Steps */}
            <div className="cp-scroll -mx-5 mt-3 flex gap-1.5 overflow-x-auto px-5" role="tablist" aria-label="Steps">
              {STEPS.map((s, i) => {
                const on = s.id === step;
                const done = stepDone[s.id];
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => setStep(s.id)}
                    ref={on ? (el) => el?.scrollIntoView({ block: "nearest", inline: "center" }) : undefined}
                    className="cp-press inline-flex shrink-0 items-center gap-1.5 rounded-full px-3"
                    style={{
                      minHeight: 38,
                      fontFamily: UI,
                      fontWeight: 700,
                      fontSize: 13,
                      whiteSpace: "nowrap",
                      color: on ? "#fff" : PALETTE.ink,
                      background: on ? `linear-gradient(180deg, ${PALETTE.waxHi} -40%, ${PALETTE.wax} 60%)` : "#fff",
                      border: `1.5px solid ${on ? PALETTE.wax : PALETTE.edge}`,
                    }}
                  >
                    <span aria-hidden>{s.emoji}</span>
                    <span>
                      {i + 1}. {s.label}
                    </span>
                    {done && (
                      <span aria-label="done" className="grid place-items-center rounded-full" style={{ width: 16, height: 16, background: on ? "rgba(255,255,255,.3)" : PALETTE.right, color: "#fff" }}>
                        <Check size={11} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pb-8 pt-2" style={{ WebkitOverflowScrolling: "touch", borderTop: `1px solid ${PALETTE.edge}` }}>
            {/* ── 1. THE OUTSIDE ─────────────────────────────────────────── */}
            {step === "outside" && (
              <div className="pt-3">
                <FormSection emoji="🎨" title="What's it made of?" note="The capsule's colour — the whole page changes. You can change this any time, even after it's sealed.">
                  <ThemePicker themes={CAPSULE_THEMES} value={draft.theme} onChange={(id) => update({ theme: id })} />
                </FormSection>

                <div className="mt-6">
                  <Label hint="On the label, the waiting screen, and every card.">whose capsule is it?</Label>
                  <div className="flex gap-2">
                    <input value={draft.nameA} onChange={(e) => update({ nameA: e.target.value.slice(0, LIMITS.name) })} placeholder="one of you" aria-label="first name" style={INPUT} />
                    <input value={draft.nameB} onChange={(e) => update({ nameB: e.target.value.slice(0, LIMITS.name) })} placeholder="the other" aria-label="second name" style={INPUT} />
                  </div>
                </div>

                <div className="mt-6">
                  <Label hint={writing ? "Nobody can open it before this day — not even you. A year is the sweet spot." : undefined}>when does it open?</Label>
                  {writing ? (
                    <>
                      <input
                        type="date"
                        value={draft.opensOnDate}
                        min={todayYmd || undefined}
                        onChange={(e) => update({ opensOnDate: e.target.value })}
                        aria-label="opens on"
                        style={{ ...INPUT, fontFamily: MONO, minHeight: TAP_TARGET_PX }}
                      />
                      <p style={{ margin: "6px 0 0", fontFamily: MONO, fontSize: 11, color: dateOk ? PALETTE.inkSoft : PALETTE.wax }}>
                        {dateOk ? `opens ${fmtSealDate(opensIso, draft.timezone)}, 9 am · ${draft.timezone}` : "pick today or a day after it."}
                      </p>
                    </>
                  ) : (
                    <p style={{ margin: 0, fontFamily: MONO, fontSize: 13, color: PALETTE.ink }}>
                      🔒 {fmtSealDate(opensIso, draft.timezone)} · {draft.timezone}
                    </p>
                  )}
                </div>

                <div className="mt-6">
                  <Label
                    hint={contentEditable ? "Whoever ends up more wrong owes this. Small and specific beats big and vague." : undefined}
                    count={contentEditable ? `${draft.stake.length}/${LIMITS.stake}` : undefined}
                  >
                    the stake
                  </Label>
                  {contentEditable ? (
                    <>
                      <textarea
                        value={draft.stake}
                        onChange={(e) => update({ stake: e.target.value.slice(0, LIMITS.stake) })}
                        rows={2}
                        maxLength={LIMITS.stake}
                        placeholder="loser cooks every Sunday for a month…"
                        aria-label="the stake"
                        style={{ ...INPUT, fontFamily: SERIF, fontSize: 19, resize: "none", lineHeight: 1.35 }}
                      />
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
                                className="cp-press flex-1 rounded-full px-2"
                                style={{
                                  minHeight: TAP_TARGET_PX,
                                  fontFamily: UI,
                                  fontWeight: 700,
                                  fontSize: 13,
                                  touchAction: "manipulation",
                                  background: on ? PALETTE.right : "#fff",
                                  color: on ? "#fff" : PALETTE.inkSoft,
                                  border: `1.5px solid ${on ? PALETTE.right : PALETTE.edge}`,
                                }}
                              >
                                {on ? "✓ " : ""}
                                {seatName(draft, s)} agrees
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <Block>
                      <p style={{ margin: 0, fontFamily: SERIF, fontSize: 19, color: PALETTE.ink }}>{draft.stake || "—"}</p>
                      <p className="mt-2 inline-flex items-center gap-1.5" style={{ fontFamily: MONO, fontSize: 10, color: PALETTE.wax }}>
                        <Lock size={11} /> {COPY.amendClosed}
                      </p>
                    </Block>
                  )}
                </div>
              </div>
            )}

            {/* ── 2. PREDICTIONS ─────────────────────────────────────────── */}
            {step === "predictions" && (
              <div className="pt-4">
                {/* Seat switch. Switching does not reveal anything — the other tab
                    shows that person's own rows, which is the point of handing the
                    phone over rather than reading over a shoulder. */}
                <Label hint="Hand the phone over for the other half. Neither of you can see the other's.">who&apos;s writing?</Label>
                <div className="flex gap-2 rounded-full p-1" style={{ background: "#fff", border: `1.5px solid ${PALETTE.edge}` }}>
                  {(["a", "b"] as Seat[]).map((s) => {
                    const on = seat === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSeat(s)}
                        aria-pressed={on}
                        className="cp-press flex-1 rounded-full"
                        style={{
                          minHeight: 42,
                          fontFamily: UI,
                          fontWeight: 800,
                          fontSize: 14,
                          touchAction: "manipulation",
                          background: on ? PALETTE.ink : "transparent",
                          color: on ? PALETTE.paper : PALETTE.inkSoft,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          padding: "0 10px",
                        }}
                      >
                        {seatName(draft, s)}
                      </button>
                    );
                  })}
                </div>
                <p style={{ margin: "8px 0 14px", fontFamily: MONO, fontSize: 11, color: PALETTE.inkSoft }}>🙈 {writtenLine(seatName(draft, other(seat)), theirs)}</p>

                {contentEditable ? (
                  <>
                    <Label
                      hint={`${LIMITS.minPredictions}–${LIMITS.maxPredictions} each. Tap the bar for how sure you are.`}
                      count={`${myCount}/${LIMITS.minPredictions} min`}
                    >
                      {seatName(draft, seat)}&apos;s predictions
                    </Label>
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

                    <Block style={{ marginTop: 16 }}>
                      <p style={{ margin: 0, fontFamily: UI, fontWeight: 800, fontSize: 13.5 }}>need a nudge?</p>
                      <div className="mt-1.5 flex flex-col gap-1">
                        {prompts.map((q) => (
                          <p key={q} style={{ margin: 0, fontFamily: SERIF, fontSize: 17, color: PALETTE.inkSoft, fontStyle: "italic" }}>
                            · {q}
                          </p>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setPromptTurn((t) => t + 1)}
                        className="mt-1 inline-flex items-center gap-1.5"
                        style={{ minHeight: 40, fontFamily: UI, fontWeight: 700, fontSize: 12.5, color: PALETTE.wax, touchAction: "manipulation" }}
                      >
                        <Shuffle size={13} /> new prompts
                      </button>
                    </Block>

                    {/* The context snapshot. This is what makes the opening land —
                        the gap between the city they were in and the one they are in. */}
                    <div className="mt-2">
                      <Label hint="Read back on opening day, before a single prediction.">where are you right now, {seatName(draft, seat)}?</Label>
                      <input
                        value={seat === "a" ? draft.cityA : draft.cityB}
                        onChange={(e) => update(seat === "a" ? { cityA: e.target.value.slice(0, LIMITS.city) } : { cityB: e.target.value.slice(0, LIMITS.city) })}
                        placeholder="city"
                        aria-label="city"
                        style={INPUT}
                      />
                      <textarea
                        value={seat === "a" ? draft.lineA : draft.lineB}
                        onChange={(e) => update(seat === "a" ? { lineA: e.target.value.slice(0, LIMITS.oneLine) } : { lineB: e.target.value.slice(0, LIMITS.oneLine) })}
                        rows={2}
                        maxLength={LIMITS.oneLine}
                        placeholder="one line about right now"
                        aria-label="one line about right now"
                        className="mt-2"
                        style={{ ...INPUT, resize: "none" }}
                      />
                    </div>
                  </>
                ) : (
                  <LockedPanel lines={lockedLines} />
                )}
              </div>
            )}

            {/* ── 3. KEEPSAKES ───────────────────────────────────────────── */}
            {step === "keepsakes" && (
              <div className="pt-3">
                {contentEditable ? (
                  <>
                    <FormSection
                      emoji="📸"
                      title="Keepsakes"
                      note={`Up to ${MAX_PHOTOS} photos. Each becomes a polaroid, a film strip or a pressed-flower card in the capsule. Tap one to crop & zoom; write the memory that goes on the back.`}
                    >
                      <PhotosEditor
                        photos={draft.photos}
                        onChange={(v) => update({ photos: v })}
                        captionHint="front — e.g. the balcony, march"
                        noteHint="the back — the thing you'd never say out loud…"
                      />
                    </FormSection>
                    <div className="mt-6">
                      <FormSection emoji="🎞️" title="Moving pictures" note="GIFs get taped in among the photos — and one waits by the letter.">
                        <GifPicker gifs={draft.gifs} onChange={(v) => update({ gifs: v })} tags={[...CAPSULE_GIF_TAGS]} />
                      </FormSection>
                    </div>
                    {draft.photos.length === 0 && (
                      <p className="mt-4 text-center" style={{ fontFamily: HAND, fontWeight: 700, fontSize: 20, color: PALETTE.inkSoft }}>
                        optional — but the photos are what they&apos;ll cry at.
                      </p>
                    )}
                  </>
                ) : (
                  <LockedPanel lines={lockedLines} />
                )}
              </div>
            )}

            {/* ── 4. THE LETTER ──────────────────────────────────────────── */}
            {step === "letter" && (
              <div className="pt-3">
                {contentEditable ? (
                  <>
                    <FormSection emoji="💌" title="The letter at the bottom" note="Sealed under everything else, with its own wax. It's the very last thing read on opening day.">
                      <div className="relative overflow-hidden rounded-[18px]" style={{ background: "#fffdf8", border: `1.5px solid ${PALETTE.edge}` }}>
                        <textarea
                          value={draft.letter}
                          onChange={(e) => update({ letter: e.target.value.slice(0, MAX_LETTER_LEN) })}
                          placeholder={"Dear us, on the day this opens…\n\nwrite it to whoever is reading."}
                          aria-label="The letter"
                          rows={10}
                          className="cp-lined w-full resize-y"
                          style={{
                            display: "block",
                            fontFamily: SERIF,
                            fontSize: 19,
                            lineHeight: "30px",
                            color: PALETTE.ink,
                            background: "transparent",
                            backgroundAttachment: "local",
                            border: "none",
                            outline: "none",
                            padding: "14px 16px",
                            minHeight: 280,
                          }}
                        />
                      </div>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span style={{ fontFamily: UI, fontSize: 12, color: PALETTE.inkSoft }}>{draft.letter.trim() ? "✓ looks lovely" : "optional, but it's the payoff"}</span>
                        <span style={{ fontFamily: MONO, fontSize: 10.5, color: draft.letter.length >= MAX_LETTER_LEN ? PALETTE.wax : PALETTE.inkSoft }}>
                          {draft.letter.length}/{MAX_LETTER_LEN}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {LETTER_NUDGES.map((n) => (
                          <span key={n} className="rounded-full px-3 py-1.5" style={{ background: "#fff", border: `1px dashed ${PALETTE.edge}`, fontFamily: UI, fontSize: 12, color: PALETTE.inkSoft }}>
                            {n}
                          </span>
                        ))}
                      </div>
                    </FormSection>

                    <Block style={{ marginTop: 22 }}>
                      <div className="flex items-center gap-3">
                        <div className="shrink-0">
                          <WaxSeal seed="sheet-letter" size={54} initials={`${draft.nameA.charAt(0)}${draft.nameB.charAt(0)}`} />
                        </div>
                        <div className="min-w-0">
                          <p style={{ margin: 0, fontFamily: UI, fontWeight: 800, fontSize: 14 }}>The words on the seal</p>
                          <p style={{ margin: "2px 0 0", fontFamily: UI, fontSize: 12, color: PALETTE.inkSoft, lineHeight: 1.4 }}>
                            Shown just before they break it. Leave blank for ours.
                          </p>
                        </div>
                      </div>
                      <input
                        value={draft.lockQuestion}
                        onChange={(e) => update({ lockQuestion: e.target.value.slice(0, MAX_LOCK_QUESTION_LEN) })}
                        placeholder="last thing in here. ready?"
                        aria-label="Words above the seal"
                        className="mt-3"
                        style={INPUT}
                      />
                      <input
                        value={draft.lockAnswer}
                        onChange={(e) => update({ lockAnswer: e.target.value.slice(0, MAX_LOCK_ANSWER_LEN) })}
                        placeholder="break the seal"
                        aria-label="Button that breaks the seal"
                        className="mt-2"
                        style={INPUT}
                      />
                    </Block>
                  </>
                ) : (
                  <LockedPanel lines={lockedLines} />
                )}
              </div>
            )}
          </div>

          {/* Footer: step nav + seal */}
          <div className="px-5 pb-5 pt-3" style={{ borderTop: `1px solid ${PALETTE.edge}`, background: PALETTE.paperDeep, paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))" }}>
            {writing && showMissing && missing.length > 0 && (
              <div className="mb-3 rounded-[16px] px-3.5 py-3" style={{ background: "#fff", border: `1.5px solid ${PALETTE.wax}` }} role="alert">
                <p style={{ margin: 0, fontFamily: UI, fontWeight: 800, fontSize: 13, color: PALETTE.wax }}>before it can seal:</p>
                <ul style={{ listStyle: "none", margin: "6px 0 0", padding: 0 }}>
                  {missing.map((m) => (
                    <li key={m.text}>
                      <button
                        type="button"
                        onClick={() => setStep(m.step)}
                        className="flex w-full items-center justify-between gap-2 py-1 text-left"
                        style={{ fontFamily: UI, fontSize: 13, color: PALETTE.ink, minHeight: 32 }}
                      >
                        <span>○ {m.text}</span>
                        <span style={{ fontFamily: MONO, fontSize: 10.5, color: PALETTE.inkSoft }}>{STEPS.find((s) => s.id === m.step)?.label} →</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex items-center gap-2">
              {idx > 0 && (
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous step"
                  className="cp-press grid shrink-0 place-items-center rounded-full"
                  style={{ width: 52, height: 52, background: "#fff", border: `1.5px solid ${PALETTE.edge}`, color: PALETTE.ink }}
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              <div className="flex-1">
                {locked ? (
                  // The only save left. Names and the theme are the outside of
                  // the capsule and never lock; everything inside does.
                  <TapButton onClick={onSeal} tone="wax" full>
                    save the outside
                  </TapButton>
                ) : !last ? (
                  <TapButton onClick={() => go(1)} tone="wax" full>
                    next: {STEPS[idx + 1].label} <ChevronRight size={16} />
                  </TapButton>
                ) : writing ? (
                  <TapButton onClick={trySeal} tone="wax" full disabled={sealing}>
                    <Lock size={15} /> {sealing ? "sealing…" : "seal it"}
                  </TapButton>
                ) : (
                  <TapButton onClick={onSeal} tone="wax" full disabled={sealing}>
                    <Lock size={15} /> save changes
                  </TapButton>
                )}
              </div>
            </div>
            {writing && (
              <p className="mt-2 text-center" style={{ margin: "8px 0 0", fontFamily: MONO, fontSize: 10.5, color: ready ? PALETTE.right : PALETTE.inkSoft }}>
                {ready ? "✓ ready to seal" : `${checklist.length - missing.length}/${checklist.length} ready to seal`}
                {!last && ready ? " — photos & a letter are optional" : ""}
              </p>
            )}
            {writing && ready && !last && (
              <button type="button" onClick={trySeal} className="mt-1 block w-full text-center" style={{ minHeight: 36, fontFamily: UI, fontWeight: 800, fontSize: 13, color: PALETTE.wax }}>
                🔒 seal it now
              </button>
            )}
            {!writing && !locked && !last && (
              <button type="button" onClick={onSeal} className="mt-2 block w-full text-center" style={{ minHeight: 36, fontFamily: UI, fontWeight: 700, fontSize: 12.5, color: PALETTE.wax }}>
                save changes now
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
