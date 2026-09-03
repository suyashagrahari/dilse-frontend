// ─── Feedback bus ────────────────────────────────────────────────────────────
//
// A one-slot module store, the same shape as `lib/share/shareBus` and
// `lib/paywall/paywallBus`, holding the request to ask a creator how making
// their page went.
//
// ── WHERE THE ASK IS RAISED FROM: TWO PLACES, NOT FORTY-THREE ───────────────
//
// The first plan was one interception inside `openShareSheet`, on the theory
// that every editor calls it on publish. Measured, that turned out to be 33 of
// the 43 that publish. Ten templates — holi, eid-mubarak, valentine-gf, love-gf,
// darling, birthday-gf, reception, shaadi-card, christian-wedding,
// wedding-shaadi — show their own inline "Published!" panel and never raise the
// house sheet, so the single interception silently missed them. Holi was the
// template used to test it, which is the only reason it was noticed.
//
// So there are two triggers:
//
//   · `openShareSheet` intercepts, for the 33. This one also HOLDS THE SHEET
//     BACK, so the ask genuinely comes first.
//   · those ten editors call `requestFeedback` directly at their publish
//     success point.
//
// Two triggers cannot double-ask: `markAsked` is written the moment the modal is
// raised, and `requestFeedback` refuses while one is open. `scripts/feedback-coverage.mjs`
// asserts the union still covers every template that publishes, so template
// forty-four cannot ship silently unasked — which is the failure this shape was
// chosen to avoid and did not, on its own, prevent.
//
// ── WHY IT SITS IN FRONT OF THE SHARE SHEET AND NOT BEHIND IT ───────────────
//
// Publish → feedback → share sheet. The share payload is held in this module's
// `onRelease` callback while the modal is up, and handed on the instant the
// person submits or skips.
//
// The obvious alternative — let them have their link first and ask on the way
// out — was considered and rejected as a product decision: the share sheet is
// where a session ENDS, because the next thing that happens is the creator
// leaving for WhatsApp. Almost nobody comes back through it. Asking first costs
// one dismissible modal on the way to the link and is the difference between a
// feature that collects feedback and one that collects almost none.
//
// What that buys has to be paid for in restraint, and it is: one ask per page
// (never twice for the same link), never for a logged-out visitor, never two at
// once, and Escape or a backdrop tap gets straight through to the link.
//
// ── WHY localStorage AND NOT ONLY THE SERVER'S UNIQUE INDEX ─────────────────
//
// The server already refuses duplicates — `(userId, pageUrl)` is unique — but a
// unique index cannot stop the MODAL appearing, only the second row. The
// question "have I already asked about this link?" has to be answerable before
// any request is made, offline, in the same tick as the publish. That is a
// client-side fact, so it is stored client-side. The index remains the thing
// that keeps the DATA honest when storage is cleared or a second device is used.

import { useSyncExternalStore } from "react";

export interface FeedbackContext {
  /** The template's editor-route slug, e.g. "happy-rakshabandhan-to-brother". */
  templateSlug: string;
  /** The published page's URL. Doubles as the "already asked" key. */
  pageUrl: string;
  /** For the modal's headline: "your Raksha Bandhan page". */
  templateTitle?: string;
}

interface FeedbackRequest {
  ctx: FeedbackContext;
  /**
   * Runs once, when the modal is done with — submitted, skipped or dismissed.
   * This is what lets the share sheet through, so it must be called on EVERY
   * exit path including a failed submit. A creator who cannot reach their link
   * because our feedback form broke is a far worse outcome than lost feedback.
   */
  onRelease: () => void;
}

const STORAGE_PREFIX = "ss_feedback_asked:";

let current: FeedbackRequest | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listen of listeners) listen();
}

/** Has this exact page already been asked about, on this device? */
export function wasAsked(pageUrl: string): boolean {
  if (typeof window === "undefined" || !pageUrl) return false;
  try {
    return window.localStorage.getItem(STORAGE_PREFIX + pageUrl) !== null;
  } catch {
    // Private mode, or storage disabled. Treated as "not asked": erring towards
    // asking is recoverable (they skip), erring towards silence is not.
    return false;
  }
}

/**
 * Marked at the moment the modal is RAISED, not when it is answered.
 *
 * Deliberate. Someone who dismisses the modal has answered the question of
 * whether they want to be asked, and re-asking on the next publish of the same
 * page — or after a reload mid-modal — would be nagging.
 */
function markAsked(pageUrl: string): void {
  try {
    window.localStorage.setItem(STORAGE_PREFIX + pageUrl, String(Date.now()));
  } catch {
    // Nothing to do. The worst case is being asked twice about one page.
  }
}

/** The access token, or null when nobody is signed in. */
function hasSession(): boolean {
  try {
    return Boolean(
      window.sessionStorage.getItem("gifts_impersonation_token") ||
        window.localStorage.getItem("gifts_access_token")
    );
  } catch {
    return false;
  }
}

/**
 * Ask for feedback, if this is a moment where asking is right.
 *
 * Returns `true` when the modal was raised — and ONLY then does the caller hand
 * over responsibility for what happens next, via `onRelease`. Returning `false`
 * means the caller should carry on exactly as it would have without this
 * feature, which is why every guard below returns rather than throws.
 */
export function requestFeedback(ctx: FeedbackContext, onRelease: () => void): boolean {
  if (typeof window === "undefined") return false;
  // One at a time. A second publish while the modal is open keeps its own share
  // sheet behaviour rather than queueing behind a form.
  if (current !== null) return false;
  if (!ctx?.pageUrl) return false;
  // A reply is an email, so feedback from a signed-out visitor has nowhere to
  // go. Publishing requires a session, so this is a guard, not a common path.
  if (!hasSession()) return false;
  if (wasAsked(ctx.pageUrl)) return false;

  markAsked(ctx.pageUrl);
  current = { ctx, onRelease };
  emit();
  return true;
}

/**
 * Queue something to run when the open modal closes, if one is open.
 *
 * Returns `true` when it took responsibility. This exists for the case where a
 * template raises the ask from its own publish handler AND opens the house share
 * sheet: `requestFeedback` refuses the second ask (one at a time), and without
 * this the sheet would then open immediately and sit revealed underneath the
 * modal. None of the forty-three does both today; this makes the forty-fourth
 * safe rather than relying on nobody trying.
 */
export function deferUntilFeedbackClosed(run: () => void): boolean {
  if (current === null) return false;
  const previous = current.onRelease;
  // Mutated in place rather than replaced. `getSnapshot` returns this object,
  // and handing `useSyncExternalStore` a new identity without an `emit()` is
  // the shape React warns about — the modal's rendered state has not changed,
  // only what happens after it closes.
  current.onRelease = () => {
    previous();
    run();
  };
  return true;
}

/**
 * Close the modal and let whatever was waiting behind it through.
 *
 * Idempotent, and the release callback runs at most once however many times this
 * is called — a double-fire would open the share sheet twice.
 */
export function closeFeedback(): void {
  const request = current;
  if (request === null) return;
  current = null;
  emit();
  try {
    request.onRelease();
  } catch (err) {
    // The release is somebody else's callback. If it throws, the modal is
    // already closed and must stay closed.
    console.error("[feedback] release callback threw", err);
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => current;
const getServerSnapshot = () => null;

/** The open request, or null. Re-renders only on open/close. */
export function useFeedbackRequest(): FeedbackRequest | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Test/debug escape hatch: forget that a page was asked about. */
export function clearAsked(pageUrl: string): void {
  try {
    window.localStorage.removeItem(STORAGE_PREFIX + pageUrl);
  } catch {
    /* nothing to do */
  }
}
