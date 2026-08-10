"use client";

// ─── PaymentFlow — settle the challan ────────────────────────────────────────
//
// Order summary → mode of payment → 4.5s of processing → a stamped receipt.
// The sequence, its cadence, its back-guard and the tonal break at the end are
// lifted wholesale from the recharge template's Payment/Processing/Receipt
// screens; only the chrome changes, from a telecom app to office stationery.
//
// ── THE ONE RULE THAT BREAKS THE PAGE ────────────────────────────────────────
//
// `data.totalFine` is FREE TEXT. It is "one date". Nothing here calls Number(),
// parseFloat(), toFixed(), toLocaleString() or Intl.NumberFormat on it, and
// nothing sums `offences[].fine` into it. The total is a string that is COPIED
// from the summary to the receipt, character for character. `Number("one date")`
// is NaN, and "Amount ..... NaN" is the single bug that stops the joke working.
//
// ── EDGE CASES THIS FILE OWNS ────────────────────────────────────────────────
//
//   RAPID TAPS. `startedRef` latches on the first PAY NOW. Ten taps in 200ms
//   start one processing sequence, not ten — a ref, not state, because two taps
//   inside one React batch would both read the same stale state value.
//
//   BACK DURING PROCESSING. A guard entry is pushed onto the history stack when
//   processing mounts; the pop is caught, the screen says so, and the entry is
//   pushed straight back. It is deliberately LEFT on the stack afterwards, so a
//   back press from the receipt is swallowed by that entry instead of unwinding
//   into the payment sheet and re-running a settlement that already happened.
//
//   BACKGROUNDING. The timer pauses on `visibilitychange` and resumes on the
//   line it was on. Returning to "Almost there…" three lines late reads as a
//   hang.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CH } from "./theme";
import { Stamp } from "./Stamp";
import type { ChallanData } from "./types";

/* ── Local tone, all derived from the two theme constants ─────────────────── */

const RULE = "rgba(17,17,17,0.22)";
const HAIRLINE = "rgba(17,17,17,0.13)";
const SOFT = "rgba(17,17,17,0.62)";
const FAINT = "rgba(17,17,17,0.42)";
const WASH = "rgba(17,17,17,0.035)";

/** 900ms apiece, five lines, 4.5 seconds. Matches recharge. Do not shorten. */
const STEP_MS = 900;

const LINES = [
  "Connecting to treasury…",
  "Verifying challan…",
  "Do not press back or refresh",
  "Processing settlement…",
  "Almost there…",
] as const;

type Step = "summary" | "processing" | "receipt";

/* ── Motion ───────────────────────────────────────────────────────────────── */

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/* ── Receipt serial ───────────────────────────────────────────────────────────
 *
 * "TXN14032026004402" — TXN, then the issue date as ddmmyyyy, then six digits
 * derived from the challan number. Every part is computed from `data`, so the
 * server and the client render the same string and the receipt does not change
 * its own serial on a re-render. No Date.now(), no Math.random().
 */
function transactionId(data: ChallanData): string {
  const d = new Date(data.issuedAt);
  const valid = !Number.isNaN(d.getTime());
  const dd = valid ? String(d.getDate()).padStart(2, "0") : "01";
  const mm = valid ? String(d.getMonth() + 1).padStart(2, "0") : "01";
  const yyyy = valid ? String(d.getFullYear()) : "2026";

  let h = 7;
  const src = `${data.challanNo}|${data.accused.vehicleNo}`;
  for (let i = 0; i < src.length; i += 1) h = (h * 33 + src.charCodeAt(i)) % 1000000;
  return `TXN${dd}${mm}${yyyy}${String(h).padStart(6, "0")}`;
}

/* ── Primitives ───────────────────────────────────────────────────────────── */

/**
 * A dot-leader row. `wrap` exists for exactly one field: Amount. Its value is
 * free text of unknown length, so it is allowed to run onto a second line
 * rather than be truncated — an ellipsis on the total would eat the punchline.
 */
