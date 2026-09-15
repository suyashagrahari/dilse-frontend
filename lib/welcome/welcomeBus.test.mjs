// ─── The greeting's contract ─────────────────────────────────────────────────
//
// `greetThenRun` sits between "the publish succeeded" and "the creator is told
// it succeeded". Every test here is one assertion in disguise:
//
//     `run` fires EXACTLY ONCE, on every path, whatever the greeting decides.
//
// That is the half that matters. A missed greeting costs a small delight; a
// missed `run` costs somebody the only confirmation that the page they just
// made for someone they love actually went live — and unlike the feedback ask,
// which sits in front of a link they can still reach from their profile, there
// is no second place this message is ever shown.
//
// The rest of the file is about not lying. "Welcome back" said to someone who
// signed up ninety seconds ago, inside this very publish, is the one failure
// that would read as broken rather than absent, so the age rule gets as much
// coverage as the release promise does.

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

// welcomeBus reads `window` and `localStorage` at call time, and answers "do
// not greet" when there is no window at all. Node has none, so the interesting
// branches are unreachable until we supply them.
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

const {
  greetThenRun,
  closeWelcome,
  clearGreeted,
  setViewer,
  shouldGreet,
  firstName,
  RETURNING_AFTER_MS,
  GREET_DEBOUNCE_MS,
} = await import("./welcomeBus.ts");

const HOUR = 60 * 60 * 1000;

/** Publishing requires a session, so "signed in" is the normal case. */
function signIn() {
  localStorage.setItem("gifts_access_token", "token");
}

/** An account created `ageMs` ago. */
function viewerAged(ageMs, name = "Riya Sharma") {
  setViewer({ createdAt: new Date(Date.now() - ageMs).toISOString(), name });
}

/** A counter that also proves `run` was not called twice. */
function counter() {
  const calls = { n: 0 };
  return [() => { calls.n += 1; }, calls];
}

beforeEach(() => {
  closeWelcome();
  localStorage.clear();
  sessionStorage.clear();
  setViewer(null);
});

describe("greetThenRun — the release promise", () => {
  it("runs immediately when nobody is signed in", () => {
    viewerAged(30 * 24 * HOUR);
    const [run, calls] = counter();
    greetThenRun(run);
    assert.equal(calls.n, 1, "the toast must not wait on a greeting that cannot happen");
  });

  it("runs immediately when the bus has no viewer", () => {
    signIn();
    const [run, calls] = counter();
    greetThenRun(run);
    assert.equal(calls.n, 1);
  });

  it("holds the toast while greeting, and releases it on close", () => {
    signIn();
    viewerAged(30 * 24 * HOUR);
    const [run, calls] = counter();

    greetThenRun(run);
    assert.equal(calls.n, 0, "the toast is held behind the greeting, not shown under it");

    closeWelcome();
    assert.equal(calls.n, 1);
  });

  it("releases exactly once however many times it is closed", () => {
    signIn();
    viewerAged(30 * 24 * HOUR);
    const [run, calls] = counter();

    greetThenRun(run);
    closeWelcome();
    closeWelcome();
    closeWelcome();
    assert.equal(calls.n, 1, "a tap and the timer can land in the same frame");
  });

  it("survives a callback that throws, and stays closed", () => {
    signIn();
    viewerAged(30 * 24 * HOUR);

    greetThenRun(() => {
      throw new Error("the toast host exploded");
    });
    assert.doesNotThrow(closeWelcome, "a thrown toast must not leave the overlay up");
    // And the greeting is genuinely gone: the next publish is greetable again
    // only on its own merits, not blocked by a stuck slot.
    clearGreeted();
    const [run, calls] = counter();
    greetThenRun(run);
    closeWelcome();
    assert.equal(calls.n, 1);
  });

  it("queues a second publish toast behind the greeting rather than under it", () => {
    signIn();
    viewerAged(30 * 24 * HOUR);
    const order = [];
    const first = () => order.push("first");
    const second = () => order.push("second");

    greetThenRun(first);
    greetThenRun(second);

    // Shown immediately, the second toast would flash under the scrim as a
    // blurred smear and be gone before the greeting lifted.
    assert.deepEqual(order, [], "nothing is shown while the mascot is up");

    closeWelcome();
    assert.deepEqual(order, ["first", "second"], "both land, in order, on a clear screen");
  });

  it("still releases both if the first release throws", () => {
    signIn();
    viewerAged(30 * 24 * HOUR);
    const [second, secondCalls] = counter();

    greetThenRun(() => { throw new Error("toast host exploded"); });
    greetThenRun(second);

    assert.doesNotThrow(closeWelcome);
    assert.equal(secondCalls.n, 1, "a broken first toast must not swallow the second");
  });
});

