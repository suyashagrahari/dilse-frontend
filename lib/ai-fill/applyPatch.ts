// ─── Applying an AI fill to an editor's form state ───────────────────────────
//
// LEAD-OWNED AND FROZEN. Import from here; do not extend it.
//
// Every template's editor keeps its personalisation in one object (`mf`). The
// server returns a flat `{ path: value }` patch describing what the model
// wrote. This file is the only thing that turns one into the other, so the
// thirty editors share a single merge and cannot each invent their own bug.
//
// ── WHY THIS IS DEFENSIVE ABOUT ITS OWN SERVER ───────────────────────────────
//
// The patch is model output. It has been validated server-side, but it arrives
// over the network into a React state object that renders a page the sender
// will publish under their own name, and the failure mode of getting this
// wrong is not an exception — it is a form that silently loses the sender's
// typing, or an array that grows to a hundred thousand empty slots because a
// path said `[99999]`. So every path is re-parsed here against the schema the
// client itself fetched, and anything not on it is dropped without ceremony.
//
// ── THE RULE THAT MATTERS MOST ───────────────────────────────────────────────
//
// AI NEVER OVERWRITES WHAT THE SENDER TYPED. `applyPatch` is called with the
// set of paths the sender has touched, and those are skipped. Someone who
// writes their own opening line, then hits Generate to do the rest, must find
// their line still there — losing it once is enough for them never to press
// the button again.

import type { WireField, WireSchema } from "./types";

type Seg = { kind: "key"; key: string } | { kind: "index"; index: number };

const PATH_RE = /^[A-Za-z_$][\w$]*(\[\d+\])*(\.[A-Za-z_$][\w$]*(\[\d+\])*)*$/;

/**
 * Mirror of `parsePath` in `server/src/config/aiFill/types.ts`. The grammar is
 * the interop surface between the repos; if one side changes, both must.
 *
 * The three refused identifiers are the prototype-pollution ones. They are
 * valid JavaScript identifiers, so the regex above happily accepts them and
 * they have to be named explicitly — `{"__proto__.polluted": true}` written
 * into a shared object is not a hypothetical, it is the first thing anyone
 * tries against a path-based setter.
 */
export function parsePath(path: string): Seg[] | null {
  if (typeof path !== "string" || !path || path.length > 200) return null;
  if (!PATH_RE.test(path)) return null;

  const segments: Seg[] = [];
  for (const part of path.split(".")) {
    const key = part.replace(/\[\d+\]/g, "");
    if (key === "__proto__" || key === "constructor" || key === "prototype") return null;
    segments.push({ kind: "key", key });
    for (const m of part.matchAll(/\[(\d+)\]/g)) {
      const index = Number(m[1]);
      if (!Number.isSafeInteger(index) || index > 50) return null;
      segments.push({ kind: "index", index });
    }
  }
  return segments;
}

/**
 * Coerce and clamp a model-supplied value to what the field declared.
 *
 * Returns `undefined` for anything unusable, and `undefined` means "the model
 * did not fill this" — which is a normal, expected outcome, not an error. A
 * field that comes back as the wrong type is treated exactly like one that
 * came back empty: reported as missing so the sender is pointed at it.
 */
export function coerceValue(field: WireField, raw: unknown): unknown {
  switch (field.kind) {
    case "text":
    case "longtext": {
      if (typeof raw !== "string") return undefined;
      const s = raw.trim();
      if (!s) return undefined;
      return s.slice(0, field.max ?? (field.kind === "text" ? 120 : 1200));
    }
    case "date": {
      if (typeof raw !== "string") return undefined;
      const s = raw.trim();
      // The editors store dates as `YYYY-MM-DD` strings and feed them straight
      // to `<input type="date">`, which silently shows blank for anything else.
      // A model that writes "last summer" would therefore produce a field that
      // looks filled in the patch and empty on screen.
      if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return undefined;
      const t = Date.parse(s);
      return Number.isNaN(t) ? undefined : s;
    }
    case "number": {
      const n = typeof raw === "number" ? raw : Number(raw);
      return Number.isFinite(n) ? n : undefined;
    }
    case "enum": {
      if (typeof raw !== "string") return undefined;
      const opts = field.options ?? [];
      const hit = opts.find((o) => o.toLowerCase() === raw.trim().toLowerCase());
      return hit ?? undefined;
    }
    case "list": {
      if (!Array.isArray(raw)) return undefined;
      const items = raw
        .filter((x): x is string => typeof x === "string")
        .map((x) => x.trim())
        .filter(Boolean)
        .map((x) => x.slice(0, field.itemMax ?? 240))
        .slice(0, field.max ?? 12);
      return items.length ? items : undefined;
    }
    default:
      return undefined;
  }
}

