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
  X, Eye, Lock, Loader2, Plus, Trash2, ChevronDown, AlertTriangle,
  Check, ArrowLeft, ArrowRight, ArrowUp, Info,
} from "lucide-react";
import {
  type FlagsData, type FlagCard, type EditMode, type SwipeChoice,
  SWIPE_CHOICES, CHOICE_LABEL, CHOICE_COLOR, CHOICE_EMOJI,
} from "./types";
import { pickTheme } from "../../_love/theme";
import { FormSection, MemoriesSections, ThemeSection } from "../../_love/editor/LoveKitSections";
import type { LoveKitData } from "../../_love/types";
import { FLAGS_THEMES } from "./themes";
import { missingFields } from "../hooks/useFlagsEditor";

// The form follows the vibe they picked: every accent below is the theme's
// first gradient stop, set once as --fl-acc on the sheet root.
const ACCENT = "var(--fl-acc)";
const ACCENT_SOFT = "color-mix(in srgb, var(--fl-acc) 12%, white)";
const ACCENT_LINE = "color-mix(in srgb, var(--fl-acc) 26%, white)";

const STATEMENT_MAX = 70;

const INPUT_CLS =
  "w-full px-4 py-3 rounded-xl bg-muted/50 border border-border/50 focus:outline-none focus:border-[color:var(--fl-acc)] text-sm transition-colors";

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
    ? "They called it beige — and honestly, it is. Say why it's complicated."
    : "They called it beige. Tell them it's not that complicated.";
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
                  className="mt-0.5 w-4 h-4 shrink-0 accent-[color:var(--fl-acc)]"
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
                              {d.arrow} {CHOICE_LABEL[d.choice]} {CHOICE_EMOJI[d.choice]}
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

const STEPS = [
  { id: "vibe", emoji: "🎨", label: "Vibe" },
  { id: "you", emoji: "🙋", label: "You" },
  { id: "cards", emoji: "🚩", label: "Cards" },
  { id: "pics", emoji: "📸", label: "Pics & letter" },
  { id: "finish", emoji: "🔒", label: "Finish" },
] as const;
type StepId = (typeof STEPS)[number]["id"];