describe("who counts as returning", () => {
  it("does not greet an account created inside this very publish", () => {
    signIn();
    viewerAged(90 * 1000);
    const [run, calls] = counter();
    greetThenRun(run);
    assert.equal(calls.n, 1, "a brand-new creator goes straight to their toast");
  });

  it("does not greet just under the threshold, and does just over it", () => {
    signIn();

    viewerAged(RETURNING_AFTER_MS - 60 * 1000);
    assert.equal(shouldGreet(), false);

    viewerAged(RETURNING_AFTER_MS + 60 * 1000);
    assert.equal(shouldGreet(), true);
  });

  it("stays silent when createdAt is missing or unparseable", () => {
    signIn();

    setViewer({ name: "Riya" });
    assert.equal(shouldGreet(), false, "an older cached user object has no field");

    setViewer({ createdAt: "not a date", name: "Riya" });
    assert.equal(shouldGreet(), false);

    const [run, calls] = counter();
    greetThenRun(run);
    assert.equal(calls.n, 1);
  });

  it("stays silent for a clock skewed into the future", () => {
    signIn();
    viewerAged(-48 * HOUR);
    assert.equal(shouldGreet(), false, "a future createdAt must fail towards silence");
  });
});

describe("how often", () => {
  it("does not stutter when the same card is republished seconds later", () => {
    signIn();
    viewerAged(30 * 24 * HOUR);

    const [first, firstCalls] = counter();
    greetThenRun(first);
    closeWelcome();
    assert.equal(firstCalls.n, 1);

    // Publish, spot a typo, fix it, publish again: one card, two toasts.
    const [second, secondCalls] = counter();
    greetThenRun(second);
    assert.equal(secondCalls.n, 1, "the toast still shows");
    assert.equal(shouldGreet(), false, "but not a second hello in the same breath");
  });

  it("greets the NEXT card, not just the next day", () => {
    signIn();
    viewerAged(30 * 24 * HOUR);

    greetThenRun(() => {});
    closeWelcome();
    assert.equal(shouldGreet(), false);

    // A couple of minutes later — a different card, a different moment. This is
    // the case the old twelve-hour cap got wrong, which is why it is gone.
    localStorage.setItem("ss_welcome_greeted", String(Date.now() - GREET_DEBOUNCE_MS - 1000));
    assert.equal(shouldGreet(), true);

    const [run, calls] = counter();
    greetThenRun(run);
    assert.equal(calls.n, 0, "and it really does greet again");
    closeWelcome();
    assert.equal(calls.n, 1);
  });

  it("marks the greeting as given when it is raised, not when it ends", () => {
    signIn();
    viewerAged(30 * 24 * HOUR);

    greetThenRun(() => {});
    assert.notEqual(
      localStorage.getItem("ss_welcome_greeted"),
      null,
      "somebody who taps it away has still been greeted"
    );
    closeWelcome();
  });
});

describe("firstName", () => {
  it("takes the first word of a real name", () => {
    assert.equal(firstName("Riya Sharma"), "Riya");
    assert.equal(firstName("  Arjun  "), "Arjun");
  });

  it("returns empty rather than greeting a login", () => {
    // The copy reads correctly with no name, so anything doubtful is dropped.
    assert.equal(firstName("user_9f2a"), "");
    assert.equal(firstName("riya.sharma"), "");
    assert.equal(firstName("abhinav@hirequotient.com"), "");
    assert.equal(firstName("rahul123"), "");
    assert.equal(firstName(""), "");
    assert.equal(firstName(null), "");
    assert.equal(firstName(undefined), "");
    assert.equal(firstName("Bartholomewmaximilianus"), "", "would wrap onto two lines");
  });
});