/**
 * Write `value` at `segs` inside `root`, creating intermediate objects and
 * arrays as needed. Mutates `root`, which is always a fresh deep copy made by
 * `applyPatch` — never the caller's live state.
 *
 * Returns false when the path cannot be written without stamping on something
 * of a different shape (a `[0]` into a string, a `.name` into an array). That
 * is a schema/data mismatch, and overwriting is the wrong recovery: the
 * sender's existing value is worth more than the model's guess.
 */
function writeAt(root: Record<string, unknown>, segs: Seg[], value: unknown): boolean {
  let cursor: unknown = root;

  for (let i = 0; i < segs.length - 1; i++) {
    const seg = segs[i];
    const next = segs[i + 1];
    const wantArray = next.kind === "index";

    if (seg.kind === "key") {
      if (typeof cursor !== "object" || cursor === null || Array.isArray(cursor)) return false;
      const obj = cursor as Record<string, unknown>;
      const existing = obj[seg.key];
      if (existing === undefined || existing === null) {
        obj[seg.key] = wantArray ? [] : {};
      } else if (wantArray !== Array.isArray(existing) || typeof existing !== "object") {
        return false;
      }
      cursor = obj[seg.key];
    } else {
      if (!Array.isArray(cursor)) return false;
      const arr = cursor as unknown[];
      // Only ever extend by one past the end. A patch that jumps to [20] on an
      // empty array would otherwise punch eighteen holes of `undefined` into
      // state that the renderers all read as `.map(...)`.
      if (seg.index > arr.length) return false;
      if (arr[seg.index] === undefined || arr[seg.index] === null) {
        arr[seg.index] = wantArray ? [] : {};
      }
      cursor = arr[seg.index];
    }
  }

  const last = segs[segs.length - 1];
  if (last.kind === "key") {
    if (typeof cursor !== "object" || cursor === null || Array.isArray(cursor)) return false;
    (cursor as Record<string, unknown>)[last.key] = value;
    return true;
  }
  if (!Array.isArray(cursor)) return false;
  const arr = cursor as unknown[];
  if (last.index > arr.length) return false;
  arr[last.index] = value;
  return true;
}

/** Read whatever currently sits at a path, for the "did the sender fill this?" check. */
export function readAt(root: unknown, segs: Seg[]): unknown {
  let cursor: unknown = root;
  for (const seg of segs) {
    if (cursor === null || cursor === undefined) return undefined;
    if (seg.kind === "key") {
      if (typeof cursor !== "object" || Array.isArray(cursor)) return undefined;
      cursor = (cursor as Record<string, unknown>)[seg.key];
    } else {
      if (!Array.isArray(cursor)) return undefined;
      cursor = cursor[seg.index];
    }
  }
  return cursor;
}

/** A value counts as present if a human would see something on the page. */
export function isFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  return true;
}

export interface ApplyOptions {
  /**
   * Paths the sender typed into. Never overwritten — see the rule at the top.
   *
   * The editors do not track this natively, so `diffTouched` below derives it
   * by comparing current state against the template's demo defaults, which is
   * what "the sender changed this" actually means in these editors.
   */
  touched?: ReadonlySet<string>;
  /**
   * When false (the default), a slot that already holds something is left
   * alone. Set true only for an explicit "regenerate everything" action the
   * sender asked for by name.
   */
  overwriteExisting?: boolean;
}

export interface ApplyResult<T> {
  next: T;
  /**
   * Paths actually written. Drives the little "AI" markers in the form.
   *
   * NOTE the difference from `FillResponse.modelFilled`, which comes back over
   * the wire and describes what the MODEL wrote. This one describes what
   * LANDED, and the two differ wherever the sender had already typed
   * something — their text wins and the model's value is dropped. Render this
   * one; rendering the server's would credit the AI with the sender's own
   * lines.
   */
  filled: string[];
  /** Declared but still empty after the merge. Drives the "still needs you" list. */
  missing: string[];
  /**
   * The same two lists as whole fields, so a caller can show `label` without
   * rebuilding a path→field map. Every UI needs the labels and none of them
   * needs the bare paths, so handing back only paths pushed the same six-line
   * lookup into all thirty editors.
   */
  filledFields: WireField[];
  missingFields: WireField[];
  /** Paths the model sent that the schema does not declare. Diagnostics only. */
  rejected: string[];
  /** True when nothing at all changed, so the UI can say so instead of lying. */
  noop: boolean;
}

/**
 * Merge a model patch into an editor's form state.
 *
 * Pure: `data` is never mutated. The copy is made with `structuredClone` where
 * available and a JSON round-trip otherwise — these form objects are plain
 * data by construction (they are POSTed as JSON), so the fallback is lossless
 * for every shape that can actually occur here.
 */
