"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronDown, Check, Lock, Gavel, Loader2, Sparkles, RotateCcw, Languages, BookOpen } from "lucide-react";
import type { CourtOfLoveData, EditMode, QuizQuestion } from "./types";

const SURFACE = "#FFFFFF";
const BG_ALT = "#F3F1EA";
const TEXT = "#0E0E12";
const MUTED = "#5B5B66";
const BORDER = "#ECEAE3";
const INDIGO = "#6C5CE7";
const PINK = "#F72585";
const LIME = "#C6FF3D";
const GREEN = "#3AA76D";

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
.col-body { overflow-y: auto; padding: 16px 18px 8px; -webkit-overflow-scrolling: touch; }
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

function Field({
  labelText,
  value,
  onChange,
  placeholder,
  hint,
  maxLength,
  span = false,
}: {
  labelText: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  maxLength?: number;
  /** Take the full row on desktop instead of half of it. */
  span?: boolean;
}) {
  return (
    <div className={span ? "col-span" : undefined} style={{ marginBottom: 15 }}>
      <label style={label}>{labelText}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        dir="auto"
        style={field}
      />
      {hint && (
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
      <label style={label}>{labelText}</label>
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

export default function EditSheet({
  editMode,
  setEditMode,
  mf,
  updateMf,
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
  updateMf: (key: keyof CourtOfLoveData, val: unknown) => void;
  updateQuestion: (i: number, patch: Partial<QuizQuestion>) => void;
  updateOption: (i: number, optIndex: number, value: string) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
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
  const open = editMode === "manual" || editMode === "choose";

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
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 200,
              background: "rgba(14,14,18,.42)",
              backdropFilter: "blur(3px)",
            }}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            role="dialog"
            aria-label="Edit your Court of Love"
            className="col-sheet"
            style={{ background: SURFACE, boxShadow: "0 -18px 50px rgba(14,14,18,.18)" }}
          >
            {/* header */}
            <div
              style={{
                padding: "16px 18px 12px",
                borderBottom: `1px solid ${BORDER}`,
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 12,
                  background: "rgba(108,92,231,.11)",
                  color: INDIGO,
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <Gavel size={17} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2
                  style={{
                    fontFamily: HEAD,
                    fontSize: 17,
                    fontWeight: 700,
                    color: TEXT,
                    margin: 0,
                    letterSpacing: -0.3,
                  }}
                >
                  File your case
                </h2>
                <p style={{ fontFamily: BODY, fontSize: 11.5, color: MUTED, margin: 0 }}>
                  Everything below is pre-filled — change only what you like.
                </p>
              </div>
              <button
                onClick={() => setEditMode(null)}
                aria-label="Close"
                style={{
                  flexShrink: 0,
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  background: BG_ALT,
                  border: `1px solid ${BORDER}`,
                  color: MUTED,
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* body */}
            <div className="col-body">
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

              <Field
                labelText="Your name (the plaintiff)"
                value={mf.plaintiffName}
                onChange={(v) => updateMf("plaintiffName", v)}
                placeholder="Aarav"
                maxLength={80}
              />
              <Field
                labelText="Their name (the accused)"
                value={mf.accusedName}
                onChange={(v) => updateMf("accusedName", v)}
                placeholder="Meera"
                maxLength={80}
              />
              <TextArea
                labelText="Headline on the summons"
                value={mf.headline}
                onChange={(v) => updateMf("headline", v)}
                rows={2}
                maxLength={200}
              />
              <TextArea
                labelText="The oath they swear"
                value={mf.oathText}
                onChange={(v) => updateMf("oathText", v)}
                rows={3}
                maxLength={400}
              />

              <div
                className="col-span"
                style={{
                  margin: "22px 0 12px",
                  paddingTop: 16,
                  borderTop: `1px solid ${BORDER}`,
                }}
              >
                <h3
                  style={{
                    fontFamily: HEAD,
                    fontSize: 15,
                    fontWeight: 700,
                    color: TEXT,
                    margin: "0 0 3px",
                  }}
                >
                  The questions
                </h3>
                <p style={{ fontFamily: BODY, fontSize: 12, color: MUTED, margin: 0, lineHeight: 1.55 }}>
                  They need {Math.ceil(mf.questions.length * 0.8)} of {mf.questions.length} right to win
                  the case. Tap a question to edit it.
                </p>
              </div>

              {/* Ten accordions in one column is a long scroll on a wide
                  screen, so they run two-up here — inside their own grid rather
                  than as children of the body's, which keeps a question and its
                  neighbour the same height regardless of which one is open. */}
              <div className="col-span col-questions">
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

              <div className="col-span" style={{ marginTop: 22, paddingTop: 16, borderTop: `1px solid ${BORDER}` }}>
                <TextArea
                  span
                  labelText="The sealed letter (shown after they win)"
                  value={mf.secretLetter}
                  onChange={(v) => updateMf("secretLetter", v)}
                  rows={6}
                  maxLength={3000}
                  hint="Types out slowly, one character at a time. Make it count."
                />
                <Field
                  labelText="Signature on the stamp paper"
                  value={mf.signatureName}
                  onChange={(v) => updateMf("signatureName", v)}
                  placeholder="Aarav"
                  maxLength={80}
                />
                <Field
                  labelText="Certificate title"
                  value={mf.certificateTitle}
                  onChange={(v) => updateMf("certificateTitle", v)}
                  placeholder="Certified Best Partner"
                  maxLength={120}
                />
              </div>

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
                <p style={{ fontFamily: BODY, fontSize: 11.5, color: MUTED, margin: "5px 0 0" }}>
                  Only someone with this password can open the case file.
                </p>
              </div>
            </div>

            {/* footer */}
            <div
              className="col-foot"
              style={{ borderTop: `1px solid ${BORDER}`, flexShrink: 0, background: SURFACE }}
            >
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={onSave}
                disabled={saving}
                className="col-save"
                style={{
                  padding: "15px 22px",
                  borderRadius: 999,
                  background: LIME,
                  color: TEXT,
                  fontFamily: HEAD,
                  fontWeight: 700,
                  fontSize: 15.5,
                  border: "none",
                  boxShadow: "0 6px 18px rgba(198,255,61,.42)",
                  cursor: saving ? "default" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  minHeight: 50,
                }}
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Gavel size={16} />}
                {saving ? "Saving…" : "Save & preview the trial"}
              </motion.button>
              <p
                style={{
                  fontFamily: BODY,
                  fontSize: 11,
                  color: MUTED,
                  textAlign: "center",
                  margin: "9px 0 0",
                }}
              >
                Saved automatically as you type — <span style={{ color: PINK }}>you won&apos;t lose it</span>.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
