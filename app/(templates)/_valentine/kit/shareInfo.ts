"use client";
// ─── Which published page is this? (every engine day, $2 and premium) ────────
//
// ValentineDayViewer provides it around the live Experience; it is null in the
// editor preview. Public per-page writes that are not the one-shot `react`
// beacon (the wedding kit's RSVPs and blessings) read their endpoint from it.
// PremiumShareContext (kit/premium/ReplyBox) stays as it was — premium only.
import { createContext, useContext } from "react";

export interface DayShareInfo {
  slug: string;
  shareId: string;
  /** The page has a password; public writes must carry it (see pagePassword()). */
  hasPassword: boolean;
}

export const DayShareContext = createContext<DayShareInfo | null>(null);
export const useDayShare = () => useContext(DayShareContext);

/** The password this tab typed into the gate (TemplateGate keeps it for the session), or "". */
export function pagePassword(shareId: string): string {
  try {
    return sessionStorage.getItem(`page_pw_${shareId}`) ?? "";
  } catch {
    return "";
  }
}
