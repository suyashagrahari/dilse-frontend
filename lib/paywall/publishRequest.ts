// ─── publishFetch ────────────────────────────────────────────────────────────
//
// The one thing a template editor calls. Every editor already had these two
// lines somewhere in its publish path:
//
//     const pubRes    = await fetch(`${BASE}/${id}/publish`, { method: "POST", headers: headers() });
//     const pubResult = await pubRes.json();
//
// and the change is to the first line only:
//
//     const pubRes    = await publishFetch(
//       { slug: TEMPLATE, templateType: "streak", pageId: id },
//       () => fetch(`${BASE}/${id}/publish`, { method: "POST", headers: headers() })
//     );
//
// Nothing else in the editor changes — not the `.json()`, not the
// `if (pubResult.success)`, not the toast, not the `finally`. That is the point.
//
// ── WHY WRAPPING THE REQUEST BEATS INSPECTING THE RESPONSE ──────────────────
//
// The obvious shape is to leave the fetch alone and add a branch:
//
//     } else if (offerPaywall(pubResult, { … })) { … }
//
// It does not survive contact with forty-one editors. Each one then needs a way
// to re-run its publish once payment lands, which means either a `useRef` plus an
// effect per file, or naming the enclosing publish callback at the call site.
// Across these files that callback is named `handlePublish`, `publish`,
// `doPublish` — or nothing at all, because several publish sites sit inside a
// `useEffect` that auto-publishes after login and have no name to give. Getting
// that wrong in one file means a user pays and the page never goes live.
//
// Wrapping the request removes the question. The returned promise does not settle
// until the paywall is resolved, so the editor's own `if (pubResult.success)` —
// the code that sets the share URL and shows the toast — runs afterwards exactly
// as it always did, against the second attempt's response.
//
// Returning a `Response` rather than parsed JSON is what keeps the diff to one
// line: `await pubRes.json()` still works, and `pubResult` keeps the same
// implicit type it had before, so none of the seventy-five call sites need a cast.
//
// Three consequences, all of them wanted:
//
//   • The editor's `publishing` flag stays true while the paywall is up, because
//     its `await` has not returned. The Publish button keeps its spinner, which
//     is the truth: the publish is still in progress.
//   • Its `finally { setPublishing(false) }` runs once, at the real end.
//   • If the user dismisses the paywall, this resolves with the original 402
//     response, so the editor's existing failure branch shows its normal
//     message. A dismissed paywall is a failed publish, and every editor already
//     knows how to say so.

import { isPaymentRequired, offerPaywall, type PaywallContext } from "./paywallBus";

/**
 * Perform a publish request, showing the paywall if the page must be paid for.
 *
 * `doFetch` is a function rather than a promise because it is called again —
 * once, after payment. Pass the same request the editor would have made; it is a
 * POST with no body, so issuing it twice is safe, and the second one is what the
 * gate finally allows.
 *
 * Never throws on the paywall path. A network failure in `doFetch` propagates
 * exactly as the editor's own `fetch` would have, so existing `catch` blocks keep
 * working unchanged.
 */
export async function publishFetch(
  ctx: PaywallContext,
  doFetch: () => Promise<Response>
): Promise<Response> {
  const res = await doFetch();

  // Cheap exit for the overwhelming majority: free templates, and paid ones the
  // user has already paid for.
  if (res.status !== 402) return res;

  // `clone()` so the caller's own `.json()` still has an unread body to parse if
  // we hand this same response back.
  const body = await res
    .clone()
    .json()
    .catch(() => null);

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
        // Publish again. The gate now finds a paid PaymentOrder and allows it.
        void doFetch()
          .then(once)
          .catch((err) => {
            // The payment succeeded and the page is unlocked, but this second
            // request did not get through — a dropped connection, most likely.
            // Say something true rather than leaving the editor awaiting a
            // promise that never settles. Pressing Publish again costs nothing.
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
      // A dismissed paywall is a failed publish. Handing back the original 402
      // lets the editor's existing else-branch handle it with no new wiring.
      onDismiss: () => once(res),
    });

    // `offerPaywall` declined to render — no usable pricing, or no pageId. Give
    // the caller the 402 so it takes its normal failure path rather than waiting
    // on a paywall that was never shown.
    if (!raised) once(res);
  });
}
