"use client";

// The season, for components. Returns the client store's answer once it has
// one, the server's answer (from `SeasonProvider`) before that, and null when
// neither is known yet — callers render nothing seasonal for null.
//
// During hydration `useSyncExternalStore` reads the server snapshot (null), so
// the first client render is the provider's value, exactly what the server
// wrote. The store's fetch then lands and moves everyone together.

import { createContext, createElement, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import {
  dropSlugsOf, getSeasonServerSnapshot, getSeasonSnapshot, isHalloweenBarDismissed, loadSeason, subscribeSeason, type Season, type SeasonMode,
} from "@/lib/season";

const SeasonCtx = createContext<Season | null>(null);

export function SeasonProvider({ season, children }: { season: Season | null; children: ReactNode }) {
  return createElement(SeasonCtx.Provider, { value: season }, children);
}

export function useSeason(): Season | null {
  const provided = useContext(SeasonCtx);
  const s = useSyncExternalStore(subscribeSeason, getSeasonSnapshot, getSeasonServerSnapshot);
  useEffect(() => {
    void loadSeason();
  }, []);
  return s ?? provided;
}

/**
 * The active drop's slugs (see `dropSlugsOf`), and whether this page load has
 * asked `/season` itself (`known`) rather than trusting the copy in the HTML.
 *
 * Deliberately does NOT start a fetch: it is read by `useTemplateAccess`, which
 * every gallery and builder mounts, and only the builder gate needs a fresh
 * answer — and only for a hidden slug. It calls `loadSeason` itself then.
 */
export function useActiveDrop(): { slugs: ReadonlySet<string>; known: boolean } {
  const provided = useContext(SeasonCtx);
  const stored = useSyncExternalStore(subscribeSeason, getSeasonSnapshot, getSeasonServerSnapshot);
  const s = stored ?? provided;
  const slugs = useMemo(() => new Set(dropSlugsOf(s)), [s]);
  return { slugs, known: stored !== null };
}

/** The mode the site is wearing, or null before it is known. */
export function useSeasonMode(): SeasonMode | null {
  return useSeason()?.mode ?? null;
}

/** True when the Navratri & Diwali drop is what the site is wearing. */
export function useIsFestive(): boolean {
  return useSeason()?.mode === "festive";
}

/** True when the Halloween drop is what the site is wearing. */
export function useIsHalloween(): boolean {
  return useSeason()?.mode === "halloween";
}

/** Has this session dismissed the running Halloween bar? False on the server. */
export function useHalloweenBarDismissed(): boolean {
  return useSyncExternalStore(subscribeSeason, isHalloweenBarDismissed, () => false);
}
