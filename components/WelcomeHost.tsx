"use client";

// ─── WelcomeHost — the single mount point ────────────────────────────────────
//
// Mounted once per route group, beside `ShareSheetHost`, `FeedbackHost` and
// `ToastHost`, for the same reason all three are: the overlay is raised from a
// module bus by code that cannot render, so exactly one component has to be
// listening.
//
// It renders nothing at all until a returning creator publishes. See
// `lib/welcome/welcomeBus.ts` for why the trigger sits inside `pushToast`
// rather than in forty-four editors, and for who counts as returning.
//
// ── IT ALSO CARRIES THE ANSWER THE BUS CANNOT FETCH ─────────────────────────
//
// The bus decides on `createdAt`, and `createdAt` lives in Redux. A module
// store cannot subscribe to Redux, and importing the store into `lib/` would
// put the whole of `@reduxjs/toolkit` behind `pushToast` and invite an import
// cycle — `feedbackBus` sidesteps the same problem by reading a raw token out
// of storage, but the user object is never persisted, so there is nothing to
// read. So the host pushes it down instead: one effect, one call, and the bus
// stays a plain module that runs under node in its own test.
//
// The timing is not tight. This runs on mount and on every change to the user;
// publishing requires a signed-in session and several seconds of typing, so the
// viewer is registered long before anybody can reach a publish toast.

import { useEffect } from "react";

import { useAppSelector } from "@/store/hooks";
import { armWelcome, setViewer, useWelcomeGreeting } from "@/lib/welcome/welcomeBus";
import WelcomeBackOverlay from "./welcome/WelcomeBackOverlay";

export interface WelcomeHostProps {
  /**
   * Warm the artwork on idle, for a viewer who would be greeted right now.
   *
   * Set ONLY under the templates route group. The greeting can only ever be
   * raised by a publish, publishing only happens in an editor, and the file is
   * ~200 KB — spending that on the profile or the blog buys a faster greeting
   * that will not happen. In an editor it is the opposite: a returning creator
   * sitting in a template is very likely about to publish, the fetch happens on
   * idle while they type, and without it the first frame of the greeting is a
   * blank square.
   *
   * `armWelcome` is a no-op for anybody who would not be greeted, so this costs
   * a first-time creator nothing at all.
   */
  preload?: boolean;
}

export function WelcomeHost({ preload = false }: WelcomeHostProps) {
  const user = useAppSelector((s) => s.auth.user);
  const greeting = useWelcomeGreeting();

  // Depending on the two fields rather than on `user` keeps this to one call
  // per sign-in instead of one per unrelated profile edit.
  const createdAt = user?.createdAt ?? null;
  const name = user?.name ?? null;

  useEffect(() => {
    setViewer(createdAt ? { createdAt, name } : null);
  }, [createdAt, name]);

  useEffect(() => {
    if (!preload) return;
    // After the effect above, so the bus already knows who this is — the arm
    // is a no-op for anybody it would not greet.
    const idle = window.requestIdleCallback;
    if (typeof idle === "function") {
      const handle = idle(() => armWelcome(), { timeout: 4000 });
      return () => window.cancelIdleCallback?.(handle);
    }
    // Safari has no requestIdleCallback. A plain timeout is the same intent:
    // not during the first paint, and not so late it misses the publish.
    const timer = setTimeout(armWelcome, 2500);
    return () => clearTimeout(timer);
  }, [preload, createdAt]);

  if (!greeting) return null;

  // Keyed on the mascot so a second greeting mounts a genuinely fresh overlay —
  // and, because `MascotStage` is keyed on the same value, restarts the GIF from
  // frame one rather than joining a loop already in progress.
  return <WelcomeBackOverlay key={greeting.mascot} greeting={greeting} />;
}

export default WelcomeHost;
