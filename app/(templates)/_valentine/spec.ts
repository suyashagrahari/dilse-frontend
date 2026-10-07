// ─── Valentine's week — FieldSpec (client half) ──────────────────────────────
//
// The SAME keys and limits as server/src/config/valentineDays.ts, plus the UI:
// labels, placeholders that ask for one specific detail, suggestion chips,
// swatches. One list per day drives three things on this side:
//   • the spec-driven EditSheet (every kind has a renderer),
//   • `coerceExtras` — wire → form, tolerant of old/partial/hostile data,
//   • `extrasMissing` — what still stops Save.
// Keys/limits drift = a field silently dropped on save. The server test
// (valentineDays.test.ts) pins the keys; keep this file in step with it.

export interface EnumOption {
  value: string;
  label: string;
  /** One short line under the label ("I love you, truly, madly, deeply"). */
  hint?: string;
  /** Renders the option as a colour swatch. */
  swatch?: string;
  emoji?: string;
}

interface Ui {
  key: string;
  label: string;
  /** Helper text under the field. */
  hint?: string;
  /** Ask for ONE specific detail — never "Enter text". */
  placeholder?: string;
}

export type TextSpec = Ui & {
  kind: "text" | "longtext";
  max: number;
  min?: number;
  /** Tappable chips that fill the input (presets, Hinglish options). */
  suggestions?: readonly string[];
  /** Native input type for special text (togetherSince is a date). */
  input?: "date";
  rows?: number;
};
export type EnumSpec = Ui & {
  kind: "enum";
  options: readonly EnumOption[];
  default: string;
  /** "swatches" = round colour dots, "cards" = option cards with hint, default chips. */
  display?: "chips" | "swatches" | "cards";
};
export type NumberSpec = Ui & { kind: "number"; min: number; max: number; default: number; step?: number; unit?: string };
export type BoolSpec = Ui & { kind: "bool"; default: boolean };
export type LeafSpec = TextSpec | EnumSpec | NumberSpec | BoolSpec;

export type ListSpec = Ui & {
  kind: "list";
  maxItems: number;
  minItems?: number;
  itemMax: number;
  /** One placeholder for every row, or one per row. */
  itemPlaceholder?: string | readonly string[];
  /** Fixed per-row labels (Valentine's week lines: Rose … Kiss). */
  itemLabels?: readonly string[];
  addLabel?: string;
};
export type ObjListSpec = Ui & {
  kind: "objlist";
  maxItems: number;
  minItems?: number;
  item: readonly LeafSpec[];
  addLabel?: string;
  /** "Hug" → rows titled "Hug 1", "Hug 2"… */
  itemTitle?: string;
};
export type FieldSpec = LeafSpec | ListSpec | ObjListSpec;

export type Extras = Record<string, unknown>;

// ─── Coercion (wire → form) ──────────────────────────────────────────────────

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

export function leafDefault(spec: LeafSpec): string | number | boolean {
  if (spec.kind === "enum" || spec.kind === "number" || spec.kind === "bool") return spec.default;
  return "";
}

function coerceLeaf(spec: LeafSpec, raw: unknown, fallback: unknown): string | number | boolean {
  switch (spec.kind) {
    case "text":
    case "longtext":
      return typeof raw === "string" ? raw.slice(0, spec.max) : typeof fallback === "string" ? fallback : "";
    case "enum": {
      const s = typeof raw === "number" ? String(raw) : raw;
      if (typeof s === "string" && spec.options.some((o) => o.value === s)) return s;
      return typeof fallback === "string" && spec.options.some((o) => o.value === fallback) ? fallback : spec.default;
    }
    case "number": {
      const n = typeof raw === "number" ? raw : typeof raw === "string" && raw.trim() ? Number(raw) : NaN;
      if (!Number.isFinite(n)) return typeof fallback === "number" ? fallback : spec.default;
      return Math.min(spec.max, Math.max(spec.min, Math.round(n)));
    }
    case "bool":
      if (typeof raw === "boolean") return raw;
      if (raw === "true") return true;
      if (raw === "false") return false;
      return typeof fallback === "boolean" ? fallback : spec.default;
  }
}

