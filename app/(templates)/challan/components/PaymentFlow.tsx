"use client";

// ─── PaymentFlow — settle the challan ────────────────────────────────────────
//
// Statement of dues → mode of payment → 4.5s of processing → a stamped receipt,
// then the sincere message and the way on to the CCTV evidence.
//
// ── THE ONE RULE THAT BREAKS THE PAGE ────────────────────────────────────────
//
// `data.totalFine` is FREE TEXT. It is "one date". Nothing here calls Number(),
// parseFloat(), toFixed(), toLocaleString() or Intl.NumberFormat on it, and
// nothing sums `offences[].fine` into it. The total is a string that is COPIED
// from the summary to the receipt, character for character.
//
// ── EDGE CASES THIS FILE OWNS ────────────────────────────────────────────────
//
//   RAPID TAPS. `startedRef` latches on the first PAY NOW — a ref, not state,
//   because two taps inside one React batch would both read the same state.
//
//   BACK DURING PROCESSING. A guard entry is pushed onto the history stack when
//   processing mounts; the pop is caught, the screen says so, and the entry is
//   pushed straight back. It is deliberately LEFT on the stack afterwards.
//
//   BACKGROUNDING. The timer pauses on `visibilitychange` and resumes on the
//   line it was on.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CandyButton, GhostButton, GROTESK } from "../../_love/LoveKit";
import { V } from "../../_love/theme";
import { Stamp } from "./Stamp";
import { CH, chInk } from "./theme";
import type { ChallanData } from "./types";
import { Caption, NextStep, PaperCard, SerifMessage, Spinner, useReducedMotion, type NextAction } from "./flowKit";

const RULE = chInk(22);
const HAIRLINE = chInk(13);

/** 900ms apiece, five lines, 4.5 seconds. Do not shorten. */
const STEP_MS = 900;

const LINES = [
  "Connecting to the treasury of feelings…",
  "Verifying challan…",
  "Do not press back or refresh",
  "Processing settlement…",
  "Almost there…",
] as const;

type Step = "summary" | "processing" | "receipt";

/**
 * "TXN14032026004402" — TXN, the issue date as ddmmyyyy (read textually, so no
 * timezone can move it), then six digits derived from the challan number.
 */
function transactionId(data: ChallanData): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(data.issuedAt || "");
  const date = m ? `${m[3]}${m[2]}${m[1]}` : "01012026";
  let h = 7;
  const src = `${data.challanNo}|${data.accused.vehicleNo}`;
  for (let i = 0; i < src.length; i += 1) h = (h * 33 + src.charCodeAt(i)) % 1000000;
  return `TXN${date}${String(h).padStart(6, "0")}`;
}

