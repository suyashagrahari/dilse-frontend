"use client";

import { createContext, useContext } from "react";
import type { LoveflixData } from "./types";
import type { Viewport } from "./useViewport";

/** Something a card can stand for. */
export type Title =
  | { kind: "show" }
  | { kind: "episode"; index: number }
  | { kind: "reason"; index: number }
  | { kind: "joke"; index: number }
  | { kind: "plan"; index: number };

export const titleKey = (t: Title) => (t.kind === "show" ? "show" : `${t.kind}:${t.index}`);

export interface LfApi {
  data: LoveflixData;
  mode: "demo" | "live";
  vp: Viewport;
  canHover: boolean;
  reduced: boolean;
  /** Snackbar. */
  toast: (text: string, icon?: string) => void;
  openDetails: (t: Title) => void;
  play: (episodeIndex?: number) => void;
  myList: Set<string>;
  toggleList: (t: Title) => void;
  liked: Set<string>;
  toggleLike: (t: Title) => void;
  /** Episodes already "watched" in this session. */
  watched: Set<number>;
}

export const LfContext = createContext<LfApi | null>(null);

export function useLf(): LfApi {
  const v = useContext(LfContext);
  if (!v) throw new Error("useLf outside LoveFlix");
  return v;
}
