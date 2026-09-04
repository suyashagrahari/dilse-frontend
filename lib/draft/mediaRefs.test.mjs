// ─── Finding and rewriting the photos inside an arbitrary editor payload ─────
//
// These are the tests that matter most in the draft feature, because this is the
// module that can lose or duplicate a user's photos.
//
// Run: npm run draft:test

import { test } from "node:test";
import assert from "node:assert/strict";

import { classifyMediaRef, collectMediaRefs, replaceMediaRefs } from "./mediaRefs.ts";

// ── classify ────────────────────────────────────────────────────────────────

test("classifies a base64 data URL as pending upload", () => {
  assert.equal(classifyMediaRef("data:image/png;base64,iVBORw0KGgo="), "data-url");
  assert.equal(classifyMediaRef("data:image/jpeg;base64,/9j/4AAQ"), "data-url");
});

test("classifies an idb: ref as pending upload", () => {
  assert.equal(classifyMediaRef("idb:8f14e45fceea167a5a36dedd4bea2543"), "blob-ref");
});

test("classifies an already-uploaded CDN URL as remote", () => {
  assert.equal(classifyMediaRef("https://cdn.subhsandesh.in/holi/users/abc/2026/09/1-x.webp"), "remote");
  assert.equal(classifyMediaRef("http://example.com/a.png"), "remote");
});

test("a blob: object URL is remote to us — it is not ours to upload", () => {
  // These are per-tab handles created by the browser. They are dead the moment
  // the tab closes, so a draft must never carry one, but they are also not
  // something this module can turn into bytes. Treating one as pending would
  // mean an upload attempt that always fails.
  assert.equal(classifyMediaRef("blob:https://subhsandesh.in/9a7-4c2"), "remote");
});

test("empty, whitespace and non-strings are nothing at all", () => {
  assert.equal(classifyMediaRef(""), "none");
  assert.equal(classifyMediaRef("   "), "none");
  assert.equal(classifyMediaRef(undefined), "none");
  assert.equal(classifyMediaRef(null), "none");
  assert.equal(classifyMediaRef(42), "none");
  assert.equal(classifyMediaRef("Priya"), "none");
});

// ── collect ─────────────────────────────────────────────────────────────────

test("collects refs from nested objects and arrays", () => {
  const payload = {
    recipientName: "Priya",
    photoUrl: "data:image/png;base64,AAA",
    shagun: { qrImageUrl: "idb:qr-1" },
    memories: [
      { caption: "Goa", url: "idb:m-1" },
      { caption: "Diwali", url: "data:image/png;base64,BBB" },
    ],
  };

  assert.deepEqual(collectMediaRefs(payload), [
    "data:image/png;base64,AAA",
    "idb:qr-1",
    "idb:m-1",
    "data:image/png;base64,BBB",
  ]);
});

test("THE EXPENSIVE BUG: an already-remote URL is never collected", () => {
  // Adoption runs on sign-in, and a draft can be adopted, saved, reopened and
  // saved again. If a CDN URL that came back from a previous upload were
  // collected as pending, every save would re-upload every photo — silently
  // multiplying S3 objects and the bill, with nothing broken on screen to show
  // for it.
  const payload = {
    photoUrl: "https://cdn.subhsandesh.in/holi/users/abc/2026/09/1-x.webp",
    memories: [{ url: "idb:new-one" }],
  };
  assert.deepEqual(collectMediaRefs(payload), ["idb:new-one"]);
});

test("deduplicates a ref used in two places", () => {
  const payload = { a: "idb:same", b: { c: "idb:same" } };
  assert.deepEqual(collectMediaRefs(payload), ["idb:same"]);
});

test("survives cycles rather than hanging", () => {
  const payload = { photoUrl: "idb:one" };
  payload.self = payload;
  assert.deepEqual(collectMediaRefs(payload), ["idb:one"]);
});

test("collects nothing from a payload with no photos", () => {
  assert.deepEqual(collectMediaRefs({ recipientName: "Priya", count: 3 }), []);
});

// ── replace ─────────────────────────────────────────────────────────────────

test("rewrites every occurrence and leaves everything else alone", () => {
  const payload = {
    recipientName: "Priya",
    photoUrl: "idb:hero",
    memories: [{ caption: "Goa", url: "idb:hero" }, { caption: "Home", url: "idb:m2" }],
    count: 3,
    live: true,
  };

  const out = replaceMediaRefs(payload, {
    "idb:hero": "https://cdn.subhsandesh.in/a.webp",
    "idb:m2": "https://cdn.subhsandesh.in/b.webp",
  });

  assert.equal(out.photoUrl, "https://cdn.subhsandesh.in/a.webp");
  assert.equal(out.memories[0].url, "https://cdn.subhsandesh.in/a.webp");
  assert.equal(out.memories[1].url, "https://cdn.subhsandesh.in/b.webp");
  assert.equal(out.memories[0].caption, "Goa");
  assert.equal(out.recipientName, "Priya");
  assert.equal(out.count, 3);
  assert.equal(out.live, true);
});

test("a ref with no mapping is left as it was", () => {
  // Upload failed for that one photo. Leaving the ref means the local blob is
  // still findable and the at-publish upload path can still rescue it. Blanking
  // it would destroy the only pointer to the user's photo.
  const out = replaceMediaRefs({ photoUrl: "idb:hero" }, {});
  assert.equal(out.photoUrl, "idb:hero");
});

test("does not mutate the payload it was given", () => {
  const payload = { photoUrl: "idb:hero", memories: [{ url: "idb:hero" }] };
  const out = replaceMediaRefs(payload, { "idb:hero": "https://cdn.subhsandesh.in/a.webp" });
  assert.equal(payload.photoUrl, "idb:hero", "original must be untouched");
  assert.equal(payload.memories[0].url, "idb:hero");
  assert.notEqual(out, payload);
});

test("preserves Date and null rather than turning them into {}", () => {
  const when = new Date("2026-09-03T00:00:00.000Z");
  const out = replaceMediaRefs({ when, nothing: null, photoUrl: "idb:h" }, { "idb:h": "https://c/a.webp" });
  assert.ok(out.when instanceof Date, "a Date must survive the rewrite");
  assert.equal(out.when.toISOString(), when.toISOString());
  assert.equal(out.nothing, null);
});