/** A dot-leader row. `wrap` exists for Amount: free text, never truncated. */
function DotRow({ label, value, strong, wrap, valueColor }: { label: string; value: string; strong?: boolean; wrap?: boolean; valueColor?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 6, minWidth: 0 }}>
      <span
        style={{
          flex: "0 1 auto",
          minWidth: 0,
          fontFamily: CH.mono,
          fontSize: 12,
          letterSpacing: "0.03em",
          color: strong ? CH.ink : CH.faint,
          fontWeight: strong ? 700 : 400,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </span>
      <span aria-hidden="true" style={{ flex: "1 1 auto", minWidth: 12, alignSelf: "flex-end", marginBottom: 3.5, borderBottom: `1px dotted ${RULE}` }} />
      <span
        style={{
          flex: "0 1 auto",
          maxWidth: wrap ? "62%" : "60%",
          textAlign: "right",
          fontFamily: CH.mono,
          fontSize: strong ? 14 : 12,
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

/* ── Screens ──────────────────────────────────────────────────────────────── */

function Summary({
  data,
  methodId,
  onMethod,
  onPay,
  onBack,
  locked,
}: {
  data: ChallanData;
  methodId: string;
  onMethod: (id: string) => void;
  onPay: () => void;
  onBack: () => void;
  locked: boolean;
}) {
  const methods = data.settlement?.methods ?? [];

  return (
    <div className="lv-pop" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <header style={{ textAlign: "center" }}>
        <p style={{ margin: 0, fontFamily: GROTESK, fontSize: 12, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: V.a1 }}>settle challan</p>
        <h2 style={{ margin: "6px 0 0", fontFamily: GROTESK, fontWeight: 800, fontSize: "clamp(28px, 7vw, 40px)", lineHeight: 1, letterSpacing: "-0.04em", color: V.ink }}>
          Pay up, cutie 💸
        </h2>
      </header>

      <PaperCard>
        <Caption>Statement of dues</Caption>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          <DotRow label="Challan No" value={data.challanNo} />
          <DotRow label="Issued To" value={data.accused.name} />
          <DotRow label="Vehicle" value={data.accused.vehicleNo} />
          <DotRow label="Offences" value={String(data.offences?.length ?? 0)} />
        </div>
        <div style={{ borderTop: `1.5px dashed ${RULE}`, marginTop: 14, paddingTop: 14 }}>
          {/* Copied from the data. Never computed, never summed. */}
          <DotRow label="Total Payable" value={data.totalFine} strong wrap />
        </div>
      </PaperCard>

      {methods.length > 0 ? (
        <PaperCard>
          <Caption>Select mode of payment</Caption>
          <div role="radiogroup" aria-label="Mode of payment" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {methods.map((m) => {
              const on = m.id === methodId;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => onMethod(m.id)}
                  className="lv-focus"
                  style={{
                    width: "100%",
                    minHeight: 60,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 13px",
                    borderRadius: 16,
                    background: on ? `color-mix(in srgb, ${V.a1} 9%, transparent)` : "transparent",
                    border: `1.5px solid ${on ? V.a1 : HAIRLINE}`,
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{ flex: "0 0 auto", width: 20, height: 20, borderRadius: 10, border: `2px solid ${on ? V.a1 : RULE}`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                  >
                    {on ? <span style={{ width: 10, height: 10, borderRadius: 5, background: V.a1 }} /> : null}
                  </span>
                  <span style={{ flex: "1 1 auto", minWidth: 0 }}>
                    <span style={{ display: "block", fontFamily: GROTESK, fontSize: 15.5, fontWeight: 800, color: CH.ink, overflowWrap: "anywhere" }}>{m.label}</span>
                    {m.sub ? (
                      <span style={{ display: "block", marginTop: 2, fontFamily: CH.serif, fontSize: 13, fontStyle: "italic", lineHeight: 1.45, color: CH.faint, overflowWrap: "anywhere" }}>{m.sub}</span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
          <p style={{ margin: "12px 0 0", fontFamily: CH.mono, fontSize: 11, lineHeight: 1.6, color: CH.faint }}>
            No receipt of payment shall be admissible anywhere except between the two of you.
          </p>
        </PaperCard>
      ) : null}

      <div style={{ position: "sticky", bottom: 0, paddingTop: 6, paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", gap: 8 }}>
        <CandyButton onClick={onPay} disabled={locked} ariaLabel="Pay now">
          💸 Pay now
        </CandyButton>
      </div>
      <GhostButton onClick={onBack} style={{ width: "auto", alignSelf: "center", minWidth: 200 }}>
        ← back to the notice
      </GhostButton>
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

  // One guard entry, pushed once, re-pushed on every pop. Left on the stack.
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
    <div style={{ minHeight: "60dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", textAlign: "center" }}>
      <Spinner />
      <p role="status" aria-live="polite" style={{ margin: "24px 0 0", fontFamily: CH.mono, fontSize: 14, letterSpacing: "0.03em", color: V.ink, minHeight: 20 }}>
        {LINES[step]}
      </p>
      <div style={{ marginTop: 16, width: 200, height: 6, borderRadius: 99, background: `color-mix(in srgb, ${V.ink} 12%, transparent)`, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${((step + 1) / LINES.length) * 100}%`, background: V.grad, borderRadius: 99, transition: "width .8s ease" }} />
      </div>
      {scolded ? <p style={{ margin: "12px 0 0", fontFamily: GROTESK, fontSize: 15, fontWeight: 800, color: V.a1 }}>I said do not. 😤</p> : null}
      <p style={{ margin: "12px 0 0", fontFamily: CH.mono, fontSize: 11, lineHeight: 1.6, color: V.faint }}>This may take a moment. Please keep this page open.</p>
    </div>
  );
}

function Receipt({ data, animateStamp, gif, next }: { data: ChallanData; animateStamp: boolean; gif?: string; next: NextAction | null }) {
  const txn = useMemo(() => transactionId(data), [data]);

  return (
    <div>
      <PaperCard style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
          <span style={{ fontFamily: CH.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.16em", color: CH.faint }}>RECEIPT OF SETTLEMENT</span>
          <span style={{ fontFamily: CH.mono, fontSize: 10, color: CH.faint, textAlign: "right", overflowWrap: "anywhere" }}>{data.authority.department}</span>
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
        <p style={{ margin: "12px 0 0", maxWidth: "62%", fontFamily: CH.mono, fontSize: 10.5, lineHeight: 1.6, color: CH.faint, overflowWrap: "anywhere" }}>
          Settled in full. No further action is required of you, {data.accused.name}.
        </p>
        <div style={{ position: "absolute", right: 12, bottom: 8, pointerEvents: "none" }}>
          <Stamp text="PAID" tone="green" animate={animateStamp} rotate={-8} />
        </div>
      </PaperCard>

      <SerifMessage lines={data.paidMessage ?? []} />
      <NextStep gif={gif} gifCaption="caught paying up on camera 👀" next={next} delay={animateStamp ? 900 : 0} />
    </div>
  );
}

/* ── The flow ─────────────────────────────────────────────────────────────── */

export function PaymentFlow({
  data,
  onDone,
  onBack,
  next,
  gif,
}: {
  data: ChallanData;
  /** Fired once, when the receipt is on screen. */
  onDone: () => void;
  onBack: () => void;
  /** The way on from the receipt (the CCTV evidence, the court order, or a replay). */
  next: NextAction | null;
  gif?: string;
}) {
  const methods = data.settlement?.methods ?? [];
  const [step, setStep] = useState<Step>("summary");
  const [methodId, setMethodId] = useState<string>(methods[0]?.id ?? "");
  const reduced = useReducedMotion();

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

  useEffect(() => {
    if (step !== "receipt" || doneRef.current) return;
    doneRef.current = true;
    onDone();
  }, [step, onDone]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [step]);

  return (
    <div className="ch-wrap" style={{ maxWidth: 540 }}>
      {step === "summary" ? <Summary data={data} methodId={methodId} onMethod={setMethodId} onPay={pay} onBack={onBack} locked={locked} /> : null}
      {step === "processing" ? <Processing onDone={settled} /> : null}
      {step === "receipt" ? <Receipt data={data} animateStamp={!reduced} gif={gif} next={next} /> : null}
    </div>
  );
}

export default PaymentFlow;
