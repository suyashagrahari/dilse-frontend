"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronDown, Check, Lock, Gavel, Loader2, Sparkles, RotateCcw, Languages, BookOpen, AlertCircle } from "lucide-react";
import { FormSection, MemoriesSections, ThemeSection } from "../../_love/editor/LoveKitSections";
import { COURT_THEMES } from "./themes";
import { DEFAULT_LOCK_ANSWER, DEFAULT_LOCK_QUESTION, PASS_RATIO, type CourtOfLoveData, type EditMode, type QuizQuestion } from "./types";
import type { CourtFieldError } from "../hooks/useCourtOfLoveEditor";

const SURFACE = "#FFFFFF";
const BG_ALT = "#F3F1EA";
const TEXT = "#0E0E12";
const MUTED = "#5B5B66";
const BORDER = "#ECEAE3";
const INDIGO = "#6C5CE7";
const PINK = "#F72585";
const GREEN = "#3AA76D";
const ERR = "#E5484D";

const HEAD = "var(--font-space-grotesk), ui-sans-serif, system-ui, sans-serif";
const BODY = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";

/**
 * ── THE DESKTOP LAYOUT ───────────────────────────────────────────────────────
 *
 * This is a phone sheet — `fixed; left: 0; right: 0; bottom: 0` — and on a
 * desktop it was still exactly that: pinned to the full width of the window, so
 * "Your name" rendered as a single input nearly two thousand pixels wide with
 * one word in it, and the whole form became a mile-long single column that
 * needed six scrolls to cross.
 *
 * The fix is not to squeeze the phone layout: it is to stop being a bottom sheet
 * at all above 900px. There it becomes a centred dialog with a real maximum
 * width, and the body becomes two columns, so short fields pair up and only the
 * things that deserve the full span — the story box, the letter — take it.
 *
 * Media queries cannot live in inline styles, so the responsive half is these
 * classes and the rest stays inline, matching the file's existing style.
 *
 * `col-span` is the escape hatch a child uses to take the whole row.
 */
const SHEET_CSS = `
.col-sheet {
  position: fixed;
  left: 0; right: 0; bottom: 0;
  z-index: 201;
  max-height: 92dvh;
  display: flex;
  flex-direction: column;
  border-top-left-radius: 28px;
  border-top-right-radius: 28px;
}
.col-body { overflow-y: auto; padding: 16px 18px 8px; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; }
.col-sec { margin-top: 26px; padding-top: 18px; border-top: 1px solid #ECEAE3; margin-bottom: 4px; }
.col-steps { display: flex; gap: 6px; overflow-x: auto; margin: 10px -18px 0; padding: 0 18px 2px; scrollbar-width: none; }
.col-steps::-webkit-scrollbar { display: none; }
.col-step { flex-shrink: 0; display: inline-flex; align-items: center; gap: 6px; padding: 6px 11px 6px 6px; border-radius: 999px; border: 1px solid #ECEAE3; background: #F7F5EF; font: 600 12px/1 var(--font-inter), system-ui, sans-serif; color: #3b3b44; cursor: pointer; white-space: nowrap; }
.col-step:hover { border-color: #d8c9a8; }
.col-step-num { width: 20px; height: 20px; border-radius: 999px; display: grid; place-items: center; background: #fff; border: 1px solid #e3ded2; font-size: 10.5px; font-weight: 700; color: #7a1f16; }
.col-step[data-done] .col-step-num { background: #3AA76D; border-color: #3AA76D; color: #fff; }
.col-kit textarea, .col-kit input { font-family: var(--font-inter), system-ui, sans-serif; }
.col-foot { padding: 12px 18px calc(env(safe-area-inset-bottom, 0px) + 14px); }
.col-save { width: 100%; }

@media (min-width: 900px) {
  .col-sheet {
    /* Centred dialog, not a sheet. Pinning all four sides and letting the
       margins be auto centres it on both axes without a transform, which
       would blur the text on some GPUs. */
    top: 0;
    left: 0; right: 0; bottom: 0;
    margin: auto;
    width: min(1040px, calc(100vw - 64px));
    height: max-content;
    max-height: 88dvh;
    border-radius: 30px;
    overflow: hidden;
  }
  .col-body {
    padding: 20px 26px 10px;
    /* Two even columns that are allowed to be narrower than their content —
       without minmax(0, …) a long unbroken word in a textarea would push the
       column wider than its share and knock the grid out of alignment. */
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 20px;
    align-content: start;
  }
  /* The fields carry their own bottom margin, so the grid supplies no row gap. */
  .col-span { grid-column: 1 / -1; }
  .col-questions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 14px;
    align-items: start;
  }
  .col-steps { margin: 12px -26px 0; padding: 0 26px 2px; }
  .col-foot { padding: 14px 26px 18px; display: flex; flex-direction: column; align-items: center; }
  .col-save { width: min(460px, 100%); }
}
`;

