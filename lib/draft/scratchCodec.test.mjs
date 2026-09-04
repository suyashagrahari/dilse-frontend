// ─── What we are willing to read back out of a browser ──────────────────────
//
// Run: npm run draft:test

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  SCRATCH_SCHEMA_VERSION,
  encodeScratch,
  decodeScratch,
  hasContentChanged,
  fingerprint,
} from "./scratchCodec.ts";

// ── round trip ──────────────────────────────────────────────────────────────

test("round-trips a payload", () => {
  const data = { recipientName: "Priya", memories: [{ url: "idb:1" }] };
  const decoded = decodeScratch(encodeScratch("holi", data), "holi");
  assert.deepEqual(decoded, data);
});

test("stamps the current schema version and a timestamp", () => {
  const s = encodeScratch("holi", { a: 1 });
  assert.equal(s.schemaVersion, SCRATCH_SCHEMA_VERSION);
  assert.equal(s.templateType, "holi");
  assert.ok(s.updatedAt > 0);
});

// ── refusing what we cannot trust ───────────────────────────────────────────

test("refuses scratch written by an older schema", () => {
  // The alternative is feeding a shape the editor no longer understands into a
  // form, which renders as a half-empty page the user did not write.
  const stale = { ...encodeScratch("holi", { a: 1 }), schemaVersion: SCRATCH_SCHEMA_VERSION - 1 };
  assert.equal(decodeScratch(stale, "holi"), null);
});

test("refuses scratch written by a NEWER schema", () => {
  // Two tabs on two deploys. The newer one wins its own writes; the older one
  // must not try to read them.
  const future = { ...encodeScratch("holi", { a: 1 }), schemaVersion: SCRATCH_SCHEMA_VERSION + 1 };
  assert.equal(decodeScratch(future, "holi"), null);
});

test("refuses another template's scratch", () => {
  // One store, one slot per template. A key collision must not put holi content
  // into the wedding editor.
  assert.equal(decodeScratch(encodeScratch("holi", { a: 1 }), "wedding"), null);
});

test("refuses malformed records instead of throwing", () => {
  for (const bad of [null, undefined, 42, "text", {}, { schemaVersion: SCRATCH_SCHEMA_VERSION }, []]) {
    assert.equal(decodeScratch(bad, "holi"), null, `should refuse ${JSON.stringify(bad)}`);
  }
});

test("refuses a record whose data is absent", () => {
  const s = encodeScratch("holi", { a: 1 });
  assert.equal(decodeScratch({ ...s, data: undefined }, "holi"), null);
});

test("keeps a payload that is legitimately empty", () => {
  // An editor whose content is an empty object has still been opened, and that
  // is different from having no scratch at all.
  assert.deepEqual(decodeScratch(encodeScratch("holi", {}), "holi"), {});
});

// ── the dirty check ─────────────────────────────────────────────────────────

test("identical content is not a change", () => {
  const a = { name: "Priya", n: 1 };
  assert.equal(hasContentChanged(fingerprint(a), { name: "Priya", n: 1 }), false);
});

test("key order is not a change", () => {
  // React state rebuilds objects constantly. Key order shifting must not spend a
  // network round trip, or milestone saves become per-render saves.
  assert.equal(hasContentChanged(fingerprint({ a: 1, b: 2 }), { b: 2, a: 1 }), false);
});

test("a real edit is a change", () => {
  assert.equal(hasContentChanged(fingerprint({ name: "Priya" }), { name: "Priya Sharma" }), true);
});

test("array order IS a change", () => {
  // Reordering memories is an edit the user made deliberately.
  assert.equal(hasContentChanged(fingerprint({ m: [1, 2] }), { m: [2, 1] }), true);
});

test("no previous fingerprint means everything is a change", () => {
  assert.equal(hasContentChanged(null, { a: 1 }), true);
});

test("undefined and a missing key fingerprint the same", () => {
  // `{a:1, b:undefined}` and `{a:1}` are the same document once saved, because
  // JSON has no undefined. Treating them as different would save on every render
  // for any editor that clears a field by setting it undefined.
  assert.equal(fingerprint({ a: 1, b: undefined }), fingerprint({ a: 1 }));
});
