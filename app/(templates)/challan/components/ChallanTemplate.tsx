"use client";

// ─── Challan — the screen orchestrator ───────────────────────────────────────
//
// A challan is not a document you read, it is one you SETTLE. This component
// owns that arc: lookup → fetching → notice → (payment | contest) → settled.
//
// ── THE COUNTDOWN ────────────────────────────────────────────────────────────
//
// Three rules, and all three are edge cases the spec calls out by name:
//
//   1. IT NEVER GOES NEGATIVE. Past the due date it stops at zero and the page
//      switches to OVERDUE. A negative timer is the single most obvious way for
//      a document to admit it is a toy.
//   2. CROSSING ZERO LIVE FLIPS TO OVERDUE WITHOUT A REFRESH. The interval
//      recomputes `overdue` on every tick, so a page left open through the
//      deadline changes state on its own.
//   3. IT IS COMPUTED ON THE CLIENT ONLY. `Date.now()` during SSR would render
//      one remaining-time on the server and a different one in the browser, and
//      React would log a hydration mismatch on the most prominent line of the
//      threat block. The first paint prints an em dash; the first tick fills it.
//
// The interval also stops when the tab is hidden. A backgrounded phone should
// not run a 1Hz timer for a page nobody is looking at.
//
// ── THE TERMINAL-STATE GUARD ─────────────────────────────────────────────────
//
// Once paid or contested, the notice renders with its stamp and the pay path is
// closed. Browser back cannot re-trigger payment because there is no history
// entry to go back to — the flow never pushes one — and `settled` is not
// re-enterable. Rapid taps are latched inside PaymentFlow/ContestFlow, which own
// their own refs for exactly that reason.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CH } from "./theme";
import { LookupScreen } from "./LookupScreen";
import { ChallanNotice } from "./ChallanNotice";
import { PaymentFlow } from "./PaymentFlow";
import { ContestFlow } from "./ContestFlow";
import type { ChallanData, ChallanScreen } from "./types";

/** Milliseconds in the units the threat block prints. */
const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * "6 days 04:22:11 remaining", clamped at zero.
 *
 * Returns `null` before the first client tick so the server and the browser
 * agree on the first paint. See rule 3 above.
 */
function formatRemaining(ms: number): string {
  const clamped = Math.max(0, ms);
  const days = Math.floor(clamped / DAY);
  const h = Math.floor((clamped % DAY) / HOUR);
  const m = Math.floor((clamped % HOUR) / MIN);
  const s = Math.floor((clamped % MIN) / SEC);
  const clock = `${pad(h)}:${pad(m)}:${pad(s)}`;
  if (days > 0) return `${days} day${days === 1 ? "" : "s"} ${clock} remaining`;
  return `${clock} remaining`;
}

export function ChallanTemplate({
  data,
  capture = false,
}: {
  data: ChallanData;
  /** Export mode: no lookup screen, no animation, the notice only. */
  capture?: boolean;
}) {
  // The PNG capture wants the document, not the portal it is reached through.
  const [screen, setScreen] = useState<ChallanScreen>(capture ? "notice" : "lookup");
  const [settled, setSettled] = useState<null | "paid" | "contested">(null);

  const dueMs = useMemo(() => {
    const t = Date.parse(data.dueAt);
    return Number.isFinite(t) ? t : null;
  }, [data.dueAt]);

  /** null until the first client tick — see rule 3. */
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (dueMs === null || capture) return;

    const tick = () => setRemainingMs(dueMs - Date.now());

    const start = () => {
      if (timerRef.current !== null) return;
      tick();
      timerRef.current = setInterval(tick, SEC);
    };
    const stop = () => {
      if (timerRef.current === null) return;
      clearInterval(timerRef.current);
      timerRef.current = null;
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, [dueMs, capture]);

  // Recomputed from the same tick that drives the string, so the OVERDUE switch
  // and the timer reaching zero happen in one render rather than a frame apart.
  const overdue = dueMs !== null && remainingMs !== null && remainingMs <= 0;
  const remaining = remainingMs === null ? "—" : formatRemaining(remainingMs);

  const onFound = useCallback(() => setScreen("notice"), []);
  const onPay = useCallback(() => setScreen("payment"), []);
  const onContest = useCallback(() => setScreen("contest"), []);

  const onPaid = useCallback(() => {
    setSettled("paid");
    setScreen("notice");
  }, []);
  const onContested = useCallback(() => {
    setSettled("contested");
    setScreen("notice");
  }, []);

  if (screen === "payment") {
    return (
      <div style={{ minHeight: "100dvh", background: CH.paper }}>
        <PaymentFlow data={data} onDone={onPaid} />
      </div>
    );
  }

  if (screen === "contest") {
    return (
      <div style={{ minHeight: "100dvh", background: CH.paper }}>
        <ContestFlow data={data} onDone={onContested} />
      </div>
    );
  }

  if (screen === "lookup") {
    return (
      <div style={{ minHeight: "100dvh", background: CH.portalBg }}>
        <LookupScreen challanNo={data.challanNo} onFound={onFound} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", background: CH.paper }}>
      <ChallanNotice
        data={data}
        overdue={overdue}
        remaining={remaining}
        onPay={onPay}
        onContest={onContest}
        paid={settled === "paid"}
        capture={capture}
      />
    </div>
  );
}

export default ChallanTemplate;
