"use client";

// ─── PaywallHost — the single mount point ────────────────────────────────────
//
// Mounted once in the templates layout, beside `ShareSheetHost` and for the same
// reason. It renders nothing at all until something calls `offerPaywall`, so it
// costs one subscription and a null render otherwise.
//
// All the checkout logic lives here rather than in a hook each editor calls,
// because there is only ever one checkout in flight and forty-two copies of this
// state machine is forty-two chances to get a payment wrong. See
// `lib/paywall/paywallBus.ts` for why a bus and not props or context.

import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPoints } from "@/store/authSlice";
import PaymentModal from "@/components/PaymentModal";
import { API_URL, IS_NGROK } from "@/lib/config";
import { refreshPricing } from "@/lib/pricing";
import { closePaywall, completePaywall, usePaywallRequest } from "@/lib/paywall/paywallBus";
import { track } from "@/lib/analytics/track";
import { EVENTS } from "@/lib/analytics/events";

export type PaywallStatus = "idle" | "loading" | "error";

export default function PaywallHost() {
  const request = usePaywallRequest();
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((s) => s.auth.accessToken);

  const [status, setStatus] = useState<PaywallStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  // Reset when a new request arrives, so a previous failure is not still on
  // screen the next time the paywall opens.
  const openedFor = useRef<string | null>(null);
  useEffect(() => {
    const key = request ? `${request.pageId}:${request.pricing.finalPricePaise}` : null;
    if (key === openedFor.current) return;
    openedFor.current = key;
    setStatus("idle");
    setError(null);

    if (request) {
      track(EVENTS.BEGIN_CHECKOUT, {
        template: request.slug,
        value: request.pricing.finalPrice,
        currency: "INR",
      });
    }
  }, [request]);

  const headers = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
    }),
    [accessToken]
  );

  // ── Option A: points ──────────────────────────────────────────────────────

  const onSpendPoints = useCallback(async () => {
    if (!request) return;
    const { templateType, pageId, slug, pricing } = request;

    setStatus("loading");
    setError(null);
    try {
      const res = await fetch(`${API_URL}/payment/spend-points`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ templateType, pageId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to spend points");

      // The server is the authority on the new balance — it deducted atomically
      // and may have refused a concurrent second spend.
      if (typeof data.data?.remainingPoints === "number") {
        dispatch(setPoints(data.data.remainingPoints));
      }

      // Deliberately NOT `purchase`: a purchase worth ₹0 drags revenue and
      // average order value toward zero and makes both reports meaningless.
      track(EVENTS.SPEND_POINTS, { template: slug, points_cost: pricing.pointsCost });

      completePaywall();
    } catch (err) {
      track(EVENTS.PAYMENT_FAILED, { template: slug, method: "points" });
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to spend points");
    }
  }, [request, headers, dispatch]);

  // ── Option B: Razorpay ────────────────────────────────────────────────────

  const onRazorpay = useCallback(async () => {
    if (!request) return;
    const { templateType, pageId, slug, pricing } = request;

    setStatus("loading");
    setError(null);
    try {
      // The displayed price travels with the request. If a super admin has
      // changed it since the gate quoted it, the server answers 409 rather than
      // charging an amount that was never on screen.
      const orderRes = await fetch(`${API_URL}/payment/create-order`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          templateType,
          pageId,
          expectedFinalPricePaise: pricing.finalPricePaise,
        }),
      });
      const orderData = await orderRes.json();

      if (orderRes.status === 409 && orderData?.code === "PRICE_CHANGED") {
        // Pull the new price into the badges, and tell the user plainly. Not an
        // error they caused, and not something to retry silently at a new price.
        void refreshPricing();
        setStatus("error");
        setError(orderData.error || "The price changed. Please close this and try again.");
        return;
      }
      if (orderRes.status === 400 && orderData?.code === "ALREADY_PUBLISHED") {
        // Nothing to pay for. Treat it as unlocked so the editor re-publishes and
        // the user lands where they were going.
        completePaywall();
        return;
      }
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.error || "Failed to create payment order");
      }

      const { orderId, amount, currency, keyId, name, description } = orderData.data;

      if (!keyId) {
        // No public key configured. Fail loudly here rather than opening a
        // Razorpay sheet that cannot work.
        throw new Error("Payments are not configured. Please try again later.");
      }

      await loadRazorpayScript();

      await new Promise<void>((resolve, reject) => {
        const rzp = new (
          window as unknown as { Razorpay: new (o: unknown) => { open: () => void } }
        ).Razorpay({
          key: keyId,
          amount,
          currency,
          name: name || "SubhSandesh",
          description: description || `Unlock ${name || slug}`,
          order_id: orderId,

          handler: async (r: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            try {
              // The page is NOT unlocked until the server has verified the
              // signature. A Razorpay success callback is a claim, not a payment.
              const v = await fetch(`${API_URL}/payment/verify`, {
                method: "POST",
                headers: headers(),
                body: JSON.stringify({
                  razorpayOrderId: r.razorpay_order_id,
                  razorpayPaymentId: r.razorpay_payment_id,
                  razorpaySignature: r.razorpay_signature,
                }),
              });
              const vd = await v.json();
              if (!v.ok || !vd.success) {
                throw new Error(vd.error || "Payment verification failed");
              }
              resolve();
            } catch (e) {
              reject(e);
            }
          },

          modal: { ondismiss: () => reject(new Error("PAYMENT_CANCELLED")) },
          prefill: {},
          theme: { color: "#FF6B35" },
        });
        rzp.open();
      });

      // Fired only after the server verified the signature, so this counts money
      // actually taken. `amount` is paise; GA4 revenue must be in major units.
      track(EVENTS.PURCHASE, {
        template: slug,
        value: typeof amount === "number" ? amount / 100 : pricing.finalPrice,
        currency: "INR",
        transaction_id: typeof orderId === "string" ? orderId : undefined,
      });

      completePaywall();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment failed";

      if (msg === "PAYMENT_CANCELLED") {
        track(EVENTS.CHECKOUT_CANCELLED, {
          template: slug,
          value: pricing.finalPrice,
          currency: "INR",
        });
        setStatus("idle");
        setError(null);
        return;
      }

      track(EVENTS.PAYMENT_FAILED, { template: slug, method: "razorpay" });
      setStatus("error");
      // ── Why this wording, when we do not know ────────────────────────────
      //
      // The dangerous case is a payment that succeeded at Razorpay and then
      // failed verification here: the money is gone and the page is locked. The
      // user must not be told "payment failed" and left to pay twice, so the
      // copy points at retrying the publish, which passes the gate for free if
      // the order did land.
      setError(
        /verification/i.test(msg)
          ? "We could not confirm the payment. If you were charged, close this and press Publish again — you will not be charged twice."
          : msg
      );
    }
  }, [request, headers]);

  if (!request) return null;

  return (
    <PaymentModal
      open
      pricing={request.pricing}
      templateTitle={request.templateTitle}
      paymentStatus={status}
      paymentError={error}
      onClose={closePaywall}
      onSpendPoints={onSpendPoints}
      onRazorpay={onRazorpay}
    />
  );
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as unknown as { Razorpay?: unknown }).Razorpay) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () =>
      reject(new Error("Could not load the payment window. Check your connection and try again."));
    document.head.appendChild(s);
  });
}
