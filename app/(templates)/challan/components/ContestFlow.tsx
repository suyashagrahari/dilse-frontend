"use client";

// ─── ContestFlow — the objection nobody loses ────────────────────────────────
//
// A government objection application, filed against a challan that was never
// real, decided by an officer who does not exist, in their favour, every time.
//
// ── THE VERDICT IS ALWAYS UPHELD ─────────────────────────────────────────────
//
// There is no branch in this file that dismisses an objection, no validation
// that can fail, no minimum length, no required field. The joke IS that they
// win instantly and completely, and a form that could reject them would be a
// form, not a joke. An empty submission wins too — it prints OBJECTION_NOT_
// STATED and is upheld anyway.
//
// ── WHAT THEY TYPED GETS PRINTED ─────────────────────────────────────────────
//
// Their grounds are set into the verdict document, which is the funniest thing
// this template can do, so it has to survive the worst input the box allows:
// two hundred characters with no spaces in them. `overflow-wrap: anywhere` on
// the printed grounds is what stops that string from pushing the verdict off a
// 380px screen. It is load-bearing, not cosmetic.
//
// This document is a NOTICE. It carries no photo, no identity number and no
// card layout, because those are the things that would make it something else.

import { useCallback, useEffect, useRef, useState } from "react";
import { CH } from "./theme";
import { Stamp } from "./Stamp";
import { OBJECTION_MAX, OBJECTION_NOT_STATED, type ChallanData } from "./types";

/* ── Local tone, derived from the two theme constants ─────────────────────── */

const RULE = "rgba(17,17,17,0.22)";
const SOFT = "rgba(17,17,17,0.62)";
const FAINT = "rgba(17,17,17,0.42)";
const WASH = "rgba(17,17,17,0.035)";

/** Long enough to feel like a desk somewhere, short enough not to be a wait. */
const FORWARD_MS = 2000;

type Step = "form" | "forwarding" | "verdict";

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

function Caption({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: "0 0 8px",
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

function ObjectionForm({
  data,
  grounds,
  onGrounds,
  onSubmit,
  locked,
}: {
  data: ChallanData;
  grounds: string;
  onGrounds: (v: string) => void;
  onSubmit: () => void;
  locked: boolean;
}) {
  const left = OBJECTION_MAX - grounds.length;
  const nearLimit = left <= 20;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <div style={{ flex: "1 1 auto", padding: "20px 18px 18px", display: "flex", flexDirection: "column", gap: 20 }}>
        <header>
          <Caption>Application for objection</Caption>
          <p
            style={{
              margin: 0,
              fontFamily: CH.serif,
              fontSize: 14,
              lineHeight: 1.6,
              color: CH.ink,
              overflowWrap: "anywhere",
            }}
          >
            Before the Adjudicating Officer, {data.authority.department}
          </p>
          <p
            style={{
              margin: "6px 0 0",
              fontFamily: CH.mono,
              fontSize: 11,
              lineHeight: 1.6,
              color: SOFT,
              overflowWrap: "anywhere",
            }}
          >
            In the matter of Challan No. {data.challanNo}, issued against{" "}
            {data.accused.name}.
          </p>
        </header>

        <section>
          <label
            htmlFor="ch-grounds"
            style={{
              display: "block",
              marginBottom: 7,
              fontFamily: CH.mono,
              fontSize: 11.5,
              fontWeight: 700,
              letterSpacing: "0.04em",
              color: CH.ink,
            }}
          >
            Grounds for objection
          </label>
          <textarea
            id="ch-grounds"
            value={grounds}
            onChange={(e) => onGrounds(e.target.value.slice(0, OBJECTION_MAX))}
            maxLength={OBJECTION_MAX}
            rows={5}
            disabled={locked}
            aria-describedby="ch-grounds-count"
            placeholder="State your case. It will be accepted."
            style={{
              display: "block",
              width: "100%",
              minHeight: 116,
              boxSizing: "border-box",
              padding: "11px 12px",
              border: `1px solid ${RULE}`,
              borderRadius: 0,
              background: CH.paper,
              color: CH.ink,
              fontFamily: CH.serif,
              fontSize: 15,
              lineHeight: 1.65,
              resize: "vertical",
              outline: "none",
              // A 200-char word must not widen the field on a 380px screen.
              overflowWrap: "anywhere",
            }}
          />
          <p
            id="ch-grounds-count"
            style={{
              margin: "6px 0 0",
              textAlign: "right",
              fontFamily: CH.mono,
              fontSize: 10.5,
              color: nearLimit ? CH.red : FAINT,
            }}
          >
            {grounds.length} / {OBJECTION_MAX}
          </p>
        </section>

        {/* ── The evidence field ──────────────────────────────────────────────
            Decorative on purpose. There is no <input type="file"> here at all,
            so there is nothing to click, nothing to open a picker, and nothing
            that could ever hold a file — which is the point being made. */}
        <section aria-label="Supporting evidence">
          <p
            style={{
              margin: "0 0 7px",
              fontFamily: CH.mono,
              fontSize: 11.5,
              fontWeight: 700,
              letterSpacing: "0.04em",
              color: CH.ink,
            }}
          >
            Supporting evidence
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              minHeight: 48,
              padding: "9px 11px",
              border: `1px dashed ${RULE}`,
              background: WASH,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                flex: "0 0 auto",
                padding: "7px 11px",
                border: `1px solid ${RULE}`,
                background: CH.paper,
                fontFamily: CH.mono,
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: "0.06em",
                color: FAINT,
              }}
            >
              CHOOSE FILE
            </span>
            <span
              style={{
                flex: "1 1 auto",
                minWidth: 0,
                fontFamily: CH.serif,
                fontSize: 13,
                fontStyle: "italic",
                lineHeight: 1.5,
                color: SOFT,
                overflowWrap: "anywhere",
              }}
            >
              no evidence required. I believe you.
            </span>
          </div>
        </section>
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
          onClick={onSubmit}
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
            letterSpacing: "0.14em",
            opacity: locked ? 0.55 : 1,
            cursor: locked ? "default" : "pointer",
          }}
        >
          [ SUBMIT OBJECTION ]
        </button>
      </div>
    </div>
  );
}

