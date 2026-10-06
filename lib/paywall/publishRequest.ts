// ─── Getting past the paywall, before publishing ─────────────────────────────
//
// One function a template editor calls, between saving the page and publishing
// it:
//
//     const gate = await ensurePublishAllowed(
//       { slug: TEMPLATE, templateType: "streak", pageId: id, templateTitle: "Streak" },
//       setPublishing,
//     );
//     if (gate === "cancelled") return;
//
//     const pubRes = await fetch(`${BASE}/${id}/publish`, { method: "POST", headers: headers() });
//
// Everything after that line is the editor's existing code, unchanged.
//
// ── WHY ASK FIRST INSTEAD OF READING THE 402 ────────────────────────────────
//
// The previous shape wrapped the publish request and put the paywall up when the
// server refused it. It worked, and it is still the backstop, but it meant the
// Publish button began spinning, the request went out, came back refused, and the
// paywall opened — with the spinner still going, because the publish had not
// completed and would not until payment finished. A user pressing Publish on a
// paid template saw a loading state before being asked for money, and another one
// behind the sheet the whole time they were paying.
//
// Asking first costs one fast GET and inverts that: the paywall appears with
// nothing spinning, and the publish request is only ever made when it will
// succeed.
//
// ── WHY IT TAKES THE SPINNER SETTER ────────────────────────────────────────
//
// Because the honest state changes twice. While we are checking, and while the
// sheet is open, the editor is NOT publishing — it is waiting for a person. Only
// after payment does publishing resume. Handing the setter over lets this function
// own that, rather than every one of forty-two editors reproducing the same
// three-state dance and one of them getting it wrong.
//
// It is optional. An editor with no spinner passes nothing.

import { API_URL, IS_NGROK } from "@/lib/config";
import { isPaymentRequired, offerPaywall, readPricing, type PaywallContext } from "./paywallBus";
import { debugCountryHeader } from "@/lib/money";
import { pushToast } from "@/lib/toast/toastBus";

export type PublishGateResult =
  /** Free, already paid, already published, or paid just now. Go ahead. */
  | "allowed"
  /** The user closed the paywall without paying. The caller must stop. */
  | "cancelled";

function headers(token: string | null | undefined): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
    // A super admin's "Test checkout as" country, so the access check agrees
    // with the quote and the order. The server ignores it for everyone else.
    ...debugCountryHeader(),
  };
}

/** The access token, read at call time so a fresh login is picked up. */
function currentToken(): string | null {
  try {
    return (
      window.sessionStorage.getItem("gifts_impersonation_token") ||
      window.localStorage.getItem("gifts_access_token")
    );
  } catch {
    return null;
  }
}

/**
 * Make sure this page may be published, paying for it first if it must be.
 *
 * Resolves `"allowed"` when the caller should go on and publish, `"cancelled"`
 * when the user walked away from the paywall.
 *
 * Never throws. Every failure resolves `"allowed"` so the caller proceeds and the
 * server's own 402 becomes the backstop — the behaviour that existed before this
 * function did. A broken check must not be a dead Publish button.
 */
