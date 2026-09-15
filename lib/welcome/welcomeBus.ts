// ─── Welcome bus ─────────────────────────────────────────────────────────────
//
// A one-slot module store, the same shape as `lib/share/shareBus`,
// `lib/feedback/feedbackBus` and `lib/toast/toastBus`, holding the greeting
// shown to a creator who has been here before — at the moment a page of theirs
// goes live, and nowhere else.
//
// ── ONE DOOR: THE PUBLISH TOAST ─────────────────────────────────────────────
//
// There is exactly one place this is raised from: `pushToast` in
// `lib/toast/toastBus.ts`, when the toast being pushed is `type: "publish"`.
// That is not a convenient hook, it is the only honest one, and the reason is
// worth writing down because the feedback system got the same question wrong
// twice before getting it right.
//
// "Publish succeeded" is stated in forty-four editor hooks, in eighty places,
// with forty different words — "Published! 🧩", "Sent 💌", "Report filed 🔮".
// What every one of them shares is the single line `pushToast({ type:
// "publish", … })`. It is the ONE thing that is true of all of them, it is
// already load-bearing (`scripts/toast-coverage.mjs` and
// `scripts/feedback-coverage.mjs` both police it), and a new template gets this
// behaviour by doing what it was going to do anyway. The alternative — a
// `greetThenRun` call added to forty-four publish handlers — is the exact shape
// that left the feedback ask missing from ten templates for a month, and the
// failure is silent in the direction nobody checks.
//
// So the greeting goes IN FRONT OF the publish toast: mascot, then "It's live".
// Not after, and not beside it. "It's live" is the sentence the creator is
// waiting for, and a greeting that lands on top of it is a greeting that
// interrupts the only message that mattered.
//
// ── WHO COUNTS AS RETURNING ─────────────────────────────────────────────────
//
// Somebody whose account is at least `RETURNING_AFTER_MS` old. That is a
// deliberately duller rule than "has published before", and duller is right:
//
//   · A creator who signed up ninety seconds ago, inside THIS publish — the
//     overwhelmingly common first-time path, because publishing is what forces
//     the sign-in — must never be told "welcome back". It is the one case that
//     would actively read as broken, and account age is the only signal that
//     catches it on every route in (register, OTP, Google, and a deferred
//     publish that resumes after the token lands).
//   · It needs no extra request. `createdAt` already rides on `GET /auth/me`,
//     and is now on the login, OTP and Google payloads too, so the answer is
//     known in the same tick as the publish, offline, with nothing in flight.
//
// A half day, rather than an hour or a week, because the sentence has to be
// true: somebody who signed up this morning and is publishing their third card
// this afternoon never went anywhere, and greeting them is a lie the copy
// cannot survive. Come back that evening, or any later day, and it is simply
// true.
//
// ── AND HOW OFTEN: EVERY PUBLISH, EVERY TEMPLATE, NO EXCEPTIONS ─────────────
//
// There is no rate limit here at all. That is the design, arrived at the hard
// way, and it should not be re-added without reading this paragraph.
//
// It was capped twice. First at one greeting per twelve hours, on the reasoning
// that the third one in an afternoon stops being a greeting and becomes a toll
// on the confirmation somebody is waiting for. Then, when that was reported as
// "the gif does not show", at a ninety-second debounce to cover the one case
// that seemed genuinely worth suppressing: publish, spot a typo, publish again.
//
// Both were reported as bugs, by the same person, within a day. The second
// produced the most instructive report of the three — "it only comes in one
// template" — because somebody trying five editors in a row gets greeted on the
// first and silence on the rest, and there is no way to tell that apart from a
// feature that only works on one page.
//
// The lesson generalises past this file. A delight that fires SOMETIMES is not
// a quieter version of one that fires always; it is indistinguishable, from the
// outside, from one that is broken, and every hour anybody spends wondering
// which costs more than the repetition ever saved. If it is worth showing, show
// it. The only rule left is the one that keeps the sentence true — the account
// has to predate today (`RETURNING_AFTER_MS`) — and `current !== null` already
// stops two from stacking.
//
// The visible cost is small and bounded: republishing the same card greets
// again. That is a real edge, and it is the right one to lose.
//
// ── THE PROMISE THIS MODULE MAKES ───────────────────────────────────────────
//
// `run` is called exactly once, on every path, including a thrown callback and
// a greeting nobody dismisses. `run` is "tell them their page is live". Losing
// a greeting is nothing; losing that toast means a creator who published
// successfully and was told nothing at all. `welcomeBus.test.mjs` exists to
// keep that promise honest.

