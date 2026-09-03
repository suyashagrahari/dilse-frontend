// ─── Share bus ───────────────────────────────────────────────────────────────
//
// A one-slot module store so any template's editor hook can open the share sheet
// with a single call, and the sheet itself is mounted exactly once.
//
// ── WHY A BUS AND NOT A PROP ─────────────────────────────────────────────────
//
// The sheet is opened from `handleShare` inside ~40 `useXxxEditor` hooks. A hook
// cannot render, so the alternative is for every one of those hooks to expose
// `showShareSheet`/`closeShareSheet` state and for every one of the 40 matching
// `page.tsx` files to mount and wire the component. That is 80 files of
// identical plumbing, and the failure mode is silent: forget the JSX in one
// page and that template's Share button does nothing at all.
//
// With a bus, `handleShare` is one line, the sheet is mounted once in the
// templates layout, and there is no per-template wiring left to forget.
//
// ── WHY NOT REACT CONTEXT ────────────────────────────────────────────────────
//
// Context would need a provider above every template AND a `useContext` call in
// each hook — same 40-file problem, plus the hooks would gain a mandatory
// provider they currently do not need to be tested. A module-scoped store has
// neither requirement. There is only ever one share sheet on screen, so the
// single global slot is not a limitation; it is the actual invariant.
//
// ── SSR ──────────────────────────────────────────────────────────────────────
//
// `useSyncExternalStore` is given a server snapshot of `null`, so the sheet is
// always closed in the server render and there is no hydration mismatch. The
// store is never written during a server render because `openShareSheet` is
// only ever reached from an event handler.

import { useSyncExternalStore } from "react";

import { deferUntilFeedbackClosed, requestFeedback } from "@/lib/feedback/feedbackBus";

export interface SharePayload {
  /** The published page's URL. The only required field. */
  url: string;
  /** Native-share sheet title, and the fallback headline on the printed card. */
  title?: string;
  /** The message that travels alongside the link in chat apps. */
  text?: string;
  /** Headline on the printable card. Falls back to `title`. */
  cardTitle?: string;
  /** The line under the QR on the printed card — the instruction to the reader. */
  cardNote?: string;
  /** Printed above the QR, as "For <name>". Omitted entirely when absent. */
  recipientName?: string;
  /** Printed below the QR, as "From <name>". Omitted entirely when absent. */
  senderName?: string;
  /**
   * The page's own unlock word, if it has one.
   *
   * This is the thing the sender is most likely to forget to pass on, and a
   * printed card carrying a code to a page nobody can open is worse than no
   * card at all. The sheet offers to print it and lets the sender decline —
   * see the note on `includePassword` in `ShareSheet`.
   *
   * Callers pass what they already hold; nothing here fetches it.
   */
  password?: string;
  /**
   * The template's own accent, so the sheet and the card wear its palette
   * rather than a house colour that belongs to no template.
   */
  accent?: string;
  /** Filename stem for the two downloads. Defaults to "subhsandesh". */
  slug?: string;
  /**
   * Whether opening this sheet may first ask the creator how it went.
   *
   * Defaults to true, so a new template editor gets the feedback prompt without
   * anybody wiring it — the same reasoning that keeps the sheet itself on a bus.
   * Set false where the sheet is NOT the end of a publish: the profile re-shares
   * pages made weeks ago, and "how was making this?" about a page somebody
   * finished in August is a question with no useful answer.
   */
  askFeedback?: boolean;
}

let current: SharePayload | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listen of listeners) listen();
}

/**
 * Open the share sheet. Safe to call with a falsy URL — it is a no-op rather
 * than a sheet showing an empty link, because every caller guards on `shareUrl`
 * already and a second silent failure mode is worse than none.
 */
export function openShareSheet(payload: SharePayload): void {
  if (!payload?.url) return;

  // ── The feedback ask goes FIRST ─────────────────────────────────────────
  //
  // Publish → "how was that?" → the link. This is the one place in the app
  // that knows a publish has just succeeded for every one of the forty-three
  // templates, which is why the interception lives here rather than in the
  // editors. `requestFeedback` applies its own restraint — once per page, never
  // when signed out, never two at once — and returns false whenever it decides
  // not to ask, in which case this behaves exactly as it always did.
  //
  // The payload is held in the release callback, not in `current`, so the sheet
  // is genuinely not open while the modal is up: nothing renders behind it and
  // an interrupted session leaves no half-open sheet.
  if (payload.askFeedback !== false) {
    const asked = requestFeedback(
      {
        templateSlug: payload.slug ?? "",
        pageUrl: payload.url,
        templateTitle: payload.cardTitle || payload.title,
      },
      () => {
        current = payload;
        emit();
      }
    );
    if (asked) return;

    // Already asking — raised a moment ago by a template that publishes through
    // its own handler. Wait for that modal rather than opening the sheet
    // underneath it.
    if (deferUntilFeedbackClosed(() => {
      current = payload;
      emit();
    })) return;
  }

  current = payload;
  emit();
}

export function closeShareSheet(): void {
  if (current === null) return;
  current = null;
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => current;
const getServerSnapshot = () => null;

/** The currently-open payload, or null. Re-renders only on open/close. */
export function useSharePayload(): SharePayload | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
