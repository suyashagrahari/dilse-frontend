"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { useHiddenTemplates, useTemplateVisibilityConfirmed } from "@/hooks/useHiddenTemplates";

/**
 * Which templates this visitor cannot use, and whether we know yet.
 *
 * ── WHY THIS EXISTS RATHER THAN CALLERS DOING THE SUBTRACTION ───────────────
 *
 * Two facts arrive from two different places and have to be combined:
 *
 *   1. `useHiddenTemplates()` — what is hidden from EVERYONE on this deployment.
 *      Public, cacheable, and resolved during the server render so the first
 *      paint is already right.
 *   2. `user.earlyAccess` — what THIS person has been granted anyway. Private,
 *      uncacheable, and arriving with `/auth/me`.
 *
 * They cannot be merged upstream: the public list is served with a 60s public
 * cache, so putting a per-user list behind it hands one visitor's access to the
 * next. See the note at the top of `server/src/config/templateAccess.ts`.
 *
 * So the merge happens here, once, and the gallery, the favourites list and the
 * builder gate all read the answer without learning that grants exist.
 *
 * ── `resolved` IS THE PART THAT MATTERS ─────────────────────────────────────
 *
 * `earlyAccess` lands with `/auth/me`, which resolves AFTER the first paint.
 * Between paint and that response, a granted user looks exactly like a
 * non-granted one — the slug is in `hidden` and nothing yet says otherwise.
 *
 * A gallery may render on that: a card appearing a moment late is invisible. A
 * builder must not — it would show "Not available yet" to the very client the
 * grant was created for, then replace itself with their template, which reads as
 * the grant not working.
 *
 * `resolved` is false exactly while a token exists but the user object has not
 * landed. Callers that would otherwise show a refusal wait for it. This is the
 * same reasoning `app/(app)/admin/layout.tsx` already spells out: a token in
 * storage means an answer is on its way.
 */
export function useTemplateAccess(): {
  /** Slugs this visitor cannot use — hidden, minus anything granted to them. */
  hidden: ReadonlySet<string>;
  /** False while a grant list is still on its way. Do not refuse anyone yet. */
  resolved: boolean;
  /**
   * False while the only evidence is the list that came down inside the page.
   *
   * That list is baked into statically prerendered HTML and can be served stale,
   * so it says what was true when the page was built rather than when it was
   * opened — which is how a freshly released template greeted its first visitor
   * with "Not available yet". A gallery may render on it happily; a refusal may
   * not. See `verifyTemplateVisibility`.
   */
  confirmed: boolean;
} {
  const publiclyHidden = useHiddenTemplates();
  const confirmed = useTemplateVisibilityConfirmed();
  const { user, isLoading } = useAppSelector((s) => s.auth);

  // Read straight from the store rather than a second fetch: `checkAuth` already
  // asks `/auth/me` on boot, and `getMe` returns this array.
  const granted = user?.earlyAccess;

  const hidden = useMemo(() => {
    if (!granted || granted.length === 0) return publiclyHidden;
    const next = new Set(publiclyHidden);
    for (const slug of granted) next.delete(String(slug).toLowerCase());
    return next;
  }, [publiclyHidden, granted]);

  // A token in storage means `/auth/me` is in flight or about to be. Reading it
  // directly rather than trusting `isLoading` alone, because `isLoading` starts
  // false: on a hard refresh the first commit happens before `checkAuth` runs,
  // and an unresolved state that reports itself resolved is the whole bug.
  const hasToken =
    typeof window !== "undefined" && !!window.localStorage.getItem("gifts_access_token");

  const resolved = !isLoading && (!hasToken || !!user);

  return { hidden, resolved, confirmed };
}