import { useSyncExternalStore } from "react";

import {
  WELCOME_MASCOTS,
  WELCOME_MASCOT_KEYS,
  preloadWelcomeMascot,
  type WelcomeMascotKey,
} from "./welcomeArt";

/** How old an account must be before "welcome back" is a true sentence. */
export const RETURNING_AFTER_MS = 12 * 60 * 60 * 1000;

/** The entrance animation in `MascotStage`, which runs before the loop does. */
export const ENTRANCE_MS = 420;

/**
 * Stillness after the loop finishes, so the greeting does not cut away on the
 * frame it lands on.
 *
 * Raised from 280ms once the hold started being measured from the artwork
 * rather than from the mount — see `WelcomeBackOverlay`. The pose at the end is
 * the whole point of both files (the penguin's arms up under its confetti, the
 * shiba holding its sign) and 280ms was not long enough to read it as a picture
 * rather than a flicker.
 */
export const REST_MS = 700;

export interface WelcomeGreeting {
  mascot: WelcomeMascotKey;
  /** Their first name, or "" when we do not have a usable one. */
  name: string;
  /** How long the overlay holds before releasing itself, in ms. */
  holdMs: number;
  /**
   * Runs once, when the greeting is done with — held out, tapped away, or
   * dismissed with Escape. This is what lets the publish toast through, so it
   * must fire on EVERY exit path.
   */
  onRelease: () => void;
}

/**
 * What the bus knows about the person looking at the screen.
 *
 * Registered by `WelcomeHost` from Redux rather than read from the store here,
 * for the same reason `feedbackBus` reads a raw token out of storage instead of
 * importing `store`: a bus with no dependency on the store stays testable in
 * plain node, cannot take part in an import cycle, and does not drag the whole
 * of `@reduxjs/toolkit` into the toast bundle. The host is mounted at the root
 * of both route groups and its effect runs long before anybody can publish.
 */
export interface Viewer {
  /** ISO date from the API. Absent on an older cached user object. */
  createdAt?: string | null;
  /** Their display name, for the line under the art. */
  name?: string | null;
}

let viewer: Viewer | null = null;
let current: WelcomeGreeting | null = null;
let armed: WelcomeMascotKey | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listen of listeners) listen();
}

