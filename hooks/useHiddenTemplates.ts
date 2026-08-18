"use client";

import { useSyncExternalStore } from "react";
import {
  getHiddenTemplates,
  getHiddenTemplatesServerSnapshot,
  subscribeTemplateVisibility,
} from "@/lib/templateVisibility";

/**
 * The slugs this deployment is not showing.
 *
 * `useSyncExternalStore` rather than `useState` + `useEffect` because the store
 * is module-level and shared: the gallery, the favourites list and the builder
 * gate can all mount at different times against the same already-settled value,
 * and an effect-based hook would refetch or start each one from a stale default.
 * It also gives us a server snapshot for free, which is what keeps a held-back
 * template out of the server-rendered HTML rather than merely hiding it after
 * hydration.
 */
export function useHiddenTemplates(): ReadonlySet<string> {
  return useSyncExternalStore(
    subscribeTemplateVisibility,
    getHiddenTemplates,
    getHiddenTemplatesServerSnapshot
  );
}