function Forwarding() {
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
        }}
      >
        Forwarding to the Adjudicating Officer...
      </p>
      <p style={{ margin: "10px 0 0", fontFamily: CH.mono, fontSize: 10.5, lineHeight: 1.6, color: FAINT }}>
        The file is being walked down a corridor.
      </p>
    </div>
  );
}

function Verdict({
  data,
  grounds,
  animateStamp,
}: {
  data: ChallanData;
  grounds: string;
  animateStamp: boolean;
}) {
  const stated = grounds.trim();
  const printed = stated.length > 0 ? stated : OBJECTION_NOT_STATED;

  return (
    <div>
      <div style={{ padding: "22px 18px 0" }}>
        <div style={{ border: `1px solid ${RULE}`, background: CH.paper, padding: "16px 15px 4px" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
            <span style={{ fontFamily: CH.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", color: FAINT }}>
              ORDER OF THE ADJUDICATING OFFICER
            </span>
            <span style={{ fontFamily: CH.mono, fontSize: 9.5, color: FAINT, whiteSpace: "nowrap" }}>
              {data.challanNo}
            </span>
          </div>

          <div style={{ height: 1, background: RULE, margin: "13px 0 14px" }} />

          <h2
            style={{
              margin: 0,
              fontFamily: CH.serif,
              fontSize: 21,
              lineHeight: 1.32,
              fontWeight: 700,
              letterSpacing: "0.01em",
              color: CH.ink,
            }}
          >
            Objection upheld. Challan withdrawn.
          </h2>

          {/* Their words, set into the order. This block is the reason the
              whole flow exists, so it wraps anywhere and truncates never. */}
          <p
            style={{
              margin: "14px 0 0",
              fontFamily: CH.serif,
              fontSize: 14.5,
              lineHeight: 1.7,
              color: CH.ink,
              overflowWrap: "anywhere",
              wordBreak: "normal",
            }}
          >
            <span style={{ fontFamily: CH.mono, fontSize: 11.5, fontWeight: 700, color: SOFT }}>Grounds: </span>
            {printed}
          </p>

          <p
            style={{
              margin: "14px 0 0",
              fontFamily: CH.mono,
              fontSize: 10.5,
              lineHeight: 1.65,
              color: SOFT,
              overflowWrap: "anywhere",
            }}
          >
            Having heard the objector and finding no reason whatsoever to disagree, the
            said challan is hereby set aside in full. No fine is payable. The record is
            expunged.
          </p>

          <div style={{ height: 1, background: RULE, margin: "14px 0 0" }} />

          <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 0", marginBottom: -14 }}>
            <Stamp text="OBJECTION UPHELD" tone="red" animate={animateStamp} rotate={-6} />
          </div>

          <p
            style={{
              margin: "10px 0 0",
              textAlign: "right",
              fontFamily: CH.mono,
              fontSize: 9.5,
              color: FAINT,
              overflowWrap: "anywhere",
            }}
          >
            {data.officer.post}
          </p>
        </div>
      </div>

      <SerifMessage lines={data.contestMessage ?? []} />

      <div style={{ height: 32 }} />
    </div>
  );
}

/* ── The flow ─────────────────────────────────────────────────────────────── */

export function ContestFlow({ data, onDone }: { data: ChallanData; onDone: () => void }) {
  const [step, setStep] = useState<Step>("form");
  const [grounds, setGrounds] = useState("");
  const reduced = useReducedMotion();

  // Same latch as the payment flow: a ref catches taps batched into one render,
  // `locked` is the state the button can safely read.
  const submittedRef = useRef(false);
  const doneRef = useRef(false);
  const [locked, setLocked] = useState(false);

  const submit = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setLocked(true);
    setStep("forwarding");
  }, []);

  // Two seconds at a desk. One timeout, cleared on unmount.
  useEffect(() => {
    if (step !== "forwarding") return;
    const t = window.setTimeout(() => setStep("verdict"), FORWARD_MS);
    return () => window.clearTimeout(t);
  }, [step]);

  useEffect(() => {
    if (step !== "verdict" || doneRef.current) return;
    doneRef.current = true;
    onDone();
  }, [step, onDone]);

  return (
    <div style={{ background: CH.paper, color: CH.ink, minHeight: "100%" }}>
      {step === "form" ? (
        <ObjectionForm data={data} grounds={grounds} onGrounds={setGrounds} onSubmit={submit} locked={locked} />
      ) : null}
      {step === "forwarding" ? <Forwarding /> : null}
      {step === "verdict" ? <Verdict data={data} grounds={grounds} animateStamp={!reduced} /> : null}
    </div>
  );
}

export default ContestFlow;
