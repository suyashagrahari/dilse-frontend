"use client";

// ─── ContestFlow — the objection nobody loses ────────────────────────────────
//
// An objection application, filed against a challan that was never real,
// decided by an officer who does not exist, in their favour, every time.
//
// ── THE VERDICT IS ALWAYS UPHELD ─────────────────────────────────────────────
// There is no branch in this file that dismisses an objection, no validation
// that can fail, no minimum length, no required field. An empty submission wins
// too — it prints OBJECTION_NOT_STATED and is upheld anyway.
//
// ── WHAT THEY TYPED GETS PRINTED ─────────────────────────────────────────────
// Their grounds are set into the verdict, so it has to survive two hundred
// characters with no spaces in them: `overflow-wrap: anywhere` is load-bearing.

import { useCallback, useEffect, useRef, useState } from "react";

import { CandyButton, GhostButton, GROTESK } from "../../_love/LoveKit";
import { V } from "../../_love/theme";
import { Stamp } from "./Stamp";
import { CH, chInk } from "./theme";
import { OBJECTION_MAX, OBJECTION_NOT_STATED, type ChallanData } from "./types";
import { Caption, NextStep, PaperCard, SerifMessage, Spinner, useReducedMotion, type NextAction } from "./flowKit";

const RULE = chInk(22);

/** Long enough to feel like a desk somewhere, short enough not to be a wait. */
const FORWARD_MS = 2200;

/** One-tap grounds, for the recipient who just wants to win. */
const QUICK_GROUNDS = ["I was provoked by your face", "the signal was pink, not red", "you started it", "love is not a crime"];

type Step = "form" | "forwarding" | "verdict";

