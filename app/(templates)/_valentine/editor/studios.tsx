"use client";

// A day's own hands-on editor ("studio"), shown at the top of the form when
// DayConfig.studio names one. Each studio is its own lazy chunk, so the form
// of every other day never downloads it. A studio edits the extras its day
// marks `hidden` (the plain form skips those) through the same updateExtra /
// updateMf as the rest of the form, so the draft autosave, Save, coerce and
// the server sanitiser all see its work like any other field.
//
// A day with DayConfig.studioForm hands the studio the WHOLE form (the wedding
// tiers): see StudioForm in ../types.ts for what the sheet keeps, the studio's
// own AI box, the owner dashboard and edit-after-publish.

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { UseStoryFillResult } from "@/hooks/useStoryFill";
import type { DayConfig, OwnerPanelId, StudioId, ValentineDayData } from "../types";

export interface StudioProps {
  day: DayConfig;
  mf: ValentineDayData;
  updateMf: <K extends keyof ValentineDayData>(key: K, val: ValentineDayData[K]) => void;
  updateExtra: (key: string, val: unknown) => void;
  /**
   * The form's "✨ Write it for me" (when the template has an AI schema).
   * `fill` (the story-fill hook) only for a studio-form day with `ownAi`.
   */
  ai?: { available: boolean; onOpen: () => void; fill?: UseStoryFillResult };
  /** Studio-form days only: the page password (a studio that keeps no "finish" draws its own field). */
  password?: { value: string; set: (v: string) => void };
  /** Studio-form days only: the saved page (null until the first save) and the owner's token — for an in-form owner dashboard. */
  owner?: { pageId: string | null; token: string | null; published: boolean };
}

const Loading = () => <div style={{ minHeight: 168, borderRadius: 22, background: "var(--vw-soft)" }} aria-busy="true" />;

const STUDIOS: Record<StudioId, ComponentType<StudioProps>> = {
  bouquet: dynamic(() => import("../../digital-bouquet/components/studio/BouquetStudio"), { ssr: false, loading: Loading }),
  weddingClassic: dynamic(() => import("../../wedding-invitation/components/studio/WeddingStudio"), { ssr: false, loading: Loading }),
  weddingPremium: dynamic(() => import("../../wedding-invitation-premium/components/studio/WeddingPremiumStudio"), { ssr: false, loading: Loading }),
  royalWedding: dynamic(() => import("../../royal-wedding-invitation/components/studio/RoyalStudio"), { ssr: false, loading: Loading }),
  palaceDoorWedding: dynamic(() => import("../../palace-door-wedding-invitation/components/studio/PalaceDoorStudio"), { ssr: false, loading: Loading }),
  gardenWedding: dynamic(() => import("../../garden-wedding-invitation/components/studio/GardenStudio"), { ssr: false, loading: Loading }),
  floralWedding: dynamic(() => import("../../floral-wedding-invitation/components/studio/FloralStudio"), { ssr: false, loading: Loading }),
  lotusWedding: dynamic(() => import("../../lotus-wedding-invitation/components/studio/LotusStudio"), { ssr: false, loading: Loading }),
  // One studio for the three faith weddings; it reads the faith from day.slug.
  faithWedding: dynamic(() => import("../../_faith/studio/FaithStudio"), { ssr: false, loading: Loading }),
};

export function DayStudio(props: StudioProps) {
  const id = props.day.studio;
  if (!id) return null;
  const Studio = STUDIOS[id];
  return <Studio {...props} />;
}

export interface OwnerPanelProps {
  slug: string;
  pageId: string;
}

const OWNER_PANELS: Record<OwnerPanelId, ComponentType<OwnerPanelProps>> = {
  weddingGuests: dynamic(() => import("../../wedding-invitation-premium/components/studio/GuestsPanel"), { ssr: false }),
};

/** The day's owner panel (StudioForm.ownerPanel) over the editor preview of a published page. */
export function DayOwnerPanel({ day, pageId }: { day: DayConfig; pageId: string }) {
  const id = day.studioForm?.ownerPanel;
  if (!id) return null;
  const Panel = OWNER_PANELS[id];
  return <Panel slug={day.slug} pageId={pageId} />;
}
