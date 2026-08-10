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

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { EditMode } from "./demo";
import { NUTRIENT_SOFT_MAX, type Nutrient, type NutritionData, type Vitamin } from "./types";

/* ── Tokens ───────────────────────────────────────────────────────────────────
   The label is black ink on newsprint, so the editor's accent is ink rather
   than a brand colour. Nothing here is imported from the label's own token set:
   the form is allowed to be comfortable in ways the panel is not.            */

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const INK = "#111111";
const MUTED = "#6B6B6B";
const FAINT = "#93908A";
const BORDER = "#D7D3CA";
const SECTION = "#F2F0EA";
const ACCENT = "#111111";

const MAX_MESSAGE_LINES = 8;
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
  borderRadius: 8,
  border: `1px solid ${BORDER}`,
  background: "#FFFFFF",
  padding: "10px 12px",
  fontFamily: FONT,
  fontSize: 14,
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  help?: string;
}) {
  return (
    <div>
      <label style={labelStyle}>
        {label}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ ...inputStyle, ...controlReset }}
        />
      </label>
      {help ? <p style={{ margin: "4px 0 0", fontFamily: FONT, fontSize: 11, lineHeight: 1.5, color: FAINT }}>{help}</p> : null}
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

function Section({ title, blurb, children }: { title: string; blurb?: string; children: React.ReactNode }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <h3 style={{ margin: 0, fontFamily: FONT, fontSize: 13, fontWeight: 700, color: INK }}>{title}</h3>
        {blurb ? (
          <p style={{ margin: "3px 0 0", fontFamily: FONT, fontSize: 11.5, lineHeight: 1.5, color: MUTED }}>{blurb}</p>
        ) : null}
      </div>
      {children}
    </section>
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
        padding: "0 14px",
        borderRadius: 8,
        border: `1px solid ${danger ? BORDER : ACCENT}`,
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
    <div style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
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

export default function EditSheet({
  editMode,
  setEditMode,
  mf,
  updateMf,
  pagePassword,
  setPagePassword,
  onSave,
  saving,
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
}) {
  const [openRow, setOpenRow] = useState<number | null>(null);

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

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="nf-sheet"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200]"
          style={{ background: "rgba(17,17,17,0.42)" }}
          onClick={() => setEditMode(null)}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", duration: 0.24, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Write this label"
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              bottom: 0,
              width: "100%",
              maxWidth: 460,
              maxHeight: "92dvh",
              background: SECTION,
              borderTopLeftRadius: 14,
              borderTopRightRadius: 14,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                flex: "0 0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                padding: "12px 14px",
                background: "#FFFFFF",
                borderBottom: `1px solid ${BORDER}`,
              }}
            >
              <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: INK }}>Write this label</span>
              <button
                type="button"
                onClick={() => setEditMode(null)}
                aria-label="Close"
                style={{
                  minHeight: 44,
                  minWidth: 44,
                  border: "none",
                  background: "transparent",
                  color: MUTED,
                  fontFamily: FONT,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>

            <div
              style={{
                flex: "1 1 auto",
                overflowY: "auto",
                padding: "16px 14px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 22,
              }}
            >
              <Section title="The product" blurb="A person, packaged. Their name goes where the brand name goes.">
                <Field
                  label="Their name"
                  value={mf.productName}
                  onChange={(v) => updateMf("productName", v)}
                  placeholder="Meera Sharma"
                />
                <Field
                  label="Photo URL"
                  value={mf.photoUrl ?? ""}
                  onChange={(v) => updateMf("photoUrl", v)}
                  placeholder="Optional"
                  help="Optional. Leave it blank and the package keeps its plain front."
                />
              </Section>

              <Section title="Serving" blurb="The driest possible way to say there is only one of them.">
                <Field label="Serving size" value={mf.servingSize} onChange={(v) => updateMf("servingSize", v)} placeholder="1 Meera" />
                <Field
                  label="Servings per container"
                  value={mf.servingsPerContainer}
                  onChange={(v) => updateMf("servingsPerContainer", v)}
                  placeholder="1 (there is only one)"
                />
                <Field
                  label="Calories"
                  value={mf.calories}
                  onChange={(v) => updateMf("calories", v)}
                  placeholder="∞"
                  help="Write anything at all. ∞ is the best answer, and this is never read as a number, so it will print exactly as typed."
                />
                <Field
                  label="Line under the calories"
                  value={mf.caloriesNote ?? ""}
                  onChange={(v) => updateMf("caloriesNote", v)}
                  placeholder="worth every one"
                  help="Tiny italics, bottom right of the calorie block. Optional."
                />
              </Section>

              <Section
                title={`What they are made of (${mf.nutrients.length})`}
                blurb="Each row is a trait. Tapping a row on the finished label reveals your note about it — that note is the whole point, so write it here."
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
                <SmallButton label="Add a trait" onClick={addNutrient} />
                {crowded ? (
                  <p style={{ margin: 0, fontFamily: FONT, fontSize: 11.5, lineHeight: 1.5, color: MUTED }}>
                    That is more than {NUTRIENT_SOFT_MAX} rows. Nothing is dropped, but past about here the panel stops reading
                    like a label and starts reading like a spreadsheet.
                  </p>
                ) : null}
              </Section>

              <Section title="Vitamins and minerals" blurb="The short block under the heavy rule. Smaller traits, smaller type.">
                <LinesArea
                  key="vitamins"
                  label={`Vitamins (max ${MAX_VITAMINS})`}
                  initial={mf.vitamins.map(vitaminToLine).join("\n")}
                  rows={5}
                  placeholder={"Vitamin P (patience): 8%\nIron (in arguments): 90% | never once conceded a point about parking"}
                  help="One per line, written Trait: value — split on the first colon only. Anything after a | is the tap-note for that row. Leave it empty and the whole block disappears."
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

              <Section title="Not a significant source of" blurb="The funniest line on the label, set in the dullest type on the label.">
                <LinesArea
                  key="not-significant"
                  label={`Things they simply do not have (max ${MAX_NOT_SIGNIFICANT})`}
                  initial={mf.notSignificantSource.join("\n")}
                  rows={4}
                  placeholder={"punctuality\nreplying to texts before Thursday\nany interest in the offside rule"}
                  help="One per line. Leave it empty and the line is skipped entirely."
                  onCommit={(lines) =>
                    updateMf(
                      "notSignificantSource",
                      lines.map((l) => l.trim()).filter(Boolean).slice(0, MAX_NOT_SIGNIFICANT),
                    )
                  }
                />
                {sentence ? (
                  <p
                    style={{
                      margin: 0,
                      padding: "9px 11px",
                      borderRadius: 8,
                      background: "#FFFFFF",
                      border: `1px solid ${BORDER}`,
                      fontFamily: FONT,
                      fontSize: 11.5,
                      lineHeight: 1.5,
                      color: MUTED,
                    }}
                  >
                    {sentence}
                  </p>
                ) : null}
              </Section>

              <Section title="The small print" blurb="Nobody reads this on a real packet. Everybody reads it on this one.">
                <TextArea
                  label="Daily value footnote"
                  value={mf.footnote}
                  onChange={(v) => updateMf("footnote", v)}
                  rows={3}
                  placeholder="Percent Daily Values are based on one person. Your daily values may be higher or lower depending on how long you have known her."
                  help="A real packet explains that percentages assume a 2,000 calorie diet. Explain what yours are based on."
                />
                <LinesArea
                  key="ingredients"
                  label={`Ingredients (max ${MAX_INGREDIENTS})`}
                  initial={mf.ingredients.join("\n")}
                  rows={6}
                  placeholder={"stubbornness\nunreasonably good playlists\nthe laugh that starts silent"}
                  help="One per line. They are printed run together in one dense unbroken block, which is exactly how a real ingredients list hides the interesting bits."
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
                  onChange={(v) => updateMf("allergen", v)}
                  placeholder="CONTAINS: sarcasm, strong opinions"
                  help="Printed in small bold capitals, like the real thing."
                />
                <Field
                  label="Distributed by"
                  value={mf.distributedBy ?? ""}
                  onChange={(v) => updateMf("distributedBy", v)}
                  placeholder="Your name, Bengaluru"
                  help="The seven-pixel line at the very bottom of the packet. This is your signature. Optional."
                />
              </Section>

              <Section
                title="The part you actually meant"
                blurb="Under the packet, in a serif, at a size a person reads at. Everything above is the setup; this is the thing you are sending."
              >
                <LinesArea
                  key="message"
                  label={`Message (max ${MAX_MESSAGE_LINES} paragraphs)`}
                  initial={mf.message.join("\n")}
                  rows={8}
                  placeholder={"One paragraph per line.\n\nSay the plain thing. No percentages, no callback to the rows above — the joke has already done its work by the time they get here."}
                  help="Write it the way you would say it. Do not land another punchline here; the whole label exists to buy you these few honest sentences."
                  onCommit={(lines) =>
                    updateMf(
                      "message",
                      lines.map((l) => l.trim()).filter(Boolean).slice(0, MAX_MESSAGE_LINES),
                    )
                  }
                />
              </Section>

              <Section title="Password (optional)">
                <Field
                  label="Password"
                  value={pagePassword}
                  onChange={setPagePassword}
                  placeholder="Leave blank for no gate"
                  help="Set one and the shared page asks for it before it opens."
                />
              </Section>
            </div>

            <div
              style={{
                flex: "0 0 auto",
                padding: "10px 14px",
                paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))",
                background: "#FFFFFF",
                borderTop: `1px solid ${BORDER}`,
              }}
            >
              <button
                type="button"
                onClick={onSave}
                disabled={saving}
                style={{
                  width: "100%",
                  height: 48,
                  minHeight: 48,
                  borderRadius: 8,
                  border: `1px solid ${ACCENT}`,
                  background: ACCENT,
                  color: "#FFFFFF",
                  fontFamily: FONT,
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  opacity: saving ? 0.6 : 1,
                  cursor: saving ? "default" : "pointer",
                }}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
