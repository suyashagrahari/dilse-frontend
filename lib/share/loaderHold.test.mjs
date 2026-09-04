import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  holdRemainingMs,
  LOADER_MIN_MS,
  LOADER_MIN_MS_ERROR,
  REVEAL_ENDS_MS,
} from "./loaderHold.ts";

describe("the loader floor", () => {
  it("outlasts the reveal, which is the whole point of it", () => {
    // If somebody shortens the floor or lengthens the animation, this is the
    // line that says the loader is being torn away mid-reveal again.
    assert.ok(
      LOADER_MIN_MS > REVEAL_ENDS_MS,
      `the floor (${LOADER_MIN_MS}ms) must outlast the reveal (${REVEAL_ENDS_MS}ms)`
    );
  });

  it("leaves a beat of the finished lockup, but does not linger", () => {
    assert.ok(LOADER_MIN_MS - REVEAL_ENDS_MS >= 250, "no pause on the finished lockup");
    assert.ok(LOADER_MIN_MS <= 2600, "a recipient is waiting on a page, not on us");
  });

  it("holds a dead link for less time than a real page", () => {
    assert.ok(LOADER_MIN_MS_ERROR < LOADER_MIN_MS);
    assert.ok(LOADER_MIN_MS_ERROR >= 600, "an instant error looks like the link was never tried");
  });
});

describe("holdRemainingMs", () => {
  it("waits out the rest of the floor", () => {
    assert.equal(holdRemainingMs(0, true), LOADER_MIN_MS);
    assert.equal(holdRemainingMs(500, true), LOADER_MIN_MS - 500);
  });

  it("waits for nothing once the floor has passed", () => {
    // A slow fetch has already paid the floor; adding to it would be punishing
    // the connection that needed help most.
    assert.equal(holdRemainingMs(LOADER_MIN_MS, true), 0);
    assert.equal(holdRemainingMs(9000, true), 0);
  });

  it("uses the shorter floor for a failure", () => {
    assert.equal(holdRemainingMs(0, false), LOADER_MIN_MS_ERROR);
    assert.equal(holdRemainingMs(LOADER_MIN_MS_ERROR + 1, false), 0);
  });

  it("never returns a negative or a NaN delay", () => {
    // setTimeout with NaN fires immediately, which would silently drop the hold.
    for (const bad of [NaN, Infinity, -Infinity, -500]) {
      const v = holdRemainingMs(bad, true);
      assert.ok(Number.isFinite(v) && v >= 0, `got ${v} for ${bad}`);
    }
  });
});
