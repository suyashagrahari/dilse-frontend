"use client";

// A day's own hands-on editor ("studio"), shown at the top of the form when
// DayConfig.studio names one. Each studio is its own lazy chunk, so the form
// of every other day never downloads it. A studio edits the extras its day
// marks `hidden` (the plain form skips those) through the same updateExtra /
// updateMf as the rest of the form, so the draft autosave, Save, coerce and
// the server sanitiser all see its work like any other field.

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { DayConfig, ValentineDayData } from "../types";
import type { UseStoryFillResult } from "@/hooks/useStoryFill";

export interface StudioProps {
  day: DayConfig;
  mf: ValentineDayData;
  updateMf: <K extends keyof ValentineDayData>(key: K, val: ValentineDayData[K]) => void;
  updateExtra: (key: string, val: unknown) => void;
  /** The form's "✨ Write it for me" (when the template has an AI schema). */
  ai?: { available: boolean; onOpen: () => void };
  /** The story-fill hook itself, for a studio with its own inline AI box (DayConfig.studioAi). */
  fill?: UseStoryFillResult;
}

const Loading = () => <div style={{ minHeight: 168, borderRadius: 22, background: "var(--vw-soft)" }} aria-busy="true" />;

const STUDIOS: Record<NonNullable<DayConfig["studio"]>, ComponentType<StudioProps>> = {
  bouquet: dynamic(() => import("../../digital-bouquet/components/studio/BouquetStudio"), { ssr: false, loading: Loading }),
  weddingPremium: dynamic(() => import("../../wedding-invitation-premium/components/studio/WeddingPremiumStudio"), { ssr: false, loading: Loading }),
};

export interface OwnerPanelProps {
  slug: string;
  pageId: string;
}

const OWNER_PANELS: Record<NonNullable<DayConfig["ownerPanel"]>, ComponentType<OwnerPanelProps>> = {
  weddingGuests: dynamic(() => import("../../wedding-invitation-premium/components/studio/GuestsPanel"), { ssr: false }),
};

/** The day's owner panel (DayConfig.ownerPanel) over the editor preview of a published page. */
export function DayOwnerPanel({ day, pageId }: { day: DayConfig; pageId: string }) {
  if (!day.ownerPanel) return null;
  const Panel = OWNER_PANELS[day.ownerPanel];
  return <Panel slug={day.slug} pageId={pageId} />;
}

export function DayStudio(props: StudioProps) {
  const id = props.day.studio;
  if (!id) return null;
  const Studio = STUDIOS[id];
  return <Studio {...props} />;
}
