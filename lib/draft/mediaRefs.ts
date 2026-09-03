// ─── The photos inside an editor payload ─────────────────────────────────────
//
// Forty-three editors each hold their own content shape, and no two agree on
// where a photo lives: `photoUrl`, `shagun.qrImageUrl`, `memories[].url`,
// `cast[].avatar`. Adoption needs to find every one of them, upload it, and put
// the resulting CDN URL back exactly where it was — for a shape this module has
// never seen.
//
// So it does not know about shapes at all. It walks the payload, decides what
// each string IS, and rewrites by value. A new template needs nothing added
// here, which is the only version of this that stays correct.
//
// ── WHY THIS FILE HAS NO IMPORTS ────────────────────────────────────────────
//
// It is the piece that can lose or duplicate a user's photos, so it is the piece
// that has to be tested properly. The client has no test runner and no jsdom;
// staying dependency-free means `node --test` can strip the types and import it
// directly. See `mediaRefs.test.mjs`.

/**
 * The prefix a locally-held blob is referenced by, matching the convention the
 * two rakhi templates already use (`components/mediaStore.ts`).
 *
 * A ref is 40-odd characters standing in for a megabyte of base64, which is what
 * makes autosaving a photo-heavy draft possible at all.
 */
export const LOCAL_REF_PREFIX = "idb:";

export type MediaRefKind =
  /** Base64 inline in the payload. Thirty-eight templates produce these. */
  | "data-url"
  /** A blob held in IndexedDB under `idb:<id>`. */
  | "blob-ref"
  /** Already a URL. Nothing to do, and re-uploading it would be a bug. */
  | "remote"
  /** Not a media reference. */
  | "none";

/**
 * What is this string?
 *
 * `blob:` object URLs count as `remote` deliberately. They are per-tab handles
 * that die with the tab, so a draft must never carry one — but they are also not
 * something this module can turn into bytes, and calling one pending would mean
 * an upload attempt that can only fail.
 */
export function classifyMediaRef(value: unknown): MediaRefKind {
  if (typeof value !== "string") return "none";
  const v = value.trim();
  if (!v) return "none";
  if (v.startsWith("data:")) return "data-url";
  if (v.startsWith(LOCAL_REF_PREFIX)) return "blob-ref";
  if (v.startsWith("http://") || v.startsWith("https://") || v.startsWith("blob:")) return "remote";
  return "none";
}

/** Is this string something adoption has to upload before it can be saved? */
export function isPendingMediaRef(value: unknown): boolean {
  const kind = classifyMediaRef(value);
  return kind === "data-url" || kind === "blob-ref";
}

/**
 * Every ref in the payload that still needs uploading, in the order found, with
 * duplicates removed.
 *
 * Order is kept so the progress copy ("Uploading photos… 2 of 5") counts in the
 * order the user placed them, and duplicates are removed so a photo used as both
 * the hero and a memory is uploaded once and shares one URL.
 */
export function collectMediaRefs(payload: unknown): string[] {
  const found: string[] = [];
  const seen = new Set<string>();
  // A payload that references itself would otherwise walk forever. Editor state
  // is plain data today, but this module is called from forty-three of them and
  // an infinite loop inside a save is not a failure worth risking.
  const visited = new WeakSet<object>();

  const walk = (node: unknown): void => {
    if (typeof node === "string") {
      if (isPendingMediaRef(node) && !seen.has(node)) {
        seen.add(node);
        found.push(node);
      }
      return;
    }
    if (!node || typeof node !== "object") return;
    if (node instanceof Date) return;
    if (visited.has(node)) return;
    visited.add(node);

    if (Array.isArray(node)) {
      for (const item of node) walk(item);
      return;
    }
    for (const key of Object.keys(node)) walk((node as Record<string, unknown>)[key]);
  };

  walk(payload);
  return found;
}

/**
 * A copy of the payload with each mapped ref replaced by its uploaded URL.
 *
 * Two rules that are easy to get wrong and expensive to get wrong:
 *
 *   • The input is never mutated. Editor state is React state; writing through
 *     it would change what is on screen behind the user's back mid-save.
 *
 *   • A ref with NO mapping is left exactly as it was. That is the failed-upload
 *     case, and the ref is the only pointer left to the user's photo — the
 *     at-publish upload path can still rescue it. Blanking it would throw the
 *     photo away to make the payload look tidy.
 */
export function replaceMediaRefs<T>(payload: T, map: Record<string, string>): T {
  const rewrite = (node: unknown): unknown => {
    if (typeof node === "string") {
      const replacement = map[node];
      return replacement === undefined ? node : replacement;
    }
    if (!node || typeof node !== "object") return node;
    // `new Date(d)` rather than returning `d`: a structural rewrite that handed
    // back the same Date would share it with the caller's state. Everything else
    // in the returned tree is fresh, and one aliased object is the kind of
    // inconsistency that surfaces months later.
    if (node instanceof Date) return new Date(node.getTime());
    if (Array.isArray(node)) return node.map(rewrite);

    const out: Record<string, unknown> = {};
    for (const key of Object.keys(node)) out[key] = rewrite((node as Record<string, unknown>)[key]);
    return out;
  };

  return rewrite(payload) as T;
}
