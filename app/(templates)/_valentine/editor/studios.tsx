"use client";

// A day's own hands-on editor ("studio"), shown at the top of the form when
// DayConfig.studio names one. Each studio is its own lazy chunk, so the form
// of every other day never downloads it. A studio edits the extras its day
// marks `hidden` (the plain form skips those) through the same updateExtra /
// updateMf as the rest of the form, so the draft autosave, Save, coerce and
// the server sanitiser all see its work like any other field.

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { UseStoryFillResult } from "@/hooks/useStoryFill";
import type { DayConfig, ValentineDayData } from "../types";

export interface StudioProps {
  day: DayConfig;
  mf: ValentineDayData;
  updateMf: <K extends keyof ValentineDayData>(key: K, val: ValentineDayData[K]) => void;
  updateExtra: (key: string, val: unknown) => void;
  /** The form's "✨ Write it for me" (when the template has an AI schema). */
  ai?: { available: boolean; onOpen: () => void; fill?: UseStoryFillResult };
  /** The page password (a studio that replaces the whole form draws its own field). */
  password?: { value: string; set: (v: string) => void };
}

const Loading = () => <div style={{ minHeight: 168, borderRadius: 22, background: "var(--vw-soft)" }} aria-busy="true" />;

const STUDIOS: Record<NonNullable<DayConfig["studio"]>, ComponentType<StudioProps>> = {
  bouquet: dynamic(() => import("../../digital-bouquet/components/studio/BouquetStudio"), { ssr: false, loading: Loading }),
  royalWedding: dynamic(() => import("../../royal-wedding-invitation/components/studio/RoyalStudio"), { ssr: false, loading: Loading }),
};

export function DayStudio(props: StudioProps) {
  const id = props.day.studio;
  if (!id) return null;
  const Studio = STUDIOS[id];
  return <Studio {...props} />;
}
