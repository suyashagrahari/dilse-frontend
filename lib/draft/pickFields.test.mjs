// ─── Reopening a saved page into an editor's own shape ──────────────────────
//
// Run: npm run draft:test

import { test } from "node:test";
import assert from "node:assert/strict";

import { pickKnownFields } from "./pickFields.ts";

const DEMO = {
  recipientName: "",
  senderName: "",
  message: "Happy day",
  memories: [],
  count: 3,
  showConfetti: true,
};

test("takes the saved value for every field the editor knows", () => {
  const out = pickKnownFields(DEMO, {
    recipientName: "Priya",
    senderName: "Rahul",
    message: "See you soon",
    memories: [{ url: "https://cdn/a.webp" }],
    count: 7,
    showConfetti: false,
  });
  assert.deepEqual(out, {
    recipientName: "Priya",
    senderName: "Rahul",
    message: "See you soon",
    memories: [{ url: "https://cdn/a.webp" }],
    count: 7,
    showConfetti: false,
  });
});

test("keeps the default where the document has nothing", () => {
  const out = pickKnownFields(DEMO, { recipientName: "Priya" });
  assert.equal(out.recipientName, "Priya");
  assert.equal(out.message, "Happy day", "an absent field keeps its default");
  assert.equal(out.count, 3);
  assert.equal(out.showConfetti, true);
});

test("DROPS fields the editor does not know", () => {
  // The response carries _id, userId, isPublished, shareId, viewCount,
  // createdAt and more. Spreading the whole document into editor state puts all
  // of that into the next save's body, where the server either rejects it or —
  // worse — accepts it and the editor starts round-tripping fields it does not
  // manage.
  const out = pickKnownFields(DEMO, {
    recipientName: "Priya",
    _id: "68b0f1",
    userId: "68a2c4",
    isPublished: true,
    shareId: "abc-123",
    viewCount: 91,
    password: "hunter2",
  });
  assert.equal(out.recipientName, "Priya");
  assert.ok(!("_id" in out));
  assert.ok(!("userId" in out));
  assert.ok(!("isPublished" in out));
  assert.ok(!("password" in out), "a password must never reach editor content");
});

test("false, 0 and empty string are kept, not treated as absent", () => {
  // The bug a `||` chain produces. `showConfetti: false` reverting to true, or
  // a count of 0 reverting to 3, is the page not being the one they saved.
  const out = pickKnownFields(DEMO, { showConfetti: false, count: 0, message: "" });
  assert.equal(out.showConfetti, false);
  assert.equal(out.count, 0);
  assert.equal(out.message, "");
});

test("null in the document falls back to the default", () => {
  // Mongo returns null for a field explicitly unset. An editor rendering null
  // where it expects a string is a crash, not an empty field.
  const out = pickKnownFields(DEMO, { message: null, memories: null });
  assert.equal(out.message, "Happy day");
  assert.deepEqual(out.memories, []);
});

test("a malformed document yields the defaults unchanged", () => {
  for (const bad of [null, undefined, "text", 42, []]) {
    assert.deepEqual(pickKnownFields(DEMO, bad), DEMO, `should ignore ${JSON.stringify(bad)}`);
  }
});

test("does not mutate the defaults it was given", () => {
  const defaults = { ...DEMO, memories: [] };
  const out = pickKnownFields(defaults, { memories: [{ url: "x" }], recipientName: "Priya" });
  assert.deepEqual(defaults.memories, [], "DEMO_DATA is module-level and shared");
  assert.equal(defaults.recipientName, "");
  assert.notEqual(out, defaults);
});
