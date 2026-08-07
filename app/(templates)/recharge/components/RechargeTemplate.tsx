"use client";

// ─── The recharge flow ───────────────────────────────────────────────────────
//
// Four screens in one column: plans → payment → processing → receipt. It is a
// FLOW, not a card, so the state machine lives here and each screen is a dumb
// renderer that reports one event upward.
//
// ── PORTRAIT ONLY ────────────────────────────────────────────────────────────
// There is no wide layout. On a desktop the column is letterboxed at 420px in a
// neutral surround, which is what a phone-shaped app looks like on a laptop and
// is far more honest than a two-column version of a screen nobody would ever
// build two columns of. Everything is designed down to 380px.
//
// ── THE THREE THINGS THAT WOULD BREAK IT ─────────────────────────────────────
//
//   1. PARSING A PRICE. `plan.price` is a string and the headline plan's price
//      is an infinity sign. Nothing here — not the ordering, not the total —
//      touches Number, parseInt or parseFloat. Prices are printed.
//   2. QUEUEING FLOWS. Two taps on RECHARGE within a frame both see
//      `screen === "plans"`, so the lock is a ref claimed synchronously in the
//      handler rather than a piece of state read one render too late.
//   3. BACK FROM THE RECEIPT RE-RUNNING A PAYMENT. ProcessingScreen leaves one
//      guard entry on the history stack; the receipt consumes it and lands on
//      the plan grid. The payment sheet is never revisited by a back press.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { exportNodeToPng, fileSlug } from "@/lib/exportPng";
import PlanScreen from "./PlanScreen";
import PaymentScreen from "./PaymentScreen";
import ProcessingScreen from "./ProcessingScreen";
import ReceiptScreen from "./ReceiptScreen";
import ShareCard, { SHARE_H, SHARE_W } from "./ShareCard";
import { BrandLogo, RechargeStyles, SURROUND, normalizeData, recommendedPlanId } from "./ui";
import type { Plan, RechargeData } from "./types";

type Screen = "plans" | "payment" | "processing" | "receipt";

