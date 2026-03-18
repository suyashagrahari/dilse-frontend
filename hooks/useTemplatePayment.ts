"use client";

import { useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPoints } from "@/store/authSlice";
import { API_URL, IS_NGROK } from "@/lib/config";
import type { ClientTemplatePricing } from "@/config/templatePricing";

export type PaymentStatus = "idle" | "loading" | "success" | "error";

export interface PaymentModalState {
  templateType: string;
  pageId: string;
  pricing: ClientTemplatePricing;
}

export interface UseTemplatePaymentReturn {
  paymentModal: PaymentModalState | null;
  paymentStatus: PaymentStatus;
  paymentError: string | null;
  paymentJustCompleted: boolean;
  openPaymentModal: (state: PaymentModalState) => void;
  closePaymentModal: () => void;
  handleSpendPoints: () => Promise<void>;
  handleRazorpayPayment: () => Promise<void>;
  resetPaymentCompleted: () => void;
}

export function useTemplatePayment(): UseTemplatePaymentReturn {
  const dispatch = useAppDispatch();
  const { accessToken } = useAppSelector((s) => s.auth);

  const [paymentModal, setPaymentModal]             = useState<PaymentModalState | null>(null);
  const [paymentStatus, setPaymentStatus]           = useState<PaymentStatus>("idle");
  const [paymentError, setPaymentError]             = useState<string | null>(null);
  const [paymentJustCompleted, setPaymentJustCompleted] = useState(false);

  const headers = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
    }),
    [accessToken]
  );

  const openPaymentModal = useCallback((state: PaymentModalState) => {
    setPaymentStatus("idle");
    setPaymentError(null);
    setPaymentJustCompleted(false);
    setPaymentModal(state);
  }, []);

  const closePaymentModal = useCallback(() => {
    // Prevent closing while a payment request is in flight
    setPaymentModal((prev) => {
      if (prev === null) return null;
      return null;
    });
    setPaymentStatus("idle");
    setPaymentError(null);
  }, []);

  const resetPaymentCompleted = useCallback(() => {
    setPaymentJustCompleted(false);
  }, []);

  // ── Option A: Spend Points ────────────────────────────────────────────────

  const handleSpendPoints = useCallback(async () => {
    if (!paymentModal) return;
    const { templateType, pageId } = paymentModal;

    setPaymentStatus("loading");
    setPaymentError(null);

    try {
      const res = await fetch(`${API_URL}/payment/spend-points`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ templateType, pageId }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to spend points");
      }

      // Sync updated points balance into Redux state
      if (typeof data.data?.remainingPoints === "number") {
        dispatch(setPoints(data.data.remainingPoints));
      }

      setPaymentStatus("success");
      setPaymentModal(null);
      setPaymentJustCompleted(true);
    } catch (err) {
      setPaymentStatus("error");
      setPaymentError(err instanceof Error ? err.message : "Failed to spend points");
    }
  }, [paymentModal, headers, dispatch]);

  // ── Option B: Razorpay Checkout ───────────────────────────────────────────

  const handleRazorpayPayment = useCallback(async () => {
    if (!paymentModal) return;
    const { templateType, pageId, pricing } = paymentModal;

    setPaymentStatus("loading");
    setPaymentError(null);

    try {
      // Step 1: Create order on server
      const orderRes = await fetch(`${API_URL}/payment/create-order`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ templateType, pageId }),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || "Failed to create payment order");
      }

      const { orderId, amount, currency, keyId, name, description } = orderData.data;

      // Step 2: Load Razorpay checkout script (lazy — only when needed)
      await loadRazorpayScript();

      // Step 3: Open Razorpay checkout and await user interaction
      await new Promise<void>((resolve, reject) => {
        const options = {
          key:         keyId,
          amount,
          currency,
          name:        name || "SubhSandesh",
          description: description || `Unlock ${pricing.name}`,
          order_id:    orderId,

          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id:   string;
            razorpay_signature:  string;
          }) => {
            try {
              // Step 4: Verify signature on server
              const verifyRes = await fetch(`${API_URL}/payment/verify`, {
                method: "POST",
                headers: headers(),
                body: JSON.stringify({
                  razorpayOrderId:   response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });
              const verifyData = await verifyRes.json();

              if (!verifyRes.ok || !verifyData.success) {
                throw new Error(verifyData.error || "Payment verification failed");
              }
              resolve();
            } catch (err) {
              reject(err);
            }
          },

          modal: {
            ondismiss: () => reject(new Error("PAYMENT_CANCELLED")),
          },

          prefill: {},
          theme:   { color: "#FF6B35" },
        };

        const rzp = new (
          window as Window & { Razorpay: new (opts: unknown) => { open: () => void } }
        ).Razorpay(options);

        rzp.open();
      });

      setPaymentStatus("success");
      setPaymentModal(null);
      setPaymentJustCompleted(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment failed";

      if (msg === "PAYMENT_CANCELLED") {
        // User closed the Razorpay modal — reset to idle (not an error)
        setPaymentStatus("idle");
        setPaymentError(null);
      } else {
        setPaymentStatus("error");
        setPaymentError(msg);
      }
    }
  }, [paymentModal, headers]);

  return {
    paymentModal,
    paymentStatus,
    paymentError,
    paymentJustCompleted,
    openPaymentModal,
    closePaymentModal,
    handleSpendPoints,
    handleRazorpayPayment,
    resetPaymentCompleted,
  };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Already loaded
    if ((window as Window & { Razorpay?: unknown }).Razorpay) {
      resolve();
      return;
    }

    const script    = document.createElement("script");
    script.src      = "https://checkout.razorpay.com/v1/checkout.js";
    script.async    = true;
    script.onload   = () => resolve();
    script.onerror  = () => reject(new Error("Failed to load Razorpay SDK. Check your internet connection."));
    document.head.appendChild(script);
  });
}
