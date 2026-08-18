// ─── Wire-format coercion ────────────────────────────────────────────────────
//
// Every template maps between three representations of the same data: UI state,
// the flat JSON body sent to the API, and whatever comes back from Mongo (which
// may be older than the current schema, or partially filled).
//
// The `dbToXxxData` direction is the dangerous one — it runs on the recipient's
// share page, where a missing or wrong-typed field must degrade to a sensible
// default rather than crash the render. These helpers make "coerce or fall
// back" the path of least resistance so nobody hand-rolls it per template.

export type Raw = Record<string, unknown>;

/** Narrow an unknown to a plain object. Never returns null. */
export const obj = (v: unknown): Raw => (v && typeof v === "object" && !Array.isArray(v) ? (v as Raw) : {});

/** A string, or the fallback if absent/blank/wrong type. */
export const str = (v: unknown, fallback: string): string =>
  typeof v === "string" && v.trim().length > 0 ? v : fallback;

/** A string that is allowed to be empty (an intentionally blank field). */
export const strOr = (v: unknown, fallback: string): string => (typeof v === "string" ? v : fallback);

/** A finite number, or the fallback. Accepts numeric strings from form inputs. */
export const num = (v: unknown, fallback: number): number => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
};

/** A number clamped into a range after coercion. */
export const clampNum = (v: unknown, fallback: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, num(v, fallback)));

/** A boolean, tolerating the "true"/"false" strings a form can produce. */
export const bool = (v: unknown, fallback: boolean): boolean => {
  if (typeof v === "boolean") return v;
  if (v === "true") return true;
  if (v === "false") return false;
  return fallback;
};

/** One of a fixed set of literals, or the fallback. */
export function oneOf<T extends string>(v: unknown, allowed: readonly T[], fallback: T): T {
  return typeof v === "string" && (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
}

/**
 * Map an unknown array through a per-item coercer, dropping anything the
 * coercer rejects (by returning null). Falls back to `fallback` when the input
 * is not an array or ends up empty — an empty deck/list is almost always a
 * broken render rather than an intentional one.
 */
export function list<T>(v: unknown, coerce: (item: Raw, index: number) => T | null, fallback: T[]): T[] {
  if (!Array.isArray(v)) return fallback;
  const out = v.map((item, i) => coerce(obj(item), i)).filter((x): x is T => x !== null);
  return out.length > 0 ? out : fallback;
}

/** A list of plain strings, blanks removed. */
export const strList = (v: unknown, fallback: string[]): string[] => {
  if (!Array.isArray(v)) return fallback;
  const out = v.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
  return out.length > 0 ? out : fallback;
};

/**
 * Build the flat POST/PUT body from UI state by copying a fixed key list.
 *
 * The explicit key list is deliberate: it is the allow-list that stops UI-only
 * state (and anything an attacker appends to the object) reaching the model.
 */
export function bodyFromKeys<T extends object>(
  data: T,
  keys: readonly (keyof T)[],
  password?: string,
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const k of keys) body[k as string] = data[k];
  if (password !== undefined) body.password = password;
  return body;
}

/** `YYYY-MM-DD` → `DD.MM.YYYY`, the printed-document convention. */
export const dotDate = (iso: string): string => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso || "";
};

/** True when `iso` parses to a real calendar date that is not in the future. */
export const isPastDate = (iso: string): boolean => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return false;
  return dt.getTime() <= Date.now();
};
