"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getHiddenTemplates,
  getHiddenTemplatesServerSnapshot,
  getTemplateVisibilityRevision,
  getTemplateVisibilityRevisionServerSnapshot,
  subscribeTemplateVisibility,
} from "@/lib/templateVisibility";
import { useProvidedHiddenTemplates } from "@/components/TemplateVisibilityProvider";

/**
 * The slugs this deployment is not showing.
 *
 * ── WHERE THE VALUE COMES FROM ──────────────────────────────────────────────
 *
 * Two possible sources, and the order matters:
 *
 *   1. The list `TemplateVisibilityProvider` was given, resolved on the server
 *      before the HTML went out. This is the one that is correct on the FIRST
 *      render, which is the whole point — a builder that starts by rendering
 *      "Not available yet" for a live template, or a gallery that starts by
 *      showing thirty held-back ones, is what happens without it.
 *   2. This store, once it has fetched something itself. That only happens when
 *      the server could not resolve a list, or when the admin screen forced a
 *      refresh after a toggle. Either way its answer is newer, so it wins.
 *
 * `revision` is how we tell those apart: it stays 0 until a fetch of ours
 * completes, so "the store has an opinion of its own" is a fact we can read
 * rather than guess.
 *
 * `useSyncExternalStore` rather than `useState` + `useEffect` because the store
 * is module-level and shared: the gallery, the favourites list and the builder
 * gate can all mount at different times against the same already-settled value,
 * and an effect-based hook would refetch or start each one from a stale default.
 */
export function useHiddenTemplates(): ReadonlySet<string> {
  const provided = useProvidedHiddenTemplates();

  const stored = useSyncExternalStore(
    subscribeTemplateVisibility,
    getHiddenTemplates,
    getHiddenTemplatesServerSnapshot
  );
  const revision = useSyncExternalStore(
    subscribeTemplateVisibility,
    getTemplateVisibilityRevision,
    getTemplateVisibilityRevisionServerSnapshot
  );

  // Memoised on the array identity, so consumers that depend on this set do not
  // see a new object on every render.
  const providedSet = useMemo(() => (provided ? new Set(provided) : null), [provided]);

  if (revision > 0 || !providedSet) return stored;
  return providedSet;
}

/**
 * Whether this page load has checked the hidden list against the server itself,
 * rather than trusting the copy that arrived inside the HTML.
 *
 * `revision` is the fact: it stays 0 until a fetch of ours completes, and
 * `seedTemplateVisibility` deliberately does not bump it. Callers that are about
 * to REFUSE somebody wait for this; callers that are merely deciding what to
 * list do not need to.
 */
export function useTemplateVisibilityConfirmed(): boolean {
  return (
    useSyncExternalStore(
      subscribeTemplateVisibility,
      getTemplateVisibilityRevision,
      getTemplateVisibilityRevisionServerSnapshot
    ) > 0
  );
}