function ObjectionForm({
  data,
  grounds,
  onGrounds,
  onSubmit,
  onBack,
  locked,
}: {
  data: ChallanData;
  grounds: string;
  onGrounds: (v: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  locked: boolean;
}) {
  const left = OBJECTION_MAX - grounds.length;
  const nearLimit = left <= 20;

  return (
    <div className="lv-pop" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <header style={{ textAlign: "center" }}>
        <p style={{ margin: 0, fontFamily: GROTESK, fontSize: 12, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: V.a1 }}>file an objection</p>
        <h2 style={{ margin: "6px 0 0", fontFamily: GROTESK, fontWeight: 800, fontSize: "clamp(28px, 7vw, 40px)", lineHeight: 1, letterSpacing: "-0.04em", color: V.ink }}>
          Fight it, then ⚖️
        </h2>
      </header>

      <PaperCard>
        <Caption>Application for objection</Caption>
        <p style={{ margin: 0, fontFamily: CH.serif, fontSize: 15, lineHeight: 1.6, color: CH.ink, overflowWrap: "anywhere" }}>
          Before the Adjudicating Officer, {data.authority.department}
        </p>
        <p style={{ margin: "6px 0 0", fontFamily: CH.mono, fontSize: 11.5, lineHeight: 1.6, color: CH.faint, overflowWrap: "anywhere" }}>
          In the matter of Challan No. {data.challanNo}, issued against {data.accused.name}.
        </p>

        <label htmlFor="ch-grounds" style={{ display: "block", margin: "16px 0 8px", fontFamily: GROTESK, fontSize: 14, fontWeight: 800, color: CH.ink }}>
          Grounds for objection
        </label>
        <textarea
          id="ch-grounds"
          value={grounds}
          onChange={(e) => onGrounds(e.target.value.slice(0, OBJECTION_MAX))}
          maxLength={OBJECTION_MAX}
          rows={4}
          disabled={locked}
          aria-describedby="ch-grounds-count"
          placeholder="State your case. It will be accepted."
          style={{
            display: "block",
            width: "100%",
            minHeight: 110,
            boxSizing: "border-box",
            padding: "12px 13px",
            border: `1.5px solid ${RULE}`,
            borderRadius: 14,
            background: "color-mix(in srgb, var(--lv-paper-ink) 3%, var(--lv-paper))",
            color: CH.ink,
            fontFamily: CH.serif,
            fontSize: 16,
            lineHeight: 1.6,
            resize: "vertical",
            outline: "none",
            overflowWrap: "anywhere",
          }}
        />
        <p id="ch-grounds-count" style={{ margin: "6px 0 0", textAlign: "right", fontFamily: CH.mono, fontSize: 11, color: nearLimit ? CH.red : CH.faint }}>
          {grounds.length} / {OBJECTION_MAX}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 4 }}>
          {QUICK_GROUNDS.map((q) => (
            <button
              key={q}
              type="button"
              disabled={locked}
              onClick={() => onGrounds(q)}
              className="lv-focus"
              style={{ minHeight: 36, padding: "0 12px", borderRadius: 999, border: `1.5px solid ${RULE}`, background: "transparent", color: CH.ink, fontFamily: GROTESK, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Decorative on purpose: there is no file input here at all. */}
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginTop: 16, minHeight: 50, padding: "9px 11px", border: `1.5px dashed ${RULE}`, borderRadius: 14 }}>
          <span aria-hidden="true" style={{ flex: "none", padding: "7px 11px", borderRadius: 10, border: `1px solid ${RULE}`, fontFamily: CH.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", color: CH.faint }}>
            CHOOSE FILE
          </span>
          <span style={{ flex: "1 1 auto", minWidth: 0, fontFamily: CH.serif, fontSize: 14, fontStyle: "italic", lineHeight: 1.5, color: CH.faint, overflowWrap: "anywhere" }}>
            no evidence required. I believe you.
          </span>
        </div>
      </PaperCard>

      <div style={{ position: "sticky", bottom: 0, paddingTop: 6, paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}>
        <CandyButton onClick={onSubmit} disabled={locked} ariaLabel="Submit objection">
          ⚖️ Submit objection
        </CandyButton>
      </div>
      <GhostButton onClick={onBack} style={{ width: "auto", alignSelf: "center", minWidth: 200 }}>
        ← back to the notice
      </GhostButton>
    </div>
  );
}

function Forwarding() {
  return (
    <div style={{ minHeight: "60dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", textAlign: "center" }}>
      <Spinner />
      <p role="status" aria-live="polite" style={{ margin: "24px 0 0", fontFamily: CH.mono, fontSize: 14, letterSpacing: "0.03em", color: V.ink }}>
        Forwarding to the Adjudicating Officer…
      </p>
      <p style={{ margin: "10px 0 0", fontFamily: CH.mono, fontSize: 11, lineHeight: 1.6, color: V.faint }}>The file is being walked down a corridor. 🚶</p>
    </div>
  );
}

function Verdict({ data, grounds, animateStamp, gif, next }: { data: ChallanData; grounds: string; animateStamp: boolean; gif?: string; next: NextAction | null }) {
  const stated = grounds.trim();
  const printed = stated.length > 0 ? stated : OBJECTION_NOT_STATED;

  return (
    <div>
      <PaperCard style={{ paddingBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
          <span style={{ fontFamily: CH.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.16em", color: CH.faint }}>ORDER OF THE ADJUDICATING OFFICER</span>
          <span style={{ fontFamily: CH.mono, fontSize: 10, color: CH.faint, whiteSpace: "nowrap" }}>{data.challanNo}</span>
        </div>
        <div style={{ height: 1, background: RULE, margin: "13px 0 14px" }} />
        <h2 style={{ margin: 0, fontFamily: CH.serif, fontSize: 23, lineHeight: 1.3, fontWeight: 700, color: CH.ink }}>Objection upheld. Challan withdrawn.</h2>
        {/* Their words, set into the order. Wraps anywhere, truncates never. */}
        <p style={{ margin: "14px 0 0", fontFamily: CH.serif, fontSize: 16, lineHeight: 1.65, color: CH.ink, overflowWrap: "anywhere", wordBreak: "normal" }}>
          <span style={{ fontFamily: CH.mono, fontSize: 12, fontWeight: 700, color: CH.faint }}>Grounds: </span>
          {printed}
        </p>
        <p style={{ margin: "14px 0 0", fontFamily: CH.mono, fontSize: 11, lineHeight: 1.65, color: CH.faint, overflowWrap: "anywhere" }}>
          Having heard the objector and finding no reason whatsoever to disagree, the said challan is hereby set aside in full. No fine is payable. The record is expunged.
        </p>
        <div style={{ height: 1, background: RULE, margin: "14px 0 0" }} />
        <div style={{ display: "flex", justifyContent: "center", padding: "16px 0 4px" }}>
          <Stamp text="OBJECTION UPHELD" tone="red" animate={animateStamp} rotate={-6} />
        </div>
        <p style={{ margin: "8px 0 4px", textAlign: "right", fontFamily: CH.mono, fontSize: 10, color: CH.faint, overflowWrap: "anywhere" }}>{data.officer.post}</p>
      </PaperCard>

      <SerifMessage lines={data.contestMessage ?? []} />
      <NextStep gif={gif} gifCaption="the court has spoken 🔨" next={next} delay={animateStamp ? 900 : 0} />
    </div>
  );
}

export function ContestFlow({
  data,
  onDone,
  onBack,
  next,
  gif,
}: {
  data: ChallanData;
  onDone: () => void;
  onBack: () => void;
  next: NextAction | null;
  gif?: string;
}) {
  const [step, setStep] = useState<Step>("form");
  const [grounds, setGrounds] = useState("");
  const reduced = useReducedMotion();

  const submittedRef = useRef(false);
  const doneRef = useRef(false);
  const [locked, setLocked] = useState(false);

  const submit = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setLocked(true);
    setStep("forwarding");
  }, []);

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

  useEffect(() => {
    if (step !== "form") window.scrollTo({ top: 0, behavior: "auto" });
  }, [step]);

  return (
    <div className="ch-wrap" style={{ maxWidth: 540 }}>
      {step === "form" ? <ObjectionForm data={data} grounds={grounds} onGrounds={setGrounds} onSubmit={submit} onBack={onBack} locked={locked} /> : null}
      {step === "forwarding" ? <Forwarding /> : null}
      {step === "verdict" ? <Verdict data={data} grounds={grounds} animateStamp={!reduced} gif={gif} next={next} /> : null}
    </div>
  );
}

export default ContestFlow;
