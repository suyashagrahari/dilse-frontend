import type { Middleware } from "@reduxjs/toolkit";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";

/**
 * Emits auth analytics from redux actions instead of from the UI.
 *
 * Why here rather than in AuthModal: `AuthModal.tsx` calls `onSuccess()` from
 * three separate places (email/password, OTP, Google), and every caller wires it
 * up differently. One middleware keyed on action types covers all of them and
 * cannot drift as the modal changes.
 *
 * ── The exclusion that matters ───────────────────────────────────────────────
 * `handleAuthFulfilled` in authSlice.ts is shared by login, register, verifyOtp,
 * googleLogin AND refreshAuth. Listening for that *state transition* — or for
 * `isAuthenticated` flipping to true — would count every silent token refresh as
 * a login. Since Providers.tsx runs an auth check on every mount, "logins" would
 * roughly equal page views and the number would be meaningless.
 *
 * So this matches four explicit action types and nothing else. `auth/refresh`
 * and `auth/check` are deliberately absent.
 *
 * The Google *bridge* flow (subdomain OAuth, app/auth/google-bridge) never
 * dispatches any of these — it hard-redirects with tokens in the URL hash — so it
 * is instrumented separately in Providers.tsx.
 */
const AUTH_EVENTS: Record<string, { event: typeof EVENTS.LOGIN | typeof EVENTS.SIGN_UP; method: string }> = {
  "auth/login/fulfilled": { event: EVENTS.LOGIN, method: "password" },
  "auth/google/fulfilled": { event: EVENTS.LOGIN, method: "google" },
  // Registration is two steps: `auth/register` submits the form, `auth/verifyOtp`
  // is when the account actually becomes usable. Treating the first as the
  // sign-up and the second as a login makes the gap between them visible — that
  // gap is the OTP abandonment rate.
  "auth/register/fulfilled": { event: EVENTS.SIGN_UP, method: "password" },
  "auth/verifyOtp/fulfilled": { event: EVENTS.LOGIN, method: "otp" },
};

export const analyticsMiddleware: Middleware = () => (next) => (action) => {
  // Pass the action through FIRST and unmodified. The store updates exactly as it
  // would without this middleware; tracking is a side effect that happens after,
  // and the try/catch guarantees a failure here can never surface to the reducer
  // chain or to the dispatching component.
  const result = next(action);

  try {
    const type = (action as { type?: unknown })?.type;
    if (typeof type !== "string") return result;

    const mapped = AUTH_EVENTS[type];
    if (mapped) {
      track(mapped.event, { method: mapped.method });
    }
  } catch {
    /* analytics must never affect dispatch */
  }

  return result;
};
