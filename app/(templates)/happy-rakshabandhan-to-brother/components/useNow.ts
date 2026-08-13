"use client";

import { useEffect, useState } from "react";

/**
 * A ticking clock that is safe to render with.
 *
 * Reading `Date.now()` during render is impure — React may render twice and get
 * two different answers, and `react-hooks/purity` fails the build for it. So the
 * first value is 0, meaning "not known yet", and callers render nothing rather
 * than a wrong countdown for one frame.
 *
 * The interval also stops while the tab is hidden. A backgrounded tab that keeps
 * a 30-second timer alive for an hour wakes up to run sixty catch-up ticks at
 * once, and on a countdown that is visible as a jump.
 */
export function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    const tick = () => setNow(Date.now());

    const start = () => {
      if (timer !== null) return;
      tick();
      timer = setInterval(tick, intervalMs);
    };

    const stop = () => {
      if (timer === null) return;
      clearInterval(timer);
      timer = null;
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") start();
      else stop();
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [intervalMs]);

  return now;
}
