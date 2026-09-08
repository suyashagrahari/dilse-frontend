// ─── The toast bus's contract ────────────────────────────────────────────────
//
// Forty-four editors now share this one store, so what used to be forty
// separate small inconsistencies is one behaviour worth pinning down.

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

// `pushToast` is inert without a window, by design — it must not throw during a
// server render. Give it one so the real branches are reachable.
globalThis.window ??= {};

const {
  pushToast,
  dismissToast,
  clearToasts,
  holdToast,
  releaseToast,
  getToasts,
  useToasts,
  TOAST_DURATION,
  TOAST_DEFAULT_DURATION,
  MAX_VISIBLE,
} = await import("./toastBus.ts");

const titles = () => getToasts().map((t) => t.title);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

beforeEach(() => clearToasts());
afterEach(() => clearToasts());

describe("pushToast", () => {
  it("adds the toast and returns a climbing id", () => {
    const a = pushToast({ title: "one", duration: 0 });
    const b = pushToast({ title: "two", duration: 0 });
    assert.ok(b > a, "ids climb, so render order is stable");
    assert.deepEqual(titles(), ["one", "two"]);
  });

  it("defaults the type to info", () => {
    pushToast({ title: "no type", duration: 0 });
    assert.equal(getToasts()[0].type, "info");
  });

  it("keeps what the caller passed", () => {
    pushToast({ title: "t", message: "m", accent: "#abc123", type: "publish", duration: 0 });
    const t = getToasts()[0];
    assert.equal(t.message, "m");
    assert.equal(t.accent, "#abc123");
    assert.equal(t.type, "publish");
  });

  it("removes the toast once its duration is up", async () => {
    pushToast({ title: "quick", duration: 20 });
    assert.equal(getToasts().length, 1);
    await wait(70);
    assert.deepEqual(titles(), [], "the timer should have removed it");
  });

  it("leaves a duration:0 toast up until dismissed by hand", async () => {
    const id = pushToast({ title: "sticky", duration: 0 });
    await wait(40);
    assert.deepEqual(titles(), ["sticky"]);
    dismissToast(id);
    assert.deepEqual(titles(), []);
  });

  it("uses one 3s duration for every type", () => {
    // The forty copies this replaced had drifted to six different numbers for
    // the same event. One value is the only version that stays true after the
    // next template ships, so this asserts sameness rather than an ordering.
    assert.equal(TOAST_DEFAULT_DURATION, 3000);
    for (const type of ["publish", "error", "info", "success"]) {
      assert.equal(TOAST_DURATION[type], TOAST_DEFAULT_DURATION, `${type} should use the shared duration`);
    }
  });

  it("still honours a per-call duration override", async () => {
    // The escape hatch has to work, or the one shared default becomes a reason
    // to reintroduce a bespoke toast.
    pushToast({ title: "brief", duration: 20 });
    await wait(70);
    assert.deepEqual(titles(), []);
  });

  it("caps the stack, dropping the OLDEST", () => {
    for (let i = 1; i <= MAX_VISIBLE + 2; i++) pushToast({ title: `t${i}`, duration: 0 });
    assert.equal(getToasts().length, MAX_VISIBLE);
    // The newest describes what the person just did, so it is the keeper.
    assert.equal(titles().at(-1), `t${MAX_VISIBLE + 2}`);
    assert.ok(!titles().includes("t1"), "the oldest is the one dropped");
  });

  it("cancels the timer of a toast pushed out by the cap", async () => {
    // A leaked timer would later dismiss whatever id had been reused.
    for (let i = 1; i <= MAX_VISIBLE + 1; i++) pushToast({ title: `t${i}`, duration: 30 });
    await wait(80);
    assert.deepEqual(titles(), []);
  });
});

describe("dismissToast", () => {
  it("removes only the one asked for", () => {
    const a = pushToast({ title: "a", duration: 0 });
    pushToast({ title: "b", duration: 0 });
    dismissToast(a);
    assert.deepEqual(titles(), ["b"]);
  });

  it("is idempotent and ignores unknown ids", () => {
    const id = pushToast({ title: "x", duration: 0 });
    dismissToast(id);
    assert.doesNotThrow(() => dismissToast(id));
    assert.doesNotThrow(() => dismissToast(987654));
  });

  it("cancels the pending timer, so a reused id is not dismissed early", async () => {
    const id = pushToast({ title: "early", duration: 30 });
    dismissToast(id);
    pushToast({ title: "survivor", duration: 0 });
    await wait(80);
    assert.deepEqual(titles(), ["survivor"]);
  });
});

describe("hold / release", () => {
  it("holding stops the toast from dismissing itself", async () => {
    const id = pushToast({ title: "hovered", duration: 30 });
    holdToast(id);
    await wait(80);
    assert.deepEqual(titles(), ["hovered"], "a hovered toast must not vanish");
    dismissToast(id);
  });

  it("releasing restarts the countdown", async () => {
    const id = pushToast({ title: "released", duration: 30 });
    holdToast(id);
    await wait(50);
    releaseToast(id);
    assert.deepEqual(titles(), ["released"]);
    await wait(80);
    assert.deepEqual(titles(), []);
  });

  it("a second release does not schedule a second timer", async () => {
    const id = pushToast({ title: "once", duration: 40 });
    holdToast(id);
    releaseToast(id);
    releaseToast(id);
    pushToast({ title: "other", duration: 0 });
    await wait(100);
    assert.deepEqual(titles(), ["other"], "only the held toast should have gone");
  });

  it("never starts a timer for a manual-dismiss toast", async () => {
    const id = pushToast({ title: "sticky", duration: 0 });
    holdToast(id);
    releaseToast(id);
    await wait(60);
    assert.deepEqual(titles(), ["sticky"]);
    dismissToast(id);
  });

  it("releasing a toast that has already gone is a no-op", () => {
    const id = pushToast({ title: "gone", duration: 0 });
    dismissToast(id);
    assert.doesNotThrow(() => releaseToast(id));
    assert.deepEqual(titles(), []);
  });
});

describe("clearToasts", () => {
  it("empties the stack and cancels every timer", async () => {
    pushToast({ title: "a", duration: 30 });
    pushToast({ title: "b", duration: 30 });
    clearToasts();
    assert.deepEqual(titles(), []);
    pushToast({ title: "after", duration: 0 });
    await wait(80);
    assert.deepEqual(titles(), ["after"], "a cancelled timer must not fire later");
  });

  it("is a no-op on an empty store", () => {
    assert.doesNotThrow(() => clearToasts());
  });
});

describe("server rendering", () => {
  it("pushToast adds nothing and still returns an id with no window", () => {
    const saved = globalThis.window;
    delete globalThis.window;
    try {
      const id = pushToast({ title: "ssr" });
      assert.equal(typeof id, "number");
      assert.deepEqual(getToasts(), [], "nothing is stored during a server render");
    } finally {
      globalThis.window = saved;
    }
  });

  it("exposes the hook the host uses", () => {
    assert.equal(typeof useToasts, "function");
  });
});
