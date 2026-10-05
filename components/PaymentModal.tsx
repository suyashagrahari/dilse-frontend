"use client";

// ─── The paywall ─────────────────────────────────────────────────────────────
//
// A controlled component: it renders numbers and raises two intents. All the
// checkout logic is in `PaywallHost`, which is mounted once — see
// `lib/paywall/paywallBus.ts` for why that is not per-template state.
//
// ── IT DOES NO ARITHMETIC ───────────────────────────────────────────────────
//
// `mrp`, `savings` and `discountPercent` all arrive derived, from the `402` the
// publish gate returned. This component must never recompute them: the number
// beside a Pay button has to be the number that will be charged, and the only
// way to be sure is to print what the server said. The one place a price is
// formatted is `formatINR`.
//
// ── PHONE FIRST ─────────────────────────────────────────────────────────────
//
// Nearly everyone meets this on a phone, mid-flow, having just pressed Publish.
// Five things that matter there and are easy to miss on a desktop screen:
//
//   • The iOS home bar sits ON TOP of a bottom sheet. Without
//     `env(safe-area-inset-bottom)` the last control is half-covered, and here
//     the last control is how you pay.
//   • A short screen — any phone in landscape, or a small phone with the URL bar
//     showing — cannot fit the sheet. It gets a capped height and scrolls
//     INSIDE, so the Pay button is always reachable rather than off-screen.
//   • Background scroll is locked while it is open. A sheet that slides over a
//     page which then scrolls underneath your thumb feels broken.
//   • Every target is at least 44px. The close button was 32px, which is below
//     the threshold where a thumb hits reliably.
//   • A grab handle, because a sheet that rises from the bottom edge reads as
//     draggable whether or not it is, and its absence reads as a stuck dialog.

import { useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Coins, Crown, AlertCircle, Loader2, Check, ShieldCheck, Globe } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { BRAND as C } from "@/lib/brand";
import { type ResolvedPricing } from "@/config/templatePricing";
import { formatMoney, inrQuoteFrom, type Quote } from "@/lib/money";

export type PaymentStatus = "idle" | "loading" | "error";

interface PaymentModalProps {
  open: boolean;
  pricing: ResolvedPricing;
  /**
   * The buyer's quote, in their currency. Null while it loads — the price and
   * the Pay button wait for it, so nobody is shown ₹ and then charged $.
   */
  quote: Quote | null;
  /** The template's own name, for the heading. Falls back to generic copy. */
  templateTitle?: string;
  paymentStatus: PaymentStatus;
  paymentError: string | null;
  onClose: () => void;
  onSpendPoints: () => void;
  onRazorpay: () => void;
}

