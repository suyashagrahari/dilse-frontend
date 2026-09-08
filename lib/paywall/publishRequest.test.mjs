// ─── The publish gate's contract ─────────────────────────────────────────────
//
// `ensurePublishAllowed` sits between "the creator pressed Publish" and the
// publish request itself, on all 43 templates that publish. It is the only
// thing standing between a paid template and a free page, and it had no tests.
//
// ── WHAT THESE ARE REALLY ASSERTING ─────────────────────────────────────────
//
// Two properties, and they pull in opposite directions:
//
//   1. IT FAILS OPEN. Every way the check can fail to get an answer — no
//      pageId, a non-200, a malformed body, a thrown fetch, "payment owed" with
//      no usable price — returns "allowed" and lets the publish proceed. That is
//      deliberate: the server refuses with a 402 of its own, so a broken check
//      costs us a paywall impression, while a check that fails CLOSED would
//      block paying customers from publishing when our own API blips.
//
//   2. IT NEVER LEAVES THE SPINNER UP. Several editors render a full-screen
//      "Publishing…" overlay off `setBusy`. The rule is that busy goes OFF
//      before the check and only comes back on the way to an actual publish —
//      otherwise the overlay sits behind the paywall, which is the exact bug
//      this function was written to fix.
//
// Both are invisible in a screenshot and both are load-bearing, which is why
// they are pinned here rather than left to a manual pass.

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

// The module reads window storage at call time and calls fetch. Neither exists
// in Node, and the point of several of these tests is what happens when the
// network misbehaves, so both are stubbed rather than reached.
function fakeStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    clear: () => map.clear(),
  };
}
const localStorage = fakeStorage();
const sessionStorage = fakeStorage();
globalThis.window = { localStorage, sessionStorage };
globalThis.localStorage = localStorage;
globalThis.sessionStorage = sessionStorage;

const { ensurePublishAllowed } = await import("./publishRequest.ts");

const realFetch = globalThis.fetch;
/** Calls made during one test, so a test can assert the network was not used. */
let calls = [];

function stubFetch(impl) {
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    return impl(String(url), init);
  };
}
const json = (body, ok = true, status = 200) => ({
  ok,
  status,
  json: async () => body,
});

/** Records the busy flag in order, so the sequence can be asserted. */
function busyRecorder() {
  const seen = [];
  return { seen, setBusy: (v) => seen.push(v) };
}

const CTX = {
  slug: "streak",
  templateType: "streak",
  pageId: "page_123",
  templateTitle: "Streak",
};

beforeEach(() => {
  calls = [];
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem("gifts_access_token", "token");
});
afterEach(() => {
  globalThis.fetch = realFetch;
});

describe("ensurePublishAllowed — nothing to price yet", () => {
  it("allows and makes NO network call when there is no pageId", async () => {
    stubFetch(() => json({ success: true, data: { needsPayment: true } }));
    const r = await ensurePublishAllowed({ ...CTX, pageId: null });
    assert.equal(r, "allowed");
    assert.equal(calls.length, 0, "an unsaved page has nothing to price against");
  });

  it("does not touch the busy flag when it returns early", async () => {
    const { seen, setBusy } = busyRecorder();
    stubFetch(() => json({ success: true, data: { needsPayment: false } }));
    await ensurePublishAllowed({ ...CTX, pageId: "" }, setBusy);
    assert.deepEqual(seen, [], "nothing was started, so nothing to stop");
  });
});

describe("ensurePublishAllowed — the happy path", () => {
  it("allows when the server says nothing is owed", async () => {
    stubFetch(() => json({ success: true, data: { needsPayment: false } }));
    assert.equal(await ensurePublishAllowed(CTX), "allowed");
  });

  it("asks about THIS page and THIS template", async () => {
    stubFetch(() => json({ success: true, data: { needsPayment: false } }));
    await ensurePublishAllowed(CTX);
    assert.equal(calls.length, 1);
    assert.match(calls[0].url, /\/payment\/access\?/);
    assert.match(calls[0].url, /templateType=streak/);
    assert.match(calls[0].url, /pageId=page_123/);
  });

  it("sends the access token it finds in storage", async () => {
    stubFetch(() => json({ success: true, data: { needsPayment: false } }));
    await ensurePublishAllowed(CTX);
    const sent = new Headers(calls[0].init.headers);
    assert.equal(sent.get("authorization"), "Bearer token");
  });

  it("prefers an impersonation token over the normal one", async () => {
    // Support staff acting as a user must be priced as that user.
    sessionStorage.setItem("gifts_impersonation_token", "imp");
    stubFetch(() => json({ success: true, data: { needsPayment: false } }));
    await ensurePublishAllowed(CTX);
    assert.equal(new Headers(calls[0].init.headers).get("authorization"), "Bearer imp");
  });

  it("never serves a cached answer", async () => {
    // A price cached from before a payment would show a paid user a paywall.
    stubFetch(() => json({ success: true, data: { needsPayment: false } }));
    await ensurePublishAllowed(CTX);
    assert.equal(calls[0].init.cache, "no-store");
  });

  it("drops busy for the check, then restores it for the publish", async () => {
    const { seen, setBusy } = busyRecorder();
    stubFetch(() => json({ success: true, data: { needsPayment: false } }));
    await ensurePublishAllowed(CTX, setBusy);
    assert.deepEqual(seen, [false, true], "off before the question, on again on the way to publish");
  });
});

describe("ensurePublishAllowed — fails OPEN, every way it can fail", () => {
  const failures = [
    ["a non-200", () => json({ success: false, error: "nope" }, false, 500)],
    ["a 403 for a page the user does not own", () => json({ success: false }, false, 403)],
    ["success:false in a 200 body", () => json({ success: false })],
    ["a thrown fetch", () => { throw new Error("offline"); }],
    ["a body with no data at all", () => json({ success: true })],
  ];

  for (const [label, impl] of failures) {
    it(`allows on ${label}`, async () => {
      stubFetch(impl);
      assert.equal(await ensurePublishAllowed(CTX), "allowed");
    });

    it(`restores busy on ${label}`, async () => {
      const { seen, setBusy } = busyRecorder();
      stubFetch(impl);
      await ensurePublishAllowed(CTX, setBusy);
      assert.equal(seen.at(-1), true, "the spinner must not be left down on the way to a publish");
    });
  }

  it("allows when payment is owed but the price is unusable", async () => {
    // Better to let the server refuse with a message than to raise a paywall
    // with no number in it.
    stubFetch(() => json({ success: true, data: { needsPayment: true, pricing: { nonsense: true } } }));
    const { seen, setBusy } = busyRecorder();
    assert.equal(await ensurePublishAllowed(CTX, setBusy), "allowed");
    assert.equal(seen.at(-1), true);
  });

  it("allows when payment is owed and pricing is missing entirely", async () => {
    stubFetch(() => json({ success: true, data: { needsPayment: true } }));
    assert.equal(await ensurePublishAllowed(CTX), "allowed");
  });
});