export default memo(function EditSheet({
  editMode, setEditMode, mf, updateMf, pagePassword, setPagePassword, onSave, saving, draftSavedAt,
}: Props) {
  const visible = editMode === "manual";
  const theme = pickTheme(FLAGS_THEMES, mf.theme);

  const [openId, setOpenId] = useState<string | null>(null);
  const [tried, setTried] = useState(false);
  const seqRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const stepRefs = useRef<Partial<Record<StepId, HTMLElement | null>>>({});

  const cards = mf.cards;

  const ready = useMemo(() => cards.filter(isFlagComplete).length, [cards]);
  const gaps = useMemo(
    () => cards.filter((c) => c.kind === "flag" && c.statement.trim() && missingCount(c) > 0),
    [cards],
  );
  const blankStatements = useMemo(() => cards.filter((c) => !c.statement.trim()).length, [cards]);
  const missing = useMemo(() => missingFields(mf), [mf]);
  const miss = (k: "name" | "recipient" | "cards" | "letter") => tried && missing.some((m) => m.key === k);

  const stepDone: Record<StepId, boolean> = {
    vibe: true,
    you: !!mf.sender.name.trim() && !!mf.recipientName.trim(),
    cards: ready > 0 && gaps.length === 0,
    pics: mf.photos.length > 0 && !!mf.letter.trim(),
    finish: !!mf.finalCard.trim(),
  };
  const doneCount = Object.values(stepDone).filter(Boolean).length;
  const pct = Math.round((doneCount / STEPS.length) * 100);

  // Reopening the sheet lands on the first unfinished card rather than the top.
  useEffect(() => {
    if (!visible) return;
    setTried(false);
    setOpenId((prev) => prev ?? (cards.find((c) => !isFlagComplete(c))?.id ?? null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const scrollTo = useCallback((id: string) => {
    requestAnimationFrame(() => {
      rowRefs.current[id]?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  }, []);

  const jumpStep = useCallback((id: StepId) => {
    const el = stepRefs.current[id];
    const box = scrollRef.current;
    if (!el || !box) return;
    box.scrollTo({ top: el.offsetTop - 132, behavior: "smooth" });
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
  const updateKit = <K extends keyof LoveKitData>(key: K, val: LoveKitData[K]) => updateMf(key, val);

  const save = () => {
    setTried(true);
    const first = missing[0];
    if (first) {
      const step: StepId = first.key === "name" || first.key === "recipient" ? "you" : first.key === "cards" ? "cards" : "pics";
      jumpStep(step);
    }
    onSave();
  };

  const err = (on: boolean) => (on ? { borderColor: "#e11d48", boxShadow: "0 0 0 3px rgba(225,29,72,.12)" } : undefined);
  const ErrText = ({ on, children }: { on: boolean; children: React.ReactNode }) =>
    on ? <p className="text-[11px] font-semibold mt-1" style={{ color: "#e11d48" }}>{children}</p> : null;

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
            className="fixed bottom-0 left-0 right-0 z-[60] pointer-events-none lg:flex lg:items-center lg:justify-center lg:inset-0"
            data-flags-sheet
            style={{ ["--fl-acc" as string]: theme.colors.a1 }}
          >
            <div
              ref={scrollRef}
              data-sheet-scroll
              className="pointer-events-auto w-full max-w-2xl max-h-[88dvh] lg:max-h-[92vh] overflow-y-auto overflow-x-hidden bg-background rounded-t-[28px] lg:rounded-[28px] shadow-2xl mx-auto overscroll-contain"
            >
              {/* Sticky head: handle, title, the finish line and the step chips. */}
              <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b" style={{ borderColor: ACCENT_LINE }}>
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-border" />
                </div>
                <div className="px-5 pb-3 pt-1">
                  <div className="flex items-center justify-between mb-2 gap-3">
                    <div className="min-w-0">
                      <h3 className="text-[17px] font-extrabold leading-tight flex items-center gap-2">
                        Build your profile <span aria-hidden>🚩💚</span>
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                        {draftSavedAt ? <><Check size={11} style={{ color: CHOICE_COLOR.green }} /> Autosaved — close it anytime, it&apos;ll be here.</> : "Everything you type saves automatically."}
                      </p>
                    </div>
                    <button onClick={() => setEditMode("preview")} className="w-10 h-10 grid place-items-center rounded-full hover:bg-muted text-muted-foreground shrink-0" aria-label="Close"><X size={20} /></button>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: ACCENT_SOFT }}>
                      <div className="h-full rounded-full transition-[width] duration-300" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${theme.colors.a1}, ${theme.colors.a2}, ${theme.colors.a3})` }} />
                    </div>
                    <span className="text-[11px] font-bold tabular-nums shrink-0" style={{ color: ACCENT }}>
                      {doneCount}/{STEPS.length} steps
                    </span>
                  </div>

                  <div className="flex gap-1.5 mt-2.5 overflow-x-auto -mx-5 px-5 pb-0.5" style={{ scrollbarWidth: "none" }}>
                    {STEPS.map((st, k) => {
                      const done = stepDone[st.id];
                      const bad = tried && !done && st.id !== "finish";
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => jumpStep(st.id)}
                          className="shrink-0 inline-flex items-center gap-1.5 rounded-full pl-2 pr-3 min-h-[34px] text-[12px] font-bold border transition-colors"
                          style={{
                            borderColor: bad ? "#fecdd3" : done ? ACCENT_LINE : "#ece8e1",
                            background: bad ? "#fff1f2" : done ? ACCENT_SOFT : "transparent",
                            color: bad ? "#be123c" : "inherit",
                          }}
                        >
                          <span className="w-5 h-5 rounded-full grid place-items-center text-[10px] text-white" style={{ background: done ? ACCENT : bad ? "#e11d48" : "#cfc9bf" }}>
                            {done ? <Check size={11} /> : k + 1}
                          </span>
                          {st.emoji} {st.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="px-5 pb-10 pt-4 space-y-8">
                {/* ── 1. Vibe ───────────────────────────────────────────── */}
                <div ref={(el) => { stepRefs.current.vibe = el; }}>
                  <ThemeSection themes={FLAGS_THEMES} value={theme.id} onChange={(id) => updateMf("theme", id)} />
                </div>

                {/* ── 2. You ────────────────────────────────────────────── */}
                <div ref={(el) => { stepRefs.current.you = el; }}>
                  <FormSection emoji="🙋" title="Your dating profile" note="The first screen they see — make it very you.">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <Field label="Your name *">
                          <input value={mf.sender.name} onChange={(e) => setSender({ name: e.target.value.slice(0, 80) })} placeholder="e.g. Rohan" className={INPUT_CLS} style={{ fontSize: 16, ...err(miss("name")) }} aria-invalid={miss("name")} />
                        </Field>
                        <ErrText on={miss("name")}>Add your name — it goes on the profile.</ErrText>
                      </div>
                      <Field label="Age">
                        <input
                          type="number" inputMode="numeric" min={13} max={120}
                          value={mf.sender.age}
                          onChange={(e) => setSender({ age: Number(e.target.value) || 0 })}
                          className={INPUT_CLS}
                          style={{ fontSize: 16 }}
                        />
                      </Field>
                    </div>

                    <Field label="Bio" hint="Sell yourself badly. That's the bit.">
                      <textarea value={mf.sender.tagline} onChange={(e) => setSender({ tagline: e.target.value.slice(0, 240) })} rows={2} placeholder="6'1&quot; because apparently that matters. bad at texting, elite at showing up." className={INPUT_CLS + " resize-none"} style={{ fontSize: 16 }} />
                      <p className="text-right text-[10px] text-muted-foreground tabular-nums mt-0.5">{mf.sender.tagline.length}/240</p>
                    </Field>

                    <div>
                      <Field label="Their name *" hint="The one doing the swiping.">
                        <input value={mf.recipientName} onChange={(e) => updateMf("recipientName", e.target.value.slice(0, 80))} placeholder="e.g. Ananya" className={INPUT_CLS} style={{ fontSize: 16, ...err(miss("recipient")) }} aria-invalid={miss("recipient")} />
                      </Field>
                      <ErrText on={miss("recipient")}>Who&apos;s swiping? Their name goes on the verdict.</ErrText>
                    </div>

                    {mf.sender.photoUrl && mf.photos.length === 0 && (
                      <p className="text-[11px] text-muted-foreground rounded-xl bg-muted/40 px-3 py-2">
                        Your old profile photo is still used. Add pics in step 4 to get the full photo carousel.
                      </p>
                    )}
                  </FormSection>
                </div>

                {/* ── 3. The deck ───────────────────────────────────────── */}
                <div ref={(el) => { stepRefs.current.cards = el; }} className="space-y-2.5">
                  <FormSection emoji="🚩" title={`Your flags — ${ready}/${cards.length} ready`} note="One statement about you + a reply for each way they can swipe. Five good cards beat eleven rushed ones.">
                    <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
                      {DIRECTIONS.map((d) => (
                        <span key={d.choice} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1" style={{ background: CHOICE_COLOR[d.choice] + "14", color: CHOICE_COLOR[d.choice] }}>
                          {d.glyph} {CHOICE_EMOJI[d.choice]} {CHOICE_LABEL[d.choice].toLowerCase()}
                        </span>
                      ))}
                    </div>
                  </FormSection>

                  {miss("cards") && <ErrText on>Write at least one card — the deck needs something to swipe on.</ErrText>}

                  {gaps.length > 0 && (
                    <div className="rounded-xl px-3 py-2.5 flex items-start gap-2" style={{ background: "#fdf6e8", border: "1px solid #f0d9b8" }}>
                      <AlertTriangle size={14} className="mt-0.5 shrink-0" style={{ color: "#a9750f" }} />
                      <div className="flex-1">
                        <p className="text-xs font-semibold" style={{ color: "#8a5f0c" }}>
                          {gaps.length} card{gaps.length === 1 ? "" : "s"} missing a reply
                        </p>
                        <p className="text-[11px] leading-snug" style={{ color: "#a9750f" }}>
                          Swipe that way and the card flips to nothing.
                        </p>
                      </div>
                      <button onClick={jumpToFirstGap} className="text-[11px] font-bold shrink-0 self-center underline min-h-[32px]" style={{ color: "#8a5f0c" }}>
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
                    <p className="text-xs text-muted-foreground italic py-2">No cards yet — add one below. 👇</p>
                  )}
                  {blankStatements > 0 && (
                    <p className="text-[11px]" style={{ color: "#a9750f" }}>
                      {blankStatements} card{blankStatements === 1 ? " has" : "s have"} no statement — {blankStatements === 1 ? "it" : "they"} won&apos;t be shown.
                    </p>
                  )}

                  <button
                    onClick={addCard}
                    disabled={cards.length >= 24}
                    className="w-full min-h-[48px] rounded-2xl border-2 border-dashed inline-flex items-center justify-center gap-1.5 text-sm font-bold disabled:opacity-40"
                    style={{ borderColor: ACCENT_LINE, color: ACCENT }}
                  >
                    <Plus size={15} /> Add a flag
                  </button>
                </div>

                {/* ── 4. Pics, GIFs, letter ─────────────────────────────── */}
                <div ref={(el) => { stepRefs.current.pics = el; }} className="space-y-6">
                  {mf.photos.length === 0 && (
                    <div className="rounded-2xl px-3.5 py-3 text-[12px] leading-snug" style={{ background: ACCENT_SOFT, color: "inherit" }}>
                      <b>💡 Your pics become your dating profile.</b> Add 5–10 of you two — each one gets a flag sticker, and its note shows as a prompt card like <i>&ldquo;the moment I knew…&rdquo;</i>.
                    </div>
                  )}
                  <MemoriesSections
                    data={mf}
                    update={updateKit}
                    gifTags={["funny", "love", "yes"]}
                    copy={{
                      photosTitle: `Your pics = your profile (${mf.photos.length}/10)`,
                      photosNote: "Tap a photo to crop & zoom it, swap it, move it. The caption sits on the photo; the note becomes a prompt card.",
                      captionHint: "caption — e.g. golden hour, first date",
                      noteHint: "the moment I knew… (shows as a prompt card)",
                      gifsTitle: "GIFs — 1st on the verdict, 2nd with the letter, 3rd on the sincere card",
                      letterTitle: "Your match letter 💚 *",
                      letterNote: "The payoff. It opens on the final “It's a match” screen, after they answer your question.",
                      letterHint: "Write it like they're reading it at 2am… red flags and all, I'd swipe right on you every time.",
                      lockQuestion: "swipe right on me for another year?",
                      lockAnswer: "obviously 💚",
                    }}
                  />
                  <ErrText on={miss("letter")}>Your match letter is empty — it&apos;s the whole payoff.</ErrText>
                </div>

                {/* ── 5. Finish ─────────────────────────────────────────── */}
                <div ref={(el) => { stepRefs.current.finish = el; }}>
                  <FormSection emoji="🔒" title="Last line + privacy" note="Almost done.">
                    <Field label="Your opening line on the match screen" hint="Shows as a chat bubble from you.">
                      <textarea
                        value={mf.finalCard}
                        onChange={(e) => updateMf("finalCard", e.target.value.slice(0, 1000))}
                        rows={3}
                        placeholder="You just spent eleven cards judging me and still gave me a 96. Thanks for staying."
                        className={INPUT_CLS + " resize-none"}
                        style={{ fontSize: 16 }}
                      />
                    </Field>

                    <Field label="Password (optional)" hint="If set, the link asks for it first.">
                      <div className="relative">
                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input value={pagePassword} onChange={(e) => setPagePassword(e.target.value)} placeholder="Leave empty for no password" className={INPUT_CLS + " pl-10"} style={{ fontSize: 16 }} />
                      </div>
                    </Field>
                  </FormSection>
                </div>

                {tried && missing.length > 0 && (
                  <div className="rounded-2xl px-3.5 py-3" style={{ background: "#fff1f2", border: "1px solid #fecdd3" }}>
                    <p className="text-[13px] font-bold" style={{ color: "#be123c" }}>Almost there — still missing:</p>
                    <ul className="mt-1 space-y-0.5">
                      {missing.map((m) => (
                        <li key={m.key} className="text-[12px]" style={{ color: "#9f1239" }}>• {m.label} — {m.hint.toLowerCase()}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="sticky bottom-0 -mx-5 px-5 pt-3 pb-4 bg-gradient-to-t from-background via-background to-transparent">
                  <button
                    onClick={save}
                    disabled={saving}
                    className="w-full min-h-[56px] rounded-full text-white font-extrabold text-[15px] flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
                    style={{ background: `linear-gradient(115deg, ${theme.colors.a1}, ${theme.colors.a2} 55%, ${theme.colors.a3})` }}
                  >
                    {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Eye size={16} /> Save &amp; preview my profile</>}
                  </button>
                  <p className="text-center text-[11px] text-muted-foreground mt-2">
                    {gaps.length > 0
                      ? `You can preview with ${gaps.length} gap${gaps.length === 1 ? "" : "s"} — they'll show as blank replies.`
                      : "Swipe through it yourself, then publish to get your link."}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});
