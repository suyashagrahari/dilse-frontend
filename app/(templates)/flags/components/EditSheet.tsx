"use client";

// ─── Flags — the authoring form ──────────────────────────────────────────────
//
// THE PROBLEM THIS FILE EXISTS TO SOLVE
//
// Every other template asks for a handful of fields. This one asks for eleven
// statements, thirty-three responses and eleven verdicts — roughly 4x the
// writing of any other card we ship. A single scrolling wall of forty-four
// textareas is a guaranteed abandon: the sender opens it, scrolls, sees no end,
// and closes the tab.
//
// So the form is built around five things, in order of how much they matter:
//
//  1. ONE CARD AT A TIME. The deck is an accordion of short rows. Only the open
//     card shows its fields, so the visible surface is ~11 lines instead of 44
//     boxes. Progress is legible at a glance.
//  2. A FINITE, VISIBLE FINISH LINE. A sticky counter — "6 of 11 cards ready" —
//     plus a bar. Long forms are survivable; forms of unknown length are not.
//  3. EDIT, DON'T AUTHOR. The form opens pre-filled with the worked example, so
//     the job is rewriting a line that already exists rather than facing a blank
//     box. Every card can also be deleted: five good cards is a finished deck,
//     and the form says so out loud.
//  4. TELL THEM WHAT GOES IN THE BOX. Each of the three responses carries the
//     direction arrow, the choice colour, and a one-line brief that changes with
//     the card's truth ("they let you off — argue with them"). Blank-page
//     paralysis, not typing, is what actually stops people.
//  5. NEVER LOSE IT. Autosave on every keystroke, with a visible "saved" so the
//     sender knows they can leave. Resuming reopens the first unfinished card.
//
// And one hard warning: an empty response is the only input here that silently
// breaks the core mechanic — swipe that way and the card flips to nothing. It is
// flagged per response, per card row, and once more in a summary before Save.

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, PenLine, Eye, Lock, Loader2, Plus, Trash2, ChevronDown, AlertTriangle,
  Check, ArrowLeft, ArrowRight, ArrowUp, Camera, Info,
} from "lucide-react";
import {
  type FlagsData, type FlagCard, type EditMode, type SwipeChoice,
  SWIPE_CHOICES, CHOICE_LABEL, CHOICE_COLOR,
} from "./types";

const ACCENT = "#6C5CE7";
const ACCENT_SOFT = "#efedfd";
const ACCENT_LINE = "#e2ddf8";

const STATEMENT_MAX = 70;

const INPUT_CLS =
  "w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:outline-none focus:border-[#6C5CE7] text-sm transition-colors";
const INPUT_SM =
  "w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/50 focus:outline-none focus:border-[#6C5CE7] text-sm transition-colors";

interface Props {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  mf: FlagsData;
  updateMf: (key: keyof FlagsData, val: unknown) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
  /** Timestamp of the last autosave — drives the "saved" reassurance. */
  draftSavedAt?: number | null;
}

/** Direction metadata. The arrow is the whole point: it says which gesture
 *  produces this answer, which is the only thing that makes three boxes make
 *  sense instead of feeling like busywork. */
const DIRECTIONS: {
  choice: SwipeChoice;
  arrow: React.ReactNode;
  glyph: string;
  gesture: string;
}[] = [
  { choice: "red", arrow: <ArrowLeft size={13} />, glyph: "←", gesture: "swipe left" },
  { choice: "green", arrow: <ArrowRight size={13} />, glyph: "→", gesture: "swipe right" },
  { choice: "complicated", arrow: <ArrowUp size={13} />, glyph: "↑", gesture: "swipe up" },
];

/**
 * What to write, given what they just said and what you actually think.
 *
 * This is the single highest-leverage piece of copy in the form. Three empty
 * boxes labelled only "red / green / complicated" read as the same box three
 * times; a brief that changes with the truth makes each one a different, small,
 * answerable question.
 */
function brief(choice: SwipeChoice, truth: SwipeChoice): string {
  const agreed = choice === truth;
  if (choice === "red") {
    return agreed
      ? "They called it a red flag and they're right. Own it."
      : "They called it a red flag. Push back — or take it.";
  }
  if (choice === "green") {
    return agreed
      ? "They let it pass and so do you. Confirm it with a detail."
      : "They let you off. Tell them they shouldn't have.";
  }
  return agreed
    ? "They hedged, and honestly so do you. Say why it's genuinely complicated."
    : "They sat on the fence. Tell them it isn't complicated.";
}