const label: React.CSSProperties = {
  fontFamily: BODY,
  fontSize: 11.5,
  fontWeight: 700,
  letterSpacing: 0.6,
  color: MUTED,
  textTransform: "uppercase",
  display: "block",
  marginBottom: 6,
};

const field: React.CSSProperties = {
  width: "100%",
  padding: "12px 13px",
  borderRadius: 16,
  background: BG_ALT,
  border: `1px solid ${BORDER}`,
  fontFamily: BODY,
  fontSize: 14.5,
  color: TEXT,
  outline: "none",
  minHeight: 46,
};

/** Inline error under a field, announced to screen readers. */
function FieldError({ id, text }: { id: string; text?: string }) {
  if (!text) return null;
  return (
    <p id={id} role="alert" style={{ fontFamily: BODY, fontSize: 12, fontWeight: 600, color: ERR, margin: "6px 0 0", display: "flex", gap: 5, alignItems: "center" }}>
      <AlertCircle size={13} /> {text}
    </p>
  );
}

/** Live "12/80" counter, shown once the field is past half full. */
function Counter({ value, max }: { value: string; max?: number }) {
  if (!max || value.length < max * 0.5) return null;
  return (
    <span style={{ fontFamily: BODY, fontSize: 10.5, color: value.length >= max ? ERR : MUTED, fontVariantNumeric: "tabular-nums" }}>
      {value.length}/{max}
    </span>
  );
}