export default function PaymentModal({
  open,
  pricing,
  quote,
  templateTitle,
  paymentStatus,
  paymentError,
  onClose,
  onSpendPoints,
  onRazorpay,
}: PaymentModalProps) {
  const { user } = useAppSelector((s) => s.auth);
  const reduceMotion = useReducedMotion();

  const userPoints = user?.points ?? 0;
  const pointsOffered = pricing.pointsCost > 0;
  const hasEnoughPoints = userPoints >= pricing.pointsCost;
  const isLoading = paymentStatus === "loading";

  // Hidden entirely at 0%: a struck-through price beside "0% OFF" reads as a
  // rendering bug, and "You save ₹0" is worse than saying nothing.
  const q = quote ?? inrQuoteFrom(pricing);
  const quoteReady = quote !== null;
  const money = (minor: number) => formatMoney(minor, q.currency);
  const discounted = q.pricing.discountPercent > 0 && q.pricing.savingsAmount > 0;

  // Lock the background, and let Escape close — but never mid-charge, for the
  // same reason the backdrop stops responding then.
  useEffect(() => {
    if (!open) return;

    const { overflow, paddingRight } = document.body.style;
    // Compensate for the vanishing scrollbar so desktop layout does not jump.
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, isLoading, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* ── Backdrop ─────────────────────────────────────────────────── */}
          <motion.div
            className="fixed inset-0 z-[200]"
            style={{ background: "rgba(26,5,7,0.58)", backdropFilter: "blur(6px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            // Not dismissable mid-charge. A click that closes the sheet while a
            // payment is in flight looks like a cancellation and is not one.
            onClick={isLoading ? undefined : onClose}
          />

          {/* ── Sheet ────────────────────────────────────────────────────── */}
          <div className="fixed inset-0 z-[201] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={templateTitle ? `Publish ${templateTitle}` : "Publish this page"}
              className="pw-sheet w-full sm:max-w-[400px] pointer-events-auto flex flex-col"
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderTopLeftRadius: 26,
                borderTopRightRadius: 26,
                // Square-ish bottom on a phone (it meets the screen edge), fully
                // rounded once it is a centred dialog.
                borderBottomLeftRadius: "var(--pw-r, 0px)",
                borderBottomRightRadius: "var(--pw-r, 0px)",
                boxShadow: C.shadowElevated,
                // Never taller than the viewport; the body below scrolls instead.
                maxHeight: "min(92dvh, 760px)",
              }}
              initial={reduceMotion ? { opacity: 0 } : { y: "100%" }}
              animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { y: "100%" }}
              transition={
                reduceMotion
                  ? { duration: 0.15 }
                  : { type: "spring", stiffness: 320, damping: 34 }
              }
            >
              {/* Rounds the bottom corners only once the sheet is centred — on a
                  phone it meets the screen edge and should stay square there. A
                  media query is the honest tool and an inline style cannot hold
                  one, so it goes in a tag scoped to this component's own class
                  rather than to `[role=dialog]`, which would reach every other
                  dialog on the page. */}
              <style>{`@media (min-width:640px){.pw-sheet{--pw-r:26px}}`}</style>

              {/* Grab handle. Decorative — the sheet is not draggable — but its
                  absence makes a bottom sheet read as a stuck dialog. */}
              <div className="flex justify-center pt-2.5 pb-1 sm:hidden" aria-hidden>
                <span style={{ width: 40, height: 4, borderRadius: 999, background: "rgba(61,12,17,0.16)" }} />
              </div>

              {/* Gold hairline — the one brand flourish. */}
              <div
                className="hidden sm:block"
                style={{
                  height: 3, flex: "none",
                  borderTopLeftRadius: 26, borderTopRightRadius: 26,
                  background: `linear-gradient(90deg, transparent, ${C.gold} 35%, ${C.goldDeep} 65%, transparent)`,
                }}
              />

              {/* ── Scrollable body ──────────────────────────────────────── */}
              <div className="overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: "touch" }}>
                {/* Header */}
                <div style={{ padding: "10px 20px 0", position: "relative" }}>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    aria-label="Close"
                    style={{
                      position: "absolute", top: 2, right: 10,
                      width: 44, height: 44, borderRadius: 999,
                      display: "grid", placeItems: "center",
                      background: "transparent", border: "none",
                      color: C.faint, cursor: isLoading ? "not-allowed" : "pointer",
                      opacity: isLoading ? 0.35 : 1,
                    }}
                  >
                    <X size={19} />
                  </button>

                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9 }}>
                    <span
                      style={{
                        display: "inline-grid", placeItems: "center",
                        width: 26, height: 26, borderRadius: 8,
                        background: `${C.gold}26`, color: C.goldDeep, flex: "none",
                      }}
                    >
                      <Crown size={13} />
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: C.accent }}>
                      Premium template
                    </span>
                  </div>

                  <h2
                    style={{
                      margin: 0, paddingRight: 44,
                      fontFamily: "var(--font-lora), Georgia, serif",
                      fontSize: 20, lineHeight: "26px", fontWeight: 700, color: C.text,
                    }}
                  >
                    {templateTitle ? `Publish your ${templateTitle}` : "Publish this page"}
                  </h2>

                  {/* True because gate rule 2 is unconditional: an already-published
                      page always re-publishes free. Worth saying — it is the single
                      biggest objection to a one-off charge. */}
                  <p style={{ margin: "6px 0 0", fontSize: 12.5, lineHeight: "18px", color: C.muted }}>
                    One payment for this page. Edit and re-publish as often as you
                    like — you will not be charged again.
                  </p>
                </div>

                {/* Price */}
                <div style={{ padding: "14px 20px 0" }}>
                  <div
                    style={{
                      borderRadius: 18,
                      background: `linear-gradient(160deg, ${C.surfaceAlt}, #fdf6ef)`,
                      border: `1px solid ${C.border}`,
                      padding: "14px 16px",
                      display: "flex", alignItems: "center", gap: 14,
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                        <span
                          style={{
                            fontSize: 34, fontWeight: 800, letterSpacing: "-0.025em",
                            color: C.text, lineHeight: 1,
                          }}
                        >
                          {quoteReady ? money(q.pricing.finalAmount) : "…"}
                        </span>
                        {discounted && (
                          <span style={{ fontSize: 15, color: C.faint, textDecoration: "line-through" }}>
                            {money(q.pricing.mrpAmount)}
                          </span>
                        )}
                      </div>
                      {discounted && (
                        <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: C.ok }}>
                          You save {money(q.pricing.savingsAmount)}
                        </div>
                      )}
                      {quoteReady && q.international && (
                        <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, color: C.muted }}>
                          <Globe size={12} style={{ flex: "none" }} />
                          International price in USD · pay with PayPal or a card through PayPal
                        </div>
                      )}
                    </div>

                    {discounted && (
                      <div
                        style={{
                          flex: "none", textAlign: "center",
                          padding: "8px 10px", borderRadius: 14,
                          background: C.accentStrong, color: "#fff",
                          lineHeight: 1.05,
                        }}
                      >
                        <div style={{ fontSize: 17, fontWeight: 900 }}>{q.pricing.discountPercent}%</div>
                        <div style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: "0.12em" }}>OFF</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Error */}
                {paymentError && (
                  <div style={{ padding: "12px 20px 0" }}>
                    <div
                      role="alert"
                      style={{
                        display: "flex", gap: 8, alignItems: "flex-start",
                        padding: "10px 12px", borderRadius: 13,
                        background: `${C.danger}12`, border: `1px solid ${C.danger}38`,
                        color: C.danger, fontSize: 12.5, lineHeight: "18px",
                      }}
                    >
                      <AlertCircle size={15} style={{ flex: "none", marginTop: 1 }} />
                      <span>{paymentError}</span>
                    </div>
                  </div>
                )}

                {/* Actions. Inside the scroll area so a short screen can reach
                    them by scrolling rather than having them clipped. */}
                <div
                  style={{
                    padding: "16px 20px 0",
                    display: "grid", gap: 9,
                  }}
                >
                  <button
                    type="button"
                    onClick={onRazorpay}
                    disabled={isLoading || !quoteReady}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      width: "100%", minHeight: 52, padding: "0 16px",
                      borderRadius: 999, border: "none",
                      background: C.gradient, color: "#fff",
                      fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em",
                      cursor: isLoading || !quoteReady ? "wait" : "pointer",
                      opacity: isLoading || !quoteReady ? 0.72 : 1,
                      boxShadow: "0 10px 24px -10px rgba(61,12,17,0.55)",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    {isLoading || !quoteReady ? <Loader2 size={18} className="animate-spin" /> : null}
                    {isLoading ? "Please wait…" : !quoteReady ? "Loading price…" : `Pay ${money(q.pricing.finalAmount)}`}
                  </button>

                  {pointsOffered && (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ flex: 1, height: 1, background: C.border }} />
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: C.faint, letterSpacing: "0.1em" }}>OR</span>
                        <span style={{ flex: 1, height: 1, background: C.border }} />
                      </div>

                      <button
                        type="button"
                        onClick={onSpendPoints}
                        disabled={isLoading || !hasEnoughPoints}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                          width: "100%", minHeight: 48, padding: "0 16px",
                          borderRadius: 999,
                          background: "#fff",
                          border: `1.5px solid ${hasEnoughPoints ? C.gold : C.border}`,
                          color: hasEnoughPoints ? C.accentStrong : C.faint,
                          fontSize: 14.5, fontWeight: 700,
                          cursor: isLoading || !hasEnoughPoints ? "not-allowed" : "pointer",
                          opacity: isLoading ? 0.6 : 1,
                          WebkitTapHighlightColor: "transparent",
                        }}
                      >
                        <Coins size={16} />
                        Use {pricing.pointsCost.toLocaleString("en-IN")} points
                      </button>

                      <div style={{ textAlign: "center", fontSize: 11.5, color: C.muted, minHeight: 16 }}>
                        {hasEnoughPoints ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                            <Check size={12} style={{ color: C.ok }} />
                            You have {userPoints.toLocaleString("en-IN")} points
                          </span>
                        ) : (
                          // Naming the shortfall, not just refusing. "Insufficient
                          // points" leaves the user to do the subtraction.
                          <>
                            You have {userPoints.toLocaleString("en-IN")} —{" "}
                            {(pricing.pointsCost - userPoints).toLocaleString("en-IN")} more needed
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Footer. The safe-area inset lives here, on the last thing in
                    the scroll flow, so the iOS home bar never covers a control. */}
                <div
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    padding: "14px 20px",
                    paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
                    fontSize: 11, color: C.faint,
                  }}
                >
                  <ShieldCheck size={12} />
                  Secure payment via Razorpay
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