export default function RechargeTemplate({
  data: raw,
  mode,
}: {
  data: RechargeData;
  mode: "preview" | "live";
  shareId?: string;
  hasPassword?: boolean;
}) {
  // Repairs loose `"Label: Value"` rows, orphaned category ids and duplicate
  // keys. Runs on live editor state as well as on API payloads.
  const data = useMemo(() => normalizeData(raw), [raw]);

  const [screen, setScreen] = useState<Screen>("plans");
  const [categoryId, setCategoryId] = useState<string>("");
  const [planId, setPlanId] = useState<string>("");
  const [methodId, setMethodId] = useState<string>("");
  const [stamp, setStamp] = useState<Date | null>(null);
  const [savingCard, setSavingCard] = useState(false);
  const [cardNode, setCardNode] = useState<HTMLDivElement | null>(null);

  /** Claimed synchronously so two taps in one frame cannot both get through. */
  const navLock = useRef(false);

  // ── Derived selection ──────────────────────────────────────────────────────
  //
  // Everything is derived from ids rather than held as objects, so an edit in
  // the sheet flows straight through to the screen the sender is looking at and
  // a plan that disappears mid-flow degrades instead of crashing. Deriving also
  // means no effect has to reconcile state after `data` changes.
  const activeCategory = data.categories.some((c) => c.id === categoryId)
    ? categoryId
    : (data.categories[0]?.id ?? "");

  const recommendedId = useMemo(() => recommendedPlanId(data), [data]);

  const selectedPlan: Plan | null = useMemo(() => {
    const byId = data.plans.find((p) => p.id === planId && !p.disabled);
    if (byId) return byId;
    const rec = data.plans.find((p) => p.id === recommendedId && !p.disabled);
    return rec ?? data.plans.find((p) => !p.disabled) ?? null;
  }, [data.plans, planId, recommendedId]);

  const activeMethod =
    data.payment.methods.find((m) => m.id === methodId) ?? data.payment.methods[0] ?? null;

  // ── Release the tap lock once the transition has actually landed ───────────
  useEffect(() => {
    navLock.current = false;
  }, [screen]);

  // ── Every screen starts at the top ─────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo(0, 0);
  }, [screen]);

  // ── Back out of the receipt ────────────────────────────────────────────────
  //
  // ProcessingScreen left exactly one guard entry on the stack. Consuming it
  // here sends the sender to the plan grid — NOT to the payment sheet, which is
  // what would let a back press run the payment a second time.
  useEffect(() => {
    if (screen !== "receipt") return;
    const onPop = () => setScreen("plans");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [screen]);

  const handleRecharge = useCallback((plan: Plan) => {
    if (navLock.current) return;
    navLock.current = true;
    setPlanId(plan.id);
    setScreen("payment");
  }, []);

  const handlePay = useCallback(() => {
    if (navLock.current) return;
    navLock.current = true;
    // Captured once, at the moment of payment, so the receipt and any export of
    // it agree — and so nothing clock-derived is ever rendered on the server.
    setStamp(new Date());
    setScreen("processing");
  }, []);

  const handleProcessed = useCallback(() => setScreen("receipt"), []);

  const handleAgain = useCallback(() => {
    if (navLock.current) return;
    navLock.current = true;
    setScreen("plans");
  }, []);

  const handleBackToPlans = useCallback(() => {
    if (navLock.current) return;
    navLock.current = true;
    setScreen("plans");
  }, []);

  const shareCardPlan = useMemo(
    () => data.plans.find((p) => p.id === recommendedId) ?? data.plans[0] ?? null,
    [data.plans, recommendedId],
  );

  const saveCard = useCallback(async () => {
    if (!cardNode || savingCard) return;
    setSavingCard(true);
    // One frame for `rc-static` to land before the clone is taken.
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await exportNodeToPng(cardNode, {
      width: SHARE_W,
      height: SHARE_H,
      pixelRatio: 3,
      backgroundColor: "#FFFFFF",
      filename: `recharge-plan-${fileSlug(data.subscriber.name)}`,
    });
    setSavingCard(false);
  }, [cardNode, savingCard, data.subscriber.name]);

  const topInset = mode === "preview" ? 52 : 10;

  // A flow with nothing selectable cannot leave the grid. Guarding here rather
  // than inside each screen keeps the screens free of null checks.
  const canFlow = selectedPlan !== null;

  return (
    <div style={{ background: SURROUND, minHeight: "100dvh" }}>
      <RechargeStyles />
      {mode === "live" ? <BrandLogo /> : null}

      <div className="rc-shell">
        {screen === "plans" || !canFlow ? (
          <PlanScreen
            data={data}
            activeCategory={activeCategory}
            onCategory={setCategoryId}
            onRecharge={handleRecharge}
            recommendedId={recommendedId}
            topInset={topInset}
          />
        ) : screen === "payment" && selectedPlan ? (
          <PaymentScreen
            data={data}
            plan={selectedPlan}
            methodId={activeMethod ? activeMethod.id : ""}
            onMethod={setMethodId}
            onPay={handlePay}
            onBack={handleBackToPlans}
            topInset={topInset}
          />
        ) : screen === "processing" ? (
          <ProcessingScreen onDone={handleProcessed} />
        ) : selectedPlan && stamp ? (
          <ReceiptScreen
            data={data}
            plan={selectedPlan}
            methodLabel={activeMethod ? activeMethod.label : "—"}
            stamp={stamp}
            onAgain={handleAgain}
            onSaveCard={saveCard}
            savingCard={savingCard}
            topInset={topInset}
          />
        ) : null}
      </div>

      {/* Off-screen, always mounted, so the export never waits on a render. */}
      <div className={savingCard ? "rc-static" : undefined}>
        <ShareCard data={data} plan={shareCardPlan} attach={setCardNode} />
      </div>
    </div>
  );
}
