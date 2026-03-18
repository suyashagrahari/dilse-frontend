"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Coins, CreditCard, Crown, Sparkles, AlertCircle } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import type { ClientTemplatePricing } from "@/config/templatePricing";
import type { PaymentStatus } from "@/hooks/useTemplatePayment";

interface PaymentModalProps {
  open:          boolean;
  pricing:       ClientTemplatePricing;
  paymentStatus: PaymentStatus;
  paymentError:  string | null;
  onClose:       () => void;
  onSpendPoints: () => void;
  onRazorpay:    () => void;
}

export default function PaymentModal({
  open,
  pricing,
  paymentStatus,
  paymentError,
  onClose,
  onSpendPoints,
  onRazorpay,
}: PaymentModalProps) {
  const { user } = useAppSelector((s) => s.auth);
  const userPoints      = user?.points ?? 0;
  const hasEnoughPoints = userPoints >= pricing.pointsCost;
  const isLoading       = paymentStatus === "loading";
  const savings         = pricing.originalPrice - pricing.finalPrice;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* ── Backdrop ───────────────────────────────────────────────────── */}
          <motion.div
            className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isLoading ? undefined : onClose}
          />

          {/* ── Modal ──────────────────────────────────────────────────────── */}
          <div className="fixed inset-0 z-[201] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
              style={{
                background: "linear-gradient(160deg, #12121e 0%, #1a1a2e 50%, #0f1b35 100%)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 32 }}
            >
              {/* Gold shimmer top strip */}
              <div
                className="h-[3px] w-full"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, #FFD700 30%, #FF6B35 70%, transparent 100%)",
                }}
              />

              {/* ── Header ─────────────────────────────────────────────────── */}
              <div className="relative px-6 pt-5 pb-4">
                {/* Close button */}
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-40"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <X size={14} style={{ color: "rgba(255,255,255,0.55)" }} />
                </button>

                {/* Badge row */}
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                    style={{
                      background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                      color: "#000",
                      boxShadow: "0 2px 12px rgba(255,165,0,0.4)",
                    }}
                  >
                    <Crown size={9} fill="currentColor" />
                    PREMIUM
                  </span>
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                    style={{
                      background: "rgba(34,197,94,0.12)",
                      color: "#4ade80",
                      border: "1px solid rgba(34,197,94,0.2)",
                    }}
                  >
                    {pricing.discountPercent}% OFF
                  </span>
                </div>

                {/* Title */}
                <h2
                  className="text-xl font-black text-white mb-0.5"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Unlock {pricing.name}
                </h2>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                  One-time payment · publish & share your personalized page
                </p>

                {/* Price display */}
                <div className="flex items-end gap-3 mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[2.2rem] font-black leading-none" style={{ color: "#FF6B35" }}>
                      ₹{pricing.finalPrice}
                    </span>
                    <span
                      className="text-lg line-through leading-none mb-0.5"
                      style={{ color: "rgba(255,255,255,0.2)" }}
                    >
                      ₹{pricing.originalPrice}
                    </span>
                  </div>
                  <span
                    className="mb-1 px-2.5 py-1 rounded-lg text-[11px] font-bold"
                    style={{ background: "rgba(34,197,94,0.1)", color: "#4ade80" }}
                  >
                    Save ₹{savings}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="mx-6 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

              {/* ── Options ────────────────────────────────────────────────── */}
              <div className="px-6 pt-4 pb-5 flex flex-col gap-3">

                {/* ─ Option A: Spend Points ─ */}
                <button
                  onClick={() => !isLoading && hasEnoughPoints && onSpendPoints()}
                  disabled={isLoading || !hasEnoughPoints}
                  className="relative w-full rounded-2xl p-4 text-left transition-all"
                  style={{
                    background: hasEnoughPoints
                      ? "rgba(255,215,0,0.07)"
                      : "rgba(255,255,255,0.02)",
                    border: hasEnoughPoints
                      ? "1.5px solid rgba(255,215,0,0.22)"
                      : "1.5px solid rgba(255,255,255,0.06)",
                    cursor: hasEnoughPoints && !isLoading ? "pointer" : "not-allowed",
                    opacity: isLoading ? 0.65 : 1,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          background: hasEnoughPoints
                            ? "rgba(255,215,0,0.1)"
                            : "rgba(255,255,255,0.04)",
                        }}
                      >
                        <Coins
                          size={22}
                          style={{ color: hasEnoughPoints ? "#FFD700" : "rgba(255,255,255,0.18)" }}
                        />
                      </div>

                      <div>
                        <div
                          className="font-bold text-[13px]"
                          style={{ color: hasEnoughPoints ? "#fff" : "rgba(255,255,255,0.3)" }}
                        >
                          Use {pricing.pointsCost} Points
                        </div>
                        <div className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                          Your balance:{" "}
                          <span
                            style={{ color: hasEnoughPoints ? "#FFD700" : "#f87171", fontWeight: 700 }}
                          >
                            {userPoints} pts
                          </span>
                        </div>
                      </div>
                    </div>

                    {hasEnoughPoints ? (
                      <span
                        className="px-3 py-1.5 rounded-full text-[11px] font-black"
                        style={{ background: "rgba(255,215,0,0.15)", color: "#FFD700" }}
                      >
                        FREE
                      </span>
                    ) : (
                      <span
                        className="text-[11px] font-semibold text-right leading-tight"
                        style={{ color: "rgba(255,255,255,0.2)" }}
                      >
                        Need<br />{pricing.pointsCost - userPoints} more
                      </span>
                    )}
                  </div>

                  {!hasEnoughPoints && (
                    <p className="text-[11px] mt-2 pl-14" style={{ color: "rgba(255,255,255,0.22)" }}>
                      Earn points by referring friends 🎁
                    </p>
                  )}
                </button>

                {/* OR divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                  <span className="text-[10px] font-semibold" style={{ color: "rgba(255,255,255,0.22)" }}>
                    or pay online
                  </span>
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                </div>

                {/* ─ Option B: Razorpay ─ */}
                <button
                  onClick={() => !isLoading && onRazorpay()}
                  disabled={isLoading}
                  className="w-full rounded-2xl p-4 text-left transition-all"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,107,53,0.09) 0%, rgba(255,140,0,0.05) 100%)",
                    border: "1.5px solid rgba(255,107,53,0.28)",
                    opacity: isLoading ? 0.65 : 1,
                    cursor: isLoading ? "not-allowed" : "pointer",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: "rgba(255,107,53,0.13)" }}
                      >
                        <CreditCard size={22} style={{ color: "#FF6B35" }} />
                      </div>
                      <div>
                        <div className="font-bold text-[13px] text-white">
                          Pay ₹{pricing.finalPrice}
                        </div>
                        <div className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                          UPI · Cards · Netbanking via Razorpay
                        </div>
                      </div>
                    </div>

                    <span
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-bold"
                      style={{ background: "rgba(255,107,53,0.14)", color: "#FF6B35" }}
                    >
                      <Sparkles size={9} fill="currentColor" />
                      SECURE
                    </span>
                  </div>
                </button>

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-center justify-center gap-2 py-1">
                    <div
                      className="w-4 h-4 rounded-full border-2 animate-spin"
                      style={{
                        borderColor: "rgba(255,107,53,0.25)",
                        borderTopColor: "#FF6B35",
                      }}
                    />
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                      Processing payment…
                    </span>
                  </div>
                )}

                {/* Error message */}
                {paymentError && (
                  <div
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs"
                    style={{
                      background: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.18)",
                      color: "#f87171",
                    }}
                  >
                    <AlertCircle size={14} className="shrink-0" />
                    {paymentError}
                  </div>
                )}

                {/* Trust footer */}
                <p
                  className="text-center text-[10px] pb-1"
                  style={{ color: "rgba(255,255,255,0.18)" }}
                >
                  🔒 Secured by Razorpay · One-time payment · No subscription
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