function Field({
  labelText,
  value,
  onChange,
  placeholder,
  hint,
  maxLength,
  span = false,
  required = false,
  error,
  id,
}: {
  labelText: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  maxLength?: number;
  /** Take the full row on desktop instead of half of it. */
  span?: boolean;
  required?: boolean;
  error?: string;
  id?: string;
}) {
  const errId = id ? `${id}-err` : undefined;
  return (
    <div className={span ? "col-span" : undefined} style={{ marginBottom: 15 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <label htmlFor={id} style={label}>
          {labelText}
          {required && <span style={{ color: PINK, marginLeft: 3 }}>*</span>}
        </label>
        <Counter value={value} max={maxLength} />
      </div>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        dir="auto"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errId : undefined}
        style={{ ...field, ...(error ? { border: `1px solid ${ERR}`, boxShadow: `0 0 0 3px ${ERR}22`, background: "#FFF6F7" } : null) }}
      />
      {errId && <FieldError id={errId} text={error} />}
      {hint && !error && (
        <p style={{ fontFamily: BODY, fontSize: 11.5, color: MUTED, margin: "5px 0 0" }}>{hint}</p>
      )}
    </div>
  );
}

function TextArea({
  labelText,
  value,
  onChange,
  placeholder,
  rows = 5,
  maxLength,
  hint,
  span = false,
}: {
  labelText: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  hint?: string;
  /** Take the full row on desktop instead of half of it. */
  span?: boolean;
}) {
  return (
    <div className={span ? "col-span" : undefined} style={{ marginBottom: 15 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <label style={label}>{labelText}</label>
        <Counter value={value} max={maxLength} />
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        dir="auto"
        style={{ ...field, resize: "vertical", lineHeight: 1.6 }}
      />
      {hint && (
        <p style={{ fontFamily: BODY, fontSize: 11.5, color: MUTED, margin: "5px 0 0" }}>{hint}</p>
      )}
    </div>
  );
}

/**
 * One collapsible question editor. Ten questions × four options is 40 inputs, so
 * they stay folded by default — an accordion keeps the sheet navigable on a phone
 * instead of becoming an endless scroll.
 */
function QuestionAccordion({
  q,
  index,
  open,
  onToggle,
  onPatch,
  onOption,
}: {
  q: QuizQuestion;
  index: number;
  open: boolean;
  onToggle: () => void;
  onPatch: (patch: Partial<QuizQuestion>) => void;
  onOption: (optIndex: number, value: string) => void;
}) {
  return (
    <div
      style={{
        border: `1px solid ${BORDER}`,
        borderRadius: 20,
        marginBottom: 10,
        overflow: "hidden",
        background: SURFACE,
      }}
    >
      <button
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "13px 14px",
          background: open ? "rgba(108,92,231,.05)" : SURFACE,
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          minHeight: 50,
        }}
      >
        <span
          style={{
            flexShrink: 0,
            width: 26,
            height: 26,
            borderRadius: 999,
            background: "rgba(108,92,231,.11)",
            color: INDIGO,
            display: "grid",
            placeItems: "center",
            fontFamily: HEAD,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {index + 1}
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              display: "block",
              fontFamily: HEAD,
              fontSize: 13.5,
              fontWeight: 700,
              color: TEXT,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {q.exhibit || `Question ${index + 1}`}
          </span>
          <span
            style={{
              display: "block",
              fontFamily: BODY,
              fontSize: 11.5,
              color: MUTED,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {q.question || "No question yet"}
          </span>
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} style={{ flexShrink: 0, color: MUTED }}>
          <ChevronDown size={17} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "4px 14px 16px" }}>
              <Field
                labelText="Topic"
                value={q.exhibit}
                onChange={(v) => onPatch({ exhibit: v })}
                placeholder="How we met"
                maxLength={60}
              />
              <TextArea
                labelText="The question"
                value={q.question}
                onChange={(v) => onPatch({ question: v })}
                placeholder="Where did we first meet?"
                rows={2}
                maxLength={300}
              />

              <label style={label}>Options — tap the circle to mark the correct one</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                {q.options.map((opt, j) => {
                  const isRight = q.allCorrect || q.correctIndex === j;
                  return (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <button
                        onClick={() => onPatch({ correctIndex: j, allCorrect: false })}
                        aria-label={`Mark option ${String.fromCharCode(65 + j)} as correct`}
                        aria-pressed={isRight}
                        style={{
                          flexShrink: 0,
                          width: 30,
                          height: 30,
                          borderRadius: 999,
                          background: isRight ? GREEN : SURFACE,
                          border: `1px solid ${isRight ? GREEN : BORDER}`,
                          color: isRight ? "#fff" : MUTED,
                          display: "grid",
                          placeItems: "center",
                          cursor: "pointer",
                          fontFamily: HEAD,
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {isRight ? <Check size={14} /> : String.fromCharCode(65 + j)}
                      </button>
                      <input
                        value={opt}
                        onChange={(e) => onOption(j, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + j)}`}
                        maxLength={200}
                        dir="auto"
                        style={{ ...field, minHeight: 42 }}
                      />
                    </div>
                  );
                })}
              </div>

              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 9,
                  padding: "11px 12px",
                  borderRadius: 16,
                  background: BG_ALT,
                  border: `1px solid ${BORDER}`,
                  cursor: "pointer",
                  marginBottom: 14,
                }}
              >
                <input
                  type="checkbox"
                  checked={q.allCorrect}
                  onChange={(e) => onPatch({ allCorrect: e.target.checked })}
                  style={{ marginTop: 2, width: 17, height: 17, accentColor: INDIGO, flexShrink: 0 }}
                />
                <span>
                  <span style={{ display: "block", fontFamily: HEAD, fontSize: 13, fontWeight: 700, color: TEXT }}>
                    Every answer is correct
                  </span>
                  <span style={{ display: "block", fontFamily: BODY, fontSize: 11.5, color: MUTED, lineHeight: 1.5 }}>
                    Sweet trick for the last question — whatever they pick, the Court agrees.
                  </span>
                </span>
              </label>

              <Field
                labelText="If they get it right"
                value={q.correctNote}
                onChange={(v) => onPatch({ correctNote: v })}
                placeholder="The Court agrees."
                maxLength={200}
              />
              <Field
                labelText="If they get it wrong"
                value={q.wrongNote}
                onChange={(v) => onPatch({ wrongNote: v })}
                placeholder="Koi baat nahi — noted for the record."
                maxLength={200}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const MIN_STORY_CHARS = 20;
const MAX_STORY_CHARS = 4000;

/**
 * One-tap openers for the story box.
 *
 * A blank textarea under "tell us your story" is the hardest thing on this form.
 * The placeholder asked three questions at once and then vanished the moment
 * anyone typed a character, so the prompt disappeared exactly when it started
 * being useful. These stay on screen.
 *
 * They are STARTERS, not templates: each one drops a half-finished sentence in
 * and puts the cursor at the end, so the sender is finishing their own sentence
 * rather than filling in a form. Tapping a second one appends, because most
 * people have more than one of these to say and retyping the first is a tax.
 */
const STORY_STARTERS: { label: string; text: string }[] = [
  { label: "How we met", text: "We first met " },
  { label: "Their excuse", text: "They always say " },
  { label: "What they order", text: "They order " },
  { label: "We argue about", text: "We always argue about " },
  { label: "Our song", text: "Our song is " },
  { label: "In Hinglish", text: "hum pehli baar " },
];

/**
 * "Tell the Court your story" — the AI entry point.
 *
 * The sender writes freely in whatever language they think in; the server reads
 * the language and script off the story itself and writes the whole case file to
 * match. Everything it produces lands in the form below as ordinary editable
 * text, so this is a head start, never a black box.
 */
function StoryBox({
  story,
  setStory,
  generating,
  generatedLanguage,
  hasGenerated,
  onGenerate,
  savedStory,
  savedStoryLabel,
}: {
  story: string;
  setStory: (v: string) => void;
  generating: boolean;
  generatedLanguage: string | null;
  hasGenerated: boolean;
  onGenerate: () => void;
  /**
   * The story this sender already saved on another template, or null.
   *
   * Null whenever they are signed out — there is nothing to offer, and an
   * "already written it" button that turns out to mean "sign in first" is worse
   * than no button. Signed-in-with-nothing-saved is null too.
   */
  savedStory: string | null;
  /** What to call it on the button: its title, or the date they wrote it. */
  savedStoryLabel: string | null;
}) {
  const tooShort = story.trim().length < MIN_STORY_CHARS;
  const boxRef = useRef<HTMLTextAreaElement>(null);

  /** Append a starter and leave the cursor at the end, ready to keep typing. */
  const addStarter = (text: string) => {
    const base = story.trimEnd();
    // A starter ends mid-sentence on purpose, so the join is a newline when
    // there is already something there rather than a space that would run two
    // half-sentences together.
    const next = (base ? `${base}\n${text}` : text).slice(0, MAX_STORY_CHARS);
    setStory(next);
    requestAnimationFrame(() => {
      const el = boxRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(next.length, next.length);
      el.scrollTop = el.scrollHeight;
    });
  };

  return (
    <div
      style={{
        borderRadius: 22,
        border: `1px solid rgba(108,92,231,.22)`,
        background: "linear-gradient(160deg, rgba(108,92,231,.06), rgba(247,37,133,.05))",
        padding: "15px 14px",
        marginBottom: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: 9,
            background: "linear-gradient(135deg,#6C5CE7,#F72585)",
            color: "#fff",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <Sparkles size={14} />
        </span>
        <h3 style={{ fontFamily: HEAD, fontSize: 14.5, fontWeight: 700, color: TEXT, margin: 0 }}>
          Tell the Court your story
        </h3>
      </div>
      <p style={{ fontFamily: BODY, fontSize: 12, lineHeight: 1.55, color: MUTED, margin: "0 0 11px" }}>
        Write in <strong style={{ color: TEXT }}>any language</strong> — Hindi, Hinglish, Tamil, Urdu,
        anything. The questions come back in the same language you write in.
      </p>

      {/* Offered above the box, because it is the shortcut past writing
          anything at all — and only when there is genuinely something saved to
          reuse, which means signed in. */}
      {savedStory ? (
        <button
          type="button"
          onClick={() => setStory(savedStory.slice(0, MAX_STORY_CHARS))}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            width: "100%",
            marginBottom: 10,
            padding: "10px 12px",
            borderRadius: 14,
            cursor: "pointer",
            textAlign: "left",
            background: SURFACE,
            border: `1px solid rgba(108,92,231,.3)`,
          }}
        >
          <span
            style={{
              flexShrink: 0,
              width: 26,
              height: 26,
              borderRadius: 9,
              background: "rgba(108,92,231,.11)",
              color: INDIGO,
              display: "grid",
              placeItems: "center",
            }}
          >
            <BookOpen size={13} />
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span
              style={{
                display: "block",
                fontFamily: HEAD,
                fontSize: 12.5,
                fontWeight: 700,
                color: TEXT,
              }}
            >
              Use the story you already wrote
            </span>
            <span
              style={{
                display: "block",
                fontFamily: BODY,
                fontSize: 11,
                color: MUTED,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {savedStoryLabel || "From your profile"} — you can edit it after
            </span>
          </span>
        </button>
      ) : null}

      <textarea
        ref={boxRef}
        value={story}
        onChange={(e) => setStory(e.target.value.slice(0, MAX_STORY_CHARS))}
        placeholder={"How did you two meet? What does she always order? What's the excuse he always gives?\n\nhum pehli baar college fest mein mile the…"}
        rows={5}
        maxLength={MAX_STORY_CHARS}
        // Mirrors what they are typing, so an Urdu or Arabic story reads correctly
        // as it is written rather than after a reload.
        dir="auto"
        style={{
          width: "100%",
          padding: "12px 13px",
          borderRadius: 16,
          background: SURFACE,
          border: `1px solid ${BORDER}`,
          fontFamily: BODY,
          fontSize: 14.5,
          lineHeight: 1.6,
          color: TEXT,
          outline: "none",
          resize: "vertical",
        }}
      />

      {/* The prompts, kept on screen. A placeholder answers the "what do I even
          write" question only until the first keystroke, which is the moment it
          stops helping. */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "9px 0 2px" }}>
        {STORY_STARTERS.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => addStarter(s.text)}
            style={{
              padding: "5px 11px",
              borderRadius: 999,
              cursor: "pointer",
              background: SURFACE,
              border: `1px solid rgba(108,92,231,.26)`,
              fontFamily: BODY,
              fontSize: 11.5,
              fontWeight: 600,
              color: INDIGO,
              lineHeight: 1.5,
            }}
          >
            + {s.label}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          margin: "6px 2px 12px",
        }}
      >
        <span style={{ fontFamily: BODY, fontSize: 11, color: MUTED }}>
          {tooShort ? `A sentence or two is enough` : `${story.trim().length} characters`}
        </span>
        {generatedLanguage && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontFamily: BODY,
              fontSize: 11,
              fontWeight: 600,
              color: INDIGO,
            }}
          >
            <Languages size={12} /> {generatedLanguage}
          </span>
        )}
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onGenerate}
        disabled={generating || tooShort}
        style={{
          width: "100%",
          padding: "13px 18px",
          borderRadius: 999,
          background: generating || tooShort ? "#E7E4F7" : "linear-gradient(135deg,#6C5CE7,#F72585)",
          color: generating || tooShort ? MUTED : "#fff",
          fontFamily: HEAD,
          fontWeight: 700,
          fontSize: 14.5,
          border: "none",
          cursor: generating || tooShort ? "default" : "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          minHeight: 48,
          boxShadow: generating || tooShort ? "none" : "0 8px 20px rgba(108,92,231,.32)",
        }}
      >
        {generating ? (
          <><Loader2 size={15} className="animate-spin" /> Writing your case file…</>
        ) : hasGenerated ? (
          <><RotateCcw size={15} /> Regenerate the questions</>
        ) : (
          <><Sparkles size={15} /> Write the questions with AI</>
        )}
      </motion.button>

      <p
        style={{
          fontFamily: BODY,
          fontSize: 10.5,
          lineHeight: 1.5,
          color: MUTED,
          textAlign: "center",
          margin: "9px 0 0",
        }}
      >
        Everything it writes stays editable below. Prefer to do it yourself? Just skip this and fill in
        the questions by hand.
      </p>
    </div>
  );
}

/** The steps of the form, in the order the trial plays them. */
const STEPS = [
  { id: "courtroom", emoji: "🏛️", label: "Courtroom" },
  { id: "parties", emoji: "👩‍⚖️", label: "The parties" },
  { id: "hearings", emoji: "❓", label: "Hearings" },
  { id: "evidence", emoji: "📁", label: "Evidence & judgement" },
  { id: "stamp", emoji: "📜", label: "Stamp paper" },
] as const;
type StepId = (typeof STEPS)[number]["id"];

export default function EditSheet({
  editMode,
  setEditMode,
  mf,
  updateMf,
  errors,
  updateQuestion,
  updateOption,
  pagePassword,
  setPagePassword,
  onSave,
  saving,
  story,
  setStory,
  generating,
  generatedLanguage,
  hasGenerated,
  onGenerate,
  savedStory,
  savedStoryLabel,
}: {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  mf: CourtOfLoveData;
  updateMf: <K extends keyof CourtOfLoveData>(key: K, val: CourtOfLoveData[K]) => void;
  errors: Partial<Record<CourtFieldError, string>>;
  updateQuestion: (i: number, patch: Partial<QuizQuestion>) => void;
  updateOption: (i: number, optIndex: number, value: string) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  /** Returns the first missing field, or null when the case was filed. */
  onSave: () => CourtFieldError | null;
  saving: boolean;
  story: string;
  setStory: (v: string) => void;
  generating: boolean;
  generatedLanguage: string | null;
  hasGenerated: boolean;
  onGenerate: () => void;
  /** Passed through to the story box — null when signed out. */
  savedStory: string | null;
  savedStoryLabel: string | null;
}) {
  const [openQ, setOpenQ] = useState<number | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const open = editMode === "manual" || editMode === "choose";

  const questionsOk = mf.questions.every((q) => q.question.trim() && q.options.every((o) => o.trim()));
  const done: Record<StepId, boolean> = {
    courtroom: true,
    parties: Boolean(mf.plaintiffName.trim() && mf.accusedName.trim()),
    hearings: questionsOk,
    evidence: Boolean(mf.letter.trim()),
    stamp: Boolean((mf.signatureName || mf.plaintiffName).trim() && mf.certificateTitle.trim()),
  };
  const doneCount = STEPS.filter((st) => done[st.id]).length;
  const missing = Object.values(errors).filter(Boolean).length;

  const scrollTo = (el: Element | null) => {
    const body = bodyRef.current;
    if (!el || !body) return;
    const top = (el as HTMLElement).getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - 12;
    body.scrollTo({ top, behavior: "smooth" });
  };
  const goStep = (id: StepId) => scrollTo(document.getElementById(`col-step-${id}`));

  const save = () => {
    const first = onSave();
    if (!first) return;
    const target =
      first === "letter"
        ? document.querySelector('textarea[aria-label^="The Final Judgement"]')
        : document.getElementById(`col-f-${first}`);
    // Scroll to the field's wrapper so its label stays in view, not just the input.
    scrollTo(target?.parentElement ?? target);
    window.setTimeout(() => (target as HTMLElement | null)?.focus({ preventScroll: true }), 350);
  };

  const needed = Math.ceil(mf.questions.length * PASS_RATIO);

  return (
    <AnimatePresence>
      {open && (
        <>
          <style>{SHEET_CSS}</style>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditMode(null)}
            style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(14,14,18,.5)" }}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            role="dialog"
            aria-label="File your Court of Love case"
            className="col-sheet"
            style={{ background: SURFACE, boxShadow: "0 -18px 50px rgba(14,14,18,.18)" }}
          >
            {/* header */}
            <div style={{ padding: "14px 18px 10px", borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 36, height: 36, borderRadius: 12, background: "linear-gradient(135deg,#3a120c,#b3261e)", color: "#ffd98e", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Gavel size={17} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ fontFamily: HEAD, fontSize: 17, fontWeight: 700, color: TEXT, margin: 0, letterSpacing: -0.3 }}>File your case</h2>
                  <p style={{ fontFamily: BODY, fontSize: 11.5, color: MUTED, margin: 0 }}>
                    {doneCount}/{STEPS.length} steps ready · saved as you type
                  </p>
                </div>
                <button
                  onClick={() => setEditMode(null)}
                  aria-label="Close"
                  style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 999, background: BG_ALT, border: `1px solid ${BORDER}`, color: MUTED, display: "grid", placeItems: "center", cursor: "pointer" }}
                >
                  <X size={16} />
                </button>
              </div>
              {/* Step chips — jump anywhere; a tick once that step is ready. */}
              <nav aria-label="Form steps" className="col-steps">
                {STEPS.map((st, n) => (
                  <button key={st.id} type="button" onClick={() => goStep(st.id)} className="col-step" data-done={done[st.id] || undefined}>
                    <span className="col-step-num">{done[st.id] ? <Check size={11} strokeWidth={3} /> : n + 1}</span>
                    {st.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* body */}
            <div className="col-body" ref={bodyRef}>
              <div className="col-span">
                <StoryBox
                  story={story}
                  setStory={setStory}
                  generating={generating}
                  generatedLanguage={generatedLanguage}
                  hasGenerated={hasGenerated}
                  onGenerate={onGenerate}
                  savedStory={savedStory}
                  savedStoryLabel={savedStoryLabel}
                />
              </div>

              <div id="col-step-courtroom" className="col-span col-sec">
                <ThemeSection themes={COURT_THEMES} value={mf.theme} onChange={(id) => updateMf("theme", id)} />
              </div>

              <div id="col-step-parties" className="col-span col-sec">
                <FormSection emoji="👩‍⚖️" title="The parties" note="Who's filing, who's on trial, and the summons they open first." />
              </div>
              <Field
                id="col-f-plaintiffName"
                required
                labelText="Your name (the plaintiff)"
                value={mf.plaintiffName}
                onChange={(v) => updateMf("plaintiffName", v)}
                placeholder="e.g. Aarav"
                maxLength={80}
                error={errors.plaintiffName}
              />
              <Field
                id="col-f-accusedName"
                required
                labelText="Their name (the accused)"
                value={mf.accusedName}
                onChange={(v) => updateMf("accusedName", v)}
                placeholder="e.g. Meera"
                maxLength={80}
                error={errors.accusedName}
              />
              <TextArea labelText="Headline on the summons" value={mf.headline} onChange={(v) => updateMf("headline", v)} rows={2} maxLength={200} />
              <TextArea labelText="The oath they swear" value={mf.oathText} onChange={(v) => updateMf("oathText", v)} rows={3} maxLength={400} hint="End it as a question they can say yes to." />

              <div id="col-step-hearings" className="col-span col-sec">
                <FormSection
                  emoji="❓"
                  title={`The hearings (${mf.questions.length} questions)`}
                  note={`They need ${needed} of ${mf.questions.length} right to win. Tap a question to edit it and mark the right answer.`}
                />
              </div>
              {!questionsOk && (
                <p className="col-span" style={{ fontFamily: BODY, fontSize: 12, color: "#9a6b00", background: "#FFF6DA", border: "1px solid #F4DE9A", borderRadius: 12, padding: "8px 12px", margin: "10px 0 0" }}>
                  A question or answer is blank — blank questions are skipped on the page.
                </p>
              )}
              {/* Two-up on desktop, inside their own grid so a question and its
                  neighbour stay the same height whichever one is open. */}
              <div className="col-span col-questions" style={{ marginTop: 12 }}>
                {mf.questions.map((q, i) => (
                  <QuestionAccordion
                    key={i}
                    q={q}
                    index={i}
                    open={openQ === i}
                    onToggle={() => setOpenQ(openQ === i ? null : i)}
                    onPatch={(patch) => updateQuestion(i, patch)}
                    onOption={(optIndex, value) => updateOption(i, optIndex, value)}
                  />
                ))}
              </div>

              <div id="col-step-evidence" className="col-span col-sec col-kit">
                <MemoriesSections
                  data={mf}
                  update={(k, v) => updateMf(k, v as CourtOfLoveData[typeof k])}
                  gifTags={["legal", "love", "hug"]}
                  copy={{
                    photosTitle: `The Exhibits — your photos (${mf.photos.length}/10)`,
                    photosNote: "Up to 10. Each becomes Exhibit A, B, C… in the case file. Tap a photo to crop & zoom, then write the memory — they read it as your testimony.",
                    captionHint: "caption — e.g. the first sunset",
                    noteHint: "Let the record show… (the memory behind this photo)",
                    gifsTitle: "GIFs for the courtroom",
                    letterTitle: "The Final Judgement — your main letter *",
                    letterNote: "Read out after the verdict and the evidence, sealed in wax. Drop the courtroom voice here and just say it.",
                    letterHint: "The Court has reviewed the evidence, and honestly? It was never close…",
                    lockQuestion: DEFAULT_LOCK_QUESTION,
                    lockAnswer: DEFAULT_LOCK_ANSWER,
                  }}
                />
                <FieldError id="col-f-letter-err" text={errors.letter} />
                {mf.photos.length === 0 && (
                  <p style={{ fontFamily: BODY, fontSize: 12, color: MUTED, margin: "8px 0 0" }}>
                    No photos yet — the trial still works, but the evidence folder is where most people cry. Just saying. 📸
                  </p>
                )}
              </div>

              <div id="col-step-stamp" className="col-span col-sec">
                <FormSection emoji="📜" title="The stamp paper" note="The certificate they keep (and screenshot) when they win." />
              </div>
              <Field
                labelText="Signature on the stamp paper"
                value={mf.signatureName}
                onChange={(v) => updateMf("signatureName", v)}
                placeholder={mf.plaintiffName || "e.g. Aarav"}
                maxLength={80}
                hint="Leave blank to sign with your name."
              />
              <Field
                labelText="Certificate title"
                value={mf.certificateTitle}
                onChange={(v) => updateMf("certificateTitle", v)}
                placeholder="Certified Best Partner"
                maxLength={120}
              />

              <div className="col-span" style={{ marginTop: 6, marginBottom: 8 }}>
                <label style={label}>
                  <Lock size={11} style={{ display: "inline", marginRight: 5, verticalAlign: -1 }} />
                  Password (optional)
                </label>
                <input
                  value={pagePassword}
                  onChange={(e) => setPagePassword(e.target.value)}
                  placeholder="Leave empty for no lock"
                  maxLength={128}
                  autoComplete="new-password"
                  style={field}
                />
                <p style={{ fontFamily: BODY, fontSize: 11.5, color: MUTED, margin: "5px 0 0" }}>Only someone with this password can open the case file.</p>
              </div>
            </div>

            {/* footer */}
            <div className="col-foot" style={{ borderTop: `1px solid ${BORDER}`, flexShrink: 0, background: SURFACE }}>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={save}
                disabled={saving}
                className="col-save"
                style={{
                  padding: "15px 22px",
                  borderRadius: 999,
                  background: "linear-gradient(135deg,#3a120c,#7a1f16)",
                  color: "#FFE3A3",
                  fontFamily: HEAD,
                  fontWeight: 700,
                  fontSize: 15.5,
                  border: "none",
                  boxShadow: "0 10px 24px -8px rgba(58,18,12,.55)",
                  cursor: saving ? "default" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  minHeight: 52,
                }}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Gavel size={16} />}
                {saving ? "Saving…" : "Save & preview the trial"}
              </motion.button>
              <p style={{ fontFamily: BODY, fontSize: 11.5, color: missing ? ERR : MUTED, fontWeight: missing ? 600 : 400, textAlign: "center", margin: "8px 0 0" }}>
                {missing ? `${missing} required field${missing === 1 ? "" : "s"} missing — marked in red above.` : (
                  <>Saved automatically as you type — <span style={{ color: PINK }}>you won&apos;t lose it</span>.</>
                )}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
