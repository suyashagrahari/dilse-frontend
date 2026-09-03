// ─── The contract for work held in the browser ───────────────────────────────
//
// A signed-out visitor's page lives in this shape until they sign in. Everything
// here is about reading it back SAFELY, because the thing on the other side of
// the read is a browser we have no control over: an older deploy's scratch, a
// newer deploy's scratch, a key collision, a half-written record, a user who
// edited IndexedDB by hand.
//
// The rule throughout: anything we are not certain we wrote, in the version we
// wrote it, for the template asking for it, is treated as absent. A refused
// record costs the user the work they did before signing in on one visit.
// Feeding a shape the editor no longer understands into its form costs them a
// page that renders half-empty and looks like ours broke.
//
// No imports here on purpose — see the note in `mediaRefs.ts`.

/**
 * Bump this when an editor's saved shape changes incompatibly. Every existing
 * scratch is then refused rather than migrated: this is pre-login work worth
 * seconds, and a migration path per template per version is not worth carrying.
 */
export const SCRATCH_SCHEMA_VERSION = 1;

export interface Scratch {
  schemaVersion: number;
  templateType: string;
  /** The editor's own payload, untouched. This module never looks inside it. */
  data: unknown;
  updatedAt: number;
}

export function encodeScratch(templateType: string, data: unknown): Scratch {
  return {
    schemaVersion: SCRATCH_SCHEMA_VERSION,
    templateType,
    data,
    updatedAt: Date.now(),
  };
}

/**
 * The payload inside a scratch record, or `null` if it cannot be trusted.
 *
 * `templateType` is checked and not assumed. One store with one slot per
 * template means a bad key is a cross-template read, and holi content arriving
 * in the wedding editor is worse than no content at all.
 */
export function decodeScratch(raw: unknown, templateType: string): unknown | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const rec = raw as Partial<Scratch>;

  // Equality, not `>=`. Two tabs can be on two deploys, and the older one must
  // not try to read what the newer one wrote any more than the reverse.
  if (rec.schemaVersion !== SCRATCH_SCHEMA_VERSION) return null;
  if (rec.templateType !== templateType) return null;
  if (rec.data === undefined || rec.data === null) return null;

  return rec.data;
}

/**
 * A stable string standing in for the content, used to decide whether a save is
 * worth making.
 *
 * ── WHY NOT JSON.stringify ──────────────────────────────────────────────────
 *
 * Because it is key-order sensitive and React state is not. An editor that
 * rebuilds its content object every render — which is all of them — would
 * produce a different string each time and turn milestone saves into
 * per-render saves, which is exactly the traffic the milestone decision was
 * made to avoid.
 */
export function fingerprint(value: unknown): string {
  return stableStringify(value);
}

/** Has the content moved since the fingerprint was taken? */
export function hasContentChanged(previous: string | null, next: unknown): boolean {
  if (previous === null) return true;
  return previous !== fingerprint(next);
}

function stableStringify(value: unknown): string {
  if (value === null) return "null";

  const t = typeof value;
  // `undefined` collapses to the same token a missing key produces, because JSON
  // has no undefined and the two are the same document once saved. Any other
  // answer means an editor that clears a field by setting it undefined looks
  // permanently dirty.
  if (t === "undefined") return "null";
  if (t === "number") return Number.isFinite(value as number) ? String(value) : "null";
  if (t === "boolean") return String(value);
  if (t === "string") return JSON.stringify(value);
  if (t !== "object") return "null";

  if (value instanceof Date) return JSON.stringify(value.toISOString());
  // Array order is content: reordering memories is an edit the user made.
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;

  const obj = value as Record<string, unknown>;
  // Keys holding `undefined` are DROPPED, not emitted as null, so that
  // `{a:1, b:undefined}` and `{a:1}` fingerprint alike — they are the same
  // document once saved, and any other answer leaves an editor that clears a
  // field by setting it undefined looking permanently dirty. Inside an array
  // the position matters, so a hole there stays `null`, as JSON.stringify does.
  const keys = Object.keys(obj)
    .filter((k) => obj[k] !== undefined)
    .sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}
