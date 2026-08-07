// ─── One reviewable row, and the editor that opens inside it ─────────────────
//
// THE POINT OF THIS FILE IS THAT NOTHING IS LOCKED. The sender has just been
// handed nine sentences a machine wrote about their own relationship, and the
// only thing that makes that acceptable is being able to fix any of them right
// there, in the same breath, without hunting for the field in a seven-section
// form. So every row is a 44px target that opens the real control for its kind
// — a textarea for a paragraph, chips for a list, a date picker for a date —
// and writes straight back through `setFieldValue`.
//
// ── THE COUNTERS ARE NOT DECORATION ──────────────────────────────────────────
//
// `field.max` and `field.itemMax` are what the server clamps to. If the box
// here let someone write 300 characters into a 120-character slot, the fix
// would happen silently on the way out and they would find their last sentence
// gone from a page they had already read. So the same limits are enforced on
// the way in, visibly, with the same defaults `coerceValue` uses.
//
// ── WHY THE ROW IS MEMOISED ──────────────────────────────────────────────────
//
// A review list is a dozen rows and every keystroke in one of them re-renders
// the panel. The row takes a resolved `value` plus two stable callbacks that
// take the path as an argument, so typing in row 3 re-renders row 3 only.

"use client";

import { memo, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import AiFilledBadge from "./AiFilledBadge";
import { STORY_UI, TAP, areaStyle, inputStyle } from "./ui";
import type { FieldKind, WireField } from "@/lib/ai-fill/types";

// ── The clamps, mirrored from `coerceValue` in lib/ai-fill/applyPatch.ts ─────
const DEFAULT_MAX: Record<"text" | "longtext", number> = { text: 120, longtext: 1200 };
const DEFAULT_LIST_ITEMS = 12;
const DEFAULT_ITEM_CHARS = 240;

function charLimit(field: WireField): number {
  if (field.kind === "text" || field.kind === "longtext") {
    return field.max ?? DEFAULT_MAX[field.kind];
  }
  return DEFAULT_ITEM_CHARS;
}

/** An id an `htmlFor` can point at. Paths carry dots and brackets. */
function domId(path: string): string {
  return `story-f-${path.replace(/[^A-Za-z0-9]+/g, "-")}`;
}

function asList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

function asText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

/** What the collapsed row shows. One line of truth about what is actually there. */
function preview(field: WireField, value: unknown): string {
  if (field.kind === "list") {
    const items = asList(value);
    return items.length ? items.join(" · ") : "";
  }
  return asText(value).replace(/\s*\n\s*/g, " ").trim();
}

// ─────────────────────────────────────────────────────────────────────────────

function Counter({ used, max }: { used: number; max: number }) {
  const near = used > max * 0.9;
  return (
    <span
      style={{
        fontFamily: STORY_UI.font,
        fontSize: 11,
        color: near ? STORY_UI.accent : STORY_UI.inkFaint,
        flexShrink: 0,
      }}
    >
      {used}/{max}
    </span>
  );
}

/**
 * Number gets a draft string of its own so the field can be emptied and
 * retyped. Propagating "" into form state would hand a template a value it
 * expects to be a number, so the last valid number stays until a new one
 * exists — the only kind whose control is not a straight pass-through.
 */
function NumberEditor({
  field,
  value,
  onChange,
  describedBy,
}: {
  field: WireField;
  value: unknown;
  onChange: (path: string, value: unknown) => void;
  describedBy?: string;
}) {
  const [draft, setDraft] = useState(() => asText(value));

  return (
    <input
      id={domId(field.path)}
      type="number"
      inputMode="numeric"
      aria-describedby={describedBy}
      value={draft}
      onChange={(e) => {
        setDraft(e.target.value);
        const n = Number(e.target.value);
        if (e.target.value !== "" && Number.isFinite(n)) onChange(field.path, n);
      }}
      style={inputStyle}
    />
  );
}

function ListEditor({
  field,
  value,
  onChange,
  describedBy,
}: {
  field: WireField;
  value: unknown;
  onChange: (path: string, value: unknown) => void;
  describedBy?: string;
}) {
  const items = asList(value);
  const maxItems = field.max ?? DEFAULT_LIST_ITEMS;
  const itemChars = field.itemMax ?? DEFAULT_ITEM_CHARS;

  const setItem = (i: number, text: string) => {
    const next = items.slice();
    next[i] = text.slice(0, itemChars);
    onChange(field.path, next);
  };

  return (
    <div className="flex flex-col" style={{ gap: 8 }}>
      {items.map((item, i) => (
        <div key={i} className="flex items-start" style={{ gap: 6 }}>
          <input
            id={i === 0 ? domId(field.path) : undefined}
            aria-describedby={i === 0 ? describedBy : undefined}
            value={item}
            onChange={(e) => setItem(i, e.target.value)}
            aria-label={`${field.label}, item ${i + 1}`}
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            type="button"
            onClick={() => onChange(field.path, items.filter((_, j) => j !== i))}
            aria-label={`Remove item ${i + 1}`}
            style={{
              minWidth: TAP,
              minHeight: TAP,
              display: "grid",
              placeItems: "center",
              borderRadius: 11,
              background: "transparent",
              border: `1px solid ${STORY_UI.edge}`,
              color: STORY_UI.inkFaint,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <X size={15} aria-hidden="true" />
          </button>
        </div>
      ))}

      <div className="flex items-center" style={{ gap: 8 }}>
        <button
          type="button"
          disabled={items.length >= maxItems}
          onClick={() => onChange(field.path, [...items, ""])}
          style={{
            minHeight: TAP,
            padding: "0 13px",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            borderRadius: 11,
            fontFamily: STORY_UI.font,
            fontSize: 13,
            color: STORY_UI.inkSoft,
            background: STORY_UI.paper,
            border: `1px solid ${STORY_UI.edge}`,
            opacity: items.length >= maxItems ? 0.45 : 1,
            cursor: items.length >= maxItems ? "default" : "pointer",
          }}
        >
          <Plus size={14} aria-hidden="true" />
          Add one
        </button>
        <span className="flex-1" />
        <Counter used={items.length} max={maxItems} />
      </div>
    </div>
  );
}

function Control({
  field,
  value,
  onChange,
  describedBy,
}: {
  field: WireField;
  value: unknown;
  onChange: (path: string, value: unknown) => void;
  /** The guide line. Described-by, not labelled-by: the accessible NAME stays
      the field's short label, so a screen reader says "Opening line, edit
      text" rather than reading a sentence of guidance as the name. */
  describedBy?: string;
}) {
  const id = domId(field.path);
  const max = charLimit(field);
  const text = asText(value);

  switch (field.kind) {
    case "longtext":
      return (
        <>
          <textarea
            id={id}
            value={text}
            autoFocus
            rows={4}
            aria-describedby={describedBy}
            onChange={(e) => onChange(field.path, e.target.value.slice(0, max))}
            style={areaStyle}
          />
          <div className="flex" style={{ marginTop: 5 }}>
            <span className="flex-1" />
            <Counter used={text.length} max={max} />
          </div>
        </>
      );

    case "list":
      return <ListEditor field={field} value={value} onChange={onChange} describedBy={describedBy} />;

    case "date":
      return (
        <input
          id={id}
          type="date"
          aria-describedby={describedBy}
          value={/^\d{4}-\d{2}-\d{2}$/.test(text) ? text : ""}
          onChange={(e) => onChange(field.path, e.target.value)}
          style={inputStyle}
        />
      );

    case "number":
      return <NumberEditor field={field} value={value} onChange={onChange} describedBy={describedBy} />;

    case "enum":
      return (
        <select
          id={id}
          value={text}
          aria-describedby={describedBy}
          onChange={(e) => onChange(field.path, e.target.value)}
          style={inputStyle}
        >
          <option value="">Choose…</option>
          {(field.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );

    case "text":
    default:
      return (
        <>
          <input
            id={id}
            value={text}
            autoFocus
            aria-describedby={describedBy}
            onChange={(e) => onChange(field.path, e.target.value.slice(0, max))}
            style={inputStyle}
          />
          <div className="flex" style={{ marginTop: 5 }}>
            <span className="flex-1" />
            <Counter used={text.length} max={max} />
          </div>
        </>
      );
  }
}

/** What the row says when the slot is empty — never a blank line. */
const EMPTY_HINT: Record<FieldKind, string> = {
  text: "Add a line",
  longtext: "Write a few words",
  list: "Add a few",
  date: "Pick a date",
  number: "Add a number",
  enum: "Choose one",
};

export interface StoryFieldRowProps {
  field: WireField;
  /** Resolved by the parent so this row re-renders only when its own value moves. */
  value: unknown;
  open: boolean;
  /** True when the model wrote this one. Drives the quiet marker. */
  fromAi?: boolean;
  /** Stable. Takes the path, so one callback serves the whole list. */
  onToggle: (path: string) => void;
  /** Stable. `fill.setFieldValue`. */
  onChange: (path: string, value: unknown) => void;
}

function StoryFieldRowImpl({ field, value, open, fromAi, onToggle, onChange }: StoryFieldRowProps) {
  /**
   * Closing a list drops the blank slots. "Add one" makes an empty item on
   * purpose — that is how you get a box to type into — but an empty string left
   * in the array renders as a bullet with nothing after it on the sender's
   * published page.
   */
  const toggle = useCallback(() => {
    if (open && field.kind === "list") {
      const items = asList(value);
      const kept = items.filter((s) => s.trim().length > 0);
      if (kept.length !== items.length) onChange(field.path, kept);
    }
    onToggle(field.path);
  }, [open, field.kind, field.path, value, onChange, onToggle]);

  const shown = preview(field, value);
  const empty = shown.length === 0;

  return (
    <div style={{ borderTop: `1px solid ${STORY_UI.edge}` }}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={`${domId(field.path)}-panel`}
        className="flex w-full items-start text-left"
        style={{
          gap: 10,
          minHeight: 56,
          padding: "11px 12px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        <span className="flex-1" style={{ minWidth: 0 }}>
          <span className="flex items-center" style={{ gap: 5 }}>
            <span
              style={{
                fontFamily: STORY_UI.font,
                fontSize: 11.5,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: STORY_UI.inkFaint,
              }}
            >
              {field.label}
            </span>
            {fromAi && <AiFilledBadge compact />}
          </span>
          <span
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              marginTop: 3,
              fontFamily: empty ? STORY_UI.font : STORY_UI.serif,
              fontSize: empty ? 13.5 : 15,
              lineHeight: 1.5,
              color: empty ? STORY_UI.accent : STORY_UI.ink,
            }}
          >
            {empty ? EMPTY_HINT[field.kind] : shown}
          </span>
        </span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          style={{
            marginTop: 3,
            flexShrink: 0,
            color: STORY_UI.inkFaint,
            // Transform only — a rotating chevron costs nothing to lay out.
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 160ms ease",
          }}
        />
      </button>

      {open && (
        <motion.div
          id={`${domId(field.path)}-panel`}
          // Opacity and translate only. Animating height here would reflow the
          // whole sheet on every frame of every row that opens.
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          style={{ padding: "0 12px 13px" }}
        >
          <label
            htmlFor={domId(field.path)}
            style={{
              display: "block",
              fontFamily: STORY_UI.font,
              fontSize: 12,
              lineHeight: 1.45,
              color: STORY_UI.inkSoft,
              marginBottom: field.guide ? 0 : 6,
            }}
          >
            {field.label}
          </label>
          {field.guide && (
            <p
              id={`${domId(field.path)}-hint`}
              style={{
                fontFamily: STORY_UI.font,
                fontSize: 11.5,
                lineHeight: 1.45,
                color: STORY_UI.inkFaint,
                margin: "3px 0 7px",
              }}
            >
              {field.guide}
            </p>
          )}

          <Control
            field={field}
            value={value}
            onChange={onChange}
            describedBy={field.guide ? `${domId(field.path)}-hint` : undefined}
          />

          <button
            type="button"
            onClick={toggle}
            style={{
              minHeight: TAP,
              marginTop: 9,
              padding: "0 14px",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              borderRadius: 11,
              fontFamily: STORY_UI.font,
              fontSize: 13,
              color: STORY_UI.ink,
              background: STORY_UI.paperDeep,
              border: `1px solid ${STORY_UI.edge}`,
              cursor: "pointer",
            }}
          >
            <Check size={14} aria-hidden="true" />
            Done
          </button>
        </motion.div>
      )}
    </div>
  );
}

const StoryFieldRow = memo(StoryFieldRowImpl);
export default StoryFieldRow;