/** Tell the bus who is signed in. Pass null on sign-out. */
export function setViewer(next: Viewer | null): void {
  viewer = next;
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
 * Is this a returning creator, at a moment where a greeting is right?
 *
 * Exported because `WelcomeHost` asks the same question to decide whether to
 * spend ~200 KB warming the artwork. Every guard returns rather than throws:
 * a greeting that cannot be decided is a greeting that does not happen, and the
 * publish toast carries on untouched.
 */
export function shouldGreet(now: number = Date.now()): boolean {
  if (typeof window === "undefined") return false;
  // One at a time. A second publish while the greeting is up goes straight
  // through rather than queueing behind an animation.
  if (current !== null) return false;
  if (!hasSession()) return false;

  const createdAt = viewer?.createdAt;
  if (!createdAt) return false;
  const created = Date.parse(String(createdAt));
  // An unparseable date is not evidence of an old account. Say nothing.
  if (!Number.isFinite(created)) return false;
  // A clock skewed into the future would make every account look brand new,
  // which fails in the safe direction — no greeting — and needs no special case.
  if (now - created < RETURNING_AFTER_MS) return false;

  // Nothing else. Every publish by a returning creator, on every template.
  return true;
}

/**
 * Which mascot this session will use.
 *
 * Chosen ONCE and remembered, because the choice has to be made before the
 * greeting happens: `WelcomeHost` warms exactly one file, and warming the wrong
 * one is worse than warming neither — it pays the bytes and still shows a blank
 * stage. Re-picking per greeting would also mean a creator who publishes twice
 * in a day could see the same one twice, which is the thing having two was for.
 */
export function pickMascot(): WelcomeMascotKey {
  if (armed === null) {
    armed = WELCOME_MASCOT_KEYS[Math.floor(Math.random() * WELCOME_MASCOT_KEYS.length)];
  }
  return armed;
}

/**
 * Warm the artwork, if a greeting is currently on the cards.
 *
 * Called from `WelcomeHost` on idle, and only under the templates route group —
 * see the note there on why this is not done everywhere.
 */
export function armWelcome(): void {
  if (!shouldGreet()) return;
  preloadWelcomeMascot(pickMascot());
}

/**
 * The first name, trimmed to something that fits on one line.
 *
 * Returns "" rather than guessing. A greeting with no name is warm; a greeting
 * addressed to "user_9f2a" or to somebody's full four-part legal name wrapped
 * over two lines is not, and the copy is written to read correctly either way.
 */
export function firstName(raw: string | null | undefined): string {
  const name = String(raw ?? "").trim();
  if (!name) return "";
  const first = name.split(/\s+/)[0];
  // Anything this long is not being used as a name on a greeting card.
  if (first.length > 18) return "";
  // An email local-part or a handle is a login, not something to be called.
  if (/[@_.]|\d{3}/.test(first)) return "";
  return first;
}

/**
 * Say hello, if this is a moment where hello is right — then run.
 *
 * The one gate the publish toast goes through. `run` fires exactly once on
 * every path, so the creator ALWAYS learns their page is live: greeting them is
 * best-effort, telling them it worked is not.
 */
export function greetThenRun(run: () => void): void {
  if (!shouldGreet()) {
    // A greeting is already up — queue this toast behind it rather than
    // flashing it under the scrim. Every other reason to skip falls through to
    // showing the toast at once, exactly as if this feature did not exist.
    if (current !== null && deferUntilWelcomeClosed(run)) return;
    run();
    return;
  }

  const mascot = pickMascot();
  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    try {
      run();
    } catch (err) {
      // The release is somebody else's callback. The greeting is already gone
      // and must stay gone.
      console.error("[welcome] release callback threw", err);
    }
  };

  current = {
    mascot,
    name: firstName(viewer?.name),
    holdMs: ENTRANCE_MS + WELCOME_MASCOTS[mascot].loopMs + REST_MS,
    onRelease: release,
  };
  emit();
}

/**
 * Queue something to run when the open greeting closes, if one is open.
 *
 * Returns `true` when it took responsibility. Without this, a second publish
 * toast raised while the greeting is up would be shown IMMEDIATELY — technically
 * behind the scrim, in practice a blurred smear of text under the mascot, and
 * then gone by the time the greeting lifts. Queued instead, it lands where every
 * publish toast lands: after the greeting, in full, on a clear screen.
 *
 * The same shape as `deferUntilFeedbackClosed`, and mutated in place for the
 * same reason: `getSnapshot` returns this object, and handing
 * `useSyncExternalStore` a new identity with no `emit()` is the shape React
 * warns about. What is on screen has not changed — only what follows it.
 */
export function deferUntilWelcomeClosed(run: () => void): boolean {
  if (current === null) return false;
  const previous = current.onRelease;
  current.onRelease = () => {
    previous();
    run();
  };
  return true;
}

/**
 * Close the greeting and let the toast through.
 *
 * Idempotent, and the release runs at most once however many times this is
 * called — the overlay's own timer and a tap can land in the same frame.
 */
export function closeWelcome(): void {
  const greeting = current;
  if (greeting === null) return;
  current = null;
  emit();
  greeting.onRelease();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => current;
const getServerSnapshot = () => null;

/** The open greeting, or null. Re-renders only on open/close. */
export function useWelcomeGreeting(): WelcomeGreeting | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
