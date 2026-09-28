"use client";

// ─── The edit sheet ──────────────────────────────────────────────────────────
//
// A bottom sheet over the live label. The panel itself is set in 8px regulatory
// Helvetica; the FORM is not, and must not be. Nobody enjoys filling in a
// compliance document. This is a gift, so the sheet is written in plain sizes,
// plain language, and every help line is a nudge toward the joke rather than an
// instruction about a data type.
//
// ── THE THREE RULES THIS FILE EXISTS TO ENFORCE ──────────────────────────────
//
//   1. CALORIES IS FREE TEXT. It is a plain `<input type="text">`, never a
//      number input, never a spinner, never validated. "∞" is the demo value
//      and the whole template's opening joke; a number input kills it silently
//      on mobile by refusing the character.
//   2. `dv` IS FREE TEXT TOO. "140%", "yes", "not enough" — all valid, never
//      parsed. Same reasoning.
//   3. NUTRIENTS ARE STRUCTURED, NOT TYPED-AS-TEXT. A nutrient carries five
//      independent things (label, amount, dv, weight, indent) plus the tap-note
//      where the sender's actual writing lives. Encoding that into one line of
//      delimiters would be faster to build and miserable to fill, so each row
//      gets a real little card. Vitamins, which carry three, DO use the line
//      syntax — the cheap thing is only cheap where the shape is cheap.
//
// The tap-note is the single most valuable field in this template: it is the
// only place the label stops being a bit and starts being a sentence about a
// person. It is a textarea, it is labelled in words, and it is never collapsed
// behind an "advanced" anything.

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";

import { DATE_FONT_VARS } from "../../date-invitation/components/fonts";
import { GROTESK } from "../../_love/LoveKit";
import { FormSection, MemoriesSections, ThemeSection } from "../../_love/editor/LoveKitSections";
import type { LoveKitData } from "../../_love/types";
import { DEFAULT_LOCK_ANSWER, DEFAULT_LOCK_QUESTION, type EditMode } from "./demo";
import { NUTRITION_THEMES } from "./themes";
import { NUTRIENT_SOFT_MAX, type Nutrient, type NutritionData, type Vitamin } from "./types";

/* ── Tokens ───────────────────────────────────────────────────────────────────
   The label is black ink on newsprint, so the editor's accent is ink rather
   than a brand colour. Nothing here is imported from the label's own token set:
   the form is allowed to be comfortable in ways the panel is not.            */

const FONT = GROTESK;
const INK = "#1a1410";
const MUTED = "#6f665c";
const FAINT = "#968c80";
const BORDER = "#e6ddd0";
const SECTION = "#fbf8f3";
const ACCENT = "#1a1410";
const ERROR = "#d92d4b";
const MAX_INGREDIENTS = 24;
const MAX_NOT_SIGNIFICANT = 12;
const MAX_VITAMINS = 10;

/* ── Field primitives ─────────────────────────────────────────────────────── */

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: FONT,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: MUTED,
  marginBottom: 5,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 44,
  borderRadius: 14,
  border: `1.5px solid ${BORDER}`,
  background: "#FFFFFF",
  padding: "10px 13px",
  fontFamily: FONT,
  fontSize: 16,
  color: INK,
  outline: "none",
};

/** Resets the uppercase/tracking the `<label>` wrapper sets on its children. */
const controlReset: React.CSSProperties = {
  marginTop: 5,
  textTransform: "none",
  letterSpacing: "normal",
  fontWeight: 400,
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  help,
  required,
  error,
  max,
  id,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  help?: string;
  required?: boolean;
  error?: string;
  max?: number;
  id?: string;
}) {
  return (
    <div>
      <label style={labelStyle}>
        <span style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <span>
            {label}
            {required ? <span style={{ color: ERROR }}> *</span> : null}
          </span>
          {max ? (
            <span style={{ fontWeight: 600, letterSpacing: 0, color: value.length > max * 0.9 ? ERROR : FAINT }}>
              {value.length}/{max}
            </span>
          ) : null}
        </span>
        <input
          id={id}
          type="text"
          value={value}
          maxLength={max}
          aria-invalid={error ? true : undefined}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ ...inputStyle, ...controlReset, borderColor: error ? ERROR : BORDER }}
        />
      </label>
      {error ? <p role="alert" style={{ margin: "5px 0 0", fontFamily: FONT, fontSize: 12, fontWeight: 700, color: ERROR }}>{error}</p> : null}
      {help ? <p style={{ margin: "4px 0 0", fontFamily: FONT, fontSize: 11.5, lineHeight: 1.5, color: FAINT }}>{help}</p> : null}
    </div>
  );
}

