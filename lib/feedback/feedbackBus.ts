// ─── Feedback bus ────────────────────────────────────────────────────────────
//
// A one-slot module store, the same shape as `lib/share/shareBus` and
// `lib/paywall/paywallBus`, holding the request to ask a creator how making
// their page went.
//
// ── ONE DOOR: THE SHARE ACTION ──────────────────────────────────────────────
//
// The ask is raised when the creator taps SHARE, never on publish, and there is
// exactly one function that raises it: `askThenRun` below. Two earlier designs
// were wrong in instructive ways:
//
//   1. One interception inside `openShareSheet`, on the theory that every
//      editor calls it on publish. Measured, 33 of 43 did — the other ten
//      render their own "Published!" panel and never touch the house sheet, so
//      the interception silently missed them.
//   2. Those ten then called `requestFeedback` directly at publish success.
//      That closed the hole and opened a worse one: it put a form over the
//      "it worked" confirmation, which is the single message somebody needs at
//      that instant, and it asked people who were not finished — publish is not
//      the end of a session, because plenty of creators edit and publish again.
//
// Both were also unmeasurable, because the publish toast carried the link and a
// Copy button. A creator could copy from the toast, never open a sheet, and
// never be asked — so "43 of 43 covered" was true of the code and false of the
// product.
//
// The current shape removes the second door rather than adding a third trigger:
// the toast confirms the publish and says nothing else, the link lives behind
// the Share button alone, and Share routes through `askThenRun`. Two reveal
// paths remain — the house sheet for 33 templates, a template's own sheet for
// the other ten — and both call the same function, so neither can drift.
// `scripts/feedback-coverage.mjs` fails the build if a template publishes with
// no gated share path, asks at publish, or puts a link back in a toast.
//
// ── WHY IN FRONT OF THE LINK AND NOT AFTER IT ───────────────────────────────
//
// Share → feedback → the link. The payload is held in this module's `onRelease`
// callback while the modal is up, and handed on the instant the person submits,
// skips or dismisses.
//
// The obvious alternative — give them the link and ask on the way out — was
// considered and rejected. Tapping Share is where a session ENDS: the next
// thing that happens is the creator leaving for WhatsApp, and almost nobody
// comes back. Asking first costs one dismissible modal on the way to a link
// they are about to receive anyway, and it is the difference between a feature
// that collects feedback and one that collects almost none.
//
// What that buys has to be paid for in restraint, and it is: one ask per page
// (never twice for the same link), never for a logged-out visitor, never two at
// once, Escape or a backdrop tap gets straight through, and `run` fires on every
// path — including a thrown callback — so the ask can never cost somebody the
// link. `lib/feedback/feedbackBus.test.mjs` exists to keep that last promise.
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
 * The one gate every link-reveal goes through: ask, then run.
 *
 * ── WHY THIS EXISTS RATHER THAN THREE CALLERS DOING IT BY HAND ──────────────
 *
 * `run` is "show the creator their link" — the house share sheet for most
 * templates, a template's own sheet for the ten that render their own. Both
 * need the identical three-case decision, and getting it wrong is silent in
 * opposite directions: forget the fallback and a template's Share button stops
 * working the moment feedback declines to ask; forget the defer and the sheet
 * opens underneath an open modal. Writing it once means a new template cannot
 * pick the wrong half.
 *
 * `run` is called exactly once on every path, so the creator ALWAYS reaches
 * their link — asking is best-effort, delivering the link is not.
 */
export function askThenRun(ctx: FeedbackContext, run: () => void): void {
  // Asked: the modal is up and owns `run`, firing it on submit, skip or dismiss.
  if (requestFeedback(ctx, run)) return;
  // A modal is already up for something else — queue behind it rather than
  // opening a sheet under it.
  if (deferUntilFeedbackClosed(run)) return;
  // Not a moment to ask (already asked, signed out, no URL). Straight through,
  // exactly as if this feature did not exist.
  run();
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
