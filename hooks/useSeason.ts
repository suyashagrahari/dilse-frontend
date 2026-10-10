"use client";

// The season, for components. Returns the client store's answer once it has
// one, the server's answer (from `SeasonProvider`) before that, and null when
// neither is known yet — callers render nothing seasonal for null.
//
// During hydration `useSyncExternalStore` reads the server snapshot (null), so
// the first client render is the provider's value, exactly what the server
// wrote. The store's fetch then lands and moves everyone together.

import { createContext, createElement, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import {
  getSeasonServerSnapshot, getSeasonSnapshot, isHalloweenBarDismissed, loadSeason, subscribeSeason, type Season,
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

/** True when the Halloween drop is what the site is wearing. */
export function useIsHalloween(): boolean {
  return useSeason()?.mode === "halloween";
}

/** Has this session dismissed the running Halloween bar? False on the server. */
export function useHalloweenBarDismissed(): boolean {
  return useSyncExternalStore(subscribeSeason, isHalloweenBarDismissed, () => false);
}