/** A multi-line field that commits its raw string straight through. */
function TextArea({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
  help,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  help?: string;
}) {
  return (
    <div>
      <label style={labelStyle}>
        {label}
        <textarea
          value={value}
          rows={rows}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...inputStyle, ...controlReset, lineHeight: 1.55, resize: "vertical" }}
        />
      </label>
      {help ? <p style={{ margin: "4px 0 0", fontFamily: FONT, fontSize: 11, lineHeight: 1.5, color: FAINT }}>{help}</p> : null}
    </div>
  );
}

/**
 * A textarea whose value is the sender's RAW text and whose output is the
 * parsed lines.
 *
 * Seeded once, deliberately. Re-deriving the displayed value from the parse
 * deletes the line you are halfway through typing the moment the colon is not
 * there yet. Give it a `key` when the thing it edits is swapped underneath it.
 */
function LinesArea({
  label,
  initial,
  onCommit,
  rows = 5,
  help,
  placeholder,
}: {
  label: string;
  initial: string;
  onCommit: (lines: string[]) => void;
  rows?: number;
  help?: string;
  placeholder?: string;
}) {
  const [raw, setRaw] = useState(initial);
  return (
    <div>
      <label style={labelStyle}>
        {label}
        <textarea
          value={raw}
          rows={rows}
          placeholder={placeholder}
          onChange={(e) => {
            setRaw(e.target.value);
            onCommit(e.target.value.split("\n"));
          }}
          style={{ ...inputStyle, ...controlReset, lineHeight: 1.55, resize: "vertical" }}
        />
      </label>
      {help ? <p style={{ margin: "4px 0 0", fontFamily: FONT, fontSize: 11, lineHeight: 1.5, color: FAINT }}>{help}</p> : null}
    </div>
  );
}

/** A white card grouping a few fields inside a step. */
function Section({ title, blurb, children }: { title: string; blurb?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, background: "#FFFFFF", border: `1.5px solid ${BORDER}`, borderRadius: 20, padding: "14px 14px 16px" }}>
      <div>
        <h5 style={{ margin: 0, fontFamily: FONT, fontSize: 14, fontWeight: 800, color: INK }}>{title}</h5>
        {blurb ? <p style={{ margin: "3px 0 0", fontFamily: FONT, fontSize: 12, lineHeight: 1.5, color: MUTED }}>{blurb}</p> : null}
      </div>
      {children}
    </div>
  );
}

function SmallButton({
  label,
  onClick,
  danger,
  disabled,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        minHeight: 44,
        padding: "0 16px",
        borderRadius: 999,
        border: `1.5px solid ${danger ? BORDER : ACCENT}`,
        background: "#FFFFFF",
        color: danger ? MUTED : ACCENT,
        fontFamily: FONT,
        fontSize: 12,
        fontWeight: 600,
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {label}
    </button>
  );
}

/* ── Vitamin line syntax ──────────────────────────────────────────────────────
   "Label: dv | note". Split on the FIRST colon only so a dv may contain one,
   and everything after the first pipe is the tap-note.                       */

function vitaminToLine(v: Vitamin): string {
  return `${v.label}: ${v.dv}${v.note ? ` | ${v.note}` : ""}`;
}