export async function ensurePublishAllowed(
  ctx: PaywallContext,
  setBusy?: (busy: boolean) => void
): Promise<PublishGateResult> {
  if (!ctx.pageId) {
    // Nothing saved yet, so nothing to price against. Let the caller carry on;
    // it will fail for its own reasons and say so in its own words.
    return "allowed";
  }

  // ── Drop the busy state NOW, before the check ─────────────────────────────
  //
  // Not after. Several editors render a full-screen "Publishing your card…"
  // overlay off this flag, and leaving it up while we ask whether payment is owed
  // is the exact complaint this function exists to fix: a loading state that
  // appears before the paywall, and then sits behind it.
  //
  // From here until we know the answer, the honest state is "not publishing" —
  // we are asking a question, and then possibly waiting on a person. If the
  // answer is "go ahead", the flag goes back on around the publish itself.
  setBusy?.(false);

  let needsPayment = false;
  let pricing: unknown = null;

  try {
    const res = await fetch(
      `${API_URL}/payment/access?templateType=${encodeURIComponent(ctx.templateType)}&pageId=${encodeURIComponent(ctx.pageId)}`,
      { headers: headers(currentToken()), cache: "no-store" }
    );
    const json = await res.json();
    if (!res.ok || !json?.success) {
      // Includes the 403 for a page the user does not own. Not our call to
      // report — the publish that follows will say the same thing properly.
      setBusy?.(true);
      return "allowed";
    }
    needsPayment = Boolean(json.data?.needsPayment);
    pricing = json.data?.pricing;
    // A priced template, free because "Only visitors outside India pay" is on.
    // Say so, so it reads as a gift rather than a price that silently vanished.
    if (json.data?.reason === "free_in_india") {
      pushToast({ type: "success", title: "🇮🇳 Free for you in India", message: "This premium template costs nothing to publish from India." });
    }
  } catch {
    setBusy?.(true);
    return "allowed";
  }

  // Nothing owed — straight on to the publish, so the flag goes back.
  if (!needsPayment) {
    setBusy?.(true);
    return "allowed";
  }

  // A 402-shaped object, because `offerPaywall` validates the same envelope
  // whether it came from a refusal or from this check — one parser, one set of
  // rules about what counts as usable pricing.
  const asRefusal = { error: "PAYMENT_REQUIRED", pricing };
  if (!readPricing(pricing)) {
    // The server says payment is owed but did not give a usable price. Showing a
    // paywall we cannot fill would be worse than letting the publish be refused
    // with a message.
    console.error("[paywall] access says payment is required but sent no usable pricing", pricing);
    setBusy?.(true);
    return "allowed";
  }

  // Already off, and it stays off: from here we are waiting on a person.
  return new Promise<PublishGateResult>((resolve) => {
    let settled = false;
    const once = (v: PublishGateResult) => {
      if (settled) return;
      settled = true;
      // Back to busy only on the way to an actual publish.
      if (v === "allowed") setBusy?.(true);
      resolve(v);
    };

    const raised = offerPaywall(asRefusal, {
      ...ctx,
      onPaid: () => once("allowed"),
      onDismiss: () => once("cancelled"),
    });

    // Could not render it — no pageId, or pricing it rejected. Fall through to
    // the publish attempt and let the server's 402 be the honest answer.
    if (!raised) once("allowed");
  });
}

/**
 * Publish, putting the paywall up if the server refuses with a 402.
 *
 * The BACKSTOP, not the main path — `ensurePublishAllowed` above is what editors
 * call. This stays for the case the check could not answer: a network blip, a
 * price that changed in the moment between asking and publishing, or an editor
 * that has not been moved over yet. It returns a `Response` so
 * `await pubRes.json()` keeps working unchanged.
 */
export async function publishFetch(
  ctx: PaywallContext,
  doFetch: () => Promise<Response>
): Promise<Response> {
  const res = await doFetch();

  if (res.status !== 402) return res;

  // `clone()` so the caller's own `.json()` still has an unread body if we hand
  // this same response back.
  const body = await res.clone().json().catch(() => null);
  if (!isPaymentRequired(body)) return res;

  return new Promise<Response>((resolve) => {
    let settled = false;
    const once = (value: Response) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    const raised = offerPaywall(body, {
      ...ctx,
      onPaid: () => {
        void doFetch()
          .then(once)
          .catch((err) => {
            // Paid, unlocked, and this second request did not get through.
            // Say something true rather than leaving the caller on a promise
            // that never settles. Pressing Publish again costs nothing.
            console.error("[paywall] re-publish after payment failed", err);
            once(
              new Response(
                JSON.stringify({
                  success: false,
                  error: "Payment received. Please press Publish once more to go live.",
                }),
                { status: 200, headers: { "Content-Type": "application/json" } }
              )
            );
          });
      },
      onDismiss: () => once(res),
    });

    if (!raised) once(res);
  });
}
