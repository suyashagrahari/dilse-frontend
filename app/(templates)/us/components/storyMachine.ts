"use client";

// ─── Us — the story highlight state machine ──────────────────────────────────
//
// An external store rather than component state, for one reason: the auto-
// advance timer. Driving it from `useEffect` means calling a setter from an
// effect, which React 19's `react-hooks/set-state-in-effect` rightly refuses.
// A store owns its own timer, publishes an immutable snapshot, and is read
// through `useSyncExternalStore` — no effect ever sets anything.
//
// The one piece of real logic in here is PAUSE. Press-and-hold has to pause,
// not restart: someone holding to read a caption for eight seconds must get the
// remaining two seconds back when they let go, not a fresh five. So the machine
// tracks `remaining` and re-schedules the balance, and the CSS progress bar is
// paused at exactly the same instant via `animation-play-state`. The two clocks
// are started and stopped together, so they cannot drift.

import { TIMING } from "./types";

export interface StoryState {
  open: boolean;
  /** Index into `highlights`. -1 when closed. */
  highlight: number;
  slide: number;
  /** Press-and-hold. Pauses the advance AND hides every piece of chrome. */
  held: boolean;
  /**
   * Bumped whenever a slide *starts*. The progress bar is keyed on it so the
   * CSS animation restarts even when the same slide index is re-entered.
   */
  run: number;
}

/** Shared by the server snapshot and the initial client snapshot — identical
 *  object identity, so there is nothing for hydration to disagree about. */
export const CLOSED_STORY: StoryState = Object.freeze({
  open: false,
  highlight: -1,
  slide: 0,
  held: false,
  run: 0,
});

export class StoryMachine {
  private state: StoryState = CLOSED_STORY;
  private readonly listeners = new Set<() => void>();

  private timer: ReturnType<typeof setTimeout> | null = null;
  private startedAt = 0;
  private remaining: number = TIMING.storyAdvanceMs;

  /** Slide count per highlight. Set from props; bounds every move. */
  private counts: readonly number[] = [];
  /** False under prefers-reduced-motion: taps still work, nothing moves alone. */
  private auto = true;
  /** Called when `next()` runs off the end of the last highlight. */
  private exhausted: () => void = () => {};

  /* ── Store interface ───────────────────────────────────────────────────── */

  readonly subscribe = (cb: () => void): (() => void) => {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  };

  readonly getSnapshot = (): StoryState => this.state;
  readonly getServerSnapshot = (): StoryState => CLOSED_STORY;

  /* ── Configuration (called from effects; never emits) ──────────────────── */

  readonly setCounts = (counts: readonly number[]): void => {
    this.counts = counts;
    this.reschedule();
  };

  readonly setAuto = (auto: boolean): void => {
    if (this.auto === auto) return;
    this.auto = auto;
    this.remaining = TIMING.storyAdvanceMs;
    this.reschedule();
  };

  readonly setExhausted = (fn: () => void): void => {
    this.exhausted = fn;
  };

  readonly dispose = (): void => {
    this.stopTimer();
    this.listeners.clear();
  };

  /* ── Transitions ───────────────────────────────────────────────────────── */

  readonly open = (highlight: number): void => {
    if (highlight < 0 || highlight >= this.counts.length) return;
    this.commit({ open: true, highlight, slide: 0, held: false, run: this.state.run + 1 });
  };

  readonly close = (): void => {
    if (!this.state.open) return;
    this.commit(CLOSED_STORY);
  };

  readonly next = (): void => {
    const s = this.state;
    if (!s.open) return;
    const total = this.counts[s.highlight] ?? 0;
    if (s.slide + 1 < total) {
      this.commit({ ...s, slide: s.slide + 1, held: false, run: s.run + 1 });
      return;
    }
    if (s.highlight + 1 < this.counts.length) {
      this.commit({ ...s, highlight: s.highlight + 1, slide: 0, held: false, run: s.run + 1 });
      return;
    }
    // Off the end. The component turns this into a history.back(), so the
    // browser stack stays honest whichever way the viewer was left.
    this.exhausted();
  };

  readonly prev = (): void => {
    const s = this.state;
    if (!s.open) return;
    if (s.slide > 0) {
      this.commit({ ...s, slide: s.slide - 1, held: false, run: s.run + 1 });
      return;
    }
    if (s.highlight > 0) {
      const prevIndex = s.highlight - 1;
      const last = Math.max(0, (this.counts[prevIndex] ?? 1) - 1);
      this.commit({ ...s, highlight: prevIndex, slide: last, held: false, run: s.run + 1 });
      return;
    }
    // At the very beginning, a back-tap replays the slide. Never closes: an
    // accidental left-edge tap must not throw you out of the highlight.
    this.commit({ ...s, held: false, run: s.run + 1 });
  };

  readonly setHeld = (held: boolean): void => {
    const s = this.state;
    if (!s.open || s.held === held) return;
    if (held) {
      // Bank the balance BEFORE the timer is cleared.
      this.remaining = Math.max(0, this.remaining - (Date.now() - this.startedAt));
    }
    // `run` is untouched: holding pauses the progress bar, it does not restart it.
    this.commit({ ...s, held });
  };

  /* ── Internals ─────────────────────────────────────────────────────────── */

  private commit(next: StoryState): void {
    const restarted = next.run !== this.state.run;
    this.state = next;
    if (restarted) this.remaining = TIMING.storyAdvanceMs;
    this.reschedule();
    for (const cb of this.listeners) cb();
  }

  private reschedule(): void {
    this.stopTimer();
    const s = this.state;
    if (!s.open || s.held || !this.auto) return;
    if ((this.counts[s.highlight] ?? 0) === 0) return;
    this.startedAt = Date.now();
    this.timer = setTimeout(() => {
      this.timer = null;
      this.next();
    }, this.remaining);
  }

  private stopTimer(): void {
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = null;
  }
}
