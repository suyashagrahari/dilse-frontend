"use client";

// ─── The recharge flow ───────────────────────────────────────────────────────
//
// plans → (sheet) payment options → (overlay) UPI PIN → (overlay) processing →
// success. The state machine lives here; each screen reports one event up.
//
// A tap lock (a ref, claimed synchronously) stops a double tap from queueing
// two flows, and back from the success screen lands on the plan list — never
// on the PIN pad.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import LetterPop from "../../_love/LetterPop";
import Home from "./Home";
import { PlanDetails } from "./Plans";
import { PaySheet, PinScreen, Processing, methodBank } from "./Pay";
import Success from "./Success";
import { MiniToast, RechargeStyles, useWide, PINK, BERRY_2, INK, LINE } from "./ui";
import { normalizeData, recommendedPlanId, type Plan, type RechargeData } from "./types";

type Step = "plans" | "pay" | "pin" | "processing" | "success";

const NUMBER_JOKES = [
  "Nice try. This number is taken. Forever. 😌",
  "Can't change it — it's saved as '💗' in my phone.",
  "Operator says: no porting out of this relationship 📵",
];

/** The brand badge on a published page, doubling as the recipient's Create path. */
function BrandLogo() {
  return (
    <Link
      href="/templates"
      aria-label="Create your own on SubhSandesh"
      style={{
        position: "fixed",
        top: "calc(10px + env(safe-area-inset-top, 0px))",
        right: 10,
        zIndex: 95,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        minHeight: 34,
        padding: "6px 11px 6px 7px",
        borderRadius: 99,
        background: "rgba(255,255,255,.96)",
        border: `1px solid ${LINE}`,
        boxShadow: "0 6px 18px -10px rgba(0,0,0,.35)",
        textDecoration: "none",
      }}
    >
      <Image src="/logo.webp" alt="" width={18} height={18} style={{ borderRadius: 5 }} />
      <span style={{ fontSize: 11.5, fontWeight: 700, color: INK }}>SubhSandesh</span>
      <span style={{ fontSize: 11, fontWeight: 700, color: PINK }}>· Create</span>
    </Link>
  );
}

export default function RechargeTemplate({
  data: raw,
  mode,
}: {
  data: RechargeData;
  mode: "preview" | "live";
  shareId?: string;
  hasPassword?: boolean;
}) {
  const data = useMemo(() => normalizeData(raw), [raw]);
  const wide = useWide();

  const [step, setStep] = useState<Step>("plans");
  const [planId, setPlanId] = useState<string>(() => recommendedPlanId(data) ?? "");
  const [details, setDetails] = useState<Plan | null>(null);
  const [method, setMethod] = useState("dilpay");
  const [stamp, setStamp] = useState<Date | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [forceLetter, setForceLetter] = useState(false);
  const jokeAt = useRef(0);
  const lock = useRef(false);

  const selected = useMemo(() => data.plans.find((p) => p.id === planId && !p.disabled) ?? null, [data.plans, planId]);

  useEffect(() => {
    lock.current = false;
  }, [step]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  // Every full screen starts at the top.
  useEffect(() => {
    if (step === "success" || step === "plans") window.scrollTo(0, 0);
  }, [step]);

  // Back from success → plans (one guard entry pushed when success mounts).
  useEffect(() => {
    if (step !== "success") return;
    window.history.pushState({ rcSuccess: true }, "");
    const onPop = () => setStep("plans");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [step]);

  const go = useCallback((next: Step) => {
    if (lock.current) return;
    lock.current = true;
    setStep(next);
  }, []);

  const choose = useCallback((p: Plan) => {
    setPlanId(p.id);
    setDetails(null);
  }, []);

  const proceed = useCallback(() => {
    if (!selected) return;
    setDetails(null);
    go("pay");
  }, [selected, go]);

  const onPaid = useCallback(() => {
    setStamp(new Date());
    setStep("processing");
  }, []);

  const openLetter = useCallback(() => {
    setForceLetter(true);
    window.setTimeout(() => setForceLetter(false), 60);
  }, []);

  const hasLetter = data.letter.trim().length > 0;
  // The editor no longer reserves a strip above the app, in any mode.
  const topInset = 0;

  // The envelope sits above the sticky pay bar on phones/tablets.
  const letterBottom = step === "plans" && selected && !wide ? 94 : 20;

  return (
    <div
      className={`rc-root${mode === "live" ? " rc-live" : ""}`}
      style={{ ["--rc-top" as string]: `${topInset}px`, paddingTop: step === "success" ? 0 : topInset }}
    >
      <RechargeStyles />
      {mode === "live" ? <BrandLogo /> : null}

      {step === "success" && selected && stamp ? (
        <Success
          data={data}
          plan={selected}
          stamp={stamp}
          bank={methodBank(method)}
          topInset={topInset}
          onAgain={() => go("plans")}
          onLetter={hasLetter ? openLetter : null}
          onToast={setToast}
        />
      ) : (
        <Home
          data={data}
          selected={selected}
          onSelect={choose}
          onDetails={setDetails}
          onProceed={proceed}
          onChangeNumber={() => {
            setToast(NUMBER_JOKES[jokeAt.current % NUMBER_JOKES.length]);
            jokeAt.current += 1;
          }}
        />
      )}

      <PlanDetails
        plan={details}
        onClose={() => setDetails(null)}
        onChoose={(p) => {
          setPlanId(p.id);
          setDetails(null);
          go("pay");
        }}
      />

      <PaySheet
        open={step === "pay"}
        data={data}
        plan={selected}
        method={method}
        onMethod={setMethod}
        onClose={() => setStep("plans")}
        onPay={() => go("pin")}
      />

      {step === "pin" && selected ? (
        <PinScreen data={data} plan={selected} bank={methodBank(method)} onCancel={() => setStep("pay")} onDone={onPaid} />
      ) : null}

      {step === "processing" && selected ? <Processing data={data} plan={selected} onDone={() => setStep("success")} /> : null}

      <MiniToast text={toast} />

      {hasLetter ? (
        <LetterPop
          letter={data.letter}
          from={data.sender.name || undefined}
          to={data.subscriber.name || undefined}
          question={data.lockQuestion || undefined}
          answer={data.lockAnswer || undefined}
          accent={PINK}
          accent2={BERRY_2}
          paper="#FFF8FB"
          ink="#2A1026"
          bottom={letterBottom}
          teaser={`${data.sender.name ? `${data.sender.name} sent` : "you got"} a letter 💌`}
          sign="yours, on every network,"
          zIndex={70}
          forceOpen={forceLetter}
          variant="recharge"
          photos={data.photos.map((p) => p.url)}
        />
      ) : null}
    </div>
  );
}