function vitaminFromLine(line: string): Vitamin | null {
  const pipe = line.indexOf("|");
  const head = (pipe === -1 ? line : line.slice(0, pipe)).trim();
  const note = pipe === -1 ? "" : line.slice(pipe + 1).trim();
  if (!head) return null;
  const colon = head.indexOf(":");
  const label = (colon === -1 ? head : head.slice(0, colon)).trim();
  const dv = colon === -1 ? "" : head.slice(colon + 1).trim();
  if (!label) return null;
  return { label, dv, ...(note ? { note } : {}) };
}

/** The sentence the label will actually print, shown back while it is typed. */
function notSignificantPreview(items: string[]): string {
  const clean = items.map((s) => s.trim()).filter(Boolean);
  if (clean.length === 0) return "";
  if (clean.length === 1) return `Not a significant source of ${clean[0]}.`;
  return `Not a significant source of ${clean.slice(0, -1).join(", ")} or ${clean[clean.length - 1]}.`;
}

/* ── One nutrient row ─────────────────────────────────────────────────────── */

function NutrientCard({
  row,
  index,
  total,
  isOpen,
  onToggle,
  onPatch,
  onRemove,
  onMove,
}: {
  row: Nutrient;
  index: number;
  total: number;
  isOpen: boolean;
  onToggle: () => void;
  onPatch: (patch: Partial<Nutrient>) => void;
  onRemove: () => void;
  onMove: (delta: -1 | 1) => void;
}) {
  return (
    <div style={{ background: "#FFFFFF", border: `1.5px solid ${isOpen ? INK : BORDER}`, borderRadius: 16, overflow: "hidden" }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          width: "100%",
          minHeight: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "0 12px",
          background: "transparent",
          border: "none",
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        <span
          style={{
            fontFamily: FONT,
            fontSize: 13,
            fontWeight: row.bold ? 700 : 500,
            color: INK,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            paddingLeft: (row.indent ?? 0) * 12,
          }}
        >
          {row.label || "Untitled row"}
          {row.amount ? <span style={{ fontWeight: 400, color: MUTED }}> {row.amount}</span> : null}
          {row.note ? <span style={{ color: FAINT }}> ·</span> : null}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 10, flex: "0 0 auto" }}>
          <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: MUTED }}>{row.dv}</span>
          <span style={{ fontFamily: FONT, fontSize: 12, color: MUTED }}>{isOpen ? "Hide" : "Edit"}</span>
        </span>
      </button>

      {isOpen ? (
        <div style={{ padding: "4px 12px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
          <Field
            label="Trait"
            value={row.label}
            onChange={(v) => onPatch({ label: v })}
            placeholder="Total Loyalty"
            help="Read it out loud in a newsreader voice. If it survives that, it belongs on the label."
          />
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: "1 1 0", minWidth: 0 }}>
              <Field label="Amount" value={row.amount ?? ""} onChange={(v) => onPatch({ amount: v })} placeholder="112g" help="Optional." />
            </div>
            <div style={{ flex: "1 1 0", minWidth: 0 }}>
              <Field label="% Daily value" value={row.dv} onChange={(v) => onPatch({ dv: v })} placeholder="140%" help="Text, never a number." />
            </div>
          </div>
          <TextArea
            label="Tap-note"
            value={row.note ?? ""}
            onChange={(v) => onPatch({ note: v })}
            rows={3}
            placeholder="Drove to Whitefield at midnight because I said, on the phone, that I was fine."
            help="Hidden until they tap this row. This is the line they will screenshot — write the specific memory, not the compliment."
          />
          <label style={{ display: "flex", alignItems: "center", gap: 9, minHeight: 44, fontFamily: FONT, fontSize: 13, color: INK }}>
            <input
              type="checkbox"
              checked={row.bold === true}
              onChange={(e) => onPatch({ bold: e.target.checked })}
              style={{ width: 18, height: 18 }}
            />
            Major trait — printed bold
          </label>
          <div>
            <label style={labelStyle}>
              Indent
              <select
                value={String(row.indent ?? 0)}
                onChange={(e) => onPatch({ indent: (Number(e.target.value) || 0) as 0 | 1 | 2 })}
                style={{ ...inputStyle, ...controlReset }}
              >
                <option value="0">None — a main trait</option>
                <option value="1">One step — a sub-trait</option>
                <option value="2">Two steps — a sub-sub-trait</option>
              </select>
            </label>
            <p style={{ margin: "4px 0 0", fontFamily: FONT, fontSize: 11, lineHeight: 1.5, color: FAINT }}>
              Indented rows sit under the one above, the way Saturated Fat sits under Total Fat.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <SmallButton label="Move up" onClick={() => onMove(-1)} disabled={index === 0} />
            <SmallButton label="Move down" onClick={() => onMove(1)} disabled={index === total - 1} />
            <SmallButton label="Delete row" onClick={onRemove} danger />
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ── Sheet ────────────────────────────────────────────────────────────────── */

type StepId = "vibe" | "product" | "label" | "memories" | "fine";

const STEPS: { id: StepId; emoji: string; label: string }[] = [
  { id: "vibe", emoji: "🎨", label: "Packaging" },
  { id: "product", emoji: "🏷️", label: "Product" },
  { id: "label", emoji: "📊", label: "Label" },
  { id: "memories", emoji: "📸", label: "Servings & note" },
  { id: "fine", emoji: "🧾", label: "Small print" },
];

type Errors = Partial<Record<"productName" | "letter", string>>;

export default function EditSheet({
  editMode,
  setEditMode,
  mf,
  updateMf,
  pagePassword,
  setPagePassword,
  onSave,
  saving,
  accent = "#ff3b2f",
}: {
  editMode: EditMode;
  setEditMode: (m: EditMode) => void;
  mf: NutritionData;
  /** The house signature: one key, one value. Not a patch object. */
  updateMf: (key: keyof NutritionData, val: unknown) => void;
  pagePassword: string;
  setPagePassword: (v: string) => void;
  onSave: () => void;
  saving: boolean;
  /** The chosen packaging's accent, for the progress bar and Save. */
  accent?: string;
}) {
  const [openRow, setOpenRow] = useState<number | null>(null);
  const [rawErrors, setErrors] = useState<Errors>({});
  // An error disappears the moment its field is filled.
  const errors: Errors = {
    ...(rawErrors.productName && !mf.productName.trim() ? { productName: rawErrors.productName } : {}),
    ...(rawErrors.letter && !mf.letter.trim() ? { letter: rawErrors.letter } : {}),
  };
  const [active, setActive] = useState<StepId>("vibe");
  const scrollRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<Partial<Record<StepId, HTMLElement | null>>>({});

  const patchNutrient = useCallback(
    (index: number, patch: Partial<Nutrient>) => {
      updateMf(
        "nutrients",
        mf.nutrients.map((n, i) => (i === index ? { ...n, ...patch } : n)),
      );
    },
    [mf.nutrients, updateMf],
  );

  const addNutrient = useCallback(() => {
    const next: Nutrient = { label: "", amount: "", dv: "", bold: true, indent: 0, note: "" };
    updateMf("nutrients", [...mf.nutrients, next]);
    setOpenRow(mf.nutrients.length);
  }, [mf.nutrients, updateMf]);

  const removeNutrient = useCallback(
    (index: number) => {
      updateMf(
        "nutrients",
        mf.nutrients.filter((_, i) => i !== index),
      );
      setOpenRow(null);
    },
    [mf.nutrients, updateMf],
  );

  const moveNutrient = useCallback(
    (index: number, delta: -1 | 1) => {
      const to = index + delta;
      if (to < 0 || to >= mf.nutrients.length) return;
      const next = [...mf.nutrients];
      const [row] = next.splice(index, 1);
      next.splice(to, 0, row);
      updateMf("nutrients", next);
      setOpenRow(to);
    },
    [mf.nutrients, updateMf],
  );

  const open = editMode === "manual";
  const crowded = mf.nutrients.length > NUTRIENT_SOFT_MAX;
  const sentence = notSignificantPreview(mf.notSignificantSource);
  const firstName = mf.productName.trim().split(/\s+/)[0] || "";


  const done: Record<StepId, boolean> = {
    vibe: Boolean(mf.theme),
    product: Boolean(mf.productName.trim()),
    label: mf.nutrients.length > 0,
    memories: mf.photos.length > 0 && Boolean(mf.letter.trim()),
    fine: mf.ingredients.length > 0 || Boolean(mf.allergen.trim()),
  };
  const doneCount = STEPS.filter((s) => done[s.id]).length;

  const jump = (id: StepId) => {
    const el = stepRefs.current[id];
    const box = scrollRef.current;
    if (!el || !box) return;
    box.scrollTo({ top: el.offsetTop - 8, behavior: "smooth" });
  };

  const onScroll = () => {
    const box = scrollRef.current;
    if (!box) return;
    let current: StepId = "vibe";
    for (const s of STEPS) {
      const el = stepRefs.current[s.id];
      if (el && el.offsetTop - 60 <= box.scrollTop) current = s.id;
    }
    if (current !== active) setActive(current);
  };

  const trySave = () => {
    const next: Errors = {};
    if (!mf.productName.trim()) next.productName = "Who is this label about? Add their name.";
    if (!mf.letter.trim()) next.letter = "The note inside the wrapper is empty — it's the best part.";
    setErrors(next);
    if (next.productName) return jump("product");
    if (next.letter) return jump("memories");
    onSave();
  };

  const missing = [errors.productName ? "their name" : "", errors.letter ? "the note" : ""].filter(Boolean);

  const kit: LoveKitData = {
    photos: mf.photos,
    gifs: mf.gifs,
    letter: mf.letter,
    theme: mf.theme,
    lockQuestion: mf.lockQuestion,
    lockAnswer: mf.lockAnswer,
  };
  const updateKit = <K extends keyof LoveKitData>(key: K, val: LoveKitData[K]) => updateMf(key, val);

  const stepHead = (id: StepId, n: number, title: string, note: string) => (
    <div ref={(el) => { stepRefs.current[id] = el; }} style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 4 }}>
      <span style={{ width: 30, height: 30, borderRadius: 999, flex: "0 0 auto", display: "grid", placeItems: "center", background: done[id] ? accent : "#fff", color: done[id] ? "#fff" : INK, border: `1.5px solid ${done[id] ? accent : BORDER}`, fontFamily: FONT, fontWeight: 800, fontSize: 13 }}>
        {done[id] ? <Check size={15} strokeWidth={3} /> : n}
      </span>
      <div style={{ minWidth: 0 }}>
        <h4 style={{ margin: 0, fontFamily: FONT, fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", color: INK }}>{title}</h4>
        <p style={{ margin: "1px 0 0", fontFamily: FONT, fontSize: 12, lineHeight: 1.45, color: MUTED }}>{note}</p>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="nf-sheet"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-[200] ${DATE_FONT_VARS}`}
          style={{ background: "rgba(20,14,10,0.46)" }}
          onClick={() => setEditMode(null)}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Pack your person"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              marginInline: "auto",
              bottom: 0,
              width: "100%",
              maxWidth: 540,
              maxHeight: "94dvh",
              background: SECTION,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              fontFamily: FONT,
              color: INK,
              boxShadow: "0 -20px 60px -20px rgba(0,0,0,.4)",
            }}
          >
            {/* ── Header: title, progress, step chips ── */}
            <div style={{ flex: "0 0 auto", background: "#FFFFFF", borderBottom: `1.5px solid ${BORDER}` }}>
              <div aria-hidden style={{ width: 44, height: 5, borderRadius: 999, background: BORDER, margin: "8px auto 0" }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "8px 12px 0 18px" }}>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontFamily: FONT, fontSize: 20, fontWeight: 800, letterSpacing: "-0.03em", color: INK }}>Pack your person 🥫</h3>
                  <p style={{ margin: "1px 0 0", fontSize: 12, color: MUTED }}>
                    {doneCount}/{STEPS.length} done · the pack behind this sheet updates as you type
                  </p>
                </div>
                <button type="button" onClick={() => setEditMode(null)} aria-label="Close" style={{ width: 44, height: 44, flex: "0 0 auto", borderRadius: 999, border: `1.5px solid ${BORDER}`, background: "#fff", color: INK, display: "grid", placeItems: "center", cursor: "pointer" }}>
                  <X size={18} />
                </button>
              </div>
              <div aria-hidden style={{ margin: "10px 18px 0", height: 5, borderRadius: 999, background: "#f1ebe2", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(doneCount / STEPS.length) * 100}%`, background: accent, borderRadius: 999, transition: "width .35s ease" }} />
              </div>
              <nav aria-label="Form steps" className="nf-steps" style={{ display: "flex", gap: 6, overflowX: "auto", padding: "10px 14px 12px", scrollbarWidth: "none" }}>
                {STEPS.map((s) => {
                  const on = active === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => jump(s.id)}
                      aria-current={on ? "step" : undefined}
                      style={{ flex: "0 0 auto", display: "inline-flex", alignItems: "center", gap: 6, minHeight: 36, padding: "0 12px", borderRadius: 999, cursor: "pointer", fontFamily: FONT, fontSize: 12.5, fontWeight: 800, whiteSpace: "nowrap", border: `1.5px solid ${on ? INK : BORDER}`, background: on ? INK : "#fff", color: on ? "#fff" : INK }}
                    >
                      <span aria-hidden>{done[s.id] ? "✓" : s.emoji}</span> {s.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* ── Body ── */}
            <div
              ref={scrollRef}
              onScroll={onScroll}
              style={{ position: "relative", flex: "1 1 auto", overflowY: "auto", padding: "16px 14px 28px", display: "flex", flexDirection: "column", gap: 18 }}
            >
              {/* 1 — Packaging */}
              {stepHead("vibe", 1, "Pick the packaging", "Four product lines. The whole page changes — this is exactly what they'll unwrap.")}
              <ThemeSection themes={NUTRITION_THEMES} value={mf.theme} onChange={(id) => updateMf("theme", id)} />

              {/* 2 — Product */}
              {stepHead("product", 2, "The product", "A person, packaged. Their name goes where the brand name goes.")}
              <Section title="Front of pack" blurb="Printed huge on the carton. Your first serving photo (step 4) sits in the window.">
                <Field
                  id="nf-product-name"
                  label="Their name"
                  required
                  max={60}
                  value={mf.productName}
                  onChange={(v) => updateMf("productName", v)}
                  placeholder="Meera Sharma"
                  error={errors.productName}
                />
              </Section>
              <Section title="Serving" blurb="The driest possible way to say there is only one of them.">
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: "1 1 0", minWidth: 0 }}>
                    <Field label="Serving size" value={mf.servingSize} onChange={(v) => updateMf("servingSize", v)} placeholder={`1 ${firstName || "Meera"}`} />
                  </div>
                  <div style={{ flex: "1 1 0", minWidth: 0 }}>
                    <Field label="Calories" value={mf.calories} onChange={(v) => updateMf("calories", v)} placeholder="∞" />
                  </div>
                </div>
                <Field
                  label="Servings per container"
                  value={mf.servingsPerContainer}
                  onChange={(v) => updateMf("servingsPerContainer", v)}
                  placeholder="1 (there is only one)"
                />
                <Field
                  label="Line under the calories"
                  value={mf.caloriesNote ?? ""}
                  onChange={(v) => updateMf("caloriesNote", v)}
                  placeholder="worth every one"
                  help="Calories can be anything — ∞, 'a lot', 'yes'. It prints exactly as typed."
                />
              </Section>

              {/* 3 — Label */}
              {stepHead("label", 3, "The label", "Each row is a trait. Tap a row on the finished label and your note about it unfolds.")}
              <Section
                title={`What they're made of (${mf.nutrients.length})`}
                blurb="Write the note — that's the line they'll screenshot. Specific memory beats compliment."
              >
                {mf.nutrients.map((row, i) => (
                  <NutrientCard
                    key={i}
                    row={row}
                    index={i}
                    total={mf.nutrients.length}
                    isOpen={openRow === i}
                    onToggle={() => setOpenRow(openRow === i ? null : i)}
                    onPatch={(patch) => patchNutrient(i, patch)}
                    onRemove={() => removeNutrient(i)}
                    onMove={(delta) => moveNutrient(i, delta)}
                  />
                ))}
                {mf.nutrients.length === 0 ? (
                  <p style={{ margin: 0, padding: "14px", borderRadius: 14, border: `1.5px dashed ${BORDER}`, textAlign: "center", fontSize: 13, color: MUTED }}>
                    No traits yet. Start with the obvious one — &ldquo;Total Loyalty&rdquo;, &ldquo;Stolen Hoodies&rdquo;…
                  </p>
                ) : null}
                <SmallButton label="+ Add a trait" onClick={addNutrient} disabled={mf.nutrients.length >= 15} />
                {crowded ? (
                  <p style={{ margin: 0, fontFamily: FONT, fontSize: 11.5, lineHeight: 1.5, color: MUTED }}>
                    That is more than {NUTRIENT_SOFT_MAX} rows — past here the panel reads like a spreadsheet.
                  </p>
                ) : null}
              </Section>

              <Section title="Vitamins & minerals" blurb="The short block under the heavy rule. Smaller traits, smaller type.">
                <LinesArea
                  key="vitamins"
                  label={`Vitamins (max ${MAX_VITAMINS})`}
                  initial={mf.vitamins.map(vitaminToLine).join("\n")}
                  rows={4}
                  placeholder={"Vitamin U: 100%\nIron (Will): 200% | finished the degree everybody told her to drop"}
                  help="One per line: Trait: value. Anything after a | is the tap-note. Empty = the block disappears."
                  onCommit={(lines) =>
                    updateMf(
                      "vitamins",
                      lines
                        .map(vitaminFromLine)
                        .filter((v): v is Vitamin => v !== null)
                        .slice(0, MAX_VITAMINS),
                    )
                  }
                />
              </Section>

              <Section title="Not a significant source of" blurb="The funniest line on the label, set in the dullest type.">
                <LinesArea
                  key="not-significant"
                  label={`Things they simply do not have (max ${MAX_NOT_SIGNIFICANT})`}
                  initial={mf.notSignificantSource.join("\n")}
                  rows={3}
                  placeholder={"punctuality\nreplying before Thursday"}
                  help="One per line."
                  onCommit={(lines) =>
                    updateMf(
                      "notSignificantSource",
                      lines.map((l) => l.trim()).filter(Boolean).slice(0, MAX_NOT_SIGNIFICANT),
                    )
                  }
                />
                {sentence ? (
                  <p style={{ margin: 0, padding: "9px 11px", borderRadius: 12, background: SECTION, border: `1px solid ${BORDER}`, fontFamily: 'Helvetica, Arial, sans-serif', fontStyle: "italic", fontSize: 12, lineHeight: 1.5, color: MUTED }}>
                    {sentence}
                  </p>
                ) : null}
              </Section>

              {/* 4 — Servings, side effects, the note */}
              {stepHead("memories", 4, "Servings & the note inside", "Your photos become sachets in a box; your GIFs are the side effects; the letter is torn open last.")}
              <div style={{ background: "#FFFFFF", border: `1.5px solid ${BORDER}`, borderRadius: 20, padding: "6px 14px 16px" }}>
                <MemoriesSections
                  data={kit}
                  update={updateKit}
                  gifTags={["funny", "hug", "yes", "love"]}
                  copy={{
                    photosTitle: `Servings — photos + memory notes (${mf.photos.length}/10)`,
                    photosNote: "Add 5–10. Each photo becomes a sachet: tap it to crop & zoom, then write the memory printed inside. The first one is the product shot.",
                    captionHint: "batch no. 001 — the first sunset",
                    noteHint: "You said the sky looked like mango lassi…",
                    gifsTitle: "Side effects may include… (GIFs)",
                    letterTitle: "Directions for use — the note inside the wrapper",
                    letterNote: "The big one. They tear the wrapper open at the very end, after answering your question.",
                    letterHint: `${firstName || "Meera"},\n\nWrite it like they're reading it at 2am…`,
                    lockQuestion: DEFAULT_LOCK_QUESTION,
                    lockAnswer: DEFAULT_LOCK_ANSWER,
                  }}
                />
                {mf.photos.length > 0 && mf.photos.length < 5 ? (
                  <p style={{ margin: "12px 0 0", padding: "9px 12px", borderRadius: 12, background: SECTION, fontSize: 12, color: MUTED }}>
                    💡 {mf.photos.length} serving{mf.photos.length === 1 ? "" : "s"} so far — 5 to 10 makes the box feel full.
                  </p>
                ) : null}
                {errors.letter ? (
                  <p role="alert" style={{ margin: "12px 0 0", padding: "10px 12px", borderRadius: 12, background: "#fff0f3", border: `1.5px solid ${ERROR}`, fontSize: 13, fontWeight: 700, color: ERROR }}>
                    ✍️ {errors.letter}
                  </p>
                ) : null}
              </div>

              {/* 5 — Small print */}
              {stepHead("fine", 5, "The small print", "Nobody reads this on a real packet. Everybody reads it on this one.")}
              <Section title="Ingredients & warnings">
                <TextArea
                  label="Daily value footnote"
                  value={mf.footnote}
                  onChange={(v) => updateMf("footnote", v)}
                  rows={3}
                  placeholder="2,000 calories a day is used for general nutrition advice. One Meera a day is used for everything else."
                />
                <LinesArea
                  key="ingredients"
                  label={`Ingredients (max ${MAX_INGREDIENTS})`}
                  initial={mf.ingredients.join("\n")}
                  rows={5}
                  placeholder={"stubbornness\nunreasonably good playlists\nthe laugh that starts silent"}
                  help="One per line. Printed run together in one dense block, like the real thing."
                  onCommit={(lines) =>
                    updateMf(
                      "ingredients",
                      lines.map((l) => l.trim()).filter(Boolean).slice(0, MAX_INGREDIENTS),
                    )
                  }
                />
                <Field
                  label="Allergen warning"
                  value={mf.allergen}
                  max={120}
                  onChange={(v) => updateMf("allergen", v)}
                  placeholder="CONTAINS: sarcasm, strong opinions"
                />
                <Field
                  label="Distributed by (your signature)"
                  value={mf.distributedBy ?? ""}
                  max={120}
                  onChange={(v) => updateMf("distributedBy", v)}
                  placeholder="Rohan, with love · Bengaluru"
                  help="The tiny line under the barcode. Your first name here also signs the note."
                />
              </Section>
              <Section title="🔒 Password (optional)" blurb="Set one and the shared page asks for it before it opens.">
                <Field label="Password" value={pagePassword} onChange={setPagePassword} placeholder="Leave blank for no gate" />
              </Section>
              <FormSection emoji="🎁" title="That's the whole pack" note="Hit Save to see it, then Publish to get your link." />
            </div>

            {/* ── Footer ── */}
            <div
              style={{
                flex: "0 0 auto",
                padding: "10px 14px",
                paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))",
                background: "#FFFFFF",
                borderTop: `1.5px solid ${BORDER}`,
              }}
            >
              {missing.length ? (
                <p role="alert" style={{ margin: "0 0 8px", fontSize: 12.5, fontWeight: 700, color: ERROR, textAlign: "center" }}>
                  Almost there — still missing {missing.join(" and ")}.
                </p>
              ) : null}
              <button
                type="button"
                onClick={trySave}
                disabled={saving}
                style={{
                  width: "100%",
                  height: 54,
                  minHeight: 54,
                  borderRadius: 999,
                  border: "none",
                  background: INK,
                  color: "#FFFFFF",
                  fontFamily: FONT,
                  fontSize: 16,
                  fontWeight: 800,
                  opacity: saving ? 0.6 : 1,
                  cursor: saving ? "default" : "pointer",
                  boxShadow: `0 14px 30px -14px ${accent}`,
                }}
              >
                {saving ? "Saving…" : "Seal the pack & preview ✨"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