export function applyPatch<T extends object>(
  data: T,
  schema: WireSchema,
  patch: Record<string, unknown>,
  opts: ApplyOptions = {}
): ApplyResult<T> {
  const { touched, overwriteExisting = false } = opts;

  const next = (typeof structuredClone === "function"
    ? structuredClone(data)
    : JSON.parse(JSON.stringify(data))) as T;

  const filled: string[] = [];
  const missing: string[] = [];
  const rejected: string[] = [];

  const declared = new Map<string, WireField>();
  for (const f of schema.fields) declared.set(f.path, f);

  for (const key of Object.keys(patch)) {
    if (!declared.has(key)) rejected.push(key);
  }

  for (const field of schema.fields) {
    const segs = parsePath(field.path);
    if (!segs) {
      // A schema the server accepted but this client cannot parse means the
      // two path grammars have drifted. Nothing is written; the field is
      // reported missing so the sender still gets pointed at it.
      missing.push(field.path);
      continue;
    }

    const current = readAt(next, segs);
    const alreadyThere = isFilled(current);

    // The sender's own words. Never overwritten, whatever else is true.
    if (touched?.has(field.path)) {
      if (!alreadyThere) missing.push(field.path);
      continue;
    }

    // ── Why "already has a value" is NOT a reason to skip ────────────────────
    //
    // Every editor here seeds its form from a fully-written DEMO_* object —
    // demo names, demo captions, a whole demo profile. So "this field is not
    // empty" is the NORMAL state before the sender types anything, and treating
    // it as content worth protecting made the fill a silent no-op: `us` and
    // `flags` merged 0 of 20 generated values, and only `streak`, whose form
    // genuinely starts blank, worked at all.
    //
    // `touched` is the real signal, and it is exact: it is the set of paths
    // differing from that same demo, i.e. precisely what the sender changed.
    // So when the caller supplies it, IT is the authority and placeholder text
    // is free to be replaced.
    //
    // When it is absent the caller has told us nothing about provenance, and
    // the conservative rule is right: leave anything non-empty alone.
    if (!touched && alreadyThere && !overwriteExisting) continue;

    const value = coerceValue(field, patch[field.path]);
    if (value === undefined) {
      if (!alreadyThere) missing.push(field.path);
      continue;
    }

    if (writeAt(next as unknown as Record<string, unknown>, segs, value)) {
      filled.push(field.path);
    } else if (!alreadyThere) {
      missing.push(field.path);
    }
  }

  const byPath = new Map(schema.fields.map((f) => [f.path, f]));
  const pick = (paths: string[]): WireField[] =>
    paths.map((p) => byPath.get(p)).filter((f): f is WireField => !!f);

  return {
    next,
    filled,
    missing,
    filledFields: pick(filled),
    missingFields: pick(missing),
    rejected,
    noop: filled.length === 0,
  };
}

/**
 * Write ONE declared field, as an explicit human edit.
 *
 * Distinct from `applyPatch` in exactly one way, and it is the reason this
 * exists: an empty value is honoured as a CLEAR rather than read as "the model
 * had nothing". `coerceValue` maps `""` and `[]` to `undefined` — correct when
 * sifting model output, wrong when a person selects the text in a review field
 * and deletes it. Routing that through `applyPatch` made the edit a no-op and
 * the input snapped back, with no way to empty a field the AI had filled.
 *
 * Everything else still applies: the path must be declared, and a non-empty
 * value is coerced and clamped exactly as the model's would be, so a hand edit
 * cannot smuggle past the limits the renderer relies on.
 *
 * Returns null when the write is rejected, so the caller can leave state alone.
 */
export function writeField<T extends object>(
  data: T,
  schema: WireSchema,
  path: string,
  value: unknown
): T | null {
  const field = schema.fields.find((f) => f.path === path);
  if (!field) return null;

  const segs = parsePath(path);
  if (!segs) return null;

  const isClear =
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && value.length === 0);

  const next = (typeof structuredClone === "function"
    ? structuredClone(data)
    : JSON.parse(JSON.stringify(data))) as T;

  const toWrite = isClear
    ? field.kind === "list"
      ? []
      : field.kind === "number"
        ? undefined
        : ""
    : coerceValue(field, value);

  // A non-empty value that will not coerce is a rejected edit, not a clear.
  if (!isClear && toWrite === undefined) return null;

  return writeAt(next as unknown as Record<string, unknown>, segs, toWrite) ? next : null;
}

/**
 * Which declared paths differ from the template's demo defaults.
 *
 * This is how "the sender typed here" is established without threading change
 * tracking through thirty editors: every editor seeds its form from a demo
 * object, so anything not equal to the demo is the sender's own. Imperfect in
 * one direction only — a sender who types the demo value back in verbatim is
 * treated as not having touched it — and that is the harmless direction.
 */
export function diffTouched(current: unknown, demo: unknown, schema: WireSchema): Set<string> {
  const out = new Set<string>();
  for (const field of schema.fields) {
    const segs = parsePath(field.path);
    if (!segs) continue;
    const a = readAt(current, segs);
    const b = readAt(demo, segs);
    if (!isFilled(a)) continue;
    if (JSON.stringify(a) !== JSON.stringify(b)) out.add(field.path);
  }
  return out;
}