function DotRow({
  label,
  value,
  strong,
  wrap,
  valueColor,
}: {
  label: string;
  value: string;
  strong?: boolean;
  wrap?: boolean;
  valueColor?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 6, minWidth: 0 }}>
      <span
        style={{
          flex: "0 1 auto",
          minWidth: 0,
          fontFamily: CH.mono,
          fontSize: 11.5,
          letterSpacing: "0.03em",
          color: strong ? CH.ink : SOFT,
          fontWeight: strong ? 700 : 400,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </span>
      <span
        aria-hidden="true"
        style={{
          flex: "1 1 auto",
          minWidth: 12,
          alignSelf: "flex-end",
          marginBottom: 3.5,
          borderBottom: `1px dotted ${RULE}`,
        }}
      />
      <span
        style={{
          flex: "0 1 auto",
          maxWidth: wrap ? "62%" : "60%",
          textAlign: "right",
          fontFamily: CH.mono,
          fontSize: strong ? 12.5 : 11.5,
          fontWeight: strong ? 700 : 500,
          color: valueColor ?? CH.ink,
          whiteSpace: wrap ? "normal" : "nowrap",
          overflow: wrap ? "visible" : "hidden",
          textOverflow: wrap ? "clip" : "ellipsis",
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: "0 0 9px",
        fontFamily: CH.mono,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.16em",
        color: FAINT,
        textTransform: "uppercase",
      }}
    >
      {children}
    </p>
  );
}

/** The sincere payload. Serif, outside every box, with room to breathe. */
function SerifMessage({ lines }: { lines: string[] }) {
  const clean = lines.filter((l) => l && l.trim().length > 0);
  if (clean.length === 0) return null;
  return (
    <div style={{ padding: "40px 26px 10px" }}>
      {clean.map((line, i) => (
        <p
          key={`${i}-${line.slice(0, 16)}`}
          style={{
            margin: i === 0 ? 0 : "22px 0 0",
            fontFamily: CH.serif,
            fontSize: 17,
            lineHeight: 1.78,
            color: CH.ink,
            overflowWrap: "anywhere",
          }}
        >
          {line}
        </p>
      ))}
    </div>
  );
}

/* ── Screens ──────────────────────────────────────────────────────────────── */

