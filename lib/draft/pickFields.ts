// ─── Projecting a saved document onto an editor's own shape ──────────────────
//
// Split out of `resume.ts` for the same reason `mediaRefs.ts` carries no
// imports: this is the part that decides what a reopened page contains, so it is
// the part that has to be tested, and the client has no test runner or jsdom.
// Dependency-free means `node --test` strips the types and imports it directly.
//
// ── WHY A PROJECTION AND NOT A FIELD LIST PER TEMPLATE ──────────────────────
//
// The thirty-seven editors that already resume each hand-map their fields:
//
//     recipientName: d.recipientName || "",
//     homeWishMessage: d.homeWishMessage || DEMO_DATA.homeWishMessage,
//     ...
//
// Two things go wrong with that, and both are in this repo already. A field
// added to a template later is not added to its loader, so it silently stops
// surviving a reopen. And `||` treats `false`, `0` and `""` as absent, so a
// toggle the user turned OFF comes back ON — which is not the page they saved.
//
// This derives the field list from the editor's own defaults instead. A new
// field works the moment it exists in the demo shape, and only `undefined` and
// `null` fall back.

/**
 * The saved document projected onto the editor's own content shape.
 *
 * Only keys present in `defaults` are taken, which is what keeps `_id`,
 * `userId`, `isPublished`, `shareId`, `viewCount` — and `password` — out of
 * editor state and out of the next save's body.
 */
export function pickKnownFields<T extends object>(defaults: T, doc: unknown): T {
  if (!doc || typeof doc !== "object" || Array.isArray(doc)) return { ...defaults };

  const src = doc as Record<string, unknown>;
  const out = { ...defaults } as Record<string, unknown>;

  for (const key of Object.keys(defaults)) {
    const value = src[key];
    // `undefined` is "the document does not have it"; `null` is Mongo's answer
    // for a field explicitly unset, and an editor handed null where it expects a
    // string is a crash rather than an empty field. Everything else is taken as
    // it stands — including `false`, `0` and `""`, which ARE the user's answer.
    if (value === undefined || value === null) continue;
    out[key] = value;
  }

  return out as T;
}
