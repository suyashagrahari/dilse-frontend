import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  holdRemainingMs,
  letterDelayMs,
  loaderCssVars,
  LOADER_MIN_MS,
  LOADER_MIN_MS_ERROR,
  LOADER_SEQUENCE,
  SEQUENCE_ENDS_MS,
  SETTLE_MS,
  stageEnd,
} from "./loaderHold.ts";

describe("stageEnd", () => {
  it("adds the duration to the start", () => {
    assert.equal(stageEnd({ start: 100, duration: 400 }), 500);
  });

  it("waits for the LAST staggered item, not the first", () => {
    // The wordmark's eleven letters each start 58ms after the one before, so
    // the stage is not over until the eleventh has finished resolving.
    assert.equal(stageEnd({ start: 0, duration: 100, stagger: 10, count: 5 }), 140);
  });

  it("ignores a stagger with no count, and a count with no stagger", () => {
    assert.equal(stageEnd({ start: 0, duration: 100, stagger: 10 }), 100);
    assert.equal(stageEnd({ start: 0, duration: 100, count: 5 }), 100);
  });
});

describe("the sequence", () => {
  it("holds the page until EVERY stage has finished", () => {
    // The whole point. A stage that outlasts the floor is a stage the
    // recipient sees cut in half — which is exactly what an infinitely
    // looping sheen and a 2000ms floor used to do.
    for (const [name, stage] of Object.entries(LOADER_SEQUENCE)) {
      assert.ok(
        stageEnd(stage) <= LOADER_MIN_MS,
        `${name} ends at ${stageEnd(stage)}ms but the loader leaves at ${LOADER_MIN_MS}ms`
      );
    }
  });

  it("ends with the sheen and the bar together", () => {
    // The finale: the highlight finishes crossing the name exactly as the bar
    // reaches the end, and that is the moment the page opens.
    assert.equal(stageEnd(LOADER_SEQUENCE.sheen), SEQUENCE_ENDS_MS);
    assert.equal(stageEnd(LOADER_SEQUENCE.bar), SEQUENCE_ENDS_MS);
  });

  it("plays in a readable order", () => {
    const { plate, letters, subline, devanagari, sheen } = LOADER_SEQUENCE;
    assert.ok(plate.start < letters.start, "the mark lands before the name writes itself");
    assert.ok(letters.start < subline.start);
    assert.ok(subline.start < devanagari.start);
    assert.ok(stageEnd(letters) <= sheen.start, "the sheen crosses a FINISHED wordmark");
  });

  it("leaves a breath on the finished lockup, then goes", () => {
    assert.equal(LOADER_MIN_MS, SEQUENCE_ENDS_MS + SETTLE_MS);
    assert.ok(SETTLE_MS >= 150, "replacing the loader on the last frame reads as an interruption");
    assert.ok(LOADER_MIN_MS <= 4000, "a recipient is waiting on a page, not on us");
  });

  it("holds a dead link for far less time", () => {
    assert.ok(LOADER_MIN_MS_ERROR < SEQUENCE_ENDS_MS);
    assert.ok(LOADER_MIN_MS_ERROR >= 600, "an instant error looks like the link was never tried");
  });
});

describe("loaderCssVars", () => {
  it("gives every value a unit", () => {
    // A unitless number in animation-delay is invalid, and an invalid delay is
    // silently treated as 0 — the stage would play immediately and be missed.
    for (const [key, value] of Object.entries(loaderCssVars())) {
      assert.match(value, /^\d+ms$/, `${key} = ${value}`);
      assert.match(key, /^--ssbl-/);
    }
  });

  it("provides EVERY custom property the loader's stylesheet reads", () => {
    // The real drift risk. A renamed variable leaves 'animation-delay:
    // var(--gone)' resolving to nothing, which invalidates the declaration —
    // the stage plays with no delay and the sequence silently collapses. This
    // reads the component and checks every var it mentions is supplied here.
    const source = readFileSync(
      new URL("../../components/brand/BrandLoader.tsx", import.meta.url),
      "utf8"
    );
    const used = new Set(
      [...source.matchAll(/var\((--ssbl-[a-z0-9-]+)/g)].map((m) => m[1])
    );
    assert.ok(used.size > 5, `expected the loader to read several vars, found ${used.size}`);

    const provided = new Set(Object.keys(loaderCssVars()));
    for (const name of used) {
      assert.ok(provided.has(name), `the stylesheet reads ${name}, loaderCssVars does not set it`);
    }
  });
});

describe("letterDelayMs", () => {
  it("starts at the letters' own cue and steps by the stagger", () => {
    const { start, stagger } = LOADER_SEQUENCE.letters;
    assert.equal(letterDelayMs(0), start);
    assert.equal(letterDelayMs(1), start + stagger);
    assert.equal(letterDelayMs(10), start + stagger * 10);
  });

  it("agrees with the stage's own end for the last letter", () => {
    const { duration, count } = LOADER_SEQUENCE.letters;
    assert.equal(letterDelayMs(count - 1) + duration, stageEnd(LOADER_SEQUENCE.letters));
  });

  it("covers exactly the wordmark it is used for", () => {
    // 'SubhSandesh' is eleven characters; a count that drifts from it would
    // make the table's idea of the last letter wrong.
    assert.equal(LOADER_SEQUENCE.letters.count, "SubhSandesh".length);
  });
});

describe("holdRemainingMs", () => {
  it("waits out the rest of the floor", () => {
    assert.equal(holdRemainingMs(0, true), LOADER_MIN_MS);
    assert.equal(holdRemainingMs(500, true), LOADER_MIN_MS - 500);
  });

  it("waits for nothing once the floor has passed", () => {
    // A slow fetch has already paid the floor; adding to it would punish the
    // connection that needed help most.
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