const isFlagComplete = (c: FlagCard): boolean =>
  c.kind === "sincere"
    ? c.statement.trim().length > 0
    : c.statement.trim().length > 0 &&
      SWIPE_CHOICES.every((k) => c.responses[k].trim().length > 0);

const missingCount = (c: FlagCard): number =>
  c.kind === "sincere" ? 0 : SWIPE_CHOICES.filter((k) => !c.responses[k].trim()).length;

// ─── Small pieces ────────────────────────────────────────────────────────────

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
        <span>{label}</span>
        {hint && (
          <span className="inline-flex items-center gap-1 normal-case tracking-normal font-medium text-[10px] text-muted-foreground/80">
            <Info size={11} /> {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

/** Three dots — one per direction — filled when that response is written. The
 *  card row's whole status in twelve pixels, so the deck reads as a checklist. */
function ResponseDots({ card }: { card: FlagCard }) {
  if (card.kind === "sincere") {
    return (
      <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded" style={{ background: "#f3efe6", color: "#8a7a55" }}>
        sincere
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1" aria-hidden>
      {DIRECTIONS.map((d) => {
        const filled = card.responses[d.choice].trim().length > 0;
        return (
          <span
            key={d.choice}
            className="w-2 h-2 rounded-full"
            style={{
              background: filled ? CHOICE_COLOR[d.choice] : "transparent",
              border: `1.5px solid ${filled ? CHOICE_COLOR[d.choice] : "#cfcbc2"}`,
            }}
          />
        );
      })}
    </span>
  );
}

/** The sender's actual verdict. Same arrows and colours as the response fields
 *  above it, so "what I'd say" and "what I think" are visibly the same axis. */
function TruthPicker({ value, onChange }: { value: SwipeChoice; onChange: (v: SwipeChoice) => void }) {
  return (
    <div className="flex gap-1.5">
      {DIRECTIONS.map((d) => {
        const on = value === d.choice;
        return (
          <button
            key={d.choice}
            type="button"
            onClick={() => onChange(d.choice)}
            aria-pressed={on}
            className="flex-1 min-h-[44px] px-2 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wide inline-flex items-center justify-center gap-1 transition-colors"
            style={{
              background: on ? CHOICE_COLOR[d.choice] : "transparent",
              color: on ? "#fff" : CHOICE_COLOR[d.choice],
              border: `1.5px solid ${on ? CHOICE_COLOR[d.choice] : "#dcd8d0"}`,
            }}
          >
            {d.arrow} {CHOICE_LABEL[d.choice]}
          </button>
        );
      })}
    </div>
  );
}

// ─── One card ────────────────────────────────────────────────────────────────

function CardEditor({
  card, index, total, open, onToggle, onPatch, onDelete, onNext,
}: {
  card: FlagCard;
  index: number;
  total: number;
  open: boolean;
  onToggle: () => void;
  onPatch: (patch: Partial<FlagCard>) => void;
  onDelete: () => void;
  onNext: () => void;
}) {
  const complete = isFlagComplete(card);
  const missing = missingCount(card);
  const over = card.statement.length > STATEMENT_MAX;
  const near = card.statement.length > STATEMENT_MAX - 12;

  const setResponse = (k: SwipeChoice, v: string) =>
    onPatch({ responses: { ...card.responses, [k]: v } });

  const toggleSincere = () => {
    if (card.kind === "sincere") {
      onPatch({ kind: "flag" });
    } else {
      // Sincere cards are drag-locked and have no directions, so the three
      // responses can never be shown. Blank them rather than keep dead text
      // that would silently reappear if the sender toggled back.
      onPatch({ kind: "sincere", responses: { red: "", green: "", complicated: "" } });
    }
  };

  return (
    <div
      className="rounded-2xl border overflow-hidden transition-colors"
      style={{
        borderColor: open ? ACCENT : complete ? "#e4e1da" : "#f0d9b8",
        background: card.kind === "sincere" ? "#fbf8f1" : "#fff",
      }}
    >
      {/* Collapsed row — the whole deck reads as a checklist of these. */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center gap-2.5 px-3 py-3 text-left min-h-[52px]"
      >
        <span className="text-[10px] font-mono tabular-nums shrink-0 w-9 text-muted-foreground">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <span
          className="w-5 h-5 rounded-full grid place-items-center shrink-0"
          style={{
            background: complete ? "#e8f2ec" : "#fdf3e3",
            color: complete ? CHOICE_COLOR.green : "#a9750f",
          }}
        >
          {complete ? <Check size={12} /> : <AlertTriangle size={11} />}
        </span>
        <span className={`flex-1 text-sm leading-snug ${card.statement.trim() ? "" : "text-muted-foreground italic"}`}>
          {card.statement.trim() || "empty card — write a statement"}
        </span>
        <ResponseDots card={card} />
        <ChevronDown size={15} className="shrink-0 text-muted-foreground transition-transform" style={{ transform: open ? "rotate(180deg)" : "none" }} />
      </button>

      {!open && missing > 0 && card.statement.trim() && (
        <p className="px-3 pb-2.5 -mt-1 text-[11px] font-medium" style={{ color: "#a9750f" }}>
          {missing} of 3 answers missing
        </p>
      )}

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-4 space-y-4 border-t" style={{ borderColor: "#eeebe4" }}>
              {/* Statement */}
              <div className="pt-3.5">
                <div className="flex items-baseline justify-between mb-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    The statement about you
                  </label>
                  <span
                    className="text-[10px] font-mono tabular-nums"
                    style={{ color: over ? CHOICE_COLOR.red : near ? "#a9750f" : "#9a968d" }}
                  >
                    {card.statement.length}/{STATEMENT_MAX}
                  </span>
                </div>
                <textarea
                  value={card.statement}
                  onChange={(ev) => onPatch({ statement: ev.target.value.slice(0, STATEMENT_MAX) })}
                  rows={2}
                  maxLength={STATEMENT_MAX}
                  placeholder="takes 45 minutes to reply to anything"
                  className={INPUT_CLS + " resize-none"}
                />
                {near && (
                  <p className="text-[10px] mt-1" style={{ color: over ? CHOICE_COLOR.red : "#a9750f" }}>
                    {over ? "Too long — it will be cut." : "Nearly at the limit. Short statements read better on the card."}
                  </p>
                )}
              </div>

              {/* Sincere toggle */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={card.kind === "sincere"}
                  onChange={toggleSincere}
                  className="mt-0.5 w-4 h-4 shrink-0 accent-[#6C5CE7]"
                />
                <span>
                  <span className="text-xs font-semibold">Make this one sincere</span>
                  <span className="block text-[11px] text-muted-foreground leading-snug">
                    No swipe, no answers — it just sits there and gets read. One of these in a deck lands hard.
                  </span>
                </span>
              </label>

              {card.kind === "flag" ? (
                <>
                  {/* The three responses */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Your three answers — one per direction
                    </p>
                    {DIRECTIONS.map((d) => {
                      const val = card.responses[d.choice];
                      const empty = !val.trim();
                      return (
                        <div key={d.choice}>
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider"
                              style={{ color: CHOICE_COLOR[d.choice] }}
                            >
                              {d.arrow} {CHOICE_LABEL[d.choice]}
                              <span className="font-medium normal-case tracking-normal text-muted-foreground">
                                ({d.gesture})
                              </span>
                            </span>
                            {empty && (
                              <span className="text-[10px] font-semibold" style={{ color: "#a9750f" }}>
                                empty
                              </span>
                            )}
                          </div>
                          <textarea
                            value={val}
                            onChange={(ev) => setResponse(d.choice, ev.target.value)}
                            rows={2}
                            placeholder={brief(d.choice, card.truth)}
                            className="w-full px-3.5 py-2.5 rounded-xl text-sm resize-none focus:outline-none transition-colors bg-white"
                            style={{
                              border: `1.5px solid ${empty ? "#f0d9b8" : CHOICE_COLOR[d.choice] + "55"}`,
                              borderLeftWidth: 4,
                              borderLeftColor: CHOICE_COLOR[d.choice],
                            }}
                          />
                        </div>
                      );
                    })}
                    {missing > 0 && (
                      <p className="text-[11px] flex items-start gap-1.5" style={{ color: "#a9750f" }}>
                        <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                        A blank answer means that swipe flips the card to nothing. It is the one gap they will notice.
                      </p>
                    )}
                  </div>

                  {/* Truth */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      And honestly? Your real verdict
                    </p>
                    <TruthPicker value={card.truth} onChange={(t) => onPatch({ truth: t })} />
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      Shown at the bottom of the flipped card. If they disagree with you, it gets stamped OVERRULED.
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-[11px] text-muted-foreground italic leading-snug px-1">
                  Sincere cards have no directions, so there is nothing else to write. Just the sentence above.
                </p>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={onDelete}
                  className="min-h-[44px] px-3 rounded-xl border border-border/60 text-xs font-semibold text-muted-foreground inline-flex items-center gap-1.5"
                >
                  <Trash2 size={13} /> Delete
                </button>
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={onNext}
                  className="min-h-[44px] px-4 rounded-xl text-xs font-bold text-white inline-flex items-center gap-1.5"
                  style={{ background: ACCENT }}
                >
                  Next unfinished card <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── The sheet ───────────────────────────────────────────────────────────────

export default memo(function EditSheet({
  editMode, setEditMode, mf, updateMf, pagePassword, setPagePassword, onSave, saving, draftSavedAt,
}: Props) {
  const visible = editMode === "manual";

  const [openId, setOpenId] = useState<string | null>(null);
  const seqRef = useRef(0);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const cards = mf.cards;

  const ready = useMemo(() => cards.filter(isFlagComplete).length, [cards]);
  const gaps = useMemo(
    () => cards.filter((c) => c.kind === "flag" && c.statement.trim() && missingCount(c) > 0),
    [cards],
  );
  const blankStatements = useMemo(() => cards.filter((c) => !c.statement.trim()).length, [cards]);
  const pct = cards.length > 0 ? Math.round((ready / cards.length) * 100) : 0;

  // Reopening the sheet lands on the first unfinished card rather than the top.
  // Coming back to a half-written deck and having to hunt for where you stopped
  // is its own small reason to give up.
  useEffect(() => {
    if (!visible) return;
    setOpenId((prev) => prev ?? (cards.find((c) => !isFlagComplete(c))?.id ?? null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const scrollTo = useCallback((id: string) => {
    // rAF so the accordion has laid out before we measure it.
    requestAnimationFrame(() => {
      rowRefs.current[id]?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  }, []);

  const patchCard = useCallback(
    (id: string, patch: Partial<FlagCard>) =>
      updateMf("cards", cards.map((c) => (c.id === id ? { ...c, ...patch } : c))),
    [cards, updateMf],
  );

  const deleteCard = useCallback(
    (id: string) => {
      updateMf("cards", cards.filter((c) => c.id !== id));
      setOpenId((cur) => (cur === id ? null : cur));
    },
    [cards, updateMf],
  );

  const addCard = useCallback(() => {
    // Date.now + a monotonic counter: unique without Math.random, which is
    // banned anywhere that can influence a render (the deck seed reads ids).
    const id = `c${Date.now().toString(36)}${++seqRef.current}`;
    const next: FlagCard = {
      id,
      statement: "",
      truth: "red",
      kind: "flag",
      responses: { red: "", green: "", complicated: "" },
    };
    updateMf("cards", [...cards, next]);
    setOpenId(id);
    scrollTo(id);
  }, [cards, updateMf, scrollTo]);

  /** Jump to the next card that still needs work; if the deck is done, collapse. */
  const gotoNextUnfinished = useCallback(
    (fromId: string) => {
      const i = cards.findIndex((c) => c.id === fromId);
      const after = cards.slice(i + 1).find((c) => !isFlagComplete(c));
      const wrapped = after ?? cards.find((c) => !isFlagComplete(c) && c.id !== fromId);
      if (!wrapped) { setOpenId(null); return; }
      setOpenId(wrapped.id);
      scrollTo(wrapped.id);
    },
    [cards, scrollTo],
  );

  const jumpToFirstGap = useCallback(() => {
    const target = gaps[0] ?? cards.find((c) => !isFlagComplete(c));
    if (!target) return;
    setOpenId(target.id);
    scrollTo(target.id);
  }, [gaps, cards, scrollTo]);

  const setSender = (patch: Partial<FlagsData["sender"]>) => updateMf("sender", { ...mf.sender, ...patch });

  const onPhoto = (file: File) => {
    if (file.size > 3 * 1024 * 1024) { alert("Image too large. Please use one under 3MB."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setSender({ photoUrl: String(ev.target?.result ?? "") });
    reader.readAsDataURL(file);
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setEditMode("preview")}
            className="fixed inset-0 z-[60] bg-black/50"
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-[60] pointer-events-auto lg:flex lg:items-center lg:justify-center lg:inset-0 lg:bg-transparent"
          >
            <div
              ref={scrollRef}
              className="w-full max-w-2xl max-h-[86vh] lg:max-h-[92vh] overflow-y-auto bg-background rounded-t-3xl lg:rounded-3xl shadow-2xl mx-auto"
            >
              {/* Sticky head: handle, title, and the finish line. */}
              <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b" style={{ borderColor: ACCENT_LINE }}>
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-border" />
                </div>
                <div className="px-5 pb-3 pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold flex items-center gap-2">
                      <PenLine size={15} style={{ color: ACCENT }} /> Build your profile
                    </h3>
                    <button onClick={() => setEditMode("preview")} className="p-1 text-muted-foreground" aria-label="Close"><X size={20} /></button>
                  </div>

                  {/* The finish line. A long form is survivable; a form of unknown
                      length is what makes people close the tab. */}
                  <div className="flex items-center gap-2.5">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: ACCENT_SOFT }}>
                      <div className="h-full rounded-full transition-[width] duration-300" style={{ width: `${pct}%`, background: ACCENT }} />
                    </div>
                    <span className="text-[11px] font-semibold tabular-nums shrink-0" style={{ color: ACCENT }}>
                      {ready} of {cards.length} cards ready
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                    {draftSavedAt ? <><Check size={10} style={{ color: CHOICE_COLOR.green }} /> Saved — you can close this and come back.</> : "Everything you type is saved automatically."}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-8 pt-4 space-y-5">
                {/* ── Profile ───────────────────────────────────────────── */}
                <section className="space-y-3.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Your profile</h4>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <Field label="Your name *">
                        <input value={mf.sender.name} onChange={(e) => setSender({ name: e.target.value })} placeholder="e.g. Rohan" className={INPUT_CLS} />
                      </Field>
                    </div>
                    <Field label="Age">
                      <input
                        type="number" inputMode="numeric" min={13} max={120}
                        value={mf.sender.age}
                        onChange={(e) => setSender({ age: Number(e.target.value) || 0 })}
                        className={INPUT_CLS}
                      />
                    </Field>
                  </div>

                  <Field label="Tagline" hint="The line under your name. Sell yourself badly.">
                    <textarea value={mf.sender.tagline} onChange={(e) => setSender({ tagline: e.target.value })} rows={2} placeholder="Bad at texting, good at showing up." className={INPUT_CLS + " resize-none"} />
                  </Field>

                  <Field label="Photo" hint="Optional — without one you get a plain card with your initial.">
                    <div className="flex items-center gap-3">
                      <div
                        onClick={() => photoInputRef.current?.click()}
                        className="w-16 h-20 rounded-xl border-2 border-dashed border-border/60 cursor-pointer overflow-hidden grid place-items-center shrink-0"
                      >
                        {mf.sender.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={mf.sender.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Camera size={18} className="text-muted-foreground" />
                        )}
                        <input
                          ref={photoInputRef} type="file" accept="image/*" className="hidden"
                          onChange={(e) => { if (e.target.files?.[0]) onPhoto(e.target.files[0]); e.target.value = ""; }}
                        />
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <input
                          value={mf.sender.photoUrl.startsWith("data:") ? "" : mf.sender.photoUrl}
                          onChange={(e) => setSender({ photoUrl: e.target.value })}
                          placeholder={mf.sender.photoUrl.startsWith("data:") ? "Photo uploaded" : "…or paste an image URL"}
                          className={INPUT_SM}
                        />
                        {mf.sender.photoUrl && (
                          <button onClick={() => setSender({ photoUrl: "" })} className="text-[11px] text-muted-foreground underline">Remove photo</button>
                        )}
                      </div>
                    </div>
                  </Field>

                  <Field label="Their name" hint="Who's swiping.">
                    <input value={mf.recipientName} onChange={(e) => updateMf("recipientName", e.target.value)} placeholder="e.g. Ananya" className={INPUT_CLS} />
                  </Field>
                </section>

                {/* ── The deck ──────────────────────────────────────────── */}
                <section className="space-y-2.5">
                  <div className="flex items-baseline justify-between">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">The cards</h4>
                    <span className="text-[10px] text-muted-foreground">tap a card to open it</span>
                  </div>

                  {/* Said out loud, because "eleven cards" is the number that
                      makes people quit and a shorter deck is a real finish. */}
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Each card is one statement about you and three answers — one for each way they can swipe.
                    <strong className="text-foreground font-semibold"> Five good cards beat eleven rushed ones.</strong>{" "}
                    Delete any you don&apos;t want.
                  </p>

                  {/* The only warning that matters: an empty response is invisible
                      until the recipient swipes that way and gets a blank card. */}
                  {gaps.length > 0 && (
                    <div className="rounded-xl px-3 py-2.5 flex items-start gap-2" style={{ background: "#fdf6e8", border: "1px solid #f0d9b8" }}>
                      <AlertTriangle size={14} className="mt-0.5 shrink-0" style={{ color: "#a9750f" }} />
                      <div className="flex-1">
                        <p className="text-xs font-semibold" style={{ color: "#8a5f0c" }}>
                          {gaps.length} card{gaps.length === 1 ? "" : "s"} missing an answer
                        </p>
                        <p className="text-[11px] leading-snug" style={{ color: "#a9750f" }}>
                          Swipe that direction and the card flips to nothing.
                        </p>
                      </div>
                      <button onClick={jumpToFirstGap} className="text-[11px] font-bold shrink-0 self-center underline" style={{ color: "#8a5f0c" }}>
                        Fix it
                      </button>
                    </div>
                  )}

                  <div className="space-y-2">
                    {cards.map((c, i) => (
                      <div key={c.id} ref={(el) => { rowRefs.current[c.id] = el; }}>
                        <CardEditor
                          card={c}
                          index={i}
                          total={cards.length}
                          open={openId === c.id}
                          onToggle={() => setOpenId((cur) => (cur === c.id ? null : c.id))}
                          onPatch={(patch) => patchCard(c.id, patch)}
                          onDelete={() => deleteCard(c.id)}
                          onNext={() => gotoNextUnfinished(c.id)}
                        />
                      </div>
                    ))}
                  </div>

                  {cards.length === 0 && (
                    <p className="text-xs text-muted-foreground italic py-2">
                      No cards yet. Add at least one.
                    </p>
                  )}
                  {blankStatements > 0 && (
                    <p className="text-[11px]" style={{ color: "#a9750f" }}>
                      {blankStatements} card{blankStatements === 1 ? " has" : "s have"} no statement — {blankStatements === 1 ? "it" : "they"} won&apos;t be shown.
                    </p>
                  )}

                  <button
                    onClick={addCard}
                    className="w-full min-h-[44px] rounded-xl border-2 border-dashed inline-flex items-center justify-center gap-1.5 text-sm font-semibold"
                    style={{ borderColor: ACCENT_LINE, color: ACCENT }}
                  >
                    <Plus size={15} /> Add a card
                  </button>
                </section>

                {/* ── The last card ─────────────────────────────────────── */}
                <section className="space-y-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">The last card</h4>
                  <Field label="One more thing" hint="No game, no swipe. Just the sentence you end on.">
                    <textarea
                      value={mf.finalCard}
                      onChange={(e) => updateMf("finalCard", e.target.value)}
                      rows={3}
                      placeholder="You just spent eleven cards judging me. Thanks for staying."
                      className={INPUT_CLS + " resize-none"}
                    />
                  </Field>
                </section>

                {/* ── Password ──────────────────────────────────────────── */}
                <Field label="Password (optional)" hint="If set, the link asks for it before opening.">
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input value={pagePassword} onChange={(e) => setPagePassword(e.target.value)} placeholder="Leave empty for no password" className={INPUT_CLS + " pl-10"} />
                  </div>
                </Field>

                <button
                  onClick={onSave}
                  disabled={saving || !mf.sender.name.trim()}
                  className="w-full min-h-[52px] rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: ACCENT }}
                >
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Eye size={16} /> Save &amp; preview</>}
                </button>
                <p className="text-center text-[11px] text-muted-foreground">
                  {gaps.length > 0
                    ? `You can preview with ${gaps.length} gap${gaps.length === 1 ? "" : "s"} — they'll show as blank card backs.`
                    : "Swipe through it yourself, then publish to get your link."}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