function Summary({
  data,
  methodId,
  onMethod,
  onPay,
  locked,
}: {
  data: ChallanData;
  methodId: string;
  onMethod: (id: string) => void;
  onPay: () => void;
  locked: boolean;
}) {
  const methods = data.settlement?.methods ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <div style={{ flex: "1 1 auto", padding: "20px 18px 18px", display: "flex", flexDirection: "column", gap: 20 }}>
        <section aria-label="Order summary">
          <Caption>Statement of dues</Caption>
          <div style={{ border: `1px solid ${RULE}`, background: WASH, padding: "14px 14px 15px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              <DotRow label="Challan No" value={data.challanNo} />
              <DotRow label="Issued To" value={data.accused.name} />
              <DotRow label="Vehicle" value={data.accused.vehicleNo} />
              <DotRow label="Offences" value={String(data.offences?.length ?? 0)} />
            </div>
            <div style={{ borderTop: `1px solid ${RULE}`, marginTop: 13, paddingTop: 13 }}>
              {/* Copied from the data. Never computed, never summed. */}
              <DotRow label="Total Payable" value={data.totalFine} strong wrap />
            </div>
          </div>
        </section>

        {methods.length > 0 ? (
          <section aria-label="Mode of payment">
            <Caption>Select mode of payment</Caption>
            <div role="radiogroup" aria-label="Mode of payment" style={{ border: `1px solid ${RULE}` }}>
              {methods.map((m, i) => {
                const on = m.id === methodId;
                return (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => onMethod(m.id)}
                    style={{
                      width: "100%",
                      minHeight: 56,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 13px",
                      background: on ? WASH : "transparent",
                      border: "none",
                      borderTop: i === 0 ? "none" : `1px solid ${HAIRLINE}`,
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    {/* A drawn radio, not a native one — the whole page is ink
                        on paper and a system control breaks the illusion. */}
                    <span
                      aria-hidden="true"
                      style={{
                        flex: "0 0 auto",
                        width: 17,
                        height: 17,
                        borderRadius: 9,
                        border: `1.5px solid ${on ? CH.ink : RULE}`,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {on ? <span style={{ width: 8, height: 8, borderRadius: 4, background: CH.ink }} /> : null}
                    </span>
                    <span style={{ flex: "1 1 auto", minWidth: 0 }}>
                      <span
                        style={{
                          display: "block",
                          fontFamily: CH.mono,
                          fontSize: 13,
                          fontWeight: on ? 700 : 500,
                          color: CH.ink,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {m.label}
                      </span>
                      {m.sub ? (
                        <span
                          style={{
                            display: "block",
                            marginTop: 2,
                            fontFamily: CH.serif,
                            fontSize: 12,
                            fontStyle: "italic",
                            lineHeight: 1.45,
                            color: SOFT,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {m.sub}
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        <p style={{ margin: 0, fontFamily: CH.mono, fontSize: 10.5, lineHeight: 1.6, color: FAINT }}>
          No receipt of payment shall be admissible anywhere except between the two of you.
        </p>
      </div>

      <div
        style={{
          position: "sticky",
          bottom: 0,
          background: CH.paper,
          borderTop: `1px solid ${RULE}`,
          padding: "12px 18px",
          paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <button
          type="button"
          onClick={onPay}
          disabled={locked}
          aria-disabled={locked}
          style={{
            width: "100%",
            height: 50,
            minHeight: 50,
            border: `1.5px solid ${CH.ink}`,
            background: CH.ink,
            color: CH.paper,
            fontFamily: CH.mono,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.16em",
            opacity: locked ? 0.55 : 1,
            cursor: locked ? "default" : "pointer",
          }}
        >
          [ PAY NOW ]
        </button>
      </div>
    </div>
  );
}

function Processing({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [scolded, setScolded] = useState(false);

  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // One guard entry, pushed once, re-pushed on every pop so the second and
  // third presses are caught too. Left on the stack when this unmounts.
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.history.pushState({ chGuard: true }, "", window.location.href);
    const onPop = () => {
      setScolded(true);
      window.history.pushState({ chGuard: true }, "", window.location.href);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const finish = useCallback(() => onDone(), [onDone]);

  useEffect(() => {
    if (paused) return;
    const t = window.setTimeout(() => {
      if (step < LINES.length - 1) setStep((s) => s + 1);
      else finish();
    }, STEP_MS);
    return () => window.clearTimeout(t);
  }, [step, paused, finish]);

  return (
    <div
      style={{
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 30px",
        textAlign: "center",
      }}
    >
      <style>{`
@keyframes ch-spin { to { transform: rotate(360deg); } }
.ch-spin { animation: ch-spin 900ms linear infinite; transform-origin: 50% 50%; }
@media (prefers-reduced-motion: reduce) { .ch-spin { animation: none !important; } }
`}</style>

      <svg width={46} height={46} viewBox="0 0 46 46" aria-hidden="true" focusable="false">
        <circle cx="23" cy="23" r="19" fill="none" stroke={RULE} strokeWidth="3" />
        <circle
          className="ch-spin"
          cx="23"
          cy="23"
          r="19"
          fill="none"
          stroke={CH.ink}
          strokeWidth="3"
          strokeLinecap="butt"
          strokeDasharray="30 90"
        />
      </svg>

      <p
        role="status"
        aria-live="polite"
        style={{
          margin: "24px 0 0",
          fontFamily: CH.mono,
          fontSize: 13,
          letterSpacing: "0.04em",
          color: CH.ink,
          minHeight: 20,
        }}
      >
        {LINES[step]}
      </p>

      {scolded ? (
        <p style={{ margin: "10px 0 0", fontFamily: CH.mono, fontSize: 12.5, fontWeight: 700, color: CH.red }}>
          I said do not.
        </p>
      ) : null}

      <p style={{ margin: "10px 0 0", fontFamily: CH.mono, fontSize: 10.5, lineHeight: 1.6, color: FAINT }}>
        This may take a moment. Please keep this page open.
      </p>
    </div>
  );
}

function Receipt({ data, animateStamp }: { data: ChallanData; animateStamp: boolean }) {
  const txn = useMemo(() => transactionId(data), [data]);

  return (
    <div>
      <div style={{ padding: "22px 18px 0" }}>
        {/* The stamped document. `position: relative` so the mark can sit on
            top of the rows instead of beside them — a stamp that misses the
            paper is a sticker. */}
        <div style={{ position: "relative", border: `1px solid ${RULE}`, background: CH.paper, padding: "16px 15px 18px" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
            <span
              style={{
                fontFamily: CH.mono,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.16em",
                color: FAINT,
              }}
            >
              RECEIPT OF SETTLEMENT
            </span>
            <span
              style={{
                fontFamily: CH.mono,
                fontSize: 9.5,
                color: FAINT,
                textAlign: "right",
                overflowWrap: "anywhere",
              }}
            >
              {data.authority.department}
            </span>
          </div>

          <div style={{ height: 1, background: RULE, margin: "13px 0 14px" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <DotRow label="Transaction ID" value={txn} />
            <DotRow label="Challan No" value={data.challanNo} />
            {/* Free text. Printed exactly as given. */}
            <DotRow label="Amount" value={data.totalFine} wrap />
            <DotRow label="Status" value="PAID ✓" valueColor={CH.green} strong />
          </div>

          <div style={{ height: 1, background: RULE, margin: "14px 0 0" }} />

          <p
            style={{
              margin: "12px 0 0",
              fontFamily: CH.mono,
              fontSize: 9.5,
              lineHeight: 1.6,
              color: FAINT,
              overflowWrap: "anywhere",
            }}
          >
            Settled in full. No further action is required of you, {data.accused.name}.
          </p>

          {/* Overlaid on the document, not tucked under it. */}
          <div
            style={{
              position: "absolute",
              right: 10,
              bottom: 6,
              display: "flex",
              justifyContent: "flex-end",
              pointerEvents: "none",
            }}
          >
            <Stamp text="PAID" tone="green" animate={animateStamp} rotate={-6} />
          </div>
        </div>
      </div>

      <SerifMessage lines={data.paidMessage ?? []} />

      <div style={{ height: 32 }} />
    </div>
  );
}

/* ── The flow ─────────────────────────────────────────────────────────────── */

export function PaymentFlow({ data, onDone }: { data: ChallanData; onDone: () => void }) {
  const methods = data.settlement?.methods ?? [];
  const [step, setStep] = useState<Step>("summary");
  const [methodId, setMethodId] = useState<string>(methods[0]?.id ?? "");
  const reduced = useReducedMotion();

  // The rapid-tap latch. A ref rather than state: two taps dispatched inside a
  // single React batch would both read the same stale state value and both
  // pass the check, which is exactly the bug this guards.
  // `locked` mirrors it for the button's disabled state, because a ref must not
  // be read during render.
  const startedRef = useRef(false);
  const doneRef = useRef(false);
  const [locked, setLocked] = useState(false);

  const pay = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    setLocked(true);
    setStep("processing");
  }, []);

  const settled = useCallback(() => setStep("receipt"), []);

  // `onDone` fires once, when the receipt is on screen — never on a re-render,
  // and never twice if the parent re-renders us with a new callback identity.
  useEffect(() => {
    if (step !== "receipt" || doneRef.current) return;
    doneRef.current = true;
    onDone();
  }, [step, onDone]);

  return (
    <div style={{ background: CH.paper, color: CH.ink, minHeight: "100%" }}>
      {step === "summary" ? (
        <Summary data={data} methodId={methodId} onMethod={setMethodId} onPay={pay} locked={locked} />
      ) : null}
      {step === "processing" ? <Processing onDone={settled} /> : null}
      {step === "receipt" ? <Receipt data={data} animateStamp={!reduced} /> : null}
    </div>
  );
}

export default PaymentFlow;
