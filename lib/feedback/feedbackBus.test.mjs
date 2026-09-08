// ─── The gate's contract ─────────────────────────────────────────────────────
//
// `askThenRun` is the single door between "the creator tapped Share" and "the
// creator has their link". Every test here is really one assertion in disguise:
//
//     `run` fires EXACTLY ONCE, on every path, whatever the ask decides.
//
// That matters more than the feedback itself. Losing a rating costs a data
// point; losing `run` costs somebody the link to the page they just made for
// someone they love, with no way back to it. So the ask is best-effort and the
// reveal is not, and these tests are written to fail loudly if that ever flips.

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

// feedbackBus reads `window`, `localStorage` and `sessionStorage` at call time,
// and returns "do not ask" when there is no window at all. Node has none, so
// the interesting branches are unreachable until we supply them.
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

const { askThenRun, closeFeedback, clearAsked, wasAsked } = await import("./feedbackBus.ts");

/** Publishing requires a session, so "signed in" is the normal case. */
function signIn() {
  localStorage.setItem("gifts_access_token", "token");
}

const ctx = (pageUrl) => ({ templateSlug: "holi", pageUrl });

beforeEach(() => {
  closeFeedback();
  localStorage.clear();
  sessionStorage.clear();
});

describe("askThenRun — the reveal always happens", () => {
  it("reveals immediately when nobody is signed in", () => {
    // A reply is an email, so there is nowhere to send feedback from a
    // signed-out visitor. The link must still arrive.
    let revealed = 0;
    askThenRun(ctx("https://s.in/a"), () => revealed++);
    assert.equal(revealed, 1);
  });

  it("holds the reveal while the modal is up, then releases it once", () => {
    signIn();
    let revealed = 0;
    askThenRun(ctx("https://s.in/b"), () => revealed++);
    assert.equal(revealed, 0, "the sheet must not open underneath the modal");
    closeFeedback();
    assert.equal(revealed, 1);
  });

  it("does not reveal twice when close is called twice", () => {
    // A double-fire here would open the share sheet on top of itself.
    signIn();
    let revealed = 0;
    askThenRun(ctx("https://s.in/c"), () => revealed++);
    closeFeedback();
    closeFeedback();
    assert.equal(revealed, 1);
  });

  it("reveals immediately the second time — one ask per page, ever", () => {
    signIn();
    let first = 0;
    askThenRun(ctx("https://s.in/d"), () => first++);
    closeFeedback();
    assert.equal(first, 1);

    // Same page, tapped Share again. Already answered, so straight to the link.
    let second = 0;
    askThenRun(ctx("https://s.in/d"), () => second++);
    assert.equal(second, 1, "a second Share tap must not re-ask");
  });

  it("still counts as asked when the modal was dismissed, not answered", () => {
    // `markAsked` is written when the modal is RAISED. Somebody who dismissed
    // it has answered the question of whether they want to be asked.
    signIn();
    askThenRun(ctx("https://s.in/e"), () => {});
    closeFeedback();
    assert.equal(wasAsked("https://s.in/e"), true);
  });

  it("asks again for a DIFFERENT page", () => {
    signIn();
    let revealed = 0;
    askThenRun(ctx("https://s.in/f"), () => revealed++);
    closeFeedback();
    let other = 0;
    askThenRun(ctx("https://s.in/g"), () => other++);
    assert.equal(other, 0, "a new page is a new question");
    closeFeedback();
    assert.equal(other, 1);
  });

  it("queues a second reveal behind an open modal instead of dropping it", () => {
    // Two reveals racing is the shape that used to open a sheet under the
    // modal. Both must arrive, and only after the modal closes.
    signIn();
    const order = [];
    askThenRun(ctx("https://s.in/h"), () => order.push("first"));
    askThenRun(ctx("https://s.in/i"), () => order.push("second"));
    assert.deepEqual(order, []);
    closeFeedback();
    assert.deepEqual(order, ["first", "second"]);
  });

  it("reveals even when there is no URL to ask about", () => {
    signIn();
    let revealed = 0;
    askThenRun(ctx(""), () => revealed++);
    assert.equal(revealed, 1);
  });

  it("survives a reveal callback that throws, leaving the modal closed", () => {
    signIn();
    askThenRun(ctx("https://s.in/j"), () => {
      throw new Error("share sheet blew up");
    });
    assert.doesNotThrow(() => closeFeedback());
    // The bus is usable afterwards rather than wedged with a stuck modal.
    let after = 0;
    askThenRun(ctx("https://s.in/k"), () => after++);
    closeFeedback();
    assert.equal(after, 1);
  });

  it("treats unavailable storage as 'not asked' rather than crashing", () => {
    // Private mode throws on read. Erring towards asking is recoverable; a
    // template whose Share button throws is not.
    signIn();
    const real = globalThis.window.localStorage.getItem;
    globalThis.window.localStorage.getItem = () => {
      throw new Error("storage disabled");
    };
    try {
      assert.equal(wasAsked("https://s.in/l"), false);
    } finally {
      globalThis.window.localStorage.getItem = real;
    }
  });

  it("clearAsked lets a page be asked about again", () => {
    signIn();
    askThenRun(ctx("https://s.in/m"), () => {});
    closeFeedback();
    clearAsked("https://s.in/m");
    let revealed = 0;
    askThenRun(ctx("https://s.in/m"), () => revealed++);
    assert.equal(revealed, 0, "cleared, so it asks again and holds the reveal");
    closeFeedback();
    assert.equal(revealed, 1);
  });

  it("recognises an impersonation session too", () => {
    // Support staff acting as a user are signed in for this purpose.
    sessionStorage.setItem("gifts_impersonation_token", "t");
    let revealed = 0;
    askThenRun(ctx("https://s.in/n"), () => revealed++);
    assert.equal(revealed, 0, "should have asked, holding the reveal");
    closeFeedback();
    assert.equal(revealed, 1);
  });
});
