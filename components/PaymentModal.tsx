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

import { motion, AnimatePresence } from "framer-motion";
import { X, Coins, CreditCard, Crown, AlertCircle, Loader2, Check } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { BRAND as C } from "@/lib/brand";
import { formatINR, type ResolvedPricing } from "@/config/templatePricing";

export type PaymentStatus = "idle" | "loading" | "error";

interface PaymentModalProps {
  open: boolean;
  pricing: ResolvedPricing;
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
  templateTitle,
  paymentStatus,
  paymentError,
  onClose,
  onSpendPoints,
  onRazorpay,
}: PaymentModalProps) {
  const { user } = useAppSelector((s) => s.auth);

  const userPoints = user?.points ?? 0;
  const pointsOffered = pricing.pointsCost > 0;
  const hasEnoughPoints = userPoints >= pricing.pointsCost;
  const isLoading = paymentStatus === "loading";

  // Hidden entirely at 0%: a struck-through price beside "0% OFF" reads as a
  // rendering bug, and "You save ₹0" is worse than saying nothing.
  const discounted = pricing.discountPercent > 0 && pricing.savingsPaise > 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* ── Backdrop ─────────────────────────────────────────────────── */}
          <motion.div
            className="fixed inset-0 z-[200]"
            style={{ background: "rgba(26,5,7,0.55)", backdropFilter: "blur(6px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
              className="w-full sm:max-w-[420px] overflow-hidden pointer-events-auto"
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 0,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                boxShadow: C.shadowElevated,
              }}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 32 }}
            >
              {/* Gold hairline — the one brand flourish on the sheet. */}
              <div
                style={{
                  height: 3,
                  background: `linear-gradient(90deg, transparent, ${C.gold} 35%, ${C.goldDeep} 65%, transparent)`,
                }}
              />

              {/* ── Header ─────────────────────────────────────────────── */}
              <div style={{ padding: "18px 20px 0", position: "relative" }}>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  aria-label="Close"
                  style={{
                    position: "absolute", top: 14, right: 14,
                    width: 32, height: 32, borderRadius: 999,
                    display: "grid", placeItems: "center",
                    background: C.surfaceAlt, border: `1px solid ${C.border}`,
                    color: C.muted, cursor: isLoading ? "not-allowed" : "pointer",
                    opacity: isLoading ? 0.4 : 1,
                  }}
                >
                  <X size={16} />
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span
                    style={{
                      display: "inline-grid", placeItems: "center",
                      width: 30, height: 30, borderRadius: 10,
                      background: `${C.gold}22`, border: `1px solid ${C.gold}55`,
                      color: C.goldDeep, flex: "none",
                    }}
                  >
                    <Crown size={15} />
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: C.accent }}>
                    Premium template
                  </span>
                </div>

                <h2
                  style={{
                    margin: 0, paddingRight: 40,
                    fontFamily: "var(--font-lora), Georgia, serif",
                    fontSize: 21, lineHeight: "27px", fontWeight: 700, color: C.text,
                  }}
                >
                  {templateTitle ? `Publish your ${templateTitle}` : "Publish this page"}
                </h2>

                {/* True because gate rule 2 is unconditional: an already-published
                    page always re-publishes free. Worth saying — it is the single
                    biggest objection to a one-off charge. */}
                <p style={{ margin: "7px 0 0", fontSize: 13, lineHeight: "19px", color: C.muted }}>
                  One payment for this page. Edit and re-publish as often as you like —
                  you will not be charged again.
                </p>
              </div>

              {/* ── Price ──────────────────────────────────────────────── */}
              <div style={{ padding: "16px 20px 0" }}>
                <div
                  style={{
                    borderRadius: C.radiusLg,
                    background: C.surfaceAlt,
                    border: `1px solid ${C.border}`,
                    padding: "14px 16px",
                  }}
                >
                  {discounted && (
                    <div
                      style={{
                        display: "inline-block", marginBottom: 8,
                        padding: "3px 9px", borderRadius: 999,
                        background: C.accentStrong, color: "#fff",
                        fontSize: 11.5, fontWeight: 800, letterSpacing: "0.04em",
                      }}
                    >
                      {pricing.discountPercent}% OFF
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", color: C.text, lineHeight: 1 }}>
                      {formatINR(pricing.finalPrice)}
                    </span>
                    {discounted && (
                      <span style={{ fontSize: 16, color: C.faint, textDecoration: "line-through" }}>
                        {formatINR(pricing.mrp)}
                      </span>
                    )}
                  </div>

                  {discounted && (
                    <div style={{ marginTop: 7, fontSize: 12.5, fontWeight: 600, color: C.ok }}>
                      You save {formatINR(pricing.savings)}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Error ──────────────────────────────────────────────── */}
              {paymentError && (
                <div style={{ padding: "12px 20px 0" }}>
                  <div
                    role="alert"
                    style={{
                      display: "flex", gap: 8, alignItems: "flex-start",
                      padding: "10px 12px", borderRadius: 12,
                      background: `${C.danger}12`, border: `1px solid ${C.danger}40`,
                      color: C.danger, fontSize: 12.5, lineHeight: "18px",
                    }}
                  >
                    <AlertCircle size={15} style={{ flex: "none", marginTop: 1 }} />
                    <span>{paymentError}</span>
                  </div>
                </div>
              )}

              {/* ── Actions ────────────────────────────────────────────── */}
              <div style={{ padding: "16px 20px 20px", display: "grid", gap: 10 }}>
                <button
                  type="button"
                  onClick={onRazorpay}
                  disabled={isLoading}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    width: "100%", padding: "14px 16px",
                    borderRadius: 999, border: "none",
                    background: C.gradient, color: "#fff",
                    fontSize: 15, fontWeight: 700,
                    cursor: isLoading ? "wait" : "pointer",
                    opacity: isLoading ? 0.7 : 1,
                    boxShadow: "0 8px 22px -8px rgba(61,12,17,0.5)",
                  }}
                >
                  {isLoading ? <Loader2 size={17} className="animate-spin" /> : <CreditCard size={17} />}
                  {isLoading ? "Please wait…" : `Pay ${formatINR(pricing.finalPrice)}`}
                </button>

                {pointsOffered && (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "1px 0" }}>
                      <span style={{ flex: 1, height: 1, background: C.border }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.faint, letterSpacing: "0.06em" }}>OR</span>
                      <span style={{ flex: 1, height: 1, background: C.border }} />
                    </div>

                    <button
                      type="button"
                      onClick={onSpendPoints}
                      disabled={isLoading || !hasEnoughPoints}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        width: "100%", padding: "13px 16px",
                        borderRadius: 999,
                        background: hasEnoughPoints ? C.surface : C.surfaceAlt,
                        border: `1.5px solid ${hasEnoughPoints ? C.gold : C.border}`,
                        color: hasEnoughPoints ? C.accentStrong : C.faint,
                        fontSize: 14.5, fontWeight: 700,
                        cursor: isLoading || !hasEnoughPoints ? "not-allowed" : "pointer",
                        opacity: isLoading ? 0.6 : 1,
                      }}
                    >
                      {hasEnoughPoints ? <Coins size={16} /> : <Coins size={16} />}
                      Use {pricing.pointsCost.toLocaleString("en-IN")} points
                    </button>

                    <div style={{ textAlign: "center", fontSize: 11.5, color: C.muted }}>
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

                <div style={{ textAlign: "center", fontSize: 11, color: C.faint, marginTop: 2 }}>
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
