"use client";

import { useEffect, useState } from "react";

/**
 * True only once `visible` has been true continuously for `delayMs`.
 *
 * ── WHY A LOADING OVERLAY SHOULD WAIT BEFORE APPEARING ──────────────────────
 *
 * A full-screen "Publishing…" overlay that goes up and comes down inside 50ms is
 * not feedback, it is a flash. It reads as the page glitching, and because these
 * overlays fade out over ~300ms the flash is visible for far longer than the work
 * it was describing.
 *
 * The concrete case that forced this: pressing Publish on a paid template sets
 * `publishing` true, the paywall check comes back in a few milliseconds, the flag
 * goes false again — and the user saw "Publishing your card…" appear and dissolve
 * behind the payment sheet. Nothing was publishing. Nothing had been paid for yet.
 *
 * Holding the overlay back means a fast path shows nothing at all, and a genuinely
 * slow publish still gets its overlay. The threshold is the usual one for this:
 * long enough that no ordinary round trip trips it, short enough that a real wait
 * is never silent.
 *
 * ── WHY THE HIDE IS DERIVED AND NOT SET ─────────────────────────────────────
 *
 * The result is `visible && elapsed`, so going invisible takes effect on the same
 * render — no state write, and nothing to get stale. Writing `setShown(false)` in
 * the effect body instead would be a synchronous setState during an effect, which
 * costs a cascading render and which React's own lint rule refuses. The only state
 * here is "the delay has passed", and the only place it is written is the timer and
 * the cleanup.
 */
export function useDelayedVisible(visible: boolean, delayMs = 400): boolean {
  const [elapsed, setElapsed] = useState(false);

  useEffect(() => {
    if (!visible) return;

    const t = setTimeout(() => setElapsed(true), delayMs);
    return () => {
      clearTimeout(t);
      // In cleanup, so the next `visible` spell starts its wait afresh rather
      // than inheriting a timer that already fired.
      setElapsed(false);
    };
  }, [visible, delayMs]);

  return visible && elapsed;
}

export default useDelayedVisible;