/** A blank row for an objlist "+ add". */
export function blankRow(spec: ObjListSpec): Record<string, unknown> {
  const o: Record<string, unknown> = {};
  for (const l of spec.item) o[l.key] = leafDefault(l);
  return o;
}

/**
 * Extras off the wire. A key missing from `raw` takes the `fallback` value
 * (the demo, while the sender is still building; the empty default for a page
 * that came from the server). Unknown keys are dropped.
 */
export function coerceExtras(specs: readonly FieldSpec[], raw: unknown, fallback: Extras | null): Extras {
  const src = isObj(raw) ? raw : {};
  const out: Extras = {};
  for (const spec of specs) {
    const has = spec.key in src;
    const fb = fallback?.[spec.key];
    if (spec.kind === "list") {
      const arr = has && Array.isArray(src[spec.key]) ? (src[spec.key] as unknown[]) : Array.isArray(fb) && !has ? (fb as unknown[]) : [];
      out[spec.key] = arr.filter((x): x is string => typeof x === "string").map((s) => s.slice(0, spec.itemMax)).slice(0, spec.maxItems);
    } else if (spec.kind === "objlist") {
      const arr = has && Array.isArray(src[spec.key]) ? (src[spec.key] as unknown[]) : Array.isArray(fb) && !has ? (fb as unknown[]) : [];
      out[spec.key] = arr
        .filter(isObj)
        .slice(0, spec.maxItems)
        .map((row) => {
          const o: Record<string, unknown> = {};
          for (const l of spec.item) o[l.key] = coerceLeaf(l, row[l.key], undefined);
          return o;
        });
    } else {
      out[spec.key] = coerceLeaf(spec, has ? src[spec.key] : undefined, has ? undefined : fb);
    }
  }
  return out;
}

/** Save-time tidy: trims, drops blank list items and fully-empty objlist rows. */
export function tidyExtras(specs: readonly FieldSpec[], extras: Extras): Extras {
  const out: Extras = { ...extras };
  for (const spec of specs) {
    const v = extras[spec.key];
    if (spec.kind === "list") {
      out[spec.key] = (Array.isArray(v) ? v : []).map((s) => String(s ?? "").trim()).filter(Boolean).slice(0, spec.maxItems);
    } else if (spec.kind === "objlist") {
      const texts = spec.item.filter((l) => l.kind === "text" || l.kind === "longtext");
      out[spec.key] = (Array.isArray(v) ? v : [])
        .filter(isObj)
        .map((row) => {
          const o: Record<string, unknown> = { ...row };
          for (const l of texts) o[l.key] = String(row[l.key] ?? "").trim();
          return o;
        })
        .filter((row) => texts.length === 0 || texts.some((l) => row[l.key]))
        .slice(0, spec.maxItems);
    } else if (spec.kind === "text" || spec.kind === "longtext") {
      out[spec.key] = String(v ?? "").trim();
    }
  }
  return out;
}

/** Human list of what still stops Save inside extras (minItems, text min). */
export function extrasMissing(specs: readonly FieldSpec[], extras: Extras): string[] {
  const out: string[] = [];
  for (const spec of specs) {
    const v = extras[spec.key];
    if ((spec.kind === "list" || spec.kind === "objlist") && spec.minItems) {
      const filled = (Array.isArray(v) ? v : []).filter((x) =>
        spec.kind === "list" ? typeof x === "string" && x.trim() : isObj(x) && Object.values(x).some((y) => typeof y === "string" && y.trim()),
      ).length;
      if (filled < spec.minItems) out.push(`${spec.minItems - filled} more ${spec.label.toLowerCase()}`);
    }
    if ((spec.kind === "text" || spec.kind === "longtext") && spec.min && String(v ?? "").trim().length < spec.min) {
      out.push(spec.label.toLowerCase());
    }
  }
  return out;
}
